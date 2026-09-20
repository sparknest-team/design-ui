import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const requireFromMaple = createRequire(
  new URL('../../maple-design-mobile/node_modules/.pnpm/node_modules/esbuild/package.json', import.meta.url),
)
const { transformSync } = requireFromMaple('esbuild')

// Read-only. Libraries retain independent source, runtime and component instances.
const root = fileURLToPath(new URL('../../', import.meta.url))
const pairs = [
  ...['props', 'option-props', 'branch-props', 'types', 'context', 'level', 'keyboard', 'selection'].map(name => [`cedar-ui/src/dropdown-menu/${name}.ts`, `maple-ui/src/dropdown-menu/${name}.ts`]),
  ...['index', 'onSmartMounted', 'onSmartUnmounted', 'onWindowResize', 'useChildren', 'useClickOutside', 'useClientId', 'useEventListener', 'useId', 'useInitialized', 'useMotion', 'useParent', 'useTouch', 'useVModel', 'useWindowSize'].map(name => [`cedar-use/src/${name}.ts`, `maple-use/src/${name}.ts`]),
  ['cedar-shared/src/index.ts', 'maple-shared/src/index.ts'],
  ...['popup-layer', 'scroll-lock', 'modal-focus', 'async-request', 'option-data', 'field-path', 'input-composition', 'picker-data', 'resize-observer', 'popup-transition', 'responsive-observe', 'tree-data'].map(name => [`cedar-ui/src/_utils/${name}.ts`, `maple-ui/src/utils/${name}.ts`]),
  ...['__tests__/foundation/family-hooks.spec.js', '__tests__/foundation/validation-adapter.spec.js', '__tests__/foundation/data-contract.spec.js', '__tests__/foundation/modal-focus.spec.js', 'trigger/wrapper.ts', 'tooltip/__tests__/wrapper-contract.spec.js', 'dropdown-menu/__tests__/selection-contract.spec.js', 'dropdown-menu/__tests__/adapter-contract.spec.js', 'trigger/render.ts', 'trigger/render-props.ts', 'trigger/popup.ts', 'trigger/arrow.ts', 'trigger/__tests__/render-contract.spec.js', 'trigger/geometry.ts', 'trigger/resize.ts', 'trigger/__tests__/geometry.spec.js', 'trigger/__tests__/resize.spec.js', 'trigger/reference.ts', 'trigger/state.ts', 'trigger/contract.ts', 'context/lock.ts', 'context/zIndex.ts', '__tests__/foundation/z-index.spec.js', 'trigger/interaction.ts', 'trigger/interaction-props.ts', 'trigger/__tests__/interaction.spec.js', '__tests__/foundation/layers.spec.js', '__tests__/foundation/scroll-lock.spec.js', 'trigger/__tests__/foundation.spec.js', '__tests__/foundation/use.spec.js'].map(path => [`cedar-ui/src/${path}`, `maple-ui/src/${path}`]),
]
const normalize = source => source
  .replaceAll('@cedarjs/use', '@maplejs/maple-use')
  .replaceAll('@cedarjs/shared', '@maplejs/maple-shared')
  .replaceAll('cedar-use/', 'maple-use/')
  .replaceAll('/_utils/', '/utils/')
  .replaceAll('/utils/global-config', '/utils/components')
  .replaceAll('Cedar [', 'Maple [')
  .replaceAll('cedar-design-web', 'maple-design-mobile')
  .trim()
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
    const lines = value.split('\n')
    value = [...lines.filter(line => line.startsWith('import ')).sort(), ...lines.filter(line => !line.startsWith('import '))].join('\n')
    if (/\.tsx?$/.test(path)) {
      return transformSync(value, {
        loader: path.endsWith('.tsx') ? 'tsx' : 'ts',
        format: 'esm',
        minify: true,
        treeShaking: false,
      }).code
    }
    return value.replace(/\s+/g, '')
  }
  assert.equal(canonical(cedar, left), canonical(maple, right), `Foundation drift: ${left} / ${right}`)
  console.log(`PASS ${left}`)
}
console.log(`Verified ${pairs.length} independent foundation copies. This checks source parity, not behavioral coverage.`)
