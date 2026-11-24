import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeBoundImports as normalize } from './normalize-bound-imports.mjs'

test('bound import order and split declarations retain the same local contract', () => {
  assert.equal(
    normalize("import { a, b as c } from './value';\nexport const result = a(c)"),
    normalize("import { b as c } from './value';\nimport { a } from './value';\nexport const result = a(c)"),
  )
})
test('module, alias, type and runtime differences stay observable', () => {
  const source = "import { a } from './value';\nexport const result = a(1)"
  for (const changed of [
    source.replace("'./value'", "'./other'"),
    source.replace('{ a }', '{ b as a }'),
    source.replace('import {', 'import type {'),
    source.replace('a(1)', 'a(2)'),
  ])
    assert.notEqual(normalize(source), normalize(changed))
})
test('side-effect import ordering remains strict', () => {
  assert.notEqual(
    normalize("import './first';\nimport './second';"),
    normalize("import './second';\nimport './first';"),
  )
})
