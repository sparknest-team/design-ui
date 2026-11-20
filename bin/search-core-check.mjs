import { normalizeCopiedTypeScript } from './copied-source-normalization.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(resolve(root, 'cedar-design-web/packages/ui/package.json'))
const ts = require('typescript')
const less = require('less')
const { parse, compileTemplate } = require('@vue/compiler-sfc')
const esRequire = createRequire(resolve(root, 'maple-design-mobile/node_modules/.pnpm/node_modules/esbuild/package.json'))
const { transformSync } = esRequire('esbuild')
const pairs = [
  ...['types.ts', 'result.ts', 'FieldSelect.vue'].map(file => ['search/' + file, 'search/' + file]),
  ['search/__demos__/controlled-fields.vue', 'search/example/demos/fields.vue'],
]
function normalize(source) {
  return source.replaceAll('../_utils/empty-value', '../utils/empty-value').replaceAll('@cedar-design/ui-vue', '@maple-design/ui-vue').replaceAll('c-input__', 'mp-input__')
    .replace("default: 'round'", "default: 'square'").replaceAll('c-list', 'mp-list').replaceAll('../_utils/global-config', '../utils/components')
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
    if ([ts.SyntaxKind.OpenParenToken, ts.SyntaxKind.CloseParenToken].includes(node.kind) && ts.isArrowFunction(node.parent)) return undefined
    if (ts.isParenthesizedExpression(node)) return visit(node.expression)
    // ESLint adds braces around a single non-declaring statement; no lexical scope is introduced.
    if (ts.isBlock(node) && node.statements.length === 1 && [ts.SyntaxKind.ExpressionStatement, ts.SyntaxKind.ReturnStatement, ts.SyntaxKind.ThrowStatement, ts.SyntaxKind.BreakStatement, ts.SyntaxKind.ContinueStatement].includes(node.statements[0].kind) && (ts.isIfStatement(node.parent) || ts.isForOfStatement(node.parent))) return visit(node.statements[0])
    if ([ts.SyntaxKind.EmptyStatement, ts.SyntaxKind.CommaToken, ts.SyntaxKind.SemicolonToken, ts.SyntaxKind.EndOfFileToken].includes(node.kind)) return undefined
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
    const result = compileTemplate({ source: descriptor.template?.content || '', filename: 'contract.vue', id: 'contract', compilerOptions: { comments: false } })
    assert.equal(result.errors.length, 0, file)
    return script(descriptor.scriptSetup?.content || descriptor.script?.content || '') + normalizeCopiedTypeScript(result.code, transformSync, 'js')
  }
  if (file.endsWith('.less')) return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').replace(/\s+/g, '').replaceAll('"', "'")
  return script(source)
}

const roots = ['cedar-design-web/packages/ui', 'maple-design-mobile/packages/ui']
for (const [cedar, maple] of pairs) {
  const left = canonical(readFileSync(resolve(root, roots[0], 'src', cedar), 'utf8'), cedar)
  const right = canonical(readFileSync(resolve(root, roots[1], 'src', maple), 'utf8'), maple)
  if (left !== right) { const index = [...left].findIndex((char, i) => char !== right[i]); throw new Error('Search drift: ' + cedar + '\nCedar: ' + left.slice(index - 90, index + 140) + '\nMaple: ' + right.slice(index - 90, index + 140)) }
}
// History presentation is platform-specific. Keep comparing the shared model and action logic.
const sharedMethods = ['updateValue', 'getRecentSearches', 'getResult', 'handleHistorySelect', 'handleFieldChange', 'handleAction']
function sharedControl(repo) {
  const path = resolve(root, repo, 'src/search/use-search-control.ts')
  const ast = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true)
  const control = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'useSearchControl')
  return sharedMethods.map(name => {
    const method = control?.body.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name)
    assert.ok(method, name)
    return tokens(method.getText(ast))
  })
}
assert.deepEqual(sharedControl(roots[0]), sharedControl(roots[1]), 'Shared keyword, field model and action logic')
function sharedProps(repo) {
  const path = resolve(root, repo, 'src/search/props.ts')
  const ast = ts.createSourceFile(path, normalize(readFileSync(path, 'utf8')), ts.ScriptTarget.Latest, true)
  const declaration = ast.statements.filter(ts.isVariableStatement)
    .flatMap(statement => [...statement.declarationList.declarations])
    .find(node => node.name.getText(ast) === 'searchProps')
  return declaration.initializer.properties
    .filter(property => !['editMode', 'shape'].includes(property.name?.getText(ast)))
    .map(property => tokens('const props = {' + property.getText(ast) + '}'))
}
assert.deepEqual(sharedProps(roots[0]), sharedProps(roots[1]), 'Shared Search props')
const suffixes = []
for (const [index, repo] of roots.entries()) {
  const props = readFileSync(resolve(root, repo, 'src/search/props.ts'), 'utf8')
  const presentation = props.match(/editMode:\s*\{\s*type: String as PropType<SearchEditMode>,\s*default: ['"](direct|popup)['"]/)?.[1]
  const shape = props.match(/shape:\s*\{[\s\S]*?default: ['"](square|round)['"]/ )?.[1]
  if (index === 0) {
    assert.match(props, /editMode:\s*inputProps\.editMode\b/, 'Cedar Search shares Input editing modes')
  } else {
    assert.equal(presentation, 'direct', 'Maple Search defaults to direct editing')
  }
  assert.doesNotMatch(props, /\b(?:presentation|historyPopup)\s*:/, 'Removed boolean presentation API must not return')
  assert.equal(shape, index === 0 ? 'square' : 'round', 'Declared platform shape default')
}
for (const repo of roots) {
  const filename = resolve(root, repo, 'src/search/style/index.less')
  const { css } = await less.render(readFileSync(filename, 'utf8'), { filename })
  assert.ok(css.includes('search__history-item'))
  const tokens = readFileSync(resolve(root, repo, 'src/search/style/token.less'), 'utf8')
  suffixes.push([...tokens.matchAll(/--(?:c|mp)-search-([a-z0-9-]+):/g)].map(match => match[1]).sort())
  const source = readFileSync(resolve(root, repo, repo === roots[0] ? 'src/search/search.vue' : 'src/search/Search.vue'), 'utf8')
  const { descriptor } = parse(source)
  assert.ok(descriptor.scriptSetup, 'Main component must use script setup')
  assert.ok(source.includes('useSearchControl(props, emit,'), 'Main component consumes the local control')
}
assert.deepEqual(suffixes[0], suffixes[1], 'Public token suffixes')
console.log('Search shared types, field selector, controlled model, actions and tokens verified. Cedar uses Input editing modes; Maple supports direct and popup.')
