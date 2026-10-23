import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { evidenceURL, validateTriggerLifecycle } from './trigger-lifecycle-evidence-check.mjs'
const original = JSON.parse(readFileSync(evidenceURL, 'utf8'))
const jpeg = readFileSync(new URL(original.screenshot.file, evidenceURL))
const check = change => { const r = structuredClone(original); change(r); return () => validateTriggerLifecycle(r, jpeg) }
test('actual four-case public lifecycle and native image pass', () => assert.equal(validateTriggerLifecycle(original, jpeg), 4))
test('missing/duplicate cases rejected', () => assert.throws(check(r => { r.cases[1] = r.cases[0] })))
test('late unmount cannot pass cancellation', () => assert.throws(check(r => { r.cases[0].samples[1].t = 310 })))
test('short wait does not prove deadline cancellation', () => assert.throws(check(r => { r.cases[0].samples[2].t = 200 })))
test('missing positive timer control rejected', () => assert.throws(check(r => { r.cases[0].samples[3].panels = 0 })))
test('no active ResizeObserver event rejected', () => assert.throws(check(r => { r.cases[2].samples[1].resizeEvents = 1 })))
test('inactive resize update rejected', () => assert.throws(check(r => { r.cases[2].samples[3].resizeEvents = 3 })))
test('residual popup rejected', () => assert.throws(check(r => { r.cases[3].finalPanels = 1 })))
test('OS/native-hover overclaim rejected', () => assert.throws(check(r => { r.realOSPassesAdded = 1 })))
test('scripted hover cannot become trusted native hover', () => assert.throws(check(r => { r.input = 'trusted native hover' })))
test('positive control cannot open before the real delay', () => assert.throws(check(r => { r.cases[0].events.find(e=>e.event === 'update:open').t = 700 })))
test('modified image rejected', () => assert.throws(() => validateTriggerLifecycle(original, Buffer.from('modified'))))
