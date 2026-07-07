import type { SitemapTarget } from "./types.js";

export function resolveSitemapTarget(url: string, date: Date): SitemapTarget {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname;
    const language = resolveLanguage(parsedUrl.pathname);
    const stamp = date.toISOString().slice(0, 10);

    return {
        host,
        language,
        title: `${host} sitemap ${language}`,
        outputFile: `${stamp}-${host}-${language}-sitemap.md`
    };
}

function resolveLanguage(pathname: string): string {
    const match = pathname.match(/sitemap-([a-z]{2})(?:[.-]|$)/i);
    return match?.[1]?.toLowerCase() ?? "default";
}
