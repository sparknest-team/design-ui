import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm, readFile, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { nativeTargets, minimumVersion, acceptanceCases, createNativeReport, verifyNativeAcceptance, targetCatalog, targetCatalogSha256, assertStableChromeBinaries } from './native-acceptance.mjs'

async function fixture(library = 'maple') {
  const root = await mkdtemp(resolve(tmpdir(), 'native-acceptance-unit-'))
  for (const format of ['es', 'lib', 'umd']) {
    await mkdir(resolve(root, `packages/${library}-ui/${format}`), { recursive: true })
    await writeFile(resolve(root, `packages/${library}-ui/${format}/index.js`), 'export const fixture = 1')
  }
  const data = 'UNIT TEST FIXTURE ONLY; not actual native browser evidence'
  await writeFile(resolve(root, 'evidence.txt'), data)
  const report = await createNativeReport(root, library)
  for (const row of report.targets) {
    const target = targetCatalog[library][row.id]
    Object.assign(row, {
      status: 'passed', browserVersion: target.minimumVerifiedVersion?.includes('.') ? target.minimumVerifiedVersion : `${target.minimumVerifiedVersion ?? '111'}.0.0.0`,
      osVersion: target.osReleaseLine ?? '16.0', device: target.deviceModel ?? 'unit-test-device', tester: 'unit-test', testedAt: new Date().toISOString(),
      physicalDevice: true, environmentType: 'physical-device', hostAppVersion: '8.0.0', engineName: 'unit-test-engine', engineVersion: '111.0.0.0', engineVersionSource: 'unit-test-only',
      capabilities: Object.fromEntries(['colorMix', 'has', 'dvh', 'resizeObserver', 'intersectionObserver', 'visualViewport'].map(name => [name, true])),
      cases: Object.fromEntries(acceptanceCases(library).map(name => [name, 'passed'])), evidence: ['evidence.txt'],
      evidenceSha256: { 'evidence.txt': createHash('sha256').update(data).digest('hex') },
    })
    const environmentName = row.id + '-environment.json'
    const environment = JSON.stringify({ evidenceType: 'environment-probe', library, targetId: row.id,
      artifactSha256: report.artifactSha256, targetCatalogSha256, features: row.capabilities, claimedMetadata: { osVersion: row.osVersion, device: row.device, browserVersion: row.browserVersion, hostVersion: row.hostAppVersion, physicalDeviceAttestation: true }, unitTestFixture: true })
    await writeFile(resolve(root, environmentName), environment)
    row.environmentEvidence = environmentName
    row.evidence.push(environmentName)
    row.evidenceSha256[environmentName] = createHash('sha256').update(environment).digest('hex')
  }
  const path = resolve(root, 'native.json')
  const save = value => writeFile(path, JSON.stringify(value))
  return { root, path, report, save, remove: () => rm(root, { recursive: true, force: true }) }
}
test('version comparison cannot substitute two identical releases, old patches or Early Stable', () => {
  const valid = [{ version: '156.0.8078.73', executablePath: '/fixture/current' }, { version: '155.0.8059.79', executablePath: '/fixture/previous' }]
  assertStableChromeBinaries(valid)
  assert.throws(() => assertStableChromeBinaries([valid[0], valid[0]]), /duplicate/)
  assert.throws(() => assertStableChromeBinaries([{ ...valid[0], version: '157.0.8103.30' }, valid[1]]), /Early Stable/)
  assert.throws(() => assertStableChromeBinaries([{ ...valid[0], version: '156.0.8078.48' }, valid[1]]), /predates/)
})

