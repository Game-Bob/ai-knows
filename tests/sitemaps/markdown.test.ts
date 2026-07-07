import { describe, expect, it } from "vitest";
import { sitemapToMarkdown } from "../../src/sitemaps/markdown.js";

describe("sitemapToMarkdown", () => {
    it("creates an AI-readable markdown document", () => {
        const markdown = sitemapToMarkdown({
            source: {
                url: "https://www.gamebob.dev/sitemap-en.xml"
            },
            target: {
                host: "www.gamebob.dev",
                language: "en",
                title: "www.gamebob.dev sitemap en",
                outputFile: "2026-07-07-www.gamebob.dev-en-sitemap.md"
            },
            generatedAt: new Date("2026-07-07T20:00:00.000Z"),
            entries: [
                {
                    url: "https://www.gamebob.dev/en",
                    lastModified: "2026-07-07"
                }
            ]
        });

        expect(markdown).toContain("# www.gamebob.dev sitemap en");
        expect(markdown).toContain("Source: https://www.gamebob.dev/sitemap-en.xml");
        expect(markdown).toContain("URLs: 1");
        expect(markdown).toContain("URL: https://www.gamebob.dev/en");
        expect(markdown).toContain("Last modified: 2026-07-07");
    });
});
