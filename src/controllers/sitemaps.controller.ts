import { appConfig } from "../config/app.js";
import { sitemapSources } from "../config/sitemaps.js";
import { createSitemapService } from "../services/sitemaps/sitemap.service.js";

export async function runSitemapsController(): Promise<void> {
    const service = createSitemapService();
    const result = await service.generateAiFiles({
        sources: sitemapSources,
        outputDir: appConfig.sitemapOutputDir
    });

    console.log(`Created ${result.outputFiles.length} files with ${result.totalEntries} URLs`);
}
