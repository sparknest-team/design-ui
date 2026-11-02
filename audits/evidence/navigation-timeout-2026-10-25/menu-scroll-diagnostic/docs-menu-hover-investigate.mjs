import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve, extname, sep } from 'node:path'
import { componentPages } from '/Users/shuaimeng/github_web/design-ui/browser/inventory.mjs'
import { checkSource, chooseTheme } from '/Users/shuaimeng/github_web/design-ui/browser/runner.mjs'
import { contractFor } from '/Users/shuaimeng/github_web/design-ui/browser/contracts.mjs'
import { exercise } from '/Users/shuaimeng/github_web/design-ui/browser/actions.mjs'
const root = '/Users/shuaimeng/github_web/cedar-design-web'
const directory = `${root}/packages/cedar-ui/dist`
const { chromium } = createRequire(`${root}/package.json`)('playwright')
const types = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg' }
const server = createServer(async (request,response) => {
  const pathname = new URL(request.url,'http://localhost').pathname
  const file=resolve(directory,`.${pathname.endsWith('/')?pathname+'index.html':pathname}`)
  if(!file.startsWith(directory+sep)){response.writeHead(403).end();return}
  try{response.writeHead(200,{'content-type':types[extname(file)]??'application/octet-stream'});response.end(await readFile(file))}catch{response.writeHead(404).end()}
})
await new Promise(done=>server.listen(0,'127.0.0.1',done))
const origin=`http://127.0.0.1:${server.address().port}`
const browser=await chromium.launch()
try{
 for(let round=0;round<8;round++){
  const context=await browser.newContext({viewport:{width:1280,height:900}})
  const page=await context.newPage();page.setDefaultTimeout(5000)
  await page.addInitScript(()=>{
   window.__hoverTrace=[]
   const record=(value)=>{window.__hoverTrace.push({t:performance.now(),...value});if(window.__hoverTrace.length>200)window.__hoverTrace.shift()}
   for(const [object,name] of [[window,'scrollTo'],[Element.prototype,'scrollIntoView'],[HTMLElement.prototype,'focus'],[history,'replaceState']]){
    const original=object[name]
    object[name]=function(...args){record({type:name,args:args.map(value=>typeof value==='object'?JSON.stringify(value):value),target:this.textContent?.slice(0,30),stack:new Error().stack});return Reflect.apply(original,this,args)}
   }
   for(const type of ['mouseover','mouseout','click'])document.addEventListener(type,e=>{
    const item=e.target.closest?.('[role="menuitem"],button')
    if(item)record({type,text:item.textContent?.trim(),related:e.relatedTarget?.textContent?.trim()?.slice(0,30),x:e.clientX,y:e.clientY,hit:document.elementFromPoint(e.clientX,e.clientY)?.textContent?.trim()?.slice(0,30),box:item.getBoundingClientRect().toJSON(),pointer:getComputedStyle(item).pointerEvents})
   },true)
   document.addEventListener('scroll',()=>record({type:'scroll',y:scrollY}),true)
  })
  let error
  try{
   await page.goto(origin+'/components/menu/')
   await chooseTheme(page,'cedar','documentation','darkTheme')
   const item=componentPages(root,'cedar').find(item=>item.component==='menu')
   for(const index of [0])await checkSource(page,'cedar',index,item.demos[index])
   await exercise({page,library:'cedar',component:'menu',contract:contractFor('cedar','menu'),demos:item.demos,demo:page.locator('.vmi-previewer-example').first()})
  }catch(cause){error=String(cause)}
  console.log(JSON.stringify({round,error,trace:await page.evaluate(()=>window.__hoverTrace)}))
  await context.close()
  if(error)break
 }
}finally{await browser.close();server.closeAllConnections();await new Promise(done=>server.close(done))}
