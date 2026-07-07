import type { SitemapDocument, SitemapEntry } from "./types.js";

export function sitemapToMarkdown(document: SitemapDocument): string {
    const lines = [
        `# ${document.target.title}`,
        "",
        `Source: ${document.source.url}`,
        `Generated at: ${document.generatedAt.toISOString()}`,
        `URLs: ${document.entries.length}`,
        ""
    ];

    for (const entry of document.entries) {
        lines.push(...entryToMarkdown(entry));
    }

    return `${lines.join("\n").trimEnd()}\n`;
}

function entryToMarkdown(entry: SitemapEntry): string[] {
    const lines = ["## Page", "", `URL: ${entry.url}`];

    if (entry.lastModified !== undefined) {
        lines.push(`Last modified: ${entry.lastModified}`);
    }

    lines.push("");
    return lines;
}
