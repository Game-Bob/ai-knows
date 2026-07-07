import type { SitemapEntry } from "./types.js";

export function parseSitemap(xmlContent: string): SitemapEntry[] {
    return findBlocks(xmlContent, "url")
        .map(parseUrlBlock)
        .filter(hasUrl);
}

function parseUrlBlock(block: string): SitemapEntry {
    return {
        url: readOptionalTag(block, "loc") ?? "",
        lastModified: readOptionalTag(block, "lastmod")
    };
}

function findBlocks(xmlContent: string, tag: string): string[] {
    const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
    return Array.from(xmlContent.matchAll(pattern), (match) => match[1] ?? "");
}

function readOptionalTag(xmlContent: string, tag: string): string | undefined {
    const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i");
    const value = xmlContent.match(pattern)?.[1]?.trim();
    return value === undefined ? undefined : decodeXml(value);
}

function decodeXml(value: string): string {
    return value
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", "\"")
        .replaceAll("&apos;", "'");
}

function hasUrl(entry: SitemapEntry): boolean {
    return entry.url.length > 0;
}
