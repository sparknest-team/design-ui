import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { findRuntimeCycles, mediaRuntimeGraph } from './media-runtime-graph.mjs'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
test('runtime graph guard detects a public barrel back-edge rather than treating revisited nodes as safe', () => {
  assert.deepEqual(findRuntimeCycles(new Map([
    ['image/index', ['image/preview']],
    ['image/preview', ['image/PreviewGroup']],
    ['image/PreviewGroup', ['image/index']],
  ])), [['image/index', 'image/preview', 'image/PreviewGroup', 'image/index']])
  assert.deepEqual(findRuntimeCycles(new Map([
    ['image/index', ['image/preview', 'image/PreviewGroup']],
    ['image/preview', ['image/PreviewGroup']],
    ['image/PreviewGroup', []],
  ])), [])
})
for (const [repository, directory, packageName, service] of [
  ['cedar-design-web', 'cedar-ui', '@cedar-design/ui', 'preview-api.ts'],
  ['maple-design-mobile', 'maple-ui', '@maple-design/ui', 'preview.ts'],
]) {
  test(`${directory}: Image / Upload runtime dependency closure is acyclic and never enters the package root`, () => {
    const sourceDir = resolve(workspace, repository, 'packages', directory, 'src')
    const { graph, cycles, bareRootImports } = mediaRuntimeGraph(sourceDir, packageName)
    const relative = file => file.slice(sourceDir.length + 1)
    assert.deepEqual(cycles.map(cycle => cycle.map(relative)), [])
    assert.deepEqual(bareRootImports.map(relative), [])
    const publicEntry = resolve(sourceDir, 'image/index.ts')
    const previewService = resolve(sourceDir, 'image', service)
    assert.ok(graph.has(previewService))
    assert.ok(!graph.has(resolve(sourceDir, 'image/api.ts')), 'type-only dependencies must not become runtime edges')
    assert.ok(!graph.get(previewService).includes(publicEntry))
    const code = readFileSync(previewService, 'utf8')
    assert.doesNotMatch(code, /export\s*\{[^}]*\b(?:ImagePreview|ImagePreviewGroup)\b/)
    assert.ok(graph.size > 30, 'inspect the transitive component closure, not only the entry files')
    console.log(`${directory}: ${graph.size} runtime modules, no cycles`)
  })
}
