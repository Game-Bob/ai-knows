import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { createCatalogRows, buildReportModel, buildTimelineRows, loadInputRows } from './monthly-tools-report.mjs';
import { addDays, defaultWindow, downloadToolsWeek } from './download-tools-week.mjs';
import { defaultSearchWindow, syncCachedSearchConsole, syncSearchConsole } from './sync-search-console.mjs';
import { createDashboardHtml } from './tools-dashboard.mjs';

const port = Number(process.env.PORT ?? 4173);
const projectRoot = process.cwd();
const weekDir = path.resolve('data/tools-monthly/weeks');
const syncMarkerFile = path.resolve('data/tools-monthly/.sync-state.json');
const syncHours = 24;
const syncInterval = syncHours * 60 * 60 * 1000;
let syncPromise;
let lastSync = null;
let lastSyncError = null;
const sourceRowsCache = new Map();
let catalogRowsCache;

function localDay(date = new Date()) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

async function automaticSyncAlreadyDone() {
    try {
        const marker = JSON.parse(await readFile(syncMarkerFile, 'utf8'));
        return marker.day === localDay();
    } catch {
        return false;
    }
}

async function markAutomaticSync() {
    await writeFile(syncMarkerFile, JSON.stringify({ day: localDay(), updatedAt: new Date().toISOString() }) + '\n');
}

function send(response, status, body, contentType) {
    response.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    response.end(body);
}

function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}

function windowFile(from) {
    return path.join(weekDir, `${from}.csv`);
}

async function isFresh(file) {
    try {
        const info = await stat(file);
        return Date.now() - info.mtimeMs < syncInterval;
    } catch {
        return false;
    }
}

async function syncSources(force = false) {
    if (syncPromise) return syncPromise;
    if (!force && await automaticSyncAlreadyDone()) return { skipped: true, reason: 'daily-limit' };
    syncPromise = (async () => {
        lastSyncError = null;
        const errors = [];
        const rememberError = (source, error) => errors.push(`${source}: ${error instanceof Error ? error.message : String(error)}`);
        const cloudflareWindow = defaultWindow();
        const previousWindow = { from: addDays(cloudflareWindow.from, -7), to: cloudflareWindow.from };
        const cloudflareWindows = [cloudflareWindow];
        if (!(await isFresh(windowFile(previousWindow.from)))) cloudflareWindows.unshift(previousWindow);
        const cloudflareResults = [];
        for (const window of cloudflareWindows) {
            if (!force && await isFresh(windowFile(window.from))) continue;
            try {
                cloudflareResults.push(await downloadToolsWeek({ ...window, projectRoot }));
            } catch (error) {
                rememberError('Cloudflare', error);
            }
        }
        let searchConsoleResult = null;
        try {
            const searchWindow = defaultSearchWindow();
            const file = path.resolve('data/tools-monthly/search-console', `${searchWindow.from}.csv`);
            if (force || !(await isFresh(file))) searchConsoleResult = await syncSearchConsole({ ...searchWindow, projectRoot });
            if (searchConsoleResult?.errors?.length) {
                errors.push(...searchConsoleResult.errors);
                // If one property is unavailable, refresh the local cache too
                // so the global view keeps the last known data for that domain.
                await syncCachedSearchConsole({ projectRoot });
            }
        } catch (error) {
            rememberError('Search Console', error);
            try {
                searchConsoleResult = await syncCachedSearchConsole({ projectRoot });
            } catch (fallbackError) {
                rememberError('Search Console fallback', fallbackError);
            }
        }
        lastSyncError = errors.length ? errors.join(' · ') : null;
        if (cloudflareResults.length || searchConsoleResult) lastSync = new Date().toISOString();
        await markAutomaticSync();
        return { cloudflare: cloudflareResults, searchConsole: searchConsoleResult };
    })().finally(() => {
        syncPromise = undefined;
    });
    return syncPromise;
}

async function readModel(metric, source, force = false) {
    if (force) await syncSources(true);
    else void syncSources().catch((error) => { lastSyncError = error instanceof Error ? error.message : String(error); });
    const sourceCacheKey = `${source}:${lastSync ?? 'filesystem'}`;
    const cached = sourceRowsCache.get(source);
    if (!cached || cached.key !== sourceCacheKey) {
        try {
            sourceRowsCache.set(source, { key: sourceCacheKey, rows: await loadInputRows(undefined, source) });
        } catch {
            sourceRowsCache.set(source, { key: sourceCacheKey, rows: [] });
        }
    }
    const month = currentMonth();
    if (!catalogRowsCache || catalogRowsCache.month !== month) catalogRowsCache = { month, rows: createCatalogRows(month, projectRoot) };
    const sourceRows = sourceRowsCache.get(source)?.rows ?? [];
    const rows = sourceRows.length ? sourceRows : catalogRowsCache.rows;
    const catalogRows = catalogRowsCache.rows;
    return { model: { ...buildReportModel([...rows, ...catalogRows], metric), timeline: buildTimelineRows(sourceRows), source, sourceAvailable: sourceRows.length > 0 }, meta: { lastSync, lastSyncError, autoSync: true, syncEveryHours: syncHours } };
}

const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    if (url.pathname === '/' || url.pathname === '/index.html') return send(response, 200, createDashboardHtml(), 'text/html; charset=utf-8');
    if (url.pathname === '/health') return send(response, 200, JSON.stringify({ ok: true, syncing: Boolean(syncPromise), lastSync, lastSyncError }), 'application/json; charset=utf-8');
    if (url.pathname === '/api/data') {
        try {
            const source = url.searchParams.get('source') ?? 'cloudflare';
            const metric = url.searchParams.get('metric') ?? (source === 'search-console' ? 'search_clicks' : 'pageviews');
            const allowedSources = ['cloudflare', 'search-console'];
            const allowed = ['pageviews', 'visits', 'requests', 'search_clicks', 'search_impressions'];
            if (!allowedSources.includes(source)) return send(response, 400, JSON.stringify({ ok: false, error: 'Fuente no válida' }), 'application/json; charset=utf-8');
            if (source === 'cloudflare' && !['pageviews', 'visits', 'requests'].includes(metric)) return send(response, 400, JSON.stringify({ ok: false, error: 'Cloudflare solo admite pageviews, visitas y requests' }), 'application/json; charset=utf-8');
            if (source === 'search-console' && !['search_clicks', 'search_impressions'].includes(metric)) return send(response, 400, JSON.stringify({ ok: false, error: 'Search Console solo admite clics e impresiones' }), 'application/json; charset=utf-8');
            if (!allowed.includes(metric)) return send(response, 400, JSON.stringify({ ok: false, error: 'Métrica no válida' }), 'application/json; charset=utf-8');
            const result = await readModel(metric, source, url.searchParams.get('refresh') === '1');
            return send(response, 200, JSON.stringify({ ok: true, ...result }), 'application/json; charset=utf-8');
        } catch (error) {
            return send(response, 422, JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }), 'application/json; charset=utf-8');
        }
    }
    return send(response, 404, 'Not found', 'text/plain; charset=utf-8');
});

server.listen(port, '127.0.0.1', () => {
    console.log(`Tools Pulse disponible en http://127.0.0.1:${port}`);
    console.log(`Sincronización automática: una vez al día; el botón manual fuerza una actualización.`);
    void syncSources().catch((error) => { lastSyncError = error instanceof Error ? error.message : String(error); });
});

const timer = setInterval(() => {
    void syncSources().catch((error) => { lastSyncError = error instanceof Error ? error.message : String(error); });
}, syncInterval);
timer.unref();
