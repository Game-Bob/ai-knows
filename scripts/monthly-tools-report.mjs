import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog } from './tool-catalog.mjs';

export const DATA_DIR = path.resolve('data/tools-monthly');
export const INPUT_DIR = path.join(DATA_DIR, 'months');
export const WEEK_DIR = path.join(DATA_DIR, 'weeks');
export const SEARCH_CONSOLE_DIR = path.join(DATA_DIR, 'search-console');
export const SEARCH_CONSOLE_HISTORY_DIR = path.join(DATA_DIR, 'search-console-history');
export const OUTPUT_DIR = path.join(DATA_DIR, 'reports');

const REQUIRED_FIELDS = ['month', 'domain', 'language', 'category', 'tool_id', 'tool_name', 'slug', 'pageviews', 'visits', 'requests'];
const NUMBER_FIELDS = new Set(['pageviews', 'visits', 'requests', 'search_clicks', 'search_impressions', 'search_ctr', 'search_position']);

export function createCatalogRows(month, projectRoot = process.cwd()) {
    return buildCatalog({ projectRoot }).map((entry) => ({
        month, source: 'catalog', domain: entry.domain, language: entry.language,
        category: entry.categoryName ?? entry.category, category_id: entry.categoryId ?? entry.category,
        category_name: entry.categoryName ?? entry.category, tool_key: entry.toolKey ?? `${entry.repository}/${entry.toolId}`,
        tool_id: entry.toolId, tool_name: entry.toolName, slug: entry.slug, pageviews: 0, visits: 0, requests: 0,
        search_clicks: 0, search_impressions: 0, search_ctr: 0, search_position: 0, available: true
    }));
}

export function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
        const character = text[index];
        if (quoted) {
            if (character === '"' && text[index + 1] === '"') {
                field += '"';
                index += 1;
            } else if (character === '"') {
                quoted = false;
            } else {
                field += character;
            }
        } else if (character === '"' && field.length === 0) {
            quoted = true;
        } else if (character === ',') {
            row.push(field);
            field = '';
        } else if (character === '\n') {
            row.push(field.replace(/\r$/, ''));
            if (row.some((value) => value !== '')) rows.push(row);
            row = [];
            field = '';
        } else {
            field += character;
        }
    }
    if (field || row.length) {
        row.push(field.replace(/\r$/, ''));
        if (row.some((value) => value !== '')) rows.push(row);
    }
    if (rows.length === 0) return [];
    const headers = rows[0].map((header) => header.trim());
    return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function number(value, field, source) {
    const parsed = Number(value ?? 0);
    if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`${source}: ${field} debe ser un número >= 0`);
    return parsed;
}

export function normalizeRows(rows, source = 'datos') {
    return rows.map((raw, index) => {
        for (const field of REQUIRED_FIELDS) {
            if (raw[field] === undefined || raw[field] === '') throw new Error(`${source}, fila ${index + 2}: falta ${field}`);
        }
        if (!/^\d{4}-\d{2}$/.test(raw.month)) throw new Error(`${source}, fila ${index + 2}: month debe tener formato YYYY-MM`);
        const normalized = Object.fromEntries(Object.entries(raw).filter(([key]) => !key.startsWith('__')));
        for (const field of NUMBER_FIELDS) normalized[field] = number(raw[field], field, `${source}, fila ${index + 2}`);
        normalized.month = raw.month;
        normalized.domain = raw.domain.toLowerCase();
        normalized.language = raw.language.toLowerCase();
        normalized.tool_id = raw.tool_id;
        normalized.tool_name = raw.tool_name;
        normalized.slug = raw.slug;
        normalized.tool_key = raw.tool_key || `${normalized.category}/${normalized.tool_id}`;
        normalized.category_id = raw.category_id || normalized.category;
        normalized.category_name = raw.category_name || normalized.category;
        normalized.source = raw.source || 'cloudflare';
        normalized.available = raw.available === undefined || raw.available === '' ? true : raw.available !== 'false';
        return normalized;
    });
}

function keyFor(row) {
    return [row.domain, row.language, row.tool_key ?? row.tool_id].join('|');
}

function metricValue(row, metric) {
    return row[metric] ?? 0;
}

