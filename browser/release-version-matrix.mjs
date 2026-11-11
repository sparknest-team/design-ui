import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { openSync, closeSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { artifactHash, targetCatalog, assertStableChromeBinaries } from './native-acceptance.mjs'

const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const configPath = resolve(process.argv[2] ?? '')
assert.ok(process.argv[2], 'Usage: release-version-matrix.mjs config.json')
const config = JSON.parse(await readFile(configPath, 'utf8'))
assertStableChromeBinaries(config.browsers)
const acceptedBytes = await readFile(config.acceptedManifest)
const accepted = JSON.parse(acceptedBytes)
const output = resolve(config.output)
await mkdir(output, { recursive: false })
const summary = { generatedAt: new Date().toISOString(), scope: 'Version comparison of the previously quality-accepted artifact; excludes later unbuilt working-tree changes.',
  acceptedQualityManifestSha256: digest(acceptedBytes), acceptedQualityGeneratedAt: accepted.generatedAt,
  nativeDeviceAcceptance: false, latestTwoVersionsAccepted: false, results: [] }
for (const library of ['maple', 'cedar']) {
  const root = resolve(config.roots[library]), provenance = accepted.repositories.find(row => row.library === library)
  assert.ok(provenance && provenance.fullQualityExitCode === 0)
  assert.equal(await artifactHash(root, library), provenance.publishedJsCssSha256, 'Accepted published artifact mismatch')
  assert.equal(digest(await readFile(resolve(root, `packages/ui/${library === 'cedar' ? 'dist' : 'site'}/index.html`))), provenance.buildIndexHash)
  for (const binary of config.browsers) {
    const line = binary.version.split('.')[0]
    assert.ok(['chrome-current', 'chrome-previous'].some(id => targetCatalog.cedar[id].releaseLine === line), 'Only the officially locked Stable release lines are accepted')
    const directory = resolve(output, `${library}-chrome-${binary.version}`)
    await mkdir(directory)
    const logPath = resolve(directory, 'run.log'), fd = openSync(logPath, 'w')
    console.log(JSON.stringify({ library, version: binary.version, status: 'running', logPath }))
    const code = await new Promise((done, reject) => {
      const child = spawn(process.execPath, [resolve(config.harnessRoot ?? dirname(fileURLToPath(import.meta.url)), 'matrix.mjs'), library, 'chrome'], {
        cwd: root, stdio: ['ignore', fd, fd], env: { ...process.env, DOCS_BROWSER_EXECUTABLE_PATH: binary.executablePath,
          DOCS_BROWSER_EXPECTED_VERSION: binary.version, DOCS_BROWSER_CONCURRENCY: '1', DOCS_BROWSER_EVIDENCE_DIR: directory },
      })
      child.once('error', reject); child.once('exit', value => done(value ?? 1))
    }).finally(() => closeSync(fd))
    let verified, failure
    try {
      const matrix = JSON.parse(await readFile(resolve(directory, library, 'compatibility-chrome.json')))
      const item = matrix.results[0]
      assert.equal(code, 0); assert.equal(item.passed, true)
      assert.equal(item.verified.browser.version, binary.version)
      verified = item.verified
    } catch (error) { failure = String(error) }
    const result = { library, version: binary.version, exitCode: code, passed: !!verified,
      cases: verified ? verified.componentCases + verified.guideCases + verified.navigationCases + 1 : null,
      codeSourceFingerprint: provenance.sourceFingerprint, codeProductionFingerprint: provenance.productionFingerprint,
      artifactSha256: provenance.publishedJsCssSha256, buildIndexHash: provenance.buildIndexHash,
      executableSha256: digest(await readFile(binary.executablePath)), archiveSha256: binary.archivePath ? digest(await readFile(binary.archivePath)) : undefined,
      downloadURL: binary.downloadURL, officialReleaseSource: binary.officialReleaseSource, log: logPath, failure,
      platformScope: library === 'maple' ? 'Desktop Chrome for Testing with emulated mobile contexts; NOT Android Chrome, iOS Safari, WeChat or App WebView.' : 'Desktop Chrome for Testing component regression; native IME/manual acceptance still separate.' }
    for (const file of ['coverage.json', 'navigation-outage.json', 'engine-capabilities.json']) {
      const path = resolve(directory, library, 'chrome', file)
      try {
        const raw = JSON.parse(await readFile(path, 'utf8'))
        raw.validationScope = 'Quality-accepted artifact version comparison'
        raw.sourceFingerprintMeaning = 'Immutable browser-test input snapshot, not the source that built the artifact'
        raw.compiledSourceFingerprint = provenance.sourceFingerprint
        await writeFile(path, JSON.stringify(raw, null, 2) + '\n')
      } catch (error) { if (code === 0) throw error }
    }
    summary.results.push(result)
    summary.complete = summary.results.length === 4 && summary.results.every(row => row.passed)
    summary.totalCases = summary.results.reduce((sum, row) => sum + (row.cases ?? 0), 0)
    await writeFile(resolve(output, 'version-summary.json'), JSON.stringify(summary, null, 2) + '\n')
    console.log(JSON.stringify({ library, version: binary.version, passed: result.passed, cases: result.cases }))
  }
}
if (!summary.complete) process.exitCode = 1
