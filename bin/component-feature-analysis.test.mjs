import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { featureRows } from './component-feature-analysis.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
test('separates a documented API from a runnable dedicated demo', () => {
 const component = { id: 'upload', group: 'forms', demos: [] };
 const rows = featureRows(component, '| multiple / directory / draggable | boolean | false |', []);
 assert.equal(rows.find(row => row.id === 'upload-directory').status, 'documented');
 const withDemo = featureRows({ ...component, demos: [{ title: '目录上传', source: 'directory.vue' }] }, '', []);
 assert.equal(withDemo.find(row => row.id === 'upload-directory').status, 'demo');
});
test('a peer example creates a candidate, never a claim that our API is missing', () => {
 const rows = featureRows({ id: 'upload', group: 'forms', demos: [] }, '', [{ library: 'chakra-ui', name: 'Chakra UI', _examples: [{ title: 'Paste', file: 'paste.tsx', url: 'https://example.com/paste' }] }]);
 const paste = rows.find(row => row.id === 'upload-paste');
 assert.equal(paste.status, 'candidate');
 assert.equal(paste.evidence[0].library, 'chakra-ui');
});
test('every curated increment has a real reference file and belongs to an existing category', () => {
 const spec = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/component-showcase.json')));
 const increments = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/component-improvements.json')));
 for (const entry of increments) {
  assert.ok(spec.groups.some(group => group.id === entry.group));
  for (const evidence of entry.evidence) assert.ok(fs.existsSync(path.join(root, evidence.library, evidence.file)));
 }
});
test('the mobile catalog references mobile demo files and maps no desktop-only scheduler', () => {
 const base = path.join(root, 'maple-design-mobile/packages/ui');
 const catalog = JSON.parse(fs.readFileSync(path.join(base, 'docs/components/component-catalog.json')));
 assert.ok(!catalog.components.some(item => item.id === 'scheduler'));
 assert.ok(catalog.components.some(item => item.id === 'pull-refresh'));
 for (const component of catalog.components) for (const demo of component.demos) assert.ok(fs.existsSync(path.join(base, demo.source)), demo.source);
});
test('each localized mobile showcase page resolves every referenced demo in a component directory', () => {
 const base = path.join(root, 'maple-design-mobile/packages/ui');
 for (const name of ['showcase','showcaseComponents','showcaseCrossPlatform','showcaseForms','showcaseThemes','showcaseAsync','showcaseData','showcaseTouch']) {
  for (const locale of ['zh-CN','en-US']) {
   const file = path.join(base, `docs/${name}.${locale}.md`);
   assert.ok(fs.existsSync(file));
   const text = fs.readFileSync(file, 'utf8');
   for (const match of text.matchAll(/```demo\s*\n([^\n]+)/g)) assert.ok(fs.existsSync(path.resolve(path.dirname(file), match[1].trim())));
  }
 }
});

test('file size limits are not classified as upload control density', () => {
 const rows = featureRows({ id: 'upload', group: 'forms', demos: [] }, '', [{ library: 'chakra-ui', name: 'Chakra UI', _examples: [{ title: 'File size limit', file: 'file-upload-with-file-size-limit.tsx', url: 'https://example.com/limit' }] }]);
 assert.ok(!rows.some(row => row.id === 'size'));
});

test('core features have concrete demo sources on each supported platform', () => {
 const strengths = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/core-strengths.json')));
 assert.equal(new Set(strengths.map(item => item.id)).size, strengths.length);
 for (const item of strengths) {
  assert.ok(item.value && item.demonstration);
  for (const platform of ['cedar','maple']) {
   const sample = item[platform];
   if (!sample) continue;
   const base = path.join(root, platform === 'cedar' ? 'cedar-design-web/packages/ui' : 'maple-design-mobile/packages/ui');
   assert.ok(fs.existsSync(path.join(base, sample.source)), item.id);
   assert.ok(!sample.source.includes('api-review'), item.id);
  }
 }
 const mobile = strengths.filter(item => item.maple);
 assert.ok(!mobile.some(item => item.maple.component === 'scheduler'));
 for (const item of mobile) assert.ok(!(item.mapleValue ?? item.value).includes('Scheduler'), item.id);
 const mobilePage = fs.readFileSync(path.join(root, 'maple-design-mobile/packages/ui/docs/showcaseStrengths.zh-CN.md'), 'utf8');
 assert.ok(!mobilePage.includes('Scheduler')); 
});
