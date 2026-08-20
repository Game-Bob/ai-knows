import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as path from 'node:path';

type Metric = { pageViews: number; visits: number; requests: number };
type Segment = 'total' | 'utilities' | 'widgets';
type DailyRecord = {
    date: string;
    domains: Record<string, Record<Segment, Metric>>;
};
type MonthlyMetric = Metric & { days: number };

const GRAPHQL_URL = 'https://api.cloudflare.com/client/v4/graphql';
const OUTPUT_DIR = path.resolve('data/cloudflare-reports');
const HISTORY_FILE = path.join(OUTPUT_DIR, 'daily.json');
const REPORT_FILE = path.join(OUTPUT_DIR, 'traffic-report.html');
const CSV_FILE = path.join(OUTPUT_DIR, 'ethicalads-pageviews.csv');
const JSON_FILE = path.join(OUTPUT_DIR, 'traffic-report.json');
const execAsync = promisify(exec);
let cloudflareTokenPromise: Promise<string> | undefined;

const domains = {
    'jjlmoya.es': {
        zone: process.env['CLOUDFLARE_ZONE_JJLMOYA'] ?? '1bd6edaff67a3572a46bb0a6338a7588',
        hosts: ['jjlmoya.es', 'www.jjlmoya.es'],
        utilities: ['/utilidades%'],
        widgets: ['/widgets%']
    },
    'gamebob.dev': {
        zone: process.env['CLOUDFLARE_ZONE_GAMEBOB'] ?? 'f4d8265b62a839d72cd39c8bf246e120',
        hosts: ['gamebob.dev', 'www.gamebob.dev'],
        utilities: [
            '/en/utilities%',
            '/fr/utilitaires%',
            '/de/werkzeuge%',
            '/it/utilita%',
            '/pt/utilidades%',
            '/nl/hulpmiddelen%',
            '/sv/verktyg%',
            '/pl/narzedzia%',
            '/id/utilitas%',
            '/tr/araclar%',
            '/ru/instrumenty%',
            '/ja/utilities%',
            '/ko/utilities%',
            '/zh/utilities%'
        ],
        widgets: ['/%/widgets%', '/widgets%']
    }
} as const;

type DomainName = keyof typeof domains;

interface GraphqlGroup {
    count?: number | null;
    sum?: { pageViews?: number | null; visits?: number | null; requests?: number | null } | null;
}

interface GraphqlResponse {
    data?: { viewer?: { zones?: Array<{ httpRequestsAdaptiveGroups?: GraphqlGroup[]; httpRequests1dGroups?: GraphqlGroup[] }> } };
    errors?: Array<{ message?: string }>;
}

function utcDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function addDays(date: string, amount: number): string {
    const value = new Date(`${date}T00:00:00.000Z`);
    value.setUTCDate(value.getUTCDate() + amount);
    return utcDate(value);
}

function parseArgs(): { from: string; to: string } {
    const args = new Map<string, string>();
    for (let index = 2; index < process.argv.length; index += 1) {
        const value = process.argv[index];
        if (value?.startsWith('--')) {
            const [key, argument] = value.split('=', 2);
            if (key && argument) args.set(key, argument);
        }
    }

    const today = utcDate(new Date());
    const to = args.get('--to') ?? today;
    const from = args.get('--from') ?? addDays(to, -(Number(args.get('--days') ?? '7')));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from >= to) {
        throw new Error('Usa fechas ISO y un intervalo válido: --from=2026-08-01 --to=2026-08-17');
    }
    return { from, to };
}

function filterFor(domain: DomainName, segment: Segment, start: string, end: string): Record<string, unknown> {
    const config = domains[domain];
    const filter: Record<string, unknown> = {
        AND: [
            { datetime_geq: `${start}T00:00:00Z`, datetime_lt: `${end}T00:00:00Z` },
            { requestSource: 'eyeball' },
            { edgeResponseStatus_geq: 200, edgeResponseStatus_lt: 400 },
            { OR: config.hosts.map((host) => ({ clientRequestHTTPHost: host })) }
        ]
    };
    if (segment !== 'total') {
        const paths = config[segment];
        (filter.AND as Array<Record<string, unknown>>).push({ OR: paths.map((value) => ({ clientRequestPath_like: value })) });
    }
    return filter;
}

