import { ConsoleLogger } from './core/logging/console-logger.js';
import { FileStorage } from './core/storage/file-storage.js';
import { PipelineOrchestrator } from './core/pipeline-orchestrator.js';
import { SitemapParser } from './extractors/sitemap/sitemap-parser.js';
import { GoogleSuggestClient } from './extractors/search-suggest/clients/google-suggest.client.js';
import { SuggestExpanderService } from './extractors/search-suggest/suggest-expander.service.js';
import { SitemapMatcherService } from './extractors/search-suggest/sitemap-matcher.service.js';
import { SuggestGapAnalyzer } from './extractors/search-suggest/suggest-gap-analyzer.js';
import { SearchSuggestExtractor } from './extractors/search-suggest/search-suggest-extractor.js';
import { MarkdownFormatter } from './exporters/notebooklm/markdown-formatter.js';
import { NotebookLMExporter } from './exporters/notebooklm/notebooklm-exporter.js';
import { sitemapTargets } from './config/sitemaps.js';
import { categorySeedConfigs, suggestModifiers } from './config/suggest-seeds.js';

async function fetchSitemapUrls(parser: SitemapParser): Promise<string[]> {
    const urls: string[] = [];
    for (const target of sitemapTargets) {
        const parsed = await parser.parse(target.url);
        urls.push(...parsed);
    }
    return urls;
}

async function main(): Promise<void> {
    const logger = new ConsoleLogger();
    const storage = new FileStorage();
    const sitemapParser = new SitemapParser();

    logger.info('Fetching sitemaps for coverage cross-matching...');
    const activeUrls = await fetchSitemapUrls(sitemapParser);

    const suggestClient = new GoogleSuggestClient();
    const expander = new SuggestExpanderService(suggestClient);
    const matcher = new SitemapMatcherService(activeUrls);
    const analyzer = new SuggestGapAnalyzer();

    const suggestExtractor = new SearchSuggestExtractor(expander, matcher, analyzer, {
        categoryConfigs: categorySeedConfigs,
        modifiers: suggestModifiers
    });

    const formatter = new MarkdownFormatter();
    const exporter = new NotebookLMExporter(storage, formatter, 'data/notebooklm');
    const orchestrator = new PipelineOrchestrator([suggestExtractor], [exporter], logger);

    await orchestrator.run();
}

main().catch((err) => {
    console.error('[FATAL] Discover pipeline failed:', err);
    process.exit(1);
});
