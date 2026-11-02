import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { sourceFingerprint, productionFingerprint } from './inventory.mjs'
import { validateEngineEvidence } from './evidence.mjs'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { browserProfile, evidenceDirectory } from './compatibility.mjs'

const args = process.argv.slice(2).filter((value) => value !== '--')
const library = args[0]
if (!['cedar', 'maple'].includes(library)) throw new Error('Usage: node matrix.mjs cedar|maple [chromium,firefox,webkit,chrome,msedge]')
const summarizeOnly = args[1] === '--summarize'
const profiles = (summarizeOnly ? 'chromium,firefox,webkit' : args[1] ?? 'chromium,firefox,webkit').split(',').map(browserProfile)
const root = process.cwd()
const results = []
for (const profile of profiles) {
  const startedAt = new Date().toISOString()
  const code = summarizeOnly ? null : await new Promise((done, reject) => {
    const child = spawn(process.execPath, ['--test', '--test-concurrency=1', resolve(import.meta.dirname, 'engine-input.test.mjs'), 'scripts/browser/components.test.mjs'], {
      cwd: root, stdio: 'inherit', env: { ...process.env, DOCS_BROWSER: profile.name, COMPATIBILITY_LIBRARY: library },
    })
    child.on('error', reject)
    child.on('exit', (code) => done(code ?? 1))
  })
  const evidence = evidenceDirectory(root, library, profile.name)
  let verified, error
  try {
    const [coverage, navigation, capabilities] = await Promise.all(['coverage.json', 'navigation-outage.json', 'engine-capabilities.json']
      .map(async (name) => JSON.parse(await readFile(resolve(evidence, name), 'utf8'))))
    const output = resolve(root, `packages/${library}-ui/${library === 'cedar' ? 'dist' : 'site'}/index.html`)
    verified = validateEngineEvidence({ coverage, navigation, capabilities }, {
      library, name: profile.name, buildIndexHash: createHash('sha256').update(await readFile(output)).digest('hex'),
      sourceFingerprint: sourceFingerprint(root, library), productionFingerprint: productionFingerprint(root, library),
    })
  } catch (failure) { error = String(failure) }
  results.push({ name: profile.name, startedAt, completedAt: new Date().toISOString(),
    passed: (summarizeOnly || code === 0) && !!verified, exitCode: code, evidence, verified, error })
}
const directory = resolve(process.env.DOCS_BROWSER_EVIDENCE_DIR ?? resolve(root, 'artifacts/docs-components'), library)
await mkdir(directory, { recursive: true })
const reportName = !summarizeOnly && profiles.length === 1 ? `compatibility-${profiles[0].name}.json` : 'compatibility-matrix.json'
await writeFile(resolve(directory, reportName), JSON.stringify({
  library, generatedAt: new Date().toISOString(), nativeDeviceAcceptance: false,
  latestTwoVersionsAccepted: false,
  completeEngineMatrix: ['chromium', 'firefox', 'webkit'].every((name) => results.some((item) => item.name === name && item.passed)),
  evidenceOnly: summarizeOnly, results,
}, null, 2))
if (results.some((result) => !result.passed)) process.exitCode = 1
