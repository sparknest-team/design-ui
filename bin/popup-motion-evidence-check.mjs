import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const directory = new URL('../audits/evidence/popup-motion-2026-10-13/', import.meta.url)
const record = JSON.parse(readFileSync(new URL('results.json', directory), 'utf8'))
assert.equal(record.browser, 'native IAB Chromium')
assert.equal(record.passed, 9)
assert.equal(record.total, 9)
assert.deepEqual(
  record.groups.map((group) => group.case),
  ['default', 'center600', 'top600', 'bottom600', 'left600', 'right600', 'rapid', 'zero', 'dispose'],
)
for (const group of record.groups) {
  const end = group.closed
  assert.equal(end.state.open, false)
  assert.equal(end.lock, 'visible')
  assert.equal(end.active, 'Open motion popup')
  assert.equal(end.state.mounts, end.state.unmounts)
  if (group.leaving) {
    assert.equal(group.leaving.lock, 'hidden')
    assert.equal(group.leaving.draft, 'preserved draft')
    assert.equal(group.leaving.state.unmounts, group.opened.state.unmounts)
    assert.equal(group.leaving.state.events.at(-1).name, 'close')
    for (const panel of group.leaving.panels) {
      assert.equal(panel.duration, '0.6s')
      assert.equal(panel.easing, 'linear')
    }
  }
  if (group.case.endsWith('600') || group.case === 'default' || group.case === 'zero') {
    const events = end.state.events
    assert.equal(events.at(-2).name, 'close')
    assert.equal(events.at(-1).name, 'closed')
    const elapsed = events.at(-1).at - events.at(-2).at
    assert.ok(elapsed >= (group.case.endsWith('600') ? 600 : group.case === 'default' ? 250 : 0))
    assert.equal(group.opened.state.open, true)
    assert.equal(group.opened.lock, 'hidden')
    const panel = group.opened.panels.find((panel) => panel.class.includes('__content'))
    assert.equal(panel.duration, group.case === 'default' ? '0.25s' : group.case === 'zero' ? '0s' : '0.6s')
  }
}
const rapid = record.groups.find((group) => group.case === 'rapid')
assert.equal(rapid.after.draft, 'rapid preserved')
assert.equal(rapid.after.state.mounts, rapid.before.state.mounts)
assert.equal(rapid.after.state.unmounts, rapid.before.state.unmounts)
assert.equal(rapid.after.lock, 'hidden')
assert.deepEqual(
  rapid.after.state.events.slice(rapid.before.state.events.length).map((event) => event.name),
  ['close', 'open', 'opened'],
)
assert.equal(record.groups.at(-1).closed.state.enabled, false)
assert.deepEqual(record.settledFinal.panels, [])
assert.equal(record.screenshots.length, 7)
assert.deepEqual(
  record.screenshots.map((screenshot) => screenshot.file),
  ['default.jpg', 'center.jpg', 'top.jpg', 'bottom.jpg', 'left.jpg', 'right.jpg', 'rapid.jpg'],
)
for (const screenshot of record.screenshots) {
  assert.match(screenshot.file, /^(default|center|top|bottom|left|right|rapid)\.jpg$/)
  const bytes = readFileSync(new URL(screenshot.file, directory))
  assert.equal(bytes.length, screenshot.bytes)
  assert.equal(bytes.readUInt16BE(0), 0xffd8)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), screenshot.sha256)
}
console.log(
  'Popup motion evidence passed: 9 native cases and 7 original JPEG hashes. Explicit 0ms is not OS reduced-motion.',
)
