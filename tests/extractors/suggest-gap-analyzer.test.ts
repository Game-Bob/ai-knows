import { describe, expect, it } from 'vitest';
import { SuggestGapAnalyzer } from '../../src/extractors/search-suggest/suggest-gap-analyzer.js';
import { SitemapMatcherService } from '../../src/extractors/search-suggest/sitemap-matcher.service.js';

describe('SuggestGapAnalyzer', () => {
    const analyzer = new SuggestGapAnalyzer();
    const matcher = new SitemapMatcherService([
        'https://www.gamebob.dev/en/tools/drone-battery-c-rating-calculator'
    ]);

    it('classifies intent types and partitions covered versus uncovered queries', () => {
        const rawQueries = [
            {
                query: 'drone battery c rating calculator',
                category: 'drones',
                seedOrigin: 'drone battery calculator',
                sourceClient: 'google-suggest'
            },
            {
                query: 'blood splatter trajectory simulator',
                category: 'forensic-science',
                seedOrigin: 'blood splatter simulator',
                sourceClient: 'google-suggest'
            },
            {
                query: 'knitting yarn gauge converter',
                category: 'textiles',
                seedOrigin: 'yarn weight converter',
                sourceClient: 'google-suggest'
            }
        ];

        const report = analyzer.analyze(rawQueries, matcher);

        expect(report.totalDiscovered).toBe(3);
        expect(report.totalUncovered).toBe(2);

        const drones = report.categories.find((c) => c.category === 'drones');
        expect(drones?.uncoveredCount).toBe(0);

        const forensics = report.categories.find((c) => c.category === 'forensic-science');
        expect(forensics?.uncoveredCount).toBe(1);
        expect(forensics?.opportunities[0]?.intentType).toBe('simulator');
    });

    it('generates rich markdown output', () => {
        const report = analyzer.analyze(
            [
                {
                    query: 'blood splatter angle calculator',
                    category: 'forensic-science',
                    seedOrigin: 'blood splatter calculator',
                    sourceClient: 'google-suggest'
                }
            ],
            matcher
        );

        const markdown = analyzer.formatMarkdown(report);
        expect(markdown).toContain('# Proactive Opportunity Discovery Report');
        expect(markdown).toContain('blood splatter angle calculator');
    });
});
