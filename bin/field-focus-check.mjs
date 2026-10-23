import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
for (const [source, prefix, compilerPackage] of [
  ['cedar-design-web/packages/cedar-ui/src', 'c', '../node_modules/less/package.json'],
  ['maple-design-mobile/packages/maple-ui/src', 'mp', '../../maple-cli/node_modules/less/package.json'],
]) {
  const root = resolve(workspace, source)
  const require = createRequire(resolve(root, compilerPackage))
  const less = require('./')
  const filename = resolve(root, 'field-decorator/style/index.less')
  const { css } = await less.render(readFileSync(filename, 'utf8'), { filename })
  assert.ok(!css.includes(`.${prefix}-field-decorator:has(:focus-visible)`), `${prefix}: fields must not draw an extra outer focus outline`)
  assert.ok(css.includes(`.${prefix}-field-decorator--variant-outline:focus-within`), `${prefix}: preserve outline variant focus border`)
  assert.ok(css.includes(`.${prefix}-field-decorator--variant-filled:focus-within`), `${prefix}: preserve filled variant focus feedback`)
  assert.ok(css.includes(`.${prefix}-field-decorator--variant-standard:focus-within`), `${prefix}: preserve standard variant focus underline`)
}
console.log('Both Less compilers omit outer field focus outlines and preserve variant focus feedback.')
