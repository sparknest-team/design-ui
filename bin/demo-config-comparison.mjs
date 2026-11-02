import { createRequire } from 'node:module';
const require = createRequire(new URL('../../cedar-design-web/packages/cedar-ui/package.json', import.meta.url));
const { parse } = require('@vue/compiler-sfc');
const { parse: parseDom } = require('@vue/compiler-dom');
const babel = require('@babel/parser');
function literal(node) {
  if (node.type === 'ArrayExpression') return node.elements.map(literal);
  if (node.type === 'ObjectExpression') return Object.fromEntries(node.properties.map(prop => [prop.key.name ?? prop.key.value, literal(prop.value)]));
  if (['StringLiteral','NumericLiteral','BooleanLiteral'].includes(node.type)) return node.value;
  throw new Error(`Comparison options must be literal values: ${node.type}`);
}
export function enhanceConfigurationComparison(source) {
  if (source.includes('demo-config-comparison')) return source;
  if (!source.includes('__demoAppearance') && /const appearance\s*=/.test(source)) source = source.replace(/\bappearance\b/g, '__demoAppearance');
  const { descriptor } = parse(source);
  if (!descriptor.scriptSetup || !descriptor.template || !source.includes('__demoAppearance')) return source;
  const fields = [];
  let target;
  function visit(node) {
    if (node.type === 1) {
      const label = node.props.find(prop => prop.type === 6 && prop.name === 'label')?.value?.content;
      if (label) {
        const control = node.children.find(child => child.type === 1 && child.props.some(prop => prop.type === 7 && prop.arg?.content === 'options'));
        const options = control?.props.find(prop => prop.type === 7 && prop.arg?.content === 'options');
        if (options?.exp) fields.push({ name: label, values: literal(babel.parseExpression(options.exp.content)).map(option => option.value) });
      }
      if (node.props.some(prop => prop.type === 7 && prop.name === 'bind' && !prop.arg && prop.exp?.content === '__demoAppearance')) target = node;
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(parseDom(descriptor.template.content));
  if (!fields.length || !target) throw new Error('Appearance comparison requires explicit options and a live specimen');
  const prefix = target.tag.startsWith('mp-') ? 'mp' : 'c';
  const shadow = /-card$/.test(target.tag);
  if (shadow) fields.push({ name: 'elevation', values: [0, 2, 6] });
  // Messages are viewport-positioned: compare presets through one live instance.
  const singleton = /-(?:message|notification)$/.test(target.tag);
  const openModel = /v-model:open="([^"]+)"/.exec(target.loc.source)?.[1];
  const presetAction = openModel ? `() => { __demoAppearance[demoCompareAxis] = sample; ${openModel} = true }` : '__demoAppearance[demoCompareAxis] = sample';
  const comparison = singleton
    ? `<${prefix}-space wrap><${prefix}-button v-for="sample in demoComparedOptions" :key="String(sample)" @click="${presetAction}">{{ demoCompareAxis }}={{ sample }}</${prefix}-button></${prefix}-space>\n${target.loc.source}`
    : `<div class="demo-config-comparison">\n<section v-for="sample in demoComparedOptions" :key="String(sample)">\n<p><code>{{ demoCompareAxis }}={{ sample }}</code></p>\n${target.loc.source.replace('v-bind="__demoAppearance"','v-bind="{ ...__demoAppearance, [demoCompareAxis]: sample }"')}\n</section>\n</div>`;
  const block = `<p class="demo-config-comparison-hint"><span lang="zh-CN">选择一个对比维度；其他配置和内容保持一致。输入类示例共享同一个值，便于比较外观。</span><span lang="en-US">Compare one dimension while keeping the other settings and content identical. Input specimens share the same value.</span></p>\n<${prefix}-radio-group v-model="demoCompareAxis" aria-label="Compare configuration" :options="demoCompareFields.map(field => ({ label: field.name, value: field.name }))" />\n${comparison}`;
  const start = descriptor.template.loc.start.offset + target.loc.start.offset;
  const end = descriptor.template.loc.start.offset + target.loc.end.offset;
  source = source.slice(0, start) + block + source.slice(end);
  if (shadow) {
    const control = `<${prefix}-form-item label="elevation"><${prefix}-radio-group v-model="__demoAppearance['elevation']" aria-label="elevation" :options="[{ label: '0', value: 0 }, { label: '2', value: 2 }, { label: '6', value: 6 }]" /></${prefix}-form-item>`;
    source = source.replace(`</${prefix}-form>`, control + `</${prefix}-form>`);
  }
  const script = `\nimport { computed as demoComputed, ref as demoRef } from 'vue'\n${shadow ? "__demoAppearance['elevation'] = 2" : ''}\nconst demoCompareFields = ${JSON.stringify(fields)}\nconst demoCompareAxis = demoRef(${JSON.stringify(fields[0].name)})\nconst demoComparedOptions = demoComputed(() => demoCompareFields.find(field => field.name === demoCompareAxis.value)?.values ?? [])\n`;
  source = source.slice(0, descriptor.scriptSetup.loc.end.offset) + script + source.slice(descriptor.scriptSetup.loc.end.offset);
  return source + `\n<style scoped>\n.demo-config-comparison { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 20px; min-width: 0; max-width: 100%; }\n.demo-config-comparison > section { min-width: 0; }\n.demo-config-comparison p { margin: 0 0 8px; }\nhtml:not([lang='en-US']) .demo-config-comparison-hint > [lang='en-US'],\nhtml[lang='en-US'] .demo-config-comparison-hint > [lang='zh-CN'] { display: none; }\n</style>\n`;
}
