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
  ? resolve(process.env.DIRECTION_EVIDENCE_DIR, 'batch-c')
  : resolve(workspace, 'design-ui/audits/evidence/reading-direction-batch-c-2026-10-29')
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
      const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, hasTouch: true })
      page.setDefaultTimeout(10000)
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(`http://127.0.0.1:${port}`)
      const root = page.locator('#scheduler')
      await root.locator('.c-scheduler__timeline-track').first().waitFor()
      const state = async () => JSON.parse(await page.locator('#state').textContent())
      const viewport = () =>
        root
          .locator('.c-scheduler__virtual-rows')
          .count()
          .then((n) => (n ? root.locator('.c-scheduler__virtual-rows') : root.locator('.c-scheduler__main')))
      const offset = async (element) => element.evaluate((el) => Math.abs(el.scrollLeft))
      const scroll = async (value) => {
        const el = await viewport()
        await el.evaluate((el, value) => {
          el.scrollLeft = getComputedStyle(el).direction === 'rtl' ? -value : value
          el.dispatchEvent(new Event('scroll'))
        }, value)
        await page.waitForTimeout(120)
      }
      const event = () => root.locator('.c-scheduler__timeline-event[data-scheduler-event-id=a]')
      const position = async () => {
        const el = await viewport()
        return el.evaluate((el) => {
          const track = el.querySelector('.c-scheduler__timeline-track'),
            gutter = parseFloat(
              getComputedStyle(el.closest('.c-scheduler')).getPropertyValue('--c-scheduler-resource-width'),
            )
          return (Math.abs(el.scrollLeft) + (el.clientWidth - gutter) / 2) / track.clientWidth
        })
      }
      const hourCell = async (hour) => {
        const all = root.locator('[data-scheduler-resource=r0][data-scheduler-axis=horizontal]')
        const index = await all.evaluateAll(
          (els, hour) => els.findIndex((el) => new Date(el.dataset.schedulerDate).getHours() === hour),
          hour,
        )
        return all.nth(index)
      }
      const dragTo = async (handle, target, fraction = 0.25) => {
        const start = await handle.boundingBox(),
          end = await target.boundingBox()
        const rtl = await root.evaluate((el) => getComputedStyle(el).direction === 'rtl')
        await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
        await page.mouse.down()
        await page.mouse.move(end.x + end.width * (rtl ? 1 - fraction : fraction), end.y + end.height / 2, { steps: 8 })
        await page.mouse.up()
        await page.waitForTimeout(150)
      }
      for (const direction of ['ltr', 'rtl', 'ltr']) {
        if ((await page.locator('#toggle').textContent()) !== direction) await page.locator('#toggle').click()
        await page.waitForTimeout(120)
        assert.equal(await root.evaluate((el) => getComputedStyle(el).direction), direction)
        const previousIcon = root
          .locator('.c-scheduler__navigation')
          .first()
          .locator('button')
          .first()
          .locator('[dir=ltr]')
        assert.equal(await previousIcon.textContent(), direction === 'rtl' ? '›' : '‹')
        assert.equal(await previousIcon.evaluate((el) => getComputedStyle(el).direction), 'ltr')

        assert.equal(await page.locator('#nested').evaluate((el) => getComputedStyle(el).direction), 'ltr')
        for (const virtual of [false, true]) {
          if (Boolean(await root.locator('.c-scheduler__virtual-rows').count()) !== virtual)
            await page.locator('#virtual').click()
          await page.waitForTimeout(160)
          const track = root.locator('.c-scheduler__timeline-track').first()
          const width = await track.evaluate((el) => el.clientWidth)
          await scroll((width * 8) / 24)
          const a = await event().boundingBox(),
            label = await root.locator('.c-scheduler__resource-label').first().boundingBox(),
            bounds = await (await viewport()).boundingBox()
          assert.ok(
            direction === 'rtl' ? label.x + label.width >= bounds.x + bounds.width - 3 : label.x <= bounds.x + 3,
            `${engine}: resource sticky reading start`,
          )
          const b = await root.locator('.c-scheduler__timeline-event[data-scheduler-event-id=b]').boundingBox()
          assert.ok(direction === 'rtl' ? a.x > b.x : a.x < b.x, `${engine}: chronological event geometry`)
          await page.waitForTimeout(100)
          const d = await root.locator('.c-scheduler__dependency-layer path').last().getAttribute('d')
          assert.ok(d && /^M /.test(d), `${engine}: dependency measured`)
          const edges = await root.evaluate((el) => {
            const svg = el.querySelector('.c-scheduler__dependency-layer'),
              path = svg.querySelector('path[marker-end]')
            const a = el
              .querySelector('.c-scheduler__timeline-event[data-scheduler-event-id=a]')
              .getBoundingClientRect()
            const b = el
              .querySelector('.c-scheduler__timeline-event[data-scheduler-event-id=b]')
              .getBoundingClientRect()
            const coordinates = path
              .getAttribute('d')
              .match(/-?[\d.]+/g)
              .map(Number)
            const point = svg.createSVGPoint()
            point.x = coordinates[0]
            point.y = coordinates[1]
            const from = point.matrixTransform(svg.getScreenCTM())
            point.x = coordinates.at(-1)
            const to = point.matrixTransform(svg.getScreenCTM())
            const rtl = getComputedStyle(el).direction === 'rtl'
            return { from: from.x, to: to.x, expectedFrom: rtl ? a.left : a.right, expectedTo: rtl ? b.right : b.left }
          })
          assert.ok(
            Math.abs(edges.from - edges.expectedFrom) < 3 && Math.abs(edges.to - edges.expectedTo) < 3,
            `${engine} ${direction}: dependency physical endpoints ${JSON.stringify(edges)}`,
          )
          const oldPosition = await position()
          await page.locator('#zoom').click()
          await page.waitForTimeout(150)
          assert.ok(
            Math.abs((await position()) - oldPosition) < 0.005,
            `${engine} ${direction} virtual=${virtual}: zoom date anchor ${oldPosition} -> ${await position()}, offset ${await offset(await viewport())}`,
          )
          await page.locator('#zoom').click()
          await page.waitForTimeout(100)
          await scroll((width * 8) / 24)
          const before = await offset(await viewport())
          await page.locator('#toggle').click()
          await page.waitForTimeout(160)
          assert.ok(
            Math.abs((await offset(await viewport())) - before) < 2,
            `${engine}: direction preserves timeline offset`,
          )
          await page.locator('#toggle').click()
          await page.waitForTimeout(160)
          if (virtual)
            assert.ok(
              Math.abs(
                (await offset(root.locator('.c-scheduler__virtual-heading'))) - (await offset(await viewport())),
              ) < 2,
              `${engine}: virtual heading sync`,
            )
          await dragTo(event().locator('.c-scheduler__event-button'), await hourCell(10))
          const moved = (await state()).events[0]
          assert.equal(new Date(moved.start).getHours(), 10)
          assert.equal(new Date(moved.start).getMinutes(), 15)
          assert.equal(+new Date(moved.end) - +new Date(moved.start), 3600000)
          await page.locator('#reset').click()
          await page.waitForTimeout(120)
          await dragTo(
            event().locator('.c-scheduler__resize:not(.c-scheduler__resize--start)'),
            await hourCell(10),
            0.5,
          )
          const resized = (await state()).events[0]
          assert.equal(new Date(resized.start).getHours(), 9)
          assert.equal(new Date(resized.end).getHours(), 10)
          assert.equal(new Date(resized.end).getMinutes(), 45)
          await page.locator('#reset').click()
          await page.waitForTimeout(100)
          await dragTo(event().locator('.c-scheduler__resize--start'), await hourCell(9), 0.5)
          const resizedStart = (await state()).events[0]
          assert.equal(new Date(resizedStart.start).getMinutes(), 30)
          assert.equal(new Date(resizedStart.end).getHours(), 10)
          await page.locator('#reset').click()
          await page.waitForTimeout(100)
          const start = await event().boundingBox()
          await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
          await page.mouse.down()
          await page.mouse.move(start.x + start.width / 2 + 20, start.y + start.height / 2, { steps: 3 })
          await page.locator('#toggle').evaluate((el) => el.click())
          await page.waitForTimeout(100)
          await page.mouse.up()
          assert.equal((await state()).changes, 0)
          assert.equal(await page.locator('.c-scheduler__drag-ghost').count(), 0)
          await page.locator('#toggle').click()
        }
        for (const mode of ['month', 'week', 'day', 'resource-day', 'agenda']) {
          await page.selectOption('#mode', mode)
          await page.waitForTimeout(120)
          assert.ok((await root.textContent()).includes('Alpha'), `${engine}: ${mode} events survive`)
          if (mode === 'week') {
            const first = root.locator('.c-scheduler__time-cell').first()
            await first.focus()
            const date = await first.getAttribute('data-scheduler-date')
            await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')
            const next = await page.evaluate(() =>
              document.activeElement?.closest('[data-scheduler-date]')?.getAttribute('data-scheduler-date'),
            )
            assert.equal(
              +new Date(next) - +new Date(date),
              86400000,
              `${engine}: spatial keyboard follows mirrored week columns`,
            )
          }
          if (mode === 'day') {
            const cells = root.locator('.c-scheduler__time-cell')
            const index = await cells.evaluateAll((els) =>
              els.findIndex((el) => {
                const date = new Date(el.dataset.schedulerDate)
                return date.getHours() === 10 && date.getMinutes() === 0
              }),
            )
            const target = cells.nth(index)
            await target.scrollIntoViewIfNeeded()
            const card = root
              .locator('.c-scheduler__positioned-event')
              .filter({ hasText: 'Alpha' })
              .locator('.c-scheduler__event-button')
            const a = await card.boundingBox(),
              b = await target.boundingBox()
            await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
            await page.mouse.down()
            await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 })
            await page.mouse.up()
            await page.waitForTimeout(150)
            assert.equal(
              new Date((await state()).events[0].start).getHours(),
              10,
              `${engine}: vertical time drag in ${direction}`,
            )
            await page.locator('#reset').click()
            await page.waitForTimeout(100)
          }
          if (mode === 'week' || mode === 'resource-day') {
            const cells = root.locator('.c-scheduler__column-heading')
            const first = await cells.first().boundingBox(),
              last = await cells.last().boundingBox()
            assert.ok(
              direction === 'rtl' ? first.x > last.x : first.x < last.x,
              `${engine}: ${mode} columns follow direction`,
            )
          }
        }
        await page.selectOption('#mode', 'resource-timeline')
        await page.selectOption('#scale', 'day')
        await page.waitForTimeout(120)
        assert.equal(await root.locator('.c-scheduler__resize').count(), 0)
        await page.selectOption('#scale', 'hour')
        await page.waitForTimeout(120)
        await page.waitForFunction(() => {
          const root = document.getElementById('scheduler')
          const viewport = root.querySelector('.c-scheduler__virtual-rows') ?? root.querySelector('.c-scheduler__main')
          const track = viewport.querySelector('.c-scheduler__timeline-track')
          return track && Math.abs(Math.abs(viewport.scrollLeft) - (track.clientWidth * 8) / 24) < 2
        })
        console.log(`${engine} ${direction}: all interaction contracts passed`)
        results.push({
          engine,
          direction,
          views: 6,
          virtual: [false, true],
          drag: true,
          resize: ['start', 'end'],
          zoom: true,
          switchCancellation: true,
          spatialKeyboard: true,
          scalePosition: true,
          verticalDrag: true,
        })
      }
      assert.deepEqual(errors, [])
      if (engine === 'chromium') {
        await page.locator('#toggle').click()
        await page.waitForTimeout(120)
        await scroll(
          await root
            .locator('.c-scheduler__timeline-track')
            .first()
            .evaluate((el) => (el.clientWidth * 8) / 24),
        )
        await page.screenshot({ path: join(evidence, 'rtl-layout.png') })
      }
    } finally {
      await browser.close()
    }
  }
  await writeFile(join(evidence, 'results.json'), JSON.stringify({ passed: true, results }, null, 2))
  console.log(JSON.stringify({ passed: true, results }, null, 2))
} finally {
  await new Promise((resolve) => server?.httpServer.close(resolve) ?? resolve())
  await rm(output, { recursive: true, force: true })
}
