import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
const fixture = fileURLToPath(new URL('.', import.meta.url))
const workspace = resolve(fixture, '../../..')
const require = createRequire(resolve(workspace, 'cedar-design-web/packages/cedar-ui/package.json'))
const { build, preview } = await import(new URL('./dist/node/index.js', `file://${require.resolve('vite')}`).href)
const vue = (await import(require.resolve('@vitejs/plugin-vue'))).default
const jsx = (await import(require.resolve('@vitejs/plugin-vue-jsx'))).default
const { chromium, firefox, webkit } = createRequire(resolve(workspace, 'cedar-design-web/package.json'))('playwright')
const output = await mkdtemp(join(tmpdir(), 'reading-direction-batch-'))
const evidence = process.env.DIRECTION_EVIDENCE_DIR ? resolve(process.env.DIRECTION_EVIDENCE_DIR, 'closeout-interactions') : resolve(workspace, 'design-ui/audits/evidence/direction-closeout-2026-10-30/interactions')
await mkdir(evidence, { recursive: true })
const config = {
  configFile: false, root: fixture, logLevel: 'warn', plugins: [vue(), jsx()],
  resolve: { dedupe: ['vue'], alias: { vue: require.resolve('vue/dist/vue.runtime.esm-bundler.js'), '@cedar-design/use': resolve(workspace, 'cedar-design-web/packages/cedar-use/src/index.ts'), '@maple-design/use': resolve(workspace, 'maple-design-mobile/packages/maple-use/src/index.ts') } },
  css: { preprocessorOptions: { less: { javascriptEnabled: true } } },
  build: { outDir: output, emptyOutDir: true, minify: false },
}
let server
const results = []
try {
  await build(config)
  server = await preview({ ...config, preview: { host: '127.0.0.1', port: 0, open: false } })
  const port = server.httpServer.address().port
  for (const [engine,launcher] of Object.entries({chromium,firefox,webkit})) {
    const browser=await launcher.launch({headless:true})
    try {
      const page=await browser.newPage({viewport:{width:1200,height:1000},hasTouch:true,reducedMotion:"no-preference"});page.setDefaultTimeout(10000)
      const errors=[];page.on('pageerror',e=>errors.push(e.message))
      await page.goto(`http://127.0.0.1:${server.httpServer.address().port}`,{timeout:60000,waitUntil:"domcontentloaded"})
      const state=async()=>JSON.parse(await page.locator('#state').textContent())
      for(const direction of ['ltr','rtl','ltr']) {
        await page.locator('#scope').evaluate((el,dir)=>el.setAttribute('dir',dir),direction)
        // Set Vue state through the same runtime toggle as the documentation.
        if(await page.locator('#direction').textContent()!==direction)await page.locator('#direction').click()
        for(const p of ['c','m'])for(const side of ['left','right']) {
          const root=page.locator(`#${p}-${side}`),icon=root.locator('[class$="expand-icon-wrap"]'),title=root.locator('[class$="header-title"]')
          const a=await icon.boundingBox(),b=await title.boundingBox();assert.ok(a&&b);assert.ok(side==='left'?a.x<b.x:a.x>b.x,'explicit collapse side remains physical')
        }
        for(const side of ['left','right']) {
          const root=page.locator('#layout-'+side),a=await root.locator('.c-layout-sider').boundingBox(),b=await root.locator('.c-layout-content').boundingBox();assert.ok(a&&b);assert.ok(side==='left'?a.x<b.x:a.x>b.x,'Sider placement remains physical')
        }
        for(const p of ['c','m']) {
          const prefix=p==='c'?'c':'mp',root=page.locator('#'+p+'-carousel'),track=root.locator('.'+prefix+'-carousel__track')
          await page.locator('#'+p+'-carousel-reset').click();await page.waitForTimeout(400)
          for(const label of ['three','one']) {
            await track.evaluate(el=>{el.removeAttribute('data-move-ran');el.addEventListener('transitionrun',event=>{if(event.propertyName==='transform')el.setAttribute('data-move-ran','true')},{once:true})})
            await root.locator('.'+prefix+'-carousel__arrow-next').click()
            await page.waitForFunction(selector=>document.querySelector(selector)?.getAttribute('data-move-ran')==='true','#'+p+'-carousel .'+prefix+'-carousel__track')
            await page.waitForTimeout(350)
            assert.equal(await root.locator('.'+prefix+'-carousel-item--active').textContent(),label,'looped next preserves semantic order and a real transform transition')
          }
        }
        for(const platform of ['c','m']) {
          if(await page.locator('#platform').textContent()!==platform)await page.locator('#platform').click()
          await page.locator('#open').click();const track=page.locator('[data-image-preview-track]');await track.waitFor();await page.waitForTimeout(400)
          assert.equal((await state()).index,2)
          const cards=track.locator(':scope > *');assert.equal(await cards.count(),3)
          const middle=await cards.nth(1).boundingBox();const stageBox=await page.locator('[data-image-preview-stage]').boundingBox();assert.ok(Math.abs(middle.x-stageBox.x)<2,JSON.stringify({engine,direction,platform,middle,stageBox}))
          const before=(await state()).changes;await page.keyboard.press(direction==='rtl'?'ArrowLeft':'ArrowRight');await page.waitForTimeout(400);assert.equal((await state()).index,3);assert.equal((await state()).changes,before+1)
          await page.keyboard.press(direction==='rtl'?'ArrowRight':'ArrowLeft');await page.waitForTimeout(400);assert.equal((await state()).index,2)
          const stage=page.locator('[data-image-preview-stage]');const box=await stage.boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2
          await stage.dispatchEvent('pointerdown',{pointerId:4,pointerType:'touch',button:0,clientX:x,clientY:y})
          await stage.dispatchEvent('pointermove',{pointerId:4,pointerType:'touch',button:0,clientX:x+(direction==='rtl'?90:-90),clientY:y})
          await stage.dispatchEvent('pointerup',{pointerId:4,pointerType:'touch',button:0,clientX:x+(direction==='rtl'?90:-90),clientY:y});await page.waitForTimeout(400);assert.equal((await state()).index,3)
          const saved=await state();await page.locator('#scope').evaluate(el=>el.setAttribute('dir',el.getAttribute('dir')==='rtl'?'ltr':'rtl'));await page.waitForTimeout(400);assert.deepEqual(await state(),saved,'switching direction never changes the selected image')
          const last=await cards.nth(2).boundingBox();const endStage=await stage.boundingBox();assert.ok(Math.abs(last.x-endStage.x)<2,JSON.stringify({engine,direction,platform,last,endStage}))
          await page.keyboard.press('Escape');await track.waitFor({state:'hidden'});assert.equal((await state()).opened,false)
          await page.locator('#scope').evaluate((el,dir)=>el.setAttribute('dir',dir),direction)
        }
      }
      assert.deepEqual(errors,[]);results.push({engine,passed:true,checks:['carousel-consecutive-and-wrap-transition','physical-collapse-side','physical-sider-placement','preview-keyboard','preview-pointer-swipe','preview-runtime-recenter','value-invariance','escape-close']})
    }finally{await browser.close()}
  }
  await writeFile(resolve(evidence,'results.json'),JSON.stringify({generatedAt:new Date().toISOString(),results},null,2));console.log(JSON.stringify(results))
}finally{await server?.httpServer.close();await rm(output,{recursive:true,force:true})}
