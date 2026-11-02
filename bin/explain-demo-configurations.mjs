import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readDemoSections, groupDemoSections } from './group-demo-sections.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const require=createRequire(new URL('../../cedar-design-web/packages/cedar-ui/package.json',import.meta.url));
const {parse}=require('@vue/compiler-sfc');
const {parse:parseDom}=require('@vue/compiler-dom');
const write=process.argv.includes('--write');
const languageFilter=process.argv.find(arg=>arg.startsWith('--language='))?.split('=')[1];
const results=[];
function apiRows(source) {
 const rows=new Map();
 for(const line of source.split('\n')) {
  if(!line.startsWith('|'))continue;
  const cells=line.split(/(?<!\\)\|/).slice(1,-1).map(cell=>cell.trim());
  const name=cells[0]?.replaceAll('`','');
  if(!/^[a-z][a-z0-9-]*$/.test(name??'')||rows.has(name)||!cells[1]||/^[-:]+$/.test(cells[1]))continue;
  // Props have a type and default column. Slots/events are not treated as props.
  if(cells.length>=4)rows.set(name,cells[1]);
 }
 return rows;
}
function usedProps(file,tag,publicNames) {
 const source=fs.readFileSync(file,'utf8'),{descriptor}=parse(source),props=new Set();
 function visit(node){if(node.type===1&&node.tag===tag)for(const prop of node.props){const name=prop.type===6?prop.name:prop.arg?.content;const normalized=name?.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());if(publicNames.has(normalized))props.add(normalized);
  if(prop.type===7&&prop.name==='bind'&&!prop.arg&&prop.exp?.content){const variable=prop.exp.content;const match=new RegExp('(?:const|let)\\s+'+variable.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*=\\s*\\w*\\s*\\(?(\\{[^}]+\\})').exec(descriptor.scriptSetup?.content??'');if(match)for(const key of match[1].matchAll(/\b([a-z][\w]*)\s*:/g)){const name=key[1].replace(/[A-Z]/g,c=>'-'+c.toLowerCase());if(publicNames.has(name))props.add(name);}}
 }for(const child of node.children??[])visit(child);}
 if(descriptor.template)visit(parseDom(descriptor.template.content));return props;
}
for(const platform of ['cedar','maple']) {
 const groups=JSON.parse(fs.readFileSync(path.join(root,`design-ui/configs/demo-groups${platform==='maple'?'.maple':''}.json`)));
 for(const [family,chapters] of Object.entries(groups)) {
  let base=path.join(root,`${platform==='cedar'?'cedar-design-web/packages/cedar-ui':'maple-design-mobile/packages/maple-ui'}/src`,family);
  const docs=platform==='maple'?['docs/zh-CN.md','docs/en-US.md']:['README.md','README.en-US.md'];
  if(platform==='cedar'&&family.endsWith('/picker')&&!fs.existsSync(path.join(base,'README.md'))){base=path.dirname(base);docs.splice(0,2,'PICKER.md','PICKER.en-US.md');}
  for(const relative of docs){if(languageFilter && (/en-US/.test(relative)?'en-US':'zh-CN')!==languageFilter)continue;const file=path.join(base,relative);if(!fs.existsSync(file))continue;const original=fs.readFileSync(file,'utf8');
   const source=original.replace(/\n?<!-- demo-config-notes:start -->[\s\S]*?<!-- demo-config-notes:end -->\n*/g,'\n');
   const api=apiRows(source);if(!api.size){results.push({platform,family,file:path.relative(root,file),groupsExplained:0,reason:'No property API table; retain authored usage and source examples'});continue;}
   const parsed=readDemoSections(source),english=/en-US/.test(relative),tag=(platform==='cedar'?'c-':'mp-')+family.replaceAll('/','-');let explained=0;
   for(const chapter of chapters){if(chapter.title==='基础示例')continue;const cases=parsed.cases.filter(item=>chapter.cases.includes(path.basename(item.refs[0],'.vue')));if(!cases.length)continue;
    // Existing detailed use cases are authoritative; add a contextual index,
    // rather than replacing their operation instructions or limitations.
    const use=new Map();for(const item of cases)for(const ref of item.refs){const target=path.resolve(path.dirname(file),ref);if(!fs.existsSync(target))throw new Error('Missing example: '+target);for(const prop of usedProps(target,tag,api)){if(!use.has(prop))use.set(prop,new Set());use.get(prop).add(item.title);}}
    if(use.size<2)continue;
    const rows=[...use].sort((a,b)=>b[1].size-a[1].size).slice(0,6).map(([prop,names])=>`| \`${prop}\` | ${api.get(prop).replaceAll('|','\\|')} | ${[...names].slice(0,3).join(english?', ':'、').replaceAll('|','\\|')} |`);
    const note=`<!-- demo-config-notes:start -->\n#### ${english?'Configuration reference for this comparison':'本组配置对照'}\n\n| ${english?'Configuration | Purpose | Related examples':'配置 | 作用 | 相关示例'} |\n| --- | --- | --- |\n${rows.join('\n')}\n<!-- demo-config-notes:end -->\n\n`;
    const first=cases[0];first.text=first.text.replace(/^(###[^\n]*\n\n)/,'$1'+note);explained++;
   }
   const reconstructed=[parsed.prefix.trimEnd(),'## 案例\n\n'+parsed.cases.map(item=>item.text).join('\n\n'),...parsed.preserved,parsed.api.trim()].filter(Boolean).join('\n\n')+'\n';
   const next=groupDemoSections(reconstructed,chapters,english);
   if(write&&original!==next)fs.writeFileSync(file,next);
   results.push({platform,family,file:path.relative(root,file),groupsExplained:explained});
  }
 }
}
if(write)fs.writeFileSync(path.join(root,'design-ui/audits/demo-configuration-explanations-2026-10-28.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({documents:results.length,documentsExplained:results.filter(row=>row.groupsExplained).length,groupsExplained:results.reduce((n,row)=>n+row.groupsExplained,0)},null,2));
