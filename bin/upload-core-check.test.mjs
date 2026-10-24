import assert from 'node:assert/strict'
import test from 'node:test'
import { canonical } from './upload-core-check.mjs'

test('ignores semicolon-only formatting on empty return without discarding returned values', () => {
  const file = 'upload/utils/request.ts'
  assert.equal(canonical('function run() { return; }', file), canonical('function run() { return }', file))
  assert.notEqual(canonical('function run() { return; }', file), canonical('function run() { return false }', file))
})

test('maps only the exact local public package in Upload demo imports', () => {
  const demo = path => `<script setup lang="ts">import type { UploadFileItem } from '${path}'; const files: UploadFileItem[] = []</script><template><div>{{ files.length }}</div></template>`
  const file = 'upload/__demos__/queue-request.vue'
  assert.equal(canonical(demo('@cedar-design/ui'), file), canonical(demo('@maple-design/ui'), file))
  assert.notEqual(canonical(demo('@cedar-design/ui-extra'), file), canonical(demo('@maple-design/ui-extra'), file))
  assert.notEqual(canonical(demo('@cedar-design/ui/internal'), file), canonical(demo('@maple-design/ui/internal'), file))
  assert.notEqual(canonical("const payload = '@cedar-design/ui'", 'upload/utils/request.ts'), canonical("const payload = '@maple-design/ui'", 'upload/utils/request.ts'))
})

test('still rejects changed cleanup order or a missing queue unlock', () => {
  const file = 'upload/composables/use-uploader.ts'
  const base = 'function stop() { generation++; adding = Promise.resolve(); removals.clear() }'
  assert.notEqual(canonical(base, file), canonical('function stop() { generation++; removals.clear(); adding = Promise.resolve() }', file))
  assert.notEqual(canonical(base, file), canonical('function stop() { generation++; removals.clear() }', file))
})

test('preserves token values and callback behavior in comparisons', () => {
  const file = 'upload/style/token.less'
  assert.equal(canonical(':root { --c-upload-disabled-opacity: 0.56; }', file), canonical(':root { --mp-upload-disabled-opacity: 0.56; }', file))
  assert.notEqual(canonical(':root { --c-upload-disabled-opacity: 0.56; }', file), canonical(':root { --mp-upload-disabled-opacity: 0.65; }', file))
  assert.notEqual(canonical('function finish() { onSuccess() }', 'upload/utils/request.ts'), canonical('function finish() { onError() }', 'upload/utils/request.ts'))
})
