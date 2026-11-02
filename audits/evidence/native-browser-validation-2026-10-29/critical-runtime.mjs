import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {startKitServers} from '/Users/shuaimeng/github_web/design-ui/browser/native-kit/serve.mjs'
import {componentPages,demoIndex,mobileSection} from '/tmp/cedar-maple-native-payload-20261029-M2UIZp/design-ui/browser/inventory.mjs'
import {contractFor} from '/tmp/cedar-maple-native-payload-20261029-M2UIZp/design-ui/browser/contracts.mjs'
import {exercise} from '/tmp/cedar-maple-native-payload-20261029-M2UIZp/design-ui/browser/actions.mjs'
import {chooseTheme} from '/tmp/cedar-maple-native-payload-20261029-M2UIZp/design-ui/browser/runner.mjs'
const {chromium}=createRequire('/Users/shuaimeng/github_web/cedar-design-web/package.json')('playwright')
const config=JSON.parse(await readFile('/tmp/cedar-maple-native-validation/version-config.json'))
const root='/Users/shuaimeng/github_web/design-ui/artifacts/native-handoff-2026-10-29'
const manifest=JSON.parse(await readFile(root+'/manifest.json'))
const out='/tmp/cedar-maple-native-validation/critical-runtime';await mkdir(out,{recursive:true})
const kit=await startKitServers(root,{port:0});const results=[]
try{
 for(const binary of config.browsers){
 const browser=await chromium.launch({executablePath:binary.executablePath,headless:true});assert.equal(browser.version(),binary.version)
 try{
 for(const library of ['maple','cedar']){
  const context=await browser.newContext(library==='maple'?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:`Mozilla/5.0 (Linux; Android 13; QA Emulation) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${binary.version} Mobile Safari/537.36`}:{viewport:{width:1440,height:1000}})
  const pages=componentPages(config.roots[library],library)
  const routes=[...new Map(manifest.libraries[library].checklist.flatMap(x=>x.routes).map(x=>[x.component,x])).values()]
  for(const theme of ['lightTheme','darkTheme'])for(const route of routes){
   const page=await context.newPage();page.setDefaultTimeout(5000);const errors=[]
   page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:')&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`)})
   const record={library,version:binary.version,component:route.component,theme,nativeDeviceAcceptance:false}
   try{
    const item=pages.find(x=>x.component===route.component),contract=contractFor(library,item.component),index=demoIndex(item,contract.demo)
    await page.goto(`http://127.0.0.1:${kit.ports[library]}`+route.url.slice(library.length+1))
    await chooseTheme(page,library,library==='maple'?'mobile':'documentation',theme)
    const demo=library==='maple'?page.locator(`section[data-demo="${mobileSection(item,item.demos[index])}"]`):page.locator('.vmi-previewer-example').nth(index)
    await demo.waitFor({state:'visible'})
    const features=await page.evaluate(()=>({colorMix:CSS.supports('color','color-mix(in srgb, red 50%, blue)'),has:CSS.supports('selector(:has(*))'),dvh:CSS.supports('height','100dvh'),resizeObserver:typeof ResizeObserver==='function',intersectionObserver:typeof IntersectionObserver==='function',visualViewport:!!visualViewport}))
    assert.ok(Object.values(features).every(Boolean))
    const result=await exercise({page,demo,component:item.component,library,contract,demos:item.demos,capture:async()=>{}})
    assert.deepEqual(errors,[]);record.passed=true;record.result=result;record.features=features
   }catch(error){record.passed=false;record.error=String(error);await page.screenshot({path:`${out}/${library}-${binary.version}-${theme}-${route.component}-failed.png`,fullPage:true})}
   finally{results.push(record);await page.close();await writeFile(`${out}/summary.json`,JSON.stringify({generatedAt:new Date().toISOString(),scope:'Critical handoff component runtime and themes on the accepted artifact; source-panel parity and full matrix are separate.',nativeDeviceAcceptance:false,complete:false,results},null,2)+'\n');console.log(JSON.stringify(record))}
  }
  await context.close()
 }
 }finally{await browser.close()}
 }
}finally{await kit.close()}
const summary={generatedAt:new Date().toISOString(),scope:'Critical handoff component runtime and themes on the accepted artifact; excludes source-panel parity and full matrix certification.',nativeDeviceAcceptance:false,latestTwoVersionsAccepted:false,complete:results.length>0&&results.every(x=>x.passed),cases:results.length,passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,results}
await writeFile(`${out}/summary.json`,JSON.stringify(summary,null,2)+'\n');if(!summary.complete)process.exitCode=1
