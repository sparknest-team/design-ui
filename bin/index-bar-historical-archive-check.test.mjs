import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { checkArchivedIndexBarEvidence } from './index-bar-historical-archive-check.mjs'
import { readEvidence } from './index-bar-lifecycle-evidence-check.mjs'

test('verifies historical IndexBar fixture, sources and screenshot', () => {
  assert.deepEqual(checkArchivedIndexBarEvidence(readEvidence()), { accepted: 4, os: 0, blocked: 144 })
})
for (const suffix of ['frozen-fixture.js', 'frozen-IndexBar.vue', 'frozen-scroll-task.ts', 'native.jpg']) {
  test(`rejects changed archived ${suffix}`, () => {
    assert.throws(() =>
      checkArchivedIndexBarEvidence(readEvidence(), (path) =>
        path.endsWith(suffix) ? Buffer.from('changed') : readFileSync(path),
      ),
    )
  })
}
