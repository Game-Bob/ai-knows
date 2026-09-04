import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const argument = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};

const targetPath = argument('--repo');
const referencePath = argument('--reference', '../jjlmoya-utils-tabletop');
const assetSourcePath = argument('--asset-source');
const legacyAssetSourcePath = argument('--legacy-asset-source', '../jjlmoya');
const dryRun = !hasFlag('--apply');
const allowDirty = hasFlag('--allow-dirty');
const allowMissingAssets = hasFlag('--allow-missing-assets');

const fail = (message) => {
  console.error(`migrate-utils-to-mfe: ${message}`);
  process.exitCode = 1;
};

if (!targetPath) {
  fail('usage: node scripts/migrate-utils-to-mfe.mjs --repo ../jjlmoya-utils-civic --reference ../jjlmoya-utils-tabletop [--apply] [--allow-dirty]');
  process.exit();
}

const targetRoot = resolve(scriptRoot, targetPath);
const referenceRoot = resolve(scriptRoot, referencePath);
const assetSourceRoot = resolve(targetRoot, assetSourcePath ?? '../website');
const legacyAssetSourceRoot = resolve(targetRoot, legacyAssetSourcePath);
const targetPackagePath = join(targetRoot, 'package.json');
const referencePackagePath = join(referenceRoot, 'package.json');

if (!existsSync(targetPackagePath) || !existsSync(referencePackagePath)) {
  fail('target and reference must both contain package.json');
  process.exit();
}

const targetPackage = JSON.parse(readFileSync(targetPackagePath, 'utf8'));
const referencePackage = JSON.parse(readFileSync(referencePackagePath, 'utf8'));
const targetName = targetPackage.name ?? '';
const referenceName = referencePackage.name ?? '';

if (!targetName.startsWith('@jjlmoya/utils-') || !referenceName.startsWith('@jjlmoya/utils-')) {
  fail('both packages must be named @jjlmoya/utils-*');
  process.exit();
}

const categoryKey = targetName.slice('@jjlmoya/utils-'.length);
const referenceCategoryKey = referenceName.slice('@jjlmoya/utils-'.length);
if (categoryKey === referenceCategoryKey) {
  fail('target and reference must be different utility verticals');
  process.exit();
}

const gitDirectory = join(targetRoot, '.git');
if (!existsSync(gitDirectory)) {
  fail('target must be a Git repository');
  process.exit();
}

const targetChanges = execFileSync('git', ['status', '--porcelain'], {
  cwd: targetRoot,
  encoding: 'utf8',
}).trim();
if (targetChanges && !allowDirty) {
  fail('target has local changes; review them and rerun with --allow-dirty');
  process.exit();
}

