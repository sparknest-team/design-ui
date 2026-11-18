import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { checkVuePeerRanges, clearVueRuntimeLinks, inspectVueCode, inspectVueTemplate } from './vue-compat-check.mjs'
import { downlevelVueDeclarations } from '../packages/ui-build/src/vue-declarations.mjs'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const root = resolve(workspace, 'cedar-design-web')
const require = createRequire(join(root, 'packages/ui/package.json'))
const ts = require('typescript')
const exportsFor = (module) => module === 'vue' ? new Set(['ref', 'watch', 'defineComponent']) : undefined

test('UI and auxiliary packages use their declared Vue peer ranges', () => {
  const temp = mkdtempSync(join(root, '.vue-peer-ranges-test-'))
  try {
    for (const pkg of ['ui', 'icons', 'use']) {
      const directory = join(temp, 'packages', pkg)
      mkdirSync(directory, { recursive: true })
      writeFileSync(join(directory, 'package.json'), JSON.stringify({ peerDependencies: { vue: pkg === 'ui' ? '3' : '^3.2.47' } }))
    }
    assert.doesNotThrow(() => checkVuePeerRanges(temp))
    writeFileSync(join(temp, 'packages/ui/package.json'), JSON.stringify({ peerDependencies: { vue: '^3.2.47' } }))
    assert.throws(() => checkVuePeerRanges(temp))
  } finally { rmSync(temp, { recursive: true, force: true }) }
})

test('switching runtime versions removes only consumer links', () => {
  const temp = mkdtempSync(join(root, '.vue-runtime-links-test-'))
  try {
    const target = join(temp, 'runtime')
    const modules = join(temp, 'node_modules')
    mkdirSync(target); mkdirSync(modules)
    symlinkSync(target, join(modules, 'vue'), 'dir')
    clearVueRuntimeLinks(temp)
    assert.equal(existsSync(join(modules, 'vue')), false)
    assert.equal(existsSync(target), true)
    mkdirSync(join(modules, 'vue'))
    assert.throws(() => clearVueRuntimeLinks(temp))
    assert.equal(existsSync(join(modules, 'vue')), true)
  } finally { rmSync(temp, { recursive: true, force: true }) }
})

test('legacy IDs share counters per platform across independently loaded modules', () => {
  let context = {}
  const vue = { getCurrentInstance: () => ({ appContext: context }) }
  const load = (file) => {
    const code = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
    const exports = {}
    new Function('exports', 'require', code)(exports, (name) => {
      assert.equal(name, 'vue')
      return vue
    })
    return exports.useId
  }
  const cedar = resolve(workspace, 'cedar-design-web/packages/ui/src/_utils/vue-compat.ts')
  const maple = resolve(workspace, 'maple-design-mobile/packages/ui/src/utils/vue-compat.ts')
  const helpers = [load(cedar), load(cedar), load(maple), load(maple)]
  assert.deepEqual(helpers.map((useId) => useId()), ['c-v-0', 'c-v-1', 'mp-v-0', 'mp-v-1'])
  context = {}
  assert.deepEqual(helpers.map((useId) => useId()), ['c-v-0', 'c-v-1', 'mp-v-0', 'mp-v-1'])
  context = {}
  const server = { cedar: helpers[0](), maple: helpers[2]() }
  context = {}
  const mapleClient = helpers[2]()
  const cedarClient = helpers[0]()
  assert.deepEqual({ cedar: cedarClient, maple: mapleClient }, server)
  context = Object.preventExtensions({})
  assert.deepEqual([helpers[0](), helpers[0]()], ['c-v-0', 'c-v-1'])
  vue.useId = () => 'native-id'
  assert.equal(helpers[1](), 'native-id')
})

test('allows compiler-only syntax and erases type-only uses, including implicit type imports', () => {
  const code = `import { ref, PropType } from 'vue';
    // import { useModel } from 'vue'
    defineOptions({ inheritAttrs: false });
    const value = ref(null as unknown as PropType<string>);`
  assert.deepEqual(inspectVueCode(ts, code, 'component.ts', exportsFor, true), [])
})

test('rejects named, aliased, namespace and generated CJS runtime dependencies', () => {
  for (const code of [
    `import { useModel as model } from 'vue'; model();`,
    `import * as Vue from 'vue'; Vue.useId();`,
    `const vue = require('vue'); vue.useTemplateRef('input');`,
    `const { useModel: model } = require('vue'); model();`,
    `export { onWatcherCleanup } from 'vue';`,
  ]) assert.equal(inspectVueCode(ts, code, 'output.js', exportsFor).length, 1, code)
})

