import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatReviewVue, instrument, makeField, readApi, sourceProps } from './generate-review-demos.mjs'

test('reads only public API tables, including escaped unions and old emphasis syntax', () => {
  const api = readApi(
    `### 示例属性\n\n| 属性 | 类型 |\n| --- | --- |\n| fake | boolean |\n\n## API\n\n| 属性 | 说明 | 类型 | 默认值 |\n| --- | --- | --- | --- |\n| size | 尺寸 | _'sm' \\| 'md'_ | md |\n| v-model:open | 开关 | boolean | false |\n\n### Events\n\n| 事件 | 说明 |\n| --- | --- |\n| update:open | 更新 |`,
  )
  assert.deepEqual(
    api.props.map((item) => item.name),
    ['size', 'open'],
  )
  assert.deepEqual(makeField(api.props[0]).options, ['sm', 'md'])
  assert.equal(api.events[0].name, 'update:open')
})
test('resolves inherited prop objects, scalar aliases and quoted enum defaults', () => {
  const file = new URL('../../maple-design-mobile/packages/ui/src/input/props.ts', import.meta.url).pathname
  const fields = sourceProps(file, 'inputProps').map(makeField)
  assert.equal(fields.find((field) => field.name === 'edit-mode').kind, 'enum')
  assert.deepEqual(fields.find((field) => field.name === 'variant').options, ['filled', 'outline', 'standard'])
  assert.equal(fields.find((field) => field.name === 'hint').kind, 'boolean')
  assert.equal(fields.find((field) => field.name === 'popup-container').kind, 'json')
  assert.equal(
    makeField({
      name: 'variant',
      type: "'outline' | 'filled'",
      defaultValue: "'filled'",
    }).initial,
    'filled',
  )
  assert.equal(
    makeField({
      name: 'value',
      type: 'string | number',
      defaultValue: 'undefined',
    }).kind,
    'scalar',
  )
})
test('does not overwrite an authored Options API setup with a second setup script', () => {
  const source =
    '<script>export default { setup() { return { value: 1 } } }</script><template><c-input :model-value="value" /></template>'
  assert.equal(instrument(source, 'fixture.vue', 'c-input', 'api-review.config.json'), undefined)
})
test('normalizes plain v-model to its actual model-value prop', () => {
  const api = readApi(
    '## API\n### Props\n| 属性 | 类型 |\n| --- | --- |\n| v-model | string |\n| v-model:open | boolean |',
  )
  assert.deepEqual(
    api.props.map((field) => field.name),
    ['model-value', 'open'],
  )
})
test('keeps callbacks and structured fixtures as scenarios instead of fabricating values', () => {
  const field = (type) =>
    makeField({
      name: 'value',
      description: '',
      type,
      defaultValue: 'undefined',
    })
  assert.equal(field('(value: string) => Promise<boolean>').kind, 'scenario')
  assert.equal(field('Option[]').kind, 'scenario')
  assert.equal(field('boolean').kind, 'boolean')
  assert.equal(field('string[]').kind, 'json')
  assert.equal(field('boolean | number').kind, 'json')
})

test('generated suite entries pass Maple lint before any batch fix and format idempotently', async () => {
  const { createRequire } = await import('node:module')
  const mapleRoot = new URL('../../maple-design-mobile/', import.meta.url).pathname
  const require = createRequire(new URL('../../maple-design-mobile/package.json', import.meta.url))
  const { ESLint } = require('eslint')
  const filename = `${mapleRoot}packages/ui/src/space/example/demos/api-review.vue`
  const source = `<script setup>
import { markRaw } from 'vue'
import DemoApiReviewSuite from '../../../../docs/components/ApiReviewSuite.vue'
import Case0 from './api-review-main.vue'
const cases = [{name:"main",label:"mp-space · 组合属性",component:markRaw(Case0)} ]
</script>
<template><DemoApiReviewSuite :cases="cases" /></template>
`
  const previous = process.cwd()
  process.chdir(mapleRoot)
  try {
    const eslint = new ESLint({ cwd: mapleRoot, fix: false })
    const [before] = await eslint.lintText(source, { filePath: filename })
    assert.ok(before.messages.some((message) => message.ruleId === 'prettier/prettier'))
    const formatted = await formatReviewVue(source, filename)
    const [after] = await eslint.lintText(formatted, { filePath: filename })
    assert.deepEqual(after.messages, [])
    assert.equal(await formatReviewVue(formatted, filename), formatted)
  } finally {
    process.chdir(previous)
  }
})

