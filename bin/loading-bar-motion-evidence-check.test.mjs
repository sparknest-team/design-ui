import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { evidenceURL, validateLoadingBarEvidence } from './loading-bar-motion-evidence-check.mjs'
const report = JSON.parse(readFileSync(evidenceURL)), jpeg = readFileSync(new URL('native.jpg', evidenceURL))
test('accepts recorded native cases and original screenshot', () => validateLoadingBarEvidence(report, jpeg))
for (const [name, change] of [
  ['missing group', r => r.cases.pop()],
  ['duplicate group', r => r.cases[1].id = 'default'],
  ['early hide', r => r.cases[1].hiddenTimes[0] = r.cases[1].completionTimes[0] + 250],
  ['early unmount', r => r.cases[1].removed = r.cases[1].hiddenTimes[0] + 250],
  ['wrong resolved CSS', r => r.cases[1].duration = '0s'],
  ['remaining nodes', r => r.cases[0].finalNodes = 1],
  ['false OS acceptance', r => r.osPreferencePassesAdded = 6],
  ['repeated hide', r => r.cases[3].hiddenTimes.push(r.cases[3].hiddenTimes[0])],
  ['altered screenshot hash', r => r.screenshot.sha256 = '0'.repeat(64)],
]) test('rejects ' + name, () => {
  const changed = structuredClone(report)
  change(changed)
  assert.throws(() => validateLoadingBarEvidence(changed, jpeg))
})
