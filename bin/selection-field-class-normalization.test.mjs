import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeTagSizeAssertions } from './selection-field-class-normalization.mjs'

test('normalizes only exact Tag size class assertions', () => {
  assert.equal(normalizeTagSizeAssertions("expect(x.classes()).toContain('c-tag--size-lg')"), "expect(x.classes()).toContain('mp-tag--size-lg')")
  for (const source of [
    "emit('c-tag--size-lg')",
    "expect(x.classes()).toContain('c-tag--size-invalid')",
    "expect(x.classes()).toContain('c-other--size-lg')",
    "expect(x.classes()).toContain('c-tag--size-lg-extra')",
  ]) assert.equal(normalizeTagSizeAssertions(source), source)
})
