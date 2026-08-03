import type { IExtractor } from '../../core/contracts/extractor.interface.js';
import type { KnowledgeItem } from '../../core/contracts/knowledge-item.interface.js';
import type { GscClient, GscQueryRow } from './gsc-client.js';
import type { GscNormalizer } from './gsc-normalizer.js';
import type { GscOpportunityAnalyzer } from './gsc-opportunity-analyzer.js';
import type { GscCannibalizationAnalyzer } from './gsc-cannibalization-analyzer.js';
import type { GscContentDecayAnalyzer } from './gsc-content-decay-analyzer.js';

export interface GscExtractorOptions {
    siteUrl: string;
    daysBack?: number;
}

export interface GscAnalyzers {
    opportunityAnalyzer: GscOpportunityAnalyzer;
    cannibalizationAnalyzer: GscCannibalizationAnalyzer;
    decayAnalyzer: GscContentDecayAnalyzer;
}

export interface SlugMetric {
    slug: string;
    category: string;
    totalClicks: number;
    totalImpressions: number;
    topQueries: Array<{ query: string; clicks: number; impressions: number }>;
}

interface FormatBusinessOptions {
    domain: string;
    report: ReturnType<GscOpportunityAnalyzer['analyze']>;
    startDate: string;
    endDate: string;
    map: Map<string, SlugMetric>;
}

interface DecayItemOptions {
    domain: string;
    currentRows: GscQueryRow[];
    previousRows: GscQueryRow[];
    startDate: string;
    endDate: string;
}

export class SearchConsoleExtractor implements IExtractor {
    readonly name = 'search-console-extractor';
    private client: GscClient;
    private normalizer: GscNormalizer;
    private analyzers: GscAnalyzers;
    private options: GscExtractorOptions;

    constructor(client: GscClient, normalizer: GscNormalizer, analyzers: GscAnalyzers, options: GscExtractorOptions) {
        this.client = client;
        this.normalizer = normalizer;
        this.analyzers = analyzers;
        this.options = options;
    }

    async extract(): Promise<KnowledgeItem[]> {
        const { currentStart, currentEnd, prevStart, prevEnd } = this.calculateDateRanges();
        const currentRows = await this.client.queryPerformance(this.options.siteUrl, currentStart, currentEnd);
        if (currentRows.length === 0) {
            return [];
        }

        const previousRows = await this.client.queryPerformance(this.options.siteUrl, prevStart, prevEnd);
        const domain = this.extractDomain(this.options.siteUrl);

        const rawItem = this.createRawItem(domain, currentRows, currentStart, currentEnd);
        const businessItem = this.createBusinessItem(domain, currentRows, currentStart, currentEnd);
        const cannibalizationItem = this.createCannibalizationItem(domain, currentRows, currentStart, currentEnd);
        const decayItem = this.createDecayItem({ domain, currentRows, previousRows, startDate: currentStart, endDate: currentEnd });

        return [rawItem, businessItem, cannibalizationItem, decayItem];
    }

    private extractDomain(siteUrl: string): string {
        const clean = siteUrl.replace(/^sc-domain:/, '');
        try {
            return new URL(clean).hostname.replace(/^www\./, '');
        } catch {
            return clean.replace(/^www\./, '');
        }
    }

    private calculateDateRanges() {
        const days = this.options.daysBack ?? 30;
        const now = new Date();

        const currentEnd = now.toISOString().split('T')[0] ?? '';
        const currStartDate = new Date(now);
        currStartDate.setDate(currStartDate.getDate() - days);
        const currentStart = currStartDate.toISOString().split('T')[0] ?? '';

        const prevEndDate = new Date(currStartDate);
        prevEndDate.setDate(prevEndDate.getDate() - 1);
        const prevEnd = prevEndDate.toISOString().split('T')[0] ?? '';

        const prevStartDate = new Date(prevEndDate);
        prevStartDate.setDate(prevStartDate.getDate() - days);
        const prevStart = prevStartDate.toISOString().split('T')[0] ?? '';

        return { currentStart, currentEnd, prevStart, prevEnd };
    }

