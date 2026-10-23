import { test } from 'node:test';
import assert from 'node:assert/strict';
import { organizeSections } from './organize-demo-pages.mjs';

test('sorts cases despite explanation-only headings, keeping related prose attached', () => {
  const input = '# Select\n\n## 案例\n\n### 复杂案例\n\n<demo src="./slots-review.vue"></demo>\n\n### 使用说明\n\n保留这一段说明。\n\n### 基础用法\n\n<demo src="./basic.vue"></demo>\n\n## API\n\n公开 API 保持不变。\n';
  const output = organizeSections(input);
  assert.ok(output.indexOf('### 基础用法') < output.indexOf('### 复杂案例'));
  assert.ok(output.indexOf('### 使用说明') > output.indexOf('### 复杂案例'));
  assert.ok(output.endsWith('## API\n\n公开 API 保持不变。\n'));
  assert.equal(organizeSections(output), output);
});

test('merges orphan cases into the main chapter and preserves the FormItem chapter', () => {
  const input = '# Form\n\n### 确认提交\n\n<demo src="./presentation-state.vue"></demo>\n\n## 案例\n\n### 基础用法\n\n<demo src="./basic.vue"></demo>\n\n## FormItem 表单项\n\n### 介绍\n\n字段标签说明。\n\n### 外置标签\n\n<demo src="./label.vue"></demo>\n\n## API\n';
  const output = organizeSections(input);
  assert.equal((output.match(/^## 案例$/gm) || []).length, 1);
  assert.ok(output.indexOf('### 基础用法') < output.indexOf('### 确认提交'));
  assert.ok(output.indexOf('## FormItem 表单项') > output.indexOf('### 确认提交'));
  assert.ok(output.includes('### 介绍\n\n字段标签说明。'));
  assert.equal(organizeSections(output), output);
});

test('recognizes Maple fenced demos and basic headings with non-basic filenames', () => {
  const input = '# Select\n\n### 介绍\n\n使用说明。\n\n### Async race\n\n```demo\n../example/demos/race.vue\n```\n\n### 基础用法\n\n```demo\n../example/standard.vue\n```\n\n## API\n';
  const output = organizeSections(input);
  assert.ok(output.indexOf('### 介绍') < output.indexOf('### 基础用法'));
  assert.ok(output.indexOf('### 基础用法') < output.indexOf('### Async race'));
  assert.equal(organizeSections(output), output);
});

test('basic-usage and 基本使用 precede disabled and readonly cases', () => {
  const input = '# Checkbox\n\n## 案例\n\n### 禁用\n\n```demo\n./disabled.vue\n```\n\n### 只读\n\n```demo\n./readonly.vue\n```\n\n### 基本使用\n\n```demo\n./basic-usage.vue\n```\n\n## API\n';
  const output = organizeSections(input);
  assert.ok(output.indexOf('### 基本使用') < output.indexOf('### 禁用'));
  assert.equal(organizeSections(output), output);
});

test('retains English chapter names and does not duplicate Examples', () => {
  const input = '# Input\n\n## Examples\n\n### Advanced\n\n```demo\n./review.vue\n```\n\n### Basic usage\n\n```demo\n./basic.vue\n```\n\n## API\n';
  const output = organizeSections(input);
  assert.equal((output.match(/^## Examples$/gm) || []).length, 1);
  assert.ok(output.indexOf('### Basic usage') < output.indexOf('### Advanced'));
  assert.equal(organizeSections(output), output);
});

test('preserves standalone level-two feature chapters without accumulating whitespace', () => {
  const input = '# Tooltip\n\n## 基础用法\n\n<demo src="./basic.vue"></demo>\n\n## 位置\n\n说明。\n\n<demo src="./placement.vue"></demo>\n\n## API\n';
  const output = organizeSections(input);
  assert.equal(organizeSections(output), output);
  assert.ok(output.includes('## 位置\n\n说明。'));
});

test('uses the same paired-case order inside each feature level', () => {
  const input = '# Input\n\n## 案例\n\n### B\n\n<demo src="./b.vue"></demo>\n\n### A\n\n<demo src="./a.vue"></demo>\n\n## API\n';
  assert.ok(organizeSections(input, ['a', 'b']).indexOf('### A') < organizeSections(input, ['a', 'b']).indexOf('### B'));
});

test('restores headings accidentally concatenated onto a table row', () => {
  const input = '# Button\n\n## 案例\n\n### 动效\n\n| Token | Default |\n| --- | --- |\n| duration | standard |### 按钮组布局\n\n<demo src="./button-group-layout.vue"></demo>\n\n## API\n';
  const output = organizeSections(input);
  assert.ok(output.includes('| duration | standard |\n\n### 按钮组布局'));
  assert.equal(organizeSections(output), output);
});
