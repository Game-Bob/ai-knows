import type { SocialPost } from '../../../core/contracts/social-post.interface.js';

export class TwitterSearchClient {
    private readonly timeoutMs: number;

    constructor(timeoutMs: number = 6000) {
        this.timeoutMs = timeoutMs;
    }

    async searchTweets(intentQuery: string): Promise<SocialPost[]> {
        const queryUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:x.com ${intentQuery}`)}&num=10&hl=en`;

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
            return this.parseGoogleResults(html);
        } catch {
            return [];
        }
    }

    private parseGoogleResults(html: string): SocialPost[] {
        const posts: SocialPost[] = [];
        const linkRegex = /<a[^>]*href="\/url\?q=([^"&]*)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
        let match: RegExpExecArray | null;

        while ((match = linkRegex.exec(html)) !== null && posts.length < 8) {
            const rawUrl = decodeURIComponent(match[1] ?? '');
            const rawTitle = this.cleanHtml(match[2] ?? '');

            if ((rawUrl.includes('x.com/') || rawUrl.includes('twitter.com/')) && rawTitle.length > 5) {
                posts.push(this.buildPost(rawUrl, rawTitle));
            }
        }

        return posts;
    }

    private buildPost(url: string, title: string): SocialPost {
        const authorMatch = url.match(/(?:x\.com|twitter\.com)\/([^/]+)/);
        const author = authorMatch ? `@${authorMatch[1]}` : '@user';

        return {
            id: `twitter-${url.replace(/[^a-z0-9]/gi, '-').slice(-30)}`,
            platform: 'twitter',
            author,
            title: title.slice(0, 100),
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
            .trim();
    }
}