export function buildTimelineRows(rows) {
    const grouped = new Map();
    for (const row of rows) {
        const periodStart = row.period_start || `${row.month}-01`;
        const key = `${periodStart}|${keyFor(row)}`;
        const existing = grouped.get(key);
        if (!existing) grouped.set(key, { ...row, period_start: periodStart });
        else for (const field of NUMBER_FIELDS) existing[field] += row[field];
    }
    return [...grouped.values()].sort((left, right) => `${left.period_start}|${keyFor(left)}`.localeCompare(`${right.period_start}|${keyFor(right)}`));
}

function sumRows(rows) {
    return rows.reduce((result, row) => {
        for (const field of NUMBER_FIELDS) result[field] += row[field];
        return result;
    }, Object.fromEntries([...NUMBER_FIELDS].map((field) => [field, 0])));
}

function percentChange(current, previous) {
    if (previous === 0) return current === 0 ? 0 : null;
    return ((current - previous) / previous) * 100;
}

function monthBefore(month) {
    const date = new Date(`${month}-01T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() - 1);
    return date.toISOString().slice(0, 7);
}

function statusFor(row, previous, firstActiveMonth, metric) {
    const current = metricValue(row, metric);
    const previousValue = previous ? metricValue(previous, metric) : 0;
    if (current === 0) return 'sin datos';
    if (firstActiveMonth === row.month) return 'nueva';
    if (!previous) return 'sin comparación';
    if (current > previousValue) return 'crece';
    if (current < previousValue) return 'decrece';
    return 'estable';
}

export function buildReportModel(rows, metric = 'pageviews') {
    if (!NUMBER_FIELDS.has(metric)) throw new Error(`Métrica no válida: ${metric}.`);
    const groupedRows = new Map();
    for (const row of rows) {
        const key = `${keyFor(row)}|${row.month}`;
        const existing = groupedRows.get(key);
        if (!existing) {
            groupedRows.set(key, { ...row });
        } else {
            for (const field of NUMBER_FIELDS) existing[field] += row[field];
        }
    }
    const reportRows = [...groupedRows.values()].sort((left, right) => `${left.month}|${keyFor(left)}`.localeCompare(`${right.month}|${keyFor(right)}`));
    const months = [...new Set(reportRows.map((row) => row.month))].sort();
    const rowsByKeyAndMonth = new Map(reportRows.map((row) => [`${keyFor(row)}|${row.month}`, row]));
    const historyByKey = new Map();
    for (const row of reportRows) historyByKey.set(keyFor(row), [...(historyByKey.get(keyFor(row)) ?? []), row]);
    const firstActive = new Map([...historyByKey.entries()].map(([key, entries]) => [key, entries.filter((row) => metricValue(row, metric) > 0).sort((left, right) => left.month.localeCompare(right.month))[0]?.month]));
    const enrichedRows = reportRows.map((row) => {
        const previous = rowsByKeyAndMonth.get(`${keyFor(row)}|${monthBefore(row.month)}`);
        const currentValue = metricValue(row, metric);
        const previousValue = previous ? metricValue(previous, metric) : 0;
        return {
            ...row,
            previousValue,
            delta: currentValue - previousValue,
            changePercent: percentChange(currentValue, previousValue),
            status: statusFor(row, previous, firstActive.get(keyFor(row)), metric),
            comparisonMonth: previous ? monthBefore(row.month) : null
        };
    });
    const monthTotals = months.map((month) => {
        const monthRows = reportRows.filter((row) => row.month === month);
        const totals = sumRows(monthRows);
        const previousMonth = monthBefore(month);
        const previousRows = reportRows.filter((row) => row.month === previousMonth);
        const previousByKey = new Map(previousRows.map((row) => [keyFor(row), row]));
        const currentMetric = totals[metric];
        const previousMetric = sumRows(previousRows)[metric];
        const activeRows = monthRows.filter((row) => metricValue(row, metric) > 0);
        const newKeys = new Set(activeRows.filter((row) => !historyByKey.get(keyFor(row))?.some((item) => item.month < month && metricValue(item, metric) > 0)).map(keyFor));
        const growingKeys = new Set(activeRows.filter((row) => previousByKey.get(keyFor(row)) && metricValue(row, metric) > metricValue(previousByKey.get(keyFor(row)), metric)).map(keyFor));
        const decliningKeys = new Set(monthRows.filter((row) => previousByKey.get(keyFor(row)) && metricValue(row, metric) < metricValue(previousByKey.get(keyFor(row)), metric)).map(keyFor));
        return {
            month,
            ...totals,
            tools: new Set(monthRows.filter((row) => metricValue(row, metric) > 0).map((row) => keyFor(row))).size,
            newTools: newKeys.size,
            grows: growingKeys.size,
            declines: decliningKeys.size,
            changePercent: percentChange(currentMetric, previousMetric)
        };
    });
    const latestMonth = months.at(-1) ?? '';
    const latestRows = enrichedRows.filter((row) => row.month === latestMonth);
    const latestTotals = sumRows(latestRows);
    return { metric, months, rows: enrichedRows, monthTotals, latestMonth, latestTotals };
}

function csvValue(value) {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createCsv(model) {
    const headers = ['month', 'domain', 'language', 'category', 'tool_id', 'tool_name', 'slug', 'pageviews', 'visits', 'requests', 'status', 'delta', 'change_percent', 'comparison_month'];
    const lines = [headers.join(',')];
    for (const row of model.rows) lines.push([
        row.month, row.domain, row.language, row.category, row.tool_id, row.tool_name, row.slug,
        row.pageviews, row.visits, row.requests, row.status, row.delta,
        row.changePercent === null ? '' : row.changePercent.toFixed(2), row.comparisonMonth ?? ''
    ].map(csvValue).join(','));
    return `${lines.join('\n')}\n`;
}

function escapeHtml(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function formatNumber(value) {
    return Number(value ?? 0).toLocaleString('es-ES', { maximumFractionDigits: 0 });
}

function formatPercent(value) {
    if (value === null) return '—';
    return `${value >= 0 ? '+' : ''}${value.toLocaleString('es-ES', { maximumFractionDigits: 1 })}%`;
}

function statusClass(status) {
    return status.replaceAll(' ', '-');
}

function renderRows(model) {
    return model.rows.map((row) => `<tr data-month="${escapeHtml(row.month)}" data-domain="${escapeHtml(row.domain)}" data-language="${escapeHtml(row.language)}" data-category="${escapeHtml(row.category)}" data-status="${escapeHtml(row.status)}" data-tool-id="${escapeHtml(row.tool_id)}" data-metric-value="${row[model.metric]}" data-search="${escapeHtml(`${row.tool_name} ${row.tool_id} ${row.slug}`.toLowerCase())}">
        <td>${escapeHtml(row.month)}</td><td>${escapeHtml(row.tool_name)}<small>${escapeHtml(row.tool_id)}</small></td><td>${escapeHtml(row.domain)}</td><td>${escapeHtml(row.language)}</td><td>${escapeHtml(row.category)}</td><td class="number metric" data-value="${row.pageviews}">${formatNumber(row.pageviews)}</td><td class="number" data-value="${row.visits}">${formatNumber(row.visits)}</td><td class="number" data-value="${row.requests}">${formatNumber(row.requests)}</td><td class="number delta ${row.delta >= 0 ? 'positive' : 'negative'}" data-value="${row.delta}">${row.delta >= 0 ? '+' : ''}${formatNumber(row.delta)}<small>${formatPercent(row.changePercent)}</small></td><td><span class="status ${statusClass(row.status)}">${escapeHtml(row.status)}</span></td>
    </tr>`).join('');
}

function renderMonthOptions(model) {
    return model.months.map((month) => `<option value="${escapeHtml(month)}">${escapeHtml(month)}</option>`).join('');
}

function renderOptions(values) {
    return [...new Set(values)].sort((left, right) => left.localeCompare(right)).map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
}

export function createHtml(model, generatedAt = new Date().toISOString()) {
    const domains = renderOptions(model.rows.map((row) => row.domain));
    const languages = renderOptions(model.rows.map((row) => row.language));
    const categories = renderOptions(model.rows.map((row) => row.category));
    const statuses = renderOptions(model.rows.map((row) => row.status));
    const monthSummary = model.monthTotals.map((month) => `<tr><td>${escapeHtml(month.month)}</td><td class="number">${formatNumber(month.tools)}</td><td class="number">${formatNumber(month[model.metric])}</td><td class="number">${formatNumber(month.newTools)}</td><td class="number positive">${formatNumber(month.grows)}</td><td class="number negative">${formatNumber(month.declines)}</td><td class="number">${formatPercent(month.changePercent)}</td></tr>`).join('');
    return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe mensual de tools</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172033;background:#f5f7fb;line-height:1.45}*{box-sizing:border-box}body{margin:0}.shell{max-width:1600px;margin:auto;padding:34px 28px 64px}.hero{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:28px}.eyebrow{color:#635bff;font-weight:800;text-transform:uppercase;letter-spacing:.12em;font-size:12px}.hero h1{font-size:clamp(30px,4vw,52px);line-height:1.04;margin:8px 0 12px;letter-spacing:-.04em}.muted,small{color:#6b778c}.hero p{max-width:780px;margin:0}.badge{background:#e9e7ff;color:#4239bf;padding:8px 12px;border-radius:999px;font-weight:700;white-space:nowrap}.cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:24px}.card,.panel{background:white;border:1px solid #e2e7f0;border-radius:18px;box-shadow:0 8px 24px #1d31590d}.card{padding:20px}.card label{font-size:13px;color:#6b778c}.card strong{display:block;font-size:30px;letter-spacing:-.03em;margin-top:6px}.card em{font-style:normal;font-size:13px}.positive{color:#087f5b!important}.negative{color:#b42318!important}.panel{padding:22px;margin-top:18px}.panel h2{margin:0 0 5px;font-size:21px}.filters{display:grid;grid-template-columns:1.6fr repeat(5,1fr);gap:10px;margin-top:17px}.filters label{font-size:12px;color:#6b778c;font-weight:700}.filters input,.filters select{display:block;width:100%;margin-top:5px;padding:11px 10px;border:1px solid #d6dce8;border-radius:10px;background:#fff;color:#172033;font:inherit}.table-wrap{overflow:auto;margin:0 -22px;padding:0 22px}.table-wrap table{min-width:1100px}.table-note{margin:12px 0 0;color:#6b778c;font-size:13px}table{border-collapse:collapse;width:100%;margin-top:16px}th,td{padding:11px 10px;border-bottom:1px solid #edf0f5;text-align:left;white-space:nowrap}th{font-size:12px;color:#6b778c;text-transform:uppercase;letter-spacing:.04em;position:sticky;top:0;background:#fff;cursor:pointer}td small{display:block;font-size:11px}.number{text-align:right;font-variant-numeric:tabular-nums}.status{display:inline-block;border-radius:999px;padding:4px 9px;font-size:12px;font-weight:800;background:#edf0f5}.status.nueva{background:#e5f7ef;color:#087f5b}.status.crece{background:#e5f7ef;color:#087f5b}.status.decrece{background:#fff0ee;color:#b42318}.status.estable{background:#eef2f7;color:#516075}.status.sin-datos{background:#f1f3f6;color:#718096}.status.sin-comparación{background:#fff6dd;color:#8a5b00}.summary-table td:first-child{font-weight:700}.hidden{display:none}.legend{display:flex;gap:12px;flex-wrap:wrap;margin:12px 0;color:#6b778c;font-size:13px}.legend span{display:inline-flex;align-items:center;gap:6px}.dot{width:9px;height:9px;border-radius:50%;display:inline-block}.dot.green{background:#087f5b}.dot.red{background:#b42318}.dot.yellow{background:#d89b00}@media(max-width:900px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.filters{grid-template-columns:repeat(2,minmax(0,1fr))}.filters label:first-child{grid-column:1/-1}.hero{display:block}.badge{display:inline-block;margin-top:16px}}@media(max-width:520px){.shell{padding:24px 14px 48px}.cards{gap:8px}.card{padding:14px}.card strong{font-size:24px}.filters{display:block}.filters label{display:block;margin-top:9px}}
</style></head><body><main class="shell"><header class="hero"><div><div class="eyebrow">GameBob Studio · inteligencia mensual</div><h1>Qué tools están funcionando</h1><p class="muted">Comparativa de tráfico por tool, dominio, idioma y categoría. Las variaciones se calculan contra el mes anterior disponible.</p></div><div class="badge">Último mes: ${escapeHtml(model.latestMonth || 'sin datos')}</div></header>
<section class="cards"><article class="card"><label>Tools con actividad</label><strong id="kpi-tools">${formatNumber(model.monthTotals.at(-1)?.tools ?? 0)}</strong><em class="muted">según los filtros</em></article><article class="card"><label>${escapeHtml(model.metric)}</label><strong id="kpi-metric">${formatNumber(model.latestTotals[model.metric])}</strong><em class="muted">total según los filtros</em></article><article class="card"><label>Nuevas con tráfico</label><strong class="positive" id="kpi-new">${formatNumber(model.monthTotals.at(-1)?.newTools ?? 0)}</strong><em class="muted">primera actividad histórica</em></article><article class="card"><label>Crece / decrece</label><strong><span class="positive" id="kpi-grows">${formatNumber(model.monthTotals.at(-1)?.grows ?? 0)}</span> <span class="muted">/</span> <span class="negative" id="kpi-declines">${formatNumber(model.monthTotals.at(-1)?.declines ?? 0)}</span></strong><em class="muted">frente al mes anterior</em></article></section>
<section class="panel"><h2>Filtros</h2><div class="filters"><label>Buscar tool<input id="search" type="search" placeholder="nombre, id o slug"></label><label>Mes<select id="month"><option value="">Todos</option>${renderMonthOptions(model)}</select></label><label>Dominio<select id="domain"><option value="">Todos</option>${domains}</select></label><label>Idioma<select id="language"><option value="">Todos</option>${languages}</select></label><label>Categoría<select id="category"><option value="">Todas</option>${categories}</select></label><label>Estado<select id="status"><option value="">Todos</option>${statuses}</select></label></div><div class="legend"><span><i class="dot green"></i> crece / nueva</span><span><i class="dot red"></i> decrece</span><span><i class="dot yellow"></i> sin comparación</span><span id="visible-count"></span></div></section>
<section class="panel"><h2>Evolución mensual</h2><p class="muted">La métrica principal del informe es <strong>${escapeHtml(model.metric)}</strong>. Puedes descargar el CSV generado para análisis adicionales.</p><div class="table-wrap"><table class="summary-table"><thead><tr><th>Mes</th><th>Tools activas</th><th>${escapeHtml(model.metric)}</th><th>Nuevas</th><th>Crece</th><th>Decrece</th><th>Variación total</th></tr></thead><tbody>${monthSummary}</tbody></table></div></section>
<section class="panel"><h2>Detalle por tool</h2><p class="table-note">Ordena cualquier columna haciendo clic en su encabezado. “Nueva” significa primera actividad registrada en todos los meses cargados.</p><div class="table-wrap"><table id="tools-table"><thead><tr><th data-sort="text">Mes</th><th data-sort="text">Tool</th><th data-sort="text">Dominio</th><th data-sort="text">Idioma</th><th data-sort="text">Categoría</th><th data-sort="number">Pageviews</th><th data-sort="number">Visitas</th><th data-sort="number">Requests</th><th data-sort="number">Δ vs anterior</th><th data-sort="text">Estado</th></tr></thead><tbody>${renderRows(model)}</tbody></table></div></section>
<footer class="muted" style="padding-top:22px;font-size:13px">Generado el ${escapeHtml(generatedAt)} · Fuente: archivos mensuales añadidos a <code>data/tools-monthly/months/</code>.</footer></main>
<script>
const controls=['search','month','domain','language','category','status'].map(id=>document.getElementById(id));const rows=[...document.querySelectorAll('#tools-table tbody tr')];const count=document.getElementById('visible-count');const latestMonth='${escapeHtml(model.latestMonth)}';
function updateKpis(month){const current=rows.filter(row=>!row.classList.contains('hidden')&&row.dataset.month===month);const active=current.filter(row=>Number(row.dataset.metricValue)>0);const tools=new Set(active.map(row=>row.dataset.domain+'|'+row.dataset.language+'|'+row.dataset.toolId));const metric=active.reduce((total,row)=>total+Number(row.dataset.metricValue),0);const statusTools=(status)=>new Set(active.filter(row=>row.dataset.status===status).map(row=>row.dataset.domain+'|'+row.dataset.language+'|'+row.dataset.toolId)).size;document.getElementById('kpi-tools').textContent=tools.size.toLocaleString('es-ES');document.getElementById('kpi-metric').textContent=metric.toLocaleString('es-ES');document.getElementById('kpi-new').textContent=statusTools('nueva').toLocaleString('es-ES');document.getElementById('kpi-grows').textContent=statusTools('crece').toLocaleString('es-ES');document.getElementById('kpi-declines').textContent=statusTools('decrece').toLocaleString('es-ES')}
function filter(){const [search,month,domain,language,category,status]=controls.map(c=>c.value.toLowerCase());let visible=0;for(const row of rows){const ok=(!search||row.dataset.search.includes(search))&&(!month||row.dataset.month===month)&&(!domain||row.dataset.domain===domain)&&(!language||row.dataset.language===language)&&(!category||row.dataset.category===category)&&(!status||row.dataset.status===status);row.classList.toggle('hidden',!ok);if(ok)visible+=1}count.textContent=visible+' filas visibles';updateKpis(month||latestMonth)}controls.forEach(c=>c.addEventListener('input',filter));filter();
document.querySelectorAll('#tools-table th').forEach((header,index)=>header.addEventListener('click',()=>{const numeric=header.dataset.sort==='number';const body=header.closest('table').querySelector('tbody');const ordered=[...body.rows].sort((a,b)=>{const left=a.cells[index].dataset.value??a.cells[index].innerText;const right=b.cells[index].dataset.value??b.cells[index].innerText;return numeric?Number(right)-Number(left):left.localeCompare(right,'es')});ordered.forEach(row=>body.append(row))}));
</script></body></html>`;
}

async function rowsFromDirectory(directory) {
    try {
        const files = (await readdir(directory, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith('.csv')).sort((left, right) => left.name.localeCompare(right.name));
        const rows = [];
        for (const file of files) rows.push(...normalizeRows(parseCsv(await readFile(path.join(directory, file.name), 'utf8')), `${path.basename(directory)}/${file.name}`));
        return rows;
    } catch (error) {
        if (error?.code === 'ENOENT') return [];
        throw error;
    }
}

export async function loadInputRows(inputDir = INPUT_DIR, source = 'all') {
    const directories = inputDir === INPUT_DIR ? [INPUT_DIR, WEEK_DIR, SEARCH_CONSOLE_DIR, SEARCH_CONSOLE_HISTORY_DIR] : [inputDir];
    let rows = (await Promise.all(directories.map((directory) => rowsFromDirectory(directory)))).flat()
        .filter((row) => source === 'all' || (source === 'cloudflare' && row.source === 'cloudflare') || (source === 'search-console' && row.source.startsWith('search-console')));
    if (source === 'search-console') {
        // Prefer one authoritative export per domain/month. Daily history wins;
        // otherwise a live query with activity wins over the cached fallback.
        const grouped = new Map();
        for (const row of rows) {
            const key = `${row.domain}|${row.month}`;
            const bucket = grouped.get(key) ?? new Map();
            const sourceRows = bucket.get(row.source) ?? [];
            sourceRows.push(row);
            bucket.set(row.source, sourceRows);
            grouped.set(key, bucket);
        }
        const selected = new Map();
        for (const [key, bucket] of grouped) {
            if (bucket.has('search-console-history')) selected.set(key, 'search-console-history');
            else {
                const live = bucket.get('search-console') ?? [];
                const liveActivity = live.reduce((sum, row) => sum + row.search_clicks + row.search_impressions, 0);
                selected.set(key, liveActivity > 0 || !bucket.has('search-console-cache') ? 'search-console' : 'search-console-cache');
            }
        }
        rows = rows.filter((row) => selected.get(`${row.domain}|${row.month}`) === row.source);
    }
    if (rows.length === 0) throw new Error(`No hay datos sincronizados en ${DATA_DIR}. El servidor intentará recoger Cloudflare y Search Console automáticamente.`);
    return rows;
}

function parseArgs() {
    const args = new Map();
    for (let index = 2; index < process.argv.length; index += 1) {
        const value = process.argv[index];
        if (value?.startsWith('--')) {
            const [key, argument] = value.split('=', 2);
            args.set(key, argument ?? process.argv[index + 1]);
        }
    }
    return { input: path.resolve(args.get('--input') ?? INPUT_DIR), output: path.resolve(args.get('--output') ?? OUTPUT_DIR), metric: args.get('--metric') ?? 'pageviews' };
}

export async function generateReport({ inputDir = INPUT_DIR, outputDir = OUTPUT_DIR, metric = 'pageviews' } = {}) {
    if (!NUMBER_FIELDS.has(metric)) throw new Error(`Métrica no válida: ${metric}.`);
    const rows = await loadInputRows(inputDir);
    const model = buildReportModel(rows, metric);
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, 'tools-monthly-report.html'), createHtml(model));
    await writeFile(path.join(outputDir, 'tools-monthly-report.csv'), createCsv(model));
    await writeFile(path.join(outputDir, 'tools-monthly-report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), ...model }, null, 2));
    return { outputDir, model };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    const args = parseArgs();
    const result = await generateReport(args);
    console.log(`Informe creado en ${result.outputDir}`);
    console.log(`Meses: ${result.model.months.join(', ')}`);
    console.log(`Último mes: ${result.model.latestMonth} · ${result.model.latestTotals[args.metric].toLocaleString('es-ES')} ${args.metric}`);
}
