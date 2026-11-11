import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderCatalog } from './token-catalog.mjs';

const root = new URL('../../cedar-design-web/packages/ui/', import.meta.url);
const require = createRequire(new URL('package.json', root));
const less = require('less');
const postcss = require('postcss');
const entry = new URL('src/filter-form/style/index.less', root);
const compiled = postcss.parse((await less.render(readFileSync(entry, 'utf8'), {
  filename: fileURLToPath(entry), javascriptEnabled: true,
})).css);
const declaration = (selector, property) => {
  let value;
  compiled.walkRules(rule => {
    if (rule.selector === selector) rule.walkDecls(property, decl => { value = decl.value; });
  });
  return value;
};
const scan = spawnSync(process.execPath, [fileURLToPath(new URL('./token-inventory.mjs', import.meta.url))], {
  encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
});
assert.equal(scan.status, 0, scan.stderr);
const report = JSON.parse(scan.stdout);
const cedar = report.components.filter(row => row.platform === 'c' && ['filter-form', 'form'].includes(row.component));
const section = (text, name) => text.split(`## ${name}\n\n`)[1]?.split('\n## ')[0].trim();

test('compiled FilterForm declarations reach real terminal selectors/properties', () => {
  const pairs = [
    ['.c-filter-form', 'padding', '--c-filter-form-padding'],
    ['.c-filter-form', 'border', '--c-filter-form-border-color'],
    ['.c-filter-form', 'border', '--c-filter-form-border-width'],
    ['.c-filter-form__actions', 'gap', '--c-filter-form-actions-gap'],
    ['.c-filter-form__action-slot', 'gap', '--c-filter-form-actions-gap'],
    ['.c-filter-form__action-item', 'padding-top', '--c-filter-form-action-offset'],
    ['.c-filter-form__collapse:hover', 'color', '--c-filter-form-collapse-hover-color'],
    ['.c-filter-form__collapse:focus-visible', 'outline', '--c-filter-form-focus-width'],
    ['.c-filter-form__collapse:focus-visible', 'outline-offset', '--c-filter-form-focus-offset'],
  ];
  for (const [selector, property, token] of pairs) assert.ok(declaration(selector, property)?.includes(`var(${token})`), `${selector}/${property}/${token}`);
  assert.equal(declaration('.c-filter-form--stacked .c-filter-form__action-item', 'padding-top'), '0');
});

test('Form aliases have transitive padding-top consumption without becoming FilterForm declarations', () => {
  const filter = cedar.find(row => row.component === 'filter-form');
  const form = cedar.find(row => row.component === 'form');
  assert.equal(filter.tokens['--c-filter-form-action-offset'].values[0], 'calc(1em * var(--c-form-line-height) + var(--c-form-vertical-label-margin-bottom))');
  for (const token of ['--c-form-line-height', '--c-form-vertical-label-margin-bottom']) {
    assert.ok(form.tokens[token].consumerProperties.includes('padding-top'));
    assert.equal(filter.tokens[token], undefined);
  }
  assert.ok(Object.values(filter.tokens).every(info => info.consumer === 'local-css'));
});

test('static FilterForm entry imports Form styles and no numeric Grid gap is claimed as a token consumer', () => {
  const source = readFileSync(new URL('src/filter-form/style/index.ts', root), 'utf8');
  assert.match(source, /import '\.\.\/\.\.\/form\/style'/);
  const row = cedar.find(row => row.component === 'filter-form');
  assert.equal(row.tokens['--c-filter-form-col-gap'], undefined);
  assert.deepEqual(row.needsManualReview, []);
});

for (const name of ['filter-form', 'form']) {
  test(`authorized generated Cedar ${name} section matches current compiled evidence`, () => {
    const actual = readFileSync(new URL('docs/guide/design-token-reference.md', root), 'utf8');
    const expected = renderCatalog({ ...report, components: cedar }, 'c', 'zh');
    assert.equal(section(actual, name), section(expected, name));
  });
}
