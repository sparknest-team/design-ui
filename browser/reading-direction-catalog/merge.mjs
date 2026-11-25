import assert from 'node:assert/strict'

export const caseKey = (row) => [row.component, row.surface ?? '', row.theme, row.kind].join('|')

// A targeted retry is evidence for its own cases, never a successful full run.
export function mergeSuccessfulRetry(original, retry, retryEvidence) {
  for (const key of ['library', 'readingDirection', 'sourceFingerprint', 'productionFingerprint', 'buildIndexHash']) {
    assert.equal(retry[key], original[key], `retry cannot mix ${key}`)
  }
  assert.equal(retry.browser.engine, original.browser.engine, 'retry must use the same engine')
  assert.equal(retry.browser.version, original.browser.version, 'retry must use the same browser version')
  assert.ok(retry.sourcesStable && retry.productionInputsStable, 'retry inputs must remain stable')
  const matches = new Map(retry.results.filter((row) => row.passed).map((row) => [caseKey(row), row]))
  return {
    ...original,
    aggregateAcceptance: true,
    results: original.results.map((row) =>
      row.passed || !matches.has(caseKey(row))
        ? row
        : {
            ...matches.get(caseKey(row)),
            retryEvidence,
            originalFailure: row.error,
          },
    ),
  }
}
