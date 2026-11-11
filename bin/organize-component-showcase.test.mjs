import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { organizeDemoSections, removeReviewBlocks } from './organize-component-showcase.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));

test('removes marked and legacy review panels without swallowing subsequent API sections', () => {
  const input = '# Input\n\n<!-- api-review:start -->\n### 功能调试\n<demo src="./api-review.vue"></demo>\n<!-- api-review:end -->\n\n## API\n\n| Prop | Type |\n| --- | --- |\n| value | string |\n';
  const output = removeReviewBlocks(input);
  assert.ok(!output.includes('api-review'));
  assert.ok(output.includes('## API\n\n| Prop | Type |'));
  const legacy = '# Button\n\n### Feature playground\n<demo src="./api-review.vue"></demo>\n\n## API\nPublic API.\n';
  assert.equal(removeReviewBlocks(legacy), '# Button\n\n## API\nPublic API.\n');
});

test('keeps fenced documentation examples and explanation headings attached to their case', () => {
  const source = '# Input\n\n## 案例\n\n### 异步搜索\n<demo src="./remote.vue"></demo>\n\n### 使用说明\nOnly the latest request applies.\n\n```md\n### 基础用法\n```\n\n### 基础用法\n<demo src="./basic.vue"></demo>\n\n## API\n| Props | Type |\n| --- | --- |\n| value | string |\n';
  const output = organizeDemoSections(source);
  assert.ok(output.indexOf('./basic.vue') < output.indexOf('./remote.vue'));
  assert.ok(output.indexOf('./remote.vue') < output.indexOf('Only the latest'));
  assert.ok(output.endsWith(source.slice(source.indexOf('## API'))));
  assert.equal(organizeDemoSections(output), output);
});

test('orders states before remote data and business composition', () => {
  const source = '# Select\n\n## 案例\n\n### 业务组合\n<demo src="./workbench.vue"></demo>\n\n### 远程\n<demo src="./remote.vue"></demo>\n\n### 尺寸\n<demo src="./size.vue"></demo>\n\n### 基础\n<demo src="./basic.vue"></demo>\n\n## API\n';
  const output = organizeDemoSections(source);
  const positions = ['basic', 'size', 'remote', 'workbench'].map(name => output.indexOf(`./${name}.vue`));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test('shared platform order overrides filename heuristics without losing API', () => {
  const source = '# Select\n\n## Examples\n\n### Basic\n```demo\n./basic.vue\n```\n\n### Remote\n```demo\n./remote.vue\n```\n\n### Custom\n```demo\n./custom.vue\n```\n\n## API\nThe API.\n';
  const output = organizeDemoSections(source, ['basic', 'custom', 'remote']);
  assert.ok(output.indexOf('./custom.vue') < output.indexOf('./remote.vue'));
  assert.ok(output.endsWith('## API\nThe API.\n'));
});

test('catalog covers every category exactly once and all demo and reference targets exist', () => {
  const ui = path.join(root, 'cedar-design-web/packages/ui');
  const catalog = JSON.parse(fs.readFileSync(path.join(ui, 'docs/.vuepress/configs/component-catalog.json'), 'utf8'));
  const unique = new Set(catalog.components.map(item => item.id));
  assert.equal(unique.size, catalog.components.length);
  const groups = new Set(catalog.groups.map(item => item.id));
  for (const item of catalog.components) {
    assert.ok(groups.has(item.group), item.id);
    assert.ok(item.feature?.length, item.id);
    for (const demo of item.demos) assert.ok(fs.existsSync(path.join(ui, demo.source)), `${item.id}: ${demo.source}`);
    for (const reference of item.references) {
      assert.match(reference.url, /github\.com\/.*\/(tree|blob)\/[a-f0-9]{40}\//);
      for (const sample of reference.samples) assert.ok(fs.existsSync(path.join(root, reference.library, sample.file)), sample.file);
    }
  }
});

test('public component documentation and mobile entries contain no review module', () => {
  for (const library of ['cedar-design-web/packages/ui', 'maple-design-mobile/packages/ui']) {
    const directory = path.join(root, library, 'src');
    for (const relative of fs.readdirSync(directory, { recursive: true })) {
      if (!relative.endsWith('.md') && !relative.endsWith('/example/index.vue')) continue;
      const source = fs.readFileSync(path.join(directory, relative), 'utf8');
      assert.doesNotMatch(source, /<!-- api-review:|<demo[^>]+api-review|data-demo="api-review"|import .+ from ['"][^'"\n]*api-review/, relative);
    }
  }
});

test('every registered runtime component or directive is represented by a catalog family', () => {
  const ui = path.join(root, 'cedar-design-web/packages/ui');
  const entry = fs.readFileSync(path.join(ui, 'src/cedar-vue.ts'), 'utf8');
  const catalog = JSON.parse(fs.readFileSync(path.join(ui, 'docs/.vuepress/configs/component-catalog.json'), 'utf8'));
  const registered = new Set([
    ...[...entry.matchAll(/^  ([A-Z]\w+): \w+ as Plugin/gm)].map(match => match[1]),
    ...[...entry.matchAll(/^  ([A-Z]\w+),$/gm)].map(match => match[1]),
  ]);
  const documented = new Set(catalog.components.flatMap(item => [
    item.id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(''),
    ...item.members,
  ]));
  assert.deepEqual([...registered].filter(name => !documented.has(name)), []);
});
