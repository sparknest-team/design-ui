import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { renderCatalog } from './token-catalog.mjs';
import { checkClassification } from './runtime-motion-classification.mjs';

const workspace = new URL('../../', import.meta.url);
const cedar = createRequire(new URL('cedar-design-web/packages/ui/package.json', workspace));
const mobile = createRequire(new URL('maple-design-mobile/packages/cli/package.json', workspace));
const postcss = cedar('postcss');
async function compile(repo, component) {
  const pkg = 'ui';
  const entry = new URL(`${repo}/packages/${pkg}/src/${component}/style/index.less`, workspace);
  return postcss.parse((await (repo === 'cedar-design-web' ? cedar : mobile)('less').render(
    readFileSync(entry, 'utf8'), { filename: fileURLToPath(entry), javascriptEnabled: true },
  )).css);
}
function values(css, selector, property) {
  const found = [];
  css.walkRules(rule => {
    if (rule.selectors.includes(selector)) rule.walkDecls(property, decl => found.push(decl.value));
  });
  return found;
}
test('Cedar Select current source hash and all six classified call sites are independently checked', () => {
  const classification = JSON.parse(readFileSync(new URL('../audits/runtime-motion-classification.json', import.meta.url)));
  const inventory = JSON.parse(readFileSync(new URL('../audits/motion-source-inventory.json', import.meta.url)));
  const row = classification.rows.find(r => r.repo === 'cedar-design-web' && r.file === 'select/hooks/use-select.ts');
  const candidate = inventory.platforms.find(p => p.repo === row.repo).candidates.find(r => r.file === row.file);
  const source = readFileSync(new URL('cedar-design-web/packages/ui/src/' + row.file, workspace), 'utf8');
  const result = checkClassification({ ...classification, rows: [row] }, {
    platforms: [{ repo: row.repo, runtimeCallCandidates: candidate.runtime.length, candidates: [candidate] }],
  }, () => source);
  assert.equal(result.classifiedHints, 6);
  assert.equal(result.unclassifiedHints, 0);
  assert.deepEqual(result.categories, { 'delegated-scroll': 1, 'native-scroll': 2, 'state-settlement': 1, 'interaction-dispatch': 2 });
});
for (const [repo, prefix] of [['cedar-design-web', 'c'], ['maple-design-mobile', 'mp']]) {
  test(repo + ': grouped headings consume vertical/horizontal padding and the first group has no top margin', async () => {
    const css = await compile(repo, 'select');
    const selector = `.${prefix}-select-dropdown .${prefix}-select-group-title`;
    assert.ok(values(css, selector, 'padding').includes(`var(--${prefix}-select-popup-padding-vertical) var(--${prefix}-select-popup-group-title-padding-horizontal)`));
    assert.ok(values(css, `.${prefix}-select-dropdown .${prefix}-select-group:first-child > .${prefix}-select-group-title`, 'margin-top').includes('0'));
    assert.ok(values(css, ':root', `--${prefix}-select-popup-group-title-padding-horizontal`).includes(`var(--${prefix}-select-popup-option-padding-horizontal)`));
    assert.equal(values(css, selector + ':first-child', 'margin-top').length, 0);
  });
}
test('Maple Menu current row states, group geometry and overlay tokens reach actual compiled properties', async () => {
  const css = await compile('maple-design-mobile', 'menu');
  const row = '.mp-menu-option';
  for (const [selector, property, value] of [
    [row, 'color', 'var(--mp-menu-option-text-color)'],
    [row + '--selected-color', 'background-color', 'var(--mp-menu-option-selected-background)'],
    [row + '--selected-color', 'color', 'var(--mp-menu-option-selected-text-color)'],
    [row + '--selected-color:not(' + row + '--disabled):hover', 'background-color', 'var(--mp-menu-option-bg-selected-hover)'],
    [row + ':hover:not(' + row + '--disabled):not(' + row + '--selected-color)', 'background-color', 'var(--mp-menu-option-bg-hover)'],
    [row + '--disabled', 'background', 'var(--mp-menu-option-bg-disabled)'],
    ['.mp-menu-group__title', 'line-height', 'var(--mp-menu-group-title-height)'],
    ['.mp-menu-group__title', 'padding', 'var(--mp-menu-group-title-padding)'],
    ['.mp-menu-group + .mp-menu-group', 'margin-top', 'calc(2 * var(--mp-menu-padding-vertical))'],
    [':root', '--mp-menu-background-color', 'var(--mp-sys-color-surface-overlay)'],
  ]) assert.ok(values(css, selector, property).includes(value), selector + '/' + property);
  assert.equal(values(css, '.mp-menu-group__title', 'height').length, 0);
  assert.equal(values(css, row + '__cover', 'background').length, 0);
});
test('Maple FloatingPanel surface alias reaches panel background and bottom shadow mask', async () => {
  const css = await compile('maple-design-mobile', 'floating-panel');
  assert.ok(values(css, ':root', '--mp-floating-panel-background').includes('var(--mp-sys-color-surface-overlay)'));
  assert.ok(values(css, '.mp-floating-panel', 'background-color').includes('var(--mp-floating-panel-background)'));
  assert.ok(values(css, '.mp-floating-panel::after', 'box-shadow').includes('0 -1px var(--mp-floating-panel-background)'));
});

const scan = spawnSync(process.execPath, [fileURLToPath(new URL('./token-inventory.mjs', import.meta.url))], {
  encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
});
assert.equal(scan.status, 0, scan.stderr);
const report = JSON.parse(scan.stdout);
const section = (text, name) => text.split('## ' + name + '\n\n')[1]?.split('\n## ')[0].trim();
for (const [prefix, language, path, components] of [
  ['c', 'zh', 'cedar-design-web/packages/ui/docs/guide/design-token-reference.md', ['select']],
  ['mp', 'zh', 'maple-design-mobile/packages/ui/docs/designTokenReference.zh-CN.md', ['select', 'menu', 'floating-panel']],
  ['mp', 'en', 'maple-design-mobile/packages/ui/docs/designTokenReference.en-US.md', ['select', 'menu', 'floating-panel']],
]) for (const component of components) {
  test(prefix + '/' + language + '/' + component + ': authorized catalog matches current compiled consumers', () => {
    const actual = readFileSync(new URL(path, workspace), 'utf8');
    assert.equal(section(actual, component), section(renderCatalog(report, prefix, language), component));
  });
}
