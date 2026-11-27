import { mkdtempSync, readFileSync, renameSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test, vi } from 'vitest'
import { finishInitialSourceReads, readInitialSource } from '../src/node/utils/initial-source-reads'

test('initial reads share unchanged files, detect restored-mtime edits/replacements, and never cache HMR', () => {
  const folder = mkdtempSync(join(tmpdir(), 'cedar-initial-read-'))
  try {
    const file = join(folder, 'demo.vue')
    writeFileSync(file, 'before')
    const app = {} as any
    const read = vi.fn(() => readFileSync(file, 'utf8'))
    expect(readInitialSource(app, file, read)).toBe('before')
    expect(readInitialSource(app, file, read)).toBe('before')
    expect(read).toHaveBeenCalledTimes(1)
    const before = statSync(file)
    writeFileSync(file, 'edited') // same size
    utimesSync(file, before.atime, before.mtime)
    expect(readInitialSource(app, file, read)).toBe('edited')
    writeFileSync(join(folder, 'replacement'), 'atomic')
    utimesSync(join(folder, 'replacement'), before.atime, before.mtime)
    renameSync(join(folder, 'replacement'), file)
    expect(readInitialSource(app, file, read)).toBe('atomic')
    readInitialSource({} as any, file, read)
    expect(read).toHaveBeenCalledTimes(4)
    finishInitialSourceReads(app)
    readInitialSource(app, file, read)
    readInitialSource(app, file, read)
    expect(read).toHaveBeenCalledTimes(6)
  } finally { rmSync(folder, { recursive: true, force: true }) }
})
