import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeTypeScript, normalizeVueSyntaxSource } from '../../cedar-design-web/checks/normalize-source.mjs'
const options = { sortBoundImports: false }

test('Carousel syntax normalization retains imports, types and behavior', async () => {
  const original = "import { a } from './a'; import { b } from './b'; export type T = string; if (a) return b"
  const formatted = "import { a } from './a'\nimport { b } from './b'\nexport type T = string\nif (a) { return b }"
  assert.equal(await normalizeTypeScript(original, options), await normalizeTypeScript(formatted, options))
  assert.notEqual(await normalizeTypeScript(original, options), await normalizeTypeScript(formatted.replace('T = string', 'T = number'), options))
  assert.notEqual(await normalizeTypeScript(original, options), await normalizeTypeScript(formatted.replace('return b', 'return a'), options))
  assert.notEqual(await normalizeTypeScript(original, options), await normalizeTypeScript(formatted.replace("import { a } from './a'\nimport { b } from './b'", "import { b } from './b'\nimport { a } from './a'"), options))
})

test('Carousel SFC normalization retains template and string semantics', async () => {
  const original = `<script setup lang="ts">const label = ['a', 'b'].join(' '); if (label) emit('change')</script><template><button @click="label">Next</button></template>`
  assert.equal(await normalizeVueSyntaxSource(original, options), await normalizeVueSyntaxSource(original.replace("if (label) emit('change')", "if (label) { emit('change') }"), options))
  assert.notEqual(await normalizeVueSyntaxSource(original, options), await normalizeVueSyntaxSource(original.replace("join(' ')", "join('')"), options))
  assert.notEqual(await normalizeVueSyntaxSource(original, options), await normalizeVueSyntaxSource(original.replace('@click="label"', '@keydown="label"'), options))
  assert.notEqual(await normalizeVueSyntaxSource(original, options), await normalizeVueSyntaxSource(original.replace('Next', 'Previous'), options))
})
