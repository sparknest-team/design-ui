import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogNamingText } from './menu-naming-catalog.mjs'
const legacy = /dropdown[-_]?menu/i
const path = 'examples/dropdown-menu/DropdownMenuBasic.vue'
const url = `https://github.com/unovue/shadcn-vue/blob/${'a'.repeat(40)}/${path}`
const evidence = { library: 'shadcn-vue', title: 'DropdownMenuBasic', file: path, url }
function catalog(component) { return JSON.stringify({ components: [component] }) }
test('upstream pinned example coordinates are excluded while the original text is preserved', () => {
  const input = catalog({ id: 'menu', references: [{ library: 'shadcn-vue', url: url.replace('/blob/', '/tree/'), samples: [evidence] }], featurePoints: [{ evidence: [evidence] }] })
  assert.equal(legacy.test(catalogNamingText(input)), false)
  assert.equal(legacy.test(input), true)
})
test('local IDs, text and unsupported fields still reject old API names', () => {
  for (const field of ['id', 'name', 'description', 'file']) {
    assert.equal(legacy.test(catalogNamingText(catalog({ [field]: 'dropdown-menu', references: [evidence] }))), true)
  }
  assert.equal(legacy.test(catalogNamingText(catalog({ references: [{ ...evidence, localApi: 'DropdownMenu' }] }))), true)
})
test('unpinned, mismatched and library-owned source names remain checked', () => {
  for (const invalid of [
    { ...evidence, url: url.replace('a'.repeat(40), 'main') },
    { ...evidence, library: 'cedar-design-web' },
    { ...evidence, library: 'maple-design-mobile' },
    { ...evidence, url: url.replace('unovue/shadcn-vue', 'cedar-design/ui') },
    { ...evidence, url: url.replace('https:', 'http:') },
    { ...evidence, file: 'local/dropdown-menu.vue' },
    { ...evidence, title: 'Legacy DropdownMenu' },
  ]) assert.equal(legacy.test(catalogNamingText(catalog({ featurePoints: [{ evidence: [invalid] }] }))), true)
})
test('sample source coordinates must belong to the reference repository', () => {
  const input = catalog({ references: [{ library: 'shadcn-vue', url, samples: [{ ...evidence, url: url.replace('unovue/shadcn-vue', 'local/ui') }] }] })
  assert.equal(legacy.test(catalogNamingText(input)), true)
})
