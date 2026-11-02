import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { normalizeCopiedSource, normalizeSwitchErrorText, normalizeSwitchTokenDefaults, normalizeCopiedTypeScript } from './copied-source-normalization.mjs'

test('only the known platform empty-value path is equivalent', () => {
  const cedar = "import { useEmptyValues } from '../_utils/empty-value'"
  const maple = "import { useEmptyValues } from '../utils/empty-value'"
  assert.equal(normalizeCopiedSource(cedar), normalizeCopiedSource(maple))
  assert.notEqual(normalizeCopiedSource(cedar), normalizeCopiedSource(maple.replace('empty-value', 'other-value')))
})

test('runtime differences remain observable after platform normalization', () => {
  const source = "import { useEmptyValues } from '../_utils/empty-value'; const value = 1"
  assert.notEqual(normalizeCopiedSource(source), normalizeCopiedSource(source.replace('value = 1', 'value = 2')))
})

test('Switch foreground exception checks the exact reviewed declaration', () => {
  const rule = '&--error:not(.mp-switch--disabled):not(.mp-switch--loading) &__text { color: var(--mp-internal-switch-error-text-color); }'
  assert.match(normalizeSwitchErrorText(rule, 'mp', 'var(--mp-internal-switch-error-text-color)'), /PLATFORM_ERROR_TEXT/)
  assert.throws(() => normalizeSwitchErrorText(rule.replace('var(--mp-internal-switch-error-text-color)', 'red'), 'mp', 'var(--mp-internal-switch-error-text-color)'), /unreviewed/)
  assert.throws(() => normalizeSwitchErrorText(rule.replace('&--error', '&--normal'), 'mp', 'var(--mp-internal-switch-error-text-color)'), /missing/)
})

test('Switch token defaults must equal the registered platform values', () => {
  const expected = 'var(--mp-sys-color-content-on-bright)'
  const source = `:root { --mp-switch-checked-text-color: ${expected}; --mp-internal-switch-error-text-color: ${expected}; }`
  assert.match(normalizeSwitchTokenDefaults(source, 'mp', expected), /PLATFORM_CHECKED_TEXT/)
  assert.throws(() => normalizeSwitchTokenDefaults(source.replaceAll(expected, 'red'), 'mp', expected), /unreviewed/)
})

test('TypeScript comparison ignores braces/formatting but retains logic and literal changes', () => {
  const { transformSync } = createRequire(new URL('../../maple-design-mobile/packages/maple-cli/package.json', import.meta.url))('esbuild')
  const canonical = source => normalizeCopiedTypeScript(source, transformSync)
  const left = 'export function check(value) { if (!value) return false; return value === 123 }'
  const right = 'export function check(value) { if (!value) { return false } return value === 123; }'
  assert.equal(canonical(left), canonical(right))
  assert.notEqual(canonical(left), canonical(right.replace('=== 123', '=== 124')))
  assert.notEqual(canonical(left), canonical(right.replace('!value', 'value')))
})
