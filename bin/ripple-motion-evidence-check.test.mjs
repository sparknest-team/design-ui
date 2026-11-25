import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { validateRippleMotion } from './ripple-motion-evidence-check.mjs'

const saved = JSON.parse(
  readFileSync(new URL('../audits/evidence/ripple-motion-2026-10-13/results.json', import.meta.url), 'utf8'),
)
test('validates six actual Ripple timing observations', () => validateRippleMotion(saved))
for (const [name, mutate] of [
  ['missing group', (record) => record.groups.pop()],
  [
    'duplicate group',
    (record) => {
      record.groups[1] = record.groups[0]
    },
  ],
  [
    'unconsumed token',
    (record) => {
      record.groups[2].duration = '0.2s, 0.14s'
    },
  ],
  [
    'premature fading',
    (record) => {
      record.groups[2].faded = record.groups[2].expanded + 250
    },
  ],
  [
    'premature deletion',
    (record) => {
      record.groups[3].removed = record.groups[3].faded + 250
    },
  ],
  [
    'remaining wave',
    (record) => {
      record.remainingNodes = 1
    },
  ],
  [
    'OS acceptance relabel',
    (record) => {
      record.excluded = []
    },
  ],
])
  test('rejects ' + name, () => {
    const record = structuredClone(saved)
    mutate(record)
    assert.throws(() => validateRippleMotion(record))
  })
