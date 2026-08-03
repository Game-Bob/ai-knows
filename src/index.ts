import { ConsoleLogger } from './core/logging/console-logger.js';
import { FileStorage } from './core/storage/file-storage.js';
import { PipelineOrchestrator } from './core/pipeline-orchestrator.js';
import { SitemapParser } from './extractors/sitemap/sitemap-parser.js';
import { CategoryResolverService } from './extractors/sitemap/category-resolver.service.js';
import { SitemapCategoryParser } from './extractors/sitemap/sitemap-category-parser.js';
import { SitemapExtractor } from './extractors/sitemap/sitemap-extractor.js';
import { GscAuthService } from './extractors/search-console/gsc-auth.service.js';
import { GscClient } from './extractors/search-console/gsc-client.js';
import { GscNormalizer } from './extractors/search-console/gsc-normalizer.js';
import { GscOpportunityAnalyzer } from './extractors/search-console/gsc-opportunity-analyzer.js';
import { GscCannibalizationAnalyzer } from './extractors/search-console/gsc-cannibalization-analyzer.js';
import { GscContentDecayAnalyzer } from './extractors/search-console/gsc-content-decay-analyzer.js';
import { SearchConsoleExtractor } from './extractors/search-console/gsc-extractor.js';
import { MarkdownFormatter } from './exporters/notebooklm/markdown-formatter.js';
import { NotebookLMExporter } from './exporters/notebooklm/notebooklm-exporter.js';
import { sitemapTargets } from './config/sitemaps.js';
import type { IExtractor } from './core/contracts/extractor.interface.js';

async function main(): Promise<void> {
    const logger = new ConsoleLogger();
    const storage = new FileStorage();

    const sitemapParser = new SitemapParser();
    const categoryResolver = new CategoryResolverService();
    const categoryParser = new SitemapCategoryParser(categoryResolver);
    const sitemapExtractor = new SitemapExtractor(sitemapParser, categoryParser, sitemapTargets);

    const extractors: IExtractor[] = [sitemapExtractor];
    registerGscExtractors(extractors, categoryParser);

    const formatter = new MarkdownFormatter();
    const notebookLMExporter = new NotebookLMExporter(storage, formatter, 'data/notebooklm');

    const orchestrator = new PipelineOrchestrator(extractors, [notebookLMExporter], logger);
    await orchestrator.run();
}

function registerGscExtractors(extractors: IExtractor[], categoryParser: SitemapCategoryParser): void {
    const gscEmail = process.env['GSC_CLIENT_EMAIL'];
    const gscPrivateKey = process.env['GSC_PRIVATE_KEY'];

    if (!gscEmail || !gscPrivateKey) {
        return;
    }

    const gscAuth = new GscAuthService({ clientEmail: gscEmail, privateKey: gscPrivateKey });
    const gscClient = new GscClient(gscAuth);
    const gscNormalizer = new GscNormalizer(categoryParser);
    const opportunityAnalyzer = new GscOpportunityAnalyzer();
    const cannibalizationAnalyzer = new GscCannibalizationAnalyzer();
    const decayAnalyzer = new GscContentDecayAnalyzer();

    const analyzers = { opportunityAnalyzer, cannibalizationAnalyzer, decayAnalyzer };

    for (const target of sitemapTargets) {
        const siteUrl = `sc-domain:${target.domain}`;
        extractors.push(new SearchConsoleExtractor(gscClient, gscNormalizer, analyzers, { siteUrl, daysBack: 30 }));
    }
}

main().catch((err) => {
    console.error('[FATAL] Pipeline failed:', err);
    process.exit(1);
});
