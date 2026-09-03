import { mkdir, readdir, stat } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { addDays, validateDate } from './download-tools-week.mjs';
import { SEARCH_CONSOLE_HISTORY_DIR, syncSearchConsoleHistory } from './sync-search-console.mjs';

export const DEFAULT_HISTORY_FROM = '2025-12-01';

export function historyWindow(now = new Date()) {
    const today = now.toISOString().slice(0, 10);
    return { from: process.env.GSC_HISTORY_FROM ?? DEFAULT_HISTORY_FROM, to: process.env.GSC_HISTORY_TO ?? addDays(today, -2) };
}

export async function backfillSearchConsole({ from, to, output = SEARCH_CONSOLE_HISTORY_DIR, projectRoot = process.cwd(), force = false } = {}) {
    validateDate(from);
    validateDate(to);
    await mkdir(output, { recursive: true });
    const existing = new Set();
    if (!force) {
        for (const entry of await readdir(output, { withFileTypes: true })) {
            if (!entry.isFile() || !entry.name.endsWith('.csv')) continue;
            // A previous failed run could leave only the CSV header. Those files
            // are deliberately treated as missing so the backfill repairs them.
            if ((await stat(path.join(output, entry.name))).size > 216) existing.add(entry.name.slice(0, -4));
        }
    }
    const results = [];
    for (let cursor = from; cursor < to; cursor = addDays(cursor, 7)) {
        const end = addDays(cursor, Math.min(7, Math.round((new Date(`${to}T00:00:00Z`) - new Date(`${cursor}T00:00:00Z`)) / 86400000)));
        if (existing.has(cursor)) {
            console.log(`Histórico ya disponible: ${cursor}`);
            continue;
        }
        results.push(await syncSearchConsoleHistory({ from: cursor, to: end, output, projectRoot }));
    }
    return { from, to, output, chunks: results.length, rows: results.reduce((total, result) => total + result.rows, 0), results };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    const window = historyWindow();
    const result = await backfillSearchConsole({ ...window, force: process.env.GSC_HISTORY_FORCE === '1' });
    console.log(`Backfill Search Console terminado: ${result.chunks} bloques, ${result.rows} filas.`);
}
