import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { slugify, sourceToDataUri } from "../src/services/social-image-assets.js";
import { ChromiumToolScreenshotProvider } from "../src/services/tool-screenshot-provider.js";
import { ToolPageReader } from "../src/services/tool-page-reader.js";

const port = Number(process.env["IMAGE_EDITOR_PORT"] ?? 4173);
const root = resolve(".");
const pageReader = new ToolPageReader();
const screenshotProvider = new ChromiumToolScreenshotProvider();
const contentTypes: Record<string, string> = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
};

const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    if (pathname === "/api/tool") {
        await handleToolRequest(request.url, response);
        return;
    }
    const relativePath = pathname === "/" ? "/social-image-editor.html" : pathname;
    const filePath = resolve(root, `.${relativePath}`);
    if (!filePath.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
    }
    try {
        const file = await readFile(filePath);
        response.writeHead(200, { "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream" });
        response.end(file);
    } catch {
        response.writeHead(404);
        response.end("Not found");
    }
});

async function handleToolRequest(requestUrl: string | undefined, response: import("node:http").ServerResponse): Promise<void> {
    const url = new URL(requestUrl ?? "/api/tool", "http://localhost").searchParams.get("url");
    if (!url) {
        sendJson(response, 400, { error: "Falta la URL de producción" });
        return;
    }
    try {
        const metadata = await pageReader.read(url);
        if (!metadata.ogImageUrl) {
            throw new Error("La página no tiene imagen OG para usar como fondo");
        }
        const stem = `editor-${slugify(metadata.title)}`;
        const outputDirectory = resolve("tweetImages");
        const toolPath = resolve(outputDirectory, `${stem}-tool.png`);
        const backgroundPath = resolve(outputDirectory, `${stem}-background.png`);
        await mkdir(outputDirectory, { recursive: true });
        await screenshotProvider.capture(url, toolPath);
        const backgroundDataUri = await sourceToDataUri({ url: metadata.ogImageUrl });
        await writeFile(backgroundPath, Buffer.from(backgroundDataUri.split(",")[1] ?? "", "base64"));
        sendJson(response, 200, {
            metadata,
            toolImageUrl: `/${outputDirectoryName(outputDirectory)}/${stem}-tool.png`,
            backgroundImageUrl: `/${outputDirectoryName(outputDirectory)}/${stem}-background.png`
        });
    } catch (error) {
        sendJson(response, 500, { error: error instanceof Error ? error.message : "No se pudo cargar la herramienta" });
    }
}

function outputDirectoryName(path: string): string {
    return path.split(/[\\/]/u).at(-1) ?? "tweetImages";
}

function sendJson(response: import("node:http").ServerResponse, status: number, body: unknown): void {
    response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(body));
}

server.listen(port, "127.0.0.1", () => {
    console.log(`Image editor: http://127.0.0.1:${port}`);
});
