import { ConsoleLogger } from './core/logging/console-logger.js';
import { FileStorage } from './core/storage/file-storage.js';
import { SitemapParser } from './extractors/sitemap/sitemap-parser.js';
import { TwitterSearchClient } from './extractors/social/clients/twitter-search.client.js';
import { SocialMatcherService } from './extractors/social/social-matcher.service.js';
import { SocialReportFormatter } from './extractors/social/social-report-formatter.js';
import { sitemapTargets } from './config/sitemaps.js';
import { universalCalculationIntents, allCategorySeeds } from './config/social-queries.js';
import type { SocialPost, SocialOpportunity } from './core/contracts/social-post.interface.js';

async function fetchSitemapUrls(parser: SitemapParser): Promise<string[]> {
    const urls: string[] = [];
    for (const target of sitemapTargets) {
        const parsed = await parser.parse(target.url);
        urls.push(...parsed);
    }
    return urls;
}

async function collectUniversalDiscussions(
    twitter: TwitterSearchClient
): Promise<SocialPost[]> {
    const posts: SocialPost[] = [];
    const queries = [
        ...universalCalculationIntents.slice(0, 8),
        ...allCategorySeeds.map((seed) => `calculator ${seed}`)
    ];

    for (const q of queries) {
        const twPosts = await twitter.searchTweets(q);
        posts.push(...twPosts);
        await new Promise((r) => setTimeout(r, 100));
    }

    return posts;
}

async function main(): Promise<void> {
    const logger = new ConsoleLogger();
    const storage = new FileStorage();
    const sitemapParser = new SitemapParser();

    logger.info('Fetching sitemaps across all 38 categories (500+ tools)...');
    const activeUrls = await fetchSitemapUrls(sitemapParser);
    logger.info(`Indexed ${activeUrls.length} total tools in active catalog.`);

    const twitterClient = new TwitterSearchClient();
    const matcher = new SocialMatcherService(activeUrls);
    const formatter = new SocialReportFormatter();

    logger.info('Harvesting live calculation queries across all verticals on X/Twitter...');
    const posts = await collectUniversalDiscussions(twitterClient);
    logger.info(`Collected ${posts.length} discussions across all niches. Matching against full catalog...`);

    const opportunities: SocialOpportunity[] = posts.map((p) => matcher.matchPost(p));

    const trafficReport = formatter.formatTrafficReport(opportunities);
    const requestsReport = formatter.formatRequestsReport(opportunities);

    await storage.write('data/notebooklm/social-traffic-outreach.md', trafficReport);
    await storage.write('data/notebooklm/social-tool-requests.md', requestsReport);

    logger.info('Generated: data/notebooklm/social-traffic-outreach.md');
    logger.info('Generated: data/notebooklm/social-tool-requests.md');
}

main().catch((err) => {
    console.error('[FATAL] Social listener failed:', err);
    process.exit(1);
});
