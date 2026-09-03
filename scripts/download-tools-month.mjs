import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog } from './tool-catalog.mjs';
import { addDays, createCsv, defaultWindow, downloadToolsWeek, resolveCloudflareToken } from './download-tools-week.mjs';

export { addDays, createCsv, defaultWindow, downloadToolsWeek, resolveCloudflareToken };

export async function downloadToolsMonth({ month, output = path.resolve('data/tools-monthly/months'), projectRoot = process.cwd(), token } = {}) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error(`Mes inválido: ${month}. Usa YYYY-MM.`);
    const start = `${month}-01`;
    const nextMonth = new Date(`${start}T00:00:00Z`);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    const end = nextMonth.toISOString().slice(0, 10);
    const catalog = buildCatalog({ projectRoot });
    if (!catalog.length) throw new Error('No se ha encontrado catálogo en ../jjlmoya-utils-*.');
    const stagedFiles = [];
    for (let from = start; from < end; from = addDays(from, 7)) {
        const to = addDays(from, 7) < end ? addDays(from, 7) : end;
        const result = await downloadToolsWeek({ from, to, output: path.join(output, 'weekly-staging'), projectRoot, token });
        stagedFiles.push(result.file);
    }
    const weeklyFiles = await Promise.all(stagedFiles.map((file) => readFile(file, 'utf8')));
    const lines = weeklyFiles.flatMap((text) => text.trim().split('\n').slice(1));
    await mkdir(output, { recursive: true });
    const header = weeklyFiles[0]?.split('\n')[0] ?? createCsv([]).trim();
    const file = path.join(output, `${month}.csv`);
    await writeFile(file, `${header}\n${lines.join('\n')}\n`);
    return { file, month, rows: lines.length };
}

function parseArgs() {
    const month = process.argv.find((value) => /^\d{4}-\d{2}$/.test(value)) ?? new Date().toISOString().slice(0, 7);
    const outputIndex = process.argv.indexOf('--output');
    return { month, output: path.resolve(outputIndex >= 0 ? process.argv[outputIndex + 1] ?? 'data/tools-monthly/months' : 'data/tools-monthly/months') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    const result = await downloadToolsMonth(parseArgs());
    console.log(`CSV mensual creado en ${result.file}`);
}
