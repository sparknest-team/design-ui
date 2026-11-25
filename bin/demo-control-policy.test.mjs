import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeDemoControls, normalizeSimpleLayout, renderConfigurationField } from './demo-control-policy.mjs'

for (const prefix of ['c', 'mp']) {
  test(`${prefix}: fixed configuration options keep values, events and accessibility when changed to RadioGroup`, () => {
    const source = `<script setup>const modes=['inline','popup']; const presentation=ref('inline')</script><template><${prefix}-space wrap><div><span>Presentation</span><${prefix}-select v-model="presentation" :options="modes" :clearable="false" @change="changed" aria-label="Presentation" /></div></${prefix}-space></template>`
    const output = normalizeDemoControls(source, prefix, '/src/form/example/field.vue')
    assert.equal(output.controls[0].kind, 'radio')
    assert.match(output.source, new RegExp(`<${prefix}-form-item[^>]+label="Presentation"`))
    assert.match(output.source, /v-model="presentation"/)
    assert.match(output.source, /@change="changed"/)
    assert.match(output.source, /:options="modes"/)
    assert.match(output.source, /aria-label="Presentation"/)
    assert.doesNotMatch(output.source, new RegExp(`<${prefix}-select`))
    assert.equal(normalizeDemoControls(output.source, prefix, '/src/form/example/field.vue').source, output.source)
  })
  test(`${prefix}: Select demonstrations and business fields retain their actual select API`, () => {
    const source = `<script setup>const options=['Alpha','Beta']</script><template><${prefix}-form-item><${prefix}-select v-model="person" :options="options" multiple filterable /></${prefix}-form-item></template>`
    const output = normalizeDemoControls(source, prefix, '/src/select/example/multiple.vue')
    assert.equal(output.source, source)
    assert.equal(output.controls[0].kind, 'select')
  })
  test(`${prefix}: long, searchable and dynamic configuration lists keep Select with a standard width owner`, () => {
    for (const [options, attrs] of [
      ["['a','b','c','d','e','f']", ''],
      ["['a','b']", 'filterable'],
      ['remoteOptions', ''],
    ]) {
      const source = `<template><${prefix}-space wrap><div><span>Variant</span><${prefix}-select v-model="variant" :options="${options}" ${attrs}/></div></${prefix}-space></template>`
      const output = normalizeDemoControls(source, prefix, '/src/alert/example/variant.vue')
      assert.equal(output.controls[0].kind, 'select')
      assert.match(output.source, new RegExp(`<${prefix}-form-item`))
      assert.match(output.source, new RegExp(`<${prefix}-select`))
      assert.equal(normalizeDemoControls(output.source, prefix).source, output.source)
    }
  })
  test(`${prefix}: native option values and event handlers survive small-choice migration`, () => {
    const source = `<template><${prefix}-select v-model="trigger" @change="changed"><${prefix}-option label="click"/><${prefix}-option label="hover"/></${prefix}-select></template>`
    const output = normalizeDemoControls(source, prefix, '/src/tooltip/example/trigger.vue')
    assert.equal(output.controls[0].kind, 'radio')
    assert.match(output.source, /&quot;value&quot;:&quot;click&quot;/)
    assert.match(output.source, /&quot;value&quot;:&quot;hover&quot;/)
    assert.match(output.source, /@change="changed"/)
  })
  test(`${prefix}: simple layouts use Space while geometry and layout teaching cases retain intent`, () => {
    const source =
      '<template><div v-if="count > 0" style="display:flex;flex-wrap:wrap;gap:12px"><button>Run</button></div></template>'
    const result = normalizeSimpleLayout(source, prefix, '/src/dialog/example/basic.vue')
    assert.match(result, new RegExp(`<${prefix}-space wrap size="12px" v-if="count > 0"`))
    assert.equal(normalizeSimpleLayout(result, prefix), result)
    for (const style of [
      'display:flex;position:absolute;gap:8px',
      'display:grid;grid-template-columns:24px 1fr;gap:8px',
    ]) {
      const geometric = `<template><div style="${style}">anchor</div></template>`
      assert.equal(normalizeSimpleLayout(geometric, prefix), geometric)
    }
    assert.equal(normalizeSimpleLayout(source, prefix, '/src/space/example/basic.vue'), source)
  })
  test(`${prefix}: generator emits the same public field patterns`, () => {
    assert.match(
      renderConfigurationField(prefix, { name: 'variant', options: ['a', 'b'] }, 'state.variant'),
      new RegExp(`<${prefix}-radio-group`),
    )
    const long = renderConfigurationField(
      prefix,
      { name: 'status', options: ['a', 'b', 'c', 'd', 'e', 'f'] },
      'state.status',
    )
    assert.match(long, new RegExp(`<${prefix}-form-item`))
    assert.match(long, new RegExp(`<${prefix}-select`))
  })
  test(`${prefix}: layout normalization preserves the business form boundary`, () => {
    const source = `<template><${prefix}-form :model="model"><${prefix}-space wrap><${prefix}-form-item label="Name"><${prefix}-input v-model="model.name" /></${prefix}-form-item></${prefix}-space></${prefix}-form></template>`
    assert.equal(normalizeDemoControls(source, prefix, '/src/form/example/basic.vue').source, source)
  })
  test(`${prefix}: native bound numeric values keep their identity`, () => {
    const source = `<template><${prefix}-select v-model="mode"><${prefix}-option label="First" :value="0"/><${prefix}-option label="Second" :value="1" :disabled="false" /></${prefix}-select></template>`
    const output = normalizeDemoControls(source, prefix, '/src/tooltip/example/mode.vue')
    assert.match(output.source, /&quot;value&quot;:0/)
    assert.match(output.source, /&quot;value&quot;:1/)
    assert.match(output.source, /&quot;disabled&quot;:false/)
  })
}
