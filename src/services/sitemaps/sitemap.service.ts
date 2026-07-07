import * as path from "node:path";
import { httpTextDownloader } from "../../sitemaps/downloader.js";
import { sitemapToMarkdown } from "../../sitemaps/markdown.js";
import { parseSitemap } from "../../sitemaps/parser.js";
import { resolveSitemapTarget } from "../../sitemaps/target.js";
import type { SitemapJobConfig, SitemapJobResult, TextDownloader } from "../../sitemaps/types.js";
import type { Logger } from "../logging/types.js";
import { fileWriter } from "../storage/file-writer.js";
import type { TextWriter } from "../storage/types.js";

type SitemapServiceDependencies = {
    downloader: TextDownloader;
    logger: Logger;
    writer: TextWriter;
};

const defaultDependencies: SitemapServiceDependencies = {
    downloader: httpTextDownloader,
    logger: { info() {} },
    writer: fileWriter
};

export function createSitemapService(overrides: Partial<SitemapServiceDependencies> = {}) {
    const dependencies: SitemapServiceDependencies = {
        ...defaultDependencies,
        ...overrides
    };

    return {
        async generateAiFiles(config: SitemapJobConfig): Promise<SitemapJobResult> {
            const outputFiles: string[] = [];
            let totalEntries = 0;

            dependencies.logger.info(`Preparing output directory: ${config.outputDir}`);
            await dependencies.writer.ensureDir(config.outputDir);

            for (const source of config.sources) {
                const result = await processSitemapSource(config.outputDir, source, dependencies);
                outputFiles.push(result.outputFile);
                totalEntries += result.entryCount;
            }

            dependencies.logger.info(`Finished sitemap job: ${outputFiles.length} files, ${totalEntries} URLs`);
            return { outputFiles, totalEntries };
        }
    };
}

async function processSitemapSource(
    outputDir: string,
    source: SitemapJobConfig["sources"][number],
    dependencies: SitemapServiceDependencies
): Promise<{ outputFile: string; entryCount: number }> {
    dependencies.logger.info(`Downloading sitemap: ${source.url}`);
    const xmlContent = await dependencies.downloader.download(source.url);
    dependencies.logger.info(`Downloaded ${xmlContent.length} characters`);

    const entries = parseSitemap(xmlContent);
    const generatedAt = new Date();
    const target = resolveSitemapTarget(source.url, generatedAt);
    const outputFile = path.join(outputDir, target.outputFile);
    const markdown = sitemapToMarkdown({ source, target, entries, generatedAt });

    dependencies.logger.info(`Parsed ${entries.length} URLs`);
    dependencies.logger.info(`Writing AI file: ${outputFile}`);
    await dependencies.writer.writeText(outputFile, markdown);
    return { outputFile, entryCount: entries.length };
}
