import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { inventoryDemoContent } from './inventory-demo-content.mjs';
import { readDemoSections } from './group-demo-sections.mjs';
import { localizeApiDocumentation, translateFragment, localizeDemoReferences } from './localize-api-documentation.mjs';
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

test('API translation keeps type signatures, real defaults and code fences',()=>{
 const input='| width | 列宽度 | `number \\| string` | `80` |\n\n```ts\nconst value = 0\n```';
 const output=translateFragment(input,'fixture');
 assert.match(output,/Column width/i);
 assert.ok(output.includes('`number \\| string`'));
 assert.ok(output.includes('`80`'));
 assert.ok(output.includes('const value = 0'));
});

test('all registered bilingual component families retain every API member, type, default and comparison setting',()=>{
 let checked=0;
 for(const row of inventoryDemoContent()) {
  const zhPath=path.join(root,row.document),enPath=zhPath.replace(/README\.md$/,'README.en-US.md').replace(/PICKER\.md$/,'PICKER.en-US.md').replace(/zh-CN\.md$/,'en-US.md');
  const zh=fs.readFileSync(zhPath,'utf8'),en=fs.readFileSync(enPath,'utf8');
  assert.doesNotMatch(en,/complete component API reference in Chinese|\]\([^)]*(?:zh-CN(?:\/|\.md)|README\.md)/,row.family);
  const primary=readDemoSections(zh),english=readDemoSections(en);
  const expected=contracts([...primary.preserved,primary.api].join('\n'));
  const actual=contracts([...english.preserved,english.api].join('\n'));
  for(const item of expected){assert.ok(actual.some(candidate=>candidate.key===item.key&&(item.type===null||candidate.type===item.type)&&(item.default===null||candidate.default===item.default)),`${row.platform}/${row.family}: missing or changed API ${JSON.stringify(item)}`);checked++;}
  assert.deepEqual(configKeys(zh),configKeys(en),row.platform+'/'+row.family+': configuration notes differ');
 }
 assert.ok(checked>2000,'Expected full API inventory, not a sample');
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
