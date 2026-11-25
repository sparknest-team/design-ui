import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, open, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { productionFingerprint, sourceFingerprint } from '../inventory.mjs'
import { copyProductionSnapshot } from '../snapshot.mjs'
import { mergeSuccessfulRetry } from './merge.mjs'

const workspace = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..')
const evidence = resolve(
  process.env.DIRECTION_EVIDENCE_DIR ?? resolve(workspace, 'design-ui/audits/evidence/direction-closeout-2026-10-30'),
  'catalog',
)
const summary = []
for (const library of (process.env.DIRECTION_LIBRARIES ?? 'cedar,maple').split(',')) {
  const root = resolve(workspace, library === 'cedar' ? 'cedar-design-web' : 'maple-design-mobile')
  const source = sourceFingerprint(root, library),
    production = productionFingerprint(root, library)
  const output = resolve(root, `packages/ui/${library === 'cedar' ? 'dist' : 'site'}`)
  const build = createHash('sha256')
    .update(await readFile(resolve(output, 'index.html')))
    .digest('hex')
  let snapshot
  try {
    for (const direction of (process.env.DIRECTION_DIRECTIONS ?? 'ltr,rtl').split(',')) {
      for (const engine of (process.env.DIRECTION_ENGINES ?? 'chromium,firefox,webkit').split(',')) {
        const rawPath = resolve(evidence, direction, library, engine, 'coverage.json')
        const raw = JSON.parse(await readFile(rawPath, 'utf8'))
        assert.ok(raw.sourcesStable && raw.productionInputsStable, `rebuild/rerun unstable inputs: ${rawPath}`)
        assert.equal(raw.sourceFingerprint, source, 'cannot accept another source revision')
        assert.equal(raw.productionFingerprint, production, 'cannot accept another production input revision')
        assert.equal(raw.buildIndexHash, build, 'cannot accept another production build')
        assert.equal(raw.completedComponentCases, raw.expectedComponentCases)
        assert.equal(raw.results.length, raw.expectedComponentCases + raw.expectedGuideCases)
        let accepted = { ...raw, rawEvidence: rawPath, aggregateAcceptance: true },
          attempts = []
        for (let attempt = 1; attempt <= 2 && accepted.results.some((row) => !row.passed); attempt++) {
          if (!snapshot) {
            snapshot = await mkdtemp(resolve(tmpdir(), `direction-${library}-retry-`))
            await copyProductionSnapshot(output, snapshot)
          }
          const failed = accepted.results.filter((row) => !row.passed)
          const components = [...new Set(failed.filter((row) => row.kind !== 'guide').map((row) => row.component))]
          const directory = resolve(evidence, 'retries', `${Date.now()}-${library}-${direction}-${engine}-${attempt}`)
          await mkdir(directory, { recursive: true })
          const log = resolve(directory, 'run.log'),
            handle = await open(log, 'w')
          const exitCode = await new Promise((done, reject) => {
            const child = spawn(
              process.execPath,
              ['--test', resolve(workspace, 'design-ui/browser/reading-direction-catalog/catalog.test.mjs')],
              {
                cwd: workspace,
                stdio: ['ignore', handle.fd, handle.fd],
                env: {
                  ...process.env,
                  DIRECTION_LIBRARY: library,
                  DOCS_BROWSER: engine,
                  DOCS_READING_DIRECTION: direction,
                  DOCS_DIRECTION_CORE: '1',
                  DOCS_BROWSER_CONCURRENCY: '1',
                  DOCS_COMPONENTS: components.join(','),
                  DOCS_DIRECTION_SKIP_GUIDES: failed.some((row) => row.kind === 'guide') ? '0' : '1',
                  DOCS_PRODUCTION_SNAPSHOT: snapshot,
                  DOCS_BROWSER_EVIDENCE_DIR: directory,
                  CHOKIDAR_USEPOLLING: '1',
                },
              },
            )
            child.once('error', reject)
            child.once('exit', (code) => done(code ?? 1))
          })
          await handle.close()
          const retryPath = resolve(directory, library, engine, 'coverage.json')
          const retry = JSON.parse(await readFile(retryPath, 'utf8'))
          // A failed command cannot contribute a successful sibling by accident.
          if (exitCode === 0) accepted = mergeSuccessfulRetry(accepted, retry, retryPath)
          attempts.push({ attempt, exitCode, components, log, coverage: retryPath })
        }
        assert.ok(
          accepted.results.every((row) => row.passed),
          `remaining failed cases: ${library}/${direction}/${engine}`,
        )
        const acceptancePath = resolve(evidence, direction, library, engine, 'acceptance.json')
        await writeFile(acceptancePath, JSON.stringify({ ...accepted, retryRuns: attempts }, null, 2))
        summary.push({
          library,
          direction,
          engine,
          passed: true,
          rawEvidence: rawPath,
          acceptance: acceptancePath,
          retries: attempts.length,
        })
        await writeFile(
          resolve(evidence, `accepted-${(process.env.DIRECTION_LIBRARIES ?? 'cedar,maple').replaceAll(',', '-')}.json`),
          JSON.stringify(summary, null, 2),
        )
        console.log(JSON.stringify(summary.at(-1)))
      }
    }
    assert.equal(sourceFingerprint(root, library), source, 'source changed during acceptance')
    assert.equal(productionFingerprint(root, library), production, 'production inputs changed during acceptance')
  } finally {
    if (snapshot) await rm(snapshot, { recursive: true, force: true })
  }
}
