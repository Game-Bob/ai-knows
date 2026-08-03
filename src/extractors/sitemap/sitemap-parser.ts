export class SitemapParser {
    async parse(sitemapUrl: string): Promise<string[]> {
        try {
            const response = await fetch(sitemapUrl);
            if (!response.ok) {
                return [];
            }
            const xml = await response.text();

            if (xml.includes('<sitemapindex')) {
                const subSitemaps = this.extractUrls(xml, 'sitemap');
                const results = await Promise.all(
                    subSitemaps.map((subUrl) => this.parse(subUrl))
                );
                return results.flat();
            }

            return this.extractUrls(xml, 'url');
        } catch {
            return [];
        }
    }

    private extractUrls(xml: string, parentTag: string): string[] {
        const regex = new RegExp(`<${parentTag}[^>]*>[\\s\\S]*?<loc>(.*?)</loc>[\\s\\S]*?</${parentTag}>`, 'gi');
        const urls: string[] = [];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(xml)) !== null) {
            if (match[1]) {
                urls.push(match[1].trim());
            }
        }
        return urls;
    }
}
