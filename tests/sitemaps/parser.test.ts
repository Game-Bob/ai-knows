import { describe, expect, it } from "vitest";
import { parseSitemap } from "../../src/sitemaps/parser.js";

describe("parseSitemap", () => {
    it("extracts sitemap URLs and optional modification dates", () => {
        const xml = `
            <urlset>
                <url>
                    <loc>https://www.gamebob.dev/en</loc>
                    <lastmod>2026-07-07</lastmod>
                </url>
                <url>
                    <loc>https://www.gamebob.dev/en/tools?a=1&amp;b=2</loc>
                </url>
            </urlset>
        `;

        expect(parseSitemap(xml)).toEqual([
            {
                url: "https://www.gamebob.dev/en",
                lastModified: "2026-07-07"
            },
            {
                url: "https://www.gamebob.dev/en/tools?a=1&b=2",
                lastModified: undefined
            }
        ]);
    });
});
