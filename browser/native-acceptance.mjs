import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile, mkdir, stat, realpath } from 'node:fs/promises'
import { resolve, relative, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

export const targetCatalog = JSON.parse(readFileSync(new URL('../configs/native-browser-targets.json', import.meta.url), 'utf8'))
export const targetCatalogSha256 = createHash('sha256').update(JSON.stringify(targetCatalog)).digest('hex')
export function nativeTargets(library) {
  assert.ok(['cedar', 'maple'].includes(library))
  return Object.keys(targetCatalog[library])
}
export function minimumVersion(id) {
  if (!id.endsWith('-minimum')) return null
  const target = targetCatalog.cedar[id] ?? targetCatalog.maple[id]
  assert.ok(target, `Unknown minimum target: ${id}`)
  return target.releaseLine
}
function onLine(version, line) { return version === line || version.startsWith(line + '.') }
function compareVersions(left, right) {
  const a = left.split('.').map(Number), b = right.split('.').map(Number)
  for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) - (b[i] ?? 0)
  return 0
}
export function assertStableChromeBinaries(binaries) {
  const targets = ['chrome-current', 'chrome-previous'].map(id => targetCatalog.cedar[id])
  assert.equal(binaries.length, 2, 'Exactly two Stable release lines are required')
  assert.deepEqual(binaries.map(row => row.version.split('.')[0]).sort(), targets.map(row => row.releaseLine).sort(), 'Do not duplicate one release or substitute Early Stable/Beta')
  for (const binary of binaries) {
    assert.match(binary.version, /^\d+\.\d+\.\d+\.\d+$/)
    const target = targets.find(item => onLine(binary.version, item.releaseLine))
    assert.ok(target && compareVersions(binary.version, target.minimumVerifiedVersion) >= 0, 'The binary predates the checked Stable patch')
    assert.ok(typeof binary.executablePath === 'string' && binary.executablePath.trim())
  }
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
  assert.equal(report.schemaVersion, 2, 'Regenerate the native report using the current target catalog')
  assert.equal(report.targetCatalogSha256, targetCatalogSha256, 'Native target catalog changed; refresh the version lock and retest')
  const catalogAge = Date.now() - Date.parse(targetCatalog.checkedAt)
  assert.ok(catalogAge >= 0 && catalogAge <= targetCatalog.validDays * 86400000, 'Refresh official release versions before native acceptance')
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
    const target = targetCatalog[library][id]
    assert.equal(row.platform, target.platform, `${id}: wrong platform; desktop emulation is insufficient`)
    assert.equal(row.browserFamily, target.browserFamily, `${id}: wrong browser or host family`)
    if (target.releaseLine) {
      assert.match(row.browserVersion, /^\d+(?:\.\d+){1,3}$/, `${id}: record an actual numeric browser version`)
      assert.ok(onLine(row.browserVersion, target.releaseLine), `${id}: test the declared version line ${target.releaseLine}, not another engine`)
      assert.ok(compareVersions(row.browserVersion, target.minimumVerifiedVersion) >= 0, `${id}: patch is older than the officially checked release`)
      assert.equal(row.versionSource, target.versionSource, `${id}: use the pinned official release source`)
    }
    if (target.osReleaseLine) assert.ok(onLine(row.osVersion, target.osReleaseLine), `${id}: wrong iOS release line`)
    if (target.deviceModel) assert.ok(row.device.includes(target.deviceModel), `${id}: this Safari release requires ${target.deviceModel}`)
    if (library === 'maple') {
      assert.equal(row.physicalDevice, true, `${id}: a physical mobile device is required`)
      assert.equal(row.environmentType, 'physical-device', `${id}: simulators and desktop UA emulation are insufficient`)
    }
    for (const capability of ['colorMix', 'has', 'dvh', 'resizeObserver', 'intersectionObserver', 'visualViewport']) {
      assert.equal(row.capabilities?.[capability], true, `${id}: missing or unsupported capability ${capability}`)
    }
    assert.equal(row.evidenceType, 'native-browser-or-device', `${id}: engine emulation is insufficient`)
    const age = Date.now() - Date.parse(row.testedAt)
    assert.ok(Number.isFinite(age) && age >= 0 && age <= 30 * 86400000, `${id}: native evidence must be within 30 days`)
    if (target.requiresHost) {
      assert.ok(row.hostAppVersion?.trim(), `${id}: host app version is required`)
      assert.ok(row.engineVersion?.trim(), `${id}: embedded engine version is required`)
      assert.ok(row.engineName?.trim(), `${id}: identify the actual WebView engine`)
      assert.ok(row.engineVersionSource?.trim(), `${id}: record how the embedded engine version was verified`)
    }
    for (const name of acceptanceCases(library)) assert.equal(row.cases?.[name], 'passed', `${id}: ${name} is pending or failed`)
    assert.ok(Array.isArray(row.evidence) && row.evidence.length > 0, `${id}: attach screenshots/video/test report`)
    for (const evidence of row.evidence) {
      assert.ok(typeof evidence === 'string' && evidence.trim() && !evidence.startsWith('/'), `${id}: use relative evidence paths`)
      const candidate = resolve(dirname(path), evidence)
      assert.ok(candidate.startsWith(resolve(dirname(path)) + '/'), `${id}: evidence must stay inside the report directory`)
      const file = await realpath(candidate)
      assert.ok(file.startsWith((await realpath(dirname(path))) + '/'), `${id}: evidence must stay inside the report directory`)
      const info = await stat(file)
      assert.ok(info.isFile() && info.size > 0, `${id}: evidence must be a nonempty existing file`)
      assert.equal(row.evidenceSha256?.[evidence], createHash('sha256').update(await readFile(file)).digest('hex'), `${id}: evidence hash changed or is missing`)
    }
    assert.ok(row.environmentEvidence && row.evidence.includes(row.environmentEvidence), `${id}: attach the raw environment probe report`)
    const environmentPath = resolve(dirname(path), row.environmentEvidence)
    assert.ok(environmentPath.startsWith(resolve(dirname(path)) + '/'), `${id}: environment evidence must stay inside the report directory`)
    const environment = JSON.parse(await readFile(environmentPath, 'utf8'))
    assert.equal(environment.evidenceType, 'environment-probe', `${id}: raw environment probe required`)
    assert.equal(environment.library, library, `${id}: environment library mismatch`)
    assert.equal(environment.targetId, id, `${id}: environment target mismatch`)
    assert.equal(environment.artifactSha256, report.artifactSha256, `${id}: environment artifact mismatch`)
    assert.equal(environment.targetCatalogSha256, targetCatalogSha256, `${id}: environment version lock mismatch`)
    assert.deepEqual(environment.features, row.capabilities, `${id}: capabilities differ from raw environment evidence`)
    for (const [key, value] of [['osVersion', row.osVersion], ['device', row.device], ['browserVersion', row.browserVersion]]) {
      assert.equal(environment.claimedMetadata?.[key], value, `${id}: ${key} differs from raw environment evidence`)
    }
    if (library === 'maple') assert.equal(environment.claimedMetadata?.physicalDeviceAttestation, true, `${id}: raw environment must attest a physical device`)
    if (target.requiresHost) assert.equal(environment.claimedMetadata?.hostVersion, row.hostAppVersion, `${id}: host version differs from raw environment evidence`)
    if (id.endsWith('-current')) {
      const previous = report.targets.find((item) => item.id === id.replace(/-current$/, '-previous'))
      assert.notEqual(row.browserVersion, previous?.browserVersion, `${id}: current and previous must be distinct versions`)
      assert.ok(/^https:\/\//.test(row.versionSource ?? ''), `${id}: record the official release-version source`)
    }
  }
  return { library, targets: ids.length, artifactSha256: report.artifactSha256, passed: true }
}