    private createRawItem(domain: string, rows: GscQueryRow[], startDate: string, endDate: string): KnowledgeItem {
        const content = this.formatRawGscContent(domain, rows, startDate, endDate);
        return {
            id: `gsc-${domain.replace(/[^a-z0-9]/g, '-')}`,
            source: 'search-console',
            title: `${domain} - Search Console Objective Data`,
            content,
            metadata: { domain, siteUrl: this.options.siteUrl, startDate, endDate },
            extractedAt: new Date().toISOString()
        };
    }

    private createBusinessItem(domain: string, rows: GscQueryRow[], startDate: string, endDate: string): KnowledgeItem {
        const metricsBySlug = this.aggregateMetricsBySlug(rows);
        const report = this.analyzers.opportunityAnalyzer.analyze(rows);
        const content = this.formatBusinessOpportunitiesContent({ domain, report, startDate, endDate, map: metricsBySlug });
        return {
            id: `business-${domain.replace(/[^a-z0-9]/g, '-')}`,
            source: 'business-opportunities',
            title: `${domain} - Growth and Business Opportunities`,
            content,
            metadata: { domain, siteUrl: this.options.siteUrl, startDate, endDate },
            extractedAt: new Date().toISOString()
        };
    }

    private createCannibalizationItem(domain: string, rows: GscQueryRow[], startDate: string, endDate: string): KnowledgeItem {
        const groups = this.analyzers.cannibalizationAnalyzer.analyze(rows);
        const content = this.formatCannibalizationContent(domain, groups, startDate, endDate);
        return {
            id: `cannibalization-${domain.replace(/[^a-z0-9]/g, '-')}`,
            source: 'cannibalization',
            title: `${domain} - SEO Cannibalization Audit`,
            content,
            metadata: { domain, siteUrl: this.options.siteUrl, startDate, endDate },
            extractedAt: new Date().toISOString()
        };
    }

    private createDecayItem(opts: DecayItemOptions): KnowledgeItem {
        const decayItems = this.analyzers.decayAnalyzer.analyze(opts.currentRows, opts.previousRows);
        const content = this.formatDecayContent(opts.domain, decayItems, opts.startDate, opts.endDate);
        return {
            id: `decay-${opts.domain.replace(/[^a-z0-9]/g, '-')}`,
            source: 'content-decay',
            title: `${opts.domain} - Content Decay and Traffic Loss Audit`,
            content,
            metadata: { domain: opts.domain, siteUrl: this.options.siteUrl, startDate: opts.startDate, endDate: opts.endDate },
            extractedAt: new Date().toISOString()
        };
    }

    private aggregateMetricsBySlug(rows: GscQueryRow[]): Map<string, SlugMetric> {
        const map = new Map<string, SlugMetric>();
        for (const row of rows) {
            const rawUrl = row.keys[0] ?? this.options.siteUrl;
            const query = row.keys[1] ?? 'unknown';
            const parsed = this.normalizer.normalizeUrl(rawUrl);

            if (!map.has(parsed.slug)) {
                map.set(parsed.slug, {
                    slug: parsed.slug,
                    category: parsed.category,
                    totalClicks: 0,
                    totalImpressions: 0,
                    topQueries: []
                });
            }

            const metric = map.get(parsed.slug)!;
            metric.totalClicks += row.clicks;
            metric.totalImpressions += row.impressions;
            metric.topQueries.push({ query, clicks: row.clicks, impressions: row.impressions });
        }
        return map;
    }

    private formatRawGscContent(domain: string, rows: GscQueryRow[], startDate: string, endDate: string): string {
        const lines = [
            `# ${domain} - Objective Search Console Metrics`,
            `**Period:** ${startDate} to ${endDate}`,
            `**Total Queries Extracted:** ${rows.length}`,
            '',
            '| Query | Page Path | Clicks | Impressions | CTR (%) | Position |',
            '| --- | --- | --- | --- | --- | --- |',
            ...rows.map((r) => {
                const query = r.keys[1] ?? 'unknown';
                const pageUrl = r.keys[0] ?? '';
                const relPath = this.toRelativePath(pageUrl);
                const ctr = Math.round(r.ctr * 10000) / 100;
                const pos = Math.round(r.position * 10) / 10;
                return `| ${query} | ${relPath} | ${r.clicks} | ${r.impressions} | ${ctr}% | ${pos} |`;
            })
        ];
        return lines.join('\n');
    }

