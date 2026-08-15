import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GoogleSuggestClient } from '../../src/extractors/search-suggest/clients/google-suggest.client.js';

describe('GoogleSuggestClient', () => {
    let client: GoogleSuggestClient;

    beforeEach(() => {
        client = new GoogleSuggestClient(1000);
        vi.restoreAllMocks();
    });

    it('returns empty array when query is empty', async () => {
        const result = await client.getSuggestions('   ');
        expect(result).toEqual([]);
    });

    it('parses valid suggestions from Google suggest payload', async () => {
        const mockPayload = [
            'drone battery',
            ['drone battery calculator', 'drone battery c rating', 'drone battery life tester']
        ];

        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayload
        } as Response);

        const result = await client.getSuggestions('drone battery');
        expect(result).toEqual([
            'drone battery calculator',
            'drone battery c rating',
            'drone battery life tester'
        ]);
    });

    it('handles network error gracefully and returns empty array', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
        const result = await client.getSuggestions('drone battery');
        expect(result).toEqual([]);
    });
});
