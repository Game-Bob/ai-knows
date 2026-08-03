import type { CategoryResolverService } from './category-resolver.service.js';

export interface ParsedUrlItem {
    originalUrl: string;
    type: 'utility' | 'app' | 'page';
    category: string;
    slug: string;
    title: string;
}

export class SitemapCategoryParser {
    private resolver: CategoryResolverService;

    constructor(resolver: CategoryResolverService) {
        this.resolver = resolver;
    }

    parseUrl(urlStr: string): ParsedUrlItem {
        try {
            const urlObj = new URL(urlStr);
            const pathSegments = urlObj.pathname.split('/').filter(Boolean);

            if (pathSegments.length === 0) {
                return this.createPageItem(urlStr, 'Home', 'home');
            }

            const cleanSegments = this.stripLanguagePrefix(pathSegments);

            if (cleanSegments[0] === 'utilities' || cleanSegments[0] === 'utilidades' || cleanSegments[0] === 'werkzeuge') {
                return this.parseUtility(urlStr, cleanSegments);
            }

            if (cleanSegments[0] === 'apps') {
                return this.parseApp(urlStr, cleanSegments);
            }

            return this.createPageItem(urlStr, 'General', cleanSegments.join('-'));
        } catch {
            return this.createPageItem(urlStr, 'General', 'unknown');
        }
    }

    private stripLanguagePrefix(segments: string[]): string[] {
        const langCodes = new Set(['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'sv', 'pl', 'id', 'tr', 'ru', 'ja', 'ko', 'zh']);
        if (segments[0] && langCodes.has(segments[0].toLowerCase())) {
            return segments.slice(1);
        }
        return segments;
    }

    private parseUtility(urlStr: string, segments: string[]): ParsedUrlItem {
        let category = 'Uncategorized';
        let slug = 'utility';

        if (segments[1] === 'categories' || segments[1] === 'kategorien') {
            if (segments[2]) {
                category = this.formatTitle(segments[2]);
                slug = segments[3] ?? segments[2];
                this.resolver.register(slug, category);
            }
        } else if (segments[1]) {
            slug = segments[1];
            category = this.resolver.resolve(slug);
        }

        const title = this.formatTitle(slug);

        return {
            originalUrl: urlStr,
            type: 'utility',
            category,
            slug,
            title
        };
    }

    private parseApp(urlStr: string, segments: string[]): ParsedUrlItem {
        const slug = segments[1] ?? 'app';
        const title = this.formatTitle(slug);

        return {
            originalUrl: urlStr,
            type: 'app',
            category: 'Applications',
            slug,
            title
        };
    }

    private createPageItem(urlStr: string, category: string, slug: string): ParsedUrlItem {
        return {
            originalUrl: urlStr,
            type: 'page',
            category,
            slug,
            title: this.formatTitle(slug)
        };
    }

    private formatTitle(slug: string): string {
        return slug
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
