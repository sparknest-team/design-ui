import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { composeDemoComparison, namespaceExpression } from './compose-demo-comparison.mjs';
const require = createRequire(new URL('../../cedar-design-web/packages/ui/package.json', import.meta.url));
const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc');

test('isolates model assignments and respects expression-local parameters', () => {
  const names = new Set(['value', 'options']);
  assert.equal(namespaceExpression('value = !value', names, 'scene1'), 'scene1.value = !scene1.value');
  assert.equal(namespaceExpression('options.map(value => value.name)', names, 'scene1'), 'scene1.options.map(value => value.name)');
  assert.equal(namespaceExpression('value', names, 'scene1', new Set(['value'])), 'value');
});

test('inlines templates, isolates model state, scopes styles, and deduplicates imports', () => {
  const source = `<script setup lang="ts">import { ref } from 'vue';const value=ref('');const options=['a','b']</script><template><input v-model="value" @change="value = 'saved'"/><span v-for="value in options" :key="value">{{ value }}</span></template><style scoped>.target {color: red}</style>`;
  const output = composeDemoComparison(['a', 'b'].map(name => ({ name, file: name+'.vue', title: name, en: name, source })));
  assert.match(output, /v-model="scene1.value"/);
  assert.match(output, /v-model="scene2.value"/);
  assert.match(output, /v-for="value in scene1.options" :key="value"/);
  assert.equal((output.match(/import \{ ref \}/g)??[]).length, 1);
  assert.doesNotMatch(output, /import.*['"]\.\/.*\.vue/);
  assert.match(output, /\.demo-comparison-case--1/);
  const { descriptor, errors } = parse(output);
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: 'comparison' });
  assert.deepEqual(compileTemplate({source:descriptor.template.content,filename:'comparison.vue',id:'comparison',compilerOptions:{bindingMetadata:script.bindings}}).errors, []);
});

test('keeps scoped-slot variables and rejects global effects/macro components', () => {
  const scene={name:'slot',title:'slot',en:'slot',file:'slot.vue',source:`<script setup>const value='outer'</script><template><c-list><template #item="{ value }">{{ value }}</template>{{ value }}</c-list></template>`};
  assert.match(composeDemoComparison([scene,scene]), /#item="\{ value \}">{{ value }}<\/template>{{ scene1.value }}/);
  assert.throws(()=>composeDemoComparison([scene,{...scene,source:'<script setup>defineProps({})</script><template><div /></template>'}]), /macro/);
  assert.throws(()=>composeDemoComparison([scene,{...scene,source:'<template><div /></template><style>:root {color:red}</style>'}]), /global/);
});

test('Cedar comparison headings follow the document language at generation time', () => {
  const scenes = ['size', 'shape'].map(name => ({ name, title: '尺寸', en: 'Size', file: name + '.vue', source: '<template><c-button /></template>' }));
  for (const [language, heading] of [['zh-CN', '尺寸'], ['en-US', 'Size']]) {
    const output = composeDemoComparison(scenes, { language });
    assert.ok(output.includes(`<h4>${heading}</h4>`));
    assert.doesNotMatch(output, /__demos__\/locale|span lang=/);
    const { descriptor } = parse(output);
    assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: 'size.vue', id: 'size' }).errors, []);
  }
});
