import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../maple-design-mobile/packages/maple-cli/package.json', import.meta.url));
const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc');
import { groupMapleExamples, readMapleExamples, groupId } from './group-maple-examples.mjs';
import { demoRefs, groupDemoSections, readDemoSections } from './group-demo-sections.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const groups = [
  { title: '基础示例', en: 'Basic examples', cases: ['basic-usage'] },
  { title: '交互与控制', en: 'Interaction and control', cases: ['controlled'] },
];
test('phone entries follow source-backed cases, preserve bindings and styles, and stay idempotent', () => {
  const script = `<script setup>\nimport Basic from './demos/basic-usage.vue'\nimport Controlled from './demos/controlled.vue'\nconst value = 'unchanged'\n</script>`;
  const style = '<style scoped>section { min-width: 0; }</style>';
  const source = `${script}\n<template>\n  <section data-demo="controlled"><Controlled :value="value" /></section>\n  <section data-demo="basic"><Basic /></section>\n</template>\n${style}\n`;
  const output = groupMapleExamples(source, groups);
  assert.deepEqual(readMapleExamples(output).cases.map(c => c.id), ['basic', 'controlled']);
  assert.ok(output.includes(script));
  assert.ok(output.includes(style));
  assert.ok(output.includes('<span lang="zh-CN">基础示例</span>'));
  assert.ok(output.includes('<span lang="en-US">Basic examples</span>'));
  assert.equal(groupMapleExamples(output, groups), output);
});
test('keeps layout guidance in the basic group and rejects unclassified inline content', () => {
  const source = `<script setup>import Basic from './basic-usage.vue'</script>\n<template>\n<section aria-labelledby="layout-usage-title"><h3 id="layout-usage-title">布局说明</h3></section>\n<section data-demo="basic"><Basic /></section>\n</template>`;
  const output = groupMapleExamples(source, groups);
  assert.ok(output.indexOf('data-demo-group="basic-examples"') < output.indexOf('布局说明'));
  assert.ok(output.includes('aria-labelledby="layout-usage-title"'));
  assert.equal(groupMapleExamples(output, groups), output);
  assert.throws(() => groupMapleExamples('<template><div>未分类</div></template>', groups), /inline content/);
});
test('every Maple family has grouped documents and a matching source-backed phone gallery', () => {
  const directory = path.join(root, 'maple-design-mobile/packages/maple-ui/src');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/demo-groups.maple.json'), 'utf8'));
  const report = [];
  for (const relative of fs.readdirSync(directory, { recursive: true }).filter(file => /\/docs\/zh-CN\.md$/.test(file))) {
    const family = relative.replace(/\/docs\/zh-CN\.md$/, '');
    const groups = config[family];
    assert.ok(groups?.length, family);
    assert.equal(groups[0].title, '基础示例', family);
    const names = groups.flatMap(group => group.cases);
    assert.equal(new Set(names).size, names.length, family);
    const entry = path.join(directory, family, 'example/index.vue');
    assert.ok(fs.existsSync(entry), `${family}: missing phone gallery`);
    const source = fs.readFileSync(entry, 'utf8');
    const parsed = readMapleExamples(source);
    const { descriptor, errors } = parse(source, { filename: entry });
    assert.deepEqual(errors, [], entry);
    const script = compileScript(descriptor, { id: entry });
    assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: entry, id: entry, compilerOptions: { bindingMetadata: script.bindings } }).errors, [], entry);
    assert.ok(parsed.cases.length, `${family}: empty phone gallery`);
    assert.equal(groupMapleExamples(source, groups), source, family);
    const expectedGroups = groups.filter(group => parsed.cases.some(item => group.cases.includes(item.name))).map(groupId);
    assert.deepEqual([...source.matchAll(/data-demo-group="([^"]+)"/g)].map(match => match[1]), expectedGroups, family);
    const phoneNames = new Set(parsed.cases.flatMap(item => item.refs.map(ref => path.basename(ref, '.vue').replace(/\.en-US$/, ''))));
    const zhFile = path.join(directory, relative);
    const zh = fs.readFileSync(zhFile, 'utf8');
    const zhNames = new Set(demoRefs(zh).map(ref => path.basename(ref, '.vue').replace(/\.en-US$/, '')));
    for (const name of phoneNames) assert.ok(zhNames.has(name), `${family}: phone demo not documented: ${name}`);
    for (const name of zhNames) assert.ok(phoneNames.has(name), `${family}: documented demo missing from phone: ${name}`);
    for (const lang of ['zh-CN', 'en-US']) {
      const file = path.join(directory, family, 'docs', `${lang}.md`);
      assert.ok(fs.existsSync(file), `${family}: missing ${lang} documentation`);
      const doc = fs.readFileSync(file, 'utf8');
      assert.ok(demoRefs(doc).length, `${family}: empty ${lang} examples`);
      assert.equal(groupDemoSections(doc, groups, lang === 'en-US'), doc, file);
      assert.doesNotMatch(doc, /^## (案例|Examples|Demos|示例)$/m, file);
      for (const ref of demoRefs(doc)) assert.ok(fs.existsSync(path.resolve(path.dirname(file), ref)), `${family}: missing source ${ref}`);
      const first = readDemoSections(doc).cases[0];
      assert.ok(groups[0].cases.includes(path.basename(first.refs[0], '.vue')), `${family}: first ${lang} example is not basic`);
    }
    report.push({ family, groups: groups.length, scenarios: parsed.cases.length });
  }
  assert.equal(report.length, Object.keys(config).length);
});
test('shared scenarios use the same feature groups and relative order on Cedar and Maple', () => {
  const configs = path.join(root, 'design-ui/configs');
  const cedar = JSON.parse(fs.readFileSync(path.join(configs, 'demo-groups.json'), 'utf8'));
  const maple = JSON.parse(fs.readFileSync(path.join(configs, 'demo-groups.maple.json'), 'utf8'));
  const aliases = JSON.parse(fs.readFileSync(path.join(configs, 'demo-case-aliases.maple.json'), 'utf8'));
  for (const [family, groups] of Object.entries(maple)) {
    if (!cedar[family] || ['color', 'typography', 'themes'].includes(family)) continue;
    const canonical = name => aliases[family]?.[name] ?? (name === 'basic-usage' ? 'basic' : name);
    for (const group of groups) {
      const shared = [...new Set(group.cases.map(canonical).filter(name => cedar[family].some(g => g.cases.includes(name))))];
      for (const name of shared) assert.equal(cedar[family].find(g => g.cases.includes(name)).title, group.title, `${family}/${name}`);
      const order = cedar[family].find(g => g.title === group.title)?.cases ?? [];
      assert.deepEqual(shared, [...shared].sort((a, b) => order.indexOf(a) - order.indexOf(b)), `${family}/${group.title}`);
    }
    const cedarTitles = cedar[family].map(g => g.title);
    const sharedTitles = groups.map(g => g.title).filter(title => cedarTitles.includes(title));
    assert.deepEqual(sharedTitles, [...sharedTitles].sort((a, b) => cedarTitles.indexOf(a) - cedarTitles.indexOf(b)), family);
  }
});
