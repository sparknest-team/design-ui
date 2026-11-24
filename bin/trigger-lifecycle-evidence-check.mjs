import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const evidenceURL = new URL(
  '../audits/evidence/trigger-native-lifecycle-2026-10-13/results.json',
  import.meta.url,
)
export function validateTriggerLifecycle(report, jpeg) {
  assert.equal(report.browser, 'Codex IAB')
  assert.equal(report.accepted, 4)
  assert.equal(report.theme, 'default/light')
  assert.equal(report.realOSPassesAdded, 0)
  assert.equal(report.input, 'native fixture buttons; scripted mouseenter, not trusted hover')
  assert.deepEqual(report.consoleErrorsWarnings, [])
  assert.deepEqual(
    report.cases.map((r) => `${r.name}/${r.kind}`),
    ['Cedar/delay-unmount', 'Maple/delay-unmount', 'Cedar/keepalive-resize', 'Maple/keepalive-resize'],
  )
  for (const row of report.cases) {
    assert.equal(row.passed, true)
    assert.equal(row.finalPanels, 0)
    const p = Object.fromEntries(row.samples.map((s) => [s.phase, s]))
    assert.equal(Object.keys(p).length, row.samples.length)
    assert.ok(row.samples.every((s, i) => !i || s.t >= row.samples[i - 1].t))
    if (row.kind === 'delay-unmount') {
      assert.deepEqual(
        row.samples.map((s) => s.phase),
        ['pending', 'unmounted', 'after-deadline', 'positive-remount-open', 'final-unmount'],
      )
      assert.ok(p.unmounted.t - p.pending.t >= 95 && p.unmounted.t - p.pending.t < 300)
      assert.ok(p['after-deadline'].t - p.pending.t >= 500)
      assert.equal(p['after-deadline'].updates, 0)
      assert.equal(p['after-deadline'].panels, 0)
      assert.equal(p['positive-remount-open'].panels, 1)
      assert.equal(p['positive-remount-open'].updates, 1)
      assert.equal(row.events.filter((e) => e.event === 'update:open' && e.value === true).length, 1)
      const opened = row.events.find((e) => e.event === 'update:open' && e.value === true)
      assert.ok(opened.t - p['after-deadline'].t >= 298)
      assert.ok(opened.t <= p['positive-remount-open'].t)
    } else {
      assert.deepEqual(
        row.samples.map((s) => s.phase),
        ['opened', 'resized-active', 'deactivated', 'changed-inactive', 'reactivated-open', 'final-unmount'],
      )
      assert.equal(p.opened.panels, 1)
      assert.ok(p['resized-active'].resizeEvents > p.opened.resizeEvents)
      assert.equal(p.deactivated.resizeEvents, p['changed-inactive'].resizeEvents)
      assert.equal(p.deactivated.panels, 0)
      assert.equal(p['changed-inactive'].panels, 0)
      assert.equal(p['reactivated-open'].panels, 1)
      assert.ok(p['reactivated-open'].resizeEvents > p['changed-inactive'].resizeEvents)
      assert.deepEqual(
        row.events.filter((e) => e.event === 'update:open').map((e) => e.value),
        [true, false, true],
      )
      assert.equal(p['final-unmount'].panels, 0)
    }
  }
  assert.equal(createHash('sha256').update(jpeg).digest('hex'), report.screenshot.sha256)
  return report.cases.length
}
export function checkSavedTriggerLifecycle() {
  const report = JSON.parse(readFileSync(evidenceURL, 'utf8'))
  return validateTriggerLifecycle(report, readFileSync(new URL(report.screenshot.file, evidenceURL)))
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  console.log(
    `Trigger IAB lifecycle evidence passed: ${checkSavedTriggerLifecycle()} scoped cases; no OS/native-hover claim.`,
  )
