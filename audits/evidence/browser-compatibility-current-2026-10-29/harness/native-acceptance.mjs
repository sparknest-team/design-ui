import assert from 'node:assert/strict'
import { browserTargets } from '../packages/ui-build/src/browser-targets.mjs'
import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile, mkdir, stat } from 'node:fs/promises'
import { resolve, relative, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

export function nativeTargets(library) {
  assert.ok(['cedar', 'maple'].includes(library))
  return library === 'cedar'
    ? ['chrome-current', 'chrome-previous', 'edge-current', 'edge-previous', 'firefox-current', 'firefox-previous', 'safari-current', 'safari-previous']
    : ['ios-safari-current', 'ios-safari-previous', 'ios-safari-minimum', 'android-chrome-current', 'android-chrome-previous', 'android-chrome-minimum', 'android-webview-minimum', 'wechat-ios', 'wechat-android', 'app-wkwebview', 'app-android-webview']
}
export function minimumVersion(id) {
  if (!id.endsWith('-minimum')) return null
  const engine = id.startsWith('ios-') ? 'safari' : 'chrome'
  return browserTargets.find((target) => target.startsWith(engine)).slice(engine.length)
}
export function acceptanceCases(library) {
  return library === 'cedar'
    ? ['input-ime-autofill', 'keyboard-focus', 'popup-position-scroll-lock', 'date-selection', 'upload', 'light-dark-layout']
    : ['tap-drag-swipe-longpress', 'input-ime-autofill', 'native-keyboard-visibility', 'popup-position-scroll-lock', 'nested-scroll', 'orientation-address-bar-viewport', 'safe-area-teleport', 'upload-camera', 'light-dark-layout']
}
export async function artifactHash(root, library) {
  const directory = resolve(root, `packages/${library}-ui`)
  const files = []
  async function walk(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const file = resolve(path, entry.name)
      if (entry.isDirectory()) await walk(file)
      else if (/\.(m?js|css)$/.test(entry.name)) files.push(file)
    }
  }
  for (const format of ['es', 'lib', 'umd']) await walk(resolve(directory, format))
  assert.ok(files.length > 0, 'build the published library before native acceptance')
  const hash = createHash('sha256')
  for (const file of files.sort()) hash.update(relative(directory, file).replaceAll('\\', '/')).update('\0').update(await readFile(file)).update('\0')
  return hash.digest('hex')
}
export async function verifyNativeAcceptance(root, library, path = resolve(root, 'artifacts/compatibility/native-acceptance.json')) {
  const report = JSON.parse(await readFile(path, 'utf8'))
  assert.equal(report.library, library)
  assert.equal(report.artifactSha256, await artifactHash(root, library), 'native acceptance must match the published JS/CSS artifact')
  assert.ok(Array.isArray(report.targets))
  const ids = nativeTargets(library)
  assert.equal(report.targets.length, ids.length, 'every native target is required exactly once')
  for (const id of ids) {
    const rows = report.targets.filter((row) => row.id === id)
    assert.equal(rows.length, 1, `${id}: missing or duplicate target`)
    const row = rows[0]
    assert.equal(row.status, 'passed', `${id}: native acceptance is pending or failed`)
    for (const key of ['browserVersion', 'osVersion', 'device', 'tester']) assert.ok(typeof row[key] === 'string' && row[key].trim(), `${id}: ${key} is required`)
    const minimum = minimumVersion(id)
    if (minimum) assert.ok(row.browserVersion === minimum || row.browserVersion.startsWith(minimum + '.'), `${id}: test the declared minimum ${minimum}, not a newer engine`)
    assert.equal(row.evidenceType, 'native-browser-or-device', `${id}: engine emulation is insufficient`)
    const age = Date.now() - Date.parse(row.testedAt)
    assert.ok(Number.isFinite(age) && age >= 0 && age <= 30 * 86400000, `${id}: native evidence must be within 30 days`)
    if (id.includes('wechat') || id.includes('app-')) {
      assert.ok(row.hostAppVersion?.trim(), `${id}: host app version is required`)
      assert.ok(row.engineVersion?.trim(), `${id}: embedded engine version is required`)
    }
    for (const name of acceptanceCases(library)) assert.equal(row.cases?.[name], 'passed', `${id}: ${name} is pending or failed`)
    assert.ok(Array.isArray(row.evidence) && row.evidence.length > 0, `${id}: attach screenshots/video/test report`)
    for (const evidence of row.evidence) assert.ok((await stat(resolve(dirname(path), evidence))).isFile(), `${id}: evidence must be an existing file`)
    if (id.endsWith('-current')) {
      const previous = report.targets.find((item) => item.id === id.replace(/-current$/, '-previous'))
      assert.notEqual(row.browserVersion, previous?.browserVersion, `${id}: current and previous must be distinct versions`)
      assert.ok(/^https:\/\//.test(row.versionSource ?? ''), `${id}: record the official release-version source`)
    }
  }
  return { library, targets: ids.length, artifactSha256: report.artifactSha256, passed: true }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [library, mode] = process.argv.slice(2)
  const root = process.cwd()
  const path = resolve(root, 'artifacts/compatibility/native-acceptance.json')
  if (mode === '--init') {
    const report = { library, artifactSha256: await artifactHash(root, library), targets: nativeTargets(library).map((id) => ({
      id, requiredMinimumVersion: minimumVersion(id), status: 'pending', evidenceType: 'native-browser-or-device', browserVersion: '', osVersion: '', device: '', tester: '', testedAt: '',
      versionSource: '', hostAppVersion: '', engineVersion: '', cases: Object.fromEntries(acceptanceCases(library).map((name) => [name, 'pending'])), evidence: [],
    })) }
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
    console.log(`Native acceptance template: ${path}`)
  } else {
    assert.equal(mode, undefined, 'Usage: native-acceptance.mjs cedar|maple [--init]')
    console.log(JSON.stringify(await verifyNativeAcceptance(root, library)))
  }
}
