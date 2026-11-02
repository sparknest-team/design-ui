import { validateEngineEvidence } from './evidence.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { browserProfile, contextOptions, browserEvidence, evidenceDirectory, assertBrowserVersion } from './compatibility.mjs'
import { browserTargets } from '../packages/ui-build/src/browser-targets.mjs'

test('invalid browser fails instead of silently falling back to Chromium', () => {
  assert.throws(() => browserProfile('safari'), /Unsupported/)
  assert.equal(browserProfile('msedge').engine, 'chromium')
  assert.deepEqual(browserProfile('chrome').launchOptions, { channel: 'chrome' })
})
test('isolated vendor runs pin the executable and actual version without changing normal engine profiles', () => {
  const profile = browserProfile('chrome', { executablePath: '/tmp/official-chrome', expectedVersion: '156.0.8078.73' })
  assert.deepEqual(profile.launchOptions, { executablePath: '/tmp/official-chrome' })
  assertBrowserVersion(profile, { version: () => '156.0.8078.73' })
  assert.throws(() => assertBrowserVersion(profile, { version: () => '155.0.8059.80' }), /pinned release/)
  assert.throws(() => browserProfile('webkit', { executablePath: '/tmp/chrome', expectedVersion: '156.0.8078.73' }), /vendor binaries/)
  assert.throws(() => browserProfile('chrome', { executablePath: '/tmp/chrome', expectedVersion: '156' }), /four-part/)
  assert.equal(browserEvidence(profile, { version: () => '156.0.8078.73' }).nativeDeviceAcceptance, false)
})
test('mobile contexts distinguish Android, WebKit and Firefox viewport coverage', () => {
  const devices = { 'iPhone 13': { userAgent: 'iPhone OS 15 Version/15.0', isMobile: true, hasTouch: true },
    'Pixel 7': { userAgent: 'Android Chrome/99.0', isMobile: true, hasTouch: true } }
  for (const name of ['chromium', 'webkit']) {
    const options = contextOptions(browserProfile(name), 'mobile', devices, '151.1')
    assert.equal(options.isMobile, true)
    assert.equal(options.hasTouch, true)
    assert.ok(options.userAgent.includes('151.1'))
    assert.match(options.userAgent, /iPhone|Android/)
  }
  const firefox = contextOptions(browserProfile('firefox'), 'mobile', devices)
  assert.equal(firefox.isMobile, undefined)
  assert.equal(firefox.hasTouch, false)
  assert.equal(firefox.viewport.width, 375)
})
test('engine evidence cannot masquerade as a native device result', () => {
  const evidence = browserEvidence(browserProfile('webkit'), { version: () => 'fixture-version' })
  assert.equal(evidence.nativeDeviceAcceptance, false)
  assert.equal(evidence.version, 'fixture-version')
  assert.equal(browserEvidence(browserProfile('firefox')).version, null)
  assert.notEqual(evidenceDirectory('/tmp', 'maple', 'firefox'), evidenceDirectory('/tmp', 'maple', 'webkit'))
})
test('the build floor includes each engine rather than an ES syntax level alone', () => {
  for (const engine of ['chrome', 'edge', 'firefox', 'safari']) assert.ok(browserTargets.some((value) => value.startsWith(engine)))
})


test('matrix acceptance rejects partial coverage, failures, stale artifacts and another browser version', () => {
  const expected = { library: 'maple', name: 'webkit', buildIndexHash: 'artifact', sourceFingerprint: 'source', productionFingerprint: 'compiler' }
  const browser = { name: 'webkit', version: 'fixture-version' }
  const evidence = {
    coverage: { ...expected, browser, sourcesStable: true, productionInputsStable: true,
      completedComponentCases: 2, expectedComponentCases: 2, expectedGuideCases: 1, results: [{ passed: true }, { passed: true }, { passed: true }] },
    navigation: { ...expected, browser, stable: true, completed: 4, expected: 4, passed: 4 },
    capabilities: { browser, result: { passed: true } },
  }
  assert.equal(validateEngineEvidence(evidence, expected).passed, true)
  for (const change of [
    (item) => { item.coverage.results.pop() },
    (item) => { item.coverage.results[0].passed = false },
    (item) => { item.coverage.buildIndexHash = 'old-artifact' },
    (item) => { item.coverage.sourceFingerprint = 'old-source' },
    (item) => { item.coverage.productionInputsStable = false },
    (item) => { item.navigation.completed = 3 },
    (item) => { item.capabilities.browser = { name: 'webkit', version: 'another-version' } },
  ]) {
    const broken = structuredClone(evidence)
    change(broken)
    assert.throws(() => validateEngineEvidence(broken, expected))
  }
})
