import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { implementationFiles, runtimeGraph } from './runtime-dependency-graph.mjs'
import { auditRuntimeDependencies, hmrPolicyViolations, libraries } from './runtime-dependency-check.mjs'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const fixtures = fileURLToPath(new URL('./fixtures/runtime-graph/', import.meta.url))
const localRoot = process.env.UI_RUNTIME_CHECK_ROOT
const selected = localRoot
  ? Object.entries(libraries).filter(([, config]) => existsSync(resolve(localRoot, 'packages', config.directory, 'package.json')))
  : Object.entries(libraries)
assert.ok(selected.length > 0, 'No target component library found')
const source = localRoot
  ? resolve(localRoot, 'packages', selected[0][1].directory, 'src')
  : resolve(workspace, 'cedar-design-web/packages/ui/src')
const require = createRequire(resolve(source, '../package.json'))
const ts = require('typescript')

test('emitted dependency graph erases type-only imports and retains literal dynamic imports', () => {
  const { graph, cycles } = runtimeGraph(source, '@cedar-design/ui-vue', [resolve(fixtures, 'entry.ts')])
  assert.deepEqual([...graph.keys()].map(file => file.slice(fixtures.length)).sort(), ['entry.ts', 'leaf.ts'])
  assert.deepEqual(cycles, [])
  assert.equal(graph.get(resolve(fixtures, 'entry.ts')).length, 2, 'static export plus dynamic import')
})

test('orphan/private modules and compiled SFC imports cannot conceal a runtime cycle', () => {
  const { graph, cycles } = runtimeGraph(source, '@cedar-design/ui-vue', implementationFiles(fixtures))
  assert.ok(graph.has(resolve(fixtures, 'Cycle.vue')))
  assert.equal(cycles.length, 1)
  assert.equal(cycles[0][0], cycles[0].at(-1))
  assert.ok(cycles[0].some(file => file.endsWith('cycle.ts')))
})

test('HMR workaround guard rejects refresh, manual acceptance and disabled HMR, but not comments or normal invalidation', () => {
  for (const code of [
    "server.ws.send({ type: 'full-reload', path: '*' })",
    'window.location.reload()', 'location.reload()', "globalThis.location['reload']()",
    'import.meta.hot.accept()', 'import.meta.hot.invalidate()', 'export default { server: { hmr: false } }',
  ]) assert.ok(hmrPolicyViolations(code, 'plugin.ts', ts).length, code)
  assert.deepEqual(hmrPolicyViolations("// location.reload(); 'full-reload'\nserver.moduleGraph.invalidateModule(module)", 'plugin.ts', ts), [])
})

for (const [library, config] of selected) {
  test(`${library}: all implementation/shared/use modules are acyclic, with no root backflow or refresh workaround`, () => {
    const report = auditRuntimeDependencies(localRoot ? resolve(localRoot) : resolve(workspace, config.repository), library)
    assert.ok(report.runtimeModules > 500)
    assert.ok(report.toolingModules > 20)
    console.log(`${library}: ${report.runtimeModules} runtime modules, ${report.toolingModules} tooling modules`)
  })
}
