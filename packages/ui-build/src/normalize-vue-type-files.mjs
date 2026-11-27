import { readdir, rename } from 'node:fs/promises'
import { join } from 'node:path'

// TypeScript 7 emits Component.d.vue.ts for arbitrary extensions. Keep the
// package's existing Component.vue.d.ts paths for older TypeScript consumers.
export async function normalizeVueTypeFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await normalizeVueTypeFiles(path)
    else if (entry.name.endsWith('.d.vue.ts')) await rename(path, path.replace(/\.d\.vue\.ts$/, '.vue.d.ts'))
  }
}
