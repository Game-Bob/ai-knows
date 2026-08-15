import { ConsoleLogger } from './core/logging/console-logger.js';
import { FileStorage } from './core/storage/file-storage.js';
import { SitemapParser } from './extractors/sitemap/sitemap-parser.js';
import { RedditSearchClient } from './extractors/social/clients/reddit-search.client.js';
import { TwitterSearchClient } from './extractors/social/clients/twitter-search.client.js';
import { SocialMatcherService } from './extractors/social/social-matcher.service.js';
import { SocialReportFormatter } from './extractors/social/social-report-formatter.js';
import { sitemapTargets } from './config/sitemaps.js';
import { targetSubreddits } from './config/social-queries.js';
import type { SocialPost, SocialOpportunity } from './core/contracts/social-post.interface.js';

async function fetchSitemapUrls(parser: SitemapParser): Promise<string[]> {
    const urls: string[] = [];
    for (const target of sitemapTargets) {
        const parsed = await parser.parse(target.url);
        urls.push(...parsed);
    }
    return urls;
}

async function collectTargetedPosts(
    reddit: RedditSearchClient,
    twitter: TwitterSearchClient
): Promise<SocialPost[]> {
    const posts: SocialPost[] = [];

    for (const sub of targetSubreddits.slice(0, 10)) {
        const subPosts = await reddit.searchSubreddit(sub, 'calculator');
        posts.push(...subPosts);
        await new Promise((r) => setTimeout(r, 120));
    }

    const twitterKeywords = ['drone battery calculator', 'espresso ratio calculator', 'audio delay calculator'];
    for (const q of twitterKeywords) {
        const twPosts = await twitter.searchTweets(q);
        posts.push(...twPosts);
        await new Promise((r) => setTimeout(r, 150));
    }

    return posts;
}

async function main(): Promise<void> {
    const logger = new ConsoleLogger();
    const storage = new FileStorage();
    const sitemapParser = new SitemapParser();

    logger.info('Fetching sitemaps for social matching...');
    const activeUrls = await fetchSitemapUrls(sitemapParser);

    const redditClient = new RedditSearchClient();
    const twitterClient = new TwitterSearchClient();
    const matcher = new SocialMatcherService(activeUrls);
    const formatter = new SocialReportFormatter();

    logger.info('Listening to targeted technical subreddits and X discussions...');
    const posts = await collectTargetedPosts(redditClient, twitterClient);
    logger.info(`Collected ${posts.length} clean technical posts. Matching against your tools...`);

    const opportunities: SocialOpportunity[] = posts.map((p) => matcher.matchPost(p));
    const content = formatter.formatMarkdown(opportunities);

    await storage.write('data/notebooklm/social-opportunities.md', content);
    logger.info('Clean social report generated in data/notebooklm/social-opportunities.md');
}

main().catch((err) => {
    console.error('[FATAL] Social listener failed:', err);
    process.exit(1);
});
