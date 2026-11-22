import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../maple-design-mobile/packages/cli/package.json', import.meta.url));
const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc');
import { groupMapleExamples, readMapleExamples, groupId } from './group-maple-examples.mjs';
import { demoRefs, groupDemoSections, readDemoSections } from './group-demo-sections.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const groups = [
  { title: '基础示例', en: 'Basic examples', cases: ['basic-usage'] },
  { title: '交互与控制', en: 'Interaction and control', cases: ['controlled'] },
];
function readDocument(directory, family, lang, visited = new Set()) {
  assert.ok(!visited.has(family), `${family}: documentation redirect cycle`);
  visited.add(family);
  const file = path.join(directory, family, 'docs', `${lang}.md`);
  assert.ok(fs.existsSync(file), `${family}: missing ${lang} documentation`);
  const source = fs.readFileSync(file, 'utf8');
  const redirect = /^---\s*\n[\s\S]*?^redirectTo:\s*\/([^/\s]+)\/([\w-]+)\s*$/m.exec(source);
  if (!redirect) return { file, source, family };
  assert.equal(redirect[1], lang, `${family}: redirect changes language`);
  const target = redirect[2].replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
  return readDocument(directory, target, lang, visited);
}
test('redirected guides preserve locale and reject broken targets and cycles', () => {
  const directory = fs.mkdtempSync('/tmp/maple-guide-redirect-');
  const write = (family, source) => {
    const folder = path.join(directory, family, 'docs');
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, 'zh-CN.md'), source);
  };
  try {
    write('provider', '---\nredirectTo: /zh-CN/themes\n---\n');
    write('themes', '# Themes\n');
    assert.equal(readDocument(directory, 'provider', 'zh-CN').family, 'themes');
    write('themes', '---\nredirectTo: /zh-CN/provider\n---\n');
    assert.throws(() => readDocument(directory, 'provider', 'zh-CN'), /redirect cycle/);
    write('provider', '---\nredirectTo: /en-US/themes\n---\n');
    assert.throws(() => readDocument(directory, 'provider', 'zh-CN'), /changes language/);
    write('provider', '---\nredirectTo: /zh-CN/missing\n---\n');
    assert.throws(() => readDocument(directory, 'provider', 'zh-CN'), /missing zh-CN documentation/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
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
  const directory = path.join(root, 'maple-design-mobile/packages/ui/src');
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
    const { source: zh, file: zhFile, family: documentFamily } = readDocument(directory, family, 'zh-CN');
    const zhNames = new Set(demoRefs(zh).map(ref => path.basename(ref, '.vue').replace(/\.en-US$/, '')));
    for (const name of phoneNames) assert.ok(zhNames.has(name), `${family}: phone demo not documented: ${name}`);
    if (documentFamily === family) {
      for (const name of zhNames) assert.ok(phoneNames.has(name), `${family}: documented demo missing from phone: ${name}`);
    } else {
      // Redirected families share a canonical guide. Verify actual source paths,
      // while that guide's own gallery is checked in its inventory iteration.
      const documented = new Set(demoRefs(zh).map(ref => path.resolve(path.dirname(zhFile), ref)));
      for (const item of parsed.cases) for (const ref of item.refs) {
        assert.ok(documented.has(path.resolve(path.dirname(entry), ref)), `${family}: redirected guide omits ${ref}`);
      }
    }
    for (const lang of ['zh-CN', 'en-US']) {
      const { file, source: doc, family: targetFamily } = readDocument(directory, family, lang);
      assert.equal(targetFamily, documentFamily, `${family}: locale redirects disagree`);
      const documentGroups = config[targetFamily];
      assert.ok(documentGroups?.length, `${family}: missing canonical guide groups`);
      assert.ok(demoRefs(doc).length, `${family}: empty ${lang} examples`);
      assert.equal(groupDemoSections(doc, documentGroups, lang === 'en-US'), doc, file);
      assert.doesNotMatch(doc, /^## (案例|Examples|Demos|示例)$/m, file);
      for (const ref of demoRefs(doc)) assert.ok(fs.existsSync(path.resolve(path.dirname(file), ref)), `${family}: missing source ${ref}`);
      const first = readDemoSections(doc).cases[0];
      assert.ok(documentGroups[0].cases.includes(path.basename(first.refs[0], '.vue')), `${family}: first ${lang} example is not basic`);
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
  // Maple 的 table 已跨端分离，按移动端自己的三章分类演进（基础展示 / 冻结与滚动 /
  // 数据操作与状态），不再跟随 Cedar 桌面端的九章；其余家族仍要求章节名与相对顺序一致。
  const mapleOwnedFamilies = ['color', 'typography', 'themes', 'table'];
  for (const [family, groups] of Object.entries(maple)) {
    if (!cedar[family] || mapleOwnedFamilies.includes(family)) continue;
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
