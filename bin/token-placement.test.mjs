import assert from 'node:assert/strict'
import { test } from 'node:test'
import { misplacedRootTokens } from './token-placement-check.mjs'

test('placement gate catches compact and indented public root declarations', () => {
  assert.deepEqual(
    misplacedRootTokens(' :root { --mp-picker-background: white; --c-test-color: var(--c-color-text); }'),
    ['--mp-picker-background', '--c-test-color'],
  )
  assert.deepEqual(misplacedRootTokens(':root {\n  --mp-test-size: 4px;\n  }'), ['--mp-test-size'])
})
test('implementation state, comments and references are not public defaults', () => {
  assert.deepEqual(
    misplacedRootTokens(
      '/* :root { --mp-comment: red; } */\n// :root { --c-comment: red; }\n:root { --c-internal-size: 2px; }\n.mp-field { color: var(--mp-test-color); }',
    ),
    [],
  )
})
