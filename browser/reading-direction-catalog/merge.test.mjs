import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mergeSuccessfulRetry } from './merge.mjs'

const input = () => ({ library: 'cedar', readingDirection: 'rtl', sourceFingerprint: 'source', productionFingerprint: 'production', buildIndexHash: 'build', sourcesStable: true, productionInputsStable: true, browser: { engine: 'firefox', version: '1' }, results: [{ component: 'a', surface: 'documentation', theme: 'lightTheme', kind: 'interaction', passed: false, error: 'TimeoutError' }, { component: 'b', theme: 'lightTheme', kind: 'presentation', passed: true }] })
test('retry replaces only matching failures and preserves their provenance without mutating the raw report', () => {
  const original = input(), retry = input()
  retry.results = [{ ...original.results[0], passed: true }]
  const merged = mergeSuccessfulRetry(original, retry, 'attempt/coverage.json')
  assert.equal(merged.results.length, 2)
  assert.ok(merged.results.every(row => row.passed))
  assert.equal(merged.results[0].originalFailure, 'TimeoutError')
  assert.equal(merged.results[0].retryEvidence, 'attempt/coverage.json')
  assert.equal(original.results[0].passed, false)
})
test('source, build, browser or unstable input changes cannot be accepted as the same case', () => {
  for (const property of ['sourceFingerprint', 'productionFingerprint', 'buildIndexHash']) {
    const retry = input(); retry[property] = 'changed'
    assert.throws(() => mergeSuccessfulRetry(input(), retry, 'attempt'), /cannot mix/)
  }
  const retry = input(); retry.browser.version = '2'
  assert.throws(() => mergeSuccessfulRetry(input(), retry, 'attempt'), /same browser version/)
  retry.browser.version = '1'; retry.productionInputsStable = false
  assert.throws(() => mergeSuccessfulRetry(input(), retry, 'attempt'), /remain stable/)
})
test('unrelated or failed retries cannot turn a failed case into a pass', () => {
  const original = input(), retry = input()
  retry.results = [{ ...original.results[0], component: 'other', passed: true }]
  assert.equal(mergeSuccessfulRetry(original, retry, 'attempt').results[0].passed, false)
  assert.equal(mergeSuccessfulRetry(original, original, 'attempt').results[0].passed, false)
})
