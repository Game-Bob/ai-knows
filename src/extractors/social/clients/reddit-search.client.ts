import type { SocialPost } from '../../../core/contracts/social-post.interface.js';

export class RedditSearchClient {
    private readonly timeoutMs: number;

    constructor(timeoutMs: number = 6000) {
        this.timeoutMs = timeoutMs;
    }

    async searchSubreddit(subreddit: string, query: string): Promise<SocialPost[]> {
        const queryUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:reddit.com/r/${subreddit} ${query}`)}&num=8&hl=en`;
        return this.fetchFromGoogle(queryUrl);
    }

    async searchGlobal(query: string): Promise<SocialPost[]> {
        const queryUrl = `https://www.google.com/search?q=${encodeURIComponent(`site:reddit.com ${query}`)}&num=8&hl=en`;
        return this.fetchFromGoogle(queryUrl);
    }

    private async fetchFromGoogle(queryUrl: string): Promise<SocialPost[]> {
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

            if (rawUrl.includes('reddit.com/r/') && rawTitle.length > 5) {
                posts.push(this.buildPost(rawUrl, rawTitle));
            }
        }

        return posts;
    }

    private buildPost(url: string, title: string): SocialPost {
        const subMatch = url.match(/reddit\.com\/r\/([^/]+)/);
        const author = subMatch ? `r/${subMatch[1]}` : 'r/reddit';

        return {
            id: `reddit-${url.replace(/[^a-z0-9]/gi, '-').slice(-30)}`,
            platform: 'reddit',
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
