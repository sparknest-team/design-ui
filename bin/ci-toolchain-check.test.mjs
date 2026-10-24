import assert from 'node:assert/strict'
import test from 'node:test'
import { validateCIToolchain } from './ci-toolchain-check.mjs'

const versions = { node: 'v20.18.3', pnpm: '9.6.0', childNode: 'v20.18.3' }
test('accepts the declared CI runtime and package manager', () => {
  validateCIToolchain(versions)
})
test('rejects an incorrect entry runtime', () => {
  assert.throws(() => validateCIToolchain({ ...versions, node: 'v23.2.0' }), /Node 20/)
})
test('rejects a global package manager overriding the declared one', () => {
  assert.throws(() => validateCIToolchain({ ...versions, pnpm: '10.14.0' }), /pnpm 9\.6\.0/)
})
test('rejects nested pnpm switching to a different Node', () => {
  assert.throws(() => validateCIToolchain({ ...versions, childNode: 'v23.2.0' }), /Nested pnpm/)
})
