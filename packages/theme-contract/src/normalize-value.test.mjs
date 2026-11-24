import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeTokenValue } from './normalize-value.mjs'

test('normalizes literal modern alpha colors without erasing token relationships', () => {
  assert.equal(normalizeTokenValue('0 4px 10px rgb(0 0 0 / 10%)', 'c'), '0 4px 10px rgba(0, 0, 0, 0.1)')
  assert.equal(normalizeTokenValue('rgb(1 2 3 / .5)', 'mp'), 'rgba(1, 2, 3, 0.5)')
  assert.equal(normalizeTokenValue("var(~'--c-sys-radius-md')", 'c'), 'var(--PREFIX-sys-radius-md)')
  assert.equal(normalizeTokenValue('rgba(var(--mp-gray-6), 0.2)', 'mp'), 'rgba(var(--PREFIX-gray-6), 0.2)')
  assert.equal(normalizeTokenValue('calc(var(--c-x) * 2)', 'c'), 'calc(var(--PREFIX-x) * 2)')
  assert.equal(normalizeTokenValue('.5', 'c'), '0.5')
  assert.equal(normalizeTokenValue('-.5s .2s', 'c'), '-0.5s 0.2s')
  assert.equal(
    normalizeTokenValue('calc(\n  (var(--c-a) / 2) -\n (var(--c-b) / 2)\n)', 'c'),
    'calc((var(--PREFIX-a) / 2) - (var(--PREFIX-b) / 2))',
  )
  assert.equal(normalizeTokenValue('"Font  Name .5"', 'c'), '"Font  Name .5"')
})

test('unwraps only complete Less escaped literals before syntax normalization', () => {
  assert.equal(normalizeTokenValue("~'rgb(255 255 255 / 35%)'", 'c'), 'rgba(255, 255, 255, 0.35)')
  assert.equal(normalizeTokenValue('  ~"rgb(0 0 0 / 55%)"  ', 'mp'), 'rgba(0, 0, 0, 0.55)')
  assert.equal(normalizeTokenValue("~'var(--c-sys-content-brand)'", 'c'), 'var(--PREFIX-sys-content-brand)')
  assert.equal(normalizeTokenValue("'rgb(0 0 0 / 35%)'", 'c'), "'rgb(0 0 0 / 35%)'")
  assert.equal(normalizeTokenValue("~'rgb(0 0 0 / 35%)' suffix", 'c'), "~'rgb(0 0 0 / 35%)' suffix")
  assert.equal(normalizeTokenValue('~\'red"', 'c'), '~\'red"')
})
