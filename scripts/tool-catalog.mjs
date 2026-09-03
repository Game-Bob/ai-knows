import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import * as path from 'node:path';

export const LOCALE_ROUTES = {
    en: 'utilities',
    fr: 'utilitaires',
    de: 'werkzeuge',
    it: 'utilita',
    pt: 'utilidades',
    nl: 'hulpmiddelen',
    sv: 'verktyg',
    pl: 'narzedzia',
    id: 'utilitas',
    tr: 'araclar',
    ru: 'instrumenty',
    ja: 'utilities',
    ko: 'utilities',
    zh: 'utilities'
};

export const DOMAINS = {
    'jjlmoya.es': { host: 'jjlmoya.es', locales: ['es'], routePrefix: 'utilidades' },
    'gamebob.dev': { host: 'www.gamebob.dev', locales: Object.keys(LOCALE_ROUTES), routePrefix: null }
};

export function listUtilityRepositories(projectRoot = process.cwd()) {
    const parent = path.resolve(projectRoot, '..');
    return readdirSync(parent, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && /^jjlmoya-utils-/.test(entry.name))
        .filter((entry) => !entry.name.includes('-incomplete-') && !entry.name.endsWith('-clean'))
        .map((entry) => ({
            category: entry.name.replace(/^jjlmoya-utils-/, ''),
            path: path.join(parent, entry.name),
            repository: entry.name
        }))
        .sort((left, right) => left.category.localeCompare(right.category));
}

export function gitOutput(repositoryPath, args) {
    try {
        return execFileSync('git', ['-C', repositoryPath, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
        return '';
    }
}

function gitExists(repositoryPath, args) {
    try {
        execFileSync('git', ['-C', repositoryPath, ...args], { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

export function snapshotCommit(repositoryPath, date) {
    if (!date) return gitOutput(repositoryPath, ['rev-parse', 'HEAD']);
    return gitOutput(repositoryPath, ['rev-list', '-1', `--before=${date} 23:59:59`, 'HEAD']);
}

function toolDirectories(repositoryPath, commit) {
    const tree = gitOutput(repositoryPath, ['ls-tree', '-d', '--name-only', `${commit}:src/tool`]);
    return tree.split('\n').filter((name) => name && !name.startsWith('.'));
}

function slugsByTool(repositoryPath, commit) {
    const args = ['grep', '-n', '-E', '^[[:space:]]*(const[[:space:]]+slug[[:space:]]*=|slug[[:space:]]*:)', ...(commit ? [commit] : []), '--', 'src/tool/*/i18n/*.ts'];
    const matches = gitOutput(repositoryPath, args);
    const result = {};
    for (const line of matches.split('\n')) {
        const match = line.match(/^src\/tool\/([^/]+)\/i18n\/([^:]+)\.ts:\d+:[ \t]*(?:const[ \t]+slug[ \t]*=[ \t]*|slug[ \t]*:[ \t]*)['"]([^'"]+)['"]/);
        if (match) result[match[1]] = { ...(result[match[1]] ?? {}), [match[2]]: match[3] };
    }
    return result;
}

function firstCommit(repositoryPath, commit, toolId) {
    return gitOutput(repositoryPath, ['log', '--reverse', '--format=%cI', commit, '--', `src/tool/${toolId}`]).split('\n')[0] ?? '';
}

function humanize(value) {
    return value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function inferCategory(repositoryName) {
    return repositoryName
        .replace(/^jjlmoya-utils-/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function canonicalToolKey(repository, toolId) {
    return `${repository}/${toolId}`;
}

export function buildCatalog({ projectRoot = process.cwd(), date, includeRoutes = true, includePublishedAt = false } = {}) {
    const catalog = [];
    for (const repository of listUtilityRepositories(projectRoot)) {
        const isCurrentSnapshot = !date;
        const commit = isCurrentSnapshot ? '' : snapshotCommit(repository.path, date);
        const sourceRoot = path.join(repository.path, 'src', 'tool');
        if (!isCurrentSnapshot && (!commit || !gitExists(repository.path, ['cat-file', '-e', `${commit}:src/tool`]))) continue;
        const tools = isCurrentSnapshot
            ? (existsSync(sourceRoot) ? readdirSync(sourceRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name) : [])
            : toolDirectories(repository.path, commit);
        const slugs = slugsByTool(repository.path, commit);
        for (const toolId of tools) {
            const categoryId = repository.category;
            const categoryName = inferCategory(repository.repository);
            const toolKey = canonicalToolKey(repository.repository, toolId);
            if (!includeRoutes) {
                catalog.push({ category: categoryId, categoryId, categoryName, repository: repository.repository, toolId, toolKey, toolName: humanize(toolId) });
                continue;
            }
            const localizedSlugs = slugs[toolId] ?? {};
            const localeRoot = path.join(repository.path, 'src', 'tool', toolId, 'i18n');
            const locales = isCurrentSnapshot && existsSync(localeRoot)
                ? readdirSync(localeRoot).filter((file) => file.endsWith('.ts')).map((file) => path.basename(file, '.ts')).filter((locale) => locale !== 'index')
                : Object.keys(localizedSlugs);
            const publishedAt = includePublishedAt ? firstCommit(repository.path, commit, toolId) : '';
            for (const [domain, domainConfig] of Object.entries(DOMAINS)) {
                for (const language of domainConfig.locales) {
                    if (!locales.includes(language)) continue;
                    // GameBob localizes the utility segment itself. Its public
                    // URLs are /utilitas/..., /werkzeuge/..., /utilities/...
                    // without a duplicated /<language>/ prefix.
                    const routeSegment = domain === 'jjlmoya.es' ? domainConfig.routePrefix : LOCALE_ROUTES[language];
                    const slug = localizedSlugs[language] ?? toolId;
                    catalog.push({
                        category: repository.category,
                        categoryId,
                        categoryName,
                        domain,
                        language,
                        publishedAt,
                        repository: repository.repository,
                        route: `/${routeSegment}/${slug}/`,
                        slug,
                        toolId,
                        toolKey,
                        toolName: humanize(toolId)
                    });
                }
            }
        }
    }
    return catalog.sort((left, right) => `${left.domain}/${left.language}/${left.category}/${left.toolId}`.localeCompare(`${right.domain}/${right.language}/${right.category}/${right.toolId}`));
}

export function formatCatalogSummary(catalog) {
    const tools = new Set(catalog.map((entry) => `${entry.repository}/${entry.toolId}`));
    const byDomain = Object.groupBy(catalog, (entry) => entry.domain);
    return {
        generatedAt: new Date().toISOString(),
        tools: tools.size,
        routes: catalog.length,
        byDomain: Object.fromEntries(Object.entries(byDomain).map(([domain, entries]) => [domain, entries.length]))
    };
}
