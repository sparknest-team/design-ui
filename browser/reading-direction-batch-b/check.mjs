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
const evidence = process.env.DIRECTION_EVIDENCE_DIR ? resolve(process.env.DIRECTION_EVIDENCE_DIR, 'batch-b') : resolve(workspace, 'design-ui/audits/evidence/reading-direction-batch-b-2026-10-29')
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
      await page.goto(`http://127.0.0.1:${port}`); await page.locator('#split [role=separator]').waitFor(); await page.waitForTimeout(500)
      const drag = async (handle, dx, dy = 0) => { await handle.scrollIntoViewIfNeeded(); const box = await handle.boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 5 }); await page.mouse.up(); await page.waitForTimeout(80) }
      const body = id => page.locator(`#${id} .c-table-body`).filter({ has: page.locator('table') }).first()
      const offset = async locator => locator.evaluate(el => getComputedStyle(el).direction === 'rtl' ? -el.scrollLeft : el.scrollLeft)
      const scroll = async (locator, value) => { await locator.evaluate((el, value) => { el.scrollLeft = getComputedStyle(el).direction === 'rtl' ? -value : value }, value); await page.waitForTimeout(90) }
      for (const direction of ['ltr', 'rtl', 'ltr']) {
        if (await page.locator('#scope').getAttribute('dir') !== direction) await page.locator('#toggle').click()
        await page.waitForTimeout(150)
        const rtl = direction === 'rtl'
        const first = page.locator('#split .c-split-pane-first'), second = page.locator('#split .c-split-pane-second'), handle = page.locator('#split [role=separator]')
        assert.equal((await first.boundingBox()).x > (await second.boundingBox()).x, rtl)
        await handle.focus(); await page.keyboard.press('Home')
        const initial = (await first.boundingBox()).width
        await drag(handle, rtl ? -30 : 30); assert.ok((await first.boundingBox()).width > initial + 20, `${engine} ${direction}: Split grows in reading direction from ${initial} to ${(await first.boundingBox()).width}`)
        await handle.focus(); await page.keyboard.press('Home'); assert.ok(Math.abs(Number(await handle.getAttribute('aria-valuenow')) - 20) < 1)
        await page.keyboard.press('End'); assert.ok(Math.abs(Number(await handle.getAttribute('aria-valuenow')) - 80) < 1)
        await page.keyboard.press(rtl ? 'ArrowRight' : 'ArrowLeft')
        const vertical = page.locator('#vertical [role=separator]'); await vertical.focus(); const old = Number(await vertical.getAttribute('aria-valuenow')); await page.keyboard.press('ArrowDown'); assert.ok(Number(await vertical.getAttribute('aria-valuenow')) > old)
        const nested = page.locator('#nested [role=separator]'); await nested.focus(); const oldNested = Number(await nested.getAttribute('aria-valuenow')); await page.keyboard.press('ArrowRight'); assert.ok(Number(await nested.getAttribute('aria-valuenow')) > oldNested)
        const box = page.locator('#resize .c-resizebox'); const before = (await box.boundingBox()).width
        const left = page.locator('#resize .c-resizebox-direction-left'), right = page.locator('#resize .c-resizebox-direction-right')
        assert.ok((await left.boundingBox()).x < (await right.boundingBox()).x)
        await drag(right, 20); assert.ok(Math.abs((await box.boundingBox()).width - before - 20) < 2, `${engine}: ResizeBox pointer deltas do not accumulate after observation`)
        const beforeLeft = (await box.boundingBox()).width; await left.focus(); await page.keyboard.press('ArrowLeft'); assert.ok((await box.boundingBox()).width > beforeLeft + 5)
        for (const id of ['table', 'mixed-table', 'virtual-table', 'portal-table']) {
          const viewport = body(id); assert.equal(await viewport.count(), 1)
          for (const amount of [0, 180, 9999]) {
            await scroll(viewport, amount)
            await page.waitForFunction(({ id }) => {
              const root = document.getElementById(id), body = root?.querySelector('.c-table-body'), head = root?.querySelector('.c-table-header'), summary = root?.querySelector('.c-table-tfoot')
              if (!body || !head || !summary) return false
              const value = el => getComputedStyle(el).direction === 'rtl' ? -el.scrollLeft : el.scrollLeft
              return Math.abs(value(head) - value(body)) <= 2 && Math.abs(value(summary) - value(body)) <= 2
            }, { id })
            const actual = await offset(viewport)
            const header = page.locator(`#${id} .c-table-header`), summary = page.locator(`#${id} .c-table-tfoot`)
            assert.ok(Math.abs(await offset(header) - actual) <= 2, `${engine} ${direction}: ${id} header sync ${await offset(header)} vs ${actual}`)
            assert.ok(Math.abs(await offset(summary) - actual) <= 2, `${engine}: ${id} summary sync`)
            const bounds = await viewport.boundingBox()
            const leftCell = viewport.locator('tbody tr').first().locator('td.c-table-col-fixed-left').last(), rightCell = viewport.locator('tbody tr').first().locator('td.c-table-col-fixed-right').first()
            const l = await leftCell.boundingBox(), rr = await rightCell.boundingBox()
            assert.ok(l.x >= bounds.x - 2 && l.x + l.width <= bounds.x + 250, `${engine} ${direction}: ${id} physical left frozen ${JSON.stringify({l,bounds})}`)
            assert.ok(rr.x >= bounds.x + bounds.width - 250 && rr.x + rr.width <= bounds.x + bounds.width + 2, `${engine} ${direction}: ${id} physical right frozen`)
          }
          await scroll(viewport, 100)
          const resize = page.locator(`#${id} th[data-column-key=name] [role=separator]`)
          await resize.focus(); const width = Number(await resize.getAttribute('aria-valuenow')); await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight'); await page.waitForTimeout(150)
          assert.ok(Number(await resize.getAttribute('aria-valuenow')) >= width + 8)
          const th = await page.locator(`#${id} th[data-column-key=name]`).boundingBox()
          const td = await viewport.locator('tbody tr').first().locator('td').filter({ hasText: 'Row 0' }).first().boundingBox()
          assert.ok(Math.abs(th.width - td.width) < 3, `${engine}: ${id} resized header/body widths`)
        }
        const rail = page.locator('#footer-host [role=region]'); await rail.waitFor()
        assert.equal(await rail.evaluate(el => getComputedStyle(el).direction), direction)
        await scroll(rail, 230); assert.ok(Math.abs(await offset(body('portal-table')) - 230) < 3)
        await rail.focus(); await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight'); await page.waitForTimeout(160); assert.ok(await offset(rail) > 230, `${engine}: sticky rail keyboard scroll`)
        for (const id of ['virtual-list', 'maple-virtual']) {
          const list = page.locator(`#${id} > div`); await scroll(list, 160)
          await list.evaluate(el => { el.scrollTop = 900 }); await page.waitForTimeout(120)
          assert.ok(Math.abs(await offset(list) - 160) < 2)
          await page.locator('#toggle').click(); await page.waitForTimeout(90); assert.ok(Math.abs(await offset(list) - 160) < 2, `${engine}: ${id} switching keeps inline offset`)
          await page.locator('#toggle').click(); await page.waitForTimeout(90)
        }
        const mobile = page.locator('#maple-table .mp-table__main'); await scroll(mobile, 130); assert.ok(Math.abs(await offset(mobile) - 130) < 2)
        const align = await page.locator('#maple-table td').first().evaluate(el => getComputedStyle(el).textAlign); assert.equal(align, 'start')
        await mobile.focus(); await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight'); await page.waitForTimeout(150); assert.ok(await offset(mobile) > 130, `${engine}: native mobile table keyboard scroll`)
        const saved = await offset(mobile); await page.locator('#toggle').click(); await page.waitForTimeout(80); assert.ok(Math.abs(await offset(mobile) - saved) < 2); await page.locator('#toggle').click(); await page.waitForTimeout(80)
        const state = await page.locator('#split-state').textContent(); await page.locator('#toggle').click(); await page.waitForTimeout(80); await page.locator('#toggle').click(); await page.waitForTimeout(80); assert.equal(await page.locator('#split-state').textContent(), state)
        results.push({ engine, direction, passed: true })
        if (engine === 'chromium' && rtl) await page.locator('#scope').screenshot({ path: join(evidence, 'rtl-layout.png') })
      }
      const amountSort = page.locator('#table th[data-column-key=amount] .c-table-cell[role=button]')
      await amountSort.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Enter'); await page.waitForTimeout(100)
      const rowBefore = await body('table').locator('tbody tr').first().locator('td').filter({ hasText: /^Row / }).textContent()
      assert.equal(rowBefore, 'Row 199', `${engine}: descending sort is active before direction change`)
      const selected = body('table').locator('tbody tr input[type=checkbox]').first(); await selected.focus(); await page.keyboard.press('Space')
      assert.ok(await selected.isChecked())
      await page.locator('#toggle').click(); await page.waitForTimeout(150)
      assert.equal(await body('table').locator('tbody tr').first().locator('td').filter({ hasText: /^Row / }).textContent(), rowBefore)
      assert.ok(await body('table').locator('tbody tr input[type=checkbox]').first().isChecked())
      await page.locator('#toggle').click(); await page.waitForTimeout(150)
      // Cancellation while dragging: switching the reading direction must not reuse stale geometry.
      const handle = page.locator('#split [role=separator]'); await handle.scrollIntoViewIfNeeded(); const b = await handle.boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + 20); await page.mouse.down()
      await page.evaluate(() => { document.querySelector('#scope').dir = 'rtl' }); await page.waitForTimeout(80)
      const state = await page.locator('#split-state').textContent(); await page.mouse.move(b.x - 100, b.y + 20); await page.mouse.up(); assert.equal(await page.locator('#split-state').textContent(), state)
      // Real touch pointer route, plus cancellation and listener release.
      await handle.dispatchEvent('pointerdown', { pointerId: 91, pointerType: 'touch', isPrimary: true, button: 0, clientX: 400, clientY: 50 })
      await page.dispatchEvent('body', 'pointermove', { pointerId: 91, pointerType: 'touch', clientX: 430, clientY: 50 }); await page.dispatchEvent('body', 'pointerup', { pointerId: 91, pointerType: 'touch', clientX: 430, clientY: 50 })
      assert.notEqual(await page.locator('#split-state').textContent(), state)
      assert.deepEqual(errors, [], `${engine}: no uncaught browser errors`)
      console.log(`${engine}: Split/ResizeBox, fixed columns, grouped header/summary, virtual rows, portal rail and live direction switches passed`)
    } finally { await browser.close() }
  }
  await writeFile(join(evidence, 'results.json'), JSON.stringify({ date: '2026-10-29', engines: process.env.DIRECTION_ENGINES ?? 'chromium,firefox,webkit', results }, null, 2) + '\n')
} finally {
  await new Promise(resolve => server ? server.httpServer.close(resolve) : resolve())
  await rm(output, { recursive: true, force: true })
}
