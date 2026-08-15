import { describe, expect, it } from 'vitest';
import { SitemapMatcherService } from '../../src/extractors/search-suggest/sitemap-matcher.service.js';

describe('SitemapMatcherService', () => {
    const urls = [
        'https://www.gamebob.dev/en/tools/drone-battery-c-rating-calculator',
        'https://www.gamebob.dev/en/tools/espresso-brew-ratio-calculator',
        'https://jjlmoya.es/es/herramientas/calculadora-anion-gap'
    ];

    const matcher = new SitemapMatcherService(urls);

    it('identifies exact slug matches as covered', () => {
        expect(matcher.isCovered('drone-battery-c-rating-calculator')).toBe(true);
        expect(matcher.isCovered('drone battery c rating calculator')).toBe(true);
    });

    it('identifies high token overlap matches as covered', () => {
        expect(matcher.isCovered('drone battery c rating calc')).toBe(true);
        expect(matcher.isCovered('espresso brew ratio calc')).toBe(true);
    });

    it('identifies unaddressed queries as not covered', () => {
        expect(matcher.isCovered('blood splatter angle calculator')).toBe(false);
        expect(matcher.isCovered('game loop delta time estimator')).toBe(false);
        expect(matcher.isCovered('3d printer nozzle flow rate calc')).toBe(false);
    });
});
