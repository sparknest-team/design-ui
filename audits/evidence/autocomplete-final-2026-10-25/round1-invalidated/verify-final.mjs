import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {sourceFingerprint,productionFingerprint,componentPages,guidePages,demoIndex} from '/Users/shuaimeng/github_web/design-ui/browser/inventory.mjs'
import {contractFor} from '/Users/shuaimeng/github_web/design-ui/browser/contracts.mjs'
const workspace='/Users/shuaimeng/github_web', evidence=workspace+'/design-ui/audits/evidence/autocomplete-final-2026-10-25'
const json=f=>JSON.parse(readFileSync(f,'utf8'))
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex')
const before=json(evidence+'/before-build.json')
assert.deepEqual(json(evidence+'/after-build.json'),before)
const results=[]
for(const [library,repository,themeCases] of [['cedar','cedar-design-web',45],['maple','maple-design-mobile',6]]){
 const root=resolve(workspace,repository),output=`${root}/packages/${library}-ui/${library==='cedar'?'dist':'site'}`
 const inputs={library,source:sourceFingerprint(root,library),production:productionFingerprint(root,library)}
 assert.deepEqual(inputs,before.find(x=>x.library===library),'current inputs equal both pre-build and post-build snapshots')
 const pages=componentPages(root,library),guides=guidePages(root,library)
 const expected=pages.length*(library==='cedar'?2:4)+guides.length*2
 const expectedSources=pages.reduce((sum,p)=>sum+p.demos.length+new Set([0,demoIndex(p,contractFor(library,p.component).demo)]).size,0)+guides.reduce((sum,p)=>sum+p.demos.length*2,0)
 const coverage=json(`${evidence}/components/${library}/coverage.json`),outage=json(`${evidence}/components/${library}/navigation-outage.json`)
 assert.equal(coverage.results.length,expected);assert.ok(coverage.results.every(x=>x.passed===true))
 assert.equal(coverage.sourcesStable,true);assert.equal(coverage.productionInputsStable,true)
 assert.equal(coverage.sourceFingerprint,inputs.source);assert.equal(coverage.productionFingerprint,inputs.production)
 assert.equal(coverage.results.reduce((sum,x)=>sum+(x.checkedSources??0),0),expectedSources)
 const indexHash=sha(output+'/index.html');assert.equal(coverage.buildIndexHash,indexHash);assert.equal(outage.buildIndexHash,indexHash)
 assert.equal(outage.productionFingerprint,inputs.production);assert.equal(outage.stable,true)
 for(const key of ['expected','completed','passed'])assert.equal(outage[key],4)
 assert.equal(outage.timeoutMs,5000);assert.equal(outage.logoDelayMs,1200)
 for(const item of outage.results){assert.equal(item.passed,true);assert.ok(item.navigation.events.some(e=>e.name==='load'&&e.elapsedMs<5000));if(library==='cedar')assert.deepEqual(item.blocked,[]);else assert.ok(item.blocked.length>0&&item.blocked.every(r=>r.url.startsWith('https://hm.baidu.com/')))}
 for(const [name,count] of [['components',expected+4],['theme',themeCases]]){
  const log=readFileSync(`${evidence}/${library}-${name}.log`,'utf8')
  for(const key of ['tests','pass'])assert.match(log,new RegExp(`^[#ℹ] ${key} ${count}$`,'m'))
  for(const key of ['fail','cancelled','skipped'])assert.match(log,new RegExp(`^[#ℹ] ${key} 0$`,'m'))
 }
 results.push({...inputs,indexHash,componentCases:expected,outageCases:4,themeCases,checkedSources:expectedSources,node:coverage.node})
}
const targeted=json(evidence+'/autocomplete/coverage.json'),maple=results.find(x=>x.library==='maple')
for(const key of ['expected','completed','passed'])assert.equal(targeted[key],8)
assert.equal(targeted.stable,true);assert.equal(targeted.buildIndexHash,maple.indexHash)
assert.deepEqual(targeted.before,{source:maple.source,production:maple.production});assert.deepEqual(targeted.after,targeted.before)
assert.deepEqual(targeted.results.map(x=>`${x.surface}/${x.theme}/${x.mode}`).sort(),['documentation','mobile'].flatMap(surface=>['lightTheme','darkTheme'].flatMap(theme=>['popup','inline'].map(mode=>`${surface}/${theme}/${mode}`))).sort())
for(const item of targeted.results){assert.equal(item.passed,true);assert.deepEqual(item.autocomplete,item.select);if(item.mode==='inline'){assert.ok(Math.abs(item.afterScroll.inputTop-item.centered.inputTop)>=40);for(const point of [item.atBottom,item.centered,item.afterScroll]){assert.equal(point.gap,4);assert.equal(point.leftDifference,0);assert.equal(point.widthDifference,0)}}}
const manifest=json(evidence+'/autocomplete-inputs.json')
for(const [file,hash]of Object.entries(manifest.files))assert.equal(sha(resolve(workspace,file)),hash,'the actual AutoComplete fix files are unchanged')
const source=readFileSync(workspace+'/maple-design-mobile/packages/maple-ui/src/auto-complete/auto-complete.tsx','utf8')
assert.match(source,/autoFitPosition=\{false\}/);assert.match(source,/\bupdateAtScroll\b/)
const receipt={passed:true,verifiedAt:new Date().toISOString(),results,autocomplete:{cases:8,sourceFiles:manifest.files,coverage:'autocomplete/coverage.json',includedInLatestBuild:true},scope:'Fresh local production docs and complete browser matrices, original theme gates, AutoComplete Select style parity and scrolling. Not complete quality or remote CI.'}
writeFileSync(evidence+'/final-receipt.json',JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify(receipt,null,2))
