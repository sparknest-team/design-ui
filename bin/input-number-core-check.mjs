import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(resolve(root, 'maple-design-mobile/node_modules/.pnpm/node_modules/esbuild/package.json'))
const { transformSync } = require('esbuild')
const requireUI = createRequire(resolve(root, 'cedar-design-web/packages/ui/package.json'))
const { parse, compileScript, compileTemplate } = requireUI('@vue/compiler-sfc')
const files = [
  'InputNumber.vue',
  'InputNumberStep.vue',
  'props.ts',
  'types.ts',
  'number-value.ts',
  'number-arithmetic.ts',
  'use-number-value.ts',
  'use-step-repeat.ts',
  'style/index.ts',
  'style/index.less',
  'style/input-number.less',
  'style/token.less',
  '__tests__/number-core.spec.ts',
  '__tests__/contract-repair.spec.ts',
  '__tests__/number-ssr.spec.ts',
  '__tests__/field-contract.spec.ts',
]
const demos = [
  'field-basic',
  'field-modes',
  'field-options',
  'controlled-events',
  'form-inheritance',
  'format-slots',
  'number-boundaries',
  'quantity-controls',
]
const normalize = (text) =>
  text
    .replaceAll('../_utils/global-config', '../utils/components')
    .replaceAll('../_utils/input-composition', '../utils/input-composition')
    .replaceAll('../_utils/empty-value', '../utils/empty-value')
    .replaceAll('../_utils/constant', '../utils/constants')
    .replaceAll('@cedar-design/icons-vue', '@maple-design/icons-vue')
    .replaceAll('--c-', '--mp-')
    .replaceAll('.c-', '.mp-')
    .replaceAll('<c-', '<mp-')
    .replaceAll('</c-', '</mp-')
function sortImports(text) {
  const imports = []
  const body = text.replace(/^import\s+(?:[\s\S]*?\s+from\s+)?['"][^'"]+['"];?\s*$/gm, (declaration) => {
    imports.push(declaration.trim().replaceAll('"', "'").replace(/\s+/g, ' '))
    return ''
  })
  return imports.sort((a, b) => a.match(/'([^']+)'/)[1].localeCompare(b.match(/'([^']+)'/)[1])).join('\n') + '\n' + body
}
const js = (text) =>
  transformSync(sortImports(text), { loader: 'ts', format: 'esm', minify: true, treeShaking: false }).code
function canonical(text, file, filename) {
  text = normalize(text)
  if (file.endsWith('.vue')) {
    text = text.replace(
      /(<script[^>]*>)([\s\S]*?)(<\/script>)/g,
      (_match, start, body, end) => start + '\n' + sortImports(body) + '\n' + end,
    )
    const { descriptor, errors } = parse(text, { filename })
    assert.equal(errors.length, 0, file)
    const script = compileScript(descriptor, {
      id: 'check',
      fs: { fileExists: existsSync, readFile: (path) => readFileSync(path, 'utf8') },
    })
    const template = compileTemplate({
      source: descriptor.template.content,
      filename: 'check.vue',
      id: 'check',
      compilerOptions: { bindingMetadata: script.bindings },
    })
    assert.equal(template.errors.length, 0, file)
    return js(script.content) + js(template.code)
  }
  if (file.endsWith('.less')) return text.replace(/\s+/g, '').replaceAll('"', "'")
  return js(text)
}
const cedar = resolve(root, 'cedar-design-web/packages/ui/src/input-number')
const maple = resolve(root, 'maple-design-mobile/packages/ui/src/input-number')
for (const file of files) {
  assert.equal(
    canonical(readFileSync(resolve(cedar, file), 'utf8'), file, resolve(cedar, file)),
    canonical(readFileSync(resolve(maple, file), 'utf8'), file, resolve(maple, file)),
    'InputNumber drift: ' + file,
  )
}
for (const name of demos) {
  assert.equal(
    canonical(
      readFileSync(resolve(cedar, '__demos__', name + '.vue'), 'utf8'),
      name + '.vue',
      resolve(cedar, '__demos__', name + '.vue'),
    ),
    canonical(
      readFileSync(resolve(maple, 'example/demos', name + '.vue'), 'utf8'),
      name + '.vue',
      resolve(maple, 'example/demos', name + '.vue'),
    ),
    'Demo drift: ' + name,
  )
}
console.log(
  'InputNumber: ' +
    files.length +
    ' independent view/core/style/test pairs and ' +
    demos.length +
    ' demo pairs verified.',
)
