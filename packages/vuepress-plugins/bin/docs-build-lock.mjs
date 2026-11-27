import { createHash } from 'node:crypto'
import { mkdirSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'

function canonicalPath(directory) {
  try {
    return realpathSync(directory)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    return resolve(canonicalPath(dirname(directory)), basename(directory))
  }
}

// An exclusive SQLite transaction is an OS file lock, released even on SIGKILL.
// Keep lock files outside directories VuePress empties and never unlink a live lock inode.
export function acquireDocsBuild(root, destination) {
  const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite')
  const directory = join(tmpdir(), 'sparknest-docs-locks')
  mkdirSync(directory, { recursive: true, mode: 0o700 })
  const locks = []
  function release() {
    while (locks.length) locks.pop().close()
  }
  try {
    for (const target of new Set([root, destination].filter(Boolean).map(path => canonicalPath(resolve(path))))) {
      const key = createHash('sha256').update(target).digest('hex')
      const db = new DatabaseSync(join(directory, key + '.sqlite'))
      locks.push(db)
      try {
        db.exec('BEGIN EXCLUSIVE')
      } catch (error) {
        if (error.errcode !== 5) throw error
        throw new Error('Documentation build already running for ' + target, { cause: error })
      }
    }
    return release
  } catch (error) {
    release()
    throw error
  }
}
