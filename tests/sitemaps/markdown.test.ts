import { describe, expect, it } from "vitest";
import { sitemapToMarkdown } from "../../src/sitemaps/markdown.js";

describe("sitemapToMarkdown", () => {
    it("creates a grouped AI-readable markdown document", () => {
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
                    url: "https://www.gamebob.dev/en/",
                    lastModified: "2026-07-07"
                },
                {
                    url: "https://www.gamebob.dev/en/apps/cat-tools/",
                    lastModified: undefined
                },
                {
                    url: "https://www.gamebob.dev/en/utilities/categories/audiovisual-photography/print-quality-calculator-pixels-to-cm-dpi/",
                    lastModified: undefined
                },
                {
                    url: "https://www.gamebob.dev/en/utilities/categories/audiovisual-photography/tv-viewing-distance-calculator-thx-4k-optimal-screen/",
                    lastModified: undefined
                }
            ]
        });

        expect(markdown).toContain("# www.gamebob.dev sitemap en");
        expect(markdown).toContain("Source: https://www.gamebob.dev/sitemap-en.xml");
        expect(markdown).toContain("Relevant URLs: 3");
        expect(markdown).toContain("## Apps");
        expect(markdown).toContain("### Cat Tools");
        expect(markdown).toContain("## Utilities");
        expect(markdown).toContain("### Audiovisual Photography");
        expect(markdown).toContain("- Print Quality Calculator Pixels To Cm Dpi:");
        expect(markdown).toContain("- Tv Viewing Distance Calculator Thx 4k Optimal Screen:");
        expect(markdown).not.toContain("Last modified");
        expect(markdown).not.toContain("URL: https://www.gamebob.dev/en/");
    });
});
