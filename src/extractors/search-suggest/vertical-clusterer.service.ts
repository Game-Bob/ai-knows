import { knownVerticals } from '../../config/vertical-discovery-seeds.js';

export interface DiscoveredToolInVertical {
    query: string;
    slug: string;
    actionType: string;
}

export interface ProposedNewVertical {
    verticalKey: string;
    suggestedRepoName: string;
    totalOpportunities: number;
    tools: DiscoveredToolInVertical[];
}

export class VerticalClustererService {
    private readonly stopWords = new Set([
        'for', 'the', 'a', 'an', 'to', 'in', 'of', 'and', 'with',
        'calculator', 'online', 'free', 'estimator', 'converter',
        'how', 'calculate', 'chart', 'simulator', 'formula', 'table'
    ]);

    cluster(rawQueries: string[]): ProposedNewVertical[] {
        const clusterMap = new Map<string, DiscoveredToolInVertical[]>();

        for (const query of rawQueries) {
            const domain = this.extractDomainToken(query);
            if (domain && !knownVerticals.has(domain)) {
                if (!clusterMap.has(domain)) {
                    clusterMap.set(domain, []);
                }
                clusterMap.get(domain)!.push(this.mapToTool(query));
            }
        }

        return this.formatAndFilterClusters(clusterMap);
    }

    private extractDomainToken(query: string): string | null {
        const words = query
            .toLowerCase()
            .replace(/[^a-z\s]/g, '')
            .split(/\s+/)
            .filter((w) => w.length > 3 && !this.stopWords.has(w));

        return words.length > 0 ? words[0]! : null;
    }

    private mapToTool(query: string): DiscoveredToolInVertical {
        const slug = query
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const actionType = this.detectActionType(query);

        return { query, slug, actionType };
    }

    private detectActionType(query: string): string {
        const q = query.toLowerCase();
        if (q.includes('convert') || q.includes('to')) return 'converter';
        if (q.includes('estimat')) return 'estimator';
        if (q.includes('simulat')) return 'simulator';
        if (q.includes('chart') || q.includes('table')) return 'chart';
        return 'calculator';
    }

    private formatAndFilterClusters(map: Map<string, DiscoveredToolInVertical[]>): ProposedNewVertical[] {
        const result: ProposedNewVertical[] = [];

        for (const [domain, tools] of map.entries()) {
            const unique = this.deduplicateTools(tools);
            if (unique.length >= 2) {
                result.push({
                    verticalKey: domain,
                    suggestedRepoName: `jjlmoya-utils-${domain}`,
                    totalOpportunities: unique.length,
                    tools: unique
                });
            }
        }

        return result.sort((a, b) => b.totalOpportunities - a.totalOpportunities);
    }

    private deduplicateTools(tools: DiscoveredToolInVertical[]): DiscoveredToolInVertical[] {
        const seen = new Set<string>();
        const unique: DiscoveredToolInVertical[] = [];

        for (const tool of tools) {
            if (!seen.has(tool.slug)) {
                seen.add(tool.slug);
                unique.push(tool);
            }
        }
        return unique;
    }
}
