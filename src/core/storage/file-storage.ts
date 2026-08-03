import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { IStorage } from '../contracts/storage.interface.js';

export class FileStorage implements IStorage {
    async write(filePath: string, content: string): Promise<void> {
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, content, 'utf-8');
    }

    async read(filePath: string): Promise<string> {
        return readFile(filePath, 'utf-8');
    }

    async exists(filePath: string): Promise<boolean> {
        try {
            await access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}
