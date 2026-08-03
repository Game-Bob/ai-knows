import type { SitemapTarget } from '../extractors/sitemap/sitemap-extractor.js';

export const sitemapTargets: SitemapTarget[] = [
    {
        domain: 'gamebob.dev',
        language: 'en',
        url: 'https://www.gamebob.dev/sitemap-en.xml'
    },
    {
        domain: 'jjlmoya.es',
        language: 'es',
        url: 'https://jjlmoya.es/sitemap-index.xml'
    }
];

export const sitemapSources = sitemapTargets;
