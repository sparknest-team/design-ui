import {test} from 'node:test';
import assert from 'node:assert/strict';
import {enhanceConfigurationComparison} from './demo-config-comparison.mjs';
const fixture=tag=>`<script setup>import {reactive} from 'vue';const __demoAppearance=reactive({size:'md'})</script><template><c-space><c-form><c-form-item label="size"><c-radio-group :options="[{label:'sm',value:'sm'},{label:'md',value:'md'}]" /></c-form-item></c-form><${tag} v-bind="__demoAppearance">Content</${tag}></c-space></template>`;
test('compares literal public options with one axis and a shared live model',()=>{const output=enhanceConfigurationComparison(fixture('c-input'));assert.match(output,/v-for="sample in demoComparedOptions"/);assert.match(output,/\[demoCompareAxis\]: sample/);assert.equal(enhanceConfigurationComparison(output),output);});
test('viewport messages keep one live instance and use presets instead of overlapping portals',()=>{const output=enhanceConfigurationComparison(fixture('c-message'));assert.equal((output.match(/<c-message\b/g)??[]).length,1);assert.match(output,/@click="__demoAppearance\[demoCompareAxis\] = sample"/);});

test('Maple language selectors remain scoped to hint labels', async()=>{
  const {createRequire}=await import('node:module');
  const require=createRequire(new URL('../../cedar-design-web/packages/ui/package.json',import.meta.url));
  const {parse,compileStyle}=require('@vue/compiler-sfc');
  const postcss=require('postcss');
  const descriptor=parse(enhanceConfigurationComparison(fixture('mp-input'))).descriptor;
  const style=compileStyle({source:descriptor.styles.at(-1).content,id:'data-v-comparison',scoped:true});
  postcss.parse(style.code).walkRules(rule=>{
    if(rule.nodes.some(node=>node.prop==='display'&&node.value==='none'))assert.match(rule.selector,/\.demo-config-comparison-hint/);
  });
});

test('positioned presets reveal the bound message instead of only changing hidden settings', () => {
 const source=fixture('c-message').replace('<c-message ', '<c-message v-model:open="open" ');
 assert.match(enhanceConfigurationComparison(source), /@click="\(\) => \{ __demoAppearance\[demoCompareAxis\] = sample; open = true \}"/);
});

test('message click handlers remain valid after Vue formatting without semicolons', async () => {
 const {createRequire}=await import('node:module');
 const require=createRequire(new URL('../../maple-design-mobile/packages/cli/package.json',import.meta.url));
 const prettier=require('prettier');
 const {parse,compileTemplate}=require('@vue/compiler-sfc');
 const output=enhanceConfigurationComparison(fixture('c-message').replace('<c-message ', '<c-message v-model:open="open" '));
 const formatted=await prettier.format(output,{parser:'vue',semi:false});
 const {descriptor,errors}=parse(formatted);
 assert.deepEqual(errors,[]);
 assert.deepEqual(compileTemplate({source:descriptor.template.content,filename:'message-preset.vue',id:'preset'}).errors,[]);
});

test('Cedar comparison controls use the public prop names in either language', () => {
 const output=enhanceConfigurationComparison(fixture('c-input'));
 assert.match(output,/aria-label="size"/);
 assert.doesNotMatch(output,/__demos__\/locale|span lang=|html.*\[lang|defineProps/);
});