export async function createNativeReport(root, library) {
  return { schemaVersion: 2, library, generatedAt: new Date().toISOString(), targetCatalogSha256,
    artifactSha256: await artifactHash(root, library), targets: nativeTargets(library).map((id) => {
      const target = targetCatalog[library][id]
      return { id, requiredVersionLine: target.releaseLine, requiredMinimumVersion: minimumVersion(id),
        platform: target.platform, browserFamily: target.browserFamily,
        deviceRequirement: target.deviceRequirement ?? '', physicalDevice: false, environmentType: '',
        status: 'pending', evidenceType: 'native-browser-or-device', browserVersion: '', osVersion: '', device: '', tester: '', testedAt: '',
        versionSource: target.versionSource ?? '', hostAppVersion: '', engineName: '', engineVersion: '', engineVersionSource: '',
        capabilities: {}, environmentEvidence: '', cases: Object.fromEntries(acceptanceCases(library).map((name) => [name, 'pending'])), evidence: [], evidenceSha256: {} }
    }) }
}
if (process.argv[1] && import.meta.url === pathToFileURL(await realpath(resolve(process.argv[1]))).href) {
  const [library, ...args] = process.argv.slice(2)
  const init = args.includes('--init'), reportAt = args.indexOf('--report')
  const allowed = new Set(['--init', '--report'])
  assert.ok(args.every((arg, index) => allowed.has(arg) || index === reportAt + 1 && reportAt >= 0), 'Usage: native-acceptance.mjs cedar|maple [--init] [--report path]')
  if (reportAt >= 0) assert.ok(args[reportAt + 1] && !args[reportAt + 1].startsWith('--'), '--report needs a path')
  const root = process.cwd()
  const path = resolve(reportAt >= 0 ? args[reportAt + 1] : resolve(root, 'artifacts/compatibility/native-acceptance.json'))
  if (init) {
    const report = await createNativeReport(root, library)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
    console.log(`Native acceptance template: ${path}`)
  } else console.log(JSON.stringify(await verifyNativeAcceptance(root, library, path)))
}
