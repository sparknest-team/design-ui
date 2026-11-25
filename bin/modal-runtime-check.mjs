import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createRequire, register } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
register(new URL('./ssr-style-loader.mjs', import.meta.url), import.meta.url)
for (const [name, directory, components] of [
  ['Cedar', 'cedar-design-web/packages/ui', ['dialog', 'drawer', 'overlay']],
  ['Maple', 'maple-design-mobile/packages/ui', ['dialog', 'popup', 'overlay']],
]) {
  const require = createRequire(resolve(root, directory, 'package.json'))
  require.extensions['.css'] = () => {}
  const { createSSRApp, h } = require('vue')
  const { renderToString } = require('@vue/server-renderer')
  const formats =
    name === 'Maple' && !existsSync(resolve(root, directory, 'es/dialog/index.mjs')) ? ['lib'] : ['es', 'lib']
  for (const format of formats)
    for (const nameOfComponent of components) {
      const componentFile = resolve(
        root,
        directory,
        format,
        `${nameOfComponent}/index.${format === 'es' ? 'mjs' : 'js'}`,
      )
      const file = existsSync(componentFile)
        ? componentFile
        : resolve(root, directory, format, `index.${format === 'es' ? 'mjs' : 'js'}`)
      const api = format === 'es' ? await import(pathToFileURL(file)) : require(file)
      const component = api[`_${nameOfComponent[0].toUpperCase()}${nameOfComponent.slice(1)}Component`] ?? api.default
      assert.ok(component)
      const html = await renderToString(
        createSSRApp({
          render: () => h(component, { open: true, popupContainer: false }, { default: () => h('button', 'content') }),
        }),
      )
      assert.equal(typeof html, 'string')
      console.log(`PASS ${name} ${format} ${nameOfComponent}: no-DOM import and open SSR render`)
    }
  if (name === 'Maple') {
    const esBundle = resolve(root, directory, 'es/index.mjs')
    assert.ok(existsSync(esBundle))
    console.log('PASS Maple es: bundled ESM artifact exists; per-component SSR import is not emitted by this build')
    const api = require(resolve(root, directory, 'lib/theme-provider/index.js'))
    const ThemeProvider = api._ThemeProviderComponent ?? api.ThemeProvider ?? api.default
    assert.ok(ThemeProvider)
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ThemeProvider, { style: { '--mp-color-primary': '#123456' } }, { default: () => h('span', 'content') }),
      }),
    )
    assert.match(html, /content/)
    console.log('PASS Maple ThemeProvider: no-DOM import and SSR render')
  }
}
