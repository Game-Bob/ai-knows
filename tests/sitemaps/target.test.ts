import { describe, expect, it } from "vitest";
import { resolveSitemapTarget } from "../../src/sitemaps/target.js";

describe("resolveSitemapTarget", () => {
    it("derives output metadata from the sitemap URL", () => {
        expect(
            resolveSitemapTarget(
                "https://www.gamebob.dev/sitemap-en.xml",
                new Date("2026-07-07T20:00:00.000Z")
            )
        ).toEqual({
            host: "www.gamebob.dev",
            language: "en",
            title: "www.gamebob.dev sitemap en",
            outputFile: "2026-07-07-www.gamebob.dev-en-sitemap.md"
        });
    });
});
