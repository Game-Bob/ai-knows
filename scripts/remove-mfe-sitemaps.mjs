import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = resolve(join(fileURLToPath(import.meta.url), '..', '..'));
const workspaceRoot = resolve(scriptRoot, '..');
const apply = process.argv.includes('--apply');
const repoFlagIndex = process.argv.indexOf('--repo');
const requestedRepo = repoFlagIndex === -1 ? undefined : process.argv[repoFlagIndex + 1];

const log = (message) => console.log(`[remove-mfe-sitemaps] ${message}`);
const fail = (message) => {
  console.error(`[remove-mfe-sitemaps] ${message}`);
  process.exitCode = 1;
};

const repoDirectories = requestedRepo
  ? [resolve(scriptRoot, requestedRepo)]
  : readdirSync(workspaceRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith('jjlmoya-utils-'))
      .map((entry) => join(workspaceRoot, entry.name));

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 4)}\n`);

const removeSitemapRoutes = (wranglerPath) => {
  if (!existsSync(wranglerPath)) return { before: 0, after: 0 };
  const config = readJson(wranglerPath);
  const routes = Array.isArray(config.routes) ? config.routes : [];
  const retainedRoutes = routes.filter(({ pattern = '' }) => !pattern.includes('/_utilities/') || !pattern.endsWith('/sitemap.xml'));
  if (apply && retainedRoutes.length !== routes.length) writeJson(wranglerPath, { ...config, routes: retainedRoutes });
  return { before: routes.length, after: retainedRoutes.length };
};

const removePostbuild = (packagePath) => {
  if (!existsSync(packagePath)) return false;
  const packageJson = readJson(packagePath);
  if (packageJson.scripts?.postbuild !== 'node scripts/postbuild.mjs') return false;
  if (apply) {
    const scripts = { ...packageJson.scripts };
    delete scripts.postbuild;
    writeJson(packagePath, { ...packageJson, scripts });
  }
  return true;
};

const removeWorkerSitemapCache = (workerPath) => {
  if (!existsSync(workerPath)) return false;
  const source = readFileSync(workerPath, 'utf8');
  const transformed = source
    .replace(/\nexport const SITEMAP_CACHE = [^;]+;/, '')
    .replace(/\n    if \(pathname\.endsWith\("\/sitemap\.xml"\)\) return SITEMAP_CACHE;/, '');
  if (transformed === source) return false;
  if (apply) writeFileSync(workerPath, transformed);
  return true;
};

const removeSitemapCacheTest = (testPath) => {
  if (!existsSync(testPath)) return false;
  const source = readFileSync(testPath, 'utf8');
  const transformed = source
    .replace(', SITEMAP_CACHE', '')
    .replace(/\n    it\("keeps sitemaps refreshable", \(\) => \{\n        expect\(getCacheControl\("\/_utilities\/en\/[^\"]+\/sitemap\.xml"\)\)\.toBe\(SITEMAP_CACHE\);\n    \}\);/, '');
  if (transformed === source) return false;
  if (apply) writeFileSync(testPath, transformed);
  return true;
};

const filesToDelete = [
  'scripts/postbuild.mjs',
  'src/pages/mfe-sitemaps/[locale]/[vertical]/sitemap.xml.ts',
];

let processed = 0;
let totalBefore = 0;
let totalAfter = 0;

for (const repoRoot of repoDirectories) {
  const packagePath = join(repoRoot, 'package.json');
  const wranglerPath = join(repoRoot, 'wrangler.jsonc');
  if (!existsSync(packagePath) || !existsSync(wranglerPath)) continue;
  const packageJson = readJson(packagePath);
  if (!packageJson.name?.startsWith('@jjlmoya/utils-')) continue;

  const routeCounts = removeSitemapRoutes(wranglerPath);
  const postbuildRemoved = removePostbuild(packagePath);
  const workerCacheRemoved = removeWorkerSitemapCache(join(repoRoot, 'src/worker.ts'));
  const cacheTestUpdated = removeSitemapCacheTest(join(repoRoot, 'src/tests/mfe_cache_contract.test.ts'));
  const deleted = [];
  for (const relativePath of filesToDelete) {
    const path = join(repoRoot, relativePath);
    if (!existsSync(path)) continue;
    deleted.push(relativePath);
    if (apply) unlinkSync(path);
  }

  processed += 1;
  totalBefore += routeCounts.before;
  totalAfter += routeCounts.after;
  log(`${packageJson.name}: ${routeCounts.before} -> ${routeCounts.after} routes`);
  if (postbuildRemoved) log(`  ${packageJson.name}: postbuild ${apply ? 'eliminado' : 'a eliminar'}`);
  if (workerCacheRemoved) log(`  ${packageJson.name}: cache de sitemap ${apply ? 'eliminado' : 'a eliminar'} del worker`);
  if (cacheTestUpdated) log(`  ${packageJson.name}: contrato de cache ${apply ? 'actualizado' : 'a actualizar'}`);
  if (deleted.length > 0) log(`  ${packageJson.name}: ${deleted.join(', ')} ${apply ? 'eliminados' : 'a eliminar'}`);
}

if (processed === 0) {
  fail('no se encontraron repositorios jjlmoya-utils-* con wrangler.jsonc');
  process.exit();
}

log(`${apply ? 'Aplicado' : 'Dry run'}: ${processed} repos, ${totalBefore - totalAfter} routes de sitemap liberables`);
if (!apply) log('Usa --apply para escribir los cambios.');
