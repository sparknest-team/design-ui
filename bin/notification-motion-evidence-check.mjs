import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const evidenceURL = new URL('../audits/evidence/notification-native-2026-10-13/results.json', import.meta.url)
export function validateNotificationEvidence(report, jpeg) {
  assert.equal(report.browser, 'Codex IAB')
  assert.equal(report.accepted, 6)
  assert.equal(report.osPreferencePassesAdded, 0)
  assert.equal(report.toleranceMs, 2)
  assert.deepEqual(report.consoleErrorsWarnings, [])
  assert.deepEqual(
    report.cases.map((row) => row.id),
    ['default', 'long', 'zero', 'readd', 'update', 'manual'],
  )
  const identities = new Set()
  for (const row of report.cases) {
    assert.equal(row.complete, true)
    assert.equal(row.finalNodes, 0)
    assert.equal(row.motion, row.id === 'long' || row.id === 'zero' ? row.id : 'default')
    assert.equal(row.callbacks.length, 1)
    assert.equal(row.callbacks[0].label, row.id === 'update' ? 'updated' : 'new')
    assert.equal(row.items.length, row.id === 'readd' ? 2 : 1)
    const expectedNames =
      row.id === 'readd'
        ? ['add-old', 'clear-topRight', 'add-new']
        : row.id === 'update'
          ? ['add-old', 'add-updated']
          : ['add-new']
    assert.deepEqual(
      row.commands.map((x) => x.name),
      expectedNames,
    )
    for (const command of row.commands) assert.ok(Number.isFinite(command.at))
    const lastAdd = row.commands.at(-1),
      close = row.callbacks[0].at
    assert.ok(Number.isFinite(close))
    assert.equal(lastAdd.duration, row.id === 'manual' ? 1200 : 600)
    if (row.id === 'manual') {
      assert.equal(row.nativeCloseClicked, true)
      assert.ok(
        close > lastAdd.at && close < lastAdd.at + lastAdd.duration,
        'manual must close before automatic deadline',
      )
    } else assert.ok(close - lastAdd.at + 2 >= lastAdd.duration, row.id + ': early business close')
    if (row.id === 'update') assert.equal(row.sameNodeAfterUpdate, true)
    for (const item of row.items) {
      assert.ok(Number.isInteger(item.identity) && !identities.has(item.identity))
      identities.add(item.identity)
      assert.ok(item.text.startsWith(row.id + ':'))
      for (const at of [item.createdAt, item.leaveAt, item.removedAt]) assert.ok(Number.isFinite(at))
      assert.ok(item.createdAt <= item.leaveAt && item.leaveAt <= item.removedAt)
      assert.equal(item.enterDuration, row.id === 'zero' ? '0s' : '0.4s')
      assert.equal(item.leaveDuration, row.id === 'long' ? '0.6s' : row.id === 'zero' ? '0s' : '0.3s')
      assert.equal(item.leaveDelay, '0s')
      assert.equal(item.leaveEasing, row.id === 'long' ? 'linear' : 'cubic-bezier(0.34, 0.69, 0.1, 1)')
      const ms = Number.parseFloat(item.leaveDuration) * 1000
      // DOM class timestamps are not compositor start times. For interrupted
      // entry, use captured native elapsedTime, not a relaxed wall-clock floor.
      const nativeComplete = row.transitionEnds.some(
        (event) =>
          event.type === 'transitionend' &&
          event.identity === item.identity &&
          event.leaving &&
          event.at >= item.leaveAt &&
          event.at <= item.removedAt + 2 &&
          event.elapsedSeconds * 1000 >= ms,
      )
      const domComplete =
        Number.isFinite(item.leaveToAt) && item.leaveToAt >= item.leaveAt && item.removedAt - item.leaveToAt + 2 >= ms
      assert.ok(ms === 0 || nativeComplete || domComplete, row.id + ': insufficient leave completion evidence')
    }
    for (const event of row.transitionEnds) {
      assert.equal(event.type, 'transitionend')
      assert.ok(row.items.some((item) => item.identity === event.identity))
      assert.ok(Number.isFinite(event.at) && Number.isFinite(event.elapsedSeconds) && event.elapsedSeconds >= 0)
      assert.ok(
        ['transform', 'opacity', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom', 'height'].includes(
          event.property,
        ),
      )
    }
  }
  assert.equal(report.screenshot.file, 'native.jpg')
  assert.equal(jpeg[0], 0xff)
  assert.equal(jpeg[1], 0xd8)
  assert.equal(createHash('sha256').update(jpeg).digest('hex'), report.screenshot.sha256)
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  validateNotificationEvidence(JSON.parse(readFileSync(evidenceURL)), readFileSync(new URL('native.jpg', evidenceURL)))
  console.log(
    'Notification native evidence: six service/CSS cases, native events and original JPEG verified; not OS/other engines.',
  )
}
