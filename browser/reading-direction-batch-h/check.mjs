import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const fixture = fileURLToPath(new URL('.', import.meta.url))
const workspace = resolve(fixture, '../../..')
const require = createRequire(resolve(workspace, 'cedar-design-web/packages/ui/package.json'))
const { build, preview } = await import(new URL('./dist/node/index.js', `file://${require.resolve('vite')}`).href)
const vue = (await import(require.resolve('@vitejs/plugin-vue'))).default
const jsx = (await import(require.resolve('@vitejs/plugin-vue-jsx'))).default
const { chromium, firefox, webkit } = createRequire(resolve(workspace, 'cedar-design-web/package.json'))('playwright')
const output = await mkdtemp(join(tmpdir(), 'reading-direction-batch-'))
const evidence = process.env.DIRECTION_EVIDENCE_DIR
  ? resolve(process.env.DIRECTION_EVIDENCE_DIR, 'batch-h')
  : resolve(workspace, 'design-ui/audits/evidence/reading-direction-batch-h-2026-10-30')
await mkdir(evidence, { recursive: true })
const config = {
  configFile: false,
  root: fixture,
  logLevel: 'warn',
  plugins: [vue(), jsx()],
  resolve: {
    dedupe: ['vue'],
    alias: {
      vue: require.resolve('vue/dist/vue.runtime.esm-bundler.js'),
      '@cedar-design/use-vue': resolve(workspace, 'cedar-design-web/packages/use/src/index.ts'),
      '@maple-design/use-vue': resolve(workspace, 'maple-design-mobile/packages/use/src/index.ts'),
    },
  },
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
      const page = await browser.newPage({ viewport: { width: 1360, height: 1100 }, hasTouch: true })
      page.setDefaultTimeout(10000)
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(`http://127.0.0.1:${port}`)
      await page.locator('#cGroup-outline button').first().waitFor()
      const nativeButtons = page.locator('#nativeTab button')
      await nativeButtons.first().focus()
      await page.keyboard.press('Tab')
      let tabKey = 'Tab'
      if (!(await nativeButtons.nth(1).evaluate((el) => el === document.activeElement))) {
        await nativeButtons.first().focus()
        await page.keyboard.press('Alt+Tab')
        assert.equal(await nativeButtons.nth(1).evaluate((el) => el === document.activeElement), true)
        tabKey = 'Alt+Tab'
      }
      const state = async () => JSON.parse(await page.locator('#state').textContent())
      const setDir = async (dir) => {
        await page.locator('#scope').evaluate((el, value) => el.setAttribute('dir', value), dir)
        await page.waitForTimeout(450)
      }
      const metrics = (locator) =>
        locator.evaluate((el) => {
          const s = getComputedStyle(el)
          return {
            tl: parseFloat(s.borderTopLeftRadius),
            tr: parseFloat(s.borderTopRightRadius),
            bl: parseFloat(s.borderBottomLeftRadius),
            br: parseFloat(s.borderBottomRightRadius),
            left: parseFloat(s.borderLeftWidth),
            right: parseFloat(s.borderRightWidth),
          }
        })
      for (const direction of ['ltr', 'rtl', 'ltr']) {
        if ((await page.locator('#toggle').textContent()) !== direction) await page.locator('#toggle').click()
        await setDir(direction)
        assert.equal(await page.locator('#local').evaluate((el) => getComputedStyle(el).direction), 'ltr')
        for (const p of ['c', 'm']) {
          console.log('Checking', engine, direction, p)
          const prefix = p === 'c' ? 'c' : 'mp'
          for (const variant of ['default', 'outline', 'text', 'tonal']) {
            const buttons = page.locator(`#${p}Group-${variant} button`)
            const a = await buttons.first().boundingBox(),
              b = await buttons.last().boundingBox()
            assert.ok(direction === 'rtl' ? a.x > b.x : a.x < b.x)
            const first = await metrics(buttons.first()),
              middle = await metrics(buttons.nth(1)),
              last = await metrics(buttons.last())
            assert.ok(direction === 'rtl' ? first.tr > 0 && first.tl === 0 : first.tl > 0 && first.tr === 0)
            assert.ok(direction === 'rtl' ? last.tl > 0 && last.tr === 0 : last.tr > 0 && last.tl === 0)
            assert.equal(middle.tl + middle.tr + middle.bl + middle.br, 0)
            if (variant === 'outline') {
              await buttons.first().focus()
              await page.keyboard.press(tabKey)
              assert.equal(await buttons.nth(1).evaluate((el) => el === document.activeElement), true)
              await page.keyboard.press(tabKey)
              assert.equal(await buttons.last().evaluate((el) => el === document.activeElement), true)
            }
            if (variant === 'outline') assert.equal(direction === 'rtl' ? middle.right : middle.left, 0)
            if (variant === 'text') {
              assert.ok(direction === 'rtl' ? middle.left > 0 : middle.right > 0)
              assert.equal(last.left + last.right, 0)
            }
          }
          for (const id of ['Single', 'SingleVertical']) {
            const m = await metrics(page.locator(`#${p}${id} button`))
            assert.ok(m.tl > 0 && m.tr > 0 && m.bl > 0 && m.br > 0, 'single button retains all corners')
          }
          const vertical = page.locator(`#${p}Vertical button`),
            v0 = await vertical.first().boundingBox(),
            v1 = await vertical.last().boundingBox()
          assert.ok(v0.y < v1.y)
          const icon = page.locator(`#${p}Icon .${prefix}-button--icon`),
            text = page.locator(`#${p}Icon .${prefix}-button__content`)
          const ib = await icon.boundingBox(),
            tb = await text.boundingBox()
          assert.ok(direction === 'rtl' ? ib.x > tb.x : ib.x < tb.x)
          assert.equal(await icon.locator('svg').evaluate((el) => getComputedStyle(el).transform), 'none')
          const row = page.locator(`#${p}Row button`),
            r0 = await row.first().boundingBox(),
            r1 = await row.last().boundingBox()
          assert.ok(direction === 'rtl' ? r0.x > r1.x : r0.x < r1.x)
          const tiles = page.locator(`#${p}Wrap .tile`),
            t0 = await tiles.nth(0).boundingBox(),
            t1 = await tiles.nth(1).boundingBox(),
            t2 = await tiles.nth(2).boundingBox()
          assert.ok(direction === 'rtl' ? t0.x > t1.x : t0.x < t1.x)
          assert.ok(t2.y > t1.y)
          assert.ok(Math.abs(t2.y - t0.y - t0.height - 8) < 1)
          const column = page.locator(`#${p}Column button`),
            c0 = await column.first().boundingBox(),
            c1 = await column.last().boundingBox()
          assert.ok(c1.y > c0.y)
          assert.ok(direction === 'rtl' ? Math.abs(c0.x + c0.width - c1.x - c1.width) < 1 : Math.abs(c0.x - c1.x) < 1)
          const start = page.locator(`#${p}DividerStart .${prefix}-divider`),
            end = page.locator(`#${p}DividerEnd .${prefix}-divider`)
          const sb = await start.locator(`.${prefix}-divider__text`).boundingBox(),
            eb = await end.locator(`.${prefix}-divider__text`).boundingBox()
          assert.ok(direction === 'rtl' ? sb.x > eb.x : sb.x < eb.x)
          assert.deepEqual(
            await start.evaluate((el) => ({
              start: getComputedStyle(el).marginInlineStart,
              end: getComputedStyle(el).marginInlineEnd,
            })),
            { start: '12px', end: '24px' },
          )
          const plain = page.locator(`#${p}DividerPlain .${prefix}-divider`)
          assert.ok(await plain.evaluate((el) => parseFloat(getComputedStyle(el).borderInlineStartWidth) > 0))
          assert.equal(await plain.getAttribute('aria-orientation'), 'vertical')
          const split = page.locator(`#${p}Split button`)
          const primary = split.nth(0),
            trigger = split.nth(1)
          const before = await state()
          await primary.focus()
          await page.keyboard.press('Enter')
          assert.equal((await state()).actions, before.actions + 1)
          await page.keyboard.press('Space')
          assert.equal((await state()).actions, before.actions + 2)
          assert.equal((await state()).opens, before.opens)
          await trigger.focus()
          await page.keyboard.press('ArrowDown')
          const panel = page.locator('#portal [data-menu-panel]:visible').last()
          await panel.waitFor()
          assert.equal(await panel.evaluate((el) => getComputedStyle(el).direction), direction)
          assert.equal(
            await panel
              .locator('[data-menu-item]')
              .nth(1)
              .evaluate((el) => el === document.activeElement),
            true,
          )
          const opened = await state()
          await setDir(direction === 'ltr' ? 'rtl' : 'ltr')
          assert.deepEqual(await state(), opened)
          assert.equal(
            await panel.evaluate((el) => getComputedStyle(el).direction),
            direction === 'ltr' ? 'rtl' : 'ltr',
          )
          await page.keyboard.press('End')
          await page.keyboard.press('Enter')
          assert.equal((await state()).selections.at(-1), 'publish')
          await panel.waitFor({ state: 'hidden' })
          assert.equal(await trigger.evaluate((el) => el === document.activeElement), true)
          await setDir(direction)
          await page.keyboard.press('ArrowUp')
          await panel.waitFor()
          await page.keyboard.press('Escape')
          await panel.waitFor({ state: 'hidden' })
          assert.equal(await trigger.evaluate((el) => el === document.activeElement), true)
        }
        const before = await state()
        await page.locator('#disabled').click()
        for (const p of ['c', 'm']) {
          assert.equal(await page.locator(`#${p}Split button:disabled`).count(), 2)
          assert.equal(await page.locator(`#${p}Group-outline button:disabled`).count(), 3)
        }
        await page.locator('#disabled').click()
        await page.locator('#loading').click()
        for (const p of ['c', 'm'])
          assert.equal(await page.locator(`#${p}Icon button`).getAttribute('aria-busy'), 'true')
        assert.deepEqual(await state(), before)
        await page.locator('#loading').click()
        assert.deepEqual(errors, [])
        results.push({ engine, direction, tabKey, passed: true })
      }
      await page.locator('#toggle').click()
      await page.screenshot({
        path: join(evidence, engine + '-rtl-actions.png'),
        animations: 'disabled',
        fullPage: true,
      })
      await page.setViewportSize({ width: 375, height: 812 })
      await page.addStyleTag({
        content:
          '.platform:first-child{display:none}.platforms{display:block}.platform{width:100%}#local{display:none}',
      })
      for (const direction of ['ltr', 'rtl']) {
        if ((await page.locator('#toggle').textContent()) !== direction) await page.locator('#toggle').click()
        await setDir(direction)
        const trigger = page.locator('#mSplit button').nth(1)
        await trigger.tap()
        const panel = page.locator('#portal [data-menu-panel]:visible').last()
        await panel.waitFor()
        assert.equal(await panel.evaluate((el) => getComputedStyle(el).direction), direction)
        const box = await panel.boundingBox()
        assert.ok(box.x >= -1 && box.x + box.width <= 376)
        await page.keyboard.press('Escape')
        results.push({ engine, direction, viewport: '375x812', passed: true })
      }
      await page.screenshot({
        path: join(evidence, engine + '-mobile-rtl-actions.png'),
        animations: 'disabled',
        fullPage: true,
      })
      assert.deepEqual(errors, [])
    } finally {
      await browser.close()
    }
  }
  await writeFile(join(evidence, 'results.json'), JSON.stringify(results, null, 2))
  console.log(JSON.stringify({ passed: true, results }))
} finally {
  await server?.httpServer.close()
  await rm(output, { recursive: true, force: true })
}
