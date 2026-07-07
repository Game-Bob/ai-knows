import { describe, expect, it } from "vitest";
import { createSitemapService } from "../../src/services/sitemaps/sitemap.service.js";
import type { TextDownloader } from "../../src/sitemaps/types.js";

describe("sitemap service", () => {
    it("downloads configured sitemaps and writes AI markdown files", async () => {
        const outputDir = "data/test-output";
        const logs: string[] = [];
        const writes = new Map<string, string>();
        const downloader: TextDownloader = {
            async download() {
                return `
                    <urlset>
                        <url>
                            <loc>https://www.gamebob.dev/en</loc>
                        </url>
                    </urlset>
                `;
            }
        };
        const service = createSitemapService({
            downloader,
            logger: {
                info(message) {
                    logs.push(message);
                }
            },
            writer: {
                async ensureDir() {
                    return undefined;
                },
                async writeText(filePath, content) {
                    writes.set(filePath, content);
                }
            }
        });

        const result = await service.generateAiFiles({
            outputDir,
            sources: [
                {
                    url: "https://www.gamebob.dev/sitemap-en.xml"
                }
            ]
        });

        expect(result.totalEntries).toBe(1);
        expect(result.outputFiles[0]).toContain("www.gamebob.dev-en-sitemap.md");
        expect(writes.get(result.outputFiles[0] ?? "")).toContain("URL: https://www.gamebob.dev/en");
        expect(logs).toContain("Downloading sitemap: https://www.gamebob.dev/sitemap-en.xml");
        expect(logs).toContain("Parsed 1 URLs");
    });
});
