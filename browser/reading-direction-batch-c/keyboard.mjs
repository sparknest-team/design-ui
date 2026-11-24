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
const evidence = resolve(workspace, 'design-ui/audits/evidence/reading-direction-batch-c-2026-10-29')
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
      await page.selectOption('#mode', 'week')
      const root = page.locator('#scheduler')
      for (const direction of ['ltr', 'rtl']) {
        if ((await page.locator('#toggle').textContent()) !== direction) await page.locator('#toggle').click()
        await page.waitForTimeout(120)
        const first = root.locator('.c-scheduler__time-cell').first()
        await first.focus()
        const previousIcon = root
          .locator('.c-scheduler__navigation')
          .first()
          .locator('button')
          .first()
          .locator('[dir=ltr]')
        assert.equal(await previousIcon.textContent(), direction === 'rtl' ? '›' : '‹')
        assert.equal(await previousIcon.evaluate((el) => getComputedStyle(el).direction), 'ltr')

        const date = await first.getAttribute('data-scheduler-date')
        await page.keyboard.press(direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')
        const next = await page.evaluate(() =>
          document.activeElement?.closest('[data-scheduler-date]')?.getAttribute('data-scheduler-date'),
        )
        assert.equal(
          +new Date(next) - +new Date(date),
          86400000,
          `${engine} ${direction}: week navigation advances one day`,
        )
        results.push({ engine, direction, spatialKeyboard: true })
      }
      assert.deepEqual(errors, [])
      if (engine === 'chromium') {
        await page.selectOption('#mode', 'resource-timeline')
        await root.locator('.c-scheduler__timeline-track').first().waitFor()
        await page.waitForTimeout(150)
        await root.locator('.c-scheduler__main').evaluate((el) => {
          el.scrollLeft = (-el.querySelector('.c-scheduler__timeline-track').clientWidth * 8) / 24
          el.dispatchEvent(new Event('scroll'))
        })
        await page.waitForTimeout(100)
        await page.screenshot({ path: join(evidence, 'rtl-layout.png') })
      }
    } finally {
      await browser.close()
    }
  }
  await writeFile(join(evidence, 'keyboard-results.json'), JSON.stringify({ passed: true, results }, null, 2))
  console.log(JSON.stringify({ passed: true, results }, null, 2))
} finally {
  await new Promise((resolve) => server?.httpServer.close(resolve) ?? resolve())
  await rm(output, { recursive: true, force: true })
}
