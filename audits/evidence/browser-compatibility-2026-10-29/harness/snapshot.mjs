import assert from 'node:assert/strict'
import { constants } from 'node:fs'
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

// Independent inodes (never hard links) preserve the accepted build if another
// build later replaces its output. Reflinks fall back to ordinary copies.
export async function copyProductionSnapshot(source, target) {
  const files = []
  async function walk(from, to) {
    await mkdir(to, { recursive: true })
    await Promise.all((await readdir(from, { withFileTypes: true })).map(async (entry) => {
      const input = resolve(from, entry.name), output = resolve(to, entry.name)
      if (entry.isDirectory()) await walk(input, output)
      else {
        assert.ok(entry.isFile(), `production snapshot requires regular files: ${input}`)
        files.push([input, output])
      }
    }))
  }
  await walk(source, target)
  let next = 0
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (next < files.length) {
      const [input, output] = files[next++]
      await copyFile(input, output, constants.COPYFILE_FICLONE)
    }
  }))
}
