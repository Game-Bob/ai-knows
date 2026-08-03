import type { GscQueryRow } from './gsc-client.js';

export interface OpportunityItem {
    query: string;
    pageUrl: string;
    clicks: number;
    impressions: number;
    position: number;
    ctr: number;
}

export interface BusinessOpportunityReport {
    lowHangingFruit: OpportunityItem[];
    highTraffic: OpportunityItem[];
}

export class GscOpportunityAnalyzer {
    analyze(rows: GscQueryRow[]): BusinessOpportunityReport {
        const items = rows.map((row) => this.mapRow(row));

        const lowHangingFruit = items
            .filter((i) => i.position >= 8 && i.position <= 25)
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 15);

        const highTraffic = items
            .filter((i) => i.clicks > 0 || i.impressions >= 5)
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 15);

        return { lowHangingFruit, highTraffic };
    }

    private mapRow(row: GscQueryRow): OpportunityItem {
        return {
            pageUrl: row.keys[0] ?? '',
            query: row.keys[1] ?? '',
            clicks: row.clicks,
            impressions: row.impressions,
            position: Math.round(row.position * 10) / 10,
            ctr: Math.round(row.ctr * 10000) / 100
        };
    }
}