async function queryMetric(domain: DomainName, segment: Segment, start: string, end: string): Promise<Metric> {
    const token = await getCloudflareToken();
    if (!token) {
        throw new Error('No se ha encontrado autenticación de Cloudflare. Define CLOUDFLARE_API_TOKEN o ejecuta wrangler login.');
    }

    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `query Traffic($zoneTag: string!, $filter: filter) {
                viewer {
                    zones(filter: { zoneTag: $zoneTag }) {
                        ${segment === 'total' ? 'httpRequests1dGroups(limit: 10, filter: $filter)' : 'httpRequestsAdaptiveGroups(limit: 5000, filter: $filter)'} {
                            ${segment === 'total' ? '' : 'count'}
                            sum { ${segment === 'total' ? 'pageViews requests' : 'visits'} }
                        }
                    }
                }
            }`,
            variables: {
                zoneTag: domains[domain].zone,
                filter: segment === 'total' ? { date: start } : filterFor(domain, segment, start, end)
            }
        })
    });
    const payload = (await response.json()) as GraphqlResponse;
    if (!response.ok || payload.errors?.length) {
        const message = payload.errors?.map((error) => error.message).join('; ') ?? `${response.status} ${response.statusText}`;
        throw new Error(`Cloudflare GraphQL: ${message}`);
    }
    const groups = segment === 'total'
        ? payload.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? []
        : payload.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups ?? [];
    const metric = groups.reduce<Metric>((result, group) => ({
        pageViews: result.pageViews + (group.sum?.pageViews ?? group.count ?? 0),
        visits: result.visits + (group.sum?.visits ?? 0),
        requests: result.requests + (group.sum?.requests ?? group.count ?? 0)
    }), { pageViews: 0, visits: 0, requests: 0 });
    if (segment === 'total') metric.visits = await queryTotalVisits(domain, start, end);
    return metric;
}

async function queryTotalVisits(domain: DomainName, start: string, end: string): Promise<number> {
    const token = await getCloudflareToken();
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `query Visits($zoneTag: string!, $filter: filter) {
                viewer { zones(filter: { zoneTag: $zoneTag }) {
                    httpRequestsAdaptiveGroups(limit: 5000, filter: $filter) { sum { visits } }
                } }
            }`,
            variables: { zoneTag: domains[domain].zone, filter: filterFor(domain, 'total', start, end) }
        })
    });
    const payload = (await response.json()) as GraphqlResponse;
    if (!response.ok || payload.errors?.length) {
        const message = payload.errors?.map((error) => error.message).join('; ') ?? `${response.status} ${response.statusText}`;
        throw new Error(`Cloudflare GraphQL: ${message}`);
    }
    return (payload.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups ?? []).reduce((total, group) => total + (group.sum?.visits ?? 0), 0);
}

async function getCloudflareToken(): Promise<string> {
    cloudflareTokenPromise ??= (async () => {
        const configured = process.env['CLOUDFLARE_API_TOKEN'];
        if (configured) return configured;
        try {
            const result = await execAsync('npx.cmd wrangler auth token --json', { maxBuffer: 1024 * 1024 });
            const jsonStart = result.stdout.indexOf('{');
            if (jsonStart < 0) return '';
            const payload = JSON.parse(result.stdout.slice(jsonStart)) as { token?: string };
            return payload.token ?? '';
        } catch {
            return '';
        }
    })();
    return cloudflareTokenPromise;
}

async function loadHistory(): Promise<DailyRecord[]> {
    try {
        return JSON.parse(await readFile(HISTORY_FILE, 'utf8')) as DailyRecord[];
    } catch {
        return [];
    }
}

async function collect(from: string, to: string): Promise<DailyRecord[]> {
    const history = await loadHistory();
    const byDate = new Map(history.map((record) => [record.date, record]));
    for (let date = from; date < to; date = addDays(date, 1)) {
        const entries = await Promise.all((Object.keys(domains) as DomainName[]).map(async (domain) => [domain, {
            total: await queryMetric(domain, 'total', date, addDays(date, 1)),
            utilities: await queryMetric(domain, 'utilities', date, addDays(date, 1)),
            widgets: await queryMetric(domain, 'widgets', date, addDays(date, 1))
        }] as const));
        const record: DailyRecord = { date, domains: Object.fromEntries(entries) };
        byDate.set(date, record);
        console.log(`Recogido ${date}`);
    }
    return [...byDate.values()].sort((left, right) => left.date.localeCompare(right.date));
}

function aggregateMonthly(history: DailyRecord[]): Record<string, Record<string, Record<Segment, MonthlyMetric>>> {
    const result: Record<string, Record<string, Record<Segment, MonthlyMetric>>> = {};
    for (const record of history) {
        const month = record.date.slice(0, 7);
        result[month] ??= {};
        for (const domain of Object.keys(domains) as DomainName[]) {
            result[month][domain] ??= {
                total: { pageViews: 0, visits: 0, requests: 0, days: 0 },
                utilities: { pageViews: 0, visits: 0, requests: 0, days: 0 },
                widgets: { pageViews: 0, visits: 0, requests: 0, days: 0 }
            };
            for (const segment of ['total', 'utilities', 'widgets'] as Segment[]) {
                const target = result[month][domain][segment];
                const source = record.domains[domain][segment];
                target.pageViews += source.pageViews;
                target.visits += source.visits;
                target.requests += source.requests;
                target.days += 1;
            }
        }
    }
    return result;
}

