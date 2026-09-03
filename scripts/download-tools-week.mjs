import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { buildCatalog } from './tool-catalog.mjs';

export const GRAPHQL_URL = 'https://api.cloudflare.com/client/v4/graphql';
export const ZONES = {
    'jjlmoya.es': process.env.CLOUDFLARE_ZONE_JJLMOYA ?? '1bd6edaff67a3572a46bb0a6338a7588',
    'gamebob.dev': process.env.CLOUDFLARE_ZONE_GAMEBOB ?? 'f4d8265b62a839d72cd39c8bf246e120'
};
export const HOSTS = { 'jjlmoya.es': ['jjlmoya.es', 'www.jjlmoya.es'], 'gamebob.dev': ['gamebob.dev', 'www.gamebob.dev'] };
export const WEEK_DIR = path.resolve('data/tools-monthly/weeks');

const execFileAsync = promisify(execFile);
let cachedToken;

export function validateDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Fecha inválida: ${date}. Usa YYYY-MM-DD.`);
    const parsed = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) throw new Error(`Fecha inválida: ${date}.`);
    return date;
}

export function addDays(date, amount) {
    const value = new Date(`${validateDate(date)}T00:00:00Z`);
    value.setUTCDate(value.getUTCDate() + amount);
    return value.toISOString().slice(0, 10);
}

export function defaultWindow(now = new Date()) {
    const today = now.toISOString().slice(0, 10);
    const day = now.getUTCDay();
    const start = addDays(today, -(day === 0 ? 6 : day - 1));
    return { from: start, to: addDays(today, 1) };
}

function routePrefix(row) {
    const firstSegment = row.route.split('/').filter(Boolean)[0];
    return `/${firstSegment}/%`;
}

function filterFor(domain, row, from, to) {
    return {
        AND: [
            { datetime_geq: `${from}T00:00:00Z`, datetime_lt: `${to}T00:00:00Z` },
            { requestSource: 'eyeball' },
            { edgeResponseStatus_geq: 200, edgeResponseStatus_lt: 400 },
            { OR: HOSTS[domain].map((host) => ({ clientRequestHTTPHost: host })) },
            { clientRequestPath_like: routePrefix(row) }
        ]
    };
}

export async function resolveCloudflareToken() {
    const configured = process.env.CLOUDFLARE_API_TOKEN;
    if (configured && configured !== 'replace-with-a-read-only-analytics-token') return configured;
    if (cachedToken !== undefined) return cachedToken;
    for (const command of ['wrangler.cmd', 'npx.cmd']) {
        try {
            const args = command === 'npx.cmd' ? ['wrangler', 'auth', 'token', '--json'] : ['auth', 'token', '--json'];
            const result = await execFileAsync(command, args, { maxBuffer: 1024 * 1024, windowsHide: true });
            const jsonStart = result.stdout.indexOf('{');
            if (jsonStart < 0) continue;
            const payload = JSON.parse(result.stdout.slice(jsonStart));
            if (payload.token) {
                cachedToken = payload.token;
                return cachedToken;
            }
        } catch {
            // Try the next local authentication source.
        }
    }
    cachedToken = '';
    return cachedToken;
}

export async function queryDomainLanguage(token, domain, row, from, to) {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `query UtilityTraffic($zoneTag: string!, $filter: filter) {
                viewer { zones(filter: { zoneTag: $zoneTag }) {
                    httpRequestsAdaptiveGroups(limit: 5000, filter: $filter) {
                        dimensions { clientRequestHTTPHost clientRequestPath }
                        sum { pageViews visits requests }
                        count
                    }
                } }
            }`,
            variables: { zoneTag: ZONES[domain], filter: filterFor(domain, row, from, to) }
        })
    });
    const payload = await response.json();
    if (!response.ok || payload.errors?.length) throw new Error(`Cloudflare ${domain}/${row.language}: ${payload.errors?.map((error) => error.message).join('; ') ?? response.statusText}`);
    return payload.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups ?? [];
}

function normalizePath(value) {
    const clean = String(value ?? '').split('?')[0];
    return clean.endsWith('/') ? clean : `${clean}/`;
}

function csvValue(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createCsv(rows) {
    const headers = ['period_start', 'period_end', 'month', 'source', 'domain', 'language', 'category', 'category_id', 'category_name', 'tool_key', 'tool_id', 'tool_name', 'slug', 'pageviews', 'visits', 'requests', 'search_clicks', 'search_impressions', 'search_ctr', 'search_position', 'available'];
    return `${[headers.join(','), ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(','))].join('\n')}\n`;
}

export async function downloadToolsWeek({ from, to, output = WEEK_DIR, projectRoot = process.cwd(), token } = {}) {
    validateDate(from);
    validateDate(to);
    if (from >= to) throw new Error('El inicio debe ser anterior al final.');
    const days = Math.round((new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000);
    if (days > 7) throw new Error('Cloudflare solo permite consultar como máximo 7 días por ventana.');
    const cloudflareToken = token ?? await resolveCloudflareToken();
    if (!cloudflareToken) throw new Error('No se ha encontrado autenticación de Cloudflare. Define CLOUDFLARE_API_TOKEN o ejecuta wrangler login.');
    const catalog = buildCatalog({ projectRoot });
    if (!catalog.length) throw new Error('No se ha encontrado catálogo en ../jjlmoya-utils-*.');
    const rows = [];
    for (const domain of Object.keys(ZONES)) {
        const languages = [...new Set(catalog.filter((row) => row.domain === domain).map((row) => row.language))];
        for (const language of languages) {
            const catalogRows = catalog.filter((row) => row.domain === domain && row.language === language);
            const groups = await queryDomainLanguage(cloudflareToken, domain, catalogRows[0], from, to);
            const traffic = new Map();
            for (const group of groups) {
                const key = normalizePath(group.dimensions?.clientRequestPath);
                const current = traffic.get(key) ?? { pageviews: 0, visits: 0, requests: 0 };
                current.pageviews += group.sum?.pageViews ?? group.count ?? 0;
                current.visits += group.sum?.visits ?? 0;
                current.requests += group.sum?.requests ?? group.count ?? 0;
                traffic.set(key, current);
            }
            for (const entry of catalogRows) rows.push({
                period_start: from, period_end: to, month: from.slice(0, 7), source: 'cloudflare',
                domain: entry.domain, language: entry.language, category: entry.categoryName ?? entry.category,
                category_id: entry.categoryId ?? entry.category, category_name: entry.categoryName ?? entry.category,
                tool_key: entry.toolKey ?? `${entry.repository}/${entry.toolId}`, tool_id: entry.toolId,
                tool_name: entry.toolName, slug: entry.slug,
                ...(traffic.get(normalizePath(entry.route)) ?? { pageviews: 0, visits: 0, requests: 0 }),
                search_clicks: 0, search_impressions: 0, search_ctr: 0, search_position: 0, available: true
            });
            console.log(`Descargado ${domain}/${language}: ${catalogRows.length} tools, ${groups.length} rutas con actividad`);
        }
    }
    await mkdir(output, { recursive: true });
    const file = path.join(output, `${from}.csv`);
    await writeFile(file, createCsv(rows));
    return { file, from, to, rows: rows.length };
}

function parseArgs() {
    const values = new Map();
    for (let index = 2; index < process.argv.length; index += 1) {
        const value = process.argv[index];
        if (value?.startsWith('--')) {
            const [key, argument] = value.split('=', 2);
            if (key && argument) values.set(key, argument);
        }
    }
    const defaults = defaultWindow();
    return { from: values.get('--from') ?? defaults.from, to: values.get('--to') ?? defaults.to, output: path.resolve(values.get('--output') ?? WEEK_DIR) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    const args = parseArgs();
    const result = await downloadToolsWeek(args);
    console.log(`CSV semanal creado en ${result.file}`);
}
