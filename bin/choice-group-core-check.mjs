import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(resolve(root, 'maple-design-mobile/node_modules/.pnpm/node_modules/esbuild/package.json'))
const { transformSync } = require('esbuild')
const requireUI = createRequire(resolve(root, 'cedar-design-web/packages/cedar-ui/package.json'))
const { parse, compileScript, compileTemplate } = requireUI('@vue/compiler-sfc')
const files = ['../radio/use-radio-navigation.ts', '../radio/variant.ts', '../radio/style/radio-button.less', '../radio/style/radio-button-token.less', '__tests__/radio-navigation.spec.js', 'use-checkbox-group-methods.ts', '__tests__/group-methods.spec.js', 'choice-options.ts', 'choice-group-props.ts', 'choice-label.ts', '__tests__/group-options.spec.js', 'choice-value-props.ts', 'use-choice-control.ts', 'use-choice-keyboard.ts', '__tests__/control-contract.spec.js', 'choice-state.ts', '__tests__/choice-state.spec.js', '__tests__/group-contract.spec.js', '__tests__/group-ssr.spec.js']
const demos = ['group-state', 'async-options', 'control-value', 'option-data']
const normalize = text => text
  .replaceAll('../_utils/global-config', '../utils/components')
  .replaceAll('../_utils/input-composition', '../utils/input-composition')
  .replaceAll('../_utils/constant', '../utils/constants')
  .replaceAll('@cedar-design/ui', '@maple-design/ui')
  .replaceAll('@cedar-design/icons-vue', '@maple-design/icons-vue')
  .replaceAll('--c-', '--mp-').replaceAll('.c-', '.mp-')
  .replaceAll('<c-', '<mp-').replaceAll('</c-', '</mp-')
function sortImports(text) {
  const imports = []
  const body = text.replace(/^import\s+(?:[\s\S]*?\s+from\s+)?['"][^'"]+['"];?\s*$/gm, declaration => {
    imports.push(declaration.trim().replaceAll('"', "'").replace(/\s+/g, ' '))
    return ''
  })
  return imports.sort((a, b) => a.match(/'([^']+)'/)[1].localeCompare(b.match(/'([^']+)'/)[1])).join('\n') + '\n' + body
}
const js = text => transformSync(sortImports(text), { loader: 'ts', format: 'esm', minify: true, treeShaking: false }).code
function canonical(text, file) {
  text = normalize(text)
  if (file.endsWith('.vue')) {
    text = text.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/g, (_match, start, body, end) => start + '\n' + sortImports(body) + '\n' + end)
    const { descriptor, errors } = parse(text, { filename: 'check.vue' })
    assert.equal(errors.length, 0, file)
    const script = compileScript(descriptor, { id: 'check' })
    const template = compileTemplate({ source: descriptor.template.content, filename: 'check.vue', id: 'check', compilerOptions: { bindingMetadata: script.bindings } })
    assert.equal(template.errors.length, 0, file)
    return js(script.content) + js(template.code)
  }
  if (file.endsWith('.less')) return text.replace(/\s+/g, '').replaceAll('"', "'")
  return js(text)
}

for (const file of files) {
  const c = resolve(root, 'cedar-design-web/packages/cedar-ui/src/checkbox', file)
  const m = resolve(root, 'maple-design-mobile/packages/maple-ui/src/checkbox', file)
  assert.equal(canonical(readFileSync(c, 'utf8'), file), canonical(readFileSync(m, 'utf8'), file), 'Choice core drift: ' + file)
}
for (const component of ['checkbox', 'radio']) {
  for (const name of component === 'checkbox' ? [...demos, 'group-methods'] : [...demos, 'keyboard-navigation', 'button-sizes']) {
    const c = resolve(root, 'cedar-design-web/packages/cedar-ui/src', component, '__demos__', name + '.vue')
    const m = resolve(root, 'maple-design-mobile/packages/maple-ui/src', component, 'example/demos', name + '.vue')
    assert.equal(canonical(readFileSync(c, 'utf8'), name + '.vue'), canonical(readFileSync(m, 'utf8'), name + '.vue'), 'Choice demo drift: ' + component + '/' + name)
  }
}
console.log('Choice groups: 19 independent core/style/test pairs and 11 demo pairs verified; component bodies/styles are verified separately by choice-body-check.mjs.')
