import type { IExtractor } from '../../core/contracts/extractor.interface.js';
import type { KnowledgeItem } from '../../core/contracts/knowledge-item.interface.js';
import type { SitemapParser } from './sitemap-parser.js';
import type { SitemapCategoryParser, ParsedUrlItem } from './sitemap-category-parser.js';

export interface SitemapTarget {
    domain: string;
    language: string;
    url: string;
}

export class SitemapExtractor implements IExtractor {
    readonly name = 'sitemap-extractor';
    private sitemapParser: SitemapParser;
    private categoryParser: SitemapCategoryParser;
    private targets: SitemapTarget[];

    constructor(sitemapParser: SitemapParser, categoryParser: SitemapCategoryParser, targets: SitemapTarget[]) {
        this.sitemapParser = sitemapParser;
        this.categoryParser = categoryParser;
        this.targets = targets;
    }

    async extract(): Promise<KnowledgeItem[]> {
        const items: KnowledgeItem[] = [];
        for (const target of this.targets) {
            const item = await this.extractDomainItem(target);
            if (item) {
                items.push(item);
            }
        }
        return items;
    }

    private async extractDomainItem(target: SitemapTarget): Promise<KnowledgeItem | null> {
        const urls = await this.sitemapParser.parse(target.url);
        if (urls.length === 0) {
            return null;
        }

        const categoryMap = this.groupUrlsByCategory(urls);
        const content = this.formatDomainSitemapContent(target.domain, categoryMap, urls.length);

        return {
            id: `sitemap-${target.domain.replace(/[^a-z0-9]/g, '-')}`,
            source: 'sitemap',
            title: `${target.domain} - Sitemap`,
            content,
            metadata: { domain: target.domain, totalUrls: urls.length },
            extractedAt: new Date().toISOString()
        };
    }

    private groupUrlsByCategory(urls: string[]): Map<string, ParsedUrlItem[]> {
        const map = new Map<string, ParsedUrlItem[]>();
        for (const url of urls) {
            const parsed = this.categoryParser.parseUrl(url);
            if (!map.has(parsed.category)) {
                map.set(parsed.category, []);
            }
            map.get(parsed.category)!.push(parsed);
        }
        return map;
    }

    private formatDomainSitemapContent(domain: string, categoryMap: Map<string, ParsedUrlItem[]>, totalUrls: number): string {
        const lines: string[] = [
            `# ${domain} (${totalUrls})`,
            ''
        ];

        for (const [category, items] of categoryMap.entries()) {
            const uniqueItems = this.deduplicateSlugs(items);
            lines.push(`## ${category} (${uniqueItems.length})`);
            for (const item of uniqueItems) {
                const relPath = this.toRelativePath(item.originalUrl);
                lines.push(`- ${relPath}`);
            }
            lines.push('');
        }

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

    private deduplicateSlugs(items: ParsedUrlItem[]): ParsedUrlItem[] {
        const unique = new Map<string, ParsedUrlItem>();
        for (const item of items) {
            if (!unique.has(item.slug)) {
                unique.set(item.slug, item);
            }
        }
        return Array.from(unique.values());
    }
}
