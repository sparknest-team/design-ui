import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { flattenApiStructure, markdownSections, renderSection } from './api-document-structure.mjs';
import { expandTypographyApi, typographyApi, typographyComponents } from './typography-api.mjs';
import { documentationFiles, normalizeApiHeadings } from './normalize-api-headings.mjs';
import { sourceProps } from './generate-review-demos.mjs';

const require = createRequire(new URL('../../cedar-design-web/packages/ui/package.json', import.meta.url));
const markdown = require('markdown-it')({ html: true });

test('child APIs share one flat API chapter, preserving members, prose and examples', () => {
  const props = '| Prop | Type |\n| --- | --- |\n| value | string |\n';
  const source = '# Button\n\n## Examples\n\n<demo src="./basic.vue"></demo>\n\n## API\n\n### Button Props\n\n'+props+'\n## ButtonGroup\n\n### ButtonGroup Props\n\n'+props+'\n## ButtonGroup API\n\n### ButtonGroup Slots\n\nGroup content.\n\n### SomeConfig\n\n'+props;
  const next = flattenApiStructure(source, 'Button');
  const root = markdownSections(next);
  assert.equal(root.children.filter(node => node.title === 'API').length, 1);
  assert.deepEqual(root.children.find(node => node.title === 'API').children.map(node => node.title), ['Button Props', 'ButtonGroup Props', 'ButtonGroup Slots']);
  assert.deepEqual(root.children.find(node => node.title === 'Types').children.map(node => node.title), ['SomeConfig']);
  assert.ok(next.includes('<demo src="./basic.vue"></demo>'));
  assert.ok(next.includes('Group content.'));
  assert.equal(flattenApiStructure(next, 'Button'), next);
});

