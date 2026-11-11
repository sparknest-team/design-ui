import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { readDemoSections, demoRefs } from './group-demo-sections.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const require=createRequire(new URL('../../cedar-design-web/packages/ui/package.json',import.meta.url));
const {parse}=require('@vue/compiler-sfc');const {parse:parseDom}=require('@vue/compiler-dom');
const write=process.argv.includes('--write');
const groups=JSON.parse(fs.readFileSync(path.join(root,'design-ui/configs/demo-groups.json')));
const plans=JSON.parse(fs.readFileSync(path.join(root,'design-ui/configs/demo-content-consolidation.json')));
const normalize=ref=>path.basename(ref,'.vue').replace(/\.en-US$/,'');
const titleCase=value=>value.replace(/(^|[-/])(\w)/g,(_,a,b)=>(a?' ':'')+b.toUpperCase());
const glossary={size:'Controls the component size.',variant:'Selects the visual variant.',status:'Selects the semantic state.',disabled:'Prevents user interaction.',readonly:'Displays the current value without allowing edits.',width:'Sets the configured width.',height:'Constrains the component height.',direction:'Controls the content direction.',align:'Controls alignment on the cross axis.',justify:'Distributes remaining space on the main axis.',elevation:'Controls the shadow intensity.',color:'Overrides the color.',placement:'Chooses the position relative to the trigger.',format:'Controls the displayed format.',options:'Supplies the available options.',data:'Supplies the example data.',max:'Sets the upper bound.',min:'Sets the lower bound.',step:'Controls the allowed increment.'};
const records=[];
for(const [family,chapters]of Object.entries(groups)) {
 let directory=path.join(root,'cedar-design-web/packages/ui/src',family),primary=path.join(directory,'README.md');
 if(!fs.existsSync(primary)&&family.endsWith('/picker')){directory=path.dirname(directory);primary=path.join(directory,'PICKER.md');}
 const source=fs.readFileSync(primary,'utf8'),english=primary.replace(/\.md$/,'.en-US.md'),old=fs.existsSync(english)?fs.readFileSync(english,'utf8'):'';
 const zh=readDemoSections(source),en=readDemoSections(old);
 const englishCases=new Map(en.cases.map(item=>[normalize(item.refs[0]),item]));
 const englishSources=new Map(en.cases.flatMap(item=>item.refs.map(ref=>[normalize(ref),ref])));
 const oldTitle=/^# (.+)$/m.exec(old)?.[1];
 const displayedName=oldTitle??titleCase(family);
 const descriptions={...glossary};
 for(const file of fs.readdirSync(directory).filter(name=>/^props\.tsx?$/.test(name))){const props=fs.readFileSync(path.join(directory,file),'utf8');for(const match of props.matchAll(/\/\*\*([\s\S]*?)\*\/\s*([\w-]+)\s*:/g)){const english=/@en\s+([\s\S]*?)(?=\n\s*\*\s*@|$)/.exec(match[1])?.[1]?.replace(/\n\s*\*\s?/g,' ').trim();if(english&&!/[\u4e00-\u9fff]/.test(english))descriptions[match[2].replace(/[A-Z]/g,c=>'-'+c.toLowerCase())]=english;}}
 const sections=chapters.flatMap(chapter=>{
  const cases=zh.cases.filter(item=>chapter.cases.includes(path.basename(item.refs[0],'.vue')));
  if(!cases.length)return[];
  const blocks=cases.map(item=>{
   const name=normalize(item.refs[0]),existing=englishCases.get(name),plan=plans.find(plan=>plan.platform==='cedar'&&plan.family===family&&plan.into===name);
   if(existing&&existing.refs.map(normalize).sort().join()===item.refs.map(normalize).sort().join())return existing.text;
   const refs=item.refs.map(ref=>{
    if(englishSources.has(normalize(ref)))return englishSources.get(normalize(ref));
    const enPath=ref.replace(/\/([^/]+)\.vue$/,'/en-US/$1.vue');
    const suffixPath=ref.replace(/\.vue$/,'.en-US.vue');
    return fs.existsSync(path.resolve(directory,enPath))?enPath:fs.existsSync(path.resolve(directory,suffixPath))?suffixPath:ref;
   });
   const used=new Set();
   for(const ref of refs){const file=path.resolve(directory,ref);const {descriptor}=parse(fs.readFileSync(file,'utf8'));function visit(node){if(node.type===1&&node.tag==='c-'+family.replaceAll('/','-'))for(const prop of node.props){const name=(prop.type===6?prop.name:prop.arg?.content)?.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());if(descriptions[name])used.add(name);}for(const child of node.children??[])visit(child);}if(descriptor.template)visit(parseDom(descriptor.template.content));}
   const settings=[...used].slice(0,4).map(name=>`- \`${name}\`: ${descriptions[name]}`).join('\n');
   const explanation=plan?.english??(plan?.mode==='covered'?(name==='appearance-lab'?'Choose an axis to compare its available values with the same content and model. Other settings remain unchanged while comparing.':'Toggle the state, interact with the component, and restore editing using the controls outside the specimen. Error appearance alone does not run validation.'):settings);
   return `### ${plan?.en??(name==='basic'?'Basic usage':titleCase(name))}\n\n${explanation?explanation+'\n\n':''}${refs.map(ref=>`<demo src="${ref}"></demo>`).join('\n\n')}`;
  });
  return [`## ${chapter.en}\n\n${blocks.join('\n\n')}`];
 });
 const permalink=/^permalink:\s*(\S+)/m.exec(source)?.[1];
 if(!permalink)throw new Error('No primary permalink: '+primary);
 const intro=en.prefix.trim()||`---\nlang: en-US\npermalink: /en${permalink}\n---\n\n# ${displayedName}\n\nStart with the basic example, then compare related settings before moving to controlled, asynchronous or combined use cases.`;
 const api=en.api.trim();
 if(!api && zh.api.trim())throw new Error('Missing authored English API; complete its translation before synchronizing examples: '+family);
 const next=[intro,...sections,...en.preserved,api].join('\n\n')+'\n';
 const expected=demoRefs(source).map(normalize).sort(),actual=demoRefs(next).map(normalize).sort();
 if(JSON.stringify(expected)!==JSON.stringify(actual))throw new Error('Example locale parity failed: '+family);
 if(write&&next!==old)fs.writeFileSync(english,next);
 records.push({family,file:path.relative(root,english),created:!old,changed:next!==old,examples:actual.length});
}
if(write)fs.writeFileSync(path.join(root,'design-ui/audits/cedar-example-locale-parity-2026-10-28.json'),JSON.stringify(records,null,2)+'\n');
console.log(JSON.stringify({families:records.length,created:records.filter(r=>r.created).length,changed:records.filter(r=>r.changed).length},null,2));
