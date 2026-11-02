import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFile,writeFile,mkdir } from 'node:fs/promises'
import { startKitServers } from '/Users/shuaimeng/github_web/design-ui/browser/native-kit/serve.mjs'
const {chromium}=createRequire('/Users/shuaimeng/github_web/cedar-design-web/package.json')('playwright')
const config=JSON.parse(await readFile('/tmp/cedar-maple-native-validation/version-config.json'))
const root='/Users/shuaimeng/github_web/design-ui/artifacts/native-handoff-2026-10-29'
const out='/tmp/cedar-maple-native-validation/kit-qa'
await mkdir(out,{recursive:true})
const kit=await startKitServers(root,{port:0})
const results=[]
try {
 for(const binary of config.browsers){
  const browser=await chromium.launch({executablePath:binary.executablePath,headless:true})
  try{
   assert.equal(browser.version(),binary.version)
   let page=await browser.newPage({viewport:{width:390,height:844}})
   const errors=[];page.on('pageerror',e=>errors.push(String(e)))
   await page.goto(`http://127.0.0.1:${kit.ports.control}/`)
   await page.locator('#targets a').first().waitFor()
   assert.equal(await page.locator('a[href^="/probe.html?"]').count(),23)
   const routes=await page.locator('.links a').evaluateAll(nodes=>nodes.map(n=>n.href))
   assert.ok(routes.some(url=>new URL(url).port===String(kit.ports.maple)))
   assert.ok(routes.some(url=>new URL(url).port===String(kit.ports.cedar)))
   for(const library of ['cedar','maple']){
    if(library==='maple'){await page.close();page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:`Mozilla/5.0 (Linux; Android 13; QA Emulation) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${binary.version} Mobile Safari/537.36`});page.on('pageerror',e=>errors.push(String(e)))}
    const url=routes.find(url=>new URL(url).port===String(kit.ports[library]))
    await page.goto(url)
    await page.locator(library==='cedar'?'.vmi-previewer':'section[data-demo]').first().waitFor({timeout:15000}).catch(async error=>{await writeFile(`${out}/failure-${library}.txt`,JSON.stringify({url:page.url(),text:await page.locator('body').innerText(),html:await page.content()},null,2));throw error})
    assert.ok((await page.locator('body').innerText()).length>80)
   }
   await page.goto(`http://127.0.0.1:${kit.ports.control}/probe.html?library=maple&target=ios-safari-minimum`)
   await page.waitForFunction(()=>document.querySelector('#output').textContent.includes('environment-probe'))
   assert.equal(await page.locator('#physical').isChecked(),false)
   await page.locator('#ime').fill('PRIVATE_QA_TEXT_20261029')
   await page.locator('#file').setInputFiles({name:'PRIVATE_FILENAME.png',mimeType:'image/png',buffer:Buffer.from('qa')})
   await page.locator('#collect').click()
   await page.waitForFunction(()=>JSON.parse(document.querySelector('#output').textContent).files.length===1)
   let raw=await page.locator('#output').textContent(),probe=JSON.parse(raw)
   assert.equal(probe.targetId,'ios-safari-minimum');assert.equal(probe.status,'pending');assert.equal(probe.nativeDeviceAcceptance,false)
   assert.ok(Object.values(probe.cases).every(value=>value==='pending'))
   assert.ok(Object.values(probe.features).every(value=>value===true))
   assert.equal(probe.claimedMetadata.physicalDeviceAttestation,false)
   assert.ok(!raw.includes('PRIVATE_QA_TEXT'));assert.ok(!raw.includes('PRIVATE_FILENAME'))
   assert.equal(probe.files[0].files[0].bytes,2)
   const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()])
   const downloaded=JSON.parse(await readFile(await download.path(),'utf8'))
   assert.equal(downloaded.targetId,probe.targetId);assert.equal(downloaded.artifactSha256,probe.artifactSha256)
   assert.deepEqual(errors,[])
   await page.screenshot({path:`${out}/probe-${binary.version}.png`,fullPage:true})
   await writeFile(`${out}/environment-${binary.version}.json`,JSON.stringify(downloaded,null,2)+'\n')
   results.push({version:browser.version(),passed:true,scope:'Handoff UI, independent production roots, pending-only environment export and privacy assertions; desktop automation only.',targetLinks:23,caseRoutes:routes.length,nativeDeviceAcceptance:false})
  }finally{await browser.close()}
 }
}finally{await kit.close();await writeFile(`${out}/summary.json`,JSON.stringify({generatedAt:new Date().toISOString(),results},null,2)+'\n')}
console.log(JSON.stringify(results))
