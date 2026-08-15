import type { ISuggestClient } from '../../../core/contracts/suggest-client.interface.js';

export class GoogleSuggestClient implements ISuggestClient {
    readonly name = 'google-suggest';
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
            const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(trimmed)}&hl=en`;
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
        if (!Array.isArray(data) || data.length < 2) {
            return [];
        }
        const suggestions = data[1];
        if (!Array.isArray(suggestions)) {
            return [];
        }
        return suggestions
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter(Boolean);
    }
}
