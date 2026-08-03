import type { IExporter } from '../../core/contracts/exporter.interface.js';
import type { KnowledgeItem } from '../../core/contracts/knowledge-item.interface.js';
import type { IStorage } from '../../core/contracts/storage.interface.js';
import type { MarkdownFormatter } from './markdown-formatter.js';

export class NotebookLMExporter implements IExporter {
    readonly name = 'notebooklm-exporter';
    private storage: IStorage;
    private formatter: MarkdownFormatter;
    private outputDir: string;

    constructor(storage: IStorage, formatter: MarkdownFormatter, outputDir: string = 'data/notebooklm') {
        this.storage = storage;
        this.formatter = formatter;
        this.outputDir = outputDir;
    }

    async export(items: KnowledgeItem[]): Promise<void> {
        for (const item of items) {
            const domain = (item.metadata['domain'] as string) ?? 'default';
            const cleanDomain = domain.toLowerCase().replace(/^www\./, '').replace(/[^a-z0-9.]/g, '-');
            const fileName = `${cleanDomain}-${item.source}.md`;
            const filePath = `${this.outputDir}/${fileName}`;
            const content = this.formatter.formatItem(item);

            await this.storage.write(filePath, content);
        }
    }
}
