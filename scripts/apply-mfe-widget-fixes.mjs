import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const scriptRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const argument = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};

const apply = hasFlag('--apply');
const allowDirty = hasFlag('--allow-dirty');
const workspaceRoot = resolve(scriptRoot, argument('--root', '..'));
const requestedRepo = argument('--repo');
const helperPath = 'src/mfe/widget-height.ts';
const layoutPath = 'src/layouts/ProductionUtilityPage.astro';
const tick = String.fromCharCode(96);
const helperContent = [
  'export function observeWidgetHeight(container: HTMLElement): void {',
  '  if (window.parent === window) return;',
  '',
  '  const pathSlug = window.location.pathname.split("/").filter(Boolean).pop() ?? "utility";',
  '  const widgetId = new URLSearchParams(window.location.search).get("id") ?? ' + tick + 'jj-widget-' + String.fromCharCode(36) + '{pathSlug}' + tick + ';',
  '  const reportHeight = (height: number) => {',
  '    if (height > 50) {',
  '      window.parent.postMessage({ jjlmoyaHeight: Math.ceil(height), jjlmoyaId: widgetId }, "*");',
  '    }',
  '  };',
  '  const observer = new ResizeObserver(([entry]) => reportHeight(entry?.contentRect.height ?? 0));',
  '',
  '  observer.observe(container);',
  '}',
  '',
].join('\n');

const fail = (message) => {
  throw new Error('apply-mfe-widget-fixes: ' + message);
};

const candidateRoots = requestedRepo
  ? [resolve(scriptRoot, requestedRepo)]
  : readdirSync(workspaceRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith('jjlmoya-utils-'))
      .map((entry) => join(workspaceRoot, entry.name));

const targets = candidateRoots.filter((root) => existsSync(join(root, layoutPath)));
if (targets.length === 0) fail('no MFE utility repositories with ProductionUtilityPage.astro found');

const planned = [];
for (const root of targets) {
  const packagePath = join(root, 'package.json');
  const layoutFile = join(root, layoutPath);
  const helperFile = join(root, helperPath);
  if (!existsSync(packagePath)) fail(root + ' has no package.json');

  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  if (!packageJson.name?.startsWith('@jjlmoya/utils-')) {
    fail(root + ' is not an @jjlmoya/utils-* package');
  }

  const dirty = execFileSync('git', ['status', '--porcelain'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  if (dirty && !allowDirty) {
    fail(root + ' has local changes; rerun with --allow-dirty after reviewing them');
  }

  const originalLayout = readFileSync(layoutFile, 'utf8').replaceAll('\r\n', '\n');
  let layout = originalLayout;
  const scopedSelector = '  .utility-production.utility-widget-mode .utility-production-inner > :not(.utility-tool-production) {';
  const globalSelector = '  :global(.utility-production.utility-widget-mode .utility-production-inner > :not(.utility-tool-production)) {';
  if (layout.includes(scopedSelector)) {
    layout = layout.replace(scopedSelector, globalSelector);
  } else if (!layout.includes(globalSelector)) {
    fail(root + ' has an unexpected widget-mode selector');
  }

  const helperImport = '  import { observeWidgetHeight } from "../mfe/widget-height";';
  if (!layout.includes(helperImport)) {
    if (!layout.includes('<script>')) fail(root + ' has no client script block');
    layout = layout.replace('<script>', '<script>\n' + helperImport);
  }

  const legacyPageGuard = [
    '  if (isWidget) {',
    '    document.body.classList.add("utility-widget-body");',
    '    if (page) {',
    '      page.classList.add("utility-widget-mode");',
    '    }',
    '  }',
  ].join('\n');
  const compactPageGuard = [
    '  if (isWidget) {',
    '    document.body.classList.add("utility-widget-body");',
    '    page?.classList.add("utility-widget-mode");',
    '  }',
  ].join('\n');
  layout = layout.replace(legacyPageGuard, compactPageGuard);

  if (!layout.includes('  if (isWidget && container) observeWidgetHeight(container);')) {
    const zoomTail = '  applyZoom();\n</script>';
    if (!layout.includes(zoomTail)) fail(root + ' has no expected zoom script tail');
    layout = layout.replace(
      zoomTail,
      '  applyZoom();\n  if (isWidget && container) observeWidgetHeight(container);\n</script>',
    );
  }

  const changes = [];
  if (layout !== originalLayout) changes.push({ path: layoutFile, content: layout });

  if (existsSync(helperFile)) {
    const existingHelper = readFileSync(helperFile, 'utf8').replaceAll('\r\n', '\n');
    if (!existingHelper.includes('new ResizeObserver')
      || !existingHelper.includes('jjlmoyaHeight')
      || !existingHelper.includes('jjlmoyaId')) {
      fail(root + '/' + helperPath + ' exists but does not match the widget height contract');
    }
  } else {
    changes.push({ path: helperFile, content: helperContent });
  }

  planned.push({ root, changes });
}

const totalChanges = planned.reduce((total, target) => total + target.changes.length, 0);
console.log((apply ? 'Applying' : 'Dry run') + ' MFE widget fixes to ' + targets.length + ' repositories');
console.log('- ' + totalChanges + ' file writes planned');
for (const target of planned) {
  const name = target.root.split(/[\\/]/).pop();
  console.log('  ' + name + ': ' + (target.changes.length ? target.changes.map((change) => change.path).join(', ') : 'already fixed'));
}

if (!apply) process.exit();

for (const target of planned) {
  for (const change of target.changes) {
    writeFileSync(change.path, change.content);
  }
}
console.log('Applied MFE widget fixes');
