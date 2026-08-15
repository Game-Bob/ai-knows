import type { ProposedNewVertical } from './vertical-clusterer.service.js';

export class VerticalGapAnalyzer {
    formatMarkdown(verticals: ProposedNewVertical[], totalQueriesQueried: number): string {
        const lines: string[] = [
            '# Unexplored Verticals & New Category Discovery Report',
            '',
            `Generated at: ${new Date().toISOString()}`,
            `Total Open Intent Queries Analyzed: ${totalQueriesQueried}`,
            `New Unexplored Verticals Discovered: ${verticals.length}`,
            ''
        ];

        this.appendSummaryTable(lines, verticals);
        this.appendDetailedClusters(lines, verticals);

        return lines.join('\n');
    }

    private appendSummaryTable(lines: string[], verticals: ProposedNewVertical[]): void {
        lines.push(
            '## Executive Summary: New Categories Ranked by Search Demand',
            '',
            '| Proposed Vertical | Target Repo Name | Discovered Tools | Top Starter Opportunity |',
            '| :--- | :--- | :--- | :--- |'
        );

        for (const v of verticals) {
            const starter = v.tools[0] ? `\`${v.tools[0].slug}\`` : 'N/A';
            lines.push(`| **${v.verticalKey}** | \`${v.suggestedRepoName}\` | ${v.totalOpportunities} | ${starter} |`);
        }
        lines.push('', '---', '');
    }

    private appendDetailedClusters(lines: string[], verticals: ProposedNewVertical[]): void {
        lines.push('## Detailed New Vertical Clusters', '');
        for (const v of verticals) {
            lines.push(
                `### Vertical: ${v.verticalKey} (Suggested Repo: \`${v.suggestedRepoName}\`)`,
                `Total High-Demand Tools Detected: ${v.totalOpportunities}`,
                '',
                '| Discovered Search Query | Tool Type | Suggested Slug |',
                '| :--- | :--- | :--- |'
            );

            for (const tool of v.tools) {
                lines.push(`| ${tool.query} | ${tool.actionType} | \`${tool.slug}\` |`);
            }
            lines.push('');
        }
    }
}
