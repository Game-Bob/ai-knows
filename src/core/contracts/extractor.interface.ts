import type { KnowledgeItem } from './knowledge-item.interface.js';

export interface IExtractor {
    name: string;
    extract(): Promise<KnowledgeItem[]>;
}
