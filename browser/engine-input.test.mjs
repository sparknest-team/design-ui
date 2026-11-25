import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import test from 'node:test'
import {
  assertBrowserVersion,
  browserEvidence,
  browserProfile,
  contextOptions,
  evidenceDirectory,
  waitForThemeAnimations,
} from './compatibility.mjs'
import { touchDrag } from './touch.mjs'

const library = process.env.COMPATIBILITY_LIBRARY
if (!['cedar', 'maple'].includes(library)) throw new Error('Run engine-input.test.mjs through check:compatibility')
const playwright = createRequire(resolve(process.cwd(), 'package.json'))('playwright')
const profile = browserProfile()
test(`${profile.name}: native CSS capabilities and touch handler delivery`, { timeout: 30_000 }, async (t) => {
  const browser = await playwright[profile.engine].launch(profile.launchOptions)
  t.signal.addEventListener(
    'abort',
    () => {
      void browser.close().catch(() => {})
    },
    { once: true },
  )
  const directory = evidenceDirectory(process.cwd(), library)
  let result
  try {
    assertBrowserVersion(profile, browser)
    const context = await browser.newContext(contextOptions(profile, 'mobile', playwright.devices, browser.version()))
    const page = await context.newPage()
    await page.setContent(`<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
      <style>#target { width:160px; height:100px; touch-action:none; background:color-mix(in srgb, red 50%, blue); }
      #cover { position:fixed; top:0; left:0; right:0; height:45px; z-index:1000; background:white; }
      #target:has(span) { padding:10px; } #viewport { height:100dvh; }</style>
      <div id="cover">Sticky header</div><div id="target"><span>Touch target</span></div><div id="viewport"></div>`)
    await page.evaluate(() =>
      document
        .querySelector('#viewport')
        .animate([{ opacity: 1 }, { opacity: 0.9 }], { duration: 600000 })
        .pause(),
    )
    await waitForThemeAnimations(page)
    await page.evaluate(() => {
      window.events = []
      for (const type of ['touchstart', 'touchmove', 'touchend'])
        document.querySelector('#target').addEventListener(
          type,
          (event) => {
            event.preventDefault()
            window.events.push({ type, trusted: event.isTrusted, x: event.changedTouches[0].clientX })
          },
          { passive: false },
        )
    })
    await touchDrag(page, page.locator('#target'), 80, 0)
    result = await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      events: window.events,
      features: {
        colorMix: CSS.supports('color', 'color-mix(in srgb, red 50%, blue)'),
        has: CSS.supports('selector(:has(*))'),
        dvh: CSS.supports('height', '100dvh'),
        resizeObserver: typeof ResizeObserver === 'function',
        intersectionObserver: typeof IntersectionObserver === 'function',
        visualViewport: !!window.visualViewport,
      },
      padding: getComputedStyle(document.querySelector('#target')).paddingTop,
      viewportHeight: document.querySelector('#viewport').getBoundingClientRect().height,
      height: innerHeight,
    }))
    assert.ok(Object.values(result.features).every(Boolean), JSON.stringify(result.features))
    assert.equal(result.padding, '10px')
    assert.ok(Math.abs(result.viewportHeight - result.height) <= 1)
    assert.equal(result.events[0].type, 'touchstart')
    assert.equal(result.events.at(-1).type, 'touchend')
    assert.ok(result.events.filter((event) => event.type === 'touchmove').length >= 1)
    assert.ok(Math.abs(result.events.at(-1).x - result.events[0].x - 80) <= 1)
    await page.setViewportSize({ width: 900, height: 375 })
    assert.ok(
      await page.evaluate(
        () => Math.abs(document.querySelector('#viewport').getBoundingClientRect().height - innerHeight) <= 1,
      ),
    )
    result.passed = true
    await mkdir(directory, { recursive: true })
    await page.screenshot({ path: resolve(directory, 'engine-capabilities.png') })
  } catch (error) {
    result = { ...result, passed: false, error: String(error) }
    throw error
  } finally {
    await mkdir(directory, { recursive: true })
    await writeFile(
      resolve(directory, 'engine-capabilities.json'),
      JSON.stringify({ browser: browserEvidence(profile, browser), result }, null, 2),
    )
    await browser.close()
  }
})
