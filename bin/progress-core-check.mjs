import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const c = resolve(root, 'cedar-design-web/packages/ui/src')
const m = resolve(root, 'maple-design-mobile/packages/ui/src')
const require = createRequire(resolve(c, '../package.json'))
const prettier = require('prettier')
const less = require('less')
function normalize(source) {
  return source.replaceAll('../_utils/global-config', '../utils/components')
    .replaceAll('../_utils/constant', '../utils/constants')
    .replaceAll('../_utils/size-length', '../utils/size-length')
    .replaceAll('../_utils/maple/elements', '../utils/elements')
    .replaceAll('c-progress', 'mp-progress').replaceAll('--c-', '--mp-')
    .replaceAll('<c-', '<mp-').replaceAll('</c-', '</mp-')
}
const pairs = [
  'progress/Progress.vue', 'progress/props.ts', 'progress/percent.ts', 'progress/size.ts',
  'progress/use-circle-size.ts', 'progress/style/index.less', 'progress/style/token.less',
  'progress-group/ProgressGroup.vue', 'progress-group/props.ts',
  'progress-group/style/index.less', 'progress-group/style/token.less',
  'progress/__tests__/percent-contract.spec.js', 'progress/__tests__/size-contract.spec.js',
  'progress-group/__tests__/complete-contract.spec.js',
]
for (const file of pairs) {
  const parser = file.endsWith('.vue') ? 'vue' : file.endsWith('.less') ? 'less' : 'typescript'
  const format = async path => prettier.format(normalize(readFileSync(path, 'utf8')), { parser })
  assert.equal(await format(resolve(c, file)), await format(resolve(m, file)), file)
}
for (const name of ['appearance-comparison', 'step', 'loop', 'advanced']) {
  assert.equal(await prettier.format(normalize(readFileSync(resolve(c, 'progress/__demos__', name + '.vue'), 'utf8')), { parser: 'vue' }), await prettier.format(normalize(readFileSync(resolve(m, 'progress/example/demos', name + '.vue'), 'utf8')), { parser: 'vue' }), name)
}
for (const dir of [c, m]) for (const component of ['progress', 'progress-group']) {
  const filename = resolve(dir, component, 'style/index.less')
  const { css } = await less.render(readFileSync(filename, 'utf8'), { filename })
  assert.ok(css.includes('prefers-reduced-motion'), component + ' reduced motion')
  if (component === 'progress-group') assert.ok(css.includes(':focus-visible'), 'group focus')
}
console.log('Progress family: 14 source/test/style pairs, 4 demos (size/status are composed in appearance-comparison) and both compiled styles verified. Only installation and local ConfigProvider size wiring remain library-specific.')

