import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function misplacedRootTokens(source) {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  return [...text.matchAll(/:root\s*\{([\s\S]*?)\}/g)].flatMap(block =>
    [...block[1].matchAll(/(--(?:c|mp)-(?!internal-)[\w-]+)\s*:/g)].map(match => match[1]))
}

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? walk(resolve(dir, entry.name)) : [resolve(dir, entry.name)])
const misplaced = []
for (const [repo, pkg] of [['cedar-design-web', 'cedar-ui'], ['maple-design-mobile', 'maple-ui']]) {
  const root = resolve(workspace, repo, 'packages', pkg, 'src')
  for (const file of walk(root).filter((path) => path.includes('/style/') && path.endsWith('.less') &&
    !path.endsWith('/token.less') && !path.startsWith(root + '/style/') && !path.startsWith(root + '/themes/'))) {
    const names = misplacedRootTokens(readFileSync(file, 'utf8'))
    if (names.length) misplaced.push({ file, names })
  }
}
assert.deepEqual(misplaced, [], 'Public component root declarations belong in style/token.less')
console.log('Component token placement passed: no public root declarations in implementation styles.')
