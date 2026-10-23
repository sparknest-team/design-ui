import assert from 'node:assert/strict'
import test from 'node:test'
import { contrastPair, requireTextContrast } from './contrast-pair.mjs'

test('black and white have the expected contrast', () => assert.equal(contrastPair('#000', '#fff', '#fff'), 21))
test('same colors fail, rather than counting a custom override as passing', () => assert.throws(() => requireTextContrast('#eee', '#fff', '#fff')))
test('transparent surface resolves to its backing', () => assert.equal(contrastPair('#000', 'transparent', '#fff'), 21))
test('alpha text composites onto the surface, not directly onto the page', () => {
  assert.equal(contrastPair('rgba(0,0,0,0.5)', '#fff', '#000'), contrastPair('rgb(127.5,127.5,127.5)', '#fff', '#fff'))
})
test('unknown translucent backing cannot be silently treated as opaque', () => assert.throws(() => contrastPair('#fff', '#000', 'rgba(0,0,0,0.5)')))
test('passing dark pair and translucent surface resolve separately', () => {
  assert.ok(requireTextContrast('#f8f9fc', '#182230', '#fff') > 4.5)
  assert.ok(requireTextContrast('#f8f9fc', 'rgba(24,34,48,0.75)', '#fff') > 4.5)
})
test('a value just below threshold is not rounded up', () => {
  const ratio = contrastPair('#777', '#fff', '#fff')
  assert.ok(ratio > 4.47 && ratio < 4.5)
  assert.throws(() => requireTextContrast('#777', '#fff', '#fff'))
})
for (const color of ['#ggg', 'rgb(300,0,0)', 'rgba(0,0,0,2)']) test('rejects invalid color ' + color, () => assert.throws(() => contrastPair(color, '#fff', '#fff')))
