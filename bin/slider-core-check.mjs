import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../', import.meta.url))
const c = resolve(root, 'cedar-design-web/packages/cedar-ui/src/slider')
const m = resolve(root, 'maple-design-mobile/packages/maple-ui/src/slider')
const require = createRequire(resolve(c, '../../package.json'))
const prettier = require('prettier')
const less = require('less')
function normalize(s) {
  return s.replaceAll('../_utils/global-config', '../utils/components')
    .replaceAll('../_utils/size-length', '../utils/size-length')
    .replaceAll('../_utils/constant', '../utils/constants')
    .replaceAll('Direction as Orientation', 'Orientation')
    .replaceAll('--c-', '--mp-').replaceAll('c-slider', 'mp-slider')
    .replaceAll('<c-', '<mp-').replaceAll('</c-', '</mp-')
}
const pairs = ['Slider.vue','SliderInput.vue','props.ts','model.ts','style/index.ts','style/index.less','style/token.less']
for (const file of pairs) {
  const parser = file.endsWith('.vue') ? 'vue' : file.endsWith('.less') ? 'less' : 'typescript'
  assert.equal(await prettier.format(normalize(readFileSync(resolve(c,file),'utf8')), { parser }), await prettier.format(normalize(readFileSync(resolve(m,file),'utf8')), { parser }), file)
}
for (const name of ['keyboard-input','touch-and-labels','controlled-range']) {
  assert.equal(await prettier.format(normalize(readFileSync(resolve(c,'__demos__',name+'.vue'),'utf8')), { parser:'vue' }), await prettier.format(normalize(readFileSync(resolve(m,'example/demos',name+'.vue'),'utf8')), { parser:'vue' }), name)
}
assert.equal(await prettier.format(normalize(readFileSync(resolve(c,'__tests__/slider.test.tsx'),'utf8')), {parser:'typescript'}), await prettier.format(normalize(readFileSync(resolve(m,'__tests__/index.spec.js'),'utf8')), {parser:'typescript'}), 'interaction tests')
for (const dir of [c,m]) {
  const filename=resolve(dir,'style/index.less')
  const {css}=await less.render(readFileSync(filename,'utf8'),{filename})
  assert.ok(css.includes(':focus-visible'))
  assert.ok(css.includes('prefers-reduced-motion'))
  assert.ok(css.includes('touch-action: pan-y') && css.includes('touch-action: pan-x'))
}
console.log('Slider: 7 source/style pairs, interaction test pair, 3 demo pairs and both compiled styles verified. Form/provider wiring and installation remain local.')

