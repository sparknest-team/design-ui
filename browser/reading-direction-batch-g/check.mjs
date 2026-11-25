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
  ? resolve(process.env.DIRECTION_EVIDENCE_DIR, 'batch-g')
  : resolve(workspace, 'design-ui/audits/evidence/reading-direction-batch-g-2026-10-30')
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
      await page.locator('#cDate [data-temporal-cell]').first().waitFor()
      const state = async () => JSON.parse(await page.locator('#state').textContent())
      const cells = (p) =>
        page.locator(p === 'c' ? '#cDate [data-temporal-cell]' : '#mDate button[mp-day-picker-cover]')
      for (const direction of ['ltr', 'rtl', 'ltr']) {
        if ((await page.locator('#toggle').textContent()) !== direction) await page.locator('#toggle').click()
        await page.locator('#reset').click()
        await page.waitForTimeout(100)
        assert.equal(await page.locator('#local').evaluate((el) => getComputedStyle(el).direction), 'ltr')
        for (const p of ['c', 'm']) {
          const prefix = p === 'c' ? 'c' : 'mp'
          const grid = cells(p),
            a = grid.nth(10),
            b = grid.nth(11)
          const boxA = await a.boundingBox(),
            boxB = await b.boundingBox()
          assert.ok(direction === 'rtl' ? boxA.x > boxB.x : boxA.x < boxB.x, 'date grid follows direction')
          await a.focus()
          await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')
          assert.equal(await b.evaluate((el) => el === document.activeElement), true)
          await page.keyboard.press('ArrowDown')
          assert.equal(await grid.nth(18).evaluate((el) => el === document.activeElement), true)
          assert.equal((await state()).changes, 0)
          const header = page.locator(p === 'c' ? '#cDate .c-picker-header' : '#mDate .mp-date-picker-header').first()
          const icon = header.locator('button svg').first()
          assert.equal(await icon.evaluate((el) => getComputedStyle(el).transform === 'none'), direction === 'ltr')
          for (const side of ['left', 'right']) {
            if ((await page.locator('#side').textContent()) !== side) await page.locator('#side').click()
            const shortcut = page.locator(`#${p}Date .${prefix}-date-shortcuts`),
              main = page.locator(`#${p}Date .${prefix}-date-panel__main`)
            const x = await shortcut.boundingBox(),
              y = await main.boundingBox()
            assert.ok(side === 'left' ? x.x < y.x : x.x > y.x, side + ' shortcut physical position')
            assert.equal(await shortcut.evaluate((el) => getComputedStyle(el).direction), direction)
          }
          const columns = page.locator(`#${p}Time [role=listbox]`)
          assert.equal(await columns.count(), 2)
          const x = await columns.nth(0).boundingBox(),
            y = await columns.nth(1).boundingBox()
          assert.ok(direction === 'rtl' ? x.x > y.x : x.x < y.x)
          const timeFocus = async (i) =>
            p === 'c' ? columns.nth(i).locator('[aria-selected=true]').focus() : columns.nth(i).focus()
          await timeFocus(0)
          await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')
          assert.equal(await columns.nth(1).evaluate((el) => el.contains(document.activeElement)), true)
          const snapshot = await state()
          await page.locator('#toggle').click()
          await page.waitForTimeout(80)
          assert.deepEqual(await state(), snapshot)
          await timeFocus(1)
          await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')
          assert.equal(await columns.nth(0).evaluate((el) => el.contains(document.activeElement)), true)
          await page.locator('#toggle').click()
          const dateRange = page.locator(
            p === 'c' ? '#cRange [data-temporal-cell]' : '#mRange button[mp-day-picker-cover]',
          )
          assert.ok((await dateRange.count()) >= 28, 'public DateRangePicker renders range cells')
          const start = page
            .locator(
              p === 'c' ? '#cRange .c-picker-cell-range-start .c-picker-date' : '#mRibbon .mp-day-picker__range--start',
            )
            .first()
          const end = page
            .locator(
              p === 'c' ? '#cRange .c-picker-cell-range-end .c-picker-date' : '#mRibbon .mp-day-picker__range--end',
            )
            .first()
          await start.waitFor()
          await end.waitFor()
          if (p === 'c') {
            assert.ok((await start.evaluate((el) => parseFloat(getComputedStyle(el).borderStartStartRadius))) > 0)
            assert.ok(
              await end.evaluate((el) => {
                const cell = el.closest('[data-temporal-cell]')
                cell.classList.add('c-picker-cell-hover-range-start')
                const css = getComputedStyle(el)
                const valid = parseFloat(css.borderStartStartRadius) > 0 && parseFloat(css.borderStartEndRadius) === 0
                cell.classList.remove('c-picker-cell-hover-range-start')
                return valid
              }),
              'range preview resets the opposite logical corners',
            )
          } else
            assert.ok(
              await start.evaluate(
                (el) =>
                  Math.abs(
                    parseFloat(getComputedStyle(el, '::before').insetInlineStart) -
                      el.getBoundingClientRect().width / 2,
                  ) < 1,
              ),
            )
          const ranges = page.locator(`#${p}Times [role=listbox]`)
          assert.equal(await ranges.count(), 4)
          const r0 = await ranges.nth(0).boundingBox(),
            r2 = await ranges.nth(2).boundingBox()
          assert.ok(direction === 'rtl' ? r0.x > r2.x : r0.x < r2.x, 'range endpoints follow reading order')
          // Date header previous stays chronological after visual mirroring.
          const oldTitle = await header.textContent()
          await header
            .locator('button')
            .nth(p === 'c' ? 1 : 0)
            .click()
          await page.waitForTimeout(450)
          assert.equal(await header.textContent(), oldTitle, 'controlled viewport is not silently committed')
          assert.equal((await state()).changes, 0)
          // Field popovers inherit source direction despite the physical LTR portal.
          for (const family of ['Field', 'DateRangeField', 'TimeField', 'RangeField']) {
            const input = page.locator(`#${p}${family} input`).first()
            await input.click()
            await page.keyboard.press('Enter')
            const popover = page
              .locator(
                `#portal .${prefix}-field-popover:visible, #portal .${prefix}-date-field-popover:visible, #portal .${prefix}-time-field-popover:visible, #portal .${prefix}-date-range-field-popover:visible, #portal .${prefix}-time-range-field-popover:visible`,
              )
              .last()
            await popover.waitFor()
            assert.equal(await popover.evaluate((el) => getComputedStyle(el).direction), direction)
            const value = await state()
            await page.locator('#toggle').click()
            await page.waitForTimeout(80)
            assert.deepEqual(await state(), value)
            await page.keyboard.press('Escape')
            await page.locator('#toggle').click()
          }
          const beforeSelect = await state()
          const day16 = grid.filter({ hasText: /^16$/ }).first()
          await day16.focus()
          await page.keyboard.press('Enter')
          assert.equal((await state()).values[p + 'Date'], '2025-01-16')
          assert.equal((await state()).changes, beforeSelect.changes + 1)
          // Single-time selection skips a disabled hour and commits only with confirmation.
          if (p === 'c') {
            await columns.nth(0).locator('[aria-selected=true]').focus()
            await page.keyboard.press('ArrowDown')
            assert.equal(await columns.nth(0).locator(':focus').textContent(), '11')
            await page.keyboard.press('Enter')
          } else {
            await columns.nth(0).focus()
            await page.keyboard.press('ArrowDown')
          }
          assert.equal((await state()).values[p + 'Time'], '09:30')
          const confirm = page
            .locator(`#${p}Time button`)
            .filter({ hasText: /确定|确认/ })
            .last()
          await confirm.click()
          assert.equal((await state()).values[p + 'Time'], '11:30')
          // Lateral keys also work across the start/end split of TimeRange.
          const rangeFocus = p === 'c' ? ranges.nth(1).locator('[aria-selected=true]') : ranges.nth(1)
          await rangeFocus.focus()
          await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')
          assert.equal(await ranges.nth(2).evaluate((el) => el.contains(document.activeElement)), true)
          await page.locator('#reset').click()
          await page.waitForTimeout(100)
        }
        for (const id of ['mDateWheel', 'mRangeWheel']) {
          const wheels = page.locator(`#${id} [role=listbox]`)
          assert.ok((await wheels.count()) >= 2)
          await wheels.nth(0).focus()
          await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')
          assert.equal(await wheels.nth(1).evaluate((el) => el === document.activeElement), true)
        }
        assert.deepEqual(errors, [])
        results.push({ engine, direction, passed: true })
      }
      await page.locator('#toggle').click()
      await page.screenshot({
        path: join(evidence, engine + '-rtl-temporal.png'),
        animations: 'disabled',
        fullPage: true,
      })
      await page.setViewportSize({ width: 375, height: 812 })
      await page.addStyleTag({
        content:
          '.platform:first-child{display:none}.platforms{display:block}.platform{width:100%}#local{display:none}#scope{width:auto}',
      })
      for (const direction of ['ltr', 'rtl']) {
        if ((await page.locator('#toggle').textContent()) !== direction) await page.locator('#toggle').click()
        for (const family of ['Field', 'DateRangeField', 'TimeField', 'RangeField']) {
          await page.locator(`#m${family} input`).first().click()
          await page.keyboard.press('Enter')
          const popup = page
            .locator(
              '#portal .mp-date-field-popover:visible,#portal .mp-date-range-field-popover:visible,#portal .mp-time-field-popover:visible,#portal .mp-time-range-field-popover:visible',
            )
            .last()
          await popup.waitFor()
          assert.equal(await popup.evaluate((el) => getComputedStyle(el).direction), direction)
          const rect = await popup.boundingBox()
          assert.ok(rect.x >= -1 && rect.x + rect.width <= 376, 'mobile popup fits viewport')
          await page.keyboard.press('Escape')
        }
        results.push({ engine, direction, viewport: '375x812', passed: true })
      }
      await page.screenshot({
        path: join(evidence, engine + '-mobile-rtl-temporal.png'),
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
