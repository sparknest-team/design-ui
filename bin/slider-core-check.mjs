import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeBoundImports } from './normalize-bound-imports.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const c = resolve(root, 'cedar-design-web/packages/ui/src/slider')
const m = resolve(root, 'maple-design-mobile/packages/ui/src/slider')
const require = createRequire(resolve(c, '../../package.json'))
const prettier = require('prettier')
const less = require('less')
function normalize(s) {
  return s
    .replaceAll('../_utils/empty-value', '../utils/empty-value')
    .replaceAll('../_utils/global-config', '../utils/components')
    .replaceAll("from '../_utils/vue-compat'", "from '../utils/vue-compat'")
    .replaceAll('../_utils/size-length', '../utils/size-length')
    .replaceAll('../_utils/constant', '../utils/constants')
    .replaceAll('Direction as Orientation', 'Orientation')
    .replaceAll('--c-', '--mp-')
    .replaceAll('c-slider', 'mp-slider')
    .replaceAll('<c-', '<mp-')
    .replaceAll('</c-', '</mp-')
}
async function canonical(source, options) {
  const formatted = await prettier.format(source, options)
  return options.parser === 'less' ? formatted : normalizeBoundImports(formatted)
}
const pairs = [
  'Slider.vue',
  'SliderInput.vue',
  'props.ts',
  'model.ts',
  'style/index.ts',
  'style/index.less',
  'style/token.less',
]
for (const file of pairs) {
  const parser = file.endsWith('.vue') ? 'vue' : file.endsWith('.less') ? 'less' : 'typescript'
  assert.equal(
    await canonical(normalize(readFileSync(resolve(c, file), 'utf8')), { parser }),
    await canonical(normalize(readFileSync(resolve(m, file), 'utf8')), { parser }),
    file,
  )
}
assert.equal(
  await canonical(normalize(readFileSync(resolve(c, '__tests__/precision-focus.spec.ts'), 'utf8')), {
    parser: 'typescript',
  }),
  await canonical(normalize(readFileSync(resolve(m, '__tests__/precision-focus.spec.ts'), 'utf8')), {
    parser: 'typescript',
  }),
  'precision/focus contract tests',
)
for (const name of ['keyboard-input', 'touch-and-labels', 'controlled-range']) {
  assert.equal(
    await canonical(normalize(readFileSync(resolve(c, '__demos__', name + '.vue'), 'utf8')), { parser: 'vue' }),
    await canonical(normalize(readFileSync(resolve(m, 'example/demos', name + '.vue'), 'utf8')), { parser: 'vue' }),
    name,
  )
}
assert.equal(
  await canonical(normalize(readFileSync(resolve(c, '__tests__/slider.test.tsx'), 'utf8')), { parser: 'typescript' }),
  await canonical(normalize(readFileSync(resolve(m, '__tests__/index.spec.js'), 'utf8')), { parser: 'typescript' }),
  'interaction tests',
)
for (const dir of [c, m]) {
  const filename = resolve(dir, 'style/index.less')
  const { css } = await less.render(readFileSync(filename, 'utf8'), { filename })
  assert.ok(css.includes(':focus-visible'))
  assert.ok(css.includes('prefers-reduced-motion'))
  assert.ok(css.includes('touch-action: pan-y') && css.includes('touch-action: pan-x'))
}
console.log(
  'Slider: 7 source/style pairs, 2 interaction/precision/focus test pairs, 3 demo pairs and both compiled styles verified. Form/provider wiring and installation remain local.',
)
