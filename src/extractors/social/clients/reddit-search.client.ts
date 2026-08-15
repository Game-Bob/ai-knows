import type { SocialPost } from '../../../core/contracts/social-post.interface.js';

interface PullpushItem {
    id: string;
    author: string;
    title: string;
    selftext?: string;
    permalink?: string;
    full_link?: string;
    created_utc?: number;
    score?: number;
    num_comments?: number;
    over_18?: boolean;
    subreddit?: string;
}

interface PullpushResponse {
    data?: PullpushItem[];
}

export class RedditSearchClient {
    private readonly timeoutMs: number;

    constructor(timeoutMs: number = 6000) {
        this.timeoutMs = timeoutMs;
    }

    async searchSubreddit(subreddit: string, query: string): Promise<SocialPost[]> {
        const url = `https://api.pullpush.io/reddit/search/submission/?subreddit=${encodeURIComponent(subreddit)}&q=${encodeURIComponent(query)}&size=10`;
        return this.fetchFromPullpush(url, subreddit);
    }

    private async fetchFromPullpush(url: string, targetSub: string): Promise<SocialPost[]> {
        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(this.timeoutMs),
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                return [];
            }

            const json = (await response.json()) as PullpushResponse;
            return this.parseItems(json.data ?? [], targetSub);
        } catch {
            return [];
        }
    }

    private parseItems(items: PullpushItem[], targetSub: string): SocialPost[] {
        const filtered = items.filter((item) => !item.over_18 && item.title && item.title.length > 15);

        return filtered.map((item) => ({
            id: `reddit-${item.id}`,
            platform: 'reddit',
            author: `u/${item.author}`,
            title: `[r/${item.subreddit || targetSub}] ${item.title}`,
            content: item.selftext || item.title,
            url: item.full_link || (item.permalink ? `https://reddit.com${item.permalink}` : `https://reddit.com/comments/${item.id}`),
            createdAt: item.created_utc ? new Date(item.created_utc * 1000).toISOString() : new Date().toISOString(),
            engagement: {
                score: item.score ?? 0,
                comments: item.num_comments ?? 0
            }
        }));
    }
}
