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
    transformed = transformed.replaceAll('master', defaultBranch);
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
  transformed = transformed.replaceAll(
    'relatedTools?: { title: string; description: string; href: string }[];',
    'relatedTools?: { icon: string; title: string; description: string; href: string }[];',
  );
  return transformed;
};

const templateFiles = [
  'astro.config.mjs',
  '.github/workflows/ci.yml',
  'scripts/postbuild.mjs',
  'scripts/postinstall.mjs',
  'src/components/ProductionBreadcrumb.astro',
  'src/components/ProductionWidget.astro',
  'src/i18n/header-ui.ts',
  'src/i18n/language-ui.ts',
  'src/i18n/languages.ts',
  'src/identity/brands.ts',
  'src/layouts/ProductionCategoryPage.astro',
  'src/layouts/ProductionPage.astro',
  'src/layouts/ProductionUtilityPage.astro',
  'src/mfe/assets.ts',
  'src/mfe/category-ui.ts',
  'src/mfe/routes.ts',
  'src/pages/mfe-sitemaps/[locale]/[vertical]/sitemap.xml.ts',
  'src/pages/index.astro',
  'src/pages/utilidades/categorias/[category].astro',
  'src/pages/utilidades/[slug].astro',
  'src/pages/[locale]/[utilities]/[categories]/[category].astro',
  'src/pages/[locale]/[utilities]/[categories]/[category]/[slug].astro',
  'src/worker.ts',
  'public/_headers',
];

const filesToDelete = ['src/pages/[locale].astro', 'src/pages/[locale]/[slug].astro'];
const plannedWrites = templateFiles.map((path) => join(targetRoot, path));
const plannedDeletes = filesToDelete.map((path) => join(targetRoot, path));

const civicTypesPath = join(targetRoot, 'src', 'types.ts');
const civicTypes = read(civicTypesPath);
const modernTypes = civicTypes
  .replace(/import type \{ UtilityLocale \} from '@jjlmoya\/utils-shared\/routing';\n/g, '')
  .replace(
    "import type { SEOSection } from '@jjlmoya/utils-shared';",
    "import type { SEOSection } from '@jjlmoya/utils-shared';\nimport type { UtilityLocale } from '@jjlmoya/utils-shared/routing';",
  ).replace(
  /export type KnownLocale =([\s\S]*?);\n\nexport interface FAQItem/,
  'export type KnownLocale = UtilityLocale;\n\nexport interface FAQItem',
  );

if (!modernTypes.includes("import type { UtilityLocale } from '@jjlmoya/utils-shared/routing';")
  || !modernTypes.includes('export type KnownLocale = UtilityLocale;')) {
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
    postbuild: 'node scripts/postbuild.mjs',
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
    pattern: `www.jjlmoya.es/utilidades/categorias/${categorySlugs.es}`,
    zone_name: 'jjlmoya.es',
  },
  {
    pattern: `www.jjlmoya.es/utilidades/categorias/${categorySlugs.es}/*`,
    zone_name: 'jjlmoya.es',
  },
  ...spanishSlugs.flatMap((slug) => [
    { pattern: `www.jjlmoya.es/utilidades/${slug}`, zone_name: 'jjlmoya.es' },
    { pattern: `www.jjlmoya.es/utilidades/${slug}/*`, zone_name: 'jjlmoya.es' },
  ]),
  ...locales.flatMap((locale) => {
    const [utilities, categories] = routeSegments[locale];
    const slug = categorySlugs[locale];
    return [
      { pattern: `www.gamebob.dev/${locale}/${utilities}/${categories}/${slug}`, zone_name: 'gamebob.dev' },
      { pattern: `www.gamebob.dev/${locale}/${utilities}/${categories}/${slug}/*`, zone_name: 'gamebob.dev' },
    ];
  }),
  { pattern: `www.jjlmoya.es/_utilities/es/${categoryKey}/sitemap.xml`, zone_name: 'jjlmoya.es' },
  ...locales.map((locale) => ({
    pattern: `www.gamebob.dev/_utilities/${locale}/${categoryKey}/sitemap.xml`,
    zone_name: 'gamebob.dev',
  })),
  { pattern: `www.gamebob.dev/_utilities/${categoryKey}/*`, zone_name: 'gamebob.dev' },
  { pattern: `www.jjlmoya.es/_utilities/${categoryKey}/*`, zone_name: 'jjlmoya.es' },
];

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

for (const relativePath of templateFiles) {
  const source = join(referenceRoot, relativePath);
  if (!existsSync(source)) {
    fail(`reference file is missing: ${relativePath}`);
    process.exit();
  }
  addWrite(join(targetRoot, relativePath), pageTransform(relativePath, read(source)));
}
addWrite(civicTypesPath, modernTypes);
addWrite(targetTsconfigPath, `${JSON.stringify(modernTsconfig, null, 4)}\n`);
addWrite(targetGitignorePath, modernGitignore);
addWrite(targetPackagePath, `${JSON.stringify(modernPackage, null, 4)}\n`);
addWrite(join(targetRoot, 'wrangler.jsonc'), `${JSON.stringify(productionWrangler, null, 4)}\n`);
addWrite(join(targetRoot, 'wrangler.staging.jsonc'), `${JSON.stringify(stagingWrangler, null, 4)}\n`);
for (const relativePath of filesToDelete) addDelete(join(targetRoot, relativePath));

const missingAssets = [];
const assetDestination = join(targetRoot, 'public', '_utilities', categoryKey, 'images');
const addAsset = (destinationSlug, candidates) => {
  const destination = join(assetDestination, `${destinationSlug}.webp`);
  if (existsSync(destination)) return;
  const source = candidates
    .filter(({ slug }) => Boolean(slug))
    .map(({ root, slug }) => join(root, 'public', 'images', 'utilities', `${slug}.webp`))
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

addAsset(categoryKey, [
  { root: assetSourceRoot, slug: categoryKey },
  { root: legacyAssetSourceRoot, slug: spanishCategorySlug },
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

const actionLabel = (action) => `${action.type} ${relative(targetRoot, action.path)}`;
console.log(`${dryRun ? 'Dry run' : 'Applying'} @jjlmoya/utils-${categoryKey} migration from @jjlmoya/utils-${referenceCategoryKey}`);
console.log(`- ${actions.length} file operations planned`);
console.log(`- ${englishSlugs.length} English tool slugs discovered`);
console.log(`- routes: ${routeEntries.length}`);
if (missingAssets.length > 0) console.warn(`- WARNING missing OG assets: ${missingAssets.join(', ')}`);
if (allowDirty) console.warn('- WARNING target has local changes; they will be preserved where files do not overlap');

if (dryRun) {
  for (const action of actions) console.log(`  ${actionLabel(action)}`);
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

console.log(`Applied migration to ${targetRoot}`);
if (missingAssets.length > 0) {
  console.warn('Migration completed with deferred OG assets. Do not deploy until they are generated or explicitly assigned.');
}
