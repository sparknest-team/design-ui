import assert from 'node:assert/strict'
import test from 'node:test'
import { validateCIToolchain } from './ci-toolchain-check.mjs'

const versions = { node: 'v26.13.1', pnpm: '10.23.0', childNode: 'v26.13.1' }
test('accepts the declared CI runtime and package manager', () => {
  validateCIToolchain(versions)
})
test('rejects an incorrect entry runtime', () => {
  assert.throws(() => validateCIToolchain({ ...versions, node: 'v20.18.3' }), /Node 26\.13\.1/)
})
test('rejects a global package manager overriding the declared one', () => {
  assert.throws(() => validateCIToolchain({ ...versions, pnpm: '9.6.0' }), /pnpm 10\.23\.0/)
})
test('rejects nested pnpm switching to a different Node', () => {
  assert.throws(() => validateCIToolchain({ ...versions, childNode: 'v23.2.0' }), /Nested pnpm/)
})

test('accepts Cedar pinned runtime and rejects a different patch', () => {
  const cedar = { ...versions, node: 'v26.13.1', childNode: 'v26.13.1' }
  validateCIToolchain(cedar, '26.13.1')
  assert.throws(() => validateCIToolchain({ ...cedar, node: 'v26.13.0' }, '26.13.1'), /Node 26\.13\.1/)
})
