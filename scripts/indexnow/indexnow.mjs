import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, sep } from "node:path";

const MAX_URLS_PER_REQUEST = 10000;

export async function collectHtmlFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) files.push(...(await collectHtmlFiles(path)));
        else if (entry.isFile() && extname(entry.name) === ".html") files.push(path);
    }
    return files;
}

export function filePathToRoute(relativePath) {
    const normalized = relativePath.split(sep).join("/");
    if (basename(normalized) !== "index.html") return null;
    const directory = dirname(normalized);
    if (directory === "." || directory === "") return "/";
    return `/${directory.replace(/^\/+|\/+$/g, "")}/`;
}

export function normalizeRouteMap(routeMap) {
    return routeMap.map((route) => ({
        baseUrl: route.baseUrl.replace(/\/$/, ""),
        pathPrefixes: route.pathPrefixes.map((prefix) => {
            const normalized = prefix.startsWith("/") ? prefix : `/${prefix}`;
            return normalized.endsWith("/") ? normalized : `${normalized}/`;
        }),
    }));
}

export function resolvePageUrl(route, routeMap) {
    const match = normalizeRouteMap(routeMap)
        .flatMap((entry) => entry.pathPrefixes.map((prefix) => ({ ...entry, prefix })))
        .filter((entry) => route.startsWith(entry.prefix))
        .sort((left, right) => right.prefix.length - left.prefix.length)[0];
    return match ? `${match.baseUrl}${route}` : null;
}

async function hashFile(path) {
    const content = await readFile(path);
    return createHash("sha256").update(content).digest("hex");
}

export async function createManifest({ dist, routeMap }) {
    const files = await collectHtmlFiles(dist);
    const pages = {};
    for (const file of files) {
        const route = filePathToRoute(relative(dist, file));
        const url = route ? resolvePageUrl(route, routeMap) : null;
        if (!url) continue;
        pages[url] = {
            hash: await hashFile(file),
            route,
        };
    }
    return {
        version: 1,
        generatedAt: new Date().toISOString(),
        pages,
    };
}

export function diffManifests(previous, current, forceAll = false) {
    const oldPages = previous?.pages ?? {};
    const newPages = current.pages ?? {};
    const changedUrls = Object.entries(newPages)
        .filter(([url, page]) => forceAll || !oldPages[url] || oldPages[url].hash !== page.hash)
        .map(([url]) => url)
        .sort();
    const deletedUrls = Object.keys(oldPages)
        .filter((url) => !newPages[url])
        .sort();
    return {
        changedUrls,
        deletedUrls,
        urls: [...changedUrls, ...deletedUrls].sort(),
    };
}

async function readJson(path, fallback) {
    try {
        return JSON.parse(await readFile(path, "utf8"));
    } catch {
        return fallback;
    }
}

async function writeOutput(name, value) {
    if (!process.env.GITHUB_OUTPUT) return;
    await appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

async function detect(options) {
    const routeMap = JSON.parse(options.routeMap);
    const current = await createManifest({ dist: options.dist, routeMap });
    const previous = await readJson(options.manifest, null);
    const diff = diffManifests(previous, current, options.forceAll === "true");
    await mkdir(dirname(options.manifest), { recursive: true });
    await writeFile(options.manifest, JSON.stringify(current, null, 2));
    await mkdir(dirname(options.output), { recursive: true });
    await writeFile(
        options.output,
        JSON.stringify({ ...diff, generatedAt: current.generatedAt, manifest: options.manifest }, null, 2)
    );
    await writeOutput("manifest", options.output);
    await writeOutput("changed-count", String(diff.urls.length));
    process.stdout.write(
        `IndexNow: ${diff.changedUrls.length} changed, ${diff.deletedUrls.length} deleted, ${Object.keys(current.pages).length} pages scanned\n`
    );
}

function chunk(items, size) {
    const chunks = [];
    for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
    return chunks;
}

function normalizeSiteConfig(siteConfig) {
    return siteConfig.map((site) => ({
        baseUrl: site.baseUrl.replace(/\/$/, ""),
        keyLocation: site.keyLocation,
    }));
}

async function fetchKey(keyLocation) {
    const response = await fetch(keyLocation);
    if (!response.ok) throw new Error(`Could not read IndexNow key at ${keyLocation}: HTTP ${response.status}`);
    const key = (await response.text()).trim();
    if (!key) throw new Error(`IndexNow key file is empty: ${keyLocation}`);
    return key;
}

async function submitBatch({ endpoint, baseUrl, keyLocation, key, urls }) {
    const payload = {
        host: new URL(baseUrl).hostname,
        key,
        keyLocation,
        urlList: urls,
    };
    for (let attempt = 0; attempt < 3; attempt += 1) {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "content-type": "application/json; charset=utf-8" },
            body: JSON.stringify(payload),
        });
        const body = await response.text();
        if (response.ok) {
            process.stdout.write(`IndexNow: submitted ${urls.length} URLs for ${baseUrl} (HTTP ${response.status})\n`);
            return;
        }
        const retryable = response.status === 429 || response.status >= 500;
        if (!retryable || attempt === 2) throw new Error(`IndexNow rejected ${baseUrl}: HTTP ${response.status} ${body}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
}

async function submit(options) {
    const manifest = await readJson(options.manifest, { urls: [] });
    const siteConfig = normalizeSiteConfig(JSON.parse(options.siteConfig));
    const urlsBySite = new Map(siteConfig.map((site) => [site.baseUrl, []]));
    let submittedCount = 0;
    for (const url of manifest.urls ?? []) {
        const site = siteConfig.find((candidate) => url.startsWith(`${candidate.baseUrl}/`));
        if (site) urlsBySite.get(site.baseUrl).push(url);
        else process.stdout.write(`IndexNow: skipped URL without site configuration: ${url}\n`);
    }
    const failures = [];
    for (const site of siteConfig) {
        const urls = urlsBySite.get(site.baseUrl) ?? [];
        if (urls.length === 0) continue;
        try {
            const key = await fetchKey(site.keyLocation);
            for (const urlsChunk of chunk(urls, MAX_URLS_PER_REQUEST)) {
                await submitBatch({
                    endpoint: options.endpoint,
                    baseUrl: site.baseUrl,
                    keyLocation: site.keyLocation,
                    key,
                    urls: urlsChunk,
                });
                submittedCount += urlsChunk.length;
            }
        } catch (error) {
            failures.push(error instanceof Error ? error.message : String(error));
        }
    }
    if (failures.length > 0) {
        for (const failure of failures) process.stdout.write(`::warning::${failure}\n`);
        if (options.failOnError === "true") process.exitCode = 1;
    }
    await writeOutput("submitted-count", String(submittedCount));
    await writeOutput("failure-count", String(failures.length));
}

function parseOptions(args) {
    const options = {};
    for (let index = 0; index < args.length; index += 2) {
        const key = args[index]?.replace(/^--/, "");
        if (key) options[key] = args[index + 1];
    }
    return options;
}

const [command, ...args] = process.argv.slice(2);
const options = parseOptions(args);
if (command === "detect") await detect(options);
if (command === "submit") await submit(options);
