import type { ISuggestClient } from '../../core/contracts/suggest-client.interface.js';
import type { CategorySeedConfig } from '../../config/suggest-seeds.js';

export interface RawDiscoveredQuery {
    query: string;
    category: string;
    seedOrigin: string;
    sourceClient: string;
}

export class SuggestExpanderService {
    private readonly client: ISuggestClient;
    private readonly concurrency: number;
    private readonly delayMs: number;

    constructor(client: ISuggestClient, concurrency: number = 4, delayMs: number = 75) {
        this.client = client;
        this.concurrency = concurrency;
        this.delayMs = delayMs;
    }

    async expandCategory(categoryConfig: CategorySeedConfig, modifiers: string[]): Promise<RawDiscoveredQuery[]> {
        const queryList = this.buildCandidateQueries(categoryConfig, modifiers);
        const results: RawDiscoveredQuery[] = [];
        const seen = new Set<string>();

        for (let i = 0; i < queryList.length; i += this.concurrency) {
            const chunk = queryList.slice(i, i + this.concurrency);
            const chunkResults = await Promise.all(
                chunk.map((item) => this.fetchQuerySuggestions(item, categoryConfig.category))
            );

            this.collectUniqueResults(chunkResults.flat(), seen, results);
            if (i + this.concurrency < queryList.length && this.delayMs > 0) {
                await new Promise((resolve) => setTimeout(resolve, this.delayMs));
            }
        }

        return results;
    }

    private buildCandidateQueries(config: CategorySeedConfig, modifiers: string[]): string[] {
        const candidates: string[] = [];
        for (const seed of config.seeds) {
            for (const modifier of modifiers) {
                candidates.push(`${seed} ${modifier}`.trim());
            }
        }
        return candidates;
    }

    private async fetchQuerySuggestions(query: string, category: string): Promise<RawDiscoveredQuery[]> {
        const suggestions = await this.client.getSuggestions(query);
        return suggestions.map((suggestion) => ({
            query: suggestion,
            category,
            seedOrigin: query,
            sourceClient: this.client.name
        }));
    }

    private collectUniqueResults(
        items: RawDiscoveredQuery[],
        seen: Set<string>,
        destination: RawDiscoveredQuery[]
    ): void {
        for (const item of items) {
            const normalized = item.query.toLowerCase().trim();
            if (!seen.has(normalized)) {
                seen.add(normalized);
                destination.push(item);
            }
        }
    }
}
