import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(resolve(root, 'cedar-design-web/packages/ui/package.json'))
const { parse, compileTemplate } = require('@vue/compiler-sfc')
const { transformSync } = require('esbuild')
const ts = require('typescript')
const c = resolve(root, 'cedar-design-web/packages/ui/src')
const m = resolve(root, 'maple-design-mobile/packages/ui/src')
const normalize = (s) =>
  s
    .replaceAll('../_utils/empty-value', '../utils/empty-value')
    .replaceAll('../_utils/global-config', '../utils/components')
    .replaceAll('../_utils/constant', '../utils/constants')
    .replaceAll('../_utils/input-composition', '../utils/input-composition')
    .replaceAll('../_utils/text-input-value', '../utils/text-input-value')
    .replaceAll('@cedar-design/ui-vue', '@maple-design/ui-vue')
    .replaceAll('@cedar-design/icons-vue', '@maple-design/icons-vue')
    .replaceAll('./input.vue', './Input.vue')
    .replaceAll('--c-', '--mp-')
    .replaceAll('.c-', '.mp-')
    .replaceAll('c-input-', 'mp-input-')
    .replaceAll('<c-', '<mp-')
    .replaceAll('</c-', '</mp-')
const sorted = (s) => {
  const imports = []
  const body = s.replace(/^import\s+(?:[\s\S]*?\s+from\s+)?['"][^'"]+['"];?\s*$/gm, (entry) => {
    imports.push(entry.trim())
    return ''
  })
  return (
    imports.sort((a, b) => a.match(/['"]([^'"]+)['"]/)[1].localeCompare(b.match(/['"]([^'"]+)['"]/)[1])).join('\n') +
    '\n' +
    body
  )
}
const js = (s) => transformSync(sorted(s), { loader: 'ts', format: 'esm', minify: true, treeShaking: false }).code
function typed(s) {
  const ast = ts.createSourceFile('contract.ts', sorted(s), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  assert.equal(ast.parseDiagnostics.length, 0, 'TypeScript contract must parse')
  const visit = (node) => {
    if (node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode) return undefined
    if ([ts.SyntaxKind.CommaToken, ts.SyntaxKind.SemicolonToken, ts.SyntaxKind.EndOfFileToken].includes(node.kind))
      return undefined
    const children = node
      .getChildren(ast)
      .map(visit)
      .filter((value) => value !== undefined)
    return children.length
      ? [node.kind, children]
      : [node.kind, typeof node.text === 'string' ? node.text : node.getText(ast)]
  }
  return JSON.stringify(visit(ast))
}
assert.equal(
  typed('/** first description */ export interface Value { value: number }'),
  typed('/** translated description */ export interface Value { value: number }'),
  'Documentation comments do not change type contracts',
)
assert.notEqual(
  typed('export interface Value { value: number }'),
  typed('export interface Value { value: string }'),
  'Property type changes must remain visible',
)
assert.notEqual(
  typed('export interface Expose { focus(): void }'),
  typed('export interface Expose { blur(): void }'),
  'Type-only API drift must remain visible',
)
function canonical(s, file) {
  s = normalize(s)
  s = s.replaceAll("from '../_utils/vue-compat'", "from '../utils/vue-compat'")
  s = s.replaceAll('../_utils/popup-container', '../utils/popup-container')
  if (file === 'textarea/__demos__/auto-size.vue') {
    s = s.replace('from "../../__demos__/locale"', 'from "../../../__demos__/locale"')
  }
  if (file.endsWith('.vue')) {
    const { descriptor, errors } = parse(s, { filename: 'paired.vue' })
    assert.equal(errors.length, 0, file)
    const template = compileTemplate({ source: descriptor.template.content, filename: 'paired.vue', id: 'paired' })
    assert.equal(template.errors.length, 0, file)
    return (
      js(descriptor.scriptSetup?.content ?? descriptor.script?.content ?? '') +
      js(template.code) +
      descriptor.styles.map((s) => s.content.replace(/\s+/g, '')).join('')
    )
  }
  if (file.endsWith('.less')) return s.replace(/\s+/g, '').replaceAll('"', "'")
  if (/(?:types|props|context)\.ts$/.test(file)) return typed(s)
  return js(s)
}
const pairs = [
  ['input/input.vue', 'input/Input.vue'],
  ...[
    'props.ts',
    'types.ts',
    'context.ts',
    'native-attrs.ts',
    'use-input-value.ts',
    'InputGroup.vue',
    'InputGroupLabel.vue',
    'InputPassword.vue',
    'InputFeedback.vue',
    'style/input.less',
    'style/group.less',
    'style/token.less',
    '__tests__/pipeline.spec.js',
    '__tests__/trim-model.spec.ts',
    '__tests__/limit-parameters.spec.ts',
    '__tests__/field-helper-repair.spec.ts',
    '__tests__/group-editor-state.spec.ts',
  ].map((p) => ['input/' + p, 'input/' + p]),
  ['textarea/textarea.vue', 'textarea/Textarea.vue'],
  ['textarea/__demos__/auto-size.vue', 'textarea/example/demos/auto-size.vue'],
  ...[
    'props.ts',
    'types.ts',
    'utils.ts',
    'use-textarea-auto-size.ts',
    'style/index.less',
    '__tests__/body-contract.spec.js',
    '__tests__/auto-size.spec.ts',
    '__tests__/parameter-contract.spec.ts',
  ].map((p) => ['textarea/' + p, 'textarea/' + p]),
  ['input/__demos__/event-pipeline.vue', 'input/example/demos/event-pipeline.vue'],
  ['textarea/__demos__/body-contract.vue', 'textarea/example/demos/body-contract.vue'],
]
for (const [a, b] of pairs)
  assert.equal(
    canonical(readFileSync(resolve(c, a), 'utf8'), a),
    canonical(readFileSync(resolve(m, b), 'utf8'), b),
    'Input/Textarea copy drift: ' + a,
  )
console.log(
  'Input/Textarea: ' +
    pairs.length +
    ' independent body, API, style, test and demo pairs verified; local Form/install adapters and declared textarea defaults are excluded.',
)
