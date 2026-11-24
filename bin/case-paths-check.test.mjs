import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { resolveRelativeCase, trackedCaseDrift } from './case-paths-check.mjs'

test('detects wrong import casing even on a case-insensitive filesystem', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ui-case-import-'))
  try {
    await writeFile(join(root, 'Button.vue'), '<template><button /></template>')
    assert.equal(resolveRelativeCase(join(root, 'index.ts'), './Button.vue', root).matches, true)
    assert.equal(resolveRelativeCase(join(root, 'index.ts'), './button.vue', root).matches, false)
    await writeFile(join(root, 'Helper.ts'), 'export {}')
    assert.equal(resolveRelativeCase(join(root, 'index.ts'), './Helper.js', root).matches, true)
    assert.equal(resolveRelativeCase(join(root, 'index.ts'), './helper.js', root).matches, false)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('recording a case-only index rename preserves the staged blob and dirty file', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ui-case-index-'))
  const git = (args, input) => execFileSync('git', args, { cwd: root, input, encoding: 'utf8' })
  try {
    git(['init', '-q'])
    const oid = git(['hash-object', '-w', '--stdin'], 'staged content\n').trim()
    git(['update-index', '--add', '--cacheinfo', `100644,${oid},component.txt`])
    await writeFile(join(root, 'Component.txt'), 'unstaged content\n')
    assert.deepEqual(trackedCaseDrift(root), [{ tracked: 'component.txt', actual: 'Component.txt' }])
    git(['update-index', '-z', '--index-info'], `0 ${oid}\tcomponent.txt\0` + `100644 ${oid}\tComponent.txt\0`)
    assert.equal(git(['show', ':Component.txt']), 'staged content\n')
    assert.equal(await readFile(join(root, 'Component.txt'), 'utf8'), 'unstaged content\n')
    assert.deepEqual(trackedCaseDrift(root), [])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
