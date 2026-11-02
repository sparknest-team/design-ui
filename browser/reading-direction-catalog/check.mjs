import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile, open, mkdtemp, rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { copyProductionSnapshot } from '../snapshot.mjs'
import { sourceFingerprint, productionFingerprint } from '../inventory.mjs'
import { fileURLToPath } from 'node:url'
const workspace=resolve(fileURLToPath(new URL('.',import.meta.url)),'../../..')
const evidence=resolve(process.env.DIRECTION_EVIDENCE_DIR??resolve(workspace,'design-ui/audits/evidence/direction-closeout-2026-10-30'),'catalog')
await mkdir(evidence,{recursive:true})
const results=[]
const engines=(process.env.DIRECTION_ENGINES??'chromium,firefox,webkit').split(',')
const libraries=(process.env.DIRECTION_LIBRARIES??'cedar,maple').split(',')
const directions=(process.env.DIRECTION_DIRECTIONS??'ltr,rtl').split(',')
for(const library of libraries) {
 const root=resolve(workspace,library==='cedar'?'cedar-design-web':'maple-design-mobile')
 const inputs={source:sourceFingerprint(root,library),production:productionFingerprint(root,library)}
 const snapshot=await mkdtemp(resolve(tmpdir(),`direction-${library}-production-`))
 try {
 await copyProductionSnapshot(resolve(root,`packages/${library}-ui/${library==='cedar'?'dist':'site'}`),snapshot)
 assert.equal(sourceFingerprint(root,library),inputs.source,'source changed while snapshotting')
 assert.equal(productionFingerprint(root,library),inputs.production,'production inputs changed while snapshotting')
 for(const direction of directions) for(const engine of engines) {
  assert.ok(['cedar','maple'].includes(library)&&['ltr','rtl'].includes(direction)&&['chromium','firefox','webkit'].includes(engine))
  const directory=resolve(evidence,direction),log=resolve(evidence,`${library}-${direction}-${engine}.log`)
  const handle=await open(log,'w'),startedAt=new Date().toISOString()
  const exitCode=await new Promise((done,reject)=>{
    const child=spawn(process.execPath,['--test',resolve(workspace,'design-ui/browser/reading-direction-catalog/catalog.test.mjs')],{cwd:workspace,stdio:['ignore',handle.fd,handle.fd],env:{...process.env,DIRECTION_LIBRARY:library,DOCS_PRODUCTION_SNAPSHOT:snapshot,DOCS_BROWSER:engine,DOCS_READING_DIRECTION:direction,DOCS_DIRECTION_CORE:'1',DOCS_BROWSER_EVIDENCE_DIR:directory,CHOKIDAR_USEPOLLING:'1'}})
    child.on('error',reject);child.on('exit',code=>done(code??1))
  });await handle.close()
  let coverage,error
  try{coverage=JSON.parse(await readFile(resolve(directory,library,engine,'coverage.json'),'utf8'))}catch(e){error=String(e)}
  const passed=exitCode===0&&coverage?.sourceFingerprint===inputs.source&&coverage?.productionFingerprint===inputs.production&&coverage?.sourcesStable===true&&coverage?.productionInputsStable===true&&coverage?.completedComponentCases===coverage?.expectedComponentCases&&coverage?.results?.length===coverage?.expectedComponentCases+coverage?.expectedGuideCases&&coverage?.results?.length>0&&coverage.results.every(x=>x.passed)
  results.push({library,direction,engine,startedAt,completedAt:new Date().toISOString(),exitCode,passed,log,coverage:coverage?resolve(directory,library,engine,'coverage.json'):undefined,error,componentCount:coverage?.components,componentCases:coverage?.completedComponentCases})
  await writeFile(resolve(evidence,`matrix-${libraries.join('-')}-${engines.join('-')}.json`),JSON.stringify({generatedAt:new Date().toISOString(),scope:'all documented components; representative exact authored source and domain behavior in each reading direction, plus nested/runtime direction and value invariance',fullThemeMatrix:false,nativeDeviceAcceptance:false,results},null,2))
  console.log(JSON.stringify(results.at(-1)))
}
 assert.equal(sourceFingerprint(root,library),inputs.source,'source changed during the complete direction matrix')
 assert.equal(productionFingerprint(root,library),inputs.production,'production inputs changed during the complete direction matrix')
 } finally { await rm(snapshot,{recursive:true,force:true}) }
}
if(results.some(x=>!x.passed))process.exitCode=1
