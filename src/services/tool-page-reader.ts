import type { ToolPageMetadata } from "./social-image-types.js";

const allowedDomains = new Map<string, ToolPageMetadata["brandDomain"]>([
    ["jjlmoya.es", "jjlmoya.es"],
    ["gamebob.dev", "gamebob.dev"]
]);

export type PageFetcher = typeof fetch;

export class ToolPageReader {
    constructor(private readonly fetcher: PageFetcher = fetch) {}

    async read(url: string): Promise<ToolPageMetadata> {
        const parsedUrl = parseToolUrl(url);
        const response = await this.fetcher(parsedUrl.href, {
            headers: { "user-agent": "ai-knows-social-image-renderer/1.0" }
        });
        if (!response.ok) {
            throw new Error(`No se pudo leer ${url}: HTTP ${response.status}`);
        }
        const html = await response.text();
        const title = readTitle(html) ?? parsedUrl.hostname;
        const description = readDescription(html);
        const ogImage = readMeta(html, "og:image");
        return {
            url,
            title: decodeHtml(title),
            ...(description ? { description: decodeHtml(description) } : {}),
            ...(ogImage ? { ogImageUrl: new URL(ogImage, parsedUrl).href } : {}),
            brandDomain: getBrandDomain(parsedUrl.hostname)
        };
    }
}

export function getBrandDomain(hostname: string): ToolPageMetadata["brandDomain"] {
    const normalized = hostname.toLowerCase().replace(/^www\./, "");
    const brand = allowedDomains.get(normalized);
    if (!brand) {
        throw new Error(`Dominio no permitido: ${hostname}`);
    }
    return brand;
}

export function getDefaultSubtitle(metadata: ToolPageMetadata): string | undefined {
    const description = metadata.description?.replace(/\s+/g, " ").trim();
    if (!description) {
        return undefined;
    }
    const sentence = description.split(/[.!?](?:\s|$)/u)[0]?.trim() ?? description;
    return sentence.length > 92 ? `${sentence.slice(0, 89).trimEnd()}…` : sentence;
}

function parseToolUrl(url: string): URL {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
        throw new Error("La URL de producción debe usar HTTPS");
    }
    getBrandDomain(parsed.hostname);
    return parsed;
}

function readTitle(html: string): string | undefined {
    return readMeta(html, "og:title") ?? readTagText(html, "title");
}

function readDescription(html: string): string | undefined {
    return readMeta(html, "og:description") ?? readMeta(html, "description");
}

function readMeta(html: string, key: string): string | undefined {
    const tags = html.match(/<meta\b[^>]*>/giu) ?? [];
    for (const tag of tags) {
        const attributes = readAttributes(tag);
        const name = (attributes["property"] ?? attributes["name"])?.toLowerCase();
        if (name === key.toLowerCase() && attributes["content"]) {
            return attributes["content"];
        }
    }
    return undefined;
}

function readTagText(html: string, tagName: string): string | undefined {
    const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "iu"));
    return match?.[1] ? match[1].replace(/<[^>]+>/gu, "").trim() : undefined;
}

function readAttributes(tag: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const pattern = /([:\w-]+)\s*=\s*["']([^"']*)["']/giu;
    for (const match of tag.matchAll(pattern)) {
        const name = match[1];
        const value = match[2];
        if (name && value) {
            attributes[name.toLowerCase()] = value;
        }
    }
    return attributes;
}

function decodeHtml(value: string): string {
    return value
        .replace(/&amp;/gu, "&")
        .replace(/&quot;/gu, '"')
        .replace(/&#39;|&apos;/gu, "'")
        .replace(/&lt;/gu, "<")
        .replace(/&gt;/gu, ">")
        .replace(/\s+/gu, " ")
        .trim();
}
