export class SitemapMatcherService {
    private readonly activeSlugs: Set<string>;
    private readonly slugTokens: Map<string, Set<string>>;

    constructor(sitemapUrlsOrSlugs: string[]) {
        this.activeSlugs = new Set();
        this.slugTokens = new Map();
        this.indexSlugs(sitemapUrlsOrSlugs);
    }

    isCovered(query: string): boolean {
        const normalizedQuerySlug = this.toSlug(query);
        if (this.activeSlugs.has(normalizedQuerySlug)) {
            return true;
        }

        const queryTokens = this.tokenize(query);
        if (queryTokens.size === 0) {
            return false;
        }

        for (const [existingSlug, existingTokens] of this.slugTokens.entries()) {
            if (this.isSignificantOverlap(queryTokens, existingTokens, normalizedQuerySlug, existingSlug)) {
                return true;
            }
        }

        return false;
    }

    private indexSlugs(urlsOrSlugs: string[]): void {
        for (const item of urlsOrSlugs) {
            const slug = this.extractSlug(item);
            if (slug && slug.length > 2) {
                this.activeSlugs.add(slug);
                this.slugTokens.set(slug, this.tokenize(slug.replace(/-/g, ' ')));
            }
        }
    }

    private extractSlug(urlOrSlug: string): string {
        try {
            if (urlOrSlug.startsWith('http://') || urlOrSlug.startsWith('https://')) {
                const pathname = new URL(urlOrSlug).pathname;
                const clean = pathname.replace(/^\/(en|es|fr|de|it|pt|nl|sv|pl|id|tr|ru|ja|ko|zh)(\/|$)/i, '/');
                return clean.replace(/^\/+|\/+$/g, '').replace(/\//g, '-').toLowerCase();
            }
            return this.toSlug(urlOrSlug);
        } catch {
            return this.toSlug(urlOrSlug);
        }
    }

    private toSlug(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    private tokenize(text: string): Set<string> {
        const words = text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 1);
        return new Set(words);
    }

    private isSignificantOverlap(
        queryTokens: Set<string>,
        existingTokens: Set<string>,
        querySlug: string,
        existingSlug: string
    ): boolean {
        if (querySlug.includes(existingSlug) || existingSlug.includes(querySlug)) {
            return true;
        }

        let matchCount = 0;
        for (const token of queryTokens) {
            if (existingTokens.has(token)) {
                matchCount++;
            }
        }

        const overlapRatio = matchCount / queryTokens.size;
        return overlapRatio >= 0.75 && queryTokens.size >= 3;
    }
}
