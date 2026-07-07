import type { TextDownloader } from "./types.js";

export const httpTextDownloader: TextDownloader = {
    async download(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Could not download ${url}: ${response.status} ${response.statusText}`);
        }

        return response.text();
    }
};
