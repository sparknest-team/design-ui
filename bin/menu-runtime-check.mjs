import assert from 'node:assert/strict'
import { createRequire, register } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(import.meta.url)
// Ripple deliberately imports CSS. SSR bundlers consume those assets; this
// check mirrors that asset handling while running all JavaScript without DOM.
register(new URL('./ssr-style-loader.mjs', import.meta.url), import.meta.url)
require.extensions['.css'] = () => {}

for (const [name, directory, componentName] of [
  ['Cedar', 'cedar-design-web/packages/ui', 'CMenu'],
  ['Maple', 'maple-design-mobile/packages/ui', 'MpMenu'],
]) {
  for (const format of ['es', 'lib']) {
    const file = resolve(root, directory, format, `menu/index.${format === 'es' ? 'mjs' : 'js'}`)
    const api = format === 'es' ? await import(pathToFileURL(file)) : require(file)
    assert.equal(api.default.name, componentName)
    assert.equal(typeof api.default.install, 'function')
    assert.equal(api.default.Option, api.MenuOption)
    for (const key of ['Group', 'Submenu']) assert.equal(api.default[key], undefined)
    for (const key of ['MenuGroup', 'MenuSubmenu', 'menuGroupProps', 'menuSubmenuProps']) assert.equal(api[key], undefined)
    assert.ok(api.menuOptionProps)
    for (const key of ['modelValue', 'options', 'fieldNames', 'open', 'defaultOpen', 'hideOnSelect', 'submenuTrigger', 'strategy', 'reference']) {
      assert.ok(key in api.menuProps, `${name} ${format}: missing ${key}`)
    }
    assert.equal(api.menuProps.modelValue.default, undefined)
    assert.equal(api.menuProps.open.default, undefined)
    assert.deepEqual(api.menuProps.options.default(), [])
    assert.equal(api.menuProps.hideOnSelect.default, true)
    assert.equal(api.menuProps.trigger.default, 'click')
    assert.equal(api.menuProps.unmountOnClose.default, name === 'Cedar')
    for (const type of [String, Number, Boolean, Object]) assert.ok(api.menuProps.modelValue.type.includes(type))
    assert.equal('multiple' in api.menuProps, false)
    const localRequire = createRequire(resolve(root, directory, 'package.json'))
    const { createSSRApp, h } = localRequire('vue')
    const { renderToString } = localRequire('@vue/server-renderer')
    const html = await renderToString(createSSRApp({ render: () => h(api.default, { open: true, popupContainer: false, options: [{ label: 'SSR leaf', value: 'leaf' }] }, {
      default: () => h('button', 'Menu'), content: () => h(api.MenuOption, { label: 'SSR slot' }),
    }) }))
    // Native Trigger may defer its popup until mounted; SSR must preserve the reference.
    assert.ok(html.includes('Menu'), `${name} ${format}: SSR reference missing`)
    const optionHtml = await renderToString(createSSRApp({ render: () => h(api.MenuOption, { label: 'SSR leaf', uninjectContext: true }) }))
    assert.ok(optionHtml.includes('SSR leaf'), `${name} ${format}: SSR option missing`)
    console.log(`PASS ${name} ${format}: no-DOM import, install, final Menu/Option API and SSR`)
  }
}
