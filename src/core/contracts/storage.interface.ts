export interface IStorage {
    write(filePath: string, content: string): Promise<void>;
    read(filePath: string): Promise<string>;
    exists(filePath: string): Promise<boolean>;
}
