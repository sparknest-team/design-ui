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
const evidence = process.env.DIRECTION_EVIDENCE_DIR ? resolve(process.env.DIRECTION_EVIDENCE_DIR, 'batch-e') : resolve(workspace, 'design-ui/audits/evidence/reading-direction-batch-e-2026-10-29')
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
      await page.goto(`http://127.0.0.1:${port}`); await page.locator('#c-name input').waitFor();
      const state = async () => JSON.parse(await page.locator('#state').textContent());
      const content = (p,key) => page.locator(`#${p}-${key} ${p === 'c' ? '.c-form-item-content' : '.mp-form-item__content'}`);
      const label = (p,key) => page.locator(`#${p}-${key} ${p === 'c' ? '.c-form-item-label-col' : '.mp-form-item__label-col'}`);
      for (const direction of ['ltr','rtl','ltr']) {
        if (await page.locator('#toggle').textContent() !== direction) await page.locator('#toggle').click();
        await page.waitForTimeout(100);
        for (const p of ['c','m']) {
          assert.equal(await content(p,'read').evaluate(el => getComputedStyle(el).textAlign), 'start');
          assert.equal(await label(p,'name').evaluate(el => getComputedStyle(el).justifyContent), 'flex-end');
          const lab = await label(p,'name').boundingBox(), ctl = await content(p,'name').boundingBox();
          assert.ok(direction === 'rtl' ? lab.x > ctl.x : lab.x < ctl.x, `${engine}: labels precede controls`);
          assert.equal(await content(p,'override').evaluate(el => getComputedStyle(el).textAlign), 'left');
          for (const align of ['start','end','left','right','center']) {
            await page.selectOption('#align',align);
            const box = await content(p,'read').boundingBox(), value = await content(p,'read').locator('[data-value]').boundingBox();
            const physical = align === 'start' ? direction === 'rtl' ? 'right' : 'left' : align === 'end' ? direction === 'rtl' ? 'left' : 'right' : align;
            assert.ok(physical === 'left' ? Math.abs(value.x - box.x) < 3 : physical === 'right' ? Math.abs(value.x + value.width - box.x - box.width) < 3 : Math.abs(value.x + value.width / 2 - box.x - box.width / 2) < 3, `${engine} ${p} ${direction}: physical content ${align}`);
            assert.equal(await content(p,'override').evaluate(el => getComputedStyle(el).textAlign),'left');
          }
          await page.selectOption('#align','');
          for (const a of ['start','end','left','right']) {
            await page.selectOption('#label-align',a);
            const r = await label(p,'name').evaluate(el => { const b = el.getBoundingClientRect(), s = getComputedStyle(el); const left = b.x + parseFloat(s.paddingLeft) + parseFloat(s.borderLeftWidth); const right = b.right - parseFloat(s.paddingRight) - parseFloat(s.borderRightWidth); return { x: left, width: right-left } }), text = await label(p,'name').locator('label').first().boundingBox();
            const side = a === 'start' ? direction === 'rtl' ? 'right':'left' : a === 'end' ? direction === 'rtl' ? 'left':'right' : a;
            assert.ok(side === 'left' ? Math.abs(text.x - r.x) < 3 : Math.abs(text.x + text.width - r.x - r.width) < 3, `${engine} ${p} ${direction}: physical label ${a} ${JSON.stringify({r,text,side})}`);
          }
          await page.selectOption('#label-align','');
          const radios = page.locator(`#${p}-choice`).getByRole('radio');
          await radios.first().focus(); await page.keyboard.press('Home'); assert.equal((await state()).models[p].choice, 'a');
          await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
          assert.equal((await state()).models[p].choice,'b', `${engine} ${p} ${direction} ${await radios.first().evaluate(el => JSON.stringify({dir:getComputedStyle(el).direction, parent:el.closest('[dir]')?.getAttribute('dir'),active:document.activeElement?.outerHTML}))}`);
          await page.keyboard.press('End'); assert.equal((await state()).models[p].choice,'c');
          await page.keyboard.press('Home'); assert.equal((await state()).models[p].choice,'a');
          const checkbox = page.locator(`#${p}-checks`).getByRole('checkbox').nth(2);
          await checkbox.focus(); await page.keyboard.press('Space'); assert.deepEqual((await state()).models[p].checks,['a','b']);
          await page.keyboard.press('Space'); assert.deepEqual((await state()).models[p].checks,['a']);
          const sw = page.locator(`#${p}-enabled`).getByRole('switch'), handle = sw.locator(p === 'c' ? '.c-switch__handle':'.mp-switch__handle');
          const before = await handle.boundingBox(); await sw.focus(); await page.keyboard.press('Space'); await page.waitForTimeout(220);
          const after = await handle.boundingBox(); assert.equal((await state()).models[p].enabled,true);
          assert.ok(direction === 'rtl' ? after.x < before.x : after.x > before.x, `${engine}: switch follows inline end`);
          await page.keyboard.press('Enter'); assert.equal((await state()).models[p].enabled,false);
          for (const orientation of ['vertical','horizontal']) {
            await page.selectOption('#orientation',orientation);
            await radios.first().focus(); await page.keyboard.press('ArrowDown'); assert.equal((await state()).models[p].choice,'b'); await page.keyboard.press('Home');
          }
        }
        const stable = await state();
        await page.locator('#validate').click(); for (const p of ['c','m']) await page.locator(`#${p}-name`).getByText('Name required',{exact:true}).waitFor();
        const errorsBefore = await page.getByText('Name required',{exact:true}).count();
        assert.equal(await page.locator('#m-name .mp-form-details__error-message').evaluate(el => getComputedStyle(el).textAlign), 'start');
        assert.equal(await page.locator('#m-name .mp-form-details__extra-message').evaluate(el => getComputedStyle(el).textAlign), 'end');
        await page.locator('#toggle').evaluate(el => el.click()); await page.waitForTimeout(100);
        assert.equal(await page.getByText('Name required',{exact:true}).count(),errorsBefore); assert.deepEqual(await state(),stable);
        await page.locator('#toggle').evaluate(el => el.click());
        for (const layout of ['vertical','inline','horizontal']) { await page.selectOption('#layout',layout); await page.waitForTimeout(70); assert.deepEqual(await state(),stable) }
        for (const variant of ['button','radio']) {
          await page.selectOption('#variant',variant);
          for (const p of ['c','m']) { const rs = page.locator(`#${p}-choice`).getByRole('radio'); await rs.first().focus(); await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft':'ArrowRight'); assert.equal((await state()).models[p].choice,'b'); await page.keyboard.press('Home'); }
        }
        for (const id of ['disabled','readonly','loading']) {
          const old = await state(); await page.locator(`#${id}`).click();
          for (const p of ['c','m']) { const sw = page.locator(`#${p}-enabled`).getByRole('switch'); if (await sw.isEnabled()) { await sw.focus(); await page.keyboard.press('Space') }
            if (id === 'readonly') { const cb = page.locator(`#${p}-checks`).getByRole('checkbox').first(); await cb.focus(); await page.keyboard.press('Space'); const r = page.locator(`#${p}-choice`).getByRole('radio').first(); await r.focus(); await page.keyboard.press('ArrowDown') }
            if (id === 'disabled') { assert.equal(await page.locator(`#${p}-checks`).getByRole('checkbox').first().isDisabled(), true); assert.equal(await page.locator(`#${p}-choice`).getByRole('radio').first().isDisabled(), true) } }
          assert.deepEqual(await state(),old); await page.locator(`#${id}`).click();
        }
        const nested = page.locator('#nested').getByRole('radio'); await nested.first().focus(); await page.keyboard.press('ArrowRight'); assert.equal(await nested.nth(2).isChecked(),true);
        results.push({engine,direction,platforms:['Cedar','Maple'],physicalAndLogicalAlign:true,validationPreserved:true,radioKeyboard:true,checkboxSpace:true,switchKeyboard:true,layouts:3});
        console.log(`${engine} ${direction}: form and choice contracts passed`);
      }
      assert.deepEqual(errors,[]);
      if(engine==='chromium') { await page.locator('#toggle').click(); await page.waitForTimeout(100); await page.screenshot({path:join(evidence,'rtl-form-choice.png')}) }
    } finally { await browser.close() }
  }
  await writeFile(join(evidence,'results.json'),JSON.stringify({passed:true,results},null,2)); console.log(JSON.stringify({passed:true,results},null,2));
} finally { await new Promise(resolve => server?.httpServer.close(resolve) ?? resolve()); await rm(output,{recursive:true,force:true}) }
