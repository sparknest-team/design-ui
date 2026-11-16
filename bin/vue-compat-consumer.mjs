import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import vm from 'node:vm'
import { JSDOM } from 'jsdom'

const [name, version] = process.argv.slice(2)
if (process.argv[4] === 'ssr') {
  assert.equal(typeof globalThis.document, 'undefined')
  const require = createRequire(import.meta.url)
  const Vue = await import('vue')
  for (const module of ['@vue/server-renderer', '@vue/runtime-core', '@vue/reactivity']) assert.equal(require(`${module}/package.json`).version, version)
  const { renderToString } = await import('@vue/server-renderer')
  assert.equal(Vue.version, version)
  for (const library of [await import(name), require(name)]) {
    const render = () => renderToString(Vue.createSSRApp({ render: () => Vue.h('section', [Vue.h(library.Button, null, { default: () => 'SSR compatibility' }), Vue.h(library.Input, { modelValue: 'server' }), Vue.h(library.Result, { status: '403' }), Vue.h(library.Result, { status: '500' })]) }))
    const html = await render()
    assert.match(html, /SSR compatibility/)
    assert.match(html, /server/)
    assert.equal(await render(), html)
  }
  process.exit(0)
}
const dom = new JSDOM('<!doctype html><body><div id="app"></div></body>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost' })
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator })
for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'Element', 'Node', 'SVGElement', 'Event', 'MouseEvent', 'MutationObserver', 'getComputedStyle']) {
  if (dom.window[key]) globalThis[key] = typeof dom.window[key] === 'function' && key === 'getComputedStyle' ? dom.window[key].bind(dom.window) : dom.window[key]
}
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)
const require = createRequire(import.meta.url)
const Vue = await import('vue')
assert.equal(Vue.version, version, 'Consumer must use the matrix runtime')
for (const module of ['@vue/server-renderer', '@vue/runtime-core', '@vue/reactivity']) assert.equal(require(`${module}/package.json`).version, version)
const { renderToString } = await import('@vue/server-renderer')
const libraries = [await import(name), require(name)]
try {
  for (const library of libraries) {
    assert.ok(library.Button && library.Input && library.Switch)
    const warnings = []
    let clicks = 0
    const value = Vue.ref('initial')
    const checked = Vue.ref(false)
    const tree = () => Vue.h('section', [
      Vue.h(library.Button, { onClick: () => clicks++ }, { default: () => 'compat button' }),
      Vue.h(library.Input, { modelValue: value.value, 'onUpdate:modelValue': (next) => { value.value = next } }),
      Vue.h(library.Switch, { modelValue: checked.value, 'onUpdate:modelValue': (next) => { checked.value = next } }),
      Vue.h(library.Result, { status: '403' }),
      Vue.h(library.Result, { status: '500' }),
    ])
    const makeApp = (ssr = false) => {
      const app = (ssr ? Vue.createSSRApp : Vue.createApp)({ render: tree })
      app.config.warnHandler = (warning) => warnings.push(warning)
      return app
    }
    const html = await renderToString(makeApp(true))
    assert.match(html, /compat button/)
    assert.match(html, /initial/)
    // Fresh apps must reproduce IDs regardless of prior requests in this process.
    assert.equal(await renderToString(makeApp(true)), html)
    const host = document.getElementById('app')
    const app = makeApp()
    app.mount(host)
    host.querySelector('button').dispatchEvent(new MouseEvent('click', { bubbles: true }))
    assert.equal(clicks, 1)
    const input = host.querySelector('input')
    input.value = 'changed'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await Vue.nextTick()
    assert.equal(value.value, 'changed')
    const toggle = host.querySelector('[role="switch"]')
    assert.ok(toggle)
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await Vue.nextTick()
    assert.equal(checked.value, true)
    app.unmount()
    value.value = 'initial'
    checked.value = false
    host.innerHTML = html
    const parsedHTML = host.innerHTML
    const serverNode = host.firstChild
    const hydrated = makeApp(true)
    hydrated.mount(host)
    assert.deepEqual(warnings, [], `Vue ${version} emitted warnings`)
    assert.equal(host.innerHTML, parsedHTML, 'Hydration must preserve server markup and IDs')
    assert.equal(host.firstChild, serverNode, 'Hydration must reuse server nodes')
    const ids = [...host.querySelectorAll('[id]')].map((node) => node.id)
    assert.equal(new Set(ids).size, ids.length, 'Generated editor and SVG IDs must be unique')
    hydrated.unmount()
  }
  const context = dom.getInternalVMContext()
  vm.runInContext(readFileSync(require.resolve('vue/dist/vue.global.prod.js'), 'utf8'), context)
  const brand = name.includes('cedar') ? 'Cedar' : 'Maple'
  const bundle = brand.toLowerCase()
  const directory = dirname(require.resolve(`${name}/package.json`))
  vm.runInContext(readFileSync(join(directory, `umd/${bundle}.js`), 'utf8'), context)
  assert.equal(typeof dom.window.process, 'undefined')
  const globalVue = dom.window.Vue
  assert.equal(globalVue.version, version)
  let clicks = 0
  const app = globalVue.createApp({ render: () => globalVue.h(dom.window[brand].Button, { onClick: () => clicks++ }, { default: () => 'UMD compatibility' }) })
  app.mount(document.getElementById('app'))
  document.querySelector('#app button').dispatchEvent(new MouseEvent('click', { bubbles: true }))
  assert.equal(clicks, 1)
  app.unmount()
} finally { dom.window.close() }
