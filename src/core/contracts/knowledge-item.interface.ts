export interface KnowledgeItem {
    id: string;
    source: string;
    title: string;
    url?: string;
    content: string;
    metadata: Record<string, unknown>;
    extractedAt: string;
}
