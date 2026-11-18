import assert from 'node:assert/strict'
import { browserProfile, evidenceDirectory, contextOptions, browserEvidence, waitForThemeAnimations, assertBrowserVersion } from './compatibility.mjs'
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
import { assertDirectionGeometry } from './reading-direction-catalog/geometry.mjs'
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
  const menu = page.locator('details.docs-select').filter({ has: page.locator('summary[aria-label="主题"]') })
  await menu.locator('summary').click()
  await menu.getByRole('button', { name: label, exact: true }).click()
  if (library === 'cedar') {
    await page.waitForFunction((value) => document.documentElement.dataset.cedarDocsTheme === value, theme)
  } else {
    const scope = surface === 'mobile' ? 'MAPLE_V3_THEME_DEMO' : 'MAPLE_V3_THEME'
    await page.waitForFunction(({ key, value }) => localStorage.getItem(key) === value, { key: scope, value: theme })
  }
  await waitForThemeAnimations(page)
  const surfaceSelector = library === 'maple' ? '#app > .mp-theme-provider' : 'body'
  await page.waitForFunction(({ selector, wantDark }) => {
    const element = document.querySelector(selector)
    const color = element && getComputedStyle(element).backgroundColor
    const rgb = color?.match(/[\d.]+/g)?.map(Number)
    return rgb?.length >= 3 && (rgb.length < 4 || rgb[3] === 1) && (rgb.slice(0, 3).reduce((a, b) => a + b, 0) < 384) === wantDark
  }, { selector: surfaceSelector, wantDark: theme === 'darkTheme' })
  assert.equal(dark(await page.locator(surfaceSelector).evaluate((element) => getComputedStyle(element).backgroundColor)), theme === 'darkTheme', 'real page background follows the selected theme')
}

