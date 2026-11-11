import assert from 'node:assert/strict'
import test from 'node:test'
import { allowsNativeDemoControl } from './demo-native-control-policy.mjs'

test('native Search form examples allow only their native form', () => {
  for (const file of [
    'cedar-design-web/packages/ui/src/search/__demos__/native-form.vue',
    'maple-design-mobile/packages/ui/src/search/example/demos/native-form.vue',
  ]) {
    assert.equal(allowsNativeDemoControl(file, 'form'), true)
    assert.equal(allowsNativeDemoControl(file, 'input'), false)
    assert.equal(allowsNativeDemoControl(file.replace('native-form.vue', 'other.vue'), 'form'), false)
  }
})
