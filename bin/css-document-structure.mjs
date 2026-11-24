import { markdownSections, renderSection } from './api-document-structure.mjs'

// References share one entry; headings describing runnable examples are untouched.
const groups = new Map([
  ['新增语义文字变量', '语义文字色'],
  ['Additional semantic text variables', 'Semantic text colors'],
  ['Semantic text variables', 'Semantic text colors'],
  ['CSS 变量职责与完整默认值', ''],
  ['CSS 变量与颜色语义', ''],
  ['CSS variables and color semantics', ''],
  ['完整变量默认值', ''],
  ['完整变量默认值与使用边界', ''],
  ['默认样式变量', ''],
  ['Default style variables', ''],
  ['Governed defaults', ''],
  ['通用样式变量（节选）', ''],
  ['颜色变量', '颜色'],
  ['Color variables', 'Colors'],
  ['动效变量', '动效'],
  ['Motion variables', 'Motion'],
  ['Motion tokens', 'Motion'],
  ['Loading tokens', 'Loading'],
  ['错误与禁用边框变量', '错误与禁用边框'],
  ['Error and disabled border variables', 'Error and disabled borders'],
  ['当前内容变量', '内容'],
  ['Current content variables', 'Content'],
  ['状态与时长变量', '状态与时长'],
  ['State and duration variables', 'State and duration'],
  ['Geometry and motion variables', 'Geometry and motion'],
  ['单选对勾样式变量', '单选对勾'],
  ['Single-selection checkmark variables', 'Single-selection checkmark'],
  ['选中对勾样式变量', '选中对勾'],
  ['Selected-checkmark style variables', 'Selected checkmark'],
  ['Brand appearance tokens', 'Brand appearance'],
])
const cssTitle = (title) => /^(?:([A-Z][\w.]*)\s+)?CSS Variables$/i.exec(title)
const hasVariables = (text) => /--(?:c|mp)-/.test(text)
const hasDemo = (text) => /<demo\b|```demo/.test(text)

export function normalizeCssVariables(source, primary) {
  const tree = markdownSections(source)
  const references = []
  let insertion
  // Preserve reference order even when a CSS chapter contains category groups.
  function collect(nodes) {
    const kept = []
    for (const node of nodes) {
      const css = cssTitle(node.title)
      const category = groups.has(node.title) && hasVariables(renderSection(node)) && !hasDemo(renderSection(node))
      if (css || category) {
        if (node.level === 2 && insertion === undefined) insertion = kept.length
        const title = css ? (css[1] && css[1] !== primary ? css[1] : '') : groups.get(node.title)
        references.push({
          ...node,
          title,
          heading: title ? `### ${title}\n` : '',
          level: 3,
          children: normalizeGroups(node.children),
        })
      } else {
        node.children = collect(node.children)
        kept.push(node)
      }
    }
    return kept
  }
  function normalizeGroups(nodes) {
    return nodes.map((node) => {
      const css = cssTitle(node.title)
      const title = css ? (css[1] && css[1] !== primary ? css[1] : '') : (groups.get(node.title) ?? node.title)
      return { ...node, title, children: normalizeGroups(node.children) }
    })
  }
  function joinBodies(parts) {
    const text = parts
      .filter((text) => text.trim())
      .map((text) => text.trim())
      .join('\n\n')
    const tables = new Set()
    let fence
    return text
      .split(/(\n\n+)/)
      .map((part) => {
        const wasFenced = Boolean(fence)
        for (const line of part.split('\n')) {
          const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1]
          if (marker) {
            if (!fence) fence = marker[0]
            else if (fence === marker[0]) fence = undefined
          }
        }
        if (!wasFenced && !fence && /^\|[^\n]*(?:\n\|[^\n]*)*$/.test(part.trim())) {
          const key = part
            .trim()
            .split('\n')
            .map((line) =>
              line
                .split('|')
                .map((cell) => cell.trim())
                .join('|'),
            )
            .join('\n')
          if (tables.has(key)) return ''
          tables.add(key)
        }
        return part
      })
      .join('')
  }
  function combine(nodes, level) {
    const bodies = [],
      children = []
    function append(node) {
      const previous = children.find((child) => child.title === node.title)
      if (previous) {
        previous.body = joinBodies([previous.body, node.body]) + '\n\n'
        const nested = combine([...previous.children, ...node.children], level + 1)
        previous.body = joinBodies([previous.body, nested.body]) + '\n\n'
        previous.children = nested.children
      } else children.push(node)
    }
    for (const node of nodes) {
      const nested = combine(node.children, node.title ? level + 1 : level)
      if (!node.title) {
        bodies.push(node.body, nested.body)
        nested.children.forEach(append)
      } else
        append({
          ...node,
          level,
          heading: `${'#'.repeat(level)} ${node.title}\n\n`,
          body: joinBodies([node.body, nested.body]) + '\n\n',
          children: nested.children,
        })
    }
    return { body: joinBodies(bodies), children }
  }
  tree.children = collect(tree.children)
  if (!references.length) return source
  const content = combine(references, 3)
  const chapter = {
    level: 2,
    title: 'CSS Variables',
    heading: '## CSS Variables\n',
    body: content.body.trim() ? '\n' + content.body.trim() + '\n\n' : '\n',
    children: content.children,
  }
  if (insertion === undefined) {
    const apiEnd = tree.children.findLastIndex((node) => ['API', 'Types'].includes(node.title))
    insertion = apiEnd < 0 ? tree.children.length : apiEnd + 1
  }
  tree.children.splice(insertion, 0, chapter)
  const next = renderSection(tree).replace(/\n+$/, '\n')
  return next
    .split('\n')
    .filter((line) => line.trim())
    .join('\n') ===
    source
      .split('\n')
      .filter((line) => line.trim())
      .join('\n')
    ? source
    : next
}
