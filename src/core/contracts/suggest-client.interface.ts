export interface ISuggestClient {
    readonly name: string;
    getSuggestions(query: string): Promise<string[]>;
}