    private formatBusinessOpportunitiesContent(opts: FormatBusinessOptions): string {
        const lines = [
            `# ${opts.domain} - Business & Growth Intelligence`,
            `**Period:** ${opts.startDate} to ${opts.endDate}`,
            '',
            '## High-Leverage Page 2 Keywords (Position 8-25 - Striking Distance)',
            '| Query | Page URL | Impressions | Position | CTR |',
            '| --- | --- | --- | --- | --- |',
            ...opts.report.lowHangingFruit.map((i) => `| ${i.query} | ${this.toRelativePath(i.pageUrl)} | ${i.impressions} | ${i.position} | ${i.ctr}% |`),
            '',
            '## Top Revenue & Traffic Performers',
            '| Query | Page URL | Clicks | Impressions | Position |',
            '| --- | --- | --- | --- | --- |',
            ...opts.report.highTraffic.map((i) => `| ${i.query} | ${this.toRelativePath(i.pageUrl)} | ${i.clicks} | ${i.impressions} | ${i.position} |`),
            '',
            '## High-Volume Category Summary',
            '| Category | Slug | Clicks | Impressions | Top Query |',
            '| --- | --- | --- | --- | --- |',
            ...Array.from(opts.map.values()).map((m) => `| ${m.category} | ${m.slug} | ${m.totalClicks} | ${m.totalImpressions} | ${m.topQueries[0]?.query ?? 'N/A'} |`)
        ];

        return lines.join('\n');
    }

    private formatCannibalizationContent(domain: string, groups: ReturnType<GscCannibalizationAnalyzer['analyze']>, startDate: string, endDate: string): string {
        const lines = [
            `# ${domain} - SEO Cannibalization Audit`,
            `**Period:** ${startDate} to ${endDate}`,
            `**Competing Query Groups Detected:** ${groups.length}`,
            ''
        ];

        for (const group of groups) {
            lines.push(`### Query: "${group.query}" (Total Imp: ${group.totalImpressions}, Clicks: ${group.totalClicks})`);
            lines.push('| Competing Page URL | Impressions | Clicks | Position |');
            lines.push('| --- | --- | --- | --- |');
            for (const u of group.urls) {
                lines.push(`| ${this.toRelativePath(u.url)} | ${u.impressions} | ${u.clicks} | ${u.position} |`);
            }
            lines.push('');
        }

        return lines.join('\n');
    }

    private formatDecayContent(domain: string, items: ReturnType<GscContentDecayAnalyzer['analyze']>, startDate: string, endDate: string): string {
        const lines = [
            `# ${domain} - Content Decay & Traffic Loss Audit`,
            `**Period:** Current Period (${startDate} to ${endDate}) vs Previous Period`,
            `**Decaying Keywords/Pages Identified:** ${items.length}`,
            '',
            '| Query | Page URL | Previous Imp | Current Imp | Imp Drop | Previous Clicks | Current Clicks | Click Drop |',
            '| --- | --- | --- | --- | --- | --- | --- | --- |',
            ...items.map((i) => `| ${i.query} | ${this.toRelativePath(i.pageUrl)} | ${i.previousImpressions} | ${i.currentImpressions} | ${i.impressionDrop} | ${i.previousClicks} | ${i.currentClicks} | ${i.clickDrop} |`)
        ];

        return lines.join('\n');
    }

    private toRelativePath(urlStr: string): string {
        try {
            const path = new URL(urlStr).pathname;
            return path.replace(/^\/(en|es|fr|de|it|pt|nl|sv|pl|id|tr|ru|ja|ko|zh)(\/|$)/i, '/');
        } catch {
            return urlStr;
        }
    }
}
