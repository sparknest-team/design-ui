import assert from 'node:assert/strict'
import { resolve } from 'node:path'

export const browserNames = ['chromium', 'firefox', 'webkit', 'chrome', 'msedge']
export function browserProfile(name = process.env.DOCS_BROWSER ?? 'chromium') {
  assert.ok(browserNames.includes(name), `Unsupported DOCS_BROWSER: ${name}`)
  return { name, engine: ['chrome', 'msedge'].includes(name) ? 'chromium' : name,
    launchOptions: ['chrome', 'msedge'].includes(name) ? { channel: name } : {} }
}
export function evidenceDirectory(root, library, name = process.env.DOCS_BROWSER) {
  const base = resolve(process.env.DOCS_BROWSER_EVIDENCE_DIR ?? resolve(root, 'artifacts/docs-components'), library)
  return name ? resolve(base, name) : base
}
export function contextOptions(profile, surface, devices, version = '0') {
  if (surface !== 'mobile') return { viewport: { width: 1280, height: 900 } }
  // UA emulation is needed for the site's mobile routing. The actual engine
  // version comes from browser.version(), never from this OS/device preset.
  if (profile.engine === 'firefox') return {
    viewport: { width: 375, height: 900 }, hasTouch: false,
    userAgent: `Mozilla/5.0 (Android 13; Mobile; rv:${version}) Gecko/${version} Firefox/${version}`,
  }
  const preset = profile.engine === 'webkit' ? 'iPhone 13' : 'Pixel 7'
  const { defaultBrowserType, ...options } = devices[preset]
  const userAgent = profile.engine === 'webkit'
    ? options.userAgent.replace(/Version\/[\d.]+/, `Version/${version}`)
    : options.userAgent.replace(/Chrome\/[\d.]+/, `Chrome/${version}`)
  return { ...options, userAgent, viewport: { width: 375, height: 900 } }
}
export function browserEvidence(profile, browser) {
  return { ...profile, version: browser?.version() ?? null, platform: process.platform,
    architecture: process.arch, recordedAt: new Date().toISOString(),
    evidenceType: 'automated-engine-regression', nativeDeviceAcceptance: false,
    userAgentEmulation: 'device routing preset; not evidence of an actual OS/browser version',
    gestureInput: profile.engine === 'chromium' ? 'CDP touch injection' : 'synthetic touch events (handler regression only)' }
}


export async function waitForThemeAnimations(page) {
  // Business animations can be long-running or intentionally paused. Only
  // root theme transitions belong to the theme-switch readiness condition.
  await page.evaluate(() => Promise.all(document.getAnimations().filter((animation) =>
    animation.playState === 'running' &&
    animation.effect?.getComputedTiming().iterations !== Infinity &&
    [document.body, document.documentElement].includes(animation.effect?.target),
  ).map((animation) => animation.finished.catch(() => {}))))
}