const defaultBranch = (() => {
  try {
    return execFileSync('git', ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD'], {
      cwd: targetRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim().replace(/^origin\//, '');
  } catch {
    return execFileSync('git', ['branch', '--show-current'], {
      cwd: targetRoot,
      encoding: 'utf8',
    }).trim() || 'main';
  }
})();

const read = (path) => readFileSync(path, 'utf8');
const categorySlugFrom = (locale) => {
  const path = join(targetRoot, 'src', 'category', 'i18n', `${locale}.ts`);
  if (!existsSync(path)) return undefined;
  return read(path).match(/(?:const slug\s*=\s*|slug:\s*)['"]([^'"]+)['"]/)?.[1];
};

const englishSlugFrom = (toolDirectory) => {
  const path = join(targetRoot, 'src', 'tool', toolDirectory, 'i18n', 'en.ts');
  if (!existsSync(path)) return undefined;
  return read(path).match(/(?:const slug\s*=\s*|slug:\s*)['"]([^'"]+)['"]/)?.[1];
};

const spanishOrEnglishSlugFrom = (toolDirectory) => {
  const spanishPath = join(targetRoot, 'src', 'tool', toolDirectory, 'i18n', 'es.ts');
  if (existsSync(spanishPath)) {
    return read(spanishPath).match(/(?:const slug\s*=\s*|slug:\s*)['"]([^'"]+)['"]/)?.[1];
  }
  return englishSlugFrom(toolDirectory);
};

const spanishSlugFrom = (toolDirectory) => {
  const spanishPath = join(targetRoot, 'src', 'tool', toolDirectory, 'i18n', 'es.ts');
  if (!existsSync(spanishPath)) return undefined;
  return read(spanishPath).match(/(?:const slug\s*=\s*|slug:\s*)['"]([^'"]+)['"]/)?.[1];
};

const toolDirectories = existsSync(join(targetRoot, 'src', 'tool'))
  ? readdirSync(join(targetRoot, 'src', 'tool'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];
const toolSlugPairs = toolDirectories
  .map((directory) => ({
    directory,
    english: englishSlugFrom(directory),
    spanish: spanishSlugFrom(directory),
  }))
  .filter(({ english }) => Boolean(english));
const englishSlugs = toolSlugPairs.map(({ english }) => english);
const spanishSlugs = toolSlugPairs.map(({ english, spanish }) => spanish ?? english);
const spanishCategorySlug = categorySlugFrom('es');

if (!spanishCategorySlug || englishSlugs.length === 0) {
  fail('could not discover the Spanish category slug and English tool slugs');
  process.exit();
}

const routeSegments = {
  en: ['utilities', 'categories'],
  fr: ['utilitaires', 'categories'],
  de: ['werkzeuge', 'kategorien'],
  it: ['utilita', 'categorie'],
  pt: ['utilidades', 'categorias'],
  nl: ['hulpmiddelen', 'categorieen'],
  sv: ['verktyg', 'kategorier'],
  pl: ['narzedzia', 'kategorie'],
  id: ['utilitas', 'kategori'],
  tr: ['araclar', 'kategoriler'],
  ru: ['instrumenty', 'kategorii'],
  ja: ['utilities', 'categories'],
  ko: ['utilities', 'categories'],
  zh: ['utilities', 'categories'],
};
const locales = Object.keys(routeSegments);
const categorySlugs = Object.fromEntries(
  ['es', ...locales].map((locale) => [locale, categorySlugFrom(locale)]),
);
const missingCategoryLocales = Object.entries(categorySlugs)
  .filter(([, slug]) => !slug)
  .map(([locale]) => locale);

if (missingCategoryLocales.length > 0) {
  fail(`missing category translations for: ${missingCategoryLocales.join(', ')}`);
  process.exit();
}

const transform = (content) => content
  .replaceAll('\r\n', '\n')
  .replaceAll('Tabletop', categoryKey[0].toUpperCase() + categoryKey.slice(1))
  .replaceAll('tabletop', categoryKey);

const pageTransform = (relativePath, content) => {
  let transformed = transform(content);
  if (relativePath === '.github/workflows/ci.yml') {
    transformed = transformed
      .replaceAll('master', defaultBranch)
      .replace(
        'CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}',
        'CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}',
      );
  }
  if (relativePath === 'astro.config.mjs') {
    transformed = transformed.replace(
      'assets: "_utilities"',
      `assets: "_utilities/${categoryKey}"`,
    );
  }
  if (relativePath === 'src/pages/index.astro') {
    transformed = transformed.replaceAll(
      '/utilidades/categorias/juegos-de-mesa/',
      `/utilidades/categorias/${spanishCategorySlug}/`,
    );
  }
  if (relativePath.endsWith('/[category].astro')) {
    transformed = transformed
      .replaceAll('ALL_ENTRIES', 'ALL_TOOLS')
      .replaceAll('ALL_TOOLS.map(async (entry)', 'ALL_TOOLS.map(async ({ entry })');
  }
  // Some legacy components kept a wider locale union than the MFE supports.
  // The runtime check only needs string membership, so do not type that list
  // as the narrower UtilityLocale union.
  transformed = transformed.replace(
    /supportedLangs: KnownLocale\[\]/g,
    'supportedLangs: string[]',
  );
  transformed = transformed.replaceAll(
    'relatedTools?: { title: string; description: string; href: string }[];',
    'relatedTools?: { icon: string; title: string; description: string; href: string }[];',
  );
  // Keep generated files canonical so every migration passes git diff --check.
  return `${transformed.replace(/\n+$/g, '')}\n`;
};

const templateFiles = [
  'astro.config.mjs',
  '.github/workflows/ci.yml',
  'scripts/postinstall.mjs',
  'src/components/ProductionBreadcrumb.astro',
  'src/components/ProductionStructuredData.astro',
  'src/components/ProductionWidget.astro',
  'src/i18n/header-ui.ts',
  'src/i18n/language-ui.ts',
  'src/i18n/languages.ts',
  'src/identity/brands.ts',
  'src/mfe/manifest.ts',
  'src/layouts/ProductionCategoryPage.astro',
  'src/layouts/ProductionPage.astro',
  'src/layouts/ProductionUtilityPage.astro',
  'src/mfe/assets.ts',
  'src/mfe/category-ui.ts',
  'src/mfe/routes.ts',
  'src/pages/index.astro',
  'src/pages/utilidades/categorias/[category].astro',
  'src/pages/utilidades/[slug].astro',
  'src/pages/utilidades/[slug]/manifest.json.ts',
  'src/pages/[locale]/[utilities]/[categories]/[category].astro',
  'src/pages/[locale]/[utilities]/[categories]/[category]/[slug].astro',
  'src/pages/[locale]/[utilities]/[categories]/[category]/[slug]/manifest.json.ts',
  'src/tests/mfe_manifest.test.ts',
  'src/tests/mfe_cache_contract.test.ts',
  'src/worker.ts',
  'public/_headers',
];

const referenceContracts = {
  '.github/workflows/ci.yml': ['run: ./node_modules/.bin/wrangler deploy'],
  'src/layouts/ProductionUtilityPage.astro': [
    'const isWidget = new URLSearchParams(window.location.search).get("widget") === "true";',
    'ProductionStructuredData',
    'manifest.json?version=',
    '{ui.openTool}',
    '{ui.relatedEyebrow}',
    '{ui.moreToolsIn}',
    'utility-widget-body',
  ],
  'src/components/ProductionStructuredData.astro': ['BreadcrumbList', 'WebApplication', 'FAQPage'],
  'src/layouts/ProductionPage.astro': ['getBrandAssetPath(brand, "favicon")'],
  'src/mfe/assets.ts': ['getUtilityAssetPath', 'UTILITY_ASSET_ROOT'],
  'src/mfe/manifest.ts': ['createUtilityManifestResponse', 'application/manifest+json'],
  'src/worker.ts': ['pathname.endsWith("/manifest.json")', 'LONG_LIVED_ASSET_CACHE'],
  'src/tests/mfe_manifest.test.ts': ['MFE utility manifest', 'application/manifest+json', '512x512', 'immutable'],
  'src/tests/mfe_cache_contract.test.ts': ['MFE cache contract', 'LONG_LIVED_ASSET_CACHE', 'manifest.json'],
};

for (const [relativePath, markers] of Object.entries(referenceContracts)) {
  const sourcePath = join(referenceRoot, relativePath);
  if (!existsSync(sourcePath)) {
    fail(`reference file is missing: ${relativePath}`);
    process.exit();
  }
  const source = read(sourcePath);
  const missingMarkers = markers.filter((marker) => !source.includes(marker));
  if (missingMarkers.length > 0) {
    fail(`reference contract is incomplete in ${relativePath}: ${missingMarkers.join(', ')}`);
    process.exit();
  }
}

const referenceWorkflow = read(join(referenceRoot, '.github/workflows/ci.yml'));
const forbiddenWorkflowMarkers = ['website-build:', 'repository: Game-Bob/website', 'working-directory: website'];
const coupledWorkflowMarkers = forbiddenWorkflowMarkers.filter((marker) => referenceWorkflow.includes(marker));
if (coupledWorkflowMarkers.length > 0) {
  fail(`reference CI must not depend on website: ${coupledWorkflowMarkers.join(', ')}`);
  process.exit();
}

const filesToDelete = ['src/pages/[locale].astro', 'src/pages/[locale]/[slug].astro'];
const plannedWrites = templateFiles.map((path) => join(targetRoot, path));
const plannedDeletes = filesToDelete.map((path) => join(targetRoot, path));

const civicTypesPath = join(targetRoot, 'src', 'types.ts');
// Older verticals use CRLF and declare KnownLocale as a literal union, while
// newer ones already import UtilityLocale. Normalize both forms before
// applying the migration so the codemod does not depend on line endings.
const civicTypes = read(civicTypesPath).replaceAll('\r\n', '\n');
const modernTypes = civicTypes
  .replace(/import type \{ UtilityLocale \} from '@jjlmoya\/utils-shared\/routing';\n/g, '')
  .replace(
    "import type { SEOSection } from '@jjlmoya/utils-shared';",
    "import type { SEOSection } from '@jjlmoya/utils-shared';\nimport type { UtilityLocale } from '@jjlmoya/utils-shared/routing';",
  ).replace(
  /export type KnownLocale =[\s\S]*?;\s*(?=export interface FAQItem)/,
  "export type KnownLocale = UtilityLocale;\n\n",
  )
  .replaceAll(
    'TUI extends object = any',
    'TUI extends object = Record<string, string>',
  )
  .replaceAll(
    'TUI extends Record<string, string> = Record<string, string>',
    'TUI extends object = Record<string, string>',
  )
  .replaceAll(
    'TUI extends Record<string, string>',
    'TUI extends object',
  )
  .replaceAll(
    'entry: AlcoholToolEntry<Record<string, string>>;',
    'entry: AlcoholToolEntry<object>;',
  )
  .replace(
    /entry: AlcoholToolEntry(?:<Record<string, string>>)?;/g,
    'entry: AlcoholToolEntry<object>;',
  );

if (!modernTypes.includes("import type { UtilityLocale } from '@jjlmoya/utils-shared/routing';")
  || !modernTypes.includes('export type KnownLocale = UtilityLocale')) {
  fail('could not modernize src/types.ts safely');
  process.exit();
}

const targetTsconfigPath = join(targetRoot, 'tsconfig.json');
if (!existsSync(targetTsconfigPath)) {
  fail('target must contain tsconfig.json');
  process.exit();
}
const targetTsconfig = JSON.parse(read(targetTsconfigPath));
const modernTsconfig = {
  ...targetTsconfig,
  compilerOptions: {
    ...targetTsconfig.compilerOptions,
    resolveJsonModule: true,
  },
};

const targetGitignorePath = join(targetRoot, '.gitignore');
const targetGitignore = read(targetGitignorePath);
const generatedStylesIgnore = `public/_utilities/${categoryKey}/styles/`;
const modernGitignore = targetGitignore.includes(generatedStylesIgnore)
  ? targetGitignore
  : `${targetGitignore.trimEnd()}\n${generatedStylesIgnore}\n`;

const modernPackage = {
  ...targetPackage,
  dependencies: {
    ...targetPackage.dependencies,
    '@jjlmoya/identity': referencePackage.dependencies['@jjlmoya/identity'],
    '@jjlmoya/tracking': referencePackage.dependencies['@jjlmoya/tracking'],
    '@jjlmoya/utils-shared': referencePackage.dependencies['@jjlmoya/utils-shared'],
  },
  devDependencies: {
    ...targetPackage.devDependencies,
    wrangler: referencePackage.devDependencies.wrangler,
  },
  scripts: {
    ...targetPackage.scripts,
    predev: 'node scripts/postinstall.mjs',
    prestart: 'node scripts/postinstall.mjs',
    prebuild: 'node scripts/postinstall.mjs',
    qa: referencePackage.scripts.qa,
    'cf:dry-run': referencePackage.scripts['cf:dry-run'],
    'cf:preview': referencePackage.scripts['cf:preview'],
    'cf:deploy': referencePackage.scripts['cf:deploy'],
    'cf:deployments': referencePackage.scripts['cf:deployments'],
    'cf:rollback': referencePackage.scripts['cf:rollback'],
  },
};

const routeEntries = [
  {
    // A terminal wildcard matches the base path and every suffix (including
    // query strings), so one route replaces the previous exact + /* pair.
    // This matters because gamebob.dev is already close to Cloudflare's
    // per-zone Workers Routes limit.
    pattern: `www.jjlmoya.es/utilidades/categorias/${categorySlugs.es}*`,
    zone_name: 'jjlmoya.es',
  },
  ...spanishSlugs.map((slug) => ({
    pattern: `www.jjlmoya.es/utilidades/${slug}*`,
    zone_name: 'jjlmoya.es',
  })),
  ...locales.flatMap((locale) => {
    const [utilities, categories] = routeSegments[locale];
    const slug = categorySlugs[locale];
    return [{
      pattern: `www.gamebob.dev/${locale}/${utilities}/${categories}/${slug}*`,
      zone_name: 'gamebob.dev',
    }];
  }),
  { pattern: `www.gamebob.dev/_utilities/${categoryKey}/*`, zone_name: 'gamebob.dev' },
  { pattern: `www.jjlmoya.es/_utilities/${categoryKey}/*`, zone_name: 'jjlmoya.es' },
];

const nonAssetRoutes = routeEntries.filter(({ pattern }) => !pattern.includes('/_utilities/'));
if (nonAssetRoutes.some(({ pattern }) => !pattern.endsWith('*'))
  || nonAssetRoutes.some(({ pattern }) => pattern.endsWith('/*'))) {
  fail('generated MFE routes must use one terminal wildcard per page/category path');
  process.exit();
}

const productionWrangler = {
  $schema: './node_modules/wrangler/config-schema.json',
  name: `gamebob-utilities-${categoryKey}`,
  main: 'src/worker.ts',
  compatibility_date: '2026-07-22',
  workers_dev: false,
  preview_urls: true,
  routes: routeEntries,
  assets: {
    directory: './dist',
    binding: 'ASSETS',
    html_handling: 'force-trailing-slash',
    not_found_handling: '404-page',
  },
};

const stagingWrangler = {
  $schema: './node_modules/wrangler/config-schema.json',
  name: `gamebob-utilities-${categoryKey}-staging`,
  main: 'src/worker.ts',
  compatibility_date: '2026-07-22',
  workers_dev: true,
  preview_urls: true,
  assets: productionWrangler.assets,
};

const actions = [];
const addWrite = (path, content) => actions.push({ type: 'write', path, content });
const addDelete = (path) => actions.push({ type: 'delete', path });
const plannedTemplateContent = new Map();

const sourceFiles = (directory, files = []) => {
  if (!existsSync(directory)) return files;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) sourceFiles(path, files);
    else if (/\.(astro|ts|tsx|js|mjs)$/.test(entry.name)) files.push(path);
  }
  return files;
};

for (const relativePath of templateFiles) {
  const source = join(referenceRoot, relativePath);
  if (!existsSync(source)) {
    fail(`reference file is missing: ${relativePath}`);
    process.exit();
  }
  const content = pageTransform(relativePath, read(source));
  plannedTemplateContent.set(relativePath, content);
  addWrite(join(targetRoot, relativePath), content);
}

const targetContracts = {
  '.github/workflows/ci.yml': [
    'run: ./node_modules/.bin/wrangler deploy',
    'CLOUDFLARE_API_TOKEN:',
    'CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}',
  ],
  'src/components/ProductionBreadcrumb.astro': ['breadcrumbLabel', 'aria-label={breadcrumbLabel}'],
  'src/components/ProductionStructuredData.astro': ['BreadcrumbList', 'WebApplication', 'FAQPage'],
  'src/layouts/ProductionCategoryPage.astro': ['<ProductionBreadcrumb', '{ui.useTool}'],
  'src/layouts/ProductionUtilityPage.astro': [
    'const isWidget = new URLSearchParams(window.location.search).get("widget") === "true";',
    'ProductionStructuredData',
    'manifest.json?version=',
    '{ui.openTool}',
    '{ui.relatedEyebrow}',
    '{ui.moreToolsIn}',
    'utility-widget-body',
  ],
  'src/layouts/ProductionPage.astro': ['getBrandAssetPath(brand, "favicon")', 'rel="manifest"'],
  'src/mfe/assets.ts': ['getUtilityAssetPath', 'UTILITY_ASSET_ROOT'],
  'src/mfe/manifest.ts': ['createUtilityManifestResponse', 'application/manifest+json'],
  'src/worker.ts': ['pathname.endsWith("/manifest.json")', 'LONG_LIVED_ASSET_CACHE'],
  'src/pages/utilidades/[slug]/manifest.json.ts': ['createUtilityManifestResponse', 'getStaticPaths'],
  'src/pages/[locale]/[utilities]/[categories]/[category]/[slug]/manifest.json.ts': ['createUtilityManifestResponse', 'getStaticPaths'],
  'src/tests/mfe_manifest.test.ts': ['MFE utility manifest', 'application/manifest+json', '512x512', 'immutable'],
  'src/tests/mfe_cache_contract.test.ts': ['MFE cache contract', 'LONG_LIVED_ASSET_CACHE', 'manifest.json'],
  'src/mfe/category-ui.ts': ['openTool:', 'relatedEyebrow:', 'moreToolsIn:', 'zoomControls:', 'breadcrumb:', 'es:', 'en:', 'zh:'],
};

for (const [relativePath, markers] of Object.entries(targetContracts)) {
  const content = plannedTemplateContent.get(relativePath);
  const missingMarkers = markers.filter((marker) => !content?.includes(marker));
  if (missingMarkers.length > 0) {
    fail(`generated target contract is incomplete in ${relativePath}: ${missingMarkers.join(', ')}`);
    process.exit();
  }
}
addWrite(civicTypesPath, modernTypes);
addWrite(targetTsconfigPath, `${JSON.stringify(modernTsconfig, null, 4)}\n`);
addWrite(targetGitignorePath, modernGitignore);
addWrite(targetPackagePath, `${JSON.stringify(modernPackage, null, 4)}\n`);
addWrite(join(targetRoot, 'wrangler.jsonc'), `${JSON.stringify(productionWrangler, null, 4)}\n`);
addWrite(join(targetRoot, 'wrangler.staging.jsonc'), `${JSON.stringify(stagingWrangler, null, 4)}\n`);
for (const relativePath of filesToDelete) addDelete(join(targetRoot, relativePath));

// Legacy components sometimes use KnownLocale only as a runtime list of URL
// prefixes. Rewrite those declarations in the target source as well, so the
// generated 15-locale MFE type does not need to be widened with old aliases.
for (const sourcePath of sourceFiles(join(targetRoot, 'src'))) {
  if (plannedWrites.includes(sourcePath)) continue;
  const source = read(sourcePath);
  const normalizedPath = relative(targetRoot, sourcePath).replaceAll('\\', '/');
  const toolMatch = normalizedPath.match(/^src\/tool\/([^/]+)\/(entry|i18n\/[^/]+)\.ts$/);
  const uiPath = toolMatch ? join(targetRoot, 'src', 'tool', toolMatch[1], 'ui.ts') : undefined;
  const uiType = uiPath && existsSync(uiPath)
    ? read(uiPath).match(/export (?:interface|type) (\w+UI)\b/)?.[1]
    : undefined;
  const lineBreak = source.includes('\r\n') ? '\r\n' : '\n';
  let transformedSource = source.replace(/supportedLangs: KnownLocale\[\]/g, 'supportedLangs: string[]');
  if (/^src\/tool\/[^/]+\/index\.ts$/.test(normalizedPath)
    && transformedSource.includes('ToolDefinition')
    && !transformedSource.includes("import type { ToolDefinition } from '../../types';")) {
    transformedSource = `import type { ToolDefinition } from '../../types';${lineBreak}${transformedSource}`;
  }
  if (/^src\/tool\/[^/]+\/bibliography\.ts$/.test(normalizedPath)) {
    transformedSource = transformedSource.replace(
      "from '../../../types'",
      "from '../../types'",
    );
  }
  if (normalizedPath === 'src/tests/diacritics_density.test.ts'
    || normalizedPath === 'src/tests/inverted_punctuation.test.ts'
    || normalizedPath === 'src/tests/script_density.test.ts') {
    transformedSource = transformedSource.replaceAll(
      'content as Record<string, unknown>',
      'content as unknown as Record<string, unknown>',
    ).replaceAll('\r\n', '\n');
  }
  if (normalizedPath === 'src/tests/seo_length.test.ts') {
    transformedSource = transformedSource.replace(
      /(const loader = [^\r\n]+;)(\r?\n)(\s*)const content = await loader\(\);/,
      `$1$2$3if (!loader) return;$2$3const content = await loader();`,
    );
  }
  if (normalizedPath === 'src/tests/translation_copy.test.ts') {
    transformedSource = transformedSource
      .replace('const left = locales[leftIndex];', 'const left = locales[leftIndex]!;')
      .replace('const right = locales[rightIndex];', 'const right = locales[rightIndex]!;');
  }
  if (uiType && toolMatch?.[2] === 'entry') {
    transformedSource = transformedSource
      .replace(
        /import type \{ AlcoholToolEntry<\w+UI>, ToolLocaleContent \}/g,
        'import type { AlcoholToolEntry, ToolLocaleContent }',
      )
      .replace(
        /(:\s*)AlcoholToolEntry(?!\s*<)/g,
        `$1AlcoholToolEntry<${uiType}>`,
      )
      .replace(
        /(as unknown as\s+)AlcoholToolEntry(?!\s*<)/g,
        `$1AlcoholToolEntry<${uiType}>`,
      )
      .replace(
        /(as unknown as\s+)ToolLocaleContent(?!\s*<)/g,
        `$1ToolLocaleContent<${uiType}>`,
      );
  }
  if (uiType && toolMatch?.[2].startsWith('i18n/')) {
    transformedSource = transformedSource.replaceAll(
      'ToolLocaleContent<Record<string, any>>',
      `ToolLocaleContent<${uiType}>`,
    );
  }
  if (transformedSource !== source) addWrite(sourcePath, transformedSource);
}

const missingAssets = [];
const missingSharedAssets = [];
const assetDestination = join(targetRoot, 'public', '_utilities', categoryKey, 'images');
const sharedAssetDestination = join(targetRoot, 'public', '_utilities', categoryKey);
const addAsset = (destinationSlug, candidates) => {
  const destination = join(assetDestination, `${destinationSlug}.webp`);
  if (existsSync(destination)) return;
  const source = candidates
    .filter(({ slug }) => Boolean(slug))
    .map(({ root, slug, directory = '' }) => join(root, 'public', 'images', 'utilities', directory, `${slug}.webp`))
    .find((candidate) => existsSync(candidate));
  if (!source) {
    missingAssets.push(destinationSlug);
    return;
  }
  actions.push({
    type: 'copy',
    source,
    path: destination,
  });
};

const addSharedAsset = (fileName, sourceFileName = fileName, sourceRoots = [assetSourceRoot, legacyAssetSourceRoot]) => {
  const destination = join(sharedAssetDestination, fileName);
  if (existsSync(destination)) return;
  const source = sourceRoots
    .map((root) => join(root, 'public', sourceFileName))
    .find((candidate) => existsSync(candidate));
  if (!source) {
    missingSharedAssets.push(fileName);
    return;
  }
  actions.push({ type: 'copy', source, path: destination });
};

for (const fileName of ['favicon.ico', 'favicon-48.webp', 'apple-touch-icon-brand.webp']) {
  addSharedAsset(fileName);
}
addSharedAsset('favicon-jjlmoya.ico', 'favicon-brand.ico', [legacyAssetSourceRoot]);
addSharedAsset('favicon-jjlmoya-32.webp', 'favicon-brand-32.webp', [legacyAssetSourceRoot]);
addSharedAsset('apple-touch-icon-jjlmoya.webp', 'apple-touch-icon-brand.webp', [legacyAssetSourceRoot]);

addAsset(categoryKey, [
  { root: assetSourceRoot, slug: categoryKey },
  { root: legacyAssetSourceRoot, slug: spanishCategorySlug },
  { root: legacyAssetSourceRoot, slug: spanishCategorySlug, directory: 'category' },
]);
for (const { english, spanish } of toolSlugPairs) {
  addAsset(english, [
    { root: assetSourceRoot, slug: english },
    { root: legacyAssetSourceRoot, slug: spanish },
  ]);
}

if (missingAssets.length > 0 && !allowMissingAssets) {
  fail(`missing source OG assets: ${missingAssets.join(', ')}; rerun with --allow-missing-assets only if these are intentionally deferred`);
  process.exit();
}
if (missingSharedAssets.length > 0) {
  fail(`missing shared identity assets: ${missingSharedAssets.join(', ')}`);
  process.exit();
}

const actionLabel = (action) => `${action.type} ${relative(targetRoot, action.path)}`;
console.log(`${dryRun ? 'Dry run' : 'Applying'} @jjlmoya/utils-${categoryKey} migration from @jjlmoya/utils-${referenceCategoryKey}`);
console.log(`- ${actions.length} file operations planned`);
console.log(`- ${englishSlugs.length} English tool slugs discovered`);
console.log(`- routes: ${routeEntries.length}`);
if (missingAssets.length > 0) console.warn(`- WARNING missing OG assets: ${missingAssets.join(', ')}`);
if (allowDirty) console.warn('- WARNING target has local changes; they will be preserved where files do not overlap');

if (dryRun) {
  for (const action of actions) console.log(`  ${actionLabel(action)}`);
  console.log('  npm install (sync package-lock.json and node_modules, including postinstall)');
  process.exit();
}

mkdirSync(join(targetRoot, 'public', '_utilities', categoryKey), { recursive: true });
for (const action of actions) {
  if (action.type === 'delete') {
    rmSync(action.path, { force: true });
    continue;
  }
  mkdirSync(dirname(action.path), { recursive: true });
  if (action.type === 'copy') copyFileSync(action.source, action.path);
  else writeFileSync(action.path, action.content);
}

const npmCommand = process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
const npmArgs = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'npm install --no-audit --no-fund']
  : ['install', '--no-audit', '--no-fund'];
try {
  // npm install is deliberately part of the codemod: it updates the lockfile,
  // installs the shared version selected by the migration, and runs postinstall
  // so the per-tool CSS assets exist before QA or build.
  execFileSync(npmCommand, npmArgs, {
    cwd: targetRoot,
    stdio: 'inherit',
  });
} catch {
  fail('npm install failed after updating package.json; package-lock.json and node_modules may be out of sync');
  process.exit();
}

console.log(`Applied migration to ${targetRoot}`);
if (missingAssets.length > 0) {
  console.warn('Migration completed with deferred OG assets. Do not deploy until they are generated or explicitly assigned.');
}