test('rejects macros and watch options whose runtime semantics cannot target 3.2', () => {
  assert.equal(inspectVueCode(ts, `defineModel(); watch(() => 1, () => {}, { once: true, deep: 1 });`, 'component.ts', exportsFor, true).length, 3)
  assert.equal(inspectVueCode(ts, `import { watch as observe } from 'vue'; observe(() => 1, () => {}, { once: true });`, 'component.ts', exportsFor, true).length, 1)
  assert.equal(inspectVueCode(ts, `import * as Vue from 'vue'; Vue.watch(() => 1, () => {}, { deep: 2 });`, 'component.ts', exportsFor, true).length, 1)
  assert.equal(inspectVueCode(ts, `toRef(() => 1); computed(previous => previous || 1);`, 'component.ts', exportsFor, true).length, 2)
})

test('rejects Teleport defer in templates and render functions without rejecting ordinary Teleport', () => {
  const sfc = require('@vue/compiler-sfc')
  for (const template of ['<Teleport defer to="body" />', '<teleport :defer="ready" to="body" />']) {
    assert.equal(inspectVueTemplate(sfc, `<template>${template}</template>`, 'component.vue').length, 1)
  }
  assert.deepEqual(inspectVueTemplate(sfc, '<template><!-- <Teleport defer /> --><Teleport to="body" /></template>', 'component.vue'), [])
  const available = (module) => module === 'vue' ? new Set(['h', 'Teleport']) : undefined
  for (const code of [
    `import { h, Teleport } from 'vue'; h(Teleport, { defer: true }, []);`,
    `import { h, Teleport as Portal } from 'vue'; h(Portal, { 'defer': true }, []);`,
    `import * as V from 'vue'; V.h(V.Teleport, { defer: true }, []);`,
    `import { Teleport } from 'vue'; const node = <Teleport defer to="body" />;`,
    `import * as V from 'vue'; const node = <V.Teleport defer to="body" />;`,
  ]) assert.equal(inspectVueCode(ts, code, 'component.tsx', available, true).length, 1, code)
  assert.deepEqual(inspectVueCode(ts, `import { h, Teleport } from 'vue'; h(Teleport, { to: 'body' }, []);`, 'component.ts', available, true), [])
})

test('declaration lowering preserves typed props, slots and ref values on the actual 3.2.47 types', () => {
  const temp = mkdtempSync(join(root, '.vue-declarations-test-'))
  try {
    const output = join(temp, 'types')
    mkdirSync(output)
    // Emit with the development runtime first; then verify the resulting public
    // declarations against the real oldest runtime without skipLibCheck.
    const source = join(temp, 'source.ts')
    writeFileSync(source, `import { defineComponent, reactive, ref, shallowRef } from 'vue';
      export const Component = defineComponent({ props: { label: { type: String, required: true } }, setup() { return { count: ref(1) } } });
      export const value = ref('hello');
      export const state = reactive({ count: ref(1) });
      export const shallow = shallowRef('hello');`)
    const options = { declaration: true, emitDeclarationOnly: true, strict: true, skipLibCheck: true, target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, outDir: output, types: [] }
    const emitted = ts.createProgram([source], options).emit()
    assert.equal(emitted.emitSkipped, false)
    writeFileSync(join(output, 'slots.d.ts'), `export declare const Component: import('vue').DefineComponent<{}, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, {}, {}, import('vue').SlotsType<{ default: (props: { id: number }) => any }>>;`)
    downlevelVueDeclarations(root, output, ts)
    assert.doesNotMatch(readFileSync(join(output, 'source.d.ts'), 'utf8'), /ComponentProvideOptions/)
    const consumer = join(temp, 'consumer.ts')
    writeFileSync(consumer, `import { Component, value, state, shallow } from './types/source';
      import { Component as Slotted } from './types/slots';
      const props: InstanceType<typeof Component>['$props'] = { label: 'ok' };
      // @ts-expect-error missing required prop
      const missing: InstanceType<typeof Component>['$props'] = {};
      // @ts-expect-error wrong prop type
      const invalid: InstanceType<typeof Component>['$props'] = { label: 123 };
      value.value = 'ok';
      const count: number = state.count;
      const text: string = shallow.value;
      // @ts-expect-error ref must retain its value type
      value.value = 123;
      // @ts-expect-error reactive nested refs must unwrap to numbers
      state.count = 'invalid';
      declare const instance: InstanceType<typeof Slotted>;
      instance.$slots.default({ id: 1 });
      // @ts-expect-error slots must retain their parameter type
      instance.$slots.default({ id: 'invalid' });
      void [props, missing, invalid, count, text];`)
    const program = ts.createProgram([consumer], { ...options, emitDeclarationOnly: false, noEmit: true, skipLibCheck: false, baseUrl: root, paths: { vue: ['node_modules/vue-compat-min'] } })
    const diagnostics = ts.getPreEmitDiagnostics(program)
    assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: (file) => file, getCurrentDirectory: () => root, getNewLine: () => '\n' }))
  } finally { rmSync(temp, { recursive: true, force: true }) }
})
