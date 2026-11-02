import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = (file) => readFileSync(file, 'utf8').trim().split('\n').map(JSON.parse)
const before = read('/tmp/docs-navigation-all-external-stall-before-20261025.jsonl')
const after = read('/tmp/docs-navigation-all-external-stall-after-20261025.jsonl')
const results = []
for (const library of ['cedar', 'maple']) {
  const original = before.find((item) => item.library === library)
  const fixed = after.find((item) => item.library === library)
  assert.match(original.error, /Timeout 5000ms exceeded/)
  assert.ok(original.events.some((event) => event.name === 'domcontentloaded'))
  assert.ok(!original.events.some((event) => event.name === 'load'))
  const pendingBefore = original.pending.filter((request) => request.url.startsWith('https://'))
  assert.equal(pendingBefore.length, library === 'cedar' ? 3 : 2)
  assert.equal(fixed.error, undefined)
  const loaded = fixed.events.find((event) => event.name === 'load')
  assert.ok(loaded && loaded.at < 5000)
  const externalAfter = fixed.requests.filter((request) => request.url.startsWith('https://'))
  if (library === 'cedar') {
    assert.deepEqual(externalAfter, [])
    const logo = fixed.requests.find((request) => request.url.endsWith('/logo.svg'))
    assert.ok(logo.end - logo.start >= 1200, 'the delayed local image is still present, not bypassed')
  } else {
    assert.ok(externalAfter.length > 0, 'analytics remains enabled')
    assert.ok(externalAfter.every((request) => request.start > loaded.at && request.end === undefined), 'analytics starts after load and still receives no response')
  }
  results.push({ library, beforeMs: original.elapsed, beforeEvents: original.events, pendingBefore,
    afterMs: fixed.elapsed, afterEvents: fixed.events, externalAfter })
}
console.log(JSON.stringify({ passed: true, timeoutMs: 5000, localLogoDelayMs: 1200, scenario: 'DIAG_ROUNDS=1 DIAG_BLOCK_ICONS=1 DIAG_BLOCK_ANALYTICS=1 DIAG_LOGO_DELAY=1200', results }, null, 2))
