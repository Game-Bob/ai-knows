export type ToolIntentType =
    | 'calculator'
    | 'converter'
    | 'generator'
    | 'estimator'
    | 'checker'
    | 'simulator'
    | 'chart'
    | 'timer'
    | 'tester'
    | 'solver'
    | 'general';

export interface SuggestOpportunity {
    query: string;
    category: string;
    intentType: ToolIntentType;
    suggestedSlug: string;
    sourceClient: string;
    isCoveredInSitemap: boolean;
}

export interface CategoryGapSummary {
    category: string;
    totalDiscovered: number;
    uncoveredCount: number;
    opportunities: SuggestOpportunity[];
}

export interface SuggestReportData {
    timestamp: string;
    totalQueried: number;
    totalDiscovered: number;
    totalUncovered: number;
    categories: CategoryGapSummary[];
}
