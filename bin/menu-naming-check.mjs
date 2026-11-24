import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalogNamingText } from './menu-naming-catalog.mjs'

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const legacyName = /dropdown[-_]?menu/i
const skipped = new Set(['node_modules', '.git', '.cache', '.temp', '.maple', 'dist', 'coverage'])
const failures = []
const comparisonCatalogs = new Set([
  'cedar-design-web/packages/ui/docs/.vuepress/configs/component-catalog.json',
  'maple-design-mobile/packages/ui/docs/components/component-catalog.json',
])
let checked = 0

function scan(path) {
  if (!existsSync(path)) return
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || skipped.has(entry.name) || /^\.(?:temp|cache)-/.test(entry.name)) continue
    const file = join(path, entry.name)
    if (legacyName.test(entry.name)) failures.push(relative(workspace, file))
    if (entry.isDirectory()) scan(file)
    else if (/\.(?:[cm]?js|jsx|tsx?|vue|md|json|less|s[ac]ss|css|html)$/.test(entry.name)) {
      checked += 1
      const name = relative(workspace, file)
      const text = readFileSync(file, 'utf8')
      const localNames = comparisonCatalogs.has(name) ? catalogNamingText(text) : text
      if (legacyName.test(localNames)) failures.push(name)
    }
  }
}

for (const [repo, library, resolver] of [
  ['cedar-design-web', 'ui', 'resolver'],
  ['maple-design-mobile', 'ui', 'resolver'],
]) {
  const source = join(workspace, repo, 'packages', library, 'src')
  assert.ok(existsSync(join(source, 'menu/index.ts')), `${library}: Menu entry is required`)
  assert.match(readFileSync(join(source, 'index.ts'), 'utf8'), /['"]\.\/menu['"]/, `${library}: root must export Menu`)
  for (const directory of ['src', 'docs']) scan(join(workspace, repo, 'packages', library, directory))
  scan(join(workspace, repo, 'packages', resolver, 'src'))
  scan(join(workspace, repo, 'checks'))
  if (process.argv.includes('--built')) {
    for (const directory of ['es', 'lib', 'types', 'types-generated', 'umd']) {
      scan(join(workspace, repo, 'packages', library, directory))
    }
  }
}
for (const directory of [
  'maple-design-mobile/packages/cli/src',
  'maple-design-mobile/packages/vscode-extension/src',
  'maple-design-mobile/packages/ui-playground/src',
  'design-ui/refactors/token-validation/browser',
])
  scan(join(workspace, directory))
for (const file of [
  'cedar-design-web/API-MIGRATION.md',
  'cedar-design-web/packages/ui/index.html',
  'design-ui/refactors/foundation-alignment/trigger-consumers.json',
  'design-ui/audits/non-color-token-contract-suggestions.json',
  'design-ui/audits/api-props-inventory.md',
  ...(process.argv.includes('--built')
    ? [
        'maple-design-mobile/packages/ui-playground/public/maple.esm.js',
        'maple-design-mobile/packages/ui-playground/public/maple.css',
      ]
    : []),
]) {
  const path = join(workspace, file)
  checked += 1
  if (legacyName.test(readFileSync(path, 'utf8'))) failures.push(file)
}

// Historical change records and resolver rejection tests intentionally retain the old name.
assert.equal(failures.length, 0, `Legacy Menu names remain:\n${failures.join('\n')}`)
console.log(`Menu naming: ${checked} current source/document/export files checked`)
