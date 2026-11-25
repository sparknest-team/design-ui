import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { flattenApiStructure } from './api-document-structure.mjs'
import { normalizeCssVariables } from './css-document-structure.mjs'
import { organizePublicDocument } from './public-documentation-policy.mjs'
import { expandTypographyApi } from './typography-api.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
export const componentName = (name) =>
  name
    .replace(/^(?:c|mp)-/, '')
    .replace(/[<>`]/g, '')
    .split(/[./-]/)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join('')
const categories = new Map([
  ['props', 'Props'],
  ['属性', 'Props'],
  ['组件属性', 'Props'],
  ['events', 'Events'],
  ['事件', 'Events'],
  ['slots', 'Slots'],
  ['插槽', 'Slots'],
  ['methods', 'Methods'],
  ['expose', 'Methods'],
  ['instance', 'Methods'],
  ['方法', 'Methods'],
  ['实例方法', 'Methods'],
  ['instance methods', 'Methods'],
  ['实例属性', 'Instance Properties'],
  ['instance properties', 'Instance Properties'],
  ['全局方法', 'Methods'],
  ['函数式方法', 'Methods'],
  ['global methods', 'Methods'],
  ['function methods', 'Methods'],
  ['options', 'Options'],
  ['选项', 'Options'],
  ['插件选项', 'Options'],
  ['plugin options', 'Options'],
])
function categoryName(title) {
  const direct = categories.get(title.toLowerCase())
  if (direct) return direct
  const parts = title.replace(/\s*(?:与|和|及|、|\band\b)\s*/gi, ' / ').split(/\s*\/\s*/)
  if (parts.length > 1 && parts.every((part) => categories.has(part.toLowerCase()))) {
    return parts.map((part) => categories.get(part.toLowerCase())).join(' / ')
  }
}

export function normalizeHeadingLabels(source, primary) {
  let fence
  let inApi = false
  let activeOwner = primary
  const lines = source.split(/(?<=\n)/)
  return lines
    .map((line, index) => {
      const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1]
      if (marker) {
        if (!fence) fence = marker[0]
        else if (fence === marker[0]) fence = undefined
        return line
      }
      if (fence) return line
      const match = /^(#{2,6})\s+(.+?)(\r?\n)?$/.exec(line)
      if (!match) return line
      let [, hashes, title, newline = ''] = match
      const clean = title.replace(/[`<>]/g, '').trim()
      if (/^(?:API(?: Reference)?|API\s*(?:参考|文档))$/i.test(clean)) {
        inApi = true
        activeOwner = primary
        return '## API' + newline
      }
      const api = /^([\w.-]+)\s+API$/i.exec(clean)
      if (api && hashes === '##') {
        inApi = true
        activeOwner = componentName(api[1])
        return `## ${componentName(api[1]) === primary ? '' : componentName(api[1]) + ' '}API` + newline
      }
      if (!inApi && hashes === '##' && /^(?:Props|属性|Events|Slots|Methods)$/i.test(clean)) {
        inApi = true
        return `## API${newline}${newline}### ${primary} ${categoryName(clean)}` + newline
      }
      if (/^[\w.-]+$/.test(clean) && componentName(clean).startsWith(primary)) activeOwner = componentName(clean)
      if (/^(?:样式变量|(?:公开\s*)?CSS\s*变量|Style variables|(?:Public )?CSS Variables|Variables)$/i.test(clean))
        return (inApi || activeOwner === primary ? '## CSS Variables' : `### ${activeOwner} CSS Variables`) + newline
      const styles = /^(?:([\w.-]+)\s+)(?:样式变量|CSS\s*变量|Variables|CSS Variables)$/i.exec(clean)
      if (styles && componentName(styles[1]).startsWith(primary))
        return (
          `${inApi || componentName(styles[1]) === primary ? '##' : '###'} ${componentName(styles[1])} CSS Variables` +
          newline
        )
      if (!inApi) {
        const nextHeading = lines.findIndex(
          (next, offset) => offset > index && /^#{1,6}\s/.test(next) && /^#+/.exec(next)[0].length <= hashes.length,
        )
        const body = lines.slice(index + 1, nextHeading < 0 ? undefined : nextHeading).join('')
        const named = /^([\w.-]+)\s+(.+?)(?:\s*\([\d.]+\))?$/.exec(clean)
        const category = categoryName(clean) ?? (named && categoryName(named[2]))
        const owner = named ? componentName(named[1]) : activeOwner
        const fragment =
          category &&
          !/Options/.test(category) &&
          (owner.startsWith(primary) || owner === 'Common') &&
          !/<demo\b|```demo/.test(body)
        const schema =
          /(?:\|[^\n]*--(?:c|mp)-|```(?:ts|typescript)\s*\n\s*(?:import type|export type|type |interface ))/.test(body)
        if (!fragment && !schema) return line
      }
      if (/^(?:类型定义|类型|Types?|Type definitions)(?:\s*\/\s*Types)?$/i.test(clean))
        return (inApi ? '## Types' : `### ${activeOwner} Types`) + newline
      // API overview prose is deliberately left in its authored language.
      let owner = activeOwner
      let category = categoryName(clean)
      if (/^Props\s*\/\s*MessageOptions$/i.test(clean)) category = 'Options'
      if (!category) {
        const named = /^([\w.-]+)\s+(.+?)(?:\s*\([\d.]+\))?$/.exec(clean)
        if (named) {
          category = categoryName(named[2])
          if (category) owner = componentName(named[1])
        }
      }
      const version = /\s(\([\d.]+\))$/.exec(clean)?.[1]
      if (category) {
        activeOwner = owner
        return `### ${owner} ${category}${version ? ' ' + version : ''}` + newline
      }
      return line
    })
    .join('')
}

