import { statSync } from 'node:fs'
import type { App } from '@vuepress/core'

type Entry = { stamp: string; code: string; bytes: number }
type Snapshot = { entries: Map<string, Entry>; bytes: number }
const snapshots = new WeakMap<App, Snapshot | null>()
const limit = 32 * 1024 * 1024
const stamp = (file: string) => {
  const stat = statSync(file, { bigint: true })
  return `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}:${stat.ctimeNs}`
}

// Reuse disk reads only while the original and localized pages are being
// initialized. Every lookup checks nanosecond metadata, including ctime/inode;
// edits with restored mtime and atomic replacements cannot reuse old contents.
// Once initialized, HMR always reads files directly, without this cache.
export function readInitialSource(app: App, file: string, read: () => string): string {
  let snapshot = snapshots.get(app)
  if (snapshot === null) return read()
  if (!snapshot) {
    snapshot = { entries: new Map(), bytes: 0 }
    snapshots.set(app, snapshot)
  }
  let before: string
  try { before = stamp(file) } catch { return read() }
  const hit = snapshot.entries.get(file)
  if (hit?.stamp === before) return hit.code
  if (hit) { snapshot.entries.delete(file); snapshot.bytes -= hit.bytes }
  const code = read()
  const bytes = (file.length + code.length) * 2
  let after: string | undefined
  try { after = stamp(file) } catch { /* Removed during the read: do not cache. */ }
  // If the file was changed during the read, don't retain that snapshot.
  if (bytes <= limit && after === before) {
    while (snapshot.bytes + bytes > limit && snapshot.entries.size) {
      const oldest = snapshot.entries.keys().next().value!
      snapshot.bytes -= snapshot.entries.get(oldest)!.bytes
      snapshot.entries.delete(oldest)
    }
    snapshot.entries.set(file, { stamp: before, code, bytes })
    snapshot.bytes += bytes
  }
  return code
}

export function finishInitialSourceReads(app: App) { snapshots.set(app, null) }
