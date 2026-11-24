import assert from 'node:assert/strict'
import { test } from 'node:test'
import { liveTokens } from './token-consumer-graph.mjs'

test('follows aliases and nested fallbacks to actual CSS properties', () => {
  const live = liveTokens([
    { prop: 'color', value: 'var(--a, var(--fallback))' },
    { prop: '--a', value: 'var(--b)' },
    { prop: '--b', value: '#fff' },
    { prop: '--unused', value: 'var(--also-unused)' },
  ])
  assert.deepEqual([...live].sort(), ['--a', '--b', '--fallback'])
})
test('cycles are not consumers and traversal terminates', () => {
  const cycle = [
    { prop: '--a', value: 'var(--b)' },
    { prop: '--b', value: 'var(--a)' },
  ]
  assert.equal(liveTokens(cycle).size, 0)
  assert.equal(liveTokens([...cycle, { prop: 'color', value: 'var(--a)' }]).size, 2)
})
test('unions dependencies from theme and state declarations', () => {
  assert.deepEqual(
    [
      ...liveTokens([
        { prop: '--a', value: 'var(--light)' },
        { prop: '--a', value: 'var(--dark)' },
        { prop: 'background', value: 'var(--a)' },
      ]),
    ].sort(),
    ['--a', '--dark', '--light'],
  )
})
