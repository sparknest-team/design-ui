import assert from 'node:assert/strict'

export function validateEngineEvidence({ coverage, navigation, capabilities }, expected) {
  assert.equal(coverage.library, expected.library)
  assert.equal(coverage.browser.name, expected.name)
  assert.equal(coverage.buildIndexHash, expected.buildIndexHash, 'stale production artifact')
  assert.equal(navigation.buildIndexHash, expected.buildIndexHash, 'stale navigation artifact')
  assert.equal(coverage.sourceFingerprint, expected.sourceFingerprint, 'stale component source')
  assert.equal(coverage.productionFingerprint, expected.productionFingerprint, 'stale compiler/dependency inputs')
  assert.equal(navigation.productionFingerprint, expected.productionFingerprint)
  assert.equal(coverage.sourcesStable, true)
  assert.equal(coverage.productionInputsStable, true)
  assert.equal(navigation.stable, true)
  assert.equal(coverage.completedComponentCases, coverage.expectedComponentCases)
  assert.equal(coverage.results.length, coverage.expectedComponentCases + coverage.expectedGuideCases)
  assert.ok(coverage.results.length > 0 && coverage.results.every((item) => item.passed === true), 'component/guide failure')
  assert.equal(navigation.completed, navigation.expected)
  assert.equal(navigation.passed, navigation.expected)
  assert.ok(navigation.expected > 0)
  assert.equal(capabilities.result.passed, true)
  assert.equal(capabilities.browser.name, expected.name)
  assert.equal(navigation.browser.name, expected.name)
  assert.equal(capabilities.browser.version, coverage.browser.version)
  assert.equal(navigation.browser.version, coverage.browser.version)
  assert.ok(coverage.browser.version)
  return { browser: coverage.browser, componentCases: coverage.completedComponentCases,
    guideCases: coverage.expectedGuideCases, navigationCases: navigation.completed, passed: true }
}