test('rejects malformed generated Vue before it can be written', async () => {
  const filename = new URL(
    '../../maple-design-mobile/packages/ui/src/space/example/demos/api-review.vue',
    import.meta.url,
  ).pathname
  await assert.rejects(formatReviewVue('<template><div></template>', filename))
})

test('generated bindings preserve prop precedence and retain authored listeners after bindings', () => {
  const generated = instrument(
    '<script setup>const label = "fixed"; const handle = () => {}</script><template><mp-button @click="handle" :text="label" /></template>',
    'fixture.vue',
    'mp-button',
    'api-review.config.json',
  )
  assert.ok(generated)
  const source = generated.source
  assert.ok(source.indexOf(':text="label"') < source.indexOf('v-bind="__apiReview.bindings"'))
  assert.ok(source.indexOf('v-bind="__apiReview.bindings"') < source.indexOf('@click="handle"'))
  assert.equal(source.match(/@click="handle"/g).length, 1)
})

test('an authored empty setup block does not create duplicate generated setup blocks', () => {
  const generated = instrument(
    '<script setup></script><template><mp-count-to :to="123" /></template>',
    'fixture.vue',
    'mp-count-to',
    'api-review.config.json',
  )
  assert.ok(generated)
  assert.equal(generated.source.match(/<script setup/g).length, 1)
})

test('prunes only stale generated case files and their configs', async () => {
  const fs = await import('node:fs')
  const os = await import('node:os')
  const path = await import('node:path')
  const { pruneGeneratedReviewCases } = await import('./complete-review-demos.mjs')
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'review-case-prune-'))
  const marker = '<!-- Generated by design-ui/bin/generate-review-demos.mjs; fixture: basic.vue -->'
  try {
    for (const name of ['keep', 'stale', 'main']) {
      fs.writeFileSync(path.join(directory, `api-review-${name}.vue`), marker)
      fs.writeFileSync(path.join(directory, `api-review-${name}.config.json`), '{}')
    }
    const authored = path.join(directory, 'api-review-authored.vue')
    fs.writeFileSync(authored, '<template>authored</template>')
    const live = [path.join(directory, 'api-review-keep.vue')]
    assert.deepEqual(pruneGeneratedReviewCases([directory], live), [path.join(directory, 'api-review-stale.vue')])
    assert.equal(fs.existsSync(path.join(directory, 'api-review-stale.config.json')), false)
    assert.equal(fs.existsSync(authored), true)
    assert.equal(fs.existsSync(path.join(directory, 'api-review-main.vue')), true)
    assert.deepEqual(pruneGeneratedReviewCases([directory], live), [])
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

test('review checks accept documented slot-only components without accepting missing prop controls', async () => {
  const { hasReviewableApi } = await import('./complete-review-demos.mjs')
  const config = { fields: [] }
  const slotsOnly = { props: [], slots: [{ name: 'default' }], events: [], methods: [] }
  assert.equal(hasReviewableApi(config, slotsOnly), true)
  assert.equal(hasReviewableApi(config, { ...slotsOnly, props: [{ name: 'size' }] }), false)
  assert.equal(hasReviewableApi(config, undefined), false)
  assert.equal(hasReviewableApi({ fields: [{ name: 'size' }] }, undefined), true)
})
