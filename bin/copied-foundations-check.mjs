import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { checkSharedSourceContract } from './shared-source-contract.mjs'

const requireFromMaple = createRequire(
  new URL('../../maple-design-mobile/node_modules/.pnpm/node_modules/esbuild/package.json', import.meta.url),
)
const { transformSync } = requireFromMaple('esbuild')

// Read-only. Libraries retain independent source, runtime and component instances.
const root = fileURLToPath(new URL('../../', import.meta.url))
console.log(`Verified ${checkSharedSourceContract()} shared modules including type declarations and source inventory.`)
for (const library of ['cedar-design-web/packages/ui', 'maple-design-mobile/packages/ui']) {
  const directory = resolve(root, library, 'src/menu')
  assert.ok(!existsSync(resolve(directory, 'platform.ts')), 'Menu platform aggregation must not return')
  const props = await readFile(resolve(directory, 'props.ts'), 'utf8')
  assert.ok(!props.includes('rootPlatformProps'), 'Public positioning must be declared explicitly')
  assert.match(props, /strategy:\s*triggerPropDefaults.strategy/)
}
const pairs = [
  ['ui/src/__tests__/foundation/popup-transition.spec.js', 'ui/src/__tests__/foundation/popup-transition.spec.js'],
  ...['props', 'option-props', 'branch-props', 'types', 'context', 'level', 'keyboard', 'selection', 'trigger-options'].map(name => [`ui/src/menu/${name}.ts`, `ui/src/menu/${name}.ts`]),
  ...['index', 'onSmartMounted', 'onSmartUnmounted', 'onWindowResize', 'useChildren', 'useClickOutside', 'useClientId', 'useEventListener', 'useId', 'useInitialized', 'useMotion', 'useParent', 'useTouch', 'useVModel', 'useWindowSize'].map(name => [`use/src/${name}.ts`, `use/src/${name}.ts`]),
  ['shared/src/index.ts', 'shared/src/index.ts'],
  ...['array', 'dom', 'function', 'motion', 'namespace', 'number', 'object', 'predicates', 'string'].map(name => [`shared/src/${name}.ts`, `shared/src/${name}.ts`]),
  ['ui/src/trigger/position.ts', 'ui/src/trigger/position.ts'],
  ...['popup-container', 'popup-layer', 'scroll-lock', 'modal-focus', 'modal-surface', 'async-request', 'option-data', 'field-path', 'form-control-context', 'input-composition', 'text-input-value', 'picker-data', 'resize-observer', 'popup-transition', 'responsive-observe', 'tree-data'].map(name => [`ui/src/_utils/${name}.ts`, `ui/src/utils/${name}.ts`]),
  ...['use-dialog', 'use-dialog-drag', 'service'].map(name => [`ui/src/dialog/${name}.ts`, `ui/src/dialog/${name}.ts`]),
  ...['__tests__/foundation/family-hooks.spec.js', '__tests__/foundation/form-control-context.spec.ts', '__tests__/foundation/validation-adapter.spec.js', '__tests__/foundation/data-contract.spec.js', '__tests__/foundation/modal-focus.spec.js', 'trigger/wrapper.ts', 'tooltip/__tests__/wrapper-contract.spec.js', 'menu/__tests__/selection-contract.spec.js', 'menu/__tests__/adapter-contract.spec.js', 'trigger/render.ts', 'trigger/render-props.ts', 'trigger/popup.ts', 'trigger/arrow.ts', 'trigger/__tests__/render-contract.spec.js', 'trigger/geometry.ts', 'trigger/resize.ts', 'trigger/__tests__/geometry.spec.js', 'trigger/__tests__/resize.spec.js', 'trigger/reference.ts', 'trigger/state.ts', 'trigger/popup-move-focus.ts', 'trigger/contract.ts', 'context/lock.ts', 'context/zIndex.ts', '__tests__/foundation/z-index.spec.js', 'trigger/interaction.ts', 'trigger/interaction-props.ts', 'trigger/__tests__/interaction.spec.js', '__tests__/foundation/layers.spec.js', '__tests__/foundation/scroll-lock.spec.js', 'trigger/__tests__/foundation.spec.js', '__tests__/foundation/use.spec.js'].map(path => [`ui/src/${path}`, `ui/src/${path}`]),
]
const normalize = source => source
  .replaceAll('@cedar-design/use-vue', '@maple-design/use-vue')
  .replaceAll('@cedar-design/shared-vue', '@maple-design/shared-vue')
  .replaceAll('use/', 'use/')
  .replaceAll('/_utils/maple/elements', '/utils/elements')
  .replaceAll('/_utils/constant', '/utils/constants')
  .replaceAll('/_utils/', '/utils/')
  .replaceAll('/utils/global-config', '/utils/components')
  .replaceAll('Cedar [', 'Maple [')
  .replaceAll('cedar-design-web', 'maple-design-mobile')
  .trim()
// 有意分叉：PC 端不绑定触摸监听，移动端保留；两端按端侧职责各自维护。
const intentionalForks = new Set(['ui/src/_utils/modal-focus.ts'])

let runtimePairs = 0
for (const [left, right] of pairs) {
  // Test files use repository-specific runners and formatting. Runtime parity is
  // checked here; behavior is covered by each repository's own test suite.
  if (left.includes('/__tests__/')) continue
  const [cedar, maple] = await Promise.all([
    readFile(resolve(root, 'cedar-design-web/packages', left), 'utf8'),
    readFile(resolve(root, 'maple-design-mobile/packages', right), 'utf8'),
  ])
  if (intentionalForks.has(left)) {
    console.log(`SKIP (intentional fork) ${left}`)
    continue
  }
  const canonical = (source, path) => {
    let value = normalize(source).replace(/import\s*\{([^}]+)\}\s*from/g, (_match, names) => {
      const sorted = names.split(',').map(name => name.trim()).filter(Boolean).sort().join(', ')
      return `import { ${sorted} } from`
    })
    const imports = []
    value = value.replace(/^import\s+(?:[\s\S]*?\s+from\s+)?['"][^'"]+['"];?\s*$/gm, declaration => {
      imports.push(declaration.trim())
      return ''
    })
    value = [...imports.sort(), value].join('\n')
    if (/\.tsx?$/.test(path)) {
      return transformSync(value, {
        loader: path.endsWith('.tsx') ? 'tsx' : 'ts',
        format: 'esm',
        // Keep identifiers: esbuild's frequency-based mangling also depends on erased type imports.
        minifyWhitespace: true,
        minifySyntax: true,
        treeShaking: false,
      }).code
    }
    return value.replace(/\s+/g, '')
  }
  assert.equal(canonical(cedar, left), canonical(maple, right), `Foundation drift: ${left} / ${right}`)
  runtimePairs++
  console.log(`PASS ${left}`)
}
console.log(`Verified ${runtimePairs} runtime foundation pairs (${pairs.length} registered pairs; test files run in each library). This checks source parity, not behavioral coverage.`)