function escapeCsv(value: string | number): string {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function createCsv(monthly: ReturnType<typeof aggregateMonthly>): string {
    const lines = ['month,domain,total_pageviews,utility_route_hits,widget_route_hits,all_utility_route_hits,cloudflare_visits,days_collected'];
    for (const month of Object.keys(monthly).sort()) {
        for (const domain of Object.keys(domains) as DomainName[]) {
            const values = monthly[month][domain];
            lines.push([
                month,
                domain,
                values.total.pageViews,
                values.utilities.pageViews,
                values.widgets.pageViews,
                values.utilities.pageViews + values.widgets.pageViews,
                values.total.visits,
                values.total.days
            ].map(escapeCsv).join(','));
        }
    }
    return `${lines.join('\n')}\n`;
}

function buildChart(monthly: ReturnType<typeof aggregateMonthly>, domain: DomainName): string {
    const entries = Object.keys(monthly).sort().map((month) => ({
        month,
        value: monthly[month][domain].utilities.pageViews + monthly[month][domain].widgets.pageViews
    }));
    const width = 960;
    const height = 260;
    const max = Math.max(...entries.map((entry) => entry.value), 1);
    const points = entries.map((entry, index) => `${(index / Math.max(entries.length - 1, 1)) * (width - 80) + 40},${height - 30 - (entry.value / max) * (height - 60)}`).join(' ');
    const labels = entries.map((entry, index) => `<text x="${(index / Math.max(entries.length - 1, 1)) * (width - 80) + 40}" y="${height - 8}" text-anchor="middle">${entry.month}</text>`).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Hits de rutas de utilidades de ${domain}"><polyline points="${points}" fill="none" stroke="#635bff" stroke-width="4"/><line x1="40" y1="${height - 30}" x2="${width - 40}" y2="${height - 30}" stroke="#94a3b8"/>${labels}</svg>`;
}

function createHtml(monthly: ReturnType<typeof aggregateMonthly>, generatedAt: string): string {
    const rows = Object.keys(monthly).sort().flatMap((month) => (Object.keys(domains) as DomainName[]).map((domain) => {
        const values = monthly[month][domain];
        const utilityViews = values.utilities.pageViews + values.widgets.pageViews;
        return `<tr><td>${month}</td><td>${domain}</td><td>${values.total.pageViews.toLocaleString('es-ES')}</td><td>${utilityViews.toLocaleString('es-ES')}</td><td>${values.widgets.pageViews.toLocaleString('es-ES')}</td><td>${values.total.visits.toLocaleString('es-ES')}</td><td>${values.total.days}</td></tr>`;
    })).join('');
    const charts = (Object.keys(domains) as DomainName[]).map((domain) => `<section><h2>${domain}</h2>${buildChart(monthly, domain)}</section>`).join('');
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe Cloudflare</title><style>body{font:16px system-ui,sans-serif;max-width:1100px;margin:40px auto;padding:0 20px;color:#172033}svg{width:100%;height:auto;background:#f8fafc;border-radius:12px}table{border-collapse:collapse;width:100%;margin:20px 0}th,td{padding:9px;border-bottom:1px solid #e2e8f0;text-align:right}th:first-child,td:first-child,th:nth-child(2),td:nth-child(2){text-align:left}small{color:#64748b}</style></head><body><h1>Informe de tráfico Cloudflare</h1><p><small>Generado: ${generatedAt}. Pageviews totales = pageViews diarios de Cloudflare. Utilidades/widgets = hits de ruta aproximados. Cloudflare visits no son usuarios únicos.</small></p>${charts}<table><thead><tr><th>Mes</th><th>Dominio</th><th>Pageviews totales</th><th>Hits utilidades + widgets</th><th>Hits widgets</th><th>Visitas CF</th><th>Días</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

const { from, to } = parseArgs();
const history = await collect(from, to);
const monthly = aggregateMonthly(history);
await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
await writeFile(CSV_FILE, createCsv(monthly));
await writeFile(REPORT_FILE, createHtml(monthly, new Date().toISOString()));
await writeFile(JSON_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), from, to, monthly }, null, 2));
console.log(`Informe creado en ${OUTPUT_DIR}`);
