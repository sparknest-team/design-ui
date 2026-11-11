import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(import.meta.url)
for (const [name, directory, prefix] of [
  ['Cedar', 'cedar-design-web/packages/ui', 'C'],
  ['Maple', 'maple-design-mobile/packages/ui', 'Mp'],
]) for (const component of ['tooltip', 'popover']) for (const format of ['es', 'lib']) {
  const file = resolve(root, directory, format, `${component}/index.${format === 'es' ? 'mjs' : 'js'}`)
  const api = format === 'es' ? await import(pathToFileURL(file)) : require(file)
  const props = api[`${component}Props`]
  assert.equal(api.default.name, prefix + component[0].toUpperCase() + component.slice(1))
  assert.equal(typeof api.default.install, 'function')
  for (const key of ['trigger', 'reference', 'disabled', 'open', 'defaultOpen', 'mouseEnterDelay', 'popupHoverStay', 'blurToClose', 'clickOutsideToClose', 'restoreFocus', 'duration', 'showArrow', 'unmountOnClose', 'popupClass', 'contentClass', 'arrowClass']) assert.ok(key in props, `${name} ${component}: ${key}`)
  assert.equal(props.open.default, undefined)
  assert.equal(props.unmountOnClose.default, name === 'Cedar')
  assert.equal(props.trigger.default, name === 'Maple' && component === 'popover' ? 'click' : 'hover')
  assert.equal(props.placement.default, name === 'Cedar' ? 'top' : 'bottom')
  if (component === 'popover') for (const key of ['title', 'content']) assert.ok(key in props)
  else for (const key of ['backgroundColor', 'color', 'textColor', 'xs']) assert.ok(key in props)
  console.log(`PASS ${name} ${component} ${format}: no-DOM import, install, public controls and preserved defaults`)
}
