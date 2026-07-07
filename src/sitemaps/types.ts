export type SitemapSource = {
    url: string;
};

export type SitemapTarget = {
    host: string;
    language: string;
    title: string;
    outputFile: string;
};

export type SitemapEntry = {
    url: string;
    lastModified: string | undefined;
};

export type SitemapDocument = {
    source: SitemapSource;
    target: SitemapTarget;
    entries: SitemapEntry[];
    generatedAt: Date;
};

export type TextDownloader = {
    download(url: string): Promise<string>;
};

export type SitemapJobConfig = {
    sources: SitemapSource[];
    outputDir: string;
};

export type SitemapJobResult = {
    outputFiles: string[];
    totalEntries: number;
};
