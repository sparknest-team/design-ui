import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('../../', import.meta.url))
// Use real Teleport, not a stub. These DOM/lifecycle checks are deliberately
// separate from browser computed styles, iframe focus and responsive layout.
for (const [repo, pkg, config, workerArgs] of [
  ['cedar-design-web', 'ui', 'vitest.choice-validation.config.mts', []],
  ['maple-design-mobile', 'ui', '../cli/lib/node/config/vitest.config.js', ['--maxWorkers=1', '--minWorkers=1']],
]) {
  const cwd = resolve(root, repo, 'packages', pkg)
  const runner = resolve(cwd, 'node_modules/vitest/vitest.mjs')
  assert.ok(existsSync(runner), `${repo}: installed Vitest is required`)
  const result = spawnSync(process.execPath, [runner, 'run', '--config', config,
    'src/__tests__/foundation/portal-scope.spec.js', 'src/trigger/__tests__/container-contract.spec.js',
    'src/__tests__/foundation/modal-focus.spec.js', 'src/__tests__/foundation/layers.spec.js',
    'src/__tests__/foundation/scroll-lock.spec.js',
    'src/__tests__/foundation/popup-transition.spec.js',
    ...workerArgs], { cwd, stdio: 'inherit' })
  if (result.error) throw result.error
  assert.equal(result.status, 0, `${repo}: portal scope regressions failed`)
}
console.log('Both portal scope contracts passed: real DOM targets, state preservation, foreign-document validation/event ownership and cleanup. Not browser visual acceptance.')
