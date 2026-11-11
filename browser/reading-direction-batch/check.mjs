import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
const fixture = fileURLToPath(new URL('.', import.meta.url))
const workspace = resolve(fixture, '../../..')
const require = createRequire(resolve(workspace, 'cedar-design-web/packages/ui/package.json'))
const { build, preview } = await import(new URL('./dist/node/index.js', `file://${require.resolve('vite')}`).href)
const vue = (await import(require.resolve('@vitejs/plugin-vue'))).default
const jsx = (await import(require.resolve('@vitejs/plugin-vue-jsx'))).default
const { chromium, firefox, webkit } = createRequire(resolve(workspace, 'cedar-design-web/package.json'))('playwright')
const output = await mkdtemp(join(tmpdir(), 'reading-direction-batch-'))
const evidence = process.env.DIRECTION_EVIDENCE_DIR ? resolve(process.env.DIRECTION_EVIDENCE_DIR, 'batch-a') : resolve(workspace, 'design-ui/audits/evidence/reading-direction-batch-2026-10-29')
await mkdir(evidence, { recursive: true })
const config = {
  configFile: false, root: fixture, logLevel: 'warn', plugins: [vue(), jsx()],
  resolve: { dedupe: ['vue'], alias: { vue: require.resolve('vue/dist/vue.runtime.esm-bundler.js'), '@cedar-design/use-vue': resolve(workspace, 'cedar-design-web/packages/use/src/index.ts'), '@maple-design/use-vue': resolve(workspace, 'maple-design-mobile/packages/use/src/index.ts') } },
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
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, hasTouch: true })
      const errors = []; page.on('pageerror', error => errors.push(error.message))
      page.setDefaultTimeout(10000)
      await page.goto(`http://127.0.0.1:${port}`); await page.locator('#steps [data-step-index]').first().waitFor()
      const x = async selector => (await page.locator(selector).first().boundingBox()).x
      const key = async (selector, value) => { await page.locator(selector).first().focus(); await page.keyboard.press(value) }
      const active = () => page.evaluate(() => document.activeElement?.getAttribute('data-step-index') ?? document.activeElement?.getAttribute('data-nav-key') ?? document.activeElement?.getAttribute('id'))
      for (const direction of ['ltr', 'rtl', 'ltr']) {
        if (await page.locator('#scope').getAttribute('dir') !== direction) await page.locator('#toggle').click()
        await page.waitForTimeout(60)
        const rtl = direction === 'rtl'
        for (const id of ['steps', 'dot', 'arrow', 'navigation', 'maple-steps']) {
          const first = await x(`#${id} [data-step-index="1"]`), last = await x(`#${id} [data-step-index="3"]`)
          assert.equal(first > last, rtl, `${engine}: ${id} visual order ${direction}`)
          await key(`#${id} [data-step-index="1"]`, rtl ? 'ArrowLeft' : 'ArrowRight')
          assert.equal(await active(), '3', `${engine}: ${id} skips disabled`)
        }
        await key('#vertical [data-step-index="1"]', 'ArrowDown'); assert.equal(await active(), '3')
        await key('#local-steps [data-step-index="1"]', 'ArrowRight'); assert.equal(await active(), '3')
        const timeline = page.locator('#timeline .c-timeline-item')
        assert.equal((await timeline.nth(0).boundingBox()).x > (await timeline.nth(2).boundingBox()).x, rtl)
        const line = await timeline.nth(0).locator('.c-timeline-item-dot-line').boundingBox()
        const dot = await timeline.nth(0).locator('.c-timeline-item-dot').boundingBox()
        assert.equal(line.x < dot.x, rtl, `${engine}: horizontal timeline connector`)
        await page.locator('#reverse').click()
        assert.equal((await timeline.nth(0).boundingBox()).x > (await timeline.nth(2).boundingBox()).x, !rtl)
        assert.deepEqual(await timeline.locator('.c-timeline-item-content').allTextContents(), ['Event 1', 'Event 2', 'Event 3'])
        await page.locator('#reverse').click()
        for (const id of ['timeline-left', 'timeline-right']) {
          const row = page.locator(`#${id} .c-timeline-item`).first()
          const content = await row.locator('.c-timeline-item-content-wrapper').boundingBox(), dot = await row.locator('.c-timeline-item-dot-wrapper').boundingBox()
          assert.equal(dot.x < content.x, id === 'timeline-left', 'explicit physical timeline side')
        }
        for (const id of ['timeline-alternate', 'timeline-alternate-relative']) {
        const alternateBounds = await page.locator(`#${id}`).boundingBox()
        for (const content of await page.locator(`#${id} .c-timeline-item-content`).all()) {
          const bounds = await content.boundingBox()
          assert.ok(bounds.x >= alternateBounds.x && bounds.x + bounds.width <= alternateBounds.x + alternateBounds.width + 1, `${engine} ${direction}: alternate timeline content stays inside its container: ${JSON.stringify({bounds,alternateBounds})}`)
        }
        }
        await key('#menu [data-nav-key="parent"]', rtl ? 'ArrowLeft' : 'ArrowRight'); assert.equal(await active(), 'second')
        await key('#vertical-menu [data-nav-key="parent"]', rtl ? 'ArrowLeft' : 'ArrowRight')
        await page.waitForTimeout(40); assert.equal(await active(), 'child')
        await page.keyboard.press(rtl ? 'ArrowRight' : 'ArrowLeft')
        await page.waitForTimeout(40); assert.equal(await active(), 'parent')
        for (const id of ['tree', 'virtual-tree']) {
          const tree = page.locator(`#${id} [role="tree"]`); await tree.focus()
          await page.keyboard.press('Home'); await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight')
          await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight')
          assert.equal(await page.evaluate(id => document.getElementById(id)?.getAttribute('data-key'), await tree.getAttribute('aria-activedescendant')), 'child')
          await page.keyboard.press(rtl ? 'ArrowRight' : 'ArrowLeft'); await page.keyboard.press(rtl ? 'ArrowRight' : 'ArrowLeft')
          assert.equal(await tree.locator('[data-key="parent"]').getAttribute('aria-expanded'), 'false')
        }
        assert.equal(await x('#transfer .c-transfer-view-source') > await x('#transfer .c-transfer-view-target'), rtl)
        const source = page.locator('#transfer .c-transfer-view-source')
        if (!await source.locator('input[value="b"]').isChecked()) await source.locator('.c-checkbox').filter({ has: page.locator('input[value="b"]') }).click()
        await source.locator('input[type="checkbox"]').nth(1).focus()
        await page.keyboard.press('Space')
        assert.equal(await page.locator('#transfer .c-transfer-view-target .c-transfer-list-item').count(), 2)
        await page.locator('#transfer .c-transfer-list-item-remove-btn').filter({ has: page.locator('svg') }).first().click()
        await source.locator('input[value="a"]').focus(); await page.keyboard.press('Space')
        assert.equal(await page.locator('#transfer .c-transfer-view-target .c-transfer-list-item').count(), 0)
        const stateBefore = await page.locator('#state').textContent()
        await page.locator('#toggle').click(); await page.waitForTimeout(50); await page.locator('#toggle').click(); await page.waitForTimeout(50)
        assert.equal(await page.locator('#state').textContent(), stateBefore)
        await key('#collapsed-menu [data-nav-key="parent"]', rtl ? 'ArrowLeft' : 'ArrowRight')
        const popup = page.locator('.c-nav-menu__popup[data-nav-panel]'); await popup.waitFor()
        assert.equal(await popup.getAttribute('dir'), direction)
        const placement = await page.locator('[trigger-placement]').getAttribute('trigger-placement')
        assert.ok(placement.startsWith(rtl ? 'left' : 'right'), `${engine}: submenu opens toward inline end: ${placement}`)
        await page.keyboard.press('Escape'); await popup.waitFor({ state: 'hidden' })
        if (engine === 'chromium' && direction === 'rtl') {
          await key('#tree [role="tree"]', 'Home'); await page.keyboard.press('ArrowLeft')
          await page.locator('#scope').screenshot({ path: join(evidence, 'cedar-rtl.png') })
          await page.keyboard.press('ArrowRight')
        }
        results.push({ engine, direction, passed: true })
      }
      // Native click/touch and keyboard activation change progress; direction switches themselves never do.
      await page.locator('#steps [data-step-index="3"]').click(); assert.equal(await page.locator('#state').textContent(), '3:1')
      await key('#steps [data-step-index="1"]', 'Space'); assert.equal(await page.locator('#state').textContent(), '1:2')
      await page.locator('#steps [data-step-index="3"]').tap(); assert.equal(await page.locator('#state').textContent(), '3:3')
      await page.setViewportSize({ width: 390, height: 844 })
      await page.locator('#maple-menu').evaluate(el => el.scrollIntoView({ block: 'start' }))
      await page.locator('#maple-menu [data-nav-item]').first().tap()
      const mobilePopup = page.locator('.mp-nav-menu__popup'); await mobilePopup.waitFor()
      assert.equal(await mobilePopup.evaluate(el => getComputedStyle(el).direction), 'ltr')
      await page.evaluate(() => { document.querySelector('#scope').dir = 'rtl' }); await page.waitForTimeout(70)
      assert.equal(await mobilePopup.evaluate(el => getComputedStyle(el).direction), 'rtl')
      assert.deepEqual(errors, [], `${engine}: no uncaught browser errors`)
      await page.waitForTimeout(250)
      if (engine === 'chromium') await page.screenshot({ path: join(evidence, 'maple-rtl.png') })
      await mobilePopup.locator('[data-nav-option]').first().tap()
      await mobilePopup.waitFor({ state: 'hidden' })
      assert.ok((await page.locator('#maple-menu [data-nav-item]').first().textContent()).includes('Alpha'))
      console.log(`${engine}: LTR / RTL / switch-back, nested scopes, keyboard, clicks, portals and geometry passed`)
    } finally { await browser.close() }
  }
  await writeFile(join(evidence, process.env.DIRECTION_ENGINES ? `results-${process.env.DIRECTION_ENGINES.replaceAll(',', '-')}.json` : 'results.json'), JSON.stringify({ date: '2026-10-29', engines: process.env.DIRECTION_ENGINES ?? 'chromium,firefox,webkit', fixture: 'production source fixture', results }, null, 2) + '\n')
} finally {
  await new Promise(resolve => server ? server.httpServer.close(resolve) : resolve())
  await rm(output, { recursive: true, force: true })
}
