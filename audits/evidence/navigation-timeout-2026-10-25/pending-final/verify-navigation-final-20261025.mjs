import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sourceFingerprint, productionFingerprint, componentPages, guidePages, demoIndex } from '/Users/shuaimeng/github_web/design-ui/browser/inventory.mjs'
import { contractFor } from '/Users/shuaimeng/github_web/design-ui/browser/contracts.mjs'
const workspace = '/Users/shuaimeng/github_web'
const evidence = `${workspace}/design-ui/audits/evidence/navigation-timeout-2026-10-25`
const json = (file) => JSON.parse(readFileSync(file, 'utf8'))
const lines = (file) => readFileSync(file, 'utf8').trim().split('\n').map(JSON.parse)
const before = lines(`${evidence}/final/navigation-inputs-before-build-20261025.jsonl`)
assert.deepEqual(lines(`${evidence}/final/navigation-inputs-after-build-20261025.jsonl`), before)
const results = []
for (const [library, repository, themeCases] of [['cedar', 'cedar-design-web', 45], ['maple', 'maple-design-mobile', 6]]) {
  const root = resolve(workspace, repository), output = `${root}/packages/ui/${library === 'cedar' ? 'dist' : 'site'}`
  const pages = componentPages(root, library), guides = guidePages(root, library)
  const cases = pages.length * (library === 'cedar' ? 2 : 4) + guides.length * 2
  const expectedSources = pages.reduce((sum, page) => sum + page.demos.length + new Set([0, demoIndex(page, contractFor(library, page.component).demo)]).size, 0) + guides.reduce((sum, page) => sum + page.demos.length * 2, 0)
  const coverage = json(`${evidence}/final/${library}/components/coverage.json`)
  const outage = json(`${evidence}/final/${library}/components/navigation-outage.json`)
  const inputs = { library, source: sourceFingerprint(root, library), production: productionFingerprint(root, library) }
  assert.deepEqual(inputs, before.find((item) => item.library === library))
  assert.equal(coverage.results.length, cases)
  assert.ok(coverage.results.every((item) => item.passed === true))
  assert.equal(coverage.sourcesStable, true)
  assert.equal(coverage.productionInputsStable, true)
  assert.equal(coverage.sourceFingerprint, inputs.source)
  assert.equal(coverage.productionFingerprint, inputs.production)
  assert.equal(coverage.results.reduce((sum, item) => sum + (item.checkedSources ?? 0), 0), expectedSources)
  const indexHash = createHash('sha256').update(readFileSync(`${output}/index.html`)).digest('hex')
  assert.equal(coverage.buildIndexHash, indexHash)
  assert.equal(outage.buildIndexHash, indexHash)
  assert.equal(outage.productionFingerprint, inputs.production)
  assert.equal(outage.stable, true)
  for (const key of ['expected', 'completed', 'passed']) assert.equal(outage[key], 4)
  assert.equal(outage.timeoutMs, 5000)
  assert.equal(outage.logoDelayMs, 1200)
  assert.equal(outage.results.length, 4)
  for (const item of outage.results) {
    assert.equal(item.passed, true)
    assert.ok(item.navigation.events.some((event) => event.name === 'load' && event.elapsedMs < 5000))
    if (library === 'cedar') assert.deepEqual(item.blocked, [])
    else assert.ok(item.blocked.length > 0 && item.blocked.every((request) => request.url.startsWith('https://hm.baidu.com/')))
  }
  for (const [file, count] of [[`navigation-${library}-browser-final-20261025.log`, cases + 4], [`navigation-${library}-theme-20261025.log`, themeCases]]) {
    const log = readFileSync(`${evidence}/final/${library}/${file}`, 'utf8')
    for (const name of ['tests', 'pass']) assert.match(log, new RegExp(`^# ${name} ${count}$`, 'm'))
    for (const name of ['fail', 'cancelled', 'skipped']) assert.match(log, new RegExp(`^# ${name} 0$`, 'm'))
  }
  results.push({ ...inputs, indexHash, componentCases: cases, outageCases: 4, themeCases, checkedSources: expectedSources })
}
const causal = json(`${evidence}/after/navigation-causality-verification-20261025.json`)
assert.equal(causal.passed, true)
console.log(JSON.stringify({ passed: true, node: process.version, causalVerification: true, results }, null, 2))
