import type { IExtractor } from '../../core/contracts/extractor.interface.js';
import type { KnowledgeItem } from '../../core/contracts/knowledge-item.interface.js';
import type { SuggestExpanderService, RawDiscoveredQuery } from './suggest-expander.service.js';
import type { SitemapMatcherService } from './sitemap-matcher.service.js';
import type { SuggestGapAnalyzer } from './suggest-gap-analyzer.js';
import type { CategorySeedConfig } from '../../config/suggest-seeds.js';

export interface SearchSuggestExtractorOptions {
    categoryConfigs: CategorySeedConfig[];
    modifiers: string[];
}

export class SearchSuggestExtractor implements IExtractor {
    readonly name = 'search-suggest-extractor';
    private readonly expander: SuggestExpanderService;
    private readonly matcher: SitemapMatcherService;
    private readonly analyzer: SuggestGapAnalyzer;
    private readonly options: SearchSuggestExtractorOptions;

    constructor(
        expander: SuggestExpanderService,
        matcher: SitemapMatcherService,
        analyzer: SuggestGapAnalyzer,
        options: SearchSuggestExtractorOptions
    ) {
        this.expander = expander;
        this.matcher = matcher;
        this.analyzer = analyzer;
        this.options = options;
    }

    async extract(): Promise<KnowledgeItem[]> {
        const allDiscovered: RawDiscoveredQuery[] = [];

        for (const config of this.options.categoryConfigs) {
            const results = await this.expander.expandCategory(config, this.options.modifiers);
            allDiscovered.push(...results);
        }

        const report = this.analyzer.analyze(allDiscovered, this.matcher);
        const content = this.analyzer.formatMarkdown(report);

        return [
            {
                id: 'search-suggest-opportunities',
                source: 'suggest-engine',
                title: 'Proactive Opportunity Discovery (Suggest Engine)',
                content,
                metadata: {
                    domain: 'global',
                    totalDiscovered: report.totalDiscovered,
                    totalUncovered: report.totalUncovered
                },
                extractedAt: report.timestamp
            }
        ];
    }
}
