import assert from 'node:assert/strict'
import { browserProfile, evidenceDirectory, contextOptions, browserEvidence } from './compatibility.mjs'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { extname, resolve, sep } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { exercise, poll } from './actions.mjs'
import { contractFor } from './contracts.mjs'
import { componentPages, demoIndex, mobileSection, productionFingerprint } from './inventory.mjs'
import { navigateWithDiagnostics, observeNavigation } from './navigation.mjs'
import { chooseTheme, checkSource } from './runner.mjs'
import { copyProductionSnapshot } from './snapshot.mjs'

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' }

export function defineProductionNavigationTests({ root, library }) {
  const inputs = productionFingerprint(root, library)
  const pages = componentPages(root, library)
  const playwright = createRequire(resolve(root, 'package.json'))('playwright')
  const { devices } = playwright
  const profile = browserProfile()
  describe(`${library}: production navigation with all external requests stalled`, { timeout: 180_000 }, () => {
    let directory, server, browser, origin, buildIndexHash, disposed = false
    const results = []
    const evidence = evidenceDirectory(root, library)
    before(async () => {
      directory = await mkdtemp(resolve(tmpdir(), `${library}-navigation-outage-`))
      await copyProductionSnapshot(resolve(root, `packages/${library}-ui/${library === 'cedar' ? 'dist' : 'site'}`), directory)
      if (disposed) { await rm(directory, { recursive: true, force: true }); throw new Error('outage snapshot completed after setup cancellation') }
      buildIndexHash = createHash('sha256').update(await readFile(resolve(directory, 'index.html'))).digest('hex')
      server = createServer(async (request, response) => {
        try {
          const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
          const file = resolve(directory, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`)
          if (!file.startsWith(directory + sep)) { response.writeHead(403).end(); return }
          const body = await readFile(file)
          // Reproduce the real race: hydration can insert CDN scripts while an
          // ordinary local image is still loading. 1200ms is below the original
          // 5000ms budget; external requests remain stalled for the entire case.
          if (pathname === '/logo.svg') await new Promise((done) => setTimeout(done, 1200))
          response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
          response.end(body)
        } catch { if (!response.headersSent) response.writeHead(404); response.end() }
      })
      await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done) })
      if (disposed) { server.closeAllConnections(); await new Promise((done) => server.close(done)); throw new Error('outage server started after setup cancellation') }
      origin = `http://127.0.0.1:${server.address().port}`
      const launched = await playwright[profile.engine].launch(profile.launchOptions)
      if (disposed) { await launched.close(); throw new Error('outage browser launched after setup cancellation') }
      browser = launched
    }, { timeout: 120_000 })
    after(async () => {
      disposed = true
      try {
        await mkdir(evidence, { recursive: true })
        const stable = productionFingerprint(root, library) === inputs
        await writeFile(resolve(evidence, 'navigation-outage.json'), JSON.stringify({
          library, browser: browserEvidence(profile, browser), node: process.version, productionFingerprint: inputs, buildIndexHash,
          stable, timeoutMs: 5000, logoDelayMs: 1200, externalPolicy: 'all HTTP(S) requests held without responses until case cleanup',
          expected: 4, completed: results.length, passed: results.filter((item) => item.passed).length, results,
        }, null, 2))
        assert.equal(stable, true, 'production inputs must remain stable during the outage regression')
      } finally {
        await browser?.close()
        if (server?.listening) { server.closeAllConnections(); await new Promise((done) => server.close(done)) }
        if (directory) await rm(directory, { recursive: true, force: true })
      }
    })
    const scenarios = library === 'cedar'
      ? [{ component: 'form', surface: 'documentation' }, { component: 'collapse', surface: 'documentation' }]
      : [{ component: 'form', surface: 'documentation' }, { component: 'form', surface: 'mobile' }]
    for (const scenario of scenarios) for (const theme of ['lightTheme', 'darkTheme']) {
      it(`${scenario.surface} ${scenario.component} ${theme}: load, interaction and source survive a permanent external outage`, { timeout: 30_000 }, async () => {
        const { component, surface } = scenario
        const item = pages.find((page) => page.component === component)
        assert.ok(item)
        const contract = contractFor(library, component), index = demoIndex(item, contract.demo)
        const context = await browser.newContext({ ...contextOptions(profile, surface, devices, browser.version()), colorScheme: 'light' })
        const page = await context.newPage(), blocked = [], failures = []
        const observation = observeNavigation(page)
        page.setDefaultTimeout(5000)
        let release
        const held = new Promise((done) => { release = done })
        await context.route((url) => /^https?:$/.test(url.protocol) && url.origin !== origin, async (route) => {
          blocked.push({ url: route.request().url(), type: route.request().resourceType() })
          await held
          await route.abort('blockedbyclient').catch(() => {})
        })
        page.on('pageerror', (error) => failures.push(error.message))
        page.on('requestfailed', (request) => { if (request.url().startsWith(origin)) failures.push(`${request.url()}: ${request.failure()?.errorText}`) })
        page.on('response', (response) => { if (response.url().startsWith(origin) && response.status() >= 400) failures.push(`${response.status()}: ${response.url()}`) })
        let navigation
        try {
          await navigateWithDiagnostics(page, origin + (surface === 'mobile' ? '/mobile.html#/form?language=zh-CN' : item.route))
          navigation = observation.snapshot()
          assert.ok(navigation.events.some((event) => event.name === 'load'))
          await chooseTheme(page, library, surface, theme)
          let demo
          if (surface === 'documentation') {
            await checkSource(page, library, index, item.demos[index])
            demo = page.locator(library === 'cedar' ? '.vmi-previewer-example' : '.loca-doc-preview__example').nth(index)
          } else demo = page.locator(`section[data-demo="${mobileSection(item, item.demos[index])}"]`)
          await exercise({ page, demo, component, library, contract, demos: item.demos })
          const html = library === 'maple' ? await readFile(resolve(directory, surface === 'mobile' ? 'mobile.html' : 'index.html'), 'utf8') : ''
          const telemetry = /hm\.src\s*=\s*['"]([^'"]*)['"]/.exec(html)?.[1]
          if (telemetry) {
            await poll(() => blocked.length, (count) => count > 0, 'configured analytics still starts even though its server never responds')
            assert.ok(blocked.every((request) => request.url === telemetry), 'no undeclared external dependency')
            assert.ok(observation.snapshot().pending.some((request) => request.url === telemetry), 'analytics remains genuinely pending, not stubbed successfully')
          } else assert.deepEqual(blocked, [], 'Cedar needs no Font Awesome CDN; unconfigured telemetry stays disabled')
          assert.deepEqual(failures, [], 'local assets and real component interaction remain healthy under the outage')
          results.push({ ...scenario, theme, passed: true, navigation, blocked })
        } catch (error) {
          const diagnostic = error.navigationDiagnostics ?? observation.snapshot()
          results.push({ ...scenario, theme, passed: false, error: String(error), navigation: diagnostic, blocked, failures })
          await mkdir(evidence, { recursive: true })
          await page.screenshot({ path: resolve(evidence, `outage-${surface}-${component}-${theme}-failure.png`) }).catch(() => {})
          throw error
        } finally {
          release()
          await context.close()
        }
      })
    }
  })
}
