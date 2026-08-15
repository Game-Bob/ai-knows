import { ConsoleLogger } from './core/logging/console-logger.js';
import { FileStorage } from './core/storage/file-storage.js';
import { GoogleSuggestClient } from './extractors/search-suggest/clients/google-suggest.client.js';
import { VerticalClustererService } from './extractors/search-suggest/vertical-clusterer.service.js';
import { VerticalGapAnalyzer } from './extractors/search-suggest/vertical-gap-analyzer.js';
import { openWildcardPatterns, alphabetLetters } from './config/vertical-discovery-seeds.js';

function buildOpenQueries(): string[] {
    const queries: string[] = [];
    for (const pattern of openWildcardPatterns) {
        for (const letter of alphabetLetters) {
            queries.push(`${pattern} ${letter}`);
        }
    }
    return queries;
}

async function fetchAllSuggestions(client: GoogleSuggestClient, queries: string[]): Promise<string[]> {
    const results: string[] = [];
    const concurrency = 4;
    const delayMs = 70;

    for (let i = 0; i < queries.length; i += concurrency) {
        const chunk = queries.slice(i, i + concurrency);
        const chunkResults = await Promise.all(chunk.map((q) => client.getSuggestions(q)));
        results.push(...chunkResults.flat());

        if (i + concurrency < queries.length) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    return results;
}

async function main(): Promise<void> {
    const logger = new ConsoleLogger();
    const storage = new FileStorage();
    const client = new GoogleSuggestClient();
    const clusterer = new VerticalClustererService();
    const analyzer = new VerticalGapAnalyzer();

    logger.info('Starting open-ended wildcard search intent mining for new verticals...');
    const queries = buildOpenQueries();
    const suggestions = await fetchAllSuggestions(client, queries);

    logger.info(`Harvested ${suggestions.length} open suggestions. Clustering new vertical domains...`);
    const clusters = clusterer.cluster(suggestions);
    const content = analyzer.formatMarkdown(clusters, queries.length);

    await storage.write('data/notebooklm/new-verticals-report.md', content);
    logger.info(`Discovered ${clusters.length} new unexplored verticals. Report saved to data/notebooklm/new-verticals-report.md`);
}

main().catch((err) => {
    console.error('[FATAL] Discover verticals pipeline failed:', err);
    process.exit(1);
});
