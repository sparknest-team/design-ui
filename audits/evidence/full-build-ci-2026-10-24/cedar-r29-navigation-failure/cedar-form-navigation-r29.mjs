import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { extname, resolve, sep } from 'node:path'

const root = '/Users/shuaimeng/github_web/cedar-design-web'
const { chromium } = createRequire(`${root}/package.json`)('playwright')
const directory = `${root}/packages/cedar-ui/dist`
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' }
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  const file = resolve(directory, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`)
  if (!file.startsWith(directory + sep)) { response.writeHead(403).end(); return }
  try { response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }); response.end(await readFile(file)) }
  catch { response.writeHead(404).end() }
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true })
const results = []
try {
  for (let index = 0; index < 6; index++) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    await context.route('https://hm.baidu.com/**', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }))
    const page = await context.newPage()
    page.setDefaultTimeout(5000)
    const pending = new Set(), failures = []
    page.on('request', (request) => pending.add(request.url()))
    page.on('requestfinished', (request) => pending.delete(request.url()))
    page.on('requestfailed', (request) => { pending.delete(request.url()); failures.push({ url: request.url(), error: request.failure()?.errorText }) })
    page.on('pageerror', (error) => failures.push(error.message))
    const start = Date.now()
    let error
    try { await page.goto(`${origin}/components/form/`) } catch (cause) { error = cause.message }
    results.push({ index, elapsed: Date.now() - start, error, pending: [...pending], failures, navigation: await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.toJSON()) })
    await context.close()
  }
  console.log(JSON.stringify(results, null, 2))
  assert.ok(results.every((result) => !result.error && result.failures.length === 0), 'all six fresh contexts load Form within the unchanged 5000ms timeout')
} finally {
  await browser.close()
  await new Promise((done) => server.close(done))
}
