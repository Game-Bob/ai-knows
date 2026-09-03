import { createSign } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog, LOCALE_ROUTES } from './tool-catalog.mjs';
import { addDays, defaultWindow, validateDate } from './download-tools-week.mjs';

export const SEARCH_CONSOLE_ENDPOINT = 'https://searchconsole.googleapis.com/webmasters/v3/sites';
export const SEARCH_CONSOLE_DIR = path.resolve('data/tools-monthly/search-console');
export const SEARCH_CONSOLE_HISTORY_DIR = path.resolve('data/tools-monthly/search-console-history');

function base64Url(value) {
    return Buffer.from(value).toString('base64url');
}

function siteDomain(site) {
    if (!site || site.startsWith('sc-domain:')) return site?.slice('sc-domain:'.length) ?? '';
    try {
        return new URL(site).hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

export function configuredSites() {
    const sites = new Map();
    const add = (site, fallbackDomain) => {
        const domain = siteDomain(site) || fallbackDomain;
        if (!site || !domain || sites.has(domain)) return;
        sites.set(domain, { domain, site });
    };

    // Each explicit property wins. A generic GSC_SITE_URL is assigned to the
    // domain it actually contains instead of being guessed as jjlmoya.es.
    add(process.env.GSC_SITE_JJLMOYA, 'jjlmoya.es');
    add(process.env.GSC_SITE_GAMEBOB, 'gamebob.dev');
    add(process.env.GSC_SITE_URL);

    // Keep the dashboard global even when only one property is configured.
    // Search Console will return a clear permission error for an unverified
    // property; the caller can then keep the other property's data.
    for (const domain of ['jjlmoya.es', 'gamebob.dev']) {
        if (!sites.has(domain)) add(`sc-domain:${domain}`, domain);
    }
    return [...sites.values()];
}

async function accessToken() {
    const email = process.env.GSC_CLIENT_EMAIL;
    const privateKey = process.env.GSC_PRIVATE_KEY?.replaceAll('\\n', '\n');
    if (!email || !privateKey) throw new Error('Search Console necesita GSC_CLIENT_EMAIL y GSC_PRIVATE_KEY.');
    const now = Math.floor(Date.now() / 1000);
    const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claim = base64Url(JSON.stringify({ iss: email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
    const unsigned = `${header}.${claim}`;
    const signer = createSign('RSA-SHA256');
    signer.update(unsigned);
    const assertion = `${unsigned}.${signer.sign(privateKey, 'base64url')}`;
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
    });
    const payload = await response.json();
    if (!response.ok || !payload.access_token) throw new Error(`Search Console OAuth: ${payload.error_description ?? response.statusText}`);
    return payload.access_token;
}

export function normalizePath(value) {
    const clean = String(value ?? '').split('?')[0];
    if (!clean) return '/';
    return clean.endsWith('/') ? clean : `${clean}/`;
}

function rowKey(row) {
    return `${row.domain}|${row.language}|${row.toolKey ?? row.toolId}`;
}

export function parsePage(value) {
    try {
        const url = new URL(value);
        return { domain: url.hostname.replace(/^www\./, ''), path: normalizePath(url.pathname) };
    } catch {
        return { domain: '', path: normalizePath(value) };
    }
}

export function findCatalogEntry(catalog, byRoute, page) {
    const exact = byRoute.get(`${page.domain}${page.path}`);
    if (exact) return exact;
    if (page.domain !== 'gamebob.dev') return undefined;

    // GameBob has existed with more than one public URL shape. Historical
    // Search Console exports use /utilitas/... while current builds can use
    // /id/.... The final slug plus the localized route segment identifies the
    // same canonical tool even when the category path changed.
    const segments = page.path.split('/').filter(Boolean);
    const slug = segments.at(-1);
    const first = segments[0];
    const language = Object.entries(LOCALE_ROUTES).find(([, route]) => route === first)?.[0]
        ?? (Object.hasOwn(LOCALE_ROUTES, first) ? first : undefined);
    if (!slug || !language) return undefined;
    return catalog.find((entry) => entry.domain === page.domain && entry.language === language && entry.slug === slug);
}

function csvValue(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createSearchConsoleCsv(rows) {
    const headers = ['period_start', 'period_end', 'month', 'source', 'domain', 'language', 'category', 'category_id', 'category_name', 'tool_key', 'tool_id', 'tool_name', 'slug', 'pageviews', 'visits', 'requests', 'search_clicks', 'search_impressions', 'search_ctr', 'search_position', 'available'];
    return `${[headers.join(','), ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(','))].join('\n')}\n`;
}

export async function syncSearchConsole({ from, to, output = SEARCH_CONSOLE_DIR, projectRoot = process.cwd() } = {}) {
    const sites = configuredSites();
    if (!sites.length) throw new Error('No hay GSC_SITE_URL (o GSC_SITE_JJLMOYA/GSC_SITE_GAMEBOB) configurado.');
    const token = await accessToken();
    const catalog = buildCatalog({ projectRoot });
    const catalogByRoute = new Map(catalog.map((entry) => [`${entry.domain}${normalizePath(entry.route)}`, entry]));
    const totals = new Map();
    const errors = [];
    let successfulSites = 0;
    for (const { domain, site } of sites) {
        try {
            const response = await fetch(`${SEARCH_CONSOLE_ENDPOINT}/${encodeURIComponent(site)}/searchAnalytics/query`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: from, endDate: addDays(to, -1), dimensions: ['page'], rowLimit: 25000, dataState: 'final' })
            });
            const payload = await response.json();
            if (!response.ok || payload.error) throw new Error(payload.error?.message ?? response.statusText);
            successfulSites += 1;
            for (const item of payload.rows ?? []) {
                const page = parsePage(item.keys?.[0]);
                const entry = findCatalogEntry(catalog, catalogByRoute, page);
                if (!entry || entry.domain !== domain) continue;
                const key = rowKey(entry);
                const current = totals.get(key) ?? { entry, clicks: 0, impressions: 0, weightedPosition: 0 };
                current.clicks += Number(item.clicks ?? 0);
                current.impressions += Number(item.impressions ?? 0);
                current.weightedPosition += Number(item.impressions ?? 0) * Number(item.position ?? 0);
                totals.set(key, current);
            }
            console.log(`Search Console sincronizado ${site}: ${payload.rows?.length ?? 0} páginas`);
        } catch (error) {
            errors.push(`Search Console ${site}: ${error instanceof Error ? error.message : String(error)}`);
            console.warn(`Search Console no disponible para ${site}: ${errors.at(-1)}`);
        }
    }
    if (!successfulSites) throw new Error(errors.join(' · '));
    const rows = catalog.map((entry) => {
        const result = totals.get(rowKey(entry));
        const impressions = result?.impressions ?? 0;
        return {
            period_start: from, period_end: to, month: from.slice(0, 7), source: 'search-console',
            domain: entry.domain, language: entry.language, category: entry.categoryName ?? entry.category,
            category_id: entry.categoryId ?? entry.category, category_name: entry.categoryName ?? entry.category,
            tool_key: entry.toolKey ?? `${entry.repository}/${entry.toolId}`, tool_id: entry.toolId,
            tool_name: entry.toolName, slug: entry.slug, pageviews: 0, visits: 0, requests: 0,
            search_clicks: result?.clicks ?? 0, search_impressions: impressions,
            search_ctr: impressions ? (result.clicks / impressions) * 100 : 0,
            search_position: impressions ? result.weightedPosition / impressions : 0, available: true
        };
    });
    await mkdir(output, { recursive: true });
    const file = path.join(output, `${from}.csv`);
    await writeFile(file, createSearchConsoleCsv(rows));
    return { file, from, to, rows: rows.length, errors };
}

export async function syncSearchConsoleHistory({ from, to, output = SEARCH_CONSOLE_HISTORY_DIR, projectRoot = process.cwd() } = {}) {
    validateDate(from);
    validateDate(to);
    if (from >= to) throw new Error('El inicio debe ser anterior al final.');
    const sites = configuredSites();
    if (!sites.length) throw new Error('No hay propiedades de Search Console configuradas.');
    const token = await accessToken();
    const catalog = buildCatalog({ projectRoot });
    const catalogByRoute = new Map(catalog.map((entry) => [`${entry.domain}${normalizePath(entry.route)}`, entry]));
    const totals = new Map();
    const errors = [];
    let successfulSites = 0;
    for (const { domain, site } of sites) {
        try {
            const response = await fetch(`${SEARCH_CONSOLE_ENDPOINT}/${encodeURIComponent(site)}/searchAnalytics/query`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: from, endDate: addDays(to, -1), dimensions: ['date', 'page'], rowLimit: 25000, dataState: 'final' })
            });
            const payload = await response.json();
            if (!response.ok || payload.error) throw new Error(payload.error?.message ?? response.statusText);
            successfulSites += 1;
            for (const item of payload.rows ?? []) {
                const date = item.keys?.[0];
                const page = parsePage(item.keys?.[1]);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) continue;
                const entry = findCatalogEntry(catalog, catalogByRoute, page);
                if (!entry || entry.domain !== domain) continue;
                const key = `${rowKey(entry)}|${date}`;
                const current = totals.get(key) ?? { entry, date, clicks: 0, impressions: 0, weightedPosition: 0 };
                current.clicks += Number(item.clicks ?? 0);
                current.impressions += Number(item.impressions ?? 0);
                current.weightedPosition += Number(item.impressions ?? 0) * Number(item.position ?? 0);
                totals.set(key, current);
            }
            console.log(`Search Console histórico sincronizado ${site}: ${payload.rows?.length ?? 0} filas`);
        } catch (error) {
            errors.push(`Search Console ${site}: ${error instanceof Error ? error.message : String(error)}`);
            console.warn(`Search Console histórico no disponible para ${site}: ${errors.at(-1)}`);
        }
    }
    if (!successfulSites) throw new Error(errors.join(' · '));
    const rows = [...totals.values()].filter((result) => result.clicks > 0 || result.impressions > 0).map((result) => ({
        period_start: result.date, period_end: addDays(result.date, 1), month: result.date.slice(0, 7), source: 'search-console-history',
        domain: result.entry.domain, language: result.entry.language, category: result.entry.categoryName ?? result.entry.category,
        category_id: result.entry.categoryId ?? result.entry.category, category_name: result.entry.categoryName ?? result.entry.category,
        tool_key: result.entry.toolKey ?? `${result.entry.repository}/${result.entry.toolId}`, tool_id: result.entry.toolId,
        tool_name: result.entry.toolName, slug: result.entry.slug, pageviews: 0, visits: 0, requests: 0,
        search_clicks: result.clicks, search_impressions: result.impressions,
        search_ctr: result.impressions ? (result.clicks / result.impressions) * 100 : 0,
        search_position: result.impressions ? result.weightedPosition / result.impressions : 0, available: true
    }));
    await mkdir(output, { recursive: true });
    const file = path.join(output, `${from}.csv`);
    await writeFile(file, createSearchConsoleCsv(rows));
    return { file, from, to, rows: rows.length, errors };
}

