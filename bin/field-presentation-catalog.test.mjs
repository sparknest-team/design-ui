import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { collectStyleGraph, tokenStyleLayout } from './token-style-entries.mjs';
import { renderCatalog } from './token-catalog.mjs';

const ts = createRequire(new URL('../../cedar-design-web/packages/cedar-ui/package.json', import.meta.url))('typescript');
test('real static import graph follows private style.ts once, including cycles', () => {
  const root = '/fixture/src';
  const files = new Map([
    [root + '/select/style/index.ts', "import '../../_components/field-presentation/style'"],
    [root + '/_components/field-presentation/style.ts', "import './style.less'; import '../../select/style'"],
    [root + '/_components/field-presentation/style.less', ''],
  ]);
  const graph = collectStyleGraph(root, [...files.keys()], file => files.get(file), file => files.has(file), ts);
  assert.equal(graph.modules.size, 2);
  assert.deepEqual([...graph.less], [root + '/_components/field-presentation/style.less']);
});
test('comment/type-only style imports and orphan style.ts cannot claim executable consumption', () => {
  const root = '/fixture/src';
  const files = new Map([
    [root + '/select/style/index.ts', "// import '../../_components/orphan/style'\nimport type {} from '../../_components/orphan/style'"],
    [root + '/_components/orphan/style.ts', "import './style.less'"],
    [root + '/_components/orphan/style.less', ''],
  ]);
  const graph = collectStyleGraph(root, [...files.keys()], file => files.get(file), file => files.has(file), ts);
  assert.equal(graph.less.size, 0);
  assert.equal(graph.modules.size, 1);
});
test('style import graph cannot claim files outside the platform source root', () => {
  const root = '/fixture/src';
  const files = new Map([[root + '/select/style/index.ts', "import '../../../../outside.less'"], ['/outside.less', '']]);
  const graph = collectStyleGraph(root, [...files.keys()], file => files.get(file), file => files.has(file), ts);
  assert.equal(graph.less.size, 0);
});

test('adjacent private tokens require an actual reachable style module and retain their real source path', () => {
  const root = '/fixture/src';
  const entry = root + '/_components/field-presentation/style.less';
  const module = root + '/_components/field-presentation/style.ts';
  const file = root + '/_components/field-presentation/token.less';
  const graph = { modules: new Set([module]), less: new Set([entry]) };
  const row = tokenStyleLayout(root, file, graph, path => [entry, module, file].includes(path));
  assert.equal(row.error, undefined);
  assert.equal(row.component, '_components/field-presentation');
  assert.equal(row.declarationSource, '_components/field-presentation/token.less');
  assert.equal(row.entry, entry);
  assert.equal(row.internal, true);
});
test('an unconsumed adjacent private directory cannot silently pass the gate', () => {
  const row = tokenStyleLayout('/fixture/src', '/fixture/src/_components/orphan/token.less',
    { modules: new Set(), less: new Set() }, () => true);
  assert.ok(row.error);
});
test('legacy public style layout is preserved and missing entries remain errors', () => {
  const file = '/fixture/src/button/style/token.less';
  const graph = { modules: new Set(), less: new Set() };
  const row = tokenStyleLayout('/fixture/src', file, graph, () => true);
  assert.equal(row.component, 'button');
  assert.equal(row.internal, false);
  assert.equal(row.error, undefined);
  assert.ok(tokenStyleLayout('/fixture/src', file, graph, () => false).error);
});
test('catalog shows real declaration source and keeps adjacent implementation tokens internal', () => {
  const text = renderCatalog({ totals: { errors: 0 }, components: [{ platform: 'c', component: '_components/field-presentation',
    declarationSource: '_components/field-presentation/token.less', tokens: {
      '--c-field-presentation-gap': { visibility: 'internal', consumer: 'local-css', values: ['var(--c-sys-space-3)'], consumerProperties: ['gap'] },
    } }] }, 'c', 'en');
  assert.match(text, /src\/_components\/field-presentation\/token.less/);
  assert.doesNotMatch(text, /field-presentation\/style\/token.less/);
  assert.match(text, /Internal/);
});

test('real two-platform private entries compile and all four tokens have terminal CSS consumers', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./token-inventory.mjs', import.meta.url))], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || 'strict token report must succeed');
  const report = JSON.parse(result.stdout);
  assert.equal(report.totals.errors, 0);
  for (const prefix of ['c', 'mp']) {
    const row = report.components.find(r => r.platform === prefix && r.component === '_components/field-presentation');
    assert.ok(row);
    assert.equal(row.declarationSource, '_components/field-presentation/token.less');
    for (const [suffix, property] of [['gap', 'gap'], ['padding', 'padding'], ['min-width', 'min-width'], ['max-height', 'max-height']]) {
      const token = row.tokens[`--${prefix}-field-presentation-${suffix}`];
      assert.equal(token.visibility, 'internal');
      assert.equal(token.consumer, 'local-css');
      assert.ok(token.consumerProperties.includes(property));
    }
    const repo = prefix === 'c' ? 'cedar-design-web/packages/cedar-ui' : 'maple-design-mobile/packages/maple-ui';
    const source = readFileSync(new URL(`../../${repo}/src/select/style/index.ts`, import.meta.url), 'utf8');
    assert.match(source, /import ['"]\.\.\/\.\.\/_components\/field-presentation\/style['"]/);
  }
});
