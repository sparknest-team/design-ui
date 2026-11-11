import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { sourceFingerprint, productionFingerprint } from '/Users/shuaimeng/github_web/design-ui/browser/inventory.mjs'

const workspace = '/Users/shuaimeng/github_web'
const evidence = `${workspace}/design-ui/audits/evidence/full-build-ci-2026-10-24/final-accepted-r29`
const read = (file) => JSON.parse(readFileSync(file, 'utf8'))
const results = []
for (const [library, expected, checkedSources, componentLog, themeCount] of [
  ['cedar', 208, 1146, 'cedar-components-final-r30.log', 45],
  ['maple', 380, 996, 'maple-components-final-r29.log', 6],
]) {
  const root = `${workspace}/${library === 'cedar' ? 'cedar-design-web' : 'maple-design-mobile'}`
  const coverage = read(`${evidence}/${library}/components/coverage.json`)
  assert.equal(coverage.results.length, expected)
  assert.ok(coverage.results.every((result) => result.passed === true))
  assert.equal(coverage.sourcesStable, true)
  assert.equal(coverage.productionInputsStable, true)
  assert.equal(coverage.sourceFingerprint, sourceFingerprint(root, library))
  assert.equal(coverage.productionFingerprint, productionFingerprint(root, library))
  const before = read(`${evidence}/${library}/${library}-inputs-before-r29.json`)
  const after = read(`${evidence}/${library}/${library}-inputs-after-build-r29.json`)
  assert.deepEqual(before, after)
  assert.equal(before.source, coverage.sourceFingerprint)
  assert.equal(before.production, coverage.productionFingerprint)
  const index = `${root}/packages/ui/${library === 'cedar' ? 'dist' : 'site'}/index.html`
  assert.equal(coverage.buildIndexHash, createHash('sha256').update(readFileSync(index)).digest('hex'))
  assert.equal(coverage.results.reduce((sum, result) => sum + (result.checkedSources ?? 0), 0), checkedSources)
  for (const [logName, count] of [[componentLog, expected], [`${library}-theme-final-r29.log`, themeCount]]) {
    const log = readFileSync(`${evidence}/${library}/${logName}`, 'utf8')
    assert.match(log, new RegExp(`^# tests ${count}$`, 'm'))
    assert.match(log, new RegExp(`^# pass ${count}$`, 'm'))
    for (const name of ['fail', 'cancelled', 'skipped']) assert.match(log, new RegExp(`^# ${name} 0$`, 'm'))
  }
  results.push({ library, passed: expected, checkedSources, themePassed: themeCount, source: coverage.sourceFingerprint, production: coverage.productionFingerprint, index: coverage.buildIndexHash })
}
const presentation = read(`${evidence}/maple/presentation/completion.json`)
assert.deepEqual(presentation.initial, presentation.final)
for (const [name, expected] of [['presentation', 308], ['visual', 24]]) {
  assert.deepEqual(presentation[name], { expected, completed: expected, passed: expected, failed: 0, skipped: 0, exitCode: 0 })
}
const maple = results.find((result) => result.library === 'maple')
assert.equal(presentation.final.source, maple.source)
assert.equal(presentation.final.production, maple.production)
assert.equal(presentation.final.buildIndexHash, maple.index)
console.log(JSON.stringify({ passed: true, node: process.version, results, presentationPassed: 308, visualPassed: 24 }, null, 2))
