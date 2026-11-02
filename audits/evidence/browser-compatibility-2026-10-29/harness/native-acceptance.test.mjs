import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import test from 'node:test'
import { nativeTargets, minimumVersion, acceptanceCases, artifactHash, verifyNativeAcceptance } from './native-acceptance.mjs'

test('release acceptance rejects missing, pending, stale, emulated, incomplete and different-artifact evidence', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'compatibility-acceptance-test-'))
  try {
    for (const format of ['es', 'lib', 'umd']) {
      await mkdir(resolve(root, `packages/maple-ui/${format}`), { recursive: true })
      await writeFile(resolve(root, `packages/maple-ui/${format}/index.js`), 'export const fixture = 1')
    }
    const path = resolve(root, 'native.json')
    await writeFile(resolve(root, 'evidence.txt'), 'TEST FIXTURE ONLY; not native acceptance evidence')
    const report = { library: 'maple', artifactSha256: await artifactHash(root, 'maple'), targets: nativeTargets('maple').map((id) => ({
      id, status: 'passed', evidenceType: 'native-browser-or-device', browserVersion: minimumVersion(id) ?? (id.endsWith('previous') ? 'fixture-previous' : 'fixture-current'),
      osVersion: 'fixture-os', device: 'fixture-device', tester: 'unit-test', testedAt: new Date().toISOString(),
      hostAppVersion: 'fixture-host', engineVersion: 'fixture-engine', versionSource: 'https://example.invalid/test-fixture',
      cases: Object.fromEntries(acceptanceCases('maple').map((name) => [name, 'passed'])), evidence: ['evidence.txt'],
    })) }
    const save = async (value) => writeFile(path, JSON.stringify(value))
    await assert.rejects(verifyNativeAcceptance(root, 'maple', path), /ENOENT/)
    await save(report)
    assert.equal((await verifyNativeAcceptance(root, 'maple', path)).passed, true)
    for (const [field, value, reason] of [
      ['status', 'pending', /pending/], ['evidenceType', 'emulation', /insufficient/],
      ['testedAt', '2020-01-01', /30 days/], ['evidence', ['missing.png'], /ENOENT/],
      ['browserVersion', 'fixture-previous', /distinct versions/], ['cases', {}, /pending or failed/],
    ]) {
      const changed = structuredClone(report)
      changed.targets[0][field] = value
      await save(changed)
      await assert.rejects(verifyNativeAcceptance(root, 'maple', path), reason)
    }
    await save(report)
    await writeFile(resolve(root, 'packages/maple-ui/umd/index.js'), 'changed UMD artifact')
    await assert.rejects(verifyNativeAcceptance(root, 'maple', path), /published JS\/CSS artifact/)
  } finally { await rm(root, { recursive: true, force: true }) }
})
