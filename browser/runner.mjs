import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { extname, resolve, sep } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { componentPages, demoIndex, mobileSection, mobileComponent, guidePages, sourceFingerprint } from './inventory.mjs'
import { contractFor } from './contracts.mjs'
import { exercise } from './actions.mjs'

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' }
const normalize = (source) => source.replace(/\r\n/g, '\n').trimEnd()
const dark = (color) => {
  const values = color.match(/[\d.]+/g)?.map(Number)
  assert.ok(values?.length >= 3 && (values.length < 4 || values[3] === 1), `surface must be opaque: ${color}`)
  return values.slice(0, 3).reduce((a, b) => a + b, 0) < 384
}

async function chooseTheme(page, library, surface, theme) {
  const label = theme === 'darkTheme' ? '默认暗色' : '默认亮色'
  if (library === 'cedar') {
    await page.getByRole('button', { name: '切换主题', exact: true }).click()
    await page.getByRole('menuitemradio', { name: label, exact: true }).click()
    await page.waitForFunction((value) => document.documentElement.dataset.cedarDocsTheme === value, theme)
  } else if (surface === 'mobile') {
    await page.locator('.theme-button').click()
    await page.locator('.mobile-theme-cell').filter({ hasText: label }).click()
    await page.waitForFunction((value) => localStorage.getItem('MAPLE_V3_THEME_DEMO') === value, theme)
  } else {
    const menu = page.locator('.maple-site-header__theme')
    await menu.hover()
    await menu.locator('.mp-cell').filter({ hasText: label }).click()
    await page.mouse.move(1, 1)
    await page.waitForFunction((value) => localStorage.getItem('MAPLE_V3_THEME') === value, theme)
  }
  await page.evaluate(() => Promise.all(document.getAnimations().filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity).map((animation) => animation.finished.catch(() => {}))))
  if (library === 'maple' && surface === 'mobile') {
    await page.waitForFunction((wantDark) => {
      const style = getComputedStyle(document.body)
      const sample = document.createElement('div')
      sample.style.backgroundColor = style.getPropertyValue('--site-config-color-mobile-body')
      sample.style.display = 'none'
      document.body.appendChild(sample)
      const expected = getComputedStyle(sample).backgroundColor
      sample.remove()
      const rgb = expected.match(/[\d.]+/g)?.map(Number)
      return rgb?.length === 3 && (rgb.reduce((sum, value) => sum + value, 0) < 384) === wantDark && style.backgroundColor === expected
    }, theme === 'darkTheme')
  }
  assert.equal(dark(await page.locator('body').evaluate((element) => getComputedStyle(element).backgroundColor)), theme === 'darkTheme', 'real page background follows the selected theme')
}

async function checkSource(page, library, index, expected) {
  const preview = page.locator(library === 'cedar' ? '.vmi-previewer' : '.loca-doc-preview').nth(index)
  const source = preview.locator(library === 'cedar' ? '.vmi-previewer-sources pre' : '.loca-doc-preview__sources pre').first()
  if (!await source.isVisible()) {
    await (library === 'cedar' ? preview.locator('[title="展开或收起源码"]') : preview.getByRole('button', { name: '展开源码', exact: true })).click()
  }
  await source.waitFor({ state: 'visible' })
  assert.equal(normalize(await source.textContent()), normalize(expected.source), `expanded source matches ${expected.file} exactly`)
  const colors = await source.evaluate((element) => [...new Set([...element.querySelectorAll('span')].map((span) => getComputedStyle(span).color))])
  assert.ok(library === 'cedar' ? colors.length >= 2 : colors.length >= 1 && await source.locator('span[class*="hljs-"]').count() > 0, 'actual source retains highlighted syntax tokens (markup-only demos may use one token color)')
  // Source expansion/collapse itself must work on every component page.
  await (library === 'cedar' ? preview.locator('[title="展开或收起源码"]') : preview.getByRole('button', { name: '收起源码', exact: true })).click()
  await source.waitFor({ state: 'hidden' })
}

