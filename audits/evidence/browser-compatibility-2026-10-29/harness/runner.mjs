import assert from 'node:assert/strict'
import { browserProfile, evidenceDirectory, contextOptions, browserEvidence, waitForThemeAnimations } from './compatibility.mjs'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { extname, resolve, sep } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { componentPages, demoIndex, mobileSection, mobileComponent, guidePages, sourceFingerprint, productionFingerprint } from './inventory.mjs'
import { contractFor } from './contracts.mjs'
import { exercise } from './actions.mjs'
import { copyProductionSnapshot } from './snapshot.mjs'
import { navigateWithDiagnostics } from './navigation.mjs'

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' }
const normalize = (source) => source.replace(/\r\n/g, '\n').trimEnd()
const dark = (color) => {
  const values = color.match(/[\d.]+/g)?.map(Number)
  assert.ok(values?.length >= 3 && (values.length < 4 || values[3] === 1), `surface must be opaque: ${color}`)
  return values.slice(0, 3).reduce((a, b) => a + b, 0) < 384
}

export async function chooseTheme(page, library, surface, theme) {
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
  await waitForThemeAnimations(page)
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

export async function checkSource(page, library, index, expected) {
  const preview = page.locator(library === 'cedar' ? '.vmi-previewer' : '.loca-doc-preview').nth(index)
  const source = preview.locator(library === 'cedar' ? '.vmi-previewer-sources pre' : '.loca-doc-preview__sources pre').first()
  if (!await source.isVisible()) {
    await (library === 'cedar' ? preview.locator('[title="展开或收起源码"]') : preview.getByRole('button', { name: '展开源码', exact: true })).click()
  }
  await source.waitFor({ state: 'visible' })
  assert.equal(normalize(await source.textContent()), normalize(expected.source), `expanded source matches ${expected.file} exactly`)
  const colors = await source.evaluate((element) => {
    const values = new Set()
    for (const span of element.querySelectorAll('span')) {
      values.add(getComputedStyle(span).color)
      // The assertion only needs two distinct colors. Preserve its predicate
      // without reading every repeated token in large source examples.
      if (values.size >= 2) break
    }
    return [...values]
  })
  assert.ok(library === 'cedar' ? colors.length >= 2 : colors.length >= 1 && await source.locator('span[class*="hljs-"]').count() > 0, 'actual source retains highlighted syntax tokens (markup-only demos may use one token color)')
  // Source expansion/collapse itself must work on every component page.
  await (library === 'cedar' ? preview.locator('[title="展开或收起源码"]') : preview.getByRole('button', { name: '收起源码', exact: true })).click()
  await source.waitFor({ state: 'hidden' })
}

export function defineProductionComponentTests({ root, library }) {
  const pages = componentPages(root, library)
  const guides = guidePages(root, library)
  const inputs = sourceFingerprint(root, library)
  const productionInputs = productionFingerprint(root, library)
  const concurrency = Number(process.env.DOCS_BROWSER_CONCURRENCY ?? 2)
  assert.ok([1, 2].includes(concurrency), 'browser concurrency must be 1 or 2; coverage and timeouts remain unchanged')
  const playwright = createRequire(resolve(root, 'package.json'))('playwright')
  const { devices } = playwright
  const profile = browserProfile()
  // A new comprehensive suite gets its own budget; the original theme gates and
  // their timeouts are unchanged. Individual component cases stay bounded.
  describe(`${library}: every production component page, source and behavior`, { timeout: 1_800_000, concurrency }, () => {
    let directory, server, browser, origin, buildIndexHash, disposed = false
    const results = []
    const evidence = evidenceDirectory(root, library)
    before(async () => {
      const output = resolve(root, `packages/ui/${library === 'cedar' ? 'dist' : 'site'}`)
      await readFile(resolve(output, 'index.html')).catch(() => { throw new Error('Build production docs first: pnpm build:doc') })
      directory = await mkdtemp(resolve(tmpdir(), `${library}-components-browser-`))
      await copyProductionSnapshot(output, directory)
      if (disposed) {
        await rm(directory, { recursive: true, force: true })
        throw new Error('snapshot completed after setup was cancelled')
      }
      buildIndexHash = createHash('sha256').update(await readFile(resolve(directory, 'index.html'))).digest('hex')
      assert.ok(!disposed, 'setup must remain active before starting the snapshot server')
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
      if (disposed) { await new Promise((resolve) => server.close(resolve)); throw new Error('server started after setup was cancelled') }
      origin = `http://127.0.0.1:${server.address().port}`
      const launched = await playwright[profile.engine].launch(profile.launchOptions)
      if (disposed) { await launched.close(); throw new Error('browser launched after setup was cancelled') }
      browser = launched
    }, { timeout: 120_000 })
    after(async () => {
      disposed = true
      try {
        await mkdir(evidence, { recursive: true })
        const current = componentPages(root, library)
        const sourcesStable = sourceFingerprint(root, library) === inputs && JSON.stringify(current.map((item) => item.demos)) === JSON.stringify(pages.map((item) => item.demos))
        const productionInputsStable = productionFingerprint(root, library) === productionInputs
        await writeFile(resolve(evidence, 'coverage.json'), JSON.stringify({
          library, browser: browserEvidence(profile, browser), components: pages.length, sourcesStable, sourceFingerprint: inputs, buildIndexHash, node: process.version,
          productionInputsStable, productionFingerprint: productionInputs,
          concurrency,
          expectedComponentCases: pages.length * (library === 'cedar' ? 2 : 4),
          expectedGuideCases: guides.length * 2,
          completedComponentCases: results.filter((result) => result.kind !== 'guide').length,
          results,
        }, null, 2))
        assert.ok(sourcesStable, 'authored demo sources changed during acceptance; rebuild and rerun after parallel changes stabilize')
        assert.ok(productionInputsStable, 'production documentation inputs changed during acceptance; rebuild and rerun after compiler, preview or dependency changes stabilize')
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
            const context = await browser.newContext({ ...contextOptions(profile, surface, devices, browser.version()), colorScheme: 'light' })
            t.signal.addEventListener('abort', () => { void context.close().catch(() => {}) }, { once: true })
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
              await navigateWithDiagnostics(page, `${origin}${route}`)
              if (library === 'cedar') {
                const logo = page.locator('.vp-nav-logo')
                assert.equal(await logo.count(), 1, 'Cedar header has one local brand image')
                assert.ok(await logo.evaluate((image) => image.complete && image.naturalWidth > 0), 'Cedar local header logo decodes successfully')
                assert.equal(new URL(await logo.getAttribute('src'), origin).origin, origin, 'Cedar logo does not depend on an external placeholder domain')
              }
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
              const result = await exercise({ page, demo, component: item.component, library, contract, demos: item.demos })
              if (library === 'cedar' && ['menu', 'nav-menu'].includes(item.component)) {
                await page.setViewportSize({ width: 375, height: 900 })
                const tables = page.locator('.theme-hope-content > table')
                assert.ok(await tables.count() > 0, 'navigation documentation includes real API tables')
                await pollTableLayout(page, tables)
              }
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
                t.diagnostic(JSON.stringify({ failures, diagnostic, navigation: error.navigationDiagnostics }))
                {
                  const destination = evidence
                  await mkdir(destination, { recursive: true })
                  const name = `${surface}-${theme}-${item.component}`
                  await page.screenshot({ path: resolve(destination, `${name}-failure.png`) }).catch(() => {})
                  await writeFile(resolve(destination, `${name}-failure.json`), JSON.stringify({ failures, diagnostic, navigation: error.navigationDiagnostics, error: String(error) }, null, 2))
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
          await navigateWithDiagnostics(page, `${origin}${guide.route}`)
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
          await writeFile(resolve(evidence, `${name}-failure.json`), JSON.stringify({ failures, error: String(error), navigation: error.navigationDiagnostics, url: page?.url() }, null, 2))
          throw error
        } finally { await context.close() }
      })
    }
  })
}

async function pollTableLayout(page, tables) {
  await tables.first().scrollIntoViewIfNeeded()
  assert.equal(await tables.first().evaluate((table) => getComputedStyle(table).overflowX), 'auto', 'mobile API tables scroll locally')
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile API tables do not widen the page')
}
