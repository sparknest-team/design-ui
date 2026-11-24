import { readdir } from 'node:fs/promises'
import { relative, resolve } from 'node:path'

// A preserved module is not automatically a public entry: Rollup may redirect
// its re-exports to another module and drop them from the package subpath.
export async function collectModuleEntries(root, sourceDir, entry) {
  const sourceRoot = resolve(root, sourceDir)
  const entries = { index: resolve(root, entry) }
  const skipped = new Set(['style', 'docs', 'example', 'components', 'node_modules'])
  async function visit(directory) {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      if (item.name.startsWith('_') || item.name.startsWith('.') || skipped.has(item.name)) continue
      const full = resolve(directory, item.name)
      if (item.isDirectory()) await visit(full)
      else if (/^index\.(?:ts|tsx|js|mjs)$/.test(item.name) && full !== entries.index) {
        entries[
          relative(sourceRoot, full)
            .replaceAll('\\', '/')
            .replace(/\.[^.]+$/, '')
        ] = full
      }
    }
  }
  await visit(sourceRoot)
  return entries
}
