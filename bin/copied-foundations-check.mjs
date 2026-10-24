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
for (const library of ['cedar-design-web/packages/cedar-ui', 'maple-design-mobile/packages/maple-ui']) {
  const directory = resolve(root, library, 'src/menu')
  assert.ok(!existsSync(resolve(directory, 'platform.ts')), 'Menu platform aggregation must not return')
  const props = await readFile(resolve(directory, 'props.ts'), 'utf8')
  assert.ok(!props.includes('rootPlatformProps'), 'Public positioning must be declared explicitly')
  assert.match(props, /strategy:\s*triggerPropDefaults.strategy/)
}
const pairs = [
  ['cedar-ui/src/__tests__/foundation/popup-transition.spec.js', 'maple-ui/src/__tests__/foundation/popup-transition.spec.js'],
  ...['props', 'option-props', 'branch-props', 'types', 'context', 'level', 'keyboard', 'selection', 'trigger-options'].map(name => [`cedar-ui/src/menu/${name}.ts`, `maple-ui/src/menu/${name}.ts`]),
  ...['index', 'onSmartMounted', 'onSmartUnmounted', 'onWindowResize', 'useChildren', 'useClickOutside', 'useClientId', 'useEventListener', 'useId', 'useInitialized', 'useMotion', 'useParent', 'useTouch', 'useVModel', 'useWindowSize'].map(name => [`cedar-use/src/${name}.ts`, `maple-use/src/${name}.ts`]),
  ['cedar-shared/src/index.ts', 'maple-shared/src/index.ts'],
  ...['array', 'dom', 'function', 'motion', 'namespace', 'number', 'object', 'predicates', 'string'].map(name => [`cedar-shared/src/${name}.ts`, `maple-shared/src/${name}.ts`]),
  ['cedar-ui/src/trigger/position.ts', 'maple-ui/src/trigger/position.ts'],
  ...['popup-container', 'popup-layer', 'scroll-lock', 'modal-focus', 'modal-surface', 'async-request', 'option-data', 'field-path', 'form-control-context', 'input-composition', 'text-input-value', 'picker-data', 'resize-observer', 'popup-transition', 'responsive-observe', 'tree-data'].map(name => [`cedar-ui/src/_utils/${name}.ts`, `maple-ui/src/utils/${name}.ts`]),
  ...['use-dialog', 'use-dialog-drag', 'service'].map(name => [`cedar-ui/src/dialog/${name}.ts`, `maple-ui/src/dialog/${name}.ts`]),
  ...['__tests__/foundation/family-hooks.spec.js', '__tests__/foundation/form-control-context.spec.ts', '__tests__/foundation/validation-adapter.spec.js', '__tests__/foundation/data-contract.spec.js', '__tests__/foundation/modal-focus.spec.js', 'trigger/wrapper.ts', 'tooltip/__tests__/wrapper-contract.spec.js', 'menu/__tests__/selection-contract.spec.js', 'menu/__tests__/adapter-contract.spec.js', 'trigger/render.ts', 'trigger/render-props.ts', 'trigger/popup.ts', 'trigger/arrow.ts', 'trigger/__tests__/render-contract.spec.js', 'trigger/geometry.ts', 'trigger/resize.ts', 'trigger/__tests__/geometry.spec.js', 'trigger/__tests__/resize.spec.js', 'trigger/reference.ts', 'trigger/state.ts', 'trigger/contract.ts', 'context/lock.ts', 'context/zIndex.ts', '__tests__/foundation/z-index.spec.js', 'trigger/interaction.ts', 'trigger/interaction-props.ts', 'trigger/__tests__/interaction.spec.js', '__tests__/foundation/layers.spec.js', '__tests__/foundation/scroll-lock.spec.js', 'trigger/__tests__/foundation.spec.js', '__tests__/foundation/use.spec.js'].map(path => [`cedar-ui/src/${path}`, `maple-ui/src/${path}`]),
]
const normalize = source => source
  .replaceAll('@cedar-design/use', '@maple-design/use')
  .replaceAll('@cedar-design/shared', '@maple-design/shared')
  .replaceAll('cedar-use/', 'maple-use/')
  .replaceAll('/_utils/maple/elements', '/utils/elements')
  .replaceAll('/_utils/constant', '/utils/constants')
  .replaceAll('/_utils/', '/utils/')
  .replaceAll('/utils/global-config', '/utils/components')
  .replaceAll('Cedar [', 'Maple [')
  .replaceAll('cedar-design-web', 'maple-design-mobile')
  .trim()
let runtimePairs = 0
for (const [left, right] of pairs) {
  // Test files use repository-specific runners and formatting. Runtime parity is
  // checked here; behavior is covered by each repository's own test suite.
  if (left.includes('/__tests__/')) continue
  const [cedar, maple] = await Promise.all([
    readFile(resolve(root, 'cedar-design-web/packages', left), 'utf8'),
    readFile(resolve(root, 'maple-design-mobile/packages', right), 'utf8'),
  ])
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