export function normalizeApiHeadings(source, primary) {
  let next = normalizeHeadingLabels(source, primary)
  if (primary === 'Typography') {
    const locale = /lang: en-US|^\| Prop(?:erty)?\b/m.test(source) ? 'en-US' : 'zh-CN'
    next = expandTypographyApi(next, locale)
  }
  return organizePublicDocument(normalizeCssVariables(flattenApiStructure(next, primary), primary), {
    primary,
    en: /^## Basic examples/m.test(source) || /lang: en-US/.test(source),
  })
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (/^(?:node_modules|dist|\.maple|__tests__|__demos__|example)$/.test(entry.name)) return []
    const filename = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(filename) : [filename]
  })
}
export function documentationFiles(workspace = root) {
  const files = []
  for (const [repo, platform] of [
    ['cedar-design-web', 'cedar'],
    ['maple-design-mobile', 'maple'],
  ]) {
    const sourceRoot = path.join(workspace, repo, 'packages', 'ui', 'src')
    for (const filename of walk(sourceRoot)) {
      const relative = path.relative(sourceRoot, filename).split(path.sep).join('/')
      if (!/(?:\/(?:README|PICKER)(?:\.en-US)?\.md|\/docs\/(?:zh-CN|en-US)\.md)$/.test(relative)) continue
      let family = relative.replace(/\/(?:docs\/)?[^/]+\.md$/, '')
      if (/\/PICKER(?:\.en-US)?\.md$/.test(relative)) family += '/picker'
      files.push({ filename, platform, sourceRoot, relative, primary: componentName(family) })
    }
  }
  return files
}

export function checkApiHeadings(write = false) {
  const changed = []
  for (const { filename, primary } of documentationFiles()) {
    const source = fs.readFileSync(filename, 'utf8')
    const next = normalizeApiHeadings(source, primary)
    if (source === next) continue
    changed.push(path.relative(root, filename))
    if (write) fs.writeFileSync(filename, next)
  }
  return changed
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes('--write')
  const changed = checkApiHeadings(write)
  console.log(
    JSON.stringify(
      { documents: documentationFiles().length, [write ? 'updated' : 'nonstandard']: changed.length, files: changed },
      null,
      2,
    ),
  )
  if (!write && changed.length) process.exitCode = 1
}
