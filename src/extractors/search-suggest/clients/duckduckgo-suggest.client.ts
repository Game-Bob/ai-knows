import type { ISuggestClient } from '../../../core/contracts/suggest-client.interface.js';

interface DuckDuckGoItem {
    phrase: string;
}

export class DuckDuckGoSuggestClient implements ISuggestClient {
    readonly name = 'duckduckgo-suggest';
    private readonly timeoutMs: number;

    constructor(timeoutMs: number = 5000) {
        this.timeoutMs = timeoutMs;
    }

    async getSuggestions(query: string): Promise<string[]> {
        const trimmed = query.trim();
        if (!trimmed) {
            return [];
        }

        try {
            const url = `https://duckduckgo.com/ac/?q=${encodeURIComponent(trimmed)}&type=list`;
            const response = await fetch(url, {
                signal: AbortSignal.timeout(this.timeoutMs),
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (!response.ok) {
                return [];
            }

            const data = (await response.json()) as unknown;
            return this.parseSuggestions(data);
        } catch {
            return [];
        }
    }

    private parseSuggestions(data: unknown): string[] {
        if (!Array.isArray(data)) {
            return [];
        }
        if (data.length >= 2 && Array.isArray(data[1])) {
            return (data[1] as unknown[])
                .filter((item): item is string => typeof item === 'string')
                .map((item) => item.trim())
                .filter(Boolean);
        }
        return data
            .map((item) => (typeof item === 'object' && item && 'phrase' in item ? (item as DuckDuckGoItem).phrase : ''))
            .filter((phrase): phrase is string => Boolean(phrase && phrase.trim()));
    }
}
