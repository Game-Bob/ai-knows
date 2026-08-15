import type {
    SuggestOpportunity,
    ToolIntentType,
    CategoryGapSummary,
    SuggestReportData
} from '../../core/contracts/suggest-opportunity.interface.js';
import type { RawDiscoveredQuery } from './suggest-expander.service.js';
import type { SitemapMatcherService } from './sitemap-matcher.service.js';

export class SuggestGapAnalyzer {
    private readonly intentKeywords: Record<ToolIntentType, string[]> = {
        calculator: ['calculator', 'calc', 'calculate'],
        converter: ['converter', 'convert'],
        generator: ['generator', 'generate'],
        estimator: ['estimator', 'estimate'],
        checker: ['checker', 'check', 'validate'],
        simulator: ['simulator', 'simulate'],
        chart: ['chart', 'table', 'matrix'],
        timer: ['timer', 'clock', 'countdown'],
        tester: ['tester', 'test'],
        solver: ['solver', 'solve'],
        general: []
    };

    analyze(rawQueries: RawDiscoveredQuery[], matcher: SitemapMatcherService): SuggestReportData {
        const opportunities = rawQueries.map((raw) => this.mapToOpportunity(raw, matcher));
        const categories = this.groupByCategory(opportunities);
        const totalUncovered = categories.reduce((sum, cat) => sum + cat.uncoveredCount, 0);

        return {
            timestamp: new Date().toISOString(),
            totalQueried: rawQueries.length,
            totalDiscovered: opportunities.length,
            totalUncovered,
            categories
        };
    }

    formatMarkdown(report: SuggestReportData): string {
        const lines: string[] = [
            '# Proactive Opportunity Discovery Report (Suggest Engine)',
            '',
            `Generated at: ${report.timestamp}`,
            `Total Discoveries: ${report.totalDiscovered} | Uncovered Gaps: ${report.totalUncovered}`,
            '',
            '## Executive Summary',
            '',
            '| Category | Discovered Intentions | New Opportunities (Gaps) | Opportunity Rate |',
            '| :--- | :--- | :--- | :--- |'
        ];

        for (const cat of report.categories) {
            const rate = cat.totalDiscovered > 0 ? Math.round((cat.uncoveredCount / cat.totalDiscovered) * 100) : 0;
            lines.push(`| ${cat.category} | ${cat.totalDiscovered} | ${cat.uncoveredCount} | ${rate}% |`);
        }

        lines.push('', '## Detailed Category Opportunities', '');
        for (const cat of report.categories) {
            if (cat.uncoveredCount === 0) {
                continue;
            }
            lines.push(`### Category: ${cat.category} (${cat.uncoveredCount} new gaps)`, '');
            lines.push('| Search Query Intent | Type | Suggested Slug | Source |', '| :--- | :--- | :--- | :--- |');
            for (const opp of cat.opportunities.filter((o) => !o.isCoveredInSitemap)) {
                lines.push(`| ${opp.query} | ${opp.intentType} | \`${opp.suggestedSlug}\` | ${opp.sourceClient} |`);
            }
            lines.push('');
        }

        return lines.join('\n');
    }

    private mapToOpportunity(raw: RawDiscoveredQuery, matcher: SitemapMatcherService): SuggestOpportunity {
        const intentType = this.detectIntentType(raw.query);
        const suggestedSlug = raw.query
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const isCovered = matcher.isCovered(raw.query);

        return {
            query: raw.query,
            category: raw.category,
            intentType,
            suggestedSlug,
            sourceClient: raw.sourceClient,
            isCoveredInSitemap: isCovered
        };
    }

    private detectIntentType(query: string): ToolIntentType {
        const words = query.toLowerCase().split(/[^a-z0-9]+/);
        for (const [intent, keywords] of Object.entries(this.intentKeywords) as [ToolIntentType, string[]][]) {
            if (keywords.some((kw) => words.some((word) => word.startsWith(kw) || word === kw))) {
                return intent;
            }
        }
        return 'general';
    }

    private groupByCategory(opportunities: SuggestOpportunity[]): CategoryGapSummary[] {
        const map = new Map<string, SuggestOpportunity[]>();
        for (const opp of opportunities) {
            if (!map.has(opp.category)) {
                map.set(opp.category, []);
            }
            map.get(opp.category)!.push(opp);
        }

        return Array.from(map.entries()).map(([category, items]) => ({
            category,
            totalDiscovered: items.length,
            uncoveredCount: items.filter((i) => !i.isCoveredInSitemap).length,
            opportunities: items
        }));
    }
}
