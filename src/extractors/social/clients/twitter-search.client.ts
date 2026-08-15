import type { SocialPost } from '../../../core/contracts/social-post.interface.js';

export class TwitterSearchClient {
    private readonly timeoutMs: number;

    constructor(timeoutMs: number = 6000) {
        this.timeoutMs = timeoutMs;
    }

    async searchTweets(intentQuery: string): Promise<SocialPost[]> {
        const queryUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(`site:x.com ${intentQuery}`)}&btf=m`;

        try {
            const response = await fetch(queryUrl, {
                signal: AbortSignal.timeout(this.timeoutMs),
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                return [];
            }

            const html = await response.text();
            return this.parseYahooResults(html);
        } catch {
            return [];
        }
    }

    private parseYahooResults(html: string): SocialPost[] {
        const posts: SocialPost[] = [];
        const regex = /<a[^>]*href="([^"]*RU=([^/&"]*)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        const seen = new Set<string>();
        let match: RegExpExecArray | null;

        while ((match = regex.exec(html)) !== null && posts.length < 10) {
            const targetUrl = decodeURIComponent(match[2] ?? '');
            const rawTitle = this.cleanHtml(match[3] ?? '');

            if (this.isValidTweet(targetUrl, rawTitle, seen)) {
                seen.add(targetUrl);
                posts.push(this.buildPost(targetUrl, rawTitle));
            }
        }

        return posts;
    }

    private isValidTweet(url: string, title: string, seen: Set<string>): boolean {
        return (url.includes('x.com/') || url.includes('twitter.com/')) &&
            !url.includes('/search') &&
            title.length > 10 &&
            !seen.has(url);
    }

    private buildPost(url: string, title: string): SocialPost {
        const authorMatch = url.match(/(?:x\.com|twitter\.com)\/([^/]+)/);
        const author = authorMatch ? `@${authorMatch[1]}` : '@user';

        return {
            id: `twitter-${url.replace(/[^a-z0-9]/gi, '-').slice(-30)}`,
            platform: 'twitter',
            author,
            title: title.slice(0, 120),
            content: title,
            url,
            createdAt: new Date().toISOString(),
            engagement: { score: 0, comments: 0 }
        };
    }

    private cleanHtml(text: string): string {
        return text
            .replace(/<[^>]*>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#x27;/g, "'")
            .replace(/^x\.comhttps?:\/\/[^\s]+/i, '')
            .replace(/^[›\s]+[a-zA-Z0-9_]+\s+[›\s]+(?:status|article)\s*/i, '')
            .trim();
    }
}
