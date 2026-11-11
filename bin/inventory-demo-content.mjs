import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { demoRefs } from './group-demo-sections.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const require=createRequire(new URL('../../cedar-design-web/packages/ui/package.json',import.meta.url));
const {parse}=require('@vue/compiler-sfc');
const {parse:parseDom}=require('@vue/compiler-dom');
export function inventoryDemoContent() {
 const result=[];
 for(const platform of ['cedar','maple']) {
  const manifest=JSON.parse(fs.readFileSync(path.join(root,`design-ui/configs/demo-groups${platform==='maple'?'.maple':''}.json`)));
  for(const [family,groups] of Object.entries(manifest)) {
   const base=path.join(root,`${platform==='cedar'?'cedar-design-web/packages/ui':'maple-design-mobile/packages/ui'}/src`,family.replace(/\/picker$/,''));
   let doc=path.join(base,platform==='maple'?'docs/zh-CN.md':family.endsWith('/picker')?'PICKER.md':'README.md');
   const nested=path.join(root,'cedar-design-web/packages/ui/src',family,'README.md');
   if(platform==='cedar' && family.endsWith('/picker') && fs.existsSync(nested))doc=nested;
   const entries=[];
   if(!fs.existsSync(doc))throw new Error('Missing authored family documentation: '+doc);
   const references=[...new Set(demoRefs(fs.readFileSync(doc,'utf8')))];
   for(const ref of references) {
    const file=path.resolve(path.dirname(doc),ref),source=fs.readFileSync(file,'utf8'),{descriptor}=parse(source,{filename:file});
    const name=path.basename(file,'.vue');const group=groups.find(group=>group.cases.includes(name));
    const tags=new Set(),props=new Set();let events=new Set(),refs=0;
    function visit(node){if(node.type===1){tags.add(node.tag);for(const prop of node.props){if(prop.type===6){if(prop.name==='ref')refs++;if(!['class','style','key','ref','id'].includes(prop.name))props.add(prop.name);}else if(prop.type===7){if(prop.name==='on')events.add(prop.arg?.content??'dynamic');else if(['bind','model'].includes(prop.name)&&prop.arg?.content)props.add(prop.arg.content);}}}for(const child of node.children??[])visit(child);}
    if(descriptor.template)visit(parseDom(descriptor.template.content));
    const script=descriptor.scriptSetup?.content??descriptor.script?.content??'';
    entries.push({name,group:group?.title??'source-alternative',file:path.relative(root,file),sha256:crypto.createHash('sha256').update(source).digest('hex'),lines:source.split('\n').length,tags:[...tags],props:[...props],events:[...events],templateRefs:refs,setup:!!descriptor.scriptSetup,macros:/define(?:Props|Emits|Expose|Model|Options)/.test(script),localImports:[...script.matchAll(/from\s*['"](\.[^'"]+)['"]/g)].map(match=>match[1])});
   }
   result.push({platform,family,document:path.relative(root,doc),groups:groups.map(group=>({title:group.title,en:group.en,cases:group.cases})),entries});
  }
 }
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(inventoryDemoContent(),null,2));
