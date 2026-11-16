import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('../../', import.meta.url))
const read = file => readFileSync(resolve(root, file), 'utf8')
assert.equal(
  read('cedar-design-web/packages/use/src/useDirection.ts'),
  read('maple-design-mobile/packages/use/src/useDirection.ts'),
  'Reading-direction inheritance, SSR and lifecycle rules must stay identical across use packages',
)
console.log('Reading-direction composables are identical across both platforms.')
assert.equal(read('cedar-design-web/packages/ui/src/_utils/temporal-keyboard.ts'), read('maple-design-mobile/packages/ui/src/_utils/temporal-keyboard.ts'), 'Temporal keyboard direction rules must stay identical across both platforms')

if (!process.argv.includes('--source-only')) {
  const jobs = [
    ['cedar-design-web', ['check:direction']],
    ['maple-design-mobile', ['check:direction']],
    ['cedar-design-web/packages/ui', ['exec', 'vitest', 'run', 'src/menu/__tests__/reading-direction.spec.ts', 'src/image/__tests__/reading-direction.spec.ts', 'src/verification-code/__tests__/reading-direction.spec.ts', 'src/carousel/__tests__/loop-direction.spec.ts', '--maxWorkers=1', '--no-file-parallelism']],
    ['maple-design-mobile/packages/ui', ['exec', 'vitest', 'run', 'src/menu/__tests__/reading-direction.spec.ts', 'src/image/__tests__/reading-direction.spec.ts', 'src/verification-code/__tests__/reading-direction.spec.ts', 'src/carousel/__tests__/loop-direction.spec.ts', '--config', 'reading-direction.vitest.config.mjs', '--maxWorkers=1', '--minWorkers=1']],
    ['cedar-design-web/packages/ui', [
      'exec', 'vitest', 'run', '--root', resolve(root, 'design-ui/packages/ui-doc-preview'),
      '--config', resolve(root, 'design-ui/packages/ui-doc-preview/vitest.direction.config.mjs'), '--maxWorkers=1', '--no-file-parallelism',
    ]],
  ]
  for (const [directory, args] of jobs) {
    const result = spawnSync('pnpm', args, {
      cwd: resolve(root, directory), stdio: 'inherit',
      env: { ...process.env, CHOKIDAR_USEPOLLING: '1' },
    })
    if (result.error) throw result.error
    if (result.status !== 0) process.exit(result.status ?? 1)
  }
}
