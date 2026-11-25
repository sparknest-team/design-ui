import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { markdownSections, renderSection } from './api-document-structure.mjs'
import { cedarDemoFamily, groupDemoSections } from './group-demo-sections.mjs'
import { documentationFiles } from './normalize-api-headings.mjs'
import { organizePublicDocument } from './public-documentation-policy.mjs'
import { tokenSelectorCondition } from './token-selector-condition.mjs'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const start = '<!-- component-css-variables:start -->'
const end = '<!-- component-css-variables:end -->'
const code = (value) => {
  const text = String(value).replaceAll('\n', ' ')
  return /[|`]/.test(text)
    ? '<code>' +
        text
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('|', '&#124;')
          .replaceAll('`', '&#96;') +
        '</code>'
    : '`' + text + '`'
}

export function publicTokens(report, platform, owner) {
  return Object.fromEntries(
    report.components
      .filter((row) => row.platform === platform && (row.component === owner || row.component.startsWith(owner + '/')))
      .flatMap((row) => Object.entries(row.tokens ?? {}).filter(([, token]) => token.visibility === 'public'))
      .sort(([a], [b]) => a.localeCompare(b, 'en')),
  )
}

export function renderComponentVariables(tokens, { en = false, dependencies = [] } = {}) {
  const names = Object.keys(tokens)
  let text = start + '\n\n'
  if (!names.length) {
    text += en
      ? 'This component declares no independent public CSS variables. Use the configuration and layout APIs documented on this page.'
      : '本组件未声明独立的公共 CSS 变量。请使用本页公开的配置与布局入口。'
    if (dependencies.length)
      text += en
        ? ` The appearance of composed controls follows the public variables of ${dependencies.map(code).join(', ')}; a shared variable can affect other controls in the same DOM subtree.`
        : ` 组合控件的外观复用 ${dependencies.map(code).join('、')} 的公共变量；共享变量可能同时影响同一 DOM 子树中的其他控件。`
    text +=
      '\n\n' +
      (en
        ? 'Internal custom properties and measurement values are implementation details and are not customization APIs.'
        : '内部自定义属性与测量中间值属于实现细节，不作为业务定制 API。')
  } else {
    text += en
      ? 'Use these variables to customize the component. Defaults may vary by the selector condition shown. Each variable applies to the corresponding size, variant and interaction states.\n\n'
      : '通过以下变量定制组件外观。默认值随表中注明的主题或选择器条件变化；变量仅在对应的尺寸、变体和交互状态下生效。\n\n'
    text += '<div class="token-reference-table" style="max-width: 100%; overflow-x: auto;">\n\n'
    text += en
      ? '| Variable | Default / condition | Affected styles |\n| --- | --- | --- |\n'
      : '| 变量 | 默认值／条件 | 影响的样式 |\n| --- | --- | --- |\n'
    for (const [name, token] of Object.entries(tokens)) {
      const definitions = token.definitions?.length
        ? token.definitions
        : token.values.map((value) => ({ value, selector: ':root' }))
      const values = definitions
        .map(({ value, selector }) => {
          const condition = tokenSelectorCondition(selector)
          return code(value) + (condition && condition !== ':root' ? ' (' + code(condition) + ')' : '')
        })
        .join('<br>')
      const properties = token.consumerProperties ?? []
      const consumer = properties.length ? properties.map(code).join(', ') : en ? 'Component styling' : '组件样式'
      assert.notEqual(token.consumer, 'needs-review', `${name}: review its consumer before publishing`)
      text += `| ${code(name)} | ${values} | ${consumer} |\n`
    }
    text += '\n</div>\n\n'
    const example =
      names.find((name) => /background|border-radius|text-color|padding|gap|size|color/.test(name)) ?? names[0]
    const token = tokens[example]
    const value = token.definitions?.find((item) => item.selector === ':root')?.value ?? token.values[0]
    text += en
      ? 'Apply overrides to the rendered component root or the actual popup ancestor. For example, add the following class to that element and replace the value as needed:\n\n'
      : '将覆盖设置在组件实际根节点或弹层真实挂载祖先上。例如给该元素添加下列 class，再按需替换变量值：\n\n'
    text += '```css\n.component-theme {\n  ' + example + ': ' + value + ';\n}\n```\n\n'
    text += en
      ? 'Explicit inline styles and props that write the same CSS property take precedence over stylesheet defaults. After Teleport, ordinary CSS variables inherit from the actual mount location. When using ThemeProvider, follow its local-theme and popup configuration rules. Override the component variable directly for local styling; root-level aliases are not recalculated merely because a descendant system variable changes. Internal variables are not public APIs.'
      : '显式行内样式及直接写入同一 CSS 属性的 Props 优先于样式表默认值。Teleport 后，普通 CSS 变量按实际挂载位置继承；使用 ThemeProvider 时，请遵循其局部主题与弹层配置规则。局部定制请直接覆盖组件变量；仅修改后代的 system 变量不会重新计算从根继承的组件别名。内部变量不属于公共 API。'
  }
  return text + '\n\n' + end + '\n'
}

// Keep authored explanations, examples and semantic-role tables. Default-value
// tables are replaced by the generated complete table rather than left to drift.
function removeDefaultTables(text) {
  return text.replace(/(?:^\|[^\n]*\n)+/gm, (table) => {
    const header = table.split('\n')[0]
    // Semantic-role and purpose tables explain customization choices; they
    // complement the generated defaults rather than competing with them.
    if (/默认(?:语义|角色)|system role|default semantic|职责|Purpose/i.test(header)) return table
    return /--[a-z][\w-]*/.test(table) && /默认(?:值)?|\bDefault\b/i.test(header) ? '' : table
  })
}

export function updateComponentDocument(source, block, options = {}) {
  let text = source.replace(
    /<!-- component-css-variables:start -->[\s\S]*?<!-- component-css-variables:end -->\n?/g,
    '',
  )
  const tree = markdownSections(text.trimEnd() + '\n\n')
  tree.body = tree.body.trimEnd() + '\n\n'
  let css = tree.children.find((node) => /^CSS Variables$/i.test(node.title))
  if (!css) {
    css = { level: 2, title: 'CSS Variables', heading: '## CSS Variables\n', body: '\n', children: [] }
    tree.children.push(css)
  }
  function clean(node) {
    node.body = removeDefaultTables(node.body)
    node.children?.forEach(clean)
  }
  clean(css)
  // An appended generated child must not capture a following authored heading.
  css.body = css.body.trimEnd() + (css.body.trim() ? '\n\n' : '\n') + block + '\n'
  return organizePublicDocument(renderSection(tree).trimEnd() + '\n', options)
}

function dependenciesFor(src, family, report, platform) {
  const file = path.join(src, family, 'style/index.ts')
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
  const imports = [...text.matchAll(/(?:from\s*)?['"]\.\.\/\.\.\/([a-z][\w-]*)\/style(?:\/index)?['"]/g)].map(
    (match) => match[1],
  )
  // Styleless wrappers reuse their controls' visual contracts.
  const wrappers = {
    mention: ['input', 'textarea'],
    'date-range': ['date'],
    'time-range': ['time'],
    'split-button': ['button', 'dropdown'],
  }
  return [...new Set([...imports, ...(wrappers[family] ?? [])])]
    .filter((name) => Object.keys(publicTokens(report, platform, name)).length)
    .sort()
}

export function synchronizeComponentCssDocs(report, { write = false } = {}) {
  assert.equal(report.totals.errors, 0, 'Do not write component docs from a partial inventory')
  assert.equal(report.totals.needsManualReview, 0, 'Review every candidate consumer before publishing')
  const changes = []
  const groups = Object.fromEntries(
    ['c', 'mp'].map((platform) => [
      platform,
      JSON.parse(
        fs.readFileSync(
          new URL(`../configs/demo-groups${platform === 'mp' ? '.maple' : ''}.json`, import.meta.url),
          'utf8',
        ),
      ),
    ]),
  )
  let checked = 0
  for (const { filename, sourceRoot, relative, platform: library } of documentationFiles()) {
    const family = relative.split('/')[0]
    const platform = library === 'cedar' ? 'c' : 'mp'
    if (
      !fs.existsSync(path.join(sourceRoot, family, 'index.ts')) &&
      !fs.existsSync(path.join(sourceRoot, family, 'props.ts'))
    )
      continue
    const ownerPath = relative.replace(/\/(?:docs\/)?[^/]+\.md$/, '')
    const owner = report.components.some((row) => row.platform === platform && row.component === ownerPath)
      ? ownerPath
      : family
    const tokens = publicTokens(report, platform, owner)
    const block = renderComponentVariables(tokens, {
      en: /en-US/.test(filename),
      dependencies: dependenciesFor(sourceRoot, family, report, platform),
    })
    const previous = fs.readFileSync(filename, 'utf8')
    const demoFamily =
      platform === 'c' ? cedarDemoFamily(relative) : relative.replace(/\/docs\/(?:zh-CN|en-US)\.md$/, '')
    const next = groupDemoSections(
      updateComponentDocument(previous, block, { primary: '', en: /en-US/.test(filename) }),
      groups[platform][demoFamily],
      /en-US/.test(filename),
    )
    checked++
    if (next !== previous) {
      changes.push(path.relative(workspace, filename))
      if (write) fs.writeFileSync(filename, next)
    }
  }
  return { checked, changed: changes.length, files: changes }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const reportArg = process.argv.find((arg) => arg.startsWith('--report='))
  let report
  if (reportArg) report = JSON.parse(fs.readFileSync(reportArg.slice(9), 'utf8'))
  else {
    const run = spawnSync(process.execPath, [path.join(workspace, 'design-ui/bin/token-inventory.mjs')], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    })
    assert.equal(run.status, 0, run.stderr || 'Token inventory failed')
    report = JSON.parse(run.stdout)
  }
  const result = synchronizeComponentCssDocs(report, { write: process.argv.includes('--write') })
  console.log(JSON.stringify(result, null, 2))
  if (!process.argv.includes('--write') && result.changed) process.exitCode = 1
}
