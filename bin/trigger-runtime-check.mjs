import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(import.meta.url)
const libraries = [
  ['Cedar', 'cedar-design-web/packages/cedar-ui', 'CTrigger'],
  ['Maple', 'maple-design-mobile/packages/maple-ui', 'MpTrigger'],
]
const defaults = { unmountOnClose: true, trigger: 'hover', mouseEnterDelay: 100, mouseLeaveDelay: 100, focusDelay: 0, closeOnClickReference: true, clickOutsideToClose: true, escToClose: true, restoreFocus: true }
for (const [name, directory, componentName] of libraries) {
  for (const format of ['es', 'lib']) {
    const file = resolve(root, directory, format, `trigger/index.${format === 'es' ? 'mjs' : 'js'}`)
    const api = format === 'es' ? await import(pathToFileURL(file)) : require(file)
    assert.equal(api.default.name, componentName)
    assert.equal(typeof api.default.install, 'function')
    assert.ok(api.triggerProps, `${name} ${format}: missing public subpath export triggerProps`)
    for (const key of ['popupClass', 'contentClass', 'contentStyle', 'showArrow', 'arrowClass', 'arrowStyle', 'duration']) assert.ok(key in api.triggerProps, `${name} ${format}: missing ${key}`)
    for (const [key, value] of Object.entries(defaults)) assert.equal(api.triggerProps[key].default, value, `${name} ${format}: ${key}`)
    console.log(`PASS ${name} ${format}: SSR import, install, public props/defaults`)
  }
}
