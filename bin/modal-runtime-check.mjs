import assert from 'node:assert/strict'
import { createRequire, register } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
const root = fileURLToPath(new URL('../../', import.meta.url))
register(new URL('./ssr-style-loader.mjs', import.meta.url), import.meta.url)
for (const [name, directory, components] of [
  ['Cedar', 'cedar-design-web/packages/cedar-ui', ['dialog', 'drawer', 'overlay']],
  ['Maple', 'maple-design-mobile/packages/maple-ui', ['dialog', 'popup', 'overlay']],
]) {
  const require = createRequire(resolve(root, directory, 'package.json'))
  require.extensions['.css'] = () => {}
  const { createSSRApp, h } = require('vue')
  const { renderToString } = require('@vue/server-renderer')
  for (const format of ['es', 'lib']) for (const nameOfComponent of components) {
    const file = resolve(root, directory, format, `${nameOfComponent}/index.${format === 'es' ? 'mjs' : 'js'}`)
    const api = format === 'es' ? await import(pathToFileURL(file)) : require(file)
    const component = api[`_${nameOfComponent[0].toUpperCase()}${nameOfComponent.slice(1)}Component`] ?? api.default
    assert.ok(component)
    const html = await renderToString(createSSRApp({ render: () => h(component, { open: true, popupContainer: false }, { default: () => h('button', 'content') }) }))
    assert.equal(typeof html, 'string')
    console.log(`PASS ${name} ${format} ${nameOfComponent}: no-DOM import and open SSR render`)
  }
  if (name === 'Maple') {
    const { default: StyleProvider } = await import(pathToFileURL(resolve(root, directory, 'es/style-provider/index.mjs')))
    StyleProvider(null); StyleProvider({ '--mp-color-primary': '#123456' })
    console.log('PASS Maple StyleProvider: no-DOM functional calls')
  }
}
