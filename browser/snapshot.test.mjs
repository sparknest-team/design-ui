import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import test from 'node:test'
import { copyProductionSnapshot, readProductionSnapshot } from './snapshot.mjs'

test('accepted snapshot bytes remain exact after source rebuilds and later file writes', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'production-bytes-'))
  try {
    const source = resolve(root, 'source'), snapshot = resolve(root, 'snapshot')
    await mkdir(resolve(source, 'assets'), { recursive: true })
    const bytes = Buffer.from([0, 1, 127, 255])
    await writeFile(resolve(source, 'index.html'), '<main>accepted</main>')
    await writeFile(resolve(source, 'assets/data.bin'), bytes)
    await writeFile(resolve(source, 'assets/empty.css'), '')
    await copyProductionSnapshot(source, snapshot)
    const cache = await readProductionSnapshot(snapshot)
    await writeFile(resolve(source, 'index.html'), '<main>rebuilt</main>')
    await writeFile(resolve(snapshot, 'assets/data.bin'), 'later write')
    assert.equal(cache.get(resolve(snapshot, 'index.html')).toString(), '<main>accepted</main>')
    assert.equal(await readFile(resolve(snapshot, 'index.html'), 'utf8'), '<main>accepted</main>')
    assert.deepEqual(cache.get(resolve(snapshot, 'assets/data.bin')), bytes)
    assert.equal(cache.get(resolve(snapshot, 'assets/empty.css')).length, 0)
    assert.equal(cache.has(resolve(snapshot, 'missing')), false)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('production cache rejects a symlink instead of reading outside its snapshot', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'production-link-'))
  try {
    const snapshot = resolve(root, 'snapshot')
    await mkdir(snapshot)
    await writeFile(resolve(root, 'outside'), 'outside')
    await symlink(resolve(root, 'outside'), resolve(snapshot, 'asset'))
    await assert.rejects(readProductionSnapshot(snapshot), /requires regular files/)
  } finally { await rm(root, { recursive: true, force: true }) }
})
