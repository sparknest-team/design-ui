import assert from 'node:assert/strict'
import test from 'node:test'
import { canonical } from './upload-core-check.mjs'

test('ignores semicolon-only formatting on empty return without discarding returned values', () => {
  const file = 'upload/utils/request.ts'
  assert.equal(canonical('function run() { return; }', file), canonical('function run() { return }', file))
  assert.notEqual(canonical('function run() { return; }', file), canonical('function run() { return false }', file))
})

test('maps only the exact local public package in Upload demo imports', () => {
  const demo = (path) =>
    `<script setup lang="ts">import type { UploadFileItem } from '${path}'; const files: UploadFileItem[] = []</script><template><div>{{ files.length }}</div></template>`
  const file = 'upload/__demos__/queue-request.vue'
  assert.equal(canonical(demo('@cedar-design/ui-vue'), file), canonical(demo('@maple-design/ui-vue'), file))
  assert.notEqual(canonical(demo('@cedar-design/ui-extra'), file), canonical(demo('@maple-design/ui-extra'), file))
  assert.notEqual(
    canonical(demo('@cedar-design/ui-vue/internal'), file),
    canonical(demo('@maple-design/ui-vue/internal'), file),
  )
  assert.notEqual(
    canonical("const payload = '@cedar-design/ui-vue'", 'upload/utils/request.ts'),
    canonical("const payload = '@maple-design/ui-vue'", 'upload/utils/request.ts'),
  )
})

test('still rejects changed cleanup order or a missing queue unlock', () => {
  const file = 'upload/composables/use-uploader.ts'
  const base = 'function stop() { generation++; adding = Promise.resolve(); removals.clear() }'
  assert.notEqual(
    canonical(base, file),
    canonical('function stop() { generation++; removals.clear(); adding = Promise.resolve() }', file),
  )
  assert.notEqual(canonical(base, file), canonical('function stop() { generation++; removals.clear() }', file))
})

test('preserves token values and callback behavior in comparisons', () => {
  const file = 'upload/style/token.less'
  assert.equal(
    canonical(':root { --c-upload-disabled-opacity: 0.56; }', file),
    canonical(':root { --mp-upload-disabled-opacity: 0.56; }', file),
  )
  assert.notEqual(
    canonical(':root { --c-upload-disabled-opacity: 0.56; }', file),
    canonical(':root { --mp-upload-disabled-opacity: 0.65; }', file),
  )
  assert.notEqual(
    canonical('function finish() { onSuccess() }', 'upload/utils/request.ts'),
    canonical('function finish() { onError() }', 'upload/utils/request.ts'),
  )
})

test('normalizes only the exact counterpart empty-value import', () => {
  const file = 'upload/props.ts'
  const declaration = (path) => `import { emptyValueProp } from '${path}'; export const value = emptyValueProp()`
  assert.equal(
    canonical(declaration('../_utils/empty-value'), file),
    canonical(declaration('../utils/empty-value'), file),
  )
  assert.notEqual(
    canonical(declaration('../_utils/empty-value-extra'), file),
    canonical(declaration('../utils/empty-value-extra'), file),
  )
  assert.notEqual(
    canonical("const payload = '../_utils/empty-value'", file),
    canonical("const payload = '../utils/empty-value'", file),
  )
})

test('normalizes demo block boundary formatting while preserving text, inline separators and preformatted content', () => {
  const file = 'upload/__demos__/queue-request.vue'
  assert.equal(
    canonical('<template><p>\n Count: {{ count }}\n</p></template>', file),
    canonical('<template><p>Count: {{ count }}</p></template>', file),
  )
  assert.notEqual(
    canonical('<template><p>Count: {{ count }}</p></template>', file),
    canonical('<template><p>Other: {{ count }}</p></template>', file),
  )
  assert.notEqual(
    canonical('<template><p><span>A</span> <span>B</span></p></template>', file),
    canonical('<template><p><span>A</span><span>B</span></p></template>', file),
  )
  assert.notEqual(
    canonical('<template><pre> A </pre></template>', file),
    canonical('<template><pre>A</pre></template>', file),
  )
  assert.notEqual(
    canonical('<template><p> A </p></template>', 'upload/upload.vue'),
    canonical('<template><p>A</p></template>', 'upload/upload.vue'),
  )
})
