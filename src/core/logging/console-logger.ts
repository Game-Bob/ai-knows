import type { ILogger } from './logger.interface.js';

export class ConsoleLogger implements ILogger {
    info(message: string): void {
        console.log(`[INFO] ${message}`);
    }

    error(message: string, error?: unknown): void {
        console.error(`[ERROR] ${message}`, error ?? '');
    }
}
