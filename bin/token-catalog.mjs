import { tokenSelectorCondition } from './token-selector-condition.mjs';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const workspace = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(resolve(workspace, 'cedar-design-web/packages/ui/package.json'));
const destinations = [
  ['c', 'zh', 'cedar-design-web/packages/ui/docs/guide/design-token-reference.md'],
  ['mp', 'zh', 'maple-design-mobile/packages/ui/docs/designTokenReference.zh-CN.md'],
  ['mp', 'en', 'maple-design-mobile/packages/ui/docs/designTokenReference.en-US.md'],
];
const code = value => {
  const text = String(value).replaceAll('\n', ' ');
  // Entities in Markdown code spans are literal text. Use HTML for values
  // containing delimiters so table parsing and the displayed value both survive.
  return /[|`]/.test(text)
    ? '<code>' + text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '&#124;').replaceAll('`', '&#96;') + '</code>'
    : '`' + text + '`';
};
const consumerLabels = {
  'local-css': ['本组件 CSS', 'Local CSS'],
  'cross-component-css': ['跨组件 CSS', 'Cross-component CSS'],
  'literal-runtime-reference': ['运行时引用（不代表可见性证明）', 'Runtime reference (not visibility proof)'],
  'reviewed-dynamic-runtime': ['已审动态运行时', 'Reviewed dynamic runtime'],
  'needs-review': ['待审查，不应依赖', 'Needs review; do not depend on it'],
};

export function renderCatalog(report, platform, language) {
  assert.equal(report.totals.errors, 0, 'Do not publish a partial catalog after compilation errors');
  const en = language === 'en';
  const rows = report.components.filter(row => row.platform === platform);
  const name = platform === 'c' ? 'Cedar' : 'Maple';
  let text = platform === 'c' ? '---\npermalink: /guide/design-token-reference/\n---\n\n' : '';
  text += `# ${name} ${en ? 'Component CSS Variable Reference' : '组件 CSS 变量参考'}\n\n`;
  text += en
    ? 'Generated from compiled component token declarations. Do not edit tables by hand: run `node bin/token-catalog.mjs --patch` in design-ui and apply the patch; `--check` detects drift.\n\n'
    : '本页由组件 Token 声明编译生成，不手工维护表格。在 design-ui 运行 `node bin/token-catalog.mjs --patch` 后应用补丁；`--check` 检查源码与文档是否一致。\n\n';
  text += en
    ? 'Use this alongside Design Tokens and CSS Variable Layers: this reference lists exact names, declaration values and consumption evidence, not a claim that all components passed visual acceptance. Values are declarations, not computed pixels; multiple values retain their selector conditions. Runtime theme objects and inline props can override them. Foundation/system roles are explained in the design guide, not duplicated as component APIs here.\n\n'
    : '与《Design Token 与 CSS 变量分层》配合阅读：这里列出准确名称、声明值与消费证据，不代表所有组件均通过视觉验收。值是声明表达式，不是最终像素；多值保留各自选择器条件，主题对象和行内属性仍可覆盖。foundation/system 的角色见设计规范，不在这里冒充组件 API。\n\n';
  text += en
    ? 'Public variables may be overridden on the rendered component root or the real popup ancestor. Internal variables are implementation details and must not be used by applications. Size/variant/status/loading/disabled govern when a token is used; declaration does not imply every state consumes it. CSS property lists describe transitive compiled reachability, not selector visibility or precedence.\n\n'
    : '公开变量可在组件实际根节点或弹层真实挂载祖先覆盖；内部变量只用于实现，业务禁止依赖。size / variant / status / loading / disabled 决定何时消费，不能认为一个变量在所有状态都生效。消费属性列表来自编译后的传递引用，只证明可达性，不替代选择器可见性和优先级检查。\n\n';
  for (const row of rows) {
    text += `## ${row.component}\n\n`;
    text += `${en ? 'Source' : '声明来源'}: ${code('src/' + (row.declarationSource ?? `${row.component}/style/token.less`))}\n\n`;
    if (row.component === 'ripple') text += en
      ? 'expand-duration / fade-duration reach transform / opacity transitions; runtime also reads their resolved duration/delay from the actual wave to avoid premature fading/removal. The two 250ms minimum lifecycle policies are not CSS tokens. See the design guide for sampling boundaries and cleanup ownership. This indirect timing consumption is not a literal var() runtime reference.\n\n'
      : 'expand-duration／fade-duration 消费到 transform／opacity 过渡；运行时再读取实际波纹计算后的 duration/delay，避免提前淡出或删除。两个 250ms 生命周期下限不是 CSS Token。采样边界与清理归属见设计指南；此间接时序消费不冒充运行时字面 var() 引用。\n\n';
    text += '<div class="token-reference-table" style="max-width: 100%; overflow-x: auto;">\n\n';
    text += en ? '| Variable | Layer | Declaration / condition | Consumer / CSS properties |\n| --- | --- | --- | --- |\n' : '| 变量 | 层级 | 声明值／条件 | 消费路径／CSS 属性 |\n| --- | --- | --- | --- |\n';
    for (const [token, info] of Object.entries(row.tokens ?? {}).sort(([a], [b]) => a.localeCompare(b, 'en'))) {
      const definitions = info.definitions?.length ? info.definitions : info.values.map(value => ({ value, selector: '' }));
      const value = definitions.map(({ value, selector }) => { const condition = tokenSelectorCondition(selector); return code(value) + (condition && condition !== ':root' ? ` (${code(condition)})` : ''); }).join('<br>');
      const label = consumerLabels[info.consumer]?.[en ? 1 : 0] ?? info.consumer;
      const properties = [...new Set(info.consumerProperties ?? [])].sort().map(code).join(', ');
      const runtime = [...(row.literalRuntimeReferences?.[token] ?? []), ...(row.dynamicRuntimeReferences?.[token] ?? [])].map(code).join(', ');
      text += `| ${code(token)} | ${info.visibility === 'internal' ? (en ? 'Internal' : '内部') : (en ? 'Public' : '公开')} | ${value} | ${label}${properties ? '<br>' + properties : ''}${runtime ? '<br>' + runtime : ''} |\n`;
    }
    text += '\n</div>\n\n';
  }
  return text.trimEnd() + '\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const reportArg = process.argv.find(arg => arg.startsWith('--report='));
  let report;
  if (reportArg) report = JSON.parse(readFileSync(reportArg.slice(9), 'utf8'));
  else {
    const run = spawnSync(process.execPath, [resolve(workspace, 'design-ui/bin/token-inventory.mjs')], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    assert.equal(run.status, 0, run.stderr || 'Token inventory failed');
    report = JSON.parse(run.stdout);
  }
  const target = process.argv.find(arg => arg.startsWith('--target='))?.slice(9);
  const selected = destinations.filter(([, , path]) => !target || path === target);
  assert.ok(selected.length, 'Unknown catalog target');
  const patches = [];
  for (const [platform, language, path] of selected) {
    const actual = renderCatalog(report, platform, language);
    const absolute = resolve(workspace, path);
    const previous = existsSync(absolute) ? readFileSync(absolute, 'utf8') : null;
    if (process.argv.includes('--check')) assert.ok(previous === actual, `${path}: regenerate token reference`);
    else if (previous !== actual) {
      if (previous === null) patches.push(`*** Add File: ${absolute}\n` + actual.trimEnd().split('\n').map(line => '+' + line).join('\n'));
      else {
        // Include token rows so repeated table endings cannot anchor a hunk
        // in the wrong component section when apply_patch locates its context.
        const diff = require('diff').structuredPatch(path, path, previous, actual, '', '', { context: 12 });
        patches.push(`*** Update File: ${absolute}\n` + diff.hunks.map(hunk => '@@\n' + hunk.lines.filter(line => !line.startsWith('\\ No newline')).join('\n')).join('\n'));
      }
    }
  }
  if (process.argv.includes('--check')) console.log(`Token reference passed: ${selected.length} generated pages match current declarations.`);
  else if (patches.length) console.log('*** Begin Patch\n' + patches.join('\n') + '\n*** End Patch');
}
