import type { GscAuthService } from './gsc-auth.service.js';

export interface GscQueryRow {
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

export class GscClient {
    private authService: GscAuthService;

    constructor(authService: GscAuthService) {
        this.authService = authService;
    }

    async queryPerformance(siteUrl: string, startDate: string, endDate: string): Promise<GscQueryRow[]> {
        const token = await this.authService.getAccessToken();
        if (!token) {
            return [];
        }

        const encodedSite = encodeURIComponent(siteUrl);
        const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startDate,
                endDate,
                dimensions: ['page', 'query'],
                rowLimit: 500
            })
        });

        if (!response.ok) {
            return [];
        }

        const data = (await response.json()) as { rows?: GscQueryRow[] };
        return data.rows ?? [];
    }
}
