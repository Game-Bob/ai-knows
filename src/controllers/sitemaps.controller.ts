import { appConfig } from "../config/app.js";
import { sitemapSources } from "../config/sitemaps.js";
import { consoleLogger } from "../services/logging/console-logger.js";
import { createSitemapService } from "../services/sitemaps/sitemap.service.js";

export async function runSitemapsController(): Promise<void> {
    const service = createSitemapService({ logger: consoleLogger });
    await service.generateAiFiles({
        sources: sitemapSources,
        outputDir: appConfig.sitemapOutputDir
    });
}