function markdownNumber(value) {
    const parsed = Number(String(value ?? '').replaceAll(',', '').replace('%', '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
}

export async function syncCachedSearchConsole({ output = SEARCH_CONSOLE_DIR, dataDir = path.resolve('data/notebooklm'), projectRoot = process.cwd() } = {}) {
    const catalog = buildCatalog({ projectRoot });
    const byRoute = new Map(catalog.map((entry) => [`${entry.domain}${normalizePath(entry.route)}`, entry]));
    const files = (await readdir(dataDir)).filter((file) => /-search-console\.md$/.test(file));
    const totals = new Map();
    let latestEnd = '';
    for (const file of files) {
        const text = await readFile(path.join(dataDir, file), 'utf8');
        const period = text.match(/\*\*Period:\*\* (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/);
        const domain = file.startsWith('jjlmoya.es') ? 'jjlmoya.es' : 'gamebob.dev';
        if (!period) continue;
        latestEnd = latestEnd < period[2] ? period[2] : latestEnd;
        for (const line of text.split('\n')) {
            const cells = line.split('|').map((cell) => cell.trim());
            if (cells.length < 8 || !cells[2]?.startsWith('/')) continue;
            const entry = findCatalogEntry(catalog, byRoute, { domain, path: normalizePath(cells[2]) });
            if (!entry) continue;
            const key = rowKey(entry);
            const current = totals.get(key) ?? { entry, clicks: 0, impressions: 0, weightedPosition: 0 };
            const clicks = markdownNumber(cells[3]);
            const impressions = markdownNumber(cells[4]);
            current.clicks += clicks;
            current.impressions += impressions;
            current.weightedPosition += impressions * markdownNumber(cells[6]);
            totals.set(key, current);
        }
    }
    if (!totals.size) throw new Error('No hay informes cacheados de Search Console que se puedan cruzar con el catálogo.');
    const end = latestEnd;
    const from = addDays(end, -30);
    const rows = catalog.map((entry) => {
        const result = totals.get(rowKey(entry));
        const impressions = result?.impressions ?? 0;
        return {
            period_start: from, period_end: addDays(end, 1), month: end.slice(0, 7), source: 'search-console-cache',
            domain: entry.domain, language: entry.language, category: entry.categoryName ?? entry.category,
            category_id: entry.categoryId ?? entry.category, category_name: entry.categoryName ?? entry.category,
            tool_key: entry.toolKey ?? `${entry.repository}/${entry.toolId}`, tool_id: entry.toolId,
            tool_name: entry.toolName, slug: entry.slug, pageviews: 0, visits: 0, requests: 0,
            search_clicks: result?.clicks ?? 0, search_impressions: impressions,
            search_ctr: impressions ? (result.clicks / impressions) * 100 : 0,
            search_position: impressions ? result.weightedPosition / impressions : 0, available: true
        };
    });
    await mkdir(output, { recursive: true });
    const file = path.join(output, `${from}.csv`);
    await writeFile(file, createSearchConsoleCsv(rows));
    return { file, from, to: addDays(end, 1), rows: rows.length, cached: true };
}

export function defaultSearchWindow(now = new Date()) {
    const end = addDays(now.toISOString().slice(0, 10), -2);
    return { from: addDays(end, -7), to: end };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    const defaults = defaultSearchWindow();
    const result = await syncSearchConsole({ from: defaults.from, to: defaults.to });
    console.log(`CSV de Search Console creado en ${result.file}`);
}