export async function checkSource(page, library, index, expected) {
  const preview = page.locator(library === 'cedar' ? '.vmi-previewer' : '.loca-doc-preview').nth(index)
  await preview.evaluate((element) => {
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      if (parent instanceof HTMLDetailsElement) parent.open = true
    }
  })
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
  const requestedComponents = process.env.DOCS_COMPONENTS?.split(',')
  const pages = componentPages(root, library).filter(page => !requestedComponents || requestedComponents.includes(page.component))
  const readingDirection = process.env.DOCS_READING_DIRECTION
  assert.ok(!readingDirection || ['ltr', 'rtl'].includes(readingDirection), 'DOCS_READING_DIRECTION must be ltr or rtl')
  const directionCore = process.env.DOCS_DIRECTION_CORE === '1'
  const themes = directionCore ? ['lightTheme'] : ['lightTheme', 'darkTheme']
  const guides = process.env.DOCS_DIRECTION_SKIP_GUIDES === '1' ? [] : guidePages(root, library)
  const inputs = sourceFingerprint(root, library)
  const productionInputs = productionFingerprint(root, library)
  const concurrency = Number(process.env.DOCS_BROWSER_CONCURRENCY ?? (directionCore ? 1 : 2))
  assert.ok([1, 2].includes(concurrency), 'browser concurrency must be 1 or 2; coverage and timeouts remain unchanged')
  const playwright = createRequire(resolve(root, 'package.json'))('playwright')
  const { devices } = playwright
  const profile = browserProfile()
  // A new comprehensive suite gets its own budget; the original theme gates and
  // their timeouts are unchanged. Individual component cases stay bounded.
  describe(`${library}: every production component page, source and behavior`, { timeout: 1_800_000, concurrency }, () => {
    let directory, server, browser, origin, buildIndexHash, disposed = false
    let contextsSinceLaunch = 0, browserLaunches = 0, initialBrowserVersion
    const openContext = async options => {
      // Cases already have isolated contexts. Recycle the Firefox automation
      // process between small groups so a failed Juggler session cannot cancel
      // the rest of a component catalog. Component assertions stay unchanged.
      if (directionCore && profile.engine === 'firefox' && concurrency === 1 && contextsSinceLaunch >= 8) {
        await browser.close()
        browser = await playwright[profile.engine].launch(profile.launchOptions)
        browserLaunches++
        assert.equal(browser.version(), initialBrowserVersion, 'browser recycling cannot change the tested version')
        contextsSinceLaunch = 0
      }
      assert.ok(!disposed, 'acceptance must remain active before creating a context')
      contextsSinceLaunch++
      return browser.newContext(options)
    }
    const results = []
    const extraSources = new Map()
    const evidence = evidenceDirectory(root, library)
    before(async () => {
      const output = resolve(root, `packages/ui/${library === 'cedar' ? 'dist' : 'site'}`)
      await readFile(resolve(output, 'index.html')).catch(() => { throw new Error('Build production docs first: pnpm build:doc') })
      directory = process.env.DOCS_PRODUCTION_SNAPSHOT
        ? resolve(process.env.DOCS_PRODUCTION_SNAPSHOT)
        : await mkdtemp(resolve(tmpdir(), `${library}-components-browser-`))
      if (!process.env.DOCS_PRODUCTION_SNAPSHOT) await copyProductionSnapshot(output, directory)
      if (disposed) {
        if (!process.env.DOCS_PRODUCTION_SNAPSHOT) await rm(directory, { recursive: true, force: true })
        throw new Error('snapshot completed after setup was cancelled')
      }
      buildIndexHash = createHash('sha256').update(await readFile(resolve(directory, 'index.html'))).digest('hex')
      assert.ok(!disposed, 'setup must remain active before starting the snapshot server')
      // The copied production snapshot is immutable. Cache its bytes for the
      // direction matrix; every component still gets an isolated browser context.
      const assetCache = directionCore ? new Map() : undefined
      server = createServer(async (request, response) => {
        try {
          const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
          const file = resolve(directory, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`)
          if (!file.startsWith(`${directory}${sep}`)) { response.writeHead(403).end(); return }
          const body = assetCache?.get(file) ?? await readFile(file)
          assetCache?.set(file, body)
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
      browserLaunches++
      initialBrowserVersion = browser.version()
      assertBrowserVersion(profile, browser)
    }, { timeout: directionCore ? 600_000 : 120_000 })
    after(async () => {
      disposed = true
      try {
        await mkdir(evidence, { recursive: true })
        const current = componentPages(root, library).filter(page => !requestedComponents || requestedComponents.includes(page.component))
        for (const { item, checked } of extraSources.values()) {
          const result = results.find(entry => entry.component === item.component && entry.surface === 'documentation' && entry.theme === 'lightTheme')
          if (result?.passed) {
            result.checkedSources += checked.size
            assert.equal(result.checkedSources, item.demos.length, `Incomplete source coverage for ${item.component}`)
          }
        }
        const sourcesStable = sourceFingerprint(root, library) === inputs && JSON.stringify(current.map((item) => item.demos)) === JSON.stringify(pages.map((item) => item.demos))
        const productionInputsStable = productionFingerprint(root, library) === productionInputs
        await writeFile(resolve(evidence, 'coverage.json'), JSON.stringify({
          library, browser: browserEvidence(profile, browser), components: pages.length, sourcesStable, sourceFingerprint: inputs, buildIndexHash, node: process.version,
          productionInputsStable, productionFingerprint: productionInputs,
          concurrency, browserLaunches,
          expectedComponentCases: pages.length * themes.length * (library === 'cedar' ? 1 : 2),
          readingDirection: readingDirection ?? 'ltr', directionCore,
          expectedGuideCases: guides.length * themes.length,
          completedComponentCases: results.filter((result) => result.kind !== 'guide').length,
          results,
        }, null, 2))
        assert.ok(sourcesStable, 'authored demo sources changed during acceptance; rebuild and rerun after parallel changes stabilize')
        assert.ok(productionInputsStable, 'production documentation inputs changed during acceptance; rebuild and rerun after compiler, preview or dependency changes stabilize')
      } finally {
        await browser?.close()
        if (server?.listening) { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)) }
        if (directory && !process.env.DOCS_PRODUCTION_SNAPSHOT) await rm(directory, { recursive: true, force: true })
      }
    })

    for (const surface of library === 'cedar' ? ['documentation'] : ['documentation', 'mobile']) {
      for (const theme of themes) {
        for (const item of pages) {
          const contract = contractFor(library, item.component)
          const index = demoIndex(item, contract.demo)
          const splitSources = library === 'cedar' && !readingDirection && !directionCore && surface === 'documentation' && theme === 'lightTheme' && item.demos.length > 24
          if (splitSources) {
            const checked = new Set()
            extraSources.set(item.component, { item, checked })
            const remaining = item.demos.map((_, i) => i).filter(i => i !== index)
            for (let start = 0; start < remaining.length; start += 8) {
              const batch = remaining.slice(start, start + 8)
              it(`${item.component}: source panels ${batch[0] + 1}–${batch.at(-1) + 1}`, { timeout: 30_000 }, async (t) => {
                const context = await openContext({ ...contextOptions(profile, surface, devices, browser.version()), colorScheme: 'light' })
                t.signal.addEventListener('abort', () => { void context.close().catch(() => {}) }, { once: true })
                try {
                  await context.route('https://hm.baidu.com/**', route => route.fulfill({ contentType: 'text/javascript', body: '' }))
                  const page = await context.newPage()
                  const errors = []
                  page.on('pageerror', error => errors.push(error.message))
                  page.on('requestfailed', request => { if (request.url().startsWith(origin)) errors.push(request.url()) })
                  page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) errors.push(response.url()) })
                  page.setDefaultTimeout(5000)
                  await navigateWithDiagnostics(page, origin + item.route)
                  await chooseTheme(page, library, surface, theme)
                  for (const sourceIndex of batch) {
                    await checkSource(page, library, sourceIndex, item.demos[sourceIndex])
                    checked.add(sourceIndex)
                  }
                  assert.deepEqual(errors, [])
                } finally { await context.close() }
              })
            }
          }
          it(`${surface} ${theme} ${item.component}: ${contract.kind}, exact source`, { timeout: directionCore ? 60_000 : 30_000 }, async (t) => {
            const context = await openContext({ ...contextOptions(profile, surface, devices, browser.version()), colorScheme: 'light' })
            t.signal.addEventListener('abort', () => { void context.close().catch(() => {}) }, { once: true })
            let page
            const failures = []
            try {
              if (readingDirection) await context.addInitScript((direction) => {
                try { localStorage.setItem('sparknest-docs-direction', direction) } catch { /* opaque frames have no storage */ }
                document.documentElement?.setAttribute('dir', direction)
              }, readingDirection)
              await context.route('https://hm.baidu.com/**', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }))
              page = await context.newPage()
              page.setDefaultTimeout(5000)
              // Resource loading has its own budget; component actions retain 5s.
              if (directionCore) page.setDefaultNavigationTimeout(30_000)
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
                for (const sourceIndex of directionCore || splitSources ? [index] : theme === 'lightTheme' ? item.demos.map((_, i) => i) : [...new Set([0, index])]) {
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
              // Source-panel collapse belongs to documentation setup. Finish it
              // before testing component positions, focus and pointer targets.
              if (directionCore) await waitForThemeAnimations(page)
              if (readingDirection) {
                await page.waitForFunction(direction => document.documentElement.dir === direction, readingDirection)
                const beforeDirection = await demo.evaluate(element => {
                  const controls = [...element.querySelectorAll('input,textarea,select,[aria-checked],[aria-valuenow]')].filter(node => node.getAttribute('role') !== 'progressbar')
                  const values = controls.map(node => [node.tagName, node.value ?? '', node.checked ?? '', node.getAttribute('aria-checked'), node.getAttribute('aria-valuenow')])
                  return { values, direction: getComputedStyle(element).direction, dirAttribute: element.getAttribute('dir') }
                })
                const opposite = readingDirection === 'rtl' ? 'ltr' : 'rtl'
                await demo.evaluate((element, value) => element.setAttribute('dir', value), opposite)
                await demo.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
                assert.equal(await demo.evaluate(element => getComputedStyle(element).direction), opposite, 'real authored demo supports a nested opposite reading direction')
                const afterDirection = await demo.evaluate(element => [...element.querySelectorAll('input,textarea,select,[aria-checked],[aria-valuenow]')].filter(node => node.getAttribute('role') !== 'progressbar').map(node => [node.tagName, node.value ?? '', node.checked ?? '', node.getAttribute('aria-checked'), node.getAttribute('aria-valuenow')]))
                if (!['count-to', 'countdown', 'carousel', 'loading-bar'].includes(item.component)) assert.deepEqual(afterDirection, beforeDirection.values, 'changing reading direction does not change form or selection values')
                await demo.evaluate((element, original) => {
                  if (original === null) element.removeAttribute('dir')
                  else element.setAttribute('dir', original)
                }, beforeDirection.dirAttribute)
                await demo.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
                assert.equal(await demo.evaluate(element => getComputedStyle(element).direction), beforeDirection.direction, 'restoring the authored scope restores its reading direction')
              }
              await demo.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
              const layout = await demo.evaluate((element) => ({
                width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
                background: getComputedStyle(element).backgroundColor,
                children: element.childElementCount, text: element.textContent.trim(),
                box: element.getBoundingClientRect().toJSON(),
              }))
              if (layout.scrollWidth !== layout.width) {
                layout.overflow = await page.evaluate(() => [...document.querySelectorAll('body *')]
                  .map(element => ({ element, rect: element.getBoundingClientRect(), style: getComputedStyle(element) }))
                  .filter(({ rect }) => rect.right > innerWidth + 1 || rect.left < -1)
                  .filter(({ element, rect }) => {
                    let left = rect.left, right = rect.right
                    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
                      if (!/auto|scroll|hidden|clip/.test(getComputedStyle(parent).overflowX)) continue
                      const box = parent.getBoundingClientRect()
                      left = Math.max(left, box.left); right = Math.min(right, box.right)
                    }
                    return right > left && (right > innerWidth + 1 || left < -1)
                  })
                  .slice(0, 6).map(({ element, rect, style }) => {
                    const ancestors = []
                    for (let parent = element.parentElement; parent && ancestors.length < 4; parent = parent.parentElement) {
                      const computed = getComputedStyle(parent), box = parent.getBoundingClientRect()
                      ancestors.push({ tag: parent.tagName, class: parent.className, display: computed.display, overflow: computed.overflow, width: box.width })
                    }
                    return { tag: element.tagName, class: String(element.className), section: element.closest('section[data-demo]')?.getAttribute('data-demo'), left: rect.left, right: rect.right, position: style.position, overflow: style.overflow, ancestors }
                  }))
                layout.scrollContainers = await page.evaluate(() => [...document.querySelectorAll('body *')]
                  .filter(element => element.scrollWidth > element.clientWidth)
                  .slice(0, 50).map(element => ({ tag: element.tagName, class: String(element.className), section: element.closest('section[data-demo]')?.getAttribute('data-demo'), clientWidth: element.clientWidth, scrollWidth: element.scrollWidth })))
              }
              assert.equal(layout.scrollWidth, layout.width, `component demo cannot widen the page${layout.overflow ? ': ' + JSON.stringify({ elements: layout.overflow, scrollContainers: layout.scrollContainers }) : ''}`)
              assert.ok(layout.children > 0 || layout.text, 'demo must not render an empty placeholder')
              assert.ok(layout.box.width > 0 && layout.box.height > 0)
              if (surface === 'documentation') assert.equal(dark(layout.background), theme === 'darkTheme', 'demo card background follows the selected theme')
              const directionGeometry = readingDirection ? await assertDirectionGeometry({demo, component:item.component,library}) : []
              const result = await exercise({ page, demo, component: item.component, library, contract, demos: item.demos,
                capture: async (name) => {
                  const overlay = page.locator('.mp-nav-menu__overlay:visible')
                  if (await overlay.count()) {
                    await overlay.evaluate(element => Promise.all(element.getAnimations({ subtree: true })
                      .filter(animation => animation.playState === 'running' && animation.effect?.getComputedTiming().iterations !== Infinity)
                      .map(animation => animation.finished.catch(() => {}))))
                  }
                  await mkdir(evidence, { recursive: true })
                  await page.screenshot({ path: resolve(evidence, `${surface}-${theme}-${item.component}-${name}.png`) })
                },
              })
              if (library === 'cedar' && ['menu', 'nav-menu'].includes(item.component)) {
                await page.setViewportSize({ width: 375, height: 900 })
                const tables = page.locator('.theme-hope-content > table')
                assert.ok(await tables.count() > 0, 'navigation documentation includes real API tables')
                await pollTableLayout(page, tables)
              }
              assert.deepEqual(failures, [], 'no script exceptions or failed local assets')
              if (['tabs', 'input-number', 'pull-refresh', 'code', 'table-column-manager', 'nav-menu'].includes(item.component)) {
                await mkdir(evidence, { recursive: true })
                await page.screenshot({ path: resolve(evidence, `${surface}-${theme}-${item.component}-passed.png`) })
              }
              results.push({ readingDirection: readingDirection ?? 'ltr', component: item.component, surface, theme, kind: contract.kind, source: item.demos[index].file, directionGeometry, checkedSources: surface === 'documentation' ? directionCore || splitSources ? 1 : theme === 'lightTheme' ? item.demos.length : new Set([0, index]).size : 0, result, passed: true })
              t.diagnostic(JSON.stringify({ component: item.component, library, surface, theme, source: item.demos[index].file, result }))
            } catch (error) {
              results.push({ readingDirection: readingDirection ?? 'ltr', component: item.component, surface, theme, kind: contract.kind, passed: false, error: String(error) })
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
    for (const theme of themes) for (const guide of guides) {
      it(`guide ${theme} ${guide.component}: production document`, { timeout: 30_000 }, async () => {
        const context = await openContext({ viewport: { width: 1280, height: 900 } })
        if (readingDirection) await context.addInitScript(direction => { try { localStorage.setItem('sparknest-docs-direction', direction) } catch { /* opaque frames have no storage */ }; document.documentElement?.setAttribute('dir', direction) }, readingDirection)
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
  // Responsive sidebars can still be moving after setViewportSize resolves.
  // Check settled layout while retaining both overflow assertions.
  await waitForThemeAnimations(page)
  await tables.first().scrollIntoViewIfNeeded()
  assert.equal(await tables.first().evaluate((table) => getComputedStyle(table).overflowX), 'auto', 'mobile API tables scroll locally')
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile API tables do not widen the page')
}
