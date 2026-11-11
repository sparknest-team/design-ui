import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {createRequire} from 'node:module'
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {resolve,extname,sep} from 'node:path'
import {loadavg,freemem,cpus} from 'node:os'
import {componentPages,demoIndex} from '/Users/shuaimeng/github_web/design-ui/browser/inventory.mjs'
import {chooseTheme,checkSource} from '/Users/shuaimeng/github_web/design-ui/browser/runner.mjs'
import {contractFor} from '/Users/shuaimeng/github_web/design-ui/browser/contracts.mjs'
import {exercise} from '/Users/shuaimeng/github_web/design-ui/browser/actions.mjs'
import {navigateWithDiagnostics} from '/Users/shuaimeng/github_web/design-ui/browser/navigation.mjs'
const workspace='/Users/shuaimeng/github_web',out=workspace+'/design-ui/audits/evidence/autocomplete-final-2026-10-25/resource-diagnostic'
await mkdir(out,{recursive:true})
const {chromium}=createRequire(workspace+'/maple-design-mobile/package.json')('playwright')
const browser=await chromium.launch(),results=[]
const resources=()=>({at:new Date().toISOString(),cpus:cpus().length,loadavg:loadavg(),freeBytes:freemem()})
const initial=resources()
try{
 for(const library of ['cedar','maple']){
  const root=workspace+'/'+(library==='cedar'?'cedar-design-web':'maple-design-mobile'),directory=root+`/packages/ui/`+(library==='cedar'?'dist':'site')
  const server=createServer(async(req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),f=resolve(directory,'.'+(p.endsWith('/')?p+'index.html':p));assert.ok(f.startsWith(directory+sep));const data=await readFile(f);res.writeHead(200,{'content-type':({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.wasm':'application/wasm'})[extname(f)]??'application/octet-stream'}).end(data)}catch{res.writeHead(404).end()}})
  await new Promise(done=>server.listen(0,'127.0.0.1',done));const origin='http://127.0.0.1:'+server.address().port
  try{for(let run=1;run<=2;run++){
   const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();page.setDefaultTimeout(5000)
   const start=performance.now(),requests=[],timings=[],states=[];const pending=new Map()
   page.on('request',r=>{if(r.url().endsWith('.json'))pending.set(r,{url:r.url(),start:performance.now()-start})})
   page.on('requestfinished',r=>{const item=pending.get(r);if(item){requests.push({...item,elapsed:performance.now()-start-item.start});pending.delete(r)}})
   const component=library==='cedar'?'badge':'loading-bar',theme=library==='cedar'?'lightTheme':'darkTheme',item=componentPages(root,library).find(x=>x.component===component),contract=contractFor(library,component),index=demoIndex(item,contract.demo)
   let sampler
   try{
    await navigateWithDiagnostics(page,origin+item.route);await chooseTheme(page,library,'documentation',theme)
    for(const sourceIndex of library==='cedar'?item.demos.map((_,i)=>i):[...new Set([0,index])]){const t=performance.now();await checkSource(page,library,sourceIndex,item.demos[sourceIndex]);timings.push({sourceIndex,elapsed:performance.now()-t})}
    if(library==='maple'){
     sampler=setInterval(()=>{void page.locator('.mp-loading-bar').evaluateAll(nodes=>nodes.map(n=>({opacity:getComputedStyle(n).opacity,width:n.getBoundingClientRect().width,transition:getComputedStyle(n).transitionDuration}))).then(value=>states.push({time:performance.now()-start,value})).catch(()=>{})},100)
     const demo=page.locator('.loca-doc-preview__example').nth(index)
     await exercise({page,demo,component,library,contract,demos:item.demos})
    }
    results.push({library,run,passed:true,total:performance.now()-start,timings,requests,states})
   }catch(error){results.push({library,run,passed:false,error:String(error),timings,requests,states});await page.screenshot({path:resolve(out,`${library}-${run}-failure.png`)})}
   finally{clearInterval(sampler);await context.close()}
  }}finally{server.closeAllConnections();await new Promise(done=>server.close(done))}
 }
}finally{await browser.close();await writeFile(resolve(out,'results.json'),JSON.stringify({initial,final:resources(),results},null,2))}
console.log(JSON.stringify(results.map(({library,run,passed,total,timings,error})=>({library,run,passed,total,timings,error})),null,2))
assert.ok(results.every(x=>x.passed))
