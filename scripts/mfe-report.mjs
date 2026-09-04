import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoriesDirectory = resolve(scriptDirectory, '..', '..');
const jsonOutput = process.argv.includes('--json');
const excludedNames = new Map([
  ['shared', 'librería compartida, no es una vertical'],
  ['template', 'plantilla, no es una vertical'],
]);

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return {};
  }
};

const has = (root, ...parts) => existsSync(join(root, ...parts));

const countTools = (root) => {
  const toolsDirectory = join(root, 'src', 'tool');
  if (!existsSync(toolsDirectory)) return 0;
  return readdirSync(toolsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .length;
};

const inspectRepository = (entry) => {
  const name = entry.name.replace(/^jjlmoya-utils-/, '');
  const root = join(repositoriesDirectory, entry.name);
  const gitRepository = has(root, '.git');
  const packageJson = readJson(join(root, 'package.json'));
  const workflowPath = join(root, '.github', 'workflows', 'ci.yml');
  const workflow = existsSync(workflowPath) ? readFileSync(workflowPath, 'utf8') : '';
  const contract = {
    worker: has(root, 'src', 'worker.ts'),
    wrangler: has(root, 'wrangler.jsonc'),
    mfeSource: has(root, 'src', 'mfe'),
    localizedPages: has(root, 'src', 'pages', '[locale]', '[utilities]'),
    mfeSitemap: has(root, 'src', 'pages', 'mfe-sitemaps'),
    deployWorkflow: workflow.includes('wrangler deploy'),
    cloudflareAccountVariable: workflow.includes('secrets.CLOUDFLARE_ACCOUNT_ID'),
  };
  const migrated = Object.values(contract).every(Boolean);
  const excluded = excludedNames.get(name)
    ?? (name.includes('incomplete') ? 'clon incompleto, no es una vertical publicable' : undefined)
    ?? (!gitRepository ? 'no contiene .git, no es un repositorio listo' : undefined);
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  return {
    repository: entry.name,
    gitRepository,
    name,
    tools: countTools(root),
    packageVersion: packageJson.version ?? '—',
    sharedVersion: dependencies['@jjlmoya/utils-shared'] ?? '—',
    migrated,
    excluded: excluded ?? null,
    contract,
  };
};

const repositories = readdirSync(repositoriesDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('jjlmoya-utils-'))
  .map(inspectRepository)
  .sort((left, right) => left.name.localeCompare(right.name));

const verticals = repositories.filter((repository) => !repository.excluded);
const migrated = verticals.filter((repository) => repository.migrated);
const pending = verticals.filter((repository) => !repository.migrated);
const excluded = repositories.filter((repository) => repository.excluded);

if (jsonOutput) {
  console.log(JSON.stringify({ repositories, migrated, pending, excluded }, null, 2));
  process.exit(0);
}

const printSection = (title, items) => {
  console.log(`\n${title} (${items.length})`);
  if (items.length === 0) {
    console.log('- ninguna');
    return;
  }
  for (const item of items) {
    const details = `${item.tools} tools · paquete ${item.packageVersion} · shared ${item.sharedVersion}`;
    console.log(`- ${item.name} — ${details}`);
    if (!item.migrated && !item.excluded) {
      const missing = Object.entries(item.contract)
        .filter(([, present]) => !present)
        .map(([key]) => key)
        .join(', ');
      console.log(`  falta: ${missing}`);
    }
  }
};

console.log(`Inventario MFE en ${repositoriesDirectory}`);
console.log(`Verticales detectadas: ${verticals.length} · tools totales: ${verticals.reduce((total, item) => total + item.tools, 0)}`);
printSection('MIGRADAS A MFE', migrated);
printSection('PENDIENTES DE MIGRAR', pending);
printSection('NO SON VERTICALES PUBLICABLES', excluded);
