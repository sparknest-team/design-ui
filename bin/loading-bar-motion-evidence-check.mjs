import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const evidenceURL = new URL('../audits/evidence/loading-bar-native-2026-10-13/results.json', import.meta.url)
export function validateLoadingBarEvidence(report, jpeg) {
  assert.equal(report.browser, 'Codex IAB')
  assert.equal(report.accepted, 6)
  assert.equal(report.osPreferencePassesAdded, 0)
  assert.equal(report.toleranceMs, 2)
  assert.equal(report.properties, 'width, opacity, background-color')
  assert.deepEqual(report.consoleErrorsWarnings, [])
  assert.deepEqual(
    report.cases.map((row) => row.id),
    ['default', 'long', 'zero', 'repeated', 'restart', 'error'],
  )
  for (const row of report.cases) {
    const long = row.id === 'long' || row.id === 'restart'
    assert.equal(row.timing, long ? 'long' : row.id === 'zero' ? 'zero' : 'default')
    assert.equal(row.duration, long ? '0.6s, 0.6s, 0.6s' : row.id === 'zero' ? '0s, 0s, 0s' : '0.25s, 0.25s, 0.25s')
    assert.equal(row.delay, long ? '0.1s, 0.2s, 0s' : '0s, 0s, 0s')
    assert.equal(row.easing, long ? 'linear, linear, linear' : 'ease, ease, ease')
    assert.equal(row.finalNodes, 0)
    assert.equal(row.hiddenTimes.length, 1)
    assert.equal(row.completionTimes.length, row.id === 'restart' ? 2 : 1)
    for (const time of [row.start, row.created, row.shown, row.removed, ...row.hiddenTimes, ...row.completionTimes])
      assert.ok(Number.isFinite(time))
    assert.ok(row.created >= row.start)
    assert.ok(row.shown >= row.created)
    assert.ok(row.completionTimes[0] >= row.shown)
    assert.ok(row.hiddenTimes[0] - row.completionTimes.at(-1) + 2 >= (long ? 700 : 300), row.id + ': premature hiding')
    assert.ok(row.removed - row.hiddenTimes[0] + 2 >= (long ? 800 : 250), row.id + ': premature unmount')
    const names = row.commands.map(([name, time]) => {
      assert.ok(Number.isFinite(time))
      return name
    })
    assert.deepEqual(
      names,
      row.id === 'error'
        ? ['error']
        : row.id === 'repeated'
          ? ['start', 'finish', 'finish', 'finish']
          : row.id === 'restart'
            ? ['start', 'finish', 'start', 'finish']
            : ['start', 'finish'],
    )
    if (row.id === 'restart')
      assert.ok(row.restartReset > row.completionTimes[0] && row.restartReset < row.completionTimes[1])
    if (row.id === 'error') assert.equal(row.errorVisible, true)
  }
  assert.equal(report.screenshot.file, 'native.jpg')
  assert.equal(jpeg[0], 0xff)
  assert.equal(jpeg[1], 0xd8)
  assert.equal(createHash('sha256').update(jpeg).digest('hex'), report.screenshot.sha256)
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  validateLoadingBarEvidence(JSON.parse(readFileSync(evidenceURL)), readFileSync(new URL('native.jpg', evidenceURL)))
  console.log('LoadingBar native evidence: six real IAB cases and original JPEG verified; no OS/native zoom claim.')
}
