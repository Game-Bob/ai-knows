import type {
    SocialPost,
    SocialOpportunity
} from '../../core/contracts/social-post.interface.js';

export interface IndexedSitemapTool {
    title: string;
    slug: string;
    url: string;
    tokens: Set<string>;
}

export class SocialMatcherService {
    private readonly tools: IndexedSitemapTool[];
    private readonly stopWords = new Set([
        'what', 'where', 'when', 'online', 'free', 'categories', 'tools',
        'with', 'your', 'from', 'that', 'this', 'have', 'does', 'like',
        'just', 'more', 'about', 'into', 'some', 'could', 'would', 'should',
        'here', 'help', 'daily', 'weekly', 'megathread', 'survey', 'deal'
    ]);

    constructor(sitemapUrls: string[]) {
        this.tools = this.indexTools(sitemapUrls);
    }

    matchPost(post: SocialPost): SocialOpportunity {
        const text = `${post.title} ${post.content}`.toLowerCase();
        const postTokens = this.tokenize(text);
        const matched = this.findBestMatch(postTokens);

        if (matched) {
            const reply = this.craftReply(post, matched);
            return {
                post,
                matchedTool: {
                    title: matched.title,
                    slug: matched.slug,
                    url: matched.url,
                    category: 'utilities'
                },
                suggestedReply: reply,
                isNewToolIdea: false
            };
        }

        return { post, isNewToolIdea: true };
    }

    private findBestMatch(postTokens: Set<string>): IndexedSitemapTool | null {
        let bestTool: IndexedSitemapTool | null = null;
        let highestScore = 0;

        for (const tool of this.tools) {
            let matches = 0;
            for (const token of tool.tokens) {
                if (postTokens.has(token)) {
                    matches++;
                }
            }

            if (matches >= 2 && matches > highestScore) {
                highestScore = matches;
                bestTool = tool;
            }
        }

        return highestScore >= 2 ? bestTool : null;
    }

    private craftReply(post: SocialPost, tool: IndexedSitemapTool): string {
        const isSpanish = /[áéíóúñ¿¡]|\b(como|calcular|para|donde|hola)\b/i.test(post.content);
        if (isSpanish) {
            return `Hola ${post.author}, cree una herramienta web interactiva y gratuita que calcula exactamente esto: ${tool.url} (sin registros ni anuncios). Espero que te sea util!`;
        }
        return `Hey ${post.author}, I built a free interactive tool that calculates this: ${tool.url} - Hope it helps!`;
    }

    private indexTools(urls: string[]): IndexedSitemapTool[] {
        const list: IndexedSitemapTool[] = [];
        for (const url of urls) {
            const slug = this.extractSlug(url);
            if (slug.length > 3) {
                const words = slug.replace(/-/g, ' ');
                const tokens = this.tokenize(words);
                if (tokens.size >= 2) {
                    list.push({ title: words, slug, url, tokens });
                }
            }
        }
        return list;
    }

    private extractSlug(urlStr: string): string {
        try {
            const pathname = new URL(urlStr).pathname;
            const clean = pathname
                .replace(/^\/(en|es|fr|de|it|pt|nl|sv|pl|id|tr|ru|ja|ko|zh)(\/|$)/i, '/')
                .replace(/^\/(tools|herramientas|utilities)(\/|$)/i, '/')
                .replace(/^\/categories\/[^/]+\//i, '/');
            return clean.replace(/^\/+|\/+$/g, '').replace(/\//g, '-').toLowerCase();
        } catch {
            return '';
        }
    }

    private tokenize(text: string): Set<string> {
        const words = text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 2 && !this.stopWords.has(w));
        return new Set(words);
    }
}
