import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { renderCatalog } from './token-catalog.mjs';
import { checkClassification } from './runtime-motion-classification.mjs';

const root = new URL('../../maple-design-mobile/packages/ui/src/', import.meta.url);
const less = createRequire(new URL('../../maple-design-mobile/packages/cli/package.json', import.meta.url))('less');
const postcss = createRequire(new URL('../../cedar-design-web/packages/ui/package.json', import.meta.url))('postcss');
test('Cedar DateRangePicker current hash, interaction-delay and exact call-site are revalidated independently', () => {
  const classification = JSON.parse(readFileSync(new URL('../audits/runtime-motion-classification.json', import.meta.url), 'utf8'));
  const inventory = JSON.parse(readFileSync(new URL('../audits/motion-source-inventory.json', import.meta.url), 'utf8'));
  const row = classification.rows.find(r => r.repo === 'cedar-design-web' && r.file === 'date/picker/DateRangePicker.vue');
  const candidate = inventory.platforms.find(p => p.repo === row.repo).candidates.find(r => r.file === row.file);
  const source = readFileSync(new URL('../../cedar-design-web/packages/ui/src/' + row.file, import.meta.url), 'utf8');
  const result = checkClassification({ ...classification, rows: [row] }, {
    platforms: [{ repo: row.repo, runtimeCallCandidates: candidate.runtime.length, candidates: [candidate] }],
  }, () => source);
  assert.equal(result.classifiedHints, 1);
  assert.equal(result.unclassifiedHints, 0);
  assert.equal(result.categories['interaction-delay'], 1);
});
async function compile(component, dependencies = []) {
  const entry = new URL(component + '/style/index.less', root);
  return postcss.parse((await less.render([
    readFileSync(entry, 'utf8'),
    ...dependencies.map(name => '@import "' + name + '/style/index.less";'),
  ].join('\n'), { filename: fileURLToPath(entry), paths: [fileURLToPath(root)], javascriptEnabled: true })).css);
}
function values(css, selector, property, reduced = false) {
  const found = [];
  css.walkRules(rule => {
    const isReduced = rule.parent.type === 'atrule' && rule.parent.params === '(prefers-reduced-motion: reduce)';
    if (rule.selectors.includes(selector) && isReduced === reduced)
      rule.walkDecls(property, decl => found.push(decl.value));
  });
  return found;
}

test('Carousel actual track/fade/card timing and reduced rules retain the parallel fade grid repair', async () => {
  const css = await compile('carousel');
  for (const [selector, token] of [
    ['.mp-carousel__track', '--mp-carousel-transition-duration'],
    ['.mp-carousel--fade .mp-carousel-item', '--mp-carousel-fade-duration'],
    ['.mp-carousel--card .mp-carousel-item', '--mp-carousel-card-duration'],
  ]) {
    assert.ok(values(css, selector, 'transition').some(v => v.includes(token)));
    assert.ok(values(css, selector, 'transition', true).includes('none'));
  }
  assert.ok(values(css, '.mp-carousel--fade .mp-carousel-item', 'grid-area').includes('1 / 1'));
});

for (const component of ['date-range', 'time-range']) {
  test(component + ': scoped surface aliases reach real picker and nested panel backgrounds', async () => {
    const css = await compile(component, ['picker', 'date', 'time']);
    const shell = '.mp-' + component + '-picker';
    const token = '--mp-' + component + '-picker-background';
    assert.ok(values(css, ':root', token).includes('var(--mp-sys-color-surface-overlay)'));
    assert.ok(values(css, shell, 'background').includes('var(' + token + ')'));
    for (const alias of ['--mp-picker-background',
      ...(component === 'date-range' ? ['--mp-date-picker-body-background-color'] : [])])
      assert.ok(values(css, shell, alias).includes('var(' + token + ')'), alias);
    assert.ok(values(css, '.mp-picker', 'background').includes('var(--mp-picker-background)'));
    if (component === 'date-range')
      assert.ok(values(css, '.mp-date-picker__body', 'background-color').includes('var(--mp-date-picker-body-background-color)'));
  });
}
for (const [component, selectors] of [
  ['date', ['.mp-date-picker__title-year', '.mp-date-picker__title-date', '.mp-date-picker-translatey-enter-active', '.mp-date-picker__view-tab']],
]) {
  test(component + ': legacy and current panel transition declarations compile without claiming all states rendered', async () => {
    const css = await compile(component);
    for (const selector of selectors) assert.ok(values(css, selector, 'transition').length, selector);
  });
}

test('time uses the shared picker scroll motion rather than obsolete panel transition selectors', async () => {
  const css = await compile('time', ['picker']);
  assert.ok(values(css, '.mp-time-picker', 'background').includes('var(--mp-time-picker-body-background)'));
  assert.ok(values(css, '.mp-picker__scroller', 'transition-timing-function').includes('var(--mp-picker-scroll-easing)'));
  const time = readFileSync(new URL('time/presentation/TimePanelContent.vue', root), 'utf8');
  const picker = readFileSync(new URL('picker/Picker.vue', root), 'utf8');
  assert.match(time, /<mp-picker/);
  assert.match(picker, /transitionDuration: `\$\{c\.duration\}ms`/);
  assert.match(picker, /transitionProperty: c\.duration \? 'transform' : 'none'/);
});

const scan = spawnSync(process.execPath, [fileURLToPath(new URL('./token-inventory.mjs', import.meta.url))], {
  encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
});
assert.equal(scan.status, 0, scan.stderr);
const report = JSON.parse(scan.stdout);
const section = (text, name) => text.split('## ' + name + '\n\n')[1]?.split('\n## ')[0].trim();
for (const [lang, path] of [['zh', 'docs/designTokenReference.zh-CN.md'], ['en', 'docs/designTokenReference.en-US.md']]) {
  for (const component of ['date-range', 'time-range']) {
    test(lang + '/' + component + ': generated authorized section matches actual consumer graph', () => {
      const actual = readFileSync(new URL('../' + path, root), 'utf8');
      assert.equal(section(actual, component), section(renderCatalog(report, 'mp', lang), component));
    });
  }
}