test('complete formal tables replace stale fragments only when all old members are covered', () => {
  const table = rows => '| Prop | Type |\n| --- | --- |\n'+rows;
  const source = '### Input Props\n\n'+table('| value | string |\n')+'\n## API\n\n### Input Props\n\n'+table('| value | string |\n| disabled | boolean |\n');
  const next = flattenApiStructure(source, 'Input');
  assert.equal((next.match(/^### Input Props$/gm) ?? []).length, 1);
  assert.ok(next.includes('| disabled | boolean |'));
  assert.throws(() => flattenApiStructure(source.replace('| disabled | boolean |','| extra | number |').replace('### Input Props\n\n'+table('| value | string |\n'), '### Input Props\n\n'+table('| unique | string |\n')), 'Input'), /Conflicting duplicate/);
});

test('date and time contract markers keep their exact contents when API chapters move', () => {
  const contract = '<!-- date-contract:start -->\n\n### 日期合同\n\nShared field and panel rules.\n\n<!-- date-contract:end -->';
  const source = '## API\n\n### Date Props\n\nField.\n\n## Outside\n\nTimezone notes.\n\n### DatePicker Props\n\nPanel.\n\n'+contract+'\n';
  const next = flattenApiStructure(source, 'Date');
  assert.ok(next.includes(contract));
  assert.ok(!next.split('<!-- date-contract:start -->')[1].split('<!-- date-contract:end -->')[0].includes('Timezone notes'));
  assert.equal(flattenApiStructure(next, 'Date'), next);
});

test('each Typography component documents its real inherited runtime props', () => {
  const propsFile = fileURLToPath(new URL('../../cedar-design-web/packages/ui/src/typography/props.ts', import.meta.url));
  for (const locale of ['zh-CN', 'en-US']) {
    const root = markdownSections(typographyApi(locale));
    for (const component of typographyComponents) {
      const node = root.children.find(node => node.title === component+' Props');
      const documented = node.body.split('\n').filter(line => line.startsWith('|')).slice(2).map(line => line.split('|')[1].replace(/[`*_]/g,'').replace(/\s*\(v-model\)/,'').trim()).sort();
      const variable = component[0].toLowerCase()+component.slice(1)+'Props';
      assert.deepEqual(documented, sourceProps(propsFile, variable).map(prop => prop.name).sort(), locale+'/'+component);
      assert.ok(root.children.some(node => node.title === component+' Events'));
      assert.ok(root.children.some(node => node.title === component+' Slots'));
    }
  }
});

test('published component pages have one API and no standalone child API groups', () => {
  for (const {filename, primary} of documentationFiles()) {
    const source = fs.readFileSync(filename,'utf8');
    assert.equal(normalizeApiHeadings(source,primary),source,filename);
    const root = markdownSections(source);
    assert.ok(root.children.filter(node => node.title === 'API').length <= 1,filename);
    assert.ok(!root.children.some(node => /^[A-Z][\w.]+ API$/.test(node.title)),filename);
    const api = root.children.find(node => node.title === 'API');
    if (api) assert.ok(!renderSection(api).includes('### Common '),filename);
  }
});

test('normalizing an expanded Typography API preserves authored public slots and current behavior', () => {
  const source = '## API\n\n### Typography Slots\n\nRoot slot.\n\n' + typographyApi('en-US') + '\n\nCurrent clipboard ownership notes.\n';
  assert.equal(expandTypographyApi(source, 'en-US'), source);
});

test('rendered Button and Typography tables of contents use the same flat hierarchy', () => {
  const expected = {
    button: ['Button', 'ButtonGroup'].flatMap(name => ['Props','Events','Slots','Methods'].map(kind => name+' '+kind)),
    typography: ['Typography Slots', ...typographyComponents.flatMap(name => ['Props','Events','Slots'].map(kind => name+' '+kind))],
  };
  for (const [component, headings] of Object.entries(expected)) {
    for (const locale of ['README.md','README.en-US.md']) {
      const source = fs.readFileSync(new URL(`../../cedar-design-web/packages/ui/src/${component}/${locale}`, import.meta.url),'utf8');
      const tokens = markdown.parse(source,{});
      const actual = [];
      let active = false;
      for (let i=0;i<tokens.length;i++) {
        if (tokens[i].type!=='heading_open') continue;
        const title=tokens[i+1].content;
        if (tokens[i].tag==='h2') active=title==='API';
        else if (active) actual.push({level:tokens[i].tag,title});
      }
      assert.deepEqual(actual,headings.map(title=>({level:'h3',title})),component+'/'+locale);
    }
  }
});

test('generic types in documentation tables cannot become unclosed Vue tags', () => {
  const unsafe = [];
  for (const { filename } of documentationFiles()) {
    let inCell = false;
    for (const token of markdown.parse(fs.readFileSync(filename, 'utf8'), {})) {
      if (token.type === 'td_open') inCell = true;
      else if (token.type === 'td_close') inCell = false;
      else if (inCell && token.type === 'inline') {
        for (const child of token.children ?? []) {
          if (child.type === 'html_inline' && /^<(?:[A-Z]\w*|void|string|number|boolean)>$/.test(child.content)) {
            unsafe.push({ filename, type: token.content, tag: child.content });
          }
        }
      }
    }
  }
  assert.deepEqual(unsafe, []);
});

test('CSS references have one shared chapter and keep child components out of API tables', () => {
  const source = '# Breadcrumb\n\n## API\n\n### BreadcrumbItem Props\n\n| Prop | Type |\n| --- | --- |\n| href | string |\n\n## CSS Variables\n\nUse ThemeProvider.\n\n## BreadcrumbItem CSS Variables\n\n| Variable | Default |\n| --- | --- |\n| --mp-breadcrumb-color | red |\n';
  const next = normalizeApiHeadings(source, 'Breadcrumb');
  const tree = markdownSections(next);
  assert.equal(tree.children.filter(node => node.title === 'CSS Variables').length, 1);
  assert.deepEqual(tree.children.find(node => node.title === 'CSS Variables').children.map(node => node.title), ['BreadcrumbItem']);
  assert.ok(next.includes('| href | string |'));
  assert.ok(next.includes('| --mp-breadcrumb-color | red |'));
  assert.equal(normalizeApiHeadings(next, 'Breadcrumb'), next);
});

test('CSS reference aliases move out of API and Types without changing examples or defaults', () => {
  const demo = '### Longer motion tokens\n\n```demo\n./motion.vue\n```\n';
  const code = '```md\n## Motion variables\n| --c-test-duration | 200ms |\n```\n';
  const source = '# Test\n\n## Examples\n\n'+demo+'\n'+code+'\n## API\n\n### Test Props\n\n| Prop | Type |\n| --- | --- |\n| active | boolean |\n\n### Motion variables\n\n| Token | Default |\n| --- | --- |\n| --c-test-duration | 200ms |\n\n## CSS 变量职责与完整默认值\n\n| Token | Default |\n| --- | --- |\n| --c-test-color | red |\n';
  const next = normalizeApiHeadings(source, 'Test');
  const tree = markdownSections(next);
  assert.ok(next.includes(demo));
  assert.ok(next.includes(code));
  assert.ok(next.includes('| --c-test-duration | 200ms |'));
  assert.ok(next.includes('| --c-test-color | red |'));
  assert.ok(!renderSection(tree.children.find(node => node.title === 'API')).includes('--c-test-'));
  assert.equal(tree.children.find(node => node.title === 'CSS Variables').children[0].title, 'Motion');
  assert.equal(normalizeApiHeadings(next, 'Test'), next);
});

test('published CSS variable references use a single unprefixed level-two title', () => {
  for (const { filename } of documentationFiles()) {
    const source = fs.readFileSync(filename, 'utf8');
    const tree = markdownSections(source);
    const titles = [];
    function visit(nodes, parents = []) {
      for (const node of nodes) {
        if (/CSS Variables$/i.test(node.title)) titles.push({ level: node.level, title: node.title, parents });
        visit(node.children, [...parents, node.title]);
      }
    }
    visit(tree.children);
    assert.ok(titles.length <= 1, filename);
    if (titles.length) assert.deepEqual(titles[0], { level: 2, title: 'CSS Variables', parents: [] }, filename);
  }
});
