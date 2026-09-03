/**
 * Audits utility CSS against the locale-aware image contract in jjlmoya and website.
 * App landing pages are intentionally excluded because they use public/assets/apps.
 * Usage: npm run audit:utility-images [-- --summary|--json] [repo ...]
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const defaultRepositories = [
  resolve(scriptDirectory, '../../jjlmoya'),
  resolve(scriptDirectory, '../../website'),
];
const argumentsList = process.argv.slice(2);
const jsonOutput = argumentsList.includes('--json');
const summaryOutput = argumentsList.includes('--summary');
const repositories = argumentsList.filter((argument) => argument !== '--json' && argument !== '--summary');

function listDirectories(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function listFiles(directory, extension) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => entry.name);
}

function kebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

function readToolDefinition(toolDirectory) {
  const entryPath = join(toolDirectory, 'entry.ts');
  if (!existsSync(entryPath)) return null;
  const entrySource = readFileSync(entryPath, 'utf8');
  const id = entrySource.match(/\bid:\s*['"]([^'"]+)['"]/)?.[1];
  if (!id) return null;
  const directoryName = toolDirectory.split(/[\\/]/).pop() ?? '';
  const cssStems = listFiles(toolDirectory, '.css').map((file) => file.slice(0, -4));
  return { directory: toolDirectory, directoryName, id, cssStems };
}

function discoverTools(repositoryRoot) {
  const packagesRoot = join(repositoryRoot, 'node_modules');
  const tools = [];
  for (const packageName of listDirectories(packagesRoot).filter((name) => name.startsWith('@jjlmoya'))) {
    const packageRoot = join(packagesRoot, packageName);
    for (const packageDirectory of listDirectories(packageRoot).filter((name) => name.startsWith('utils-'))) {
      const toolsRoot = join(packageRoot, packageDirectory, 'src', 'tool');
      for (const toolDirectoryName of listDirectories(toolsRoot)) {
        const definition = readToolDefinition(join(toolsRoot, toolDirectoryName));
        if (definition) tools.push(definition);
      }
    }
  }
  return tools;
}

function findDefinition(cssStem, definitions) {
  const normalizedStem = kebabCase(cssStem);
  return definitions.find((definition) =>
    definition.id === cssStem ||
    kebabCase(definition.id) === normalizedStem ||
    definition.directoryName === cssStem ||
    kebabCase(definition.directoryName) === normalizedStem ||
    definition.cssStems.some((stem) =>
      stem === cssStem || kebabCase(stem) === normalizedStem,
    ),
  );
}

function slugsForDefinition(definition, locale) {
  const slugs = new Set([definition.id, kebabCase(definition.id), kebabCase(definition.directoryName)]);
  const localePath = join(definition.directory, 'i18n', `${locale}.ts`);
  if (!existsSync(localePath)) return slugs;
  const localeSource = readFileSync(localePath, 'utf8');
  for (const match of localeSource.matchAll(/\bslug\s*(?::|=)\s*['"]([^'"]+)['"]/g)) slugs.add(match[1]);
  const translatedLocale = localeSource.match(/createTranslatedContent\(\s*['"]([^'"]+)['"]\s*\)/)?.[1];
  if (translatedLocale) {
    const translatedPath = join(definition.directory, 'i18n', 'translated.ts');
    if (existsSync(translatedPath)) {
      const translatedSource = readFileSync(translatedPath, 'utf8');
      const escapedLocale = translatedLocale.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const translatedSlug = translatedSource.match(
        new RegExp(`\\b${escapedLocale}\\s*:\\s*\\{\\s*slug:\\s*['"]([^'"]+)['"]`),
      )?.[1];
      if (translatedSlug) slugs.add(translatedSlug);
    }
  }
  return slugs;
}

function auditRepository(repositoryRoot) {
  const stylesRoot = join(repositoryRoot, 'public', 'styles', 'lib');
  const imagesRoot = join(repositoryRoot, 'public', 'images', 'utilities');
  const excludedStyleDirectories = new Set(['apps']);
  const imageStems = new Set(
    ['.webp', '.png', '.jpg', '.jpeg'].flatMap((extension) =>
      listFiles(imagesRoot, extension).map((file) => file.slice(0, -extension.length)),
    ),
  );
  const definitions = discoverTools(repositoryRoot);
  const imageLocale = repositoryRoot.toLowerCase().endsWith('website') ? 'en' : 'es';
  const cssFiles = [];
  let excludedCssCount = 0;
  const walk = (directory) => {
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory() && excludedStyleDirectories.has(entry.name)) {
        excludedCssCount += countCssFiles(entryPath);
        continue;
      }
      if (entry.isDirectory()) walk(entryPath);
      if (entry.isFile() && entry.name.endsWith('.css')) cssFiles.push(entryPath);
    }
  };
  const countCssFiles = (directory) => {
    if (!existsSync(directory)) return 0;
    return readdirSync(directory, { withFileTypes: true }).reduce((count, entry) => {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) return count + countCssFiles(entryPath);
      return count + (entry.isFile() && entry.name.endsWith('.css') ? 1 : 0);
    }, 0);
  };
  walk(stylesRoot);
  const orphaned = cssFiles.map((cssPath) => {
    const cssStem = cssPath.split(/[\\/]/).pop().slice(0, -4);
    const definition = findDefinition(cssStem, definitions);
    const expectedImageStems = definition ? [...slugsForDefinition(definition, imageLocale)] : [cssStem];
    const hasImage = expectedImageStems.some((stem) => imageStems.has(stem));
    return {
      css: relative(repositoryRoot, cssPath).replaceAll('\\', '/'),
      cssStem,
      toolId: definition?.id ?? null,
      expectedImages: expectedImageStems,
      hasImage,
    };
  }).filter((asset) => !asset.hasImage);
  return {
    repository: repositoryRoot,
    cssCount: cssFiles.length,
    imageCount: imageStems.size,
    knownToolCount: definitions.length,
    excludedCssCount,
    orphanCount: orphaned.length,
    mappedOrphanCount: orphaned.filter((asset) => asset.toolId).length,
    unmappedCssCount: orphaned.filter((asset) => !asset.toolId).length,
    orphaned,
  };
}

const report = (repositories.length ? repositories : defaultRepositories)
  .map((repository) => auditRepository(resolve(repository)));

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else if (summaryOutput) {
  for (const result of report) {
    console.log(`${result.repository}: ${result.orphanCount} orphan CSS files (${result.mappedOrphanCount} mapped tools, ${result.unmappedCssCount} unmapped CSS, ${result.excludedCssCount} excluded app CSS)`);
  }
} else {
  for (const result of report) {
    console.log(`${result.repository}: ${result.orphanCount} orphan CSS files (${result.mappedOrphanCount} mapped tools, ${result.unmappedCssCount} unmapped CSS, ${result.excludedCssCount} excluded app CSS) / ${result.cssCount} CSS files / ${result.imageCount} root images`);
    for (const asset of result.orphaned) {
      console.log(`ORPHAN\t${asset.css}\t${asset.toolId ?? 'unmapped'}\t${asset.expectedImages.join(', ')}`);
    }
  }
}

if (report.some((result) => result.orphanCount > 0)) process.exitCode = 1;
