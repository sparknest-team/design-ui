import assert from 'node:assert/strict'
import { createRequire, register } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
const root = fileURLToPath(new URL('../../', import.meta.url))
const directory = resolve(root, 'cedar-design-web/packages/cedar-ui')
const require = createRequire(resolve(directory, 'package.json'))
register(new URL('./ssr-style-loader.mjs', import.meta.url), import.meta.url)
require.extensions['.css'] = () => {}
const { createSSRApp, h } = require('vue')
const { renderToString } = require('@vue/server-renderer')
for (const format of ['es', 'lib']) {
  const file = resolve(directory, format, `nav-menu/index.${format === 'es' ? 'mjs' : 'js'}`)
  const api = format === 'es' ? await import(pathToFileURL(file)) : require(file)
  assert.equal(api.default.Item, api.NavMenuItem)
  assert.equal(api.NavMenuItem.name, 'CNavMenuItem')
  assert.equal(api.default.name, 'CNavMenu')
  assert.equal(typeof api.default.install, 'function')
  for (const key of ['SubMenu', 'ItemGroup']) assert.equal(api.default[key], undefined)
  for (const key of ['NavMenuSubMenu', 'NavMenuItemGroup']) assert.equal(api[key], undefined)
  for (const key of ['options', 'modelValue', 'expandedKeys', 'mode', 'fieldNames', 'collapsed']) assert.ok(api.navMenuProps[key])
  const options = [{ key: 0, label: 'Home' }, { key: 'parent', label: 'Parent', children: [{ key: 'leaf', label: 'Leaf' }] }]
  const render = () => renderToString(createSSRApp({ render: () => h(api.default, { options, defaultValue: 'leaf' }) }))
  const html = await render()
  assert.ok(html.includes('Leaf') && html.includes('aria-current="page"'))
  assert.equal(html, await render())
  console.log(`PASS Cedar NavMenu ${format}: props, removed legacy exports, no-DOM import and deterministic SSR`)
}
