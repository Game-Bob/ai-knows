import type { KnowledgeItem } from '../../core/contracts/knowledge-item.interface.js';

export class MarkdownFormatter {
    formatItem(item: KnowledgeItem): string {
        const lines: string[] = [
            `# ${item.title}`,
            `**Source:** ${item.source}`,
            `**Generated At:** ${item.extractedAt}`,
            '---',
            '',
            item.content
        ];

        return lines.join('\n');
    }
}
