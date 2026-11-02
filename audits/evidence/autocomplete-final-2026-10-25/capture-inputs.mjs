import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {sourceFingerprint,productionFingerprint} from '/Users/shuaimeng/github_web/design-ui/browser/inventory.mjs'
const root='/Users/shuaimeng/github_web',dir=root+'/design-ui/audits/evidence/autocomplete-final-2026-10-25'
const data=['cedar','maple'].map(library=>{const repo=root+'/'+(library==='cedar'?'cedar-design-web':'maple-design-mobile');return {library,source:sourceFingerprint(repo,library),production:productionFingerprint(repo,library)}})
if(process.argv[3])assert.deepEqual(data,JSON.parse(readFileSync(dir+'/'+process.argv[3],'utf8')),'production inputs must remain identical')
writeFileSync(dir+'/'+process.argv[2],JSON.stringify(data,null,2)+'\n')
console.log(JSON.stringify(data))
if(process.argv[2]==='before-build.json'){
 const files=['auto-complete/auto-complete.tsx','auto-complete/style/index.less','auto-complete/style/token.less','auto-complete/presentation.ts','_components/selected-options/style/index.less','form/example/demos/field-selection.vue'].map(f=>'maple-design-mobile/packages/maple-ui/src/'+f)
 writeFileSync(dir+'/autocomplete-inputs.json',JSON.stringify({files:Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(root+'/'+f)).digest('hex')])),required:{bottomPlacement:true,autoFitPosition:false,updateAtScroll:true}},null,2)+'\n')
}
