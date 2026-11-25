import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { hoverAfterScroll } from './actions.mjs'
import { navigateWithDiagnostics, observeNavigation } from './navigation.mjs'

const workspace = fileURLToPath(new URL('../../', import.meta.url))

test('hover waits for real scroll/geometry stability, then enters exactly once', async () => {
  const calls = [],
    positions = ['a', 'b', 'c', 'c', 'c', 'c']
  let reads = 0
  await hoverAfterScroll({
    async scrollIntoViewIfNeeded() {
      calls.push('scroll')
    },
    async evaluate() {
      reads++
      return positions.shift() ?? 'c'
    },
    async hover() {
      assert.ok(reads >= 6)
      calls.push('hover')
    },
  })
  assert.deepEqual(calls, ['scroll', 'hover'])
})

test('navigation failure records exact pending external scripts without renderer access or retries', async () => {
  const page = new EventEmitter()
  const request = { url: () => 'https://cdn.example.test/icon.js', resourceType: () => 'script' }
  const original = new Error('page.goto: Timeout 5000ms exceeded')
  let calls = 0
  const options = { timeout: 5000, waitUntil: 'load' }
  page.goto = async (url, received) => {
    calls++
    assert.equal(received, options)
    page.emit('request', request)
    page.emit('domcontentloaded')
    throw original
  }
  await assert.rejects(navigateWithDiagnostics(page, 'http://localhost/form/', options), (error) => {
    assert.equal(error, original)
    assert.equal(error.navigationDiagnostics.events[0].name, 'domcontentloaded')
    assert.equal(error.navigationDiagnostics.pending[0].url, request.url())
    assert.match(error.message, /Timeout 5000ms exceeded/)
    assert.match(error.message, /cdn.example.test/)
    return true
  })
  assert.equal(calls, 1)
})

test('duplicate URLs retain distinct requests; completed and failed requests are not pending', () => {
  const page = new EventEmitter()
  const observer = observeNavigation(page)
  assert.equal(observeNavigation(page), observer)
  observer.begin('http://localhost/')
  const first = { url: () => 'https://cdn.example.test/a.js', resourceType: () => 'script' }
  const second = { ...first, failure: () => ({ errorText: 'net::ERR_FAILED' }) }
  page.emit('request', first)
  page.emit('request', second)
  page.emit('response', { request: () => first, status: () => 200 })
  page.emit('requestfinished', first)
  assert.equal(observer.snapshot().pending.length, 1)
  page.emit('requestfailed', second)
  page.emit('load')
  assert.equal(observer.snapshot().pending.length, 0)
  assert.equal(observer.snapshot().requests[1].error, 'net::ERR_FAILED')
  observer.begin('http://localhost/next/')
  assert.deepEqual(observer.snapshot().requests, [])
})

for (const entry of ['index.html', 'mobile.html']) {
  const source = readFileSync(resolve(workspace, 'maple-design-mobile/packages/cli/site', entry), 'utf8')
  const script = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].find((match) => match[1].includes('baidu'))?.[1]
  assert.ok(script, `${entry} has the actual optional analytics bootstrap`)
  for (const state of ['loading', 'complete'])
    test(`${entry}: telemetry starts only after load, once, preserving its queue (${state})`, () => {
      const events = new EventTarget(),
        appended = [],
        queue = [['before-load']]
      const document = {
        readyState: state,
        createElement: () => ({}),
        head: { appendChild: (node) => appended.push(node) },
      }
      runInNewContext(script.replaceAll('<%= baidu %>', 'https://telemetry.example.test/script.js'), {
        document,
        window: { addEventListener: events.addEventListener.bind(events) },
        _hmt: queue,
      })
      assert.equal(appended.length, state === 'loading' ? 0 : 1)
      document.readyState = 'complete'
      events.dispatchEvent(new Event('load'))
      events.dispatchEvent(new Event('load'))
      assert.equal(appended.length, 1)
      assert.equal(appended[0].async, true)
      assert.equal(appended[0].src, 'https://telemetry.example.test/script.js')
      assert.deepEqual(queue, [['before-load']])
    })
  test(`${entry}: unconfigured analytics never inserts a script`, () => {
    runInNewContext(script.replaceAll('<%= baidu %>', ''), {
      document: {
        createElement() {
          assert.fail('empty analytics must not insert scripts')
        },
      },
      window: {
        addEventListener() {
          assert.fail('empty analytics must not register a loader')
        },
      },
    })
  })
}

test('Cedar does not enable an unused remote Font Awesome library', () => {
  const theme = readFileSync(resolve(workspace, 'cedar-design-web/packages/ui/docs/.vuepress/theme.ts'), 'utf8')
  assert.doesNotMatch(theme, /iconAssets\s*:\s*['"]fontawesome/)
})
