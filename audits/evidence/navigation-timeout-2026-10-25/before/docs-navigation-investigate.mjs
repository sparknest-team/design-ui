import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve, extname, sep } from 'node:path'
import { performance } from 'node:perf_hooks'

const workspace = '/Users/shuaimeng/github_web'
const { chromium } = createRequire(`${workspace}/cedar-design-web/package.json`)('playwright')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' }
const browsers = await chromium.launch()
const delay = Number(process.env.DIAG_REQUEST_DELAY ?? 0)
try {
  for (const library of ['cedar', 'maple']) {
    const directory = `${workspace}/${library === 'cedar' ? 'cedar-design-web/packages/cedar-ui/dist' : 'maple-design-mobile/packages/maple-ui/site'}`
    const server = createServer(async (request, response) => {
      const file = resolve(directory, `.${new URL(request.url, 'http://localhost').pathname.replace(/\/$/, '/index.html')}`)
      if (!file.startsWith(directory + sep)) { response.writeHead(403).end(); return }
      try {
        const body = await readFile(file)
        if (delay && file.endsWith('.js')) await new Promise((done) => setTimeout(done, delay))
        if (file.endsWith('/logo.svg') && process.env.DIAG_LOGO_DELAY) await new Promise((done) => setTimeout(done, Number(process.env.DIAG_LOGO_DELAY)))
        response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }); response.end(body)
      } catch { response.writeHead(404).end() }
    })
    await new Promise((done) => server.listen(0, '127.0.0.1', done))
    const origin = `http://127.0.0.1:${server.address().port}`
    try {
      for (let round = 0; round < Number(process.env.DIAG_ROUNDS ?? 4); round++) {
        const context = await browsers.newContext({ viewport: { width: 1280, height: 900 } })
        await context.route('https://hm.baidu.com/**', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }))
        if (process.env.DIAG_BLOCK_ICONS) await context.route('https://cdn.jsdelivr.net/npm/@fortawesome/**', () => new Promise(() => {}))
        if (process.env.DIAG_BLOCK_ANALYTICS) await context.route('https://hm.baidu.com/**', () => new Promise(() => {}))
        await context.addInitScript(() => {
          window.__navigationLongTasks = []
          new PerformanceObserver((entries) => window.__navigationLongTasks.push(...entries.getEntries().map(({ startTime, duration }) => ({ startTime, duration })))).observe({ type: 'longtask', buffered: true })
        })
        const page = await context.newPage()
        page.setDefaultTimeout(5000)
        const session = await context.newCDPSession(page)
        await session.send('Network.enable')
        await session.send('Performance.enable')
        if (process.env.DIAG_CPU_RATE) await session.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.DIAG_CPU_RATE) })
        const requests = new Map(), errors = [], events = []
        const start = performance.now()
        session.on('Network.requestWillBeSent', (event) => requests.set(event.requestId, { url: event.request.url, type: event.type, start: performance.now() - start, initiator: event.initiator.type }))
        session.on('Network.loadingFinished', (event) => Object.assign(requests.get(event.requestId) ?? {}, { end: performance.now() - start, bytes: event.encodedDataLength }))
        session.on('Network.loadingFailed', (event) => Object.assign(requests.get(event.requestId) ?? {}, { end: performance.now() - start, error: event.errorText }))
        page.on('domcontentloaded', () => events.push({ name: 'domcontentloaded', at: performance.now() - start }))
        page.on('load', () => events.push({ name: 'load', at: performance.now() - start }))
        page.on('pageerror', (error) => errors.push(String(error)))
        const route = library === 'cedar' ? '/components/form/' : '/#/zh-CN/form'
        let error
        try { await page.goto(origin + route) } catch (cause) { error = String(cause) }
        const elapsed = performance.now() - start
        const pending = [...requests.values()].filter((request) => !request.end)
        const metrics = await session.send('Performance.getMetrics')
        const document = await page.evaluate(() => ({ state: document.readyState, navigation: performance.getEntriesByType('navigation')[0]?.toJSON(), longTasks: window.__navigationLongTasks, resources: performance.getEntriesByType('resource').map(({name, startTime, duration, initiatorType}) => ({name,startTime,duration,initiatorType})) })).catch((error) => ({ error: String(error) }))
        console.log(JSON.stringify({ library, round, delay, cpuRate: process.env.DIAG_CPU_RATE ?? 1, elapsed, error, errors, events, requests: [...requests.values()], pending, metrics, document }))
        await context.close()
      }
    } finally { server.closeAllConnections(); await new Promise((done) => server.close(done)) }
  }
} finally { await browsers.close() }
