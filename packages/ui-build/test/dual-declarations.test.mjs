import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import ts from 'typescript'
import { writeDualDeclarations } from '../src/dual-declarations.mjs'

test('reports a missing TypeScript compiler API clearly', () => {
  assert.throws(() => writeDualDeclarations('.', {}), /TypeScript compiler API is required/)
})

test('writes ESM and CommonJS declaration graphs without changing unrelated text', () => {
  const root = mkdtempSync(join(tmpdir(), 'dual-declarations-'))
  try {
    mkdirSync(join(root, 'component'))
    writeFileSync(join(root, 'component/index.d.ts'), 'export interface Value { id: string }\n')
    writeFileSync(
      join(root, 'index.d.ts'),
      [
        "import type { Value } from './component'",
        "export { Value } from './component'",
        "export type Other = import('./component').Value",
        "import alias = require('./component')",
        "export type External = import('vue').Component",
        "// from './component' remains a comment",
        "export declare const text: './component'",
        '',
      ].join('\n'),
    )
    writeDualDeclarations(root, ts)
    for (const [file, suffix] of [
      ['index.d.ts', 'js'],
      ['index.d.cts', 'cjs'],
    ]) {
      const output = readFileSync(join(root, file), 'utf8')
      assert.match(output, new RegExp(`from './component/index\\.${suffix}'`))
      assert.match(output, new RegExp(`import\\('./component/index\\.${suffix}'\\)`))
      assert.match(output, new RegExp(`require\\('./component/index\\.${suffix}'\\)`))
      assert.match(output, /import\('vue'\)/)
      assert.match(output, /\/\/ from '\.\/component' remains a comment/)
      assert.match(output, /text: '\.\/component'/)
    }
    assert.equal(readFileSync(join(root, 'component/index.d.cts'), 'utf8'), 'export interface Value { id: string }\n')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('fails before modifying files when a relative target is missing', () => {
  const root = mkdtempSync(join(tmpdir(), 'dual-declarations-missing-'))
  try {
    const source = "export type Missing = import('./missing').Value\n"
    writeFileSync(join(root, 'index.d.ts'), source)
    assert.throws(() => writeDualDeclarations(root, ts), /Unresolved declaration/)
    assert.equal(readFileSync(join(root, 'index.d.ts'), 'utf8'), source)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
