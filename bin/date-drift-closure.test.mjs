import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { scanMotionSource } from './motion-source-inventory.mjs';
import { checkClassification } from './runtime-motion-classification.mjs';
import { renderCatalog } from './token-catalog.mjs';

const workspace = new URL('../../', import.meta.url);
const inventory = JSON.parse(readFileSync(new URL('../audits/motion-source-inventory.json', import.meta.url)));
const classification = JSON.parse(readFileSync(new URL('../audits/runtime-motion-classification.json', import.meta.url)));
const sourceUrl = (repo, file) => new URL(`${repo}/packages/ui/src/${file}`, workspace);
for (const [repo, file] of [
  ['cedar-design-web', 'date/picker/DateRangePicker.vue'],
  ['maple-design-mobile', 'date/style/date-picker.less'],
]) {
  test(`${repo}/${file}: authorized inventory matches actual source`, () => {
    const saved = inventory.platforms.find(p => p.repo === repo).candidates.find(c => c.file === file);
    assert.deepEqual({ file, ...scanMotionSource(file, readFileSync(sourceUrl(repo, file), 'utf8')) }, saved);
  });
}
for (const [repo, file, category] of [
  ['cedar-design-web', 'date/picker/DateRangePicker.vue', 'interaction-delay'],
]) {
  test(`${repo}/${file}: complete hash and exact responsibility remain audited`, () => {
    const row = classification.rows.find(r => r.repo === repo && r.file === file);
    const candidate = inventory.platforms.find(p => p.repo === repo).candidates.find(c => c.file === file);
    const result = checkClassification({ ...classification, rows: [row] }, {
      platforms: [{ repo, candidates: [candidate], runtimeCallCandidates: 1 }],
    }, () => readFileSync(sourceUrl(repo, file), 'utf8'));
    assert.equal(result.classifiedHints, 1);
    assert.equal(result.categories[category], 1);
  });
}

test('Maple year alignment is bounded to its scroll surface and avoids native scrollIntoView', () => {
  const file = 'date/picker-panels/YearPickerPanel.vue';
  const source = readFileSync(sourceUrl('maple-design-mobile', file), 'utf8');
  const scanned = scanMotionSource(file, source);
  assert.deepEqual(scanned.runtime, [], 'old scrollIntoView runtime hint must not remain');
  assert.match(source, /container\.scrollTop = Math\.max\(0, Math\.min\(top, container\.scrollHeight - container\.clientHeight\)\)/);
  assert.match(source, /container !== document\.body && container !== document\.documentElement/);
  assert.match(source, /viewport\.height \/ container\.offsetHeight/);
});

for (const [repo, entry, consumers] of [
  ['cedar-design-web', 'date/picker/style/index.less', [
    ['.c-picker-cell-hover-in-range .c-picker-date', 'background-color', '--c-date-picker-cell-bg-hover-in-range'],
    ['.c-picker-cell-hover-range-start .c-picker-date-value', 'background-color', '--c-date-picker-cell-hover-range-boundary-bg'],
    ['.c-picker-cell-hover-range-start .c-picker-date-value', 'outline', '--c-date-picker-preview-outline'],
  ]],
  ['maple-design-mobile', 'date/style/index.less', [
    ['.mp-date-picker .mp-year-picker li.mp-year-picker__range::before', 'background', '--mp-date-picker-range-background'],
    ['.mp-date-picker .mp-year-picker li[class*="__range--preview"]::before', 'background', '--mp-date-picker-range-preview-background'],
    ['.mp-date-picker .mp-year-picker li[class*="__range--preview"][class*="__range--start"] button', 'outline', '--mp-date-picker-range-preview-outline'],
    ['.mp-date-picker .mp-year-picker li.mp-year-picker__range--disabled::before', 'background', '--mp-date-picker-range-disabled-background'],
  ]],
]) {
  test(`${repo}: actual date Less entry consumes reviewed range tokens`, async () => {
    const packageUrl = new URL(repo + '/packages/' + (repo.startsWith('cedar') ? 'ui' : 'cli') + '/package.json', workspace);
    const less = createRequire(packageUrl)('less');
    const postcss = createRequire(new URL('cedar-design-web/packages/ui/package.json', workspace))('postcss');
    const filename = fileURLToPath(sourceUrl(repo, entry));
    const css = postcss.parse((await less.render(readFileSync(filename, 'utf8'), { filename, javascriptEnabled: true })).css);
    for (const [selector, property, token] of consumers) {
      let found = false;
      css.walkRules(rule => {
        // CSS attribute selectors retain author quote style; both quotes select the same class substring.
        if (rule.selectors.some(value => value.replaceAll("'", '"') === selector)) rule.walkDecls(property, decl => { if (decl.value.includes(`var(${token})`)) found = true; });
      });
      assert.ok(found, `${selector}/${property}/${token}`);
    }
  });
}
const run = spawnSync(process.execPath, [fileURLToPath(new URL('./token-inventory.mjs', import.meta.url))], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
assert.equal(run.status, 0, run.stderr);
const report = JSON.parse(run.stdout);
const section = (text, name) => text.split('## ' + name + '\n\n')[1]?.split('\n## ')[0].trim();
for (const [platform, language, component, file] of [
  ['c', 'zh', 'date/picker', 'cedar-design-web/packages/ui/docs/guide/design-token-reference.md'],
  ['mp', 'zh', 'date', 'maple-design-mobile/packages/ui/docs/designTokenReference.zh-CN.md'],
  ['mp', 'en', 'date', 'maple-design-mobile/packages/ui/docs/designTokenReference.en-US.md'],
]) {
  test(`${platform}/${language}: authorized date catalog section matches compiled report`, () => {
    assert.equal(section(readFileSync(new URL(file, workspace), 'utf8'), component), section(renderCatalog(report, platform, language), component));
  });
}
