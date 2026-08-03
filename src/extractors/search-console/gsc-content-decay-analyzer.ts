import type { GscQueryRow } from './gsc-client.js';

export interface DecayItem {
    query: string;
    pageUrl: string;
    previousClicks: number;
    currentClicks: number;
    clickDrop: number;
    previousImpressions: number;
    currentImpressions: number;
    impressionDrop: number;
}

export class GscContentDecayAnalyzer {
    analyze(currentRows: GscQueryRow[], previousRows: GscQueryRow[]): DecayItem[] {
        const prevMap = new Map<string, GscQueryRow>(
            previousRows.map((row) => [`${row.keys[0] ?? ''}::${row.keys[1] ?? ''}`, row])
        );

        const decayItems: DecayItem[] = [];

        for (const currRow of currentRows) {
            const key = `${currRow.keys[0] ?? ''}::${currRow.keys[1] ?? ''}`;
            const prevRow = prevMap.get(key);
            if (prevRow) {
                const item = this.createDecayItem(currRow, prevRow);
                if (item) {
                    decayItems.push(item);
                }
            }
        }

        return decayItems.sort((a, b) => b.impressionDrop - a.impressionDrop).slice(0, 20);
    }

    private createDecayItem(currRow: GscQueryRow, prevRow: GscQueryRow): DecayItem | null {
        const clickDrop = prevRow.clicks - currRow.clicks;
        const impressionDrop = prevRow.impressions - currRow.impressions;

        if (impressionDrop > 5 || clickDrop > 0) {
            return {
                query: currRow.keys[1] ?? '',
                pageUrl: currRow.keys[0] ?? '',
                previousClicks: prevRow.clicks,
                currentClicks: currRow.clicks,
                clickDrop,
                previousImpressions: prevRow.impressions,
                currentImpressions: currRow.impressions,
                impressionDrop
            };
        }
        return null;
    }
}
