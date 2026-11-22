import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { normalizeCopiedSource, normalizeSwitchErrorText, normalizeSwitchTokenDefaults, normalizeButtonOutline, normalizeCopiedTypeScript, normalizeCopiedSfcScript, stripCopiedSfcScript, assertCopiedVueCompat } from './copied-source-normalization.mjs'

test('only the known platform empty-value path is equivalent', () => {
  const cedar = "import { useEmptyValues } from '../_utils/empty-value'"
  const maple = "import { useEmptyValues } from '../utils/empty-value'"
  assert.equal(normalizeCopiedSource(cedar), normalizeCopiedSource(maple))
  assert.notEqual(normalizeCopiedSource(cedar), normalizeCopiedSource(maple.replace('empty-value', 'other-value')))
})

test('only the exact vue-compat import path is normalized', () => {
  const cedar = "import { useId } from '../_utils/vue-compat'"
  const maple = "import { useId } from '../utils/vue-compat'"
  assert.equal(normalizeCopiedSource(cedar), normalizeCopiedSource(maple))
  assert.notEqual(normalizeCopiedSource(cedar.replace('vue-compat', 'vue-compat-other')), normalizeCopiedSource(maple))
  const literal = "const path = '../_utils/vue-compat'"
  assert.equal(normalizeCopiedSource(literal), literal)
  const compat = (platform, prefix) => `// duplicate ${platform} module formats\nconst key = '@${platform.toLowerCase()}-design/vue-id-counter/v1'\nconst fallback = '@${platform.toLowerCase()}-design/vue-id-fallback-registry/v1'\nreturn \`${prefix}-v-\${count}\``
  assert.doesNotThrow(() => assertCopiedVueCompat(compat('Cedar', 'c'), compat('Maple', 'mp')))
  assert.throws(() => assertCopiedVueCompat(compat('Cedar', 'c'), compat('Maple', 'c')), /namespace/)
  assert.throws(() => assertCopiedVueCompat(compat('Cedar', 'c'), `${compat('Maple', 'mp')}\nextra()`), /implementations differ/)
})

test('runtime differences remain observable after platform normalization', () => {
  const source = "import { useEmptyValues } from '../_utils/empty-value'; const value = 1"
  assert.notEqual(normalizeCopiedSource(source), normalizeCopiedSource(source.replace('value = 1', 'value = 2')))
})

test('Button outline normalization requires both exact reviewed rules', () => {
  const cedar = `&--variant-outline { border: thin solid currentColor;
    &.c-button--status-default:not(.c-button--disabled),
    &.c-button--status-secondary:not(.c-button--disabled),
    &.c-button--status-tertiary:not(.c-button--disabled) {
      border-color: var(--c-sys-color-border-default);
    }
  }`
  const maple = `&--variant-outline {
    border: thin solid currentColor;
    &.mp-button--status-default:not(.mp-button--disabled),
    &.mp-button--status-secondary:not(.mp-button--disabled),
    &.mp-button--status-tertiary:not(.mp-button--disabled) {
      border-color: var(--mp-sys-color-border-default);
    }
  }`
  assert.equal(...normalizeButtonOutline(cedar, maple))
  assert.throws(() => normalizeButtonOutline(cedar.replace('border-default', 'content-primary'), maple), /Cedar Button/)
  assert.throws(() => normalizeButtonOutline(cedar.replace('--status-tertiary', '--status-primary'), maple), /Cedar Button/)
  assert.throws(() => normalizeButtonOutline(cedar.replace(':not(.c-button--disabled)', ''), maple), /Cedar Button/)
  assert.throws(() => normalizeButtonOutline(cedar + cedar, maple), /Cedar Button/)
  assert.throws(() => normalizeButtonOutline(cedar, maple.replace('border-default', 'content-primary')), /Maple Button/)
  assert.throws(() => normalizeButtonOutline(cedar, maple.replace('--status-tertiary', '--status-primary')), /Maple Button/)
  assert.throws(() => normalizeButtonOutline(cedar, maple.replace(':not(.mp-button--disabled)', '')), /Maple Button/)
  assert.throws(() => normalizeButtonOutline(cedar, maple + maple), /Maple Button/)
  assert.throws(() => normalizeButtonOutline(cedar, maple.replace('currentColor', 'red')), /Maple Button/)
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

test('Switch foreground aliases retain strict matching after the reviewed contrast repair', () => {
  const expected = 'var(--mp-switch-text-color)'
  const source = `:root { --mp-switch-checked-text-color: ${expected}; --mp-internal-switch-error-text-color: ${expected}; }`
  assert.match(normalizeSwitchTokenDefaults(source, 'mp', expected), /PLATFORM_CHECKED_TEXT/)
  assert.throws(() => normalizeSwitchTokenDefaults(source.replace('--mp-internal-switch-error-text-color: ' + expected, '--mp-internal-switch-error-text-color: var(--mp-sys-color-content-on-bright)'), 'mp', expected), /unreviewed/)
})

test('TypeScript comparison ignores braces/formatting but retains logic and literal changes', () => {
  const { transformSync } = createRequire(new URL('../../maple-design-mobile/packages/cli/package.json', import.meta.url))('esbuild')
  const canonical = source => normalizeCopiedTypeScript(source, transformSync)
  const left = 'export function check(value) { if (!value) return false; return value === 123 }'
  const right = 'export function check(value) { if (!value) { return false } return value === 123; }'
  assert.equal(canonical(left), canonical(right))
  assert.notEqual(canonical(left), canonical(right.replace('=== 123', '=== 124')))
  assert.notEqual(canonical(left), canonical(right.replace('!value', 'value')))
})

test('SFC script comparison preserves significant spaces in strings and template literals', () => {
  const { transformSync } = createRequire(new URL('../../maple-design-mobile/packages/cli/package.json', import.meta.url))('esbuild')
  const canonical = source => normalizeCopiedSfcScript(source, transformSync)
  const source = `<template><div /></template><script setup lang="ts">\nconst label = ['a', 'b'].join(' ')\nconst message = \`hello world\`\n</script>`
  assert.equal(canonical(source), canonical(source.replace("join(' ')", "join( ' ' )")))
  assert.notEqual(canonical(source), canonical(source.replace("join(' ')", "join('')")))
  assert.notEqual(canonical(source), canonical(source.replace('hello world', 'helloworld')))
  assert.throws(() => canonical('<template />'), /without a script/)
})

test('template comparison removes only the script body', () => {
  const source = '<script setup lang="ts">const x = 1</script><template><button :disabled="x">Save</button></template>'
  assert.equal(stripCopiedSfcScript(source), stripCopiedSfcScript(source.replace('x = 1', 'x = 2')))
  assert.notEqual(stripCopiedSfcScript(source), stripCopiedSfcScript(source.replace(':disabled="x"', ':disabled="false"')))
  assert.notEqual(stripCopiedSfcScript(source), stripCopiedSfcScript(source.replace('Save', 'Cancel')))
  assert.throws(() => stripCopiedSfcScript('<template />'), /without a script/)
})
