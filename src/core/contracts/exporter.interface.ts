import type { KnowledgeItem } from './knowledge-item.interface.js';

export interface IExporter {
    name: string;
    export(items: KnowledgeItem[]): Promise<void>;
}
