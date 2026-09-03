import { writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { buildCatalog, formatCatalogSummary } from './tool-catalog.mjs';

function parseArgs() {
    const date = process.argv.slice(2).find((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)) ?? new Date().toISOString().slice(0, 10);
    const json = process.argv.includes('--json');
    return { date, json };
}

const { date, json } = parseArgs();
const catalog = buildCatalog({ date, includeRoutes: false });
const summary = formatCatalogSummary(catalog);
const byCategory = Object.groupBy(catalog, (entry) => entry.category);

if (json) {
    process.stdout.write(`${JSON.stringify({ date, summary, catalog }, null, 2)}\n`);
} else {
    console.log(`Tools disponibles a ${date}`);
    console.log(`Total de tools: ${summary.tools}`);
    console.log('');
    console.log('Por categoría:');
    for (const [category, entries] of Object.entries(byCategory).sort(([left], [right]) => left.localeCompare(right))) {
        const tools = new Set(entries.map((entry) => entry.toolId));
        console.log(`- ${category}: ${tools.size} tools`);
    }
    console.log('');
    console.log('La fecha refleja el último commit disponible hasta las 23:59:59. Es una foto del repositorio, no una confirmación del despliegue en Cloudflare.');
}

if (process.argv.includes('--output')) {
    const outputIndex = process.argv.indexOf('--output');
    const output = process.argv[outputIndex + 1];
    if (output) await writeFile(path.resolve(output), `${JSON.stringify({ date, summary, catalog }, null, 2)}\n`);
}
