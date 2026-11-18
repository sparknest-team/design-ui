import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { inventoryDemoContent } from './inventory-demo-content.mjs';
import { readDemoSections } from './group-demo-sections.mjs';
import { configurationNotes, localizeApiDocumentation, translateFragment, localizeDemoReferences } from './localize-api-documentation.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const cn=s=>/[\u4e00-\u9fff]/.test(s);
const normalize=s=>(s??'').replace(/[`*_\s]/g,'');
function contracts(source) {
  let header=[];const result=[];
  for(const line of source.replace(/```[\s\S]*?```/g,'').split('\n')) {
    if(!line.startsWith('|')){header=[];continue;}
    const cells=line.split(/(?<!\\)\|/).slice(1,-1).map(cell=>cell.trim());
    if(!header.length){header=cells;continue;}
    if(cells.every(cell=>/^[-: ]+$/.test(cell)))continue;
    const key=cells[0]?.replace(/[`*_]/g,'').replace(/\s*\((?:必填|required)\)/g,'').trim();
    if(!key||cn(key)||!/[a-zA-Z]/.test(key))continue;
    const type=header.findIndex(cell=>/^(类型|Type)$/i.test(cell));
    const defaultIndex=header.findIndex(cell=>/^(默认值|Default)$/i.test(cell));
    result.push({key,type:type>=0&&!cn(cells[type])?normalize(cells[type]):null,default:defaultIndex>=0&&!cn(cells[defaultIndex])?normalize(cells[defaultIndex]):null});
  }
  return result;
}
const configKeys=source=>[...source.matchAll(/<!-- demo-config-notes:start -->([\s\S]*?)<!-- demo-config-notes:end -->/g)].flatMap(match=>match[1].split('\n').filter(line=>/^\|\s*`/.test(line)).map(line=>line.split('|')[1].trim())).sort();

test('repeated localization does not add blank lines after configuration notes', () => {
 const block='<!-- demo-config-notes:start -->\n| `value` | Purpose | Related examples |\n<!-- demo-config-notes:end -->';
 const item={title:'Lifecycle',refs:['./lifecycle.vue'],text:`### Lifecycle\n\n${block}\n\nExplanation.\n\n<demo src="./lifecycle.vue"></demo>`};
 const chinese={cases:[item]};
 const first=configurationNotes(chinese,{cases:[{...item,text:item.text.replace(block+'\n\n','')}]},'fixture')[0];
 const second=configurationNotes(chinese,{cases:[{...item,text:first}]},'fixture')[0];
 assert.equal(second,first);
 assert.ok(first.includes('Explanation.'));
});

test('API translation keeps type signatures, real defaults and code fences',()=>{
 const input='| width | 列宽度 | `number \\| string` | `80` |\n\n```ts\nconst value = 0\n```';
 const output=translateFragment(input,'fixture');
 assert.match(output,/Column width/i);
 assert.ok(output.includes('`number \\| string`'));
 assert.ok(output.includes('`80`'));
 assert.ok(output.includes('const value = 0'));
});

test('localization preserves intended inline code and event argument headers',()=>{
 const output=translateFragment('从 `images` 中通过 `to` 方法跳转。\n\n| 事件 | 说明 | 参数 |','fixture',{
  '从 `images` 中通过 `to` 方法跳转。':'Use `to` to select from `images`; no images means nowhere to go.'
 });
 assert.ok(output.includes('Use `to` to select from `images`; no images means nowhere to go.'));
 assert.ok(output.includes('| Event | Description | Arguments |'));
 assert.equal(translateFragment('| 方法名 | 说明 | 参数 |','fixture'),'| Method | Description | Arguments |');
 assert.equal(translateFragment('| 方法 | 参数 | 返回值 |','fixture'),'| Method | Arguments | Returns |');
 assert.match(translateFragment('| 事件名 | 说明 | 参数 |','fixture'), /\| Arguments \|$/);
 const identifier=translateFragment('通过 `label` 插槽设置标题。','fixture',{'通过 `label` 插槽设置标题。':'Use the label slot; update-label is a separate identifier.'});
 assert.equal(identifier,'Use the `label` slot; update-label is a separate identifier.');
 const link=translateFragment('参考 `aria-busy` 文档。','fixture',{'参考 `aria-busy` 文档。':'See [the spec](https://example.test/#aria-busy) for aria-busy.'});
 assert.ok(link.includes('](https://example.test/#aria-busy)'));
 assert.ok(link.includes('for `aria-busy`'));
 const punctuation=translateFragment('默认值为 `-`，非有限值归零。','fixture',{'默认值为 `-`，非有限值归零。':'Default is -; non-finite values use zero.'});
 assert.equal(punctuation,'Default is `-`; non-finite values use zero.');
});

test('reviewed Image and Scheduler descriptions remain reproducible',()=>{
 const input='| src | 缩略图地址 |\n| lock-scroll | 锁定背景滚动 |\n| before-transaction | 事务保存守卫，设置后替代 before-change |';
 const output=translateFragment(input,'reviewed-contracts');
 assert.match(output,/Thumbnail source/);
 assert.match(output,/Lock background scrolling/);
 assert.match(output,/Transaction guard; replaces before-change when provided/);
});

