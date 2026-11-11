import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { demoRefs, groupDemoSections, readDemoSections, cedarDemoFamily } from './group-demo-sections.mjs';

const groups = [
  { title: '基础示例', en: 'Basic examples', cases: ['basic'] },
  { title: '列宽与自适应', en: 'Column widths and sizing', cases: ['width', 'fit'] },
  { title: '异步数据', en: 'Async data', cases: ['remote'] },
];
test('groups related demos in authored order, keeps all prose and API, and is idempotent', () => {
  const api = '## API\n\n### Props\n\n| Name | Type |\n| --- | --- |\n| width | number |\n';
  const input = '# Table\n\n介绍。\n\n## 案例\n\n### 远程\n\n<demo src="./remote.vue"></demo>\n\n### 宽度\n\n说明。\n\n<demo src="./width.vue"></demo>\n\n### 补充说明\n\n保留在宽度之后。\n\n### 基础\n\n<demo src="./basic.vue"></demo>\n\n### 铺满\n\n<demo src="./fit.vue"></demo>\n\n' + api;
  const output = groupDemoSections(input, groups);
  assert.deepEqual(demoRefs(output), ['./basic.vue', './width.vue', './fit.vue', './remote.vue']);
  assert.match(output, /## 列宽与自适应\n\n### 宽度/);
  assert.ok(output.indexOf('补充说明') > output.indexOf('./width.vue'));
  assert.ok(output.indexOf('补充说明') < output.indexOf('./fit.vue'));
  assert.ok(output.endsWith(api));
  assert.equal(groupDemoSections(output, groups), output);
});
test('moves late feature chapters and level-three examples before API without moving API tables', () => {
  const input = '# Table\n\n## 案例\n\n### 基础\n<demo src="./basic.vue"></demo>\n\n## API\n\n### Props\n| Name | Type |\n| --- | --- |\n| fit | boolean |\n\n### 铺满\n说明。\n<demo src="./fit.vue"></demo>\n\n## 远程\n远程说明。\n<demo src="./remote.vue"></demo>\n';
  const output = groupDemoSections(input, groups);
  assert.ok(output.indexOf('./remote.vue') < output.indexOf('## API'));
  assert.ok(output.indexOf('./fit.vue') < output.indexOf('## API'));
  assert.match(output, /## API\n\n### Props\n\| Name \| Type \|/);
  assert.ok(output.includes('远程说明。'));
  assert.equal(groupDemoSections(output, groups), output);
});
test('keeps multiple comparison demos and fenced Markdown in the same case', () => {
  const input = '# Table\n\n## Examples\n\n### Width\n```md\n## API\n### Unrelated\n```\n<demo src="./width.vue"></demo>\n<demo src="./remote.vue"></demo>\n\n## API\n';
  const output = groupDemoSections(input, groups, true);
  assert.ok(output.includes('## Column widths and sizing'));
  assert.ok(!output.includes('## Async data'));
  assert.deepEqual(demoRefs(output), demoRefs(input));
  assert.equal(groupDemoSections(output, groups, true), output);
});
test('preserves separate component chapters such as FormItem', () => {
  const input = '# Form\n\n## 案例\n### 基础\n<demo src="./basic.vue"></demo>\n\n## FormItem 表单项\n### 标签\n<demo src="./label.vue"></demo>\n\n## API\n';
  const output = groupDemoSections(input, groups);
  assert.ok(output.includes('## FormItem 表单项\n\n### 标签'));
  assert.deepEqual(demoRefs(output), demoRefs(input));
  assert.equal(groupDemoSections(output, groups), output);
});
test('new or duplicate assignments fail explicitly instead of silently losing cases', () => {
  const input = '# Table\n\n## 案例\n### 新增\n<demo src="./new.vue"></demo>\n\n## API\n';
  assert.throws(() => groupDemoSections(input, groups), /Ungrouped demos/);
  assert.throws(() => groupDemoSections(input, [{ title: 'A', cases: ['new'] }, { title: 'B', cases: ['new'] }]), /multiple groups/);
});

test('every authored Cedar component page has a basic group, grouped demos and a stable organization', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const directory = path.join(root, 'cedar-design-web/packages/ui/src');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/demo-groups.json'), 'utf8'));
  for (const relative of fs.readdirSync(directory, { recursive: true }).filter(file => file.endsWith('.md'))) {
    const source = fs.readFileSync(path.join(directory, relative), 'utf8');
    if (!demoRefs(source).length) continue;
    const family = cedarDemoFamily(relative);
    assert.ok(family, `unclassified component documentation: ${relative}`);
    const groups = config[family];
    assert.ok(groups?.length, relative);
    assert.equal(groups[0].title, '基础示例', relative);
    const assigned = groups.flatMap(group => group.cases);
    assert.equal(new Set(assigned).size, assigned.length, relative);
    const output = groupDemoSections(source, groups, relative.endsWith('.en-US.md'));
    assert.deepEqual(demoRefs(output).sort(), demoRefs(source).sort(), relative);
    assert.equal(output, source, relative);
    const first = readDemoSections(source).cases[0];
    assert.ok(groups[0].cases.includes(path.basename(first.refs[0], '.vue')), `${relative}: first example is not basic`);
    assert.doesNotMatch(output, /^## (案例|Examples|Demos|示例)$/m, relative);
  }
});

test('feature groups beginning with Events are not treated as API boundaries', () => {
  const source = '# Popup\n\n## Events and motion\n\n### Motion\n\n<demo src="./remote.vue"></demo>\n\n## API\n\n| Prop | Type |\n| --- | --- |\n| open | boolean |\n';
  const output = groupDemoSections(source, groups, true);
  assert.ok(output.includes('## Async data'));
  assert.ok(output.indexOf('./remote.vue') < output.indexOf('## API'));
  assert.equal(groupDemoSections(output, groups, true), output);
});

test('orphan cases before the first level-two chapter join their feature groups', () => {
  const source = '---\nlang: en-US\n---\n\n# Input\n\nIntro.\n\n### Remote\n<demo src="./remote.vue"></demo>\n\n## Examples\n\n### Basic\n<demo src="./basic.vue"></demo>\n\n## API\n';
  const output = groupDemoSections(source, groups, true);
  assert.ok(output.startsWith('---\nlang: en-US\n---\n\n# Input\n\nIntro.'));
  assert.deepEqual(demoRefs(output), ['./basic.vue', './remote.vue']);
  assert.equal(groupDemoSections(output, groups, true), output);
});

test('bare demos before a document title keep the title outside the case', () => {
  const source = '<demo src="./remote.vue"></demo>\n\n# Input\n\nIntroduction.\n\n## Examples\n\n### Basic\n<demo src="./basic.vue"></demo>\n\n## API\n';
  const output = groupDemoSections(source, groups, true);
  assert.ok(output.startsWith('# Input\n\nIntroduction.'));
  assert.deepEqual(demoRefs(output), ['./basic.vue', './remote.vue']);
  assert.doesNotMatch(output, /^###\s*$/m);
  assert.equal(groupDemoSections(output, groups, true), output);
});

test('combined field and panel pages retain separate API tables outside examples', () => {
  const source = '# Date\n\n## 案例\n\n### 基础\n<demo src="./basic.vue"></demo>\n\n### 面板\n<demo src="./width.vue"></demo>\n\n### API\n\n### Props\n| Panel | Type |\n| --- | --- |\n| type | string |\n\n## API\n\n### Props\n| Field | Type |\n| --- | --- |\n| model-value | Date |\n';
  const output = groupDemoSections(source, groups);
  assert.ok(output.indexOf('| Panel | Type |') > output.indexOf('## DatePicker API'));
  assert.ok(output.indexOf('| Field | Type |') > output.indexOf('## API'));
  assert.equal(groupDemoSections(output, groups), output);
});
