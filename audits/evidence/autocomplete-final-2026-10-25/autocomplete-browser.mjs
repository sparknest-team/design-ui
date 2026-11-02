import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { componentPages, mobileSection, sourceFingerprint, productionFingerprint } from '/Users/shuaimeng/github_web/design-ui/browser/inventory.mjs'
import { copyProductionSnapshot } from '/Users/shuaimeng/github_web/design-ui/browser/snapshot.mjs'
import { chooseTheme, checkSource } from '/Users/shuaimeng/github_web/design-ui/browser/runner.mjs'
import { navigateWithDiagnostics } from '/Users/shuaimeng/github_web/design-ui/browser/navigation.mjs'
const root='/Users/shuaimeng/github_web/maple-design-mobile'
const evidence='/Users/shuaimeng/github_web/design-ui/audits/evidence/autocomplete-final-2026-10-25/autocomplete'
const { chromium, devices }=createRequire(resolve(root,'package.json'))('playwright')
const before={source:sourceFingerprint(root,'maple'),production:productionFingerprint(root,'maple')}
const baseline=JSON.parse(await readFile(resolve(evidence,'../before-build.json'),'utf8')).find(x=>x.library==='maple')
assert.deepEqual(before,{source:baseline.source,production:baseline.production})
await mkdir(evidence,{recursive:true})
const directory=await mkdtemp(resolve(tmpdir(),'maple-auto-final-'))
await copyProductionSnapshot(resolve(root,'packages/maple-ui/site'),directory)
const buildIndexHash=createHash('sha256').update(await readFile(resolve(directory,'index.html'))).digest('hex')
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.wasm':'application/wasm'}
const server=createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=resolve(directory,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));if(!file.startsWith(directory+sep)){res.writeHead(403).end();return}res.writeHead(200,{'content-type':types[extname(file)]??'application/octet-stream'}).end(await readFile(file))}catch{res.writeHead(404).end()}})
await new Promise(done=>server.listen(0,'127.0.0.1',done))
const origin='http://127.0.0.1:'+server.address().port
const browser=await chromium.launch(),results=[]
const formPage=componentPages(root,'maple').find(x=>x.component==='form'),index=formPage.demos.findIndex(x=>x.name==='field-selection.vue')
assert.ok(index>=0)
const visible=l=>l.filter({visible:true})
const panel=page=>visible(page.locator('.mp-field-presentation__panel')).last()
const metrics=async option=>option.evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {height:r.height,fontSize:s.fontSize,lineHeight:s.lineHeight,padding:s.padding,color:s.color,background:s.backgroundColor,borderRadius:s.borderRadius,check:Boolean(el.querySelector('.mp-select-option-check'))}})
async function settle(page){await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))))}
async function position(page,demo){await page.waitForFunction(()=>{const f=document.querySelector('.mp-auto-complete'),l=document.querySelector('.mp-auto-complete__dropdown');if(!f||!l)return false;const a=f.getBoundingClientRect(),b=l.getBoundingClientRect();return Math.abs(b.top-a.bottom-4)<1&&Math.abs(a.left-b.left)<1&&Math.abs(a.width-b.width)<1});const value=await demo.locator('.mp-auto-complete').evaluate(el=>{const f=el.getBoundingClientRect(),l=document.getElementById(el.querySelector('input').getAttribute('aria-controls')).getBoundingClientRect();return {inputTop:f.top,inputBottom:f.bottom,listTop:l.top,gap:l.top-f.bottom,leftDifference:l.left-f.left,widthDifference:l.width-f.width}});assert.equal(value.gap,4);assert.equal(value.leftDifference,0);assert.equal(value.widthDifference,0);return value}
try {
 for(const surface of ['documentation','mobile'])for(const theme of ['lightTheme','darkTheme']){
  const context=await browser.newContext({...(surface==='mobile'?devices['iPhone 13']:{}),viewport:{width:surface==='mobile'?375:1280,height:900},hasTouch:surface==='mobile'})
  const page=await context.newPage();page.setDefaultTimeout(5000);const errors=[]
  page.on('pageerror',e=>errors.push(String(e)))
  page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`)})
  page.on('requestfailed',r=>{if(r.url().startsWith(origin))errors.push(`${r.failure()?.errorText} ${r.url()}`)})
  try {
   await navigateWithDiagnostics(page,origin+(surface==='mobile'?'/mobile.html#/form?language=zh-CN':formPage.route))
   await chooseTheme(page,'maple',surface,theme)
   if(surface==='documentation')await checkSource(page,'maple',index,formPage.demos[index])
   const demo=surface==='documentation'?page.locator('.loca-doc-preview__example').nth(index):page.locator(`section[data-demo="${mobileSection(formPage,formPage.demos[index])}"]`)
   const form=demo.locator('.mp-form').first(),fields=form.locator('.mp-form-item'),model=demo.locator('.form-model-output')
   assert.equal(await form.locator('.mp-field-presentation__reference').count(),4)
   const initialModel=await model.innerText()
   await fields.nth(0).locator('.mp-field-presentation__reference').click()
   let p=panel(page);await p.waitFor({state:'visible'});await settle(page)
   const selectPopup=await metrics(p.locator('.mp-select-option-selected').first())
   await p.locator('.mp-field-presentation__close').click();await p.waitFor({state:'hidden'})
   await fields.nth(2).locator('.mp-field-presentation__reference').click()
   p=panel(page);await p.waitFor({state:'visible'});await settle(page)
   const autoPopup=await metrics(p.locator('.mp-select-option-selected').first())
   assert.deepEqual(autoPopup,selectPopup,'popup candidates must match Select including selection styling')
   assert.equal(autoPopup.height,52);assert.equal(autoPopup.fontSize,'16px');assert.equal(autoPopup.padding,'12px')
   await page.screenshot({path:resolve(evidence,`${surface}-${theme}-popup.png`)})
   await p.getByRole('option',{name:'研发平台',exact:true}).click()
   assert.equal(await model.innerText(),initialModel,'popup selection stays a draft')
   await p.locator('footer button').click();await p.waitFor({state:'hidden'})
   assert.match(await model.innerText(),/研发平台/)
   results.push({surface,theme,mode:'popup',passed:true,select:selectPopup,autocomplete:autoPopup,draftAndConfirmation:true})
   await demo.locator('.mp-field-presentation__reference').first().click()
   await visible(page.getByRole('option',{name:'inline',exact:true})).last().click()
   await visible(page.getByRole('button',{name:'确认',exact:true})).last().click()
   await page.waitForFunction(()=>Array.from(document.querySelectorAll('.mp-auto-complete')).some(e=>e.querySelector('input')))
   assert.equal(await form.locator('.mp-field-presentation__reference').count(),0)
   const select=fields.nth(0).getByRole('combobox')
   await select.click();await settle(page)
   const selectOption=visible(page.locator('.mp-select-dropdown:not(.mp-auto-complete__dropdown) .mp-select-option-selected')).last()
   await selectOption.hover(); await settle(page)
   const selectInlineHover=await metrics(selectOption)
   await page.mouse.move(1,1); await settle(page)
   const selectInline=await metrics(selectOption)
   await selectOption.click()
   await visible(page.locator('.mp-select-dropdown:not(.mp-auto-complete__dropdown)')).last().waitFor({state:'hidden'})
   const input=fields.nth(2).getByRole('combobox')
   await input.fill('研发');await input.click();await settle(page)
   const list=page.locator('.mp-auto-complete__dropdown')
   await list.waitFor({state:'visible'})
   const autoOption=list.locator('.mp-select-option-selected').first()
   await autoOption.hover(); await settle(page)
   const autoInlineHover=await metrics(autoOption)
   assert.deepEqual(autoInlineHover,selectInlineHover,'hovered inline candidates must match Select')
   await page.mouse.move(1,1); await settle(page)
   const autoInline=await metrics(autoOption)
   assert.deepEqual(autoInline,selectInline,'inline candidates must match Select including selection styling')
   await input.evaluate(el=>el.scrollIntoView({block:'end',behavior:'instant'}))
   const atBottom=await position(page,demo)
   await input.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}))
   const centered=await position(page,demo)
   await input.evaluate(el=>{let scroller=el.parentElement;while(scroller&&!(scroller.scrollHeight>scroller.clientHeight+120&&/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)))scroller=scroller.parentElement;scroller??=document.scrollingElement;scroller.scrollTop+=scroller.scrollTop+120<scroller.scrollHeight-scroller.clientHeight?120:-120})
   const afterScroll=await position(page,demo)
   assert.ok(Math.abs(afterScroll.inputTop-centered.inputTop)>=40,'real scroll must move the input')
   await input.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await position(page,demo)
   await page.screenshot({path:resolve(evidence,`${surface}-${theme}-inline.png`)})
   await list.getByRole('option',{name:'研发基础设施',exact:true}).click()
   assert.match(await model.innerText(),/研发基础设施/)
   assert.deepEqual(errors,[])
   results.push({surface,theme,mode:'inline',passed:true,select:selectInline,autocomplete:autoInline,selectHover:selectInlineHover,autocompleteHover:autoInlineHover,atBottom,centered,afterScroll,realSelection:true})
   console.log(`PASS ${surface} ${theme}: popup and inline, Select parity, actual scroll and selection`)
  }catch(error){await page.screenshot({path:resolve(evidence,`${surface}-${theme}-failure.png`)}).catch(()=>{});await writeFile(resolve(evidence,`${surface}-${theme}-failure.txt`),String(error)+'\n'+await page.locator('body').innerText().catch(()=>''));throw error}
  finally{await context.close()}
 }
}finally{
 const after={source:sourceFingerprint(root,'maple'),production:productionFingerprint(root,'maple')}
 await writeFile(resolve(evidence,'coverage.json'),JSON.stringify({expected:8,completed:results.length,passed:results.filter(x=>x.passed).length,buildIndexHash,before,after,stable:JSON.stringify(before)===JSON.stringify(after),results},null,2))
 await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done));await rm(directory,{recursive:true,force:true})
}
assert.equal(results.length,8)
assert.deepEqual({source:sourceFingerprint(root,'maple'),production:productionFingerprint(root,'maple')},before)
