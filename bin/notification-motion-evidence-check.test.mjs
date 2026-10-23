import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { evidenceURL, validateNotificationEvidence } from './notification-motion-evidence-check.mjs'
const report = JSON.parse(readFileSync(evidenceURL)), jpeg = readFileSync(new URL('native.jpg', evidenceURL))
test('accepts six actual service cases and native screenshot', () => validateNotificationEvidence(report,jpeg))
for (const [name, change] of [
  ['missing case', r => r.cases.pop()],
  ['duplicate case', r => r.cases[1].id = 'default'],
  ['old callback after clear', r => r.cases[3].callbacks.push({at:141400,label:'old'})],
  ['early new timer', r => r.cases[3].callbacks[0].at = r.cases[3].commands.at(-1).at + 20],
  ['reused DOM item', r => r.cases[3].items[1].identity = r.cases[3].items[0].identity],
  ['lost active identity', r => r.cases[4].sameNodeAfterUpdate = false],
  ['missing manual click', r => r.cases[5].nativeCloseClicked = false],
  ['manual actually timed out', r => r.cases[5].callbacks[0].at = r.cases[5].commands[0].at + 1200],
  ['short long transition', r => r.cases[1].items[0].removedAt = r.cases[1].items[0].leaveToAt + 200],
  ['short native interrupted transition', r => r.cases[3].transitionEnds[0].elapsedSeconds = 0.1],
  ['measurement clone counted', r => r.cases[0].items.push({...r.cases[0].items[0],identity:999,text:''})],
  ['wrong resolved duration', r => r.cases[1].items[0].leaveDuration = '0s'],
  ['remaining node', r => r.cases[0].finalNodes = 1],
  ['false OS pass', r => r.osPreferencePassesAdded = 6],
  ['altered image', r => r.screenshot.sha256 = '0'.repeat(64)],
]) test('rejects ' + name, () => {
  const changed = structuredClone(report); change(changed)
  assert.throws(() => validateNotificationEvidence(changed,jpeg))
})
