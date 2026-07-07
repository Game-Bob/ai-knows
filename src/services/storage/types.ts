export type TextWriter = {
    ensureDir(path: string): Promise<void>;
    writeText(path: string, content: string): Promise<void>;
};