export function defineProductionComponentTests({ root, library }) {
  const pages = componentPages(root, library)
  const guides = guidePages(root, library)
  const inputs = sourceFingerprint(root, library)
  const { chromium, devices } = createRequire(resolve(root, 'package.json'))('playwright')
  // A new comprehensive suite gets its own budget; the original theme gates and
  // their timeouts are unchanged. Individual component cases stay bounded.
  describe(`${library}: every production component page, source and behavior`, { timeout: 1_800_000, concurrency: 2 }, () => {
    let directory, server, browser, origin, buildIndexHash
    const results = []
    const evidence = resolve(process.env.DOCS_BROWSER_EVIDENCE_DIR ?? resolve(root, 'artifacts/docs-components'), library)
    before(async () => {
      const output = resolve(root, `packages/${library}-ui/${library === 'cedar' ? 'dist' : 'site'}`)
      await readFile(resolve(output, 'index.html')).catch(() => { throw new Error('Build production docs first: pnpm build:doc') })
      directory = await mkdtemp(resolve(tmpdir(), `${library}-components-browser-`))
      await cp(output, directory, { recursive: true })
      buildIndexHash = createHash('sha256').update(await readFile(resolve(directory, 'index.html'))).digest('hex')
      server = createServer(async (request, response) => {
        try {
          const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
          const file = resolve(directory, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`)
          if (!file.startsWith(`${directory}${sep}`)) { response.writeHead(403).end(); return }
          const body = await readFile(file)
          response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
          response.end(body)
        } catch { if (!response.headersSent) response.writeHead(404); response.end() }
      })
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
      origin = `http://127.0.0.1:${server.address().port}`
      browser = await chromium.launch()
    }, { timeout: 120_000 })
    after(async () => {
      try {
        await mkdir(evidence, { recursive: true })
        const current = componentPages(root, library)
        const sourcesStable = sourceFingerprint(root, library) === inputs && JSON.stringify(current.map((item) => item.demos)) === JSON.stringify(pages.map((item) => item.demos))
        await writeFile(resolve(evidence, 'coverage.json'), JSON.stringify({
          library, components: pages.length, sourcesStable, sourceFingerprint: inputs, buildIndexHash, node: process.version,
          expectedComponentCases: pages.length * (library === 'cedar' ? 2 : 4),
          expectedGuideCases: guides.length * 2,
          completedComponentCases: results.filter((result) => result.kind !== 'guide').length,
          results,
        }, null, 2))
        assert.ok(sourcesStable, 'authored demo sources changed during acceptance; rebuild and rerun after parallel changes stabilize')
      } finally {
        await browser?.close()
        if (server?.listening) { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)) }
        if (directory) await rm(directory, { recursive: true, force: true })
      }
    })

    for (const surface of library === 'cedar' ? ['documentation'] : ['documentation', 'mobile']) {
      for (const theme of ['lightTheme', 'darkTheme']) {
        for (const item of pages) {
          const contract = contractFor(library, item.component)
          const index = demoIndex(item, contract.demo)
          it(`${surface} ${theme} ${item.component}: ${contract.kind}, exact source`, { timeout: 30_000 }, async (t) => {
            const context = await browser.newContext({ ...(surface === 'mobile' ? devices['iPhone 13'] : {}), viewport: { width: surface === 'mobile' ? 375 : 1280, height: 900 }, colorScheme: 'light', hasTouch: surface === 'mobile' })
            let page
            const failures = []
            try {
              await context.route('https://hm.baidu.com/**', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }))
              page = await context.newPage()
              page.setDefaultTimeout(5000)
              page.on('pageerror', (error) => failures.push(error.message))
              page.on('requestfailed', (request) => { if (request.url().startsWith(origin)) failures.push(`${request.url()}: ${request.failure()?.errorText}`) })
              page.on('response', (response) => { if (response.url().startsWith(origin) && response.status() >= 400) failures.push(`${response.status()}: ${response.url()}`) })
              const route = surface === 'mobile' ? `/mobile.html#/${mobileComponent(item, item.demos[index])}?language=zh-CN` : item.route
              await page.goto(`${origin}${route}`)
              await chooseTheme(page, library, surface, theme)
              let demo
              if (surface === 'documentation') {
                const examples = page.locator(library === 'cedar' ? '.vmi-previewer-example' : '.loca-doc-preview__example')
                assert.equal(await examples.count(), item.demos.length, 'rendered demo count matches the actual document references')
                assert.deepEqual(await examples.evaluateAll((elements) => elements.flatMap((element) => [...element.querySelectorAll('*')].filter((node) => /^(?:c|mp)-/.test(node.localName)).map((node) => node.localName))), [], 'every demo resolves its Vue components; raw custom tags are not a rendered example')
                demo = examples.nth(index)
                await demo.waitFor({ state: 'visible' })
                // Read every source panel once, not just the interacted demo.
                // Other matrix cells recheck the representative source/theme.
                for (const sourceIndex of theme === 'lightTheme' ? item.demos.map((_, i) => i) : [...new Set([0, index])]) {
                  await checkSource(page, library, sourceIndex, item.demos[sourceIndex])
                }
              } else {
                const section = mobileSection(item, item.demos[index])
                demo = page.locator(`section[data-demo="${section}"]`)
                await demo.waitFor({ state: 'visible' })
                // The same imported SFC is proven by the inventory's binding /
                // section mapping; documentation cases above compare its exact
                // displayed source. This is not a second inferred source copy.
              }
              const layout = await demo.evaluate((element) => ({
                width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
                background: getComputedStyle(element).backgroundColor,
                children: element.childElementCount, text: element.textContent.trim(),
                box: element.getBoundingClientRect().toJSON(),
              }))
              assert.equal(layout.scrollWidth, layout.width, 'component demo cannot widen the page')
              assert.ok(layout.children > 0 || layout.text, 'demo must not render an empty placeholder')
              assert.ok(layout.box.width > 0 && layout.box.height > 0)
              if (surface === 'documentation') assert.equal(dark(layout.background), theme === 'darkTheme', 'demo card background follows the selected theme')
              const result = await exercise({ page, demo, component: item.component, library, contract })
              assert.deepEqual(failures, [], 'no script exceptions or failed local assets')
              if (['tabs', 'input-number', 'pull-refresh', 'code', 'table-column-manager'].includes(item.component)) {
                await mkdir(evidence, { recursive: true })
                await page.screenshot({ path: resolve(evidence, `${surface}-${theme}-${item.component}-passed.png`) })
              }
              results.push({ component: item.component, surface, theme, kind: contract.kind, source: item.demos[index].file, checkedSources: surface === 'documentation' ? theme === 'lightTheme' ? item.demos.length : new Set([0, index]).size : 0, result, passed: true })
              t.diagnostic(JSON.stringify({ component: item.component, library, surface, theme, source: item.demos[index].file, result }))
            } catch (error) {
              results.push({ component: item.component, surface, theme, kind: contract.kind, passed: false, error: String(error) })
              if (page) {
                const diagnostic = await page.evaluate(() => ({
                  url: location.href, text: document.body.innerText.slice(-2400),
                  numericSteps: [...document.querySelectorAll('.mp-input-number__step')].filter((element) => element.getBoundingClientRect().right > innerWidth).map((element) => {
                    const parents = []
                    for (let node = element; node && parents.length < 7; node = node.parentElement) {
                      const style = getComputedStyle(node), box = node.getBoundingClientRect()
                      parents.push({ class: node.className, right: box.right, left: box.left, width: box.width, padding: style.padding, margin: style.margin, border: style.borderWidth, boxSizing: style.boxSizing, demo: node.closest('section[data-demo]')?.dataset.demo })
                    }
                    return parents
                  }),
                  overflow: [...document.querySelectorAll('body *')].filter((element) => element.getBoundingClientRect().right > innerWidth + 0.01 && getComputedStyle(element).position !== 'fixed').slice(0, 30).map((element) => ({ tag: element.tagName, class: element.className, text: element.textContent.slice(0, 100), right: element.getBoundingClientRect().right, width: element.getBoundingClientRect().width })),
                  previews: [...document.querySelectorAll('.vmi-previewer-example,.loca-doc-preview__example,section[data-demo]')].slice(0, 2).map((element) => element.outerHTML.slice(0, 6000)),
                  controls: [...document.querySelectorAll('input,textarea,button,[role]')].filter((element) => element.getBoundingClientRect().width && element.getBoundingClientRect().height).slice(-80).map((element) => ({ tag: element.tagName, role: element.getAttribute('role'), label: element.getAttribute('aria-label') ?? element.textContent.trim().slice(0, 70), class: element.className })),
                })).catch(() => ({}))
                t.diagnostic(JSON.stringify({ failures, diagnostic }))
                {
                  const destination = evidence
                  await mkdir(destination, { recursive: true })
                  const name = `${surface}-${theme}-${item.component}`
                  await page.screenshot({ path: resolve(destination, `${name}-failure.png`) }).catch(() => {})
                  await writeFile(resolve(destination, `${name}-failure.json`), JSON.stringify({ failures, diagnostic, error: String(error) }, null, 2))
                }
              }
              throw error
            } finally { await context.close() }
          })
        }
      }
    }
    for (const theme of ['lightTheme', 'darkTheme']) for (const guide of guides) {
      it(`guide ${theme} ${guide.component}: production document`, { timeout: 30_000 }, async () => {
        const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
        const failures = []
        let page
        try {
          await context.route('https://hm.baidu.com/**', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }))
          page = await context.newPage()
          page.on('pageerror', (error) => failures.push(error.message))
          page.on('requestfailed', (request) => { if (request.url().startsWith(origin)) failures.push(`${request.url()}: ${request.failure()?.errorText}`) })
          page.on('response', (response) => { if (response.url().startsWith(origin) && response.status() >= 400) failures.push(`${response.status()}: ${response.url()}`) })
          await page.goto(`${origin}${guide.route}`)
          await chooseTheme(page, library, 'documentation', theme)
          assert.ok(await page.locator('h1').count() > 0, 'guide has its actual heading')
          assert.ok((await page.locator(library === 'cedar' ? 'main' : '.maple-site-doc-container').innerText()).trim().length > 60, 'guide renders substantive documentation')
          const examples = page.locator(library === 'cedar' ? '.vmi-previewer-example' : '.loca-doc-preview__example')
          assert.equal(await examples.count(), guide.demos.length, 'guide demo inventory matches production')
          assert.deepEqual(await examples.evaluateAll((elements) => elements.flatMap((element) => [...element.querySelectorAll('*')].filter((node) => /^(?:c|mp)-/.test(node.localName)).map((node) => node.localName))), [], 'guide examples resolve their actual Vue components')
          for (let index = 0; index < guide.demos.length; index++) {
            await checkSource(page, library, index, guide.demos[index])
            assert.ok(await examples.nth(index).evaluate((element) => element.childElementCount > 0 && element.getBoundingClientRect().height > 0), 'guide example renders real content')
          }
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 1280)
          assert.deepEqual(failures, [])
          results.push({ kind: 'guide', component: guide.component, theme, checkedSources: guide.demos.length, passed: true })
        } catch (error) {
          results.push({ kind: 'guide', component: guide.component, theme, passed: false, error: String(error) })
          await mkdir(evidence, { recursive: true })
          const name = `guide-${theme}-${guide.component.replaceAll('/', '-')}`
          await page?.screenshot({ path: resolve(evidence, `${name}-failure.png`) }).catch(() => {})
          await writeFile(resolve(evidence, `${name}-failure.json`), JSON.stringify({ failures, error: String(error), url: page?.url() }, null, 2))
          throw error
        } finally { await context.close() }
      })
    }
  })
}
