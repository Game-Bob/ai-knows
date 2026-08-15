import { describe, expect, it } from 'vitest';
import { SocialMatcherService } from '../../src/extractors/social/social-matcher.service.js';
import type { SocialPost } from '../../src/core/contracts/social-post.interface.js';

describe('SocialMatcherService', () => {
    const urls = [
        'https://www.gamebob.dev/en/tools/drone-battery-c-rating-calculator',
        'https://jjlmoya.es/es/herramientas/calculadora-tasa-c-bateria-lipo-dron',
        'https://www.gamebob.dev/en/tools/espresso-brew-ratio-calculator'
    ];

    const matcher = new SocialMatcherService(urls);

    it('matches post with existing tool and crafts helpful reply', () => {
        const post: SocialPost = {
            id: 'post-1',
            platform: 'reddit',
            author: 'u/fpv_pilot',
            title: 'How to calculate real drone battery c rating without false sticker claims?',
            content: 'I need to know my actual continuous discharge current for high kv motors.',
            url: 'https://reddit.com/r/fpv/12345',
            createdAt: new Date().toISOString(),
            engagement: { score: 10, comments: 5 }
        };

        const opportunity = matcher.matchPost(post);

        expect(opportunity.isNewToolIdea).toBe(false);
        expect(opportunity.matchedTool).toBeDefined();
        expect(opportunity.matchedTool?.slug).toBe('drone-battery-c-rating-calculator');
        expect(opportunity.suggestedReply).toContain('drone-battery-c-rating-calculator');
    });

    it('marks unmatched discussion as new tool idea', () => {
        const post: SocialPost = {
            id: 'post-2',
            platform: 'twitter',
            author: '@aquarist',
            title: 'Looking for a reef tank water salinity refractor calibration tool',
            content: 'Tired of checking paper charts for refractive index.',
            url: 'https://x.com/aquarist/status/98765',
            createdAt: new Date().toISOString(),
            engagement: { score: 2, comments: 1 }
        };

        const opportunity = matcher.matchPost(post);

        expect(opportunity.isNewToolIdea).toBe(true);
        expect(opportunity.matchedTool).toBeUndefined();
    });
});
