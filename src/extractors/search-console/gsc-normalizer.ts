import type { SitemapCategoryParser, ParsedUrlItem } from '../sitemap/sitemap-category-parser.js';

export class GscNormalizer {
    private categoryParser: SitemapCategoryParser;

    constructor(categoryParser: SitemapCategoryParser) {
        this.categoryParser = categoryParser;
    }

    normalizeUrl(rawUrl: string): ParsedUrlItem {
        return this.categoryParser.parseUrl(rawUrl);
    }
}
