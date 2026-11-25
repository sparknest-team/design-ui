import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { checkBusinessCases, readEvidence } from './business-lifecycle-evidence-check.mjs'
import { checkFirstFrameEvidence, readFirstFrameEvidence } from './business-lifecycle-first-frame-evidence-check.mjs'
import {
  checkArchivedBusinessEvidence,
  compareCurrentFixtureWithArchive,
} from './business-lifecycle-historical-archive-check.mjs'
import { readFixedCapture } from './fixed-lifecycle-capture.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const originalLine = "s.active.value = true; await nextTick(); await wait(200); snapshot('reactivated')"
const frameLine =
  "s.active.value = true; await nextTick(); await wait(200); await new Promise(resolve => requestAnimationFrame(resolve)); await nextTick(); snapshot('reactivated')"
const originalTitle = 'InputNumber / Countdown 真实 IAB 生命周期'
const frameTitle = 'InputNumber / Countdown Ego Lite 首帧诊断'
const originalRunning = "p.running.remaining < 1600 && p['paused-stable'].changes === p.paused.changes"
const frameRunning =
  "p.running.remaining < 1600 && p.running.changes > p.mounted.changes && p['paused-stable'].changes === p.paused.changes"
const originalRunningSample = "await wait(180); snapshot('running')"
const frameRunningSample =
  "await wait(180); await new Promise(resolve => requestAnimationFrame(resolve)); await nextTick(); snapshot('running')"
const originalResumedSample = "s.instance.value.start(); await wait(180); snapshot('resumed')"
const frameResumedSample =
  "s.instance.value.start(); await wait(180); await new Promise(resolve => requestAnimationFrame(resolve)); await nextTick(); snapshot('resumed')"

export function checkFrameFixture(current, frame) {
  assert.equal(current.split(originalLine).length, 2, 'expected a single original reactivation boundary')
  assert.equal(current.split(originalTitle).length, 2, 'expected a single original title')
  assert.equal(current.split(originalRunning).length, 2, 'expected a single original running assertion')
  assert.equal(current.split(originalRunningSample).length, 2, 'expected a single original running sample')
  assert.equal(current.split(originalResumedSample).length, 2, 'expected a single original resumed sample')
  assert.equal(
    frame,
    current
      .replace(originalLine, frameLine)
      .replace(originalTitle, frameTitle)
      .replace(originalRunning, frameRunning)
      .replace(originalRunningSample, frameRunningSample)
      .replace(originalResumedSample, frameResumedSample),
    'first-frame fixture differs beyond documented observation and running assertions',
  )
}

export function checkCurrentBusinessEvidence(read = readFileSync) {
  const historical = checkArchivedBusinessEvidence(readEvidence(), read)
  const original = read(resolve(root, 'audits/evidence/business-native-lifecycle-2026-10-13/frozen-fixture.js'), 'utf8')
  const current = read(resolve(root, 'refactors/token-validation/browser/business-lifecycle-main.js'), 'utf8')
  const frame = read(
    resolve(root, 'refactors/token-validation/browser/business-lifecycle-first-frame-diagnostic.js'),
    'utf8',
  )
  assert.ok(
    compareCurrentFixtureWithArchive(original, current),
    'current fixture differs from archived fixture beyond package paths and teardown fix',
  )
  checkFrameFixture(current, frame)
  const currentEvidence = checkFirstFrameEvidence(readFirstFrameEvidence(), read)
  const fixed = readFixedCapture(
    'business',
    [
      'design-ui/refactors/token-validation/browser/business-lifecycle-ego.html',
      'design-ui/refactors/token-validation/browser/business-lifecycle-main.js',
      ...['cedar-design-web', 'maple-design-mobile'].flatMap((repo) =>
        ['input-number/InputNumber.vue', 'countdown/Countdown.vue', 'countdown/use-countdown.ts'].map(
          (file) => repo + '/packages/ui/src/' + file,
        ),
      ),
    ],
    read,
  )
  assert.deepEqual(fixed.cdpEvents, [])
  assert.equal(fixed.run.busy, false)
  const cases = fixed.run.results.map((row) => {
    if (row.kind !== 'countdown') return row
    const changes = row.events.filter((event) => event.event === 'change')
    return { ...row, eventSummary: { count: changes.length, last: changes.at(-1) } }
  })
  return { historical, currentEvidence, fixedWindow: checkBusinessCases(cases) }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(checkCurrentBusinessEvidence())
  console.log(
    'Historical 200ms fixture verified separately; current-source Ego evidence covers first-frame and fixed-window scenarios. No OS or native long-press certification.',
  )
}