test('mobile release acceptance binds platform, exact release line, capabilities, physical devices and evidence hashes', async () => {
  const f = await fixture()
  try {
    await assert.rejects(verifyNativeAcceptance(f.root, 'maple', f.path), /ENOENT/)
    await f.save(f.report)
    assert.equal((await verifyNativeAcceptance(f.root, 'maple', f.path)).passed, true)
    for (const [field, value, reason] of [
      ['status', 'pending', /pending/], ['evidenceType', 'emulation', /insufficient/],
      ['testedAt', '2020-01-01', /30 days/], ['evidence', ['missing.png'], /ENOENT/],
      ['browserVersion', '26.6', /version line/], ['cases', {}, /pending or failed/],
      ['platform', 'desktop', /wrong platform/], ['physicalDevice', false, /physical mobile/],
      ['environmentType', 'simulator', /simulators/], ['capabilities', {}, /capability/],
      ['environmentEvidence', '', /raw environment/], ['evidenceSha256', {}, /evidence hash/], ['evidence', ['../outside.txt'], /inside/],
      ['osVersion', '16.4', /wrong iOS/], ['versionSource', 'https://example.invalid', /official/],
    ]) {
      const changed = structuredClone(f.report)
      changed.targets[0][field] = value
      await f.save(changed)
      await assert.rejects(verifyNativeAcceptance(f.root, 'maple', f.path), reason)
    }
    for (const [id, field, value, reason] of [
      ['android-chrome-current', 'browserVersion', '156.0.8078.48', /older/],
      ['android-chrome-previous', 'browserVersion', '156.0.8078.74', /version line/],
      ['ios-safari-minimum', 'browserVersion', '18.4', /version line/],
      ['ios-safari-previous', 'device', 'ordinary iPhone', /iPhone Duo/],
      ['wechat-android', 'engineVersionSource', '', /verified/],
      ['wechat-ios', 'hostAppVersion', '', /host app/],
      ['android-webview-minimum', 'engineName', '', /actual WebView/],
    ]) {
      const changed = structuredClone(f.report)
      changed.targets.find(row => row.id === id)[field] = value
      await f.save(changed)
      await assert.rejects(verifyNativeAcceptance(f.root, 'maple', f.path), reason)
    }
    await f.save({ ...f.report, targetCatalogSha256: 'old-catalog' })
    await assert.rejects(verifyNativeAcceptance(f.root, 'maple', f.path), /catalog changed/)
    await f.save(f.report)
    await writeFile(resolve(f.root, 'evidence.txt'), 'changed evidence')
    await assert.rejects(verifyNativeAcceptance(f.root, 'maple', f.path), /evidence hash/)
    await writeFile(resolve(f.root, 'evidence.txt'), '')
    await assert.rejects(verifyNativeAcceptance(f.root, 'maple', f.path), /nonempty/)
  } finally { await f.remove() }
})

test('desktop acceptance requires all four minimum boundaries and rejects changed artifacts or expired version locks', async () => {
  const f = await fixture('cedar')
  const checkedAt = targetCatalog.checkedAt
  try {
    assert.equal(nativeTargets('cedar').length, 12)
    for (const [name, version] of [['chrome', '111'], ['edge', '111'], ['firefox', '121'], ['safari', '16.4']]) assert.equal(minimumVersion(`${name}-minimum`), version)
    await f.save(f.report)
    assert.equal((await verifyNativeAcceptance(f.root, 'cedar', f.path)).passed, true)
    targetCatalog.checkedAt = '2020-01-01'
    await assert.rejects(verifyNativeAcceptance(f.root, 'cedar', f.path), /Refresh official/)
    targetCatalog.checkedAt = checkedAt
    await writeFile(resolve(f.root, 'packages/cedar-ui/umd/index.js'), 'changed artifact')
    await assert.rejects(verifyNativeAcceptance(f.root, 'cedar', f.path), /published JS\/CSS artifact/)
  } finally { targetCatalog.checkedAt = checkedAt; await f.remove() }
})


test('native report rejects contradictory physical attestation and symlink evidence escaping the report directory', async () => {
  const f = await fixture()
  try {
    const row = f.report.targets[0], probePath = resolve(f.root, row.environmentEvidence)
    const environment = JSON.parse(await readFile(probePath, 'utf8'))
    environment.claimedMetadata.physicalDeviceAttestation = false
    const bytes = JSON.stringify(environment)
    await writeFile(probePath, bytes)
    row.evidenceSha256[row.environmentEvidence] = createHash('sha256').update(bytes).digest('hex')
    await f.save(f.report)
    await assert.rejects(verifyNativeAcceptance(f.root, 'maple', f.path), /attest a physical/)
    await symlink('/etc/hosts', resolve(f.root, 'outside-link'))
    row.evidence.unshift('outside-link')
    await f.save(f.report)
    await assert.rejects(verifyNativeAcceptance(f.root, 'maple', f.path), /inside/)
  } finally { await f.remove() }
})
