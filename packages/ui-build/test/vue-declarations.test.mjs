import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { downlevelVueDeclarations } from '../src/vue-declarations.mjs'

const require = createRequire(import.meta.url)
const ts = require('typescript')

function transformedArguments(root) {
  const output = join(root, 'types')
  mkdirSync(output)
  const file = join(output, 'entry.d.ts')
  writeFileSync(file, `export type Example = import('vue').ComponentOptionsBase<{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}>`)
  downlevelVueDeclarations(root, output, ts)
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  return source.statements[0].type.typeArguments.length
}

test('standalone declaration conversion uses the pinned Vue 3.2.0 baseline', () => {
  const root = mkdtempSync(join(tmpdir(), 'vue-declarations-standalone-'))
  try {
    assert.equal(transformedArguments(root), 10)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('a workspace baseline takes precedence over the standalone fallback', () => {
  const root = mkdtempSync(join(tmpdir(), 'vue-declarations-workspace-'))
  try {
    const baseline = join(root, 'node_modules/vue-compat-min')
    mkdirSync(join(baseline, 'dist'), { recursive: true })
    writeFileSync(join(baseline, 'package.json'), '{"name":"vue-compat-min"}')
    writeFileSync(join(baseline, 'dist/vue.d.ts'), 'export type ComponentOptionsBase<A,B,C,D,E,F,G,H,I,J,K,L> = unknown')
    writeFileSync(join(root, 'package.json'), '{}')
    assert.equal(transformedArguments(root), 12)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('standalone compatibility types do not introduce Vue 3.2.0 declaration errors', () => {
  const root = mkdtempSync(join(tmpdir(), 'vue-declarations-consumer-'))
  try {
    mkdirSync(join(root, 'node_modules'), { recursive: true })
    symlinkSync(join(require.resolve('vue-compat-legacy/package.json'), '..'), join(root, 'node_modules/vue'), 'dir')
    const output = join(root, 'types')
    mkdirSync(output)
    writeFileSync(join(output, 'entry.d.ts'), `export type State = import('vue').Reactive<{ count: import('vue').Ref<number> }>
export type Input = import('vue').ShallowRef<string>`)
    downlevelVueDeclarations(root, output, ts)
    const control = join(root, 'control.ts')
    const consumer = join(root, 'consumer.ts')
    writeFileSync(control, "import type { Ref } from 'vue'; export type Value = Ref<string>\n")
    writeFileSync(consumer, "import type { State, Input } from './types/entry'; declare const state: State; declare const input: Input; const count: number = state.count; const value: string = input.value; void [count, value]\n")
    const options = { strict: true, noEmit: true, skipLibCheck: false, types: [], target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Node10 }
    const diagnostics = file => ts.getPreEmitDiagnostics(ts.createProgram([file], options)).map(item => `${item.file?.fileName}:${item.code}:${ts.flattenDiagnosticMessageText(item.messageText, '\n')}`).sort()
    // Vue 3.2.0 itself reports TS2344 with this TypeScript version; reject any
    // additional diagnostics introduced by the generated compatibility types.
    assert.deepEqual(diagnostics(consumer), diagnostics(control))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
