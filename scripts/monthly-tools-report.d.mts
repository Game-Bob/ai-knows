export type MonthlyInputRow = {
    month: string;
    domain: string;
    language: string;
    category: string;
    tool_id: string;
    tool_name: string;
    slug: string;
    pageviews: number | string;
    visits: number | string;
    requests: number | string;
    search_clicks?: number | string;
    search_impressions?: number | string;
    search_ctr?: number | string;
    search_position?: number | string;
    source?: string;
    tool_key?: string;
    available?: boolean | string;
};

export type ReportRow = MonthlyInputRow & {
    pageviews: number;
    visits: number;
    requests: number;
    search_clicks: number;
    search_impressions: number;
    search_ctr: number;
    search_position: number;
    available: boolean;
    previousValue: number;
    delta: number;
    changePercent: number | null;
    status: string;
    comparisonMonth: string | null;
};

export function createCatalogRows(month: string, projectRoot?: string): MonthlyInputRow[];

export function parseCsv(text: string): Record<string, string>[];
export function normalizeRows(rows: Record<string, string>[], source?: string): MonthlyInputRow[];
export function buildReportModel(rows: MonthlyInputRow[], metric?: 'pageviews' | 'visits' | 'requests' | 'search_clicks' | 'search_impressions'): { rows: ReportRow[]; monthTotals: Array<Record<string, string | number | null>>; months: string[]; latestMonth: string; latestTotals: Record<string, number>; metric: string };
export function createCsv(model: ReturnType<typeof buildReportModel>): string;
export function createHtml(model: ReturnType<typeof buildReportModel>, generatedAt?: string): string;
