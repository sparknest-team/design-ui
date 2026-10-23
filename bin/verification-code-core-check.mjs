import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(resolve(root, 'cedar-design-web/packages/cedar-ui/package.json'))
const ts = require('typescript')
const { parse, compileTemplate } = require('@vue/compiler-sfc')
const esRequire = createRequire(resolve(root, 'maple-design-mobile/node_modules/.pnpm/node_modules/esbuild/package.json'))
const { transformSync } = esRequire('esbuild')
const pairs = [
  ['verification-code/verification-code.vue', 'verification-code/VerificationCode.vue'],
  ...['props.ts', 'types.ts', 'style/index.less', 'style/token.less', 'style/index.ts', '__tests__/body-contract.spec.js'].map(file => ['verification-code/' + file, 'verification-code/' + file]),
  ...['basic', 'formatting', 'appearance', 'states'].map(file => ['verification-code/__demos__/' + file + '.vue', 'verification-code/example/demos/' + file + '.vue']),
]
function normalize(source) {
  return source.replaceAll('../_utils/global-config', '../utils/components')
    .replaceAll('../_utils/constant', '../utils/constants')
    .replaceAll('../_utils/size-length', '../utils/size-length')
    .replaceAll('--c-', '--mp-').replaceAll('.c-', '.mp-')
    .replaceAll('<c-', '<mp-').replaceAll('</c-', '</mp-')
    .replaceAll('./Radio.vue', './radio.vue').replaceAll('./Checkbox.vue', './checkbox.vue')
    .replaceAll('./RadioGroup.vue', './radio-group.vue').replaceAll('./CheckboxGroup.vue', './checkbox-group.vue')
    .replace(/\bDirection\b/g, 'Orientation')
}
function tokens(source) {
  const ast = ts.createSourceFile('contract.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const visit = node => {
    // ESLint adds braces around a single non-declaring statement; no lexical scope is introduced.
    if (ts.isBlock(node) && node.statements.length === 1 && [ts.SyntaxKind.ExpressionStatement, ts.SyntaxKind.ReturnStatement, ts.SyntaxKind.ThrowStatement, ts.SyntaxKind.BreakStatement, ts.SyntaxKind.ContinueStatement].includes(node.statements[0].kind) && ts.isIfStatement(node.parent)) return visit(node.statements[0])
    if ([ts.SyntaxKind.CommaToken, ts.SyntaxKind.SemicolonToken, ts.SyntaxKind.EndOfFileToken].includes(node.kind)) return undefined
    const children = node.getChildren(ast).map(visit).filter(value => value !== undefined)
    if (children.length) return [node.kind, children]
    return [node.kind, typeof node.text === 'string' ? node.text : node.getText(ast)]
  }
  return JSON.stringify(visit(ast))
}
function script(source) {
  source = normalize(source)
  const ast = ts.createSourceFile('contract.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  assert.equal(ast.parseDiagnostics.length, 0, 'TypeScript syntax must parse')
  const imports = []
  const statements = []
  for (const node of ast.statements) {
    if (ts.isImportDeclaration(node)) {
      const path = node.moduleSpecifier.text
      const clause = node.importClause
      if (!clause) imports.push([path, 'side-effect'])
      else {
        const type = clause.isTypeOnly ? 'type' : 'value'
        if (clause.name) imports.push([path, type, 'default', clause.name.text])
        const named = clause.namedBindings
        if (named && ts.isNamedImports(named)) {
          for (const entry of named.elements) imports.push([path, entry.isTypeOnly ? 'type' : type, entry.propertyName?.text || entry.name.text, entry.name.text])
        } else if (named) imports.push([path, type, '*', named.name.text])
      }
    } else statements.push(node.getText(ast))
  }
  return JSON.stringify(imports.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))) + tokens(statements.join('\n'))
}
function canonical(source, file) {
  source = normalize(source)
  if (file.endsWith('.vue')) {
    const { descriptor, errors } = parse(source, { filename: 'contract.vue' })
    assert.equal(errors.length, 0, file)
    if (!file.includes('__demos__') && !file.includes('/demos/')) assert.equal(descriptor.styles.length, 0, 'Component styles must stay in style entries')
    const result = compileTemplate({ source: descriptor.template?.content || '', filename: 'contract.vue', id: 'contract', compilerOptions: { comments: false } })
    assert.equal(result.errors.length, 0, file)
    return script(descriptor.scriptSetup?.content || descriptor.script?.content || '') + transformSync(result.code, { loader: 'js', minify: true }).code + descriptor.styles.map(style => style.content.replace(/\s+/g, '')).join('')
  }
  if (file.endsWith('.less')) return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').replace(/\s+/g, '').replaceAll('"', "'")
  return script(source)
}
const errors = []
for (const [cedar, maple] of pairs) {
  const left = canonical(readFileSync(resolve(root, 'cedar-design-web/packages/cedar-ui/src', cedar), 'utf8'), cedar)
  const right = canonical(readFileSync(resolve(root, 'maple-design-mobile/packages/maple-ui/src', maple), 'utf8'), maple)
  if (left !== right) {
    const index = [...left].findIndex((char, i) => char !== right[i])
    errors.push(cedar + ' <> ' + maple + '\n  Cedar: ' + left.slice(Math.max(0, index - 80), index + 160) + '\n  Maple: ' + right.slice(Math.max(0, index - 80), index + 160))
  }
}
if (errors.length) {
  console.error('VerificationCode body drift:\n' + errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('VerificationCode: ' + pairs.length + ' independent SFC/props/types/style/test/demo pairs verified, including public TypeScript declarations.')
  console.log('Explicit exclusions: local Form adapters and install/index entry protocols. These remain independent and do not imply whole-directory same source.')
}
