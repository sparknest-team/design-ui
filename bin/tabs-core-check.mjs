import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeVueSource, normalizeTypeScript, normalizeLessSource } from '../../maple-design-mobile/checks/normalize-source.mjs'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const roots = ['cedar-design-web/packages/ui', 'maple-design-mobile/packages/ui'].map((path) => resolve(workspace, path))
const read = (root, file) => readFileSync(resolve(root, 'src/tabs', file), 'utf8')
const platformSource = (source) => source
  .replaceAll('../_utils/global-config', '../utils/components')
  .replaceAll('../_utils/constant', '../utils/constants')
  .replace("import type { ComponentSize } from '../utils/constants'\nimport type { Direction as Orientation } from '../utils/constants'", "import type { ComponentSize, Orientation } from '../utils/constants'")
  .replaceAll('--c-', '--mp-').replaceAll('c-tabs', 'mp-tabs')
  .replaceAll('<c-', '<mp-').replaceAll('</c-', '</mp-')
const normalize = source => platformSource(source).replace(/\s+/g, '')
const files = ['Tabs.vue', 'TabsNavs.vue', 'TabNav.vue', 'TabsItems.vue', 'TabItem.vue', 'TabPane.vue', 'props.ts', 'types.ts', 'context.ts', 'style/index.less', 'style/index.ts', '__tests__/same-source.spec.js', '__tests__/closure.spec.js']
for (const file of files) {
  const canonical = file.endsWith('.vue') ? normalizeVueSource : file.endsWith('.less') ? normalizeLessSource : normalizeTypeScript
  assert.equal(await canonical(platformSource(read(roots[0], file))), await canonical(platformSource(read(roots[1], file))), file)
}
const tokens = roots.map((root) => new Map([...read(root, 'style/token.less').matchAll(/--(?:c|mp)-tabs-([\w-]+):\s*([^;]+);/g)].map((match) => [match[1], normalize(match[2])])))
const componentExports = (root) => [...read(root, 'index.ts').matchAll(/export const (_\w+Component)/g)].map((match) => match[1]).sort()
assert.deepEqual(componentExports(roots[0]), componentExports(roots[1]), 'component exports differ')
assert.equal(componentExports(roots[0]).length, 6, 'all six components must be exported')
assert.deepEqual([...tokens[0].keys()].sort(), [...tokens[1].keys()].sort())
const differences = new Set(['header-padding', 'content-padding', 'capsule-radius', 'active-shadow'])
for (const [name, value] of tokens[0]) if (!differences.has(name)) assert.equal(value, tokens[1].get(name), name)
const less = createRequire(resolve(roots[0], 'package.json'))('less')
for (const root of roots) {
  assert.ok(!existsSync(resolve(root, 'src/tabs/platform.ts')), 'platform module must not return')
  assert.ok(!existsSync(resolve(root, 'src/tabs/tab-item-provide.ts')), 'unused panel binding must not return')
  const css = (await less.render(read(root, 'style/index.less'), { filename: resolve(root, 'src/tabs/style/index.less') })).css
  for (const name of tokens[0].keys()) assert.ok(css.includes('var(--' + (root === roots[0] ? 'c' : 'mp') + '-tabs-' + name + ')'), name + ' has no compiled CSS consumer')
  for (const name of ['TabsEmits', 'TabsSlots', 'TabsNavsSlots', 'TabNavSlots', 'TabPaneSlots', 'TabsItemsSlots', 'TabItemSlots', 'TabsNavsExpose']) assert.ok(read(root, 'index.ts').includes(name), name + ' not exported')
}
console.log('Tabs parity passed: ' + files.length + ' copied source pairs; ' + tokens[0].size + ' token consumers; six components. Local configuration, registration and four visual defaults remain independent.')
