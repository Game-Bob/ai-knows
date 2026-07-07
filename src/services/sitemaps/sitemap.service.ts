import path from "node:path";
import { httpTextDownloader } from "../../sitemaps/downloader.js";
import { sitemapToMarkdown } from "../../sitemaps/markdown.js";
import { parseSitemap } from "../../sitemaps/parser.js";
import { resolveSitemapTarget } from "../../sitemaps/target.js";
import type { SitemapJobConfig, SitemapJobResult, TextDownloader } from "../../sitemaps/types.js";
import { fileWriter } from "../storage/file-writer.js";
import type { TextWriter } from "../storage/types.js";

type SitemapServiceDependencies = {
    downloader: TextDownloader;
    writer: TextWriter;
};

export function createSitemapService(
    dependencies: SitemapServiceDependencies = {
        downloader: httpTextDownloader,
        writer: fileWriter
    }
) {
    return {
        async generateAiFiles(config: SitemapJobConfig): Promise<SitemapJobResult> {
            const outputFiles: string[] = [];
            let totalEntries = 0;

            await dependencies.writer.ensureDir(config.outputDir);

            for (const source of config.sources) {
                const xmlContent = await dependencies.downloader.download(source.url);
                const entries = parseSitemap(xmlContent);
                const generatedAt = new Date();
                const target = resolveSitemapTarget(source.url, generatedAt);
                const outputFile = path.join(config.outputDir, target.outputFile);
                const markdown = sitemapToMarkdown({ source, target, entries, generatedAt });

                await dependencies.writer.writeText(outputFile, markdown);
                outputFiles.push(outputFile);
                totalEntries += entries.length;
            }

            return { outputFiles, totalEntries };
        }
    };
}
