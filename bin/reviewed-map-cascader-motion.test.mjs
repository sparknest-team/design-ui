import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { collectMotionInventory } from './motion-source-inventory.mjs'
import { checkClassification } from './runtime-motion-classification.mjs'

const workspace = resolve(import.meta.dirname, '../..')
const saved = JSON.parse(readFileSync(new URL('../audits/motion-source-inventory.json', import.meta.url), 'utf8'))
const classification = JSON.parse(
  readFileSync(new URL('../audits/runtime-motion-classification.json', import.meta.url), 'utf8'),
)
const files = new Set(['map/update-guard.ts', 'cascader/cascader-column.tsx', 'cascader/use-cascader-focus.ts'])
const readSource = (repo, file) => readFileSync(resolve(workspace, repo, 'packages', 'ui', 'src', file), 'utf8')

test('reviewed Map and Cascader timers and delegated scrolling match source and remain hash guarded', () => {
  const current = collectMotionInventory()
  const rows = classification.rows.filter((row) => files.has(row.file))
  assert.equal(rows.length, 5)
  for (const row of rows) {
    const stored = saved.platforms
      .find((platform) => platform.repo === row.repo)
      .candidates.find((candidate) => candidate.file === row.file)
    const actual = current.platforms
      .find((platform) => platform.repo === row.repo)
      .candidates.find((candidate) => candidate.file === row.file)
    assert.deepEqual(stored, actual, `${row.repo}/${row.file}`)
  }
  const report = { ...classification, rows }
  const result = checkClassification(report, current, readSource)
  assert.equal(result.classifiedHints, 5)
  assert.deepEqual(result.categories, { 'interaction-delay': 3, 'delegated-scroll': 2 })
  assert.throws(
    () => checkClassification(report, current, (repo, file) => readSource(repo, file) + '\n'),
    /source changed/,
  )
})
