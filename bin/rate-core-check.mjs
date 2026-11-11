import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(resolve(root, 'maple-design-mobile/node_modules/.pnpm/node_modules/esbuild/package.json'))
const { transformSync } = require('esbuild')
const uiRequire = createRequire(resolve(root, 'cedar-design-web/packages/ui/package.json'))
const less = uiRequire('less')
const ts = uiRequire('typescript')
const c = resolve(root, 'cedar-design-web/packages/ui/src/rate')
const m = resolve(root, 'maple-design-mobile/packages/ui/src/rate')
function normalize(source) {
  return source.replaceAll('../_utils/empty-value', '../utils/empty-value').replaceAll('../_utils/global-config', '../utils/components')
    .replaceAll('../_utils/size-length', '../utils/size-length')
    .replace(/@cedar-design\/icons-vue\/[^'"]+/g, '@maple-design/icons-vue')
    .replaceAll('c-rate', 'mp-rate').replaceAll('--c-', '--mp-')
    .replaceAll('<c-', '<mp-').replaceAll('</c-', '</mp-')
}
function script(source) {
  const imports = []
  const js = transformSync(normalize(source), { loader: 'tsx', format: 'esm', treeShaking: false }).code
  const body = js.replace(/import\s+([\s\S]*?)\s+from\s+["']([^"']+)["'];/g, (_, names, path) => {
    names.replace(/[{}]/g, '').split(',').map(v => v.trim()).filter(Boolean).forEach(name => imports.push(path + ':' + name))
    return ''
  })
  return imports.sort().join('\n') + transformSync(body, { loader: 'js', minify: true }).code
}
// Runtime transpilation erases types. Compare Props/Emits/Expose/slot declarations as well.
function typedContract(source) {
  const ast = ts.createSourceFile('props.ts', normalize(source), ts.ScriptTarget.Latest, true)
  assert.equal(ast.parseDiagnostics.length, 0, 'public types must parse')
  function visit(node) {
    if ([ts.SyntaxKind.CommaToken, ts.SyntaxKind.SemicolonToken, ts.SyntaxKind.EndOfFileToken].includes(node.kind)) return undefined
    const children = node.getChildren(ast).map(visit).filter(value => value !== undefined)
    return children.length ? [node.kind, children] : [node.kind, node.text ?? node.getText(ast)]
  }
  return JSON.stringify(visit(ast))
}
assert.equal(typedContract(readFileSync(resolve(c, 'props.ts'), 'utf8')), typedContract(readFileSync(resolve(m, 'props.ts'), 'utf8')), 'public TypeScript contracts')
for (const file of ['props.ts', 'count.ts', 'rate-core.tsx', '__tests__/interaction.spec.js', '__tests__/preview-gap.spec.js', '__tests__/public-slots-count.spec.js']) {
  assert.equal(script(readFileSync(resolve(c, file), 'utf8')), script(readFileSync(resolve(m, file), 'utf8')), file)
}
for (const file of ['style/index.less', 'style/rate.less', 'style/index.ts', 'style/appearance.less']) {
  assert.equal(normalize(readFileSync(resolve(c, file), 'utf8')).replace(/\s+/g, ''), normalize(readFileSync(resolve(m, file), 'utf8')).replace(/\s+/g, ''), file)
}
for (const name of ['keyboard', 'sizes-and-symbols']) {
  assert.equal(normalize(readFileSync(resolve(c, '__demos__', name + '.vue'), 'utf8')).replace(/\s+/g, ''), normalize(readFileSync(resolve(m, 'example/demos', name + '.vue'), 'utf8')).replace(/\s+/g, ''), name)
}
for (const [dir, prefix] of [[c, 'c'], [m, 'mp']]) {
  const filename = resolve(dir, 'style/index.less')
  const { css } = await less.render(readFileSync(filename, 'utf8'), { filename })
  assert.match(css, new RegExp(`\\.${prefix}-rate\\s*\\{[^}]*--${prefix}-internal-rate-size:`), 'resolve private adapters on the actual component so local public overrides work')
  const publicTokens = [...css.matchAll(new RegExp(`--${prefix}-rate-([a-z-]+)\\s*:`, 'g'))].map(match => match[1]).sort()
  assert.deepEqual(publicTokens, ['size', 'gap', 'min-height', 'action-padding', 'empty-color', 'active-color', 'disabled-color', 'error-color', 'transition-duration', 'scale-duration', 'transition-timing-function', 'active-scale', 'focus-color', 'focus-width', 'focus-offset'].sort(), 'complete public token surface')
  for (const token of publicTokens) assert.ok(css.includes(`var(--${prefix}-rate-${token})`), `public token ${token} must be consumed`)
  assert.ok(css.includes('.' + prefix + '-rate__content.' + prefix + '-rate--primary'), 'active color selector')
  assert.ok(css.includes('.' + prefix + '-rate--disabled .' + prefix + '-rate__content'), 'disabled selector')
  assert.ok(css.includes(':focus-visible'), 'visible focus')
  assert.ok(css.includes('prefers-reduced-motion'), 'reduced motion')
  assert.match(css, new RegExp(`\\.${prefix}-rate__content-scale\\s*\\{[^}]*animation: ${prefix}-rate-scale var\\(--${prefix}-internal-rate-scale-duration\\) var\\(--${prefix}-internal-rate-timing-function\\)`), 'scale animation consumes its own duration and easing')
  assert.ok(css.includes(`transition: transform var(--${prefix}-internal-rate-duration) var(--${prefix}-internal-rate-timing-function)`), 'ordinary transitions consume easing')
  if (prefix === 'c') {
    assert.ok(css.includes('--c-internal-rate-scale-duration: var(--c-rate-scale-duration)'), 'public scale duration remains customizable')
    assert.ok(css.includes('--c-internal-rate-timing-function: var(--c-rate-transition-timing-function)'), 'public timing function remains customizable')
  }
}
console.log('Rate: 6 core/test pairs, 4 style-entry/rule pairs, 2 demo pairs and both compiled styles verified. Only local Form integration and registered public token defaults remain platform-specific.')
