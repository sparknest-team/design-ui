import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
export const evidenceURL = new URL('../audits/evidence/message-native-2026-10-13/results.json', import.meta.url)
export function validateMessageEvidence(report, jpeg) {
  assert.equal(report.browser, 'Codex IAB')
  assert.equal(report.theme, 'default/light')
  assert.equal(report.accepted, 8)
  assert.equal(report.osPreferencePassesAdded, 0)
  assert.equal(report.toleranceMs, 2)
  assert.deepEqual(report.consoleErrorsWarnings, [])
  assert.deepEqual(report.cases.map(r=>r.id), ['cedar-default','cedar-long','cedar-zero','cedar-reopen','maple-default','maple-long','maple-zero','maple-reopen'])
  const identities = new Set()
  for (const r of report.cases) {
    const [platform, mode] = r.id.split('-'), reopen = mode === 'reopen'
    const ms = mode === 'zero' ? 0 : mode === 'long' || reopen ? 600 : platform === 'cedar' ? 100 : 150
    assert.equal(r.platform, platform); assert.equal(r.mode, mode)
    assert.equal(r.complete, true); assert.equal(r.finalNodes, 0)
    const value = (ms/1000) + 's'
    assert.equal(r.duration, platform === 'cedar' ? value : value + ', ' + value)
    assert.equal(r.delay, platform === 'cedar' ? '0s' : '0s, 0s')
    assert.equal(r.properties, platform === 'cedar' ? 'opacity' : 'opacity, transform')
    const curve = ms === 600 ? 'linear' : platform === 'cedar' ? 'cubic-bezier(0, 0, 1, 1)' : 'cubic-bezier(0.25, 0.8, 0.5, 1)'
    assert.equal(r.easing, platform === 'cedar' ? curve : curve + ', ' + curve)
    assert.deepEqual(r.commands.map(c=>c[0]), reopen ? ['add-first','close-first','add-replacement'] : ['add-first','close-first'])
    assert.equal(r.commands[0][2], 1200)
    assert.ok(r.commands[1][1] - r.commands[0][1] + 2 >= 800)
    assert.deepEqual(r.callbacks.map(c=>c[0]), reopen ? ['open','opened','close','open','opened','close','closed'] : ['open','opened','close','closed'])
    assert.equal(r.entries.length, reopen ? 2 : 1)
    for (const e of r.entries) {
      assert.ok(!identities.has(e.identity)); identities.add(e.identity)
      for (const t of [e.created,e.leave,e.removed]) assert.ok(Number.isFinite(t))
      assert.ok(e.leave >= e.created); assert.ok(e.removed >= e.leave)
    }
    const last = r.entries.at(-1), closed = r.callbacks.at(-1)[1]
    if (ms > 0) {
      assert.ok(Number.isFinite(last.leaveTo))
      assert.ok(last.leaveTo >= last.leave)
      assert.ok(last.removed - last.leaveTo + 2 >= ms, r.id + ': truncated leave')
      assert.ok(closed - last.leaveTo + 2 >= ms, r.id + ': premature closed')
    }
    assert.ok(r.finishedAt >= last.removed)
    if (reopen) {
      assert.equal(r.sameRootNodeAfterReopen, false)
      assert.equal(r.commands[2][2], 1200)
      assert.ok(r.commands[2][1] - r.commands[1][1] + 2 >= 100)
      assert.ok(r.callbacks[5][1] - r.commands[2][1] + 2 >= 1200, r.id + ': old deadline closed replacement')
      assert.ok(r.entries[0].removed >= r.commands[2][1])
      assert.ok(r.entries[1].created >= r.entries[0].removed)
    }
  }
  assert.deepEqual(report.nativeLeavingEnds.map(e=>e.property), ['opacity','transform'])
  const nativeRow = report.cases.at(-1), nativeEntry = nativeRow.entries.at(-1)
  for (const end of report.nativeLeavingEnds) {
    assert.equal(end.id, nativeRow.id); assert.equal(end.identity, nativeEntry.identity)
    assert.equal(end.elapsedSeconds, 0.6)
    assert.ok(Number.isFinite(end.at) && end.at >= nativeEntry.leaveTo && end.at <= nativeEntry.removed)
  }
  assert.equal(report.screenshot.file, 'native.jpg')
  assert.equal(jpeg[0], 0xff); assert.equal(jpeg[1], 0xd8)
  assert.equal(createHash('sha256').update(jpeg).digest('hex'), report.screenshot.sha256)
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  validateMessageEvidence(JSON.parse(readFileSync(evidenceURL)), readFileSync(new URL('native.jpg', evidenceURL)))
  console.log('Message: eight native IAB DOM completion cases and original JPEG verified; no OS/native zoom claim.')
}
