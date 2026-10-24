import assert from 'node:assert/strict'
import test from 'node:test'
import { assertSharedSourcePair, checkSharedSourceContract } from './shared-source-contract.mjs'

test('shared source comparison tolerates formatting and branded diagnostics only', () => {
  assertSharedSourcePair("// Cedar helper\nexport type Mode = 'active' | 'idle'; export const brand = `Cedar [test]`;", 'export type Mode = "active" | "idle"\nexport const brand = `Maple [test]`')
})
test('shared source comparison rejects runtime drift', () => {
  assert.throws(() => assertSharedSourcePair('export const clamp = (x: number) => Math.max(0, x)', 'export const clamp = (x: number) => Math.min(0, x)'), /Shared runtime\/type drift/)
})
test('shared source comparison rejects type-only drift erased by bundlers', () => {
  assert.throws(() => assertSharedSourcePair('export type MotionState = "running" | "paused"', 'export type MotionState = "running" | "finished"'), /Shared runtime\/type drift/)
})
test('both independent shared copies have identical source inventory, runtime, types and notices', () => {
  assert.ok(checkSharedSourceContract() >= 10)
})
