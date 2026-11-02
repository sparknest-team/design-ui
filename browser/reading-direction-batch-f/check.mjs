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
const evidence = process.env.DIRECTION_EVIDENCE_DIR ? resolve(process.env.DIRECTION_EVIDENCE_DIR, 'batch-f') : resolve(workspace, 'design-ui/audits/evidence/reading-direction-batch-f-2026-10-30')
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
  for (const [engine, launcher] of Object.entries({ chromium, firefox, webkit })) {
    if (process.env.DIRECTION_ENGINES && !process.env.DIRECTION_ENGINES.split(',').includes(engine)) continue
    const browser = await launcher.launch({ headless: true })
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, hasTouch: true })
      page.setDefaultTimeout(10000)
      const errors = []; page.on('pageerror', error => errors.push(error.message))
      await page.goto(`http://127.0.0.1:${port}`); await page.locator('#cCas input').waitFor();
      const state = async () => JSON.parse(await page.locator('#state').textContent());
      const setScope = async direction => { await page.locator('#scope').evaluate((el,dir) => el.setAttribute('dir',dir),direction); await page.waitForTimeout(80) };
      const input = id => page.locator(`#${id} input`).first();
      if (process.env.DIRECTION_CAPTURE_ONLY) {
        await page.locator('#toggle').click(); const cas=input('cCas'); await cas.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowLeft');
        const panel=page.locator('#portal .c-cascader-panel:visible'); await panel.waitFor();
        await panel.getByRole('menuitem',{name:'Root العربية',exact:true}).click();
        await page.waitForFunction(() => document.querySelector('#portal .c-cascader-panel')?.querySelectorAll('.c-cascader-panel-column').length === 2); await page.waitForTimeout(450);
        await page.screenshot({path:join(evidence,'rtl-hierarchical-fields.png'),animations:'disabled'});
        continue;
      }
      for(const direction of ['ltr','rtl','ltr']) {
        if(await page.locator('#toggle').textContent() !== direction) await page.locator('#toggle').click();
        await page.locator('#reset').click(); await page.waitForTimeout(100);
        assert.equal(await input('nested').evaluate(el=>getComputedStyle(el).direction),'ltr');
        for(const p of ['c','m']) {
          const prefix = p === 'c' ? 'c' : 'mp';
          for(const virtual of [false,true]) {
            if(Boolean(await page.locator(`#${p}Cas .${prefix}-virtual-list`).count()) !== virtual && virtual) { await page.locator('#virtual').click(); await page.waitForTimeout(80) }
            const cas = input(`${p}Cas`); await cas.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('ArrowDown');
            const panel = page.locator(`#portal .${prefix}-cascader-panel:visible`).last(); await panel.waitFor();
            assert.equal(await panel.evaluate(el=>getComputedStyle(el).direction),direction);
            await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'); await page.waitForTimeout(100);
            const columns = panel.locator(`.${prefix}-cascader-panel-column`); assert.equal(await columns.count(),2);
            const first = await columns.first().boundingBox(), last = await columns.last().boundingBox();
            assert.ok(direction==='rtl' ? first.x>last.x : first.x<last.x,`${engine}: child columns follow reading order`);
            const icon = panel.locator(`.${prefix}-cascader-option-expand-icon`).first();
            const matrix = await icon.evaluate(el=>getComputedStyle(el).transform); assert.equal(matrix==='none',direction==='ltr');
            const borders = await columns.first().evaluate(el=>({left:getComputedStyle(el).borderLeftWidth,right:getComputedStyle(el).borderRightWidth})); assert.equal(parseFloat(direction==='rtl'?borders.left:borders.right),1);
            await page.keyboard.press(direction==='rtl'?'ArrowRight':'ArrowLeft');
            const saved = await state(); await setScope(direction==='rtl'?'ltr':'rtl');
            assert.deepEqual(await state(),saved);
            await page.keyboard.press(direction==='rtl'?'ArrowRight':'ArrowLeft'); // child key in the new direction
            await page.keyboard.press('Enter'); assert.deepEqual((await state()).values[`${p}Cas`],['root','one']);
            await setScope(direction);
            await page.locator(`#${p}Cas .${prefix}-field-decorator__clear-btn`).click();
            await page.keyboard.press('Escape');
            if(virtual) await page.locator('#virtual').click();
          }
          const multi=input(`${p}Multi`); await multi.focus(); await page.keyboard.press('Backspace'); assert.deepEqual((await state()).values[`${p}Multi`],['one']);
          await multi.fill('Deep'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.keyboard.press('Escape'); assert.deepEqual((await state()).values[`${p}Multi`],['one','deep']);
          const auto=input(`${p}Auto`); await auto.fill('al'); await page.keyboard.press('ArrowDown');
          const list=page.locator(`#portal .${prefix}-select-dropdown:visible`).last(); await list.waitFor(); assert.equal(await list.evaluate(el=>getComputedStyle(el).direction),direction);
          await auto.evaluate(el=>{const reference=document.createElement('input');reference.id='native-reference';reference.value=el.value;reference.dir=getComputedStyle(el).direction;reference.style.unicodeBidi=getComputedStyle(el).unicodeBidi;el.closest('#scope').append(reference);reference.setSelectionRange(1,1)});
          await page.locator('#native-reference').focus(); await page.keyboard.press('ArrowLeft'); const nativeCaret=await page.locator('#native-reference').evaluate(el=>el.selectionStart); await page.locator('#native-reference').evaluate(el=>el.remove());
          await auto.focus(); await auto.evaluate(el=>el.setSelectionRange(1,1)); await page.keyboard.press('ArrowLeft'); assert.equal(await auto.evaluate(el=>el.selectionStart),nativeCaret); await list.waitFor();
          await page.keyboard.press('Enter'); assert.equal((await state()).values[`${p}Auto`],'alpha');
          await auto.fill('draft'); await page.waitForFunction(id => JSON.parse(document.getElementById('state').textContent).values[id] === 'draft', `${p}Auto`); await auto.evaluate(el=>el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true})));
          await auto.evaluate(el=>{el.value='组合 العربية';el.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}))}); assert.equal((await state()).values[`${p}Auto`],'draft'); assert.equal(await auto.inputValue(), '组合 العربية', `${engine} ${p} ${direction}: native composing value`);
          await auto.evaluate(el=>{el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));el.dispatchEvent(new InputEvent('input',{bubbles:true}))}); await page.waitForFunction(id => JSON.parse(document.getElementById('state').textContent).values[id] === '组合 العربية', `${p}Auto`);
          await page.keyboard.press('Escape');
        }
        const tree=input('tree'); await tree.focus(); await page.keyboard.press('Enter');
        const popup=page.locator('#portal .c-tree-select-popup:visible').last(); await popup.waitFor();
        await page.keyboard.press('Home'); await page.keyboard.press(direction==='rtl'?'ArrowLeft':'ArrowRight'); await page.waitForTimeout(150);
        const root=popup.getByRole('treeitem',{name:'Root العربية',exact:true}); assert.equal(await root.getAttribute('aria-expanded'),'true');
        await page.keyboard.press(direction==='rtl'?'ArrowLeft':'ArrowRight'); await page.keyboard.press('Enter'); assert.equal((await state()).values.tree,'one');
        await tree.fill('Deep'); await page.locator('#portal .c-tree-select-option-active:visible').filter({hasText:'Deep 123'}).waitFor(); await page.keyboard.press('Enter'); assert.equal((await state()).values.tree,'deep'); await page.keyboard.press('Escape');
        const treeMulti=input('treeMulti'); await treeMulti.focus(); await page.keyboard.press('Backspace'); assert.deepEqual((await state()).values.treeMulti,['one']);
        await treeMulti.fill('Deep'); await page.locator('#portal .c-tree-select-option-active:visible').filter({hasText:'Deep 123'}).waitFor(); await page.keyboard.press('Enter'); assert.deepEqual((await state()).values.treeMulti,['one','deep']); await page.keyboard.press('Escape');
        const panelBefore=(await state()).values.mPanel; await page.locator('#mPanel').getByRole('button').click();
        const editor=page.locator('#portal .mp-field-presentation__panel:visible'); await editor.waitFor();
        assert.equal(await editor.evaluate(el=>getComputedStyle(el).direction),direction);
        await editor.getByRole('menuitem',{name:'Root العربية',exact:true}).click(); await editor.getByRole('menuitem',{name:'One עברית',exact:true}).click();
        assert.deepEqual((await state()).values.mPanel,panelBefore);
        await editor.locator('.mp-field-presentation__footer button').last().click(); assert.deepEqual((await state()).values.mPanel,['root','one']);
        const stable=await state();
        for(const id of ['disabled','readonly']) {
          await page.locator(`#${id}`).click();
          for(const field of ['cCas','mCas','tree','cAuto','mAuto']) {
            const editor=input(field);
            if(id==='disabled') assert.equal(await editor.isDisabled(),true);
            else assert.ok(await editor.getAttribute('readonly')!==null);
          }
          assert.deepEqual(await state(),stable); await page.locator(`#${id}`).click();
        }
        results.push({engine,direction,platforms:['Cedar','Maple'],hierarchy:true,portal:true,virtualColumns:true,search:true,multiTags:true,treeSelect:true,autoComplete:true,composition:true,mobileDraft:true}); console.log(`${engine} ${direction}: hierarchical field contracts passed`);
      }
      assert.deepEqual(errors,[]);
      if(engine==='chromium'){await page.locator('#toggle').click();await page.waitForTimeout(100);const cas=input('cCas');await cas.focus();await page.keyboard.press('Enter');await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowLeft');await page.waitForTimeout(100);await page.screenshot({path:join(evidence,'rtl-hierarchical-fields.png'),animations:'disabled'})}
    } finally {await browser.close()}
  }
  if (!process.env.DIRECTION_CAPTURE_ONLY) await writeFile(join(evidence,'results.json'),JSON.stringify({passed:true,results},null,2));console.log(JSON.stringify({passed:true,results},null,2));
} finally {await new Promise(resolve=>server?.httpServer.close(resolve)??resolve());await rm(output,{recursive:true,force:true})}
