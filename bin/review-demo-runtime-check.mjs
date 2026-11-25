import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const project = path.join(root, 'design-ui/packages/ui-doc-preview')
const report = path.join(
  process.env.DEMO_AUDIT_REPORT_DIR ?? path.join(root, 'design-ui/audits/evidence/demo-recheck-2026-10-21'),
  'runtime.json',
)
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/audits/demo-review-cases.json'), 'utf8'))
const inventory = manifest.flatMap((owner) =>
  owner.cases.map((item) => ({
    ...item,
    platform: owner.platform,
    component: owner.component,
    full: owner.directory + '/' + item.file,
  })),
)
const old = fs.existsSync(report) ? JSON.parse(fs.readFileSync(report, 'utf8')) : []
const resume = process.argv.includes('--resume')
const services = process.argv.includes('--services')
const components = process.argv
  .find((arg) => arg.startsWith('--components='))
  ?.slice(13)
  .split(',')
const verify = process.argv.includes('--verify')
const methods = process.argv.includes('--methods')
const seenMethods = new Set()
const batchSize = Number(process.env.DEMO_AUDIT_BATCH_SIZE ?? 25)
let failed = false
if (!verify)
  for (const platform of ['cedar', 'maple']) {
    const selected = inventory.filter(
      (item) =>
        item.platform === platform &&
        (!components || components.includes(platform + '/' + item.component)) &&
        (!services || item.name === 'service') &&
        (!resume || !old.some((row) => row.file.endsWith(item.full) && row.status === 'passed')),
    )
    const files = selected
      .filter((item) => {
        if (!methods) return true
        const config = JSON.parse(
          fs.readFileSync(
            path.join(
              root,
              item.full.replace(/api-review-main\.vue$/, 'api-review.vue').replace(/\.vue$/, '.config.json'),
            ),
            'utf8',
          ),
        )
        const key = platform + ':' + item.tag
        if (
          item.name === 'service' ||
          (item.component === 'code' && item.name === 'main') ||
          seenMethods.has(key) ||
          (!config.methodNames?.length && item.component !== 'code')
        )
          return false
        seenMethods.add(key)
        return true
      })
      .map((item) => item.full)
    for (let batch = 0; batch < Math.ceil(files.length / batchSize); batch++) {
      console.log(
        `Checking ${platform} review cases ${batch * batchSize + 1}–${Math.min((batch + 1) * batchSize, files.length)} / ${files.length}`,
      )
      const result = spawnSync(
        path.join(root, 'cedar-design-web/node_modules/.bin/vitest'),
        [
          'run',
          'test/demo-matrix.test.ts',
          '--root',
          project,
          '--config',
          path.join(project, 'vitest.matrix.config.mjs'),
          '--threads',
          'false',
          '--reporter',
          'verbose',
        ],
        {
          cwd: root,
          env: {
            ...process.env,
            NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --max-old-space-size=2048`,
            DEMO_AUDIT_PLATFORM: platform,
            DEMO_AUDIT_FILES: JSON.stringify(files),
            DEMO_AUDIT_BATCH: String(batch),
            DEMO_AUDIT_BATCH_SIZE: String(batchSize),
            ...(services ? { DEMO_AUDIT_SERVICE_ACTIONS: '1' } : {}),
          },
          stdio: 'inherit',
        },
      )
      if (result.status !== 0) failed = true
    }
  }
const results = JSON.parse(fs.readFileSync(report, 'utf8'))
const current = results.filter((row) => inventory.some((item) => row.file.endsWith(item.full)))
const missing = inventory.filter(
  (item) => !current.some((row) => row.file.endsWith(item.full) && row.status === 'passed'),
)
if (failed || missing.length) {
  console.error(JSON.stringify({ missing: missing.map((item) => item.full), failedProcess: failed }, null, 2))
  throw new Error('Incomplete or failed review case matrix')
}
console.log(
  `Validated ${current.length} review cases and ${current.reduce((n, row) => n + row.fields.length, 0)} real property controllers`,
)