test('all registered bilingual component families retain every API member, type, default and comparison setting',()=>{
 let checked=0;
 for(const row of inventoryDemoContent()) {
  const zhPath=path.join(root,row.document),enPath=zhPath.replace(/README\.md$/,'README.en-US.md').replace(/PICKER\.md$/,'PICKER.en-US.md').replace(/zh-CN\.md$/,'en-US.md');
  const zh=fs.readFileSync(zhPath,'utf8'),en=fs.readFileSync(enPath,'utf8');
  assert.doesNotMatch(en,/complete component API reference in Chinese|\]\([^)]*(?:zh-CN(?:\/|\.md)|README\.md)/,row.family);
  assert.doesNotMatch(en,/\]\([^\n)]*`[^\n)]*\)/,row.platform+'/'+row.family+': code markers in link destination');
  const primary=readDemoSections(zh),english=readDemoSections(en);
  const expected=contracts([...primary.preserved,primary.api].join('\n'));
  const actual=contracts([...english.preserved,english.api].join('\n'));
  for(const item of expected){assert.ok(actual.some(candidate=>candidate.key===item.key&&(item.type===null||candidate.type===item.type)&&(item.default===null||candidate.default===item.default)),`${row.platform}/${row.family}: missing or changed API ${JSON.stringify(item)}`);checked++;}
  assert.deepEqual(configKeys(zh),configKeys(en),row.platform+'/'+row.family+': configuration notes differ');
 }
 assert.ok(checked>2000,'Expected full API inventory, not a sample');
});

test('localization retains current usage, positioning and shared-style guidance',()=>{
 const required = new Map([
  ['cedar/alert', ['`type="default"`', '`#icon`']],
  ['cedar/popconfirm', ['## Triggers and positioning', 'TriggerPlacement / triggerPlacements']],
 ['cedar/nav-menu', ['Titles follow matching selected options', 'fixed titles']],
  ['cedar/switch', ['Use the CSS Variables table below to customize dimensions and colors.', '### Track and handle colors']],
  ['maple/switch', ['Use the CSS Variables table below to customize dimensions and colors.', '### Track and handle colors']],
  ['maple/input-number', ['Shared field appearance still uses FieldDecorator `--mp-field-*` tokens.']],
 ]);
 localizeApiDocumentation({onGenerated:({platform,family,source})=>{
  assert.doesNotMatch(source,/\]\([^\n)]*`[^\n)]*\)/,platform+'/'+family+': generated link contains code markers');
  assert.doesNotMatch(source, /### Compatibility|Legacy platform-specific Switch geometry tokens/, platform+'/'+family);
  if (platform === 'cedar' && family === 'nav-menu') assert.doesNotMatch(source, /update-label[^\n]*removed/i);
  const key=platform+'/'+family, snippets=required.get(key);
  if (!snippets) return;
  for (const snippet of snippets) assert.ok(source.includes(snippet),key+': missing '+snippet);
  required.delete(key);
 }});
 assert.equal(required.size,0,'All reviewed components must be generated');
});

test('complete English documentation is reproducible without a Chinese-reference fallback',()=>{
 const families=inventoryDemoContent().length;
 assert.ok(families>=209,'Previously covered component families must not disappear');
 assert.deepEqual(localizeApiDocumentation(),{families,changed:0,missing:0});
});


test('translated preserved chapters select available English demos without changing shared demos',()=>{
 const directory=fs.mkdtempSync('/tmp/api-demo-locale-');
 try {
  fs.mkdirSync(path.join(directory,'docs'));
  fs.mkdirSync(path.join(directory,'example/demos/en-US'),{recursive:true});
  fs.writeFileSync(path.join(directory,'example/demos/en-US/custom-control.vue'),'<template>English</template>');
  const source='```demo\n../example/demos/custom-control.vue\n```\n```demo\n../example/demos/shared.vue\n```';
  const file=path.join(directory,'docs/en-US.md');
  const localized=localizeDemoReferences(source,file);
  assert.ok(localized.includes('../example/demos/en-US/custom-control.vue'));
  assert.ok(localized.includes('../example/demos/shared.vue'));
  assert.equal(localizeDemoReferences(localized,file),localized);
 } finally {
  fs.rmSync(directory,{recursive:true,force:true});
 }
});


test('same-named demos in different directories retain their own configuration notes', () => {
 const item = (ref, key) => ({title:key, refs:[ref], text:`### ${key}\n\n<!-- demo-config-notes:start -->\n| \`${key}\` | Purpose | Related examples |\n<!-- demo-config-notes:end -->\n\n<demo src="${ref}"></demo>`});
 const field=item('./__demos__/basic.vue','field-prop');
 const panel=item('./picker/__demos__/basic.vue','panel-prop');
 const english=[field,panel].map(row=>({...row,refs:row.refs.map(ref=>ref.replace('.vue','.en-US.vue')),text:`### ${row.title}\n\n<demo src="${row.refs[0]}"></demo>`}));
 const output=configurationNotes({cases:[field,panel]},{cases:english},'fixture');
 assert.match(output[0], /field-prop/);
 assert.doesNotMatch(output[0], /panel-prop/);
 assert.match(output[1], /panel-prop/);
 assert.doesNotMatch(output[1], /field-prop/);
});

test('English Time documentation retains both field and standalone panel basic demos', () => {
 let source;
 localizeApiDocumentation({onGenerated: row => {if(row.platform==='cedar' && row.family==='time') source=row.source;}});
 assert.ok(source);
 assert.match(source, /src="\.\/__demos__\/basic\.vue"/);
 assert.match(source, /src="\.\/picker\/__demos__\/basic\.vue"/);
});
