import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
const reporter = new URL('./contrast-report.mjs', import.meta.url).href
const run = script => spawnSync(process.execPath, ['--input-type=module', '-e', `import { reportContrast } from ${JSON.stringify(reporter)}; ${script}`], { encoding: 'utf8' })

test('low contrast emits a CI advisory while keeping custom colors non-blocking', () => {
  const result = run("reportContrast(3.25, 4.5, 'custom tag color')")
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /::warning title=Color contrast advisory::/)
  assert.match(result.stderr, /custom tag color: 3.25:1; suggested 4.5:1/)
})
test('passing contrast produces no warning', () => {
  const result = run('reportContrast(7, 4.5)')
  assert.equal(result.status, 0)
  assert.equal(result.stderr, '')
})
test('contrast advice does not swallow invalid calculations or unrelated assertions', () => {
  assert.notEqual(run('reportContrast(NaN, 4.5)').status, 0)
  assert.notEqual(run('reportContrast(2, Infinity)').status, 0)
  assert.notEqual(run("reportContrast(2, 4.5); throw new Error('structural failure')").status, 0)
})
test('large audits retain all issue counts but limit warning examples', () => {
  const result = run("for (let i=0;i<100;i++) reportContrast(2, 4.5, 'color-'+i)")
  assert.equal(result.status, 0)
  assert.match(result.stderr, /100 color pairs/)
  assert.equal((result.stderr.match(/\[contrast advisory\]/g) || []).length, 8)
})
