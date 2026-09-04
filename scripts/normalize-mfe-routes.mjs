import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = resolve(join(fileURLToPath(import.meta.url), '..', '..'));
const workspaceRoot = resolve(scriptRoot, '..');
const apply = process.argv.includes('--apply');

const log = (message) => console.log(`[normalize-mfe-routes] ${message}`);
const repositories = readdirSync(workspaceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('jjlmoya-utils-'))
  .map((entry) => join(workspaceRoot, entry.name));
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 4)}\n`);

const isAssetRoute = (pattern) => pattern.includes('/_utilities/');
const compactPattern = (pattern) => {
  if (pattern.endsWith('/*')) return `${pattern.slice(0, -2)}*`;
  if (!pattern.includes('*')) return `${pattern}*`;
  return pattern;
};

let processed = 0;
let changed = 0;
for (const repoRoot of repositories) {
  const packagePath = join(repoRoot, 'package.json');
  const wranglerPath = join(repoRoot, 'wrangler.jsonc');
  if (!existsSync(packagePath) || !existsSync(wranglerPath) || !statSync(repoRoot).isDirectory()) continue;
  const packageJson = readJson(packagePath);
  if (!packageJson.name?.startsWith('@jjlmoya/utils-')) continue;

  const config = readJson(wranglerPath);
  const routes = Array.isArray(config.routes) ? config.routes : [];
  if (routes.length === 0) continue;
  const normalizedCandidates = routes.map((route) => {
    const pattern = route.pattern ?? '';
    return {
      ...route,
      pattern: isAssetRoute(pattern) ? pattern : compactPattern(pattern),
    };
  });
  const seen = new Set();
  const normalizedRoutes = normalizedCandidates.filter((route) => {
    const normalizedPattern = route.pattern ?? '';
    const key = `${route.zone_name ?? ''}\0${normalizedPattern}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const patternChanges = routes.filter(({ pattern = '' }) => !isAssetRoute(pattern) && compactPattern(pattern) !== pattern).length;
  const routeDelta = routes.length - normalizedRoutes.length;
  processed += 1;
  if (patternChanges || routeDelta) {
    changed += 1;
    if (apply) writeJson(wranglerPath, { ...config, routes: normalizedRoutes });
  }
  log(`${packageJson.name}: ${routes.length} -> ${normalizedRoutes.length} rutas; ${patternChanges} patrones compactados${apply ? '' : ' (dry run)'}`);
}

log(`${apply ? 'Aplicado' : 'Dry run'}: ${processed} repos revisados, ${changed} con cambios`);
if (!apply) log('Usa --apply para escribir los cambios.');
