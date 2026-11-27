import ts from 'typescript-js'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(resolve(root, 'cedar-design-web/packages/ui/package.json'))
const { parse, compileTemplate } = require('@vue/compiler-sfc')
const esRequire = createRequire(
  resolve(root, 'maple-design-mobile/node_modules/.pnpm/node_modules/esbuild/package.json'),
)
const { transformSync } = esRequire('esbuild')
const pairs = [
  ['upload/upload.vue', 'upload/Upload.vue'],
  ...[
    'use-trigger.ts',
    '__tests__/trigger-ownership.spec.js',
    'props.ts',
    'interfaces.ts',
    'form-adapter.ts',
    'composables/use-uploader.ts',
    'composables/use-upload-queue.ts',
    'composables/use-file-picker.ts',
    'utils/request.ts',
    'utils/thumbnail.ts',
    'utils/accept.ts',
    'utils/uid.ts',
    'style/index.less',
    'style/token.less',
    '__tests__/body-contract.spec.js',
    '__tests__/core-contract.spec.ts',
  ].map((file) => ['upload/' + file, 'upload/' + file]),
  ...['read-only', 'manual-upload', 'replacement', 'custom-surface', 'external-state'].map((file) => [
    'upload/__demos__/' + file + '.vue',
    'upload/example/demos/' + file + '.vue',
  ]),
]
function normalize(source) {
  return source
    .replaceAll('@cedar-design/icons-vue', '@maple-design/icons-vue')
    .replaceAll('imagePreview as previewImage', 'previewImage')
    .replaceAll('../image/preview-api', '../image/preview')
    .replaceAll('../_utils/global-config', '../utils/components')
    .replaceAll('../_utils/constant', '../utils/constants')
    .replaceAll('../_utils/size-length', '../utils/size-length')
    .replaceAll('--c-', '--mp-')
    .replaceAll('.c-', '.mp-')
    .replaceAll('<c-', '<mp-')
    .replaceAll('</c-', '</mp-')
    .replaceAll('./Radio.vue', './radio.vue')
    .replaceAll('./Checkbox.vue', './checkbox.vue')
    .replaceAll('./RadioGroup.vue', './radio-group.vue')
    .replaceAll('./CheckboxGroup.vue', './checkbox-group.vue')
    .replace(/\bDirection\b/g, 'Orientation')
}
function tokens(source) {
  const ast = ts.createSourceFile('contract.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const visit = (node) => {
    if (ts.isReturnStatement(node) && !node.expression) return [node.kind]
    // ESLint adds braces around a single non-declaring statement; no lexical scope is introduced.
    if (
      ts.isBlock(node) &&
      node.statements.length === 1 &&
      [
        ts.SyntaxKind.ExpressionStatement,
        ts.SyntaxKind.ReturnStatement,
        ts.SyntaxKind.ThrowStatement,
        ts.SyntaxKind.BreakStatement,
        ts.SyntaxKind.ContinueStatement,
      ].includes(node.statements[0].kind) &&
      ts.isIfStatement(node.parent)
    )
      return visit(node.statements[0])
    if ([ts.SyntaxKind.CommaToken, ts.SyntaxKind.SemicolonToken, ts.SyntaxKind.EndOfFileToken].includes(node.kind))
      return undefined
    if (ts.isParenthesizedExpression(node)) return visit(node.expression)
    if (ts.isBlock(node) && node.statements.length === 1 && ts.isForOfStatement(node.parent))
      return visit(node.statements[0])
    const children = []
    ts.forEachChild(node, (child) => {
      const value = visit(child)
      if (value !== undefined) children.push(value)
    })
    if (children.length) return [node.kind, children]
    if (ts.isBlock(node)) return [node.kind, []]
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
      // Only the known public import differs; runtime string values remain strict.
      const localImports = {
        '@cedar-design/ui-vue': '@maple-design/ui-vue',
        '../_utils/empty-value': '../utils/empty-value',
      }
      const path = localImports[node.moduleSpecifier.text] ?? node.moduleSpecifier.text
      const clause = node.importClause
      if (!clause) imports.push([path, 'side-effect'])
      else {
        const type = clause.isTypeOnly ? 'type' : 'value'
        if (clause.name) imports.push([path, type, 'default', clause.name.text])
        const named = clause.namedBindings
        if (named && ts.isNamedImports(named)) {
          for (const entry of named.elements)
            imports.push([
              path,
              entry.isTypeOnly ? 'type' : type,
              entry.propertyName?.text || entry.name.text,
              entry.name.text,
            ])
        } else if (named) imports.push([path, type, '*', named.name.text])
      }
    } else statements.push(node.getText(ast))
  }
  return (
    JSON.stringify(imports.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))) +
    tokens(statements.join('\n'))
  )
}
export function canonical(source, file) {
  source = normalize(source)
  if (file.endsWith('.vue')) {
    const { descriptor, errors } = parse(source, { filename: 'contract.vue' })
    assert.equal(errors.length, 0, file)
    if (!file.includes('__demos__') && !file.includes('/demos/'))
      assert.equal(descriptor.styles.length, 0, 'Component styles must stay in style entries')
    const isDemo = file.includes('__demos__') || file.includes('/demos/')
    const result = compileTemplate({
      source: descriptor.template?.content || '',
      filename: 'contract.vue',
      id: 'contract',
      compilerOptions: {
        comments: false,
        nodeTransforms: [
          (node, context) => {
            // Formatting-only boundary whitespace on ordinary block paragraphs/outputs.
            // Preserve inline separators, interpolations, preformatted text and all real content.
            const parent = context.parent
            if (!isDemo || node.type !== 2 || parent?.type !== 1 || !['p', 'output'].includes(parent.tag)) return
            if (parent.children[0] === node) node.content = node.content.trimStart()
            if (parent.children[parent.children.length - 1] === node) node.content = node.content.trimEnd()
          },
        ],
      },
    })
    assert.equal(result.errors.length, 0, file)
    return (
      script(descriptor.scriptSetup?.content || descriptor.script?.content || '') +
      transformSync(result.code, { loader: 'ts', minify: true }).code +
      descriptor.styles.map((style) => style.content.replace(/\s+/g, '')).join('')
    )
  }
  if (file.endsWith('.less'))
    return source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '')
      .replace(/\s+/g, '')
      .replaceAll('"', "'")
  return script(source)
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = []
  assert.match(
    readFileSync(resolve(root, 'cedar-design-web/packages/ui/src/upload/upload.vue'), 'utf8'),
    /from ['"]\.\.\/_utils\/global-config['"]/,
    'Cedar must retain its valid local component utilities import',
  )
  assert.match(
    readFileSync(resolve(root, 'maple-design-mobile/packages/ui/src/upload/Upload.vue'), 'utf8'),
    /from ['"]\.\.\/utils\/components['"]/,
    'Maple must retain its valid local component utilities import',
  )
  for (const [cedar, maple] of pairs) {
    const left = canonical(readFileSync(resolve(root, 'cedar-design-web/packages/ui/src', cedar), 'utf8'), cedar)
    const right = canonical(readFileSync(resolve(root, 'maple-design-mobile/packages/ui/src', maple), 'utf8'), maple)
    if (left !== right) {
      const index = [...left].findIndex((char, i) => char !== right[i])
      errors.push(
        cedar +
          ' <> ' +
          maple +
          '\n  Cedar: ' +
          left.slice(Math.max(0, index - 80), index + 160) +
          '\n  Maple: ' +
          right.slice(Math.max(0, index - 80), index + 160),
      )
    }
  }
  if (errors.length) {
    console.error('Upload body drift:\n' + errors.join('\n'))
    process.exitCode = 1
  } else {
    console.log(
      'Upload: ' +
        pairs.length +
        ' independent SFC/props/types/style/test/demo pairs verified, including public TypeScript declarations.',
    )
    console.log(
      'Explicit exclusions: local preview presentation, locale adapters and install/index entry protocols. These remain independent and do not imply whole-directory same source.',
    )
  }
}
