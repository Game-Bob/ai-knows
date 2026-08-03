import type { GscQueryRow } from './gsc-client.js';

export interface CannibalizationGroup {
    query: string;
    urls: Array<{ url: string; clicks: number; impressions: number; position: number }>;
    totalClicks: number;
    totalImpressions: number;
}

export class GscCannibalizationAnalyzer {
    analyze(rows: GscQueryRow[]): CannibalizationGroup[] {
        const map = this.groupRowsByQuery(rows);
        const groups: CannibalizationGroup[] = [];

        for (const [query, urls] of map.entries()) {
            if (urls.length > 1) {
                const totalClicks = urls.reduce((acc, curr) => acc + curr.clicks, 0);
                const totalImpressions = urls.reduce((acc, curr) => acc + curr.impressions, 0);
                groups.push({ query, urls: urls.sort((a, b) => b.impressions - a.impressions), totalClicks, totalImpressions });
            }
        }

        return groups.sort((a, b) => b.totalImpressions - a.totalImpressions).slice(0, 20);
    }

    private groupRowsByQuery(rows: GscQueryRow[]) {
        const map = new Map<string, Array<{ url: string; clicks: number; impressions: number; position: number }>>();
        for (const row of rows) {
            const pageUrl = row.keys[0];
            const query = row.keys[1];
            if (!query || !pageUrl) {
                continue;
            }
            if (!map.has(query)) {
                map.set(query, []);
            }
            const list = map.get(query)!;
            if (!list.some((item) => item.url === pageUrl)) {
                list.push({ url: pageUrl, clicks: row.clicks, impressions: row.impressions, position: Math.round(row.position * 10) / 10 });
            }
        }
        return map;
    }
}
