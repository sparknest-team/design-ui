import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cedarDemoFamily, groupDemoSections, isApiHeading } from './group-demo-sections.mjs'
import { groupMapleExamples } from './group-maple-examples.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex')
const read = (file) => fs.readFileSync(file, 'utf8')
const refs = (text) =>
  [...text.matchAll(/<demo\b[^>]*src="([^"]+)"|```demo\s*\n([^\n]+)/g)]
    .map((m) => (m[1] ?? m[2]).trim())
    .filter((p) => !/api-review/.test(p))
export function removeReviewBlocks(text) {
  let result = text
    .replace(
      /\s*<!-- shared-locale-provider-review:start -->[\s\S]*?<!-- shared-locale-provider-review:end -->\s*/g,
      '\n\n',
    )
    .replace(/\s*<!-- api-review:start -->[\s\S]*?<!-- api-review:end -->\s*/g, '\n\n')
  const marks = [2, 3, 4, 5, 6]
    .flatMap((level) => headings(result, level).map((item) => ({ ...item, level })))
    .sort((a, b) => a.index - b.index)
  const removals = marks.flatMap((item, index) => {
    if (!/^#{2,6} (?:功能调试|Feature playground|组合审查\s*\/\s*API review)/i.test(item.line)) return []
    const end = marks.slice(index + 1).find((next) => next.level <= item.level)?.index ?? result.length
    return /api-review/.test(result.slice(item.index, end)) ? [{ start: item.index, end }] : []
  })
  for (const item of removals.reverse()) result = result.slice(0, item.start) + result.slice(item.end)
  // Also remove a standalone reference when the surrounding title has already gone.
  result = result
    .replace(/^<demo\b[^>]*src="[^"]*api-review[^"]*"[^>]*>\s*<\/demo>\s*$/gm, '')
    .replace(/^```demo\s*\n[^\n]*api-review[^\n]*\n```\s*$/gm, '')
  return result.trimEnd() + '\n'
}
function headings(text, level) {
  const found = []
  let offset = 0
  let fence
  for (const line of text.split(/(?<=\n)/)) {
    const mark = /^\s*(`{3,}|~{3,})/.exec(line)?.[1]
    if (mark) {
      if (!fence) fence = mark[0]
      else if (fence === mark[0]) fence = undefined
    } else if (!fence && new RegExp(`^#{${level}} `).test(line)) found.push({ index: offset, line })
    offset += line.length
  }
  return found
}
export function demoPriority(text) {
  const reference = refs(text)[0] ?? ''
  const name = path.basename(reference, '.vue')
  const title = /^#{2,4} (.+)$/m.exec(text)?.[1] ?? ''
  if (/^(basic(?:-usage)?|example)$/.test(name) || /^(基础|基本|最简单|Basic|Simplest)/i.test(title)) return 0
  if (/^(size|sizes|variant|variants|status|state|disabled|readonly|shape|color|appearance)(-|$)/.test(name)) return 10
  if (/async|remote|request|load-more|resolve|fallback-option/.test(name)) return 30
  if (/workbench|equipment|task-calendar|resource-capacity|transaction|external-editor/.test(name)) return 50
  if (/lifecycle|race|regression|ownership|boundary|boundaries|completion/.test(name)) return 60
  if (/slot|custom|render|presentation|field-/.test(name)) return 40
  return 20
}
function sortCases(chapter, order) {
  const marks = headings(chapter, 3)
  if (!marks.length) return chapter
  const prefix = chapter.slice(0, marks[0].index)
  const cases = []
  for (let i = 0; i < marks.length; i++) {
    const chunk = chapter.slice(marks[i].index, marks[i + 1]?.index ?? chapter.length)
    if (refs(chunk).length) cases.push(chunk)
    else if (cases.length) cases[cases.length - 1] += chunk
    else return chapter // Keep a chapter introduction in place.
  }
  const rank = (chunk) => (order ? order.indexOf(path.basename(refs(chunk)[0], '.vue')) : demoPriority(chunk))
  cases.sort((a, b) => {
    const left = rank(a),
      right = rank(b)
    return (left < 0 ? 1000 : left) - (right < 0 ? 1000 : right)
  })
  return prefix + cases.map((c) => c.trimEnd()).join('\n\n') + '\n\n'
}
export function organizeDemoSections(text, order) {
  const cleaned = removeReviewBlocks(text)
  const boundary = headings(cleaned, 2).find((h) => isApiHeading(h.line.replace(/^## /, '').trim()))
  const end = boundary?.index ?? cleaned.length
  const before = cleaned.slice(0, end)
  const marks = headings(before, 2)
  let result
  if (!marks.length) result = sortCases(before, order)
  else
    result =
      sortCases(before.slice(0, marks[0].index), order) +
      marks.map((h, i) => sortCases(before.slice(h.index, marks[i + 1]?.index ?? before.length), order)).join('')
  return (result.trimEnd() + '\n\n' + cleaned.slice(end).trimStart()).trimEnd() + '\n'
}
function stripExampleReview(source) {
  return (
    source
      .replace(/^import\s+[^\n]+from\s+['"][^'"\n]*api-review[^'"\n]*['"];?\s*$/gm, '')
      .replace(/\s*<section\b[^>]*data-demo="api-review"[^>]*>[\s\S]*?<\/section>/g, '')
      .replace(/^\s*<DemoApiReview\s*\/>\s*$/gm, '')
      .trimEnd() + '\n'
  )
}
export function organizeLibraryDocs({ write = false } = {}) {
  const changed = [],
    evidence = []
  function update(file, source) {
    const original = read(file)
    if (source === original) return
    changed.push(path.relative(root, file))
    if (write) fs.writeFileSync(file, source)
  }
  const pairedFile = path.join(root, 'design-ui/audits/same-source-demos.json')
  const paired = JSON.parse(read(pairedFile))
  const cedarRoot = path.join(root, 'cedar-design-web/packages/ui/src')
  const demoGroups = JSON.parse(read(path.join(root, 'design-ui/configs/demo-groups.json')))
  const cedarOrders = {}
  for (const relative of fs.readdirSync(cedarRoot, { recursive: true }).filter((f) => f.endsWith('.md'))) {
    const file = path.join(cedarRoot, relative),
      original = read(file)
    if (!refs(original).length && !/api-review/.test(original)) continue
    let source = organizeDemoSections(original)
    // English authored pages follow the Chinese page's own examples.
    if (/\.en-US\.md$/.test(relative)) {
      const zh = file.replace(/\.en-US\.md$/, '.md')
      if (fs.existsSync(zh))
        source = organizeDemoSections(
          original,
          refs(organizeDemoSections(read(zh))).map((ref) => path.basename(ref, '.vue')),
        )
    }
    const family = cedarDemoFamily(relative)
    if (!family || !demoGroups[family]) throw new Error(`Missing demo groups: ${relative}`)
    source = groupDemoSections(source, demoGroups[family], /\.en-US\.md$/.test(relative))
    const tables = (text) =>
      text
        .split('\n')
        .filter((line) => /^\s*\|/.test(line))
        .sort()
    if (JSON.stringify(refs(original).sort()) !== JSON.stringify(refs(source).sort()))
      throw new Error(`Demo lost: ${relative}`)
    if (JSON.stringify(tables(original)) !== JSON.stringify(tables(source)))
      throw new Error(`Table changed: ${relative}`)
    evidence.push({
      file: path.relative(root, file),
      before: hash(original),
      after: hash(source),
      demos: refs(source).length,
      tablesPreserved: true,
    })
    if (relative === `${relative.split(path.sep)[0]}/README.md`)
      cedarOrders[relative.split(path.sep)[0]] = refs(source)
        .filter((ref) => ref.startsWith('./__demos__/'))
        .map((ref) => path.basename(ref, '.vue'))
    update(file, source)
  }
  // Shared cases use the Cedar order on both platforms. Internal review assets stay outside public pages.
  for (const [component, cases] of Object.entries(paired)) {
    const order = cedarOrders[component]
    paired[component] = cases
      .filter((c) => c.name !== 'api-review')
      .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
  }
  update(pairedFile, JSON.stringify(paired, null, 2) + '\n')
  const mapleRoot = path.join(root, 'maple-design-mobile/packages/ui/src')
  const mapleGroups = JSON.parse(read(path.join(root, 'design-ui/configs/demo-groups.maple.json')))
  let maplePages = 0,
    mapleExamples = 0
  for (const relative of fs.readdirSync(mapleRoot, { recursive: true })) {
    const file = path.join(mapleRoot, relative)
    const component = relative.split(path.sep)[0]
    if (/\/docs\/(?:zh-CN|en-US)\.md$/.test(relative)) {
      const original = read(file)
      const family = relative.replace(/\/docs\/[^/]+\.md$/, '')
      if (!mapleGroups[family]) throw new Error(`Missing Maple demo groups: ${relative}`)
      const source = groupDemoSections(
        organizeDemoSections(original),
        mapleGroups[family],
        relative.endsWith('/en-US.md'),
      )
      if (JSON.stringify(refs(original).sort()) !== JSON.stringify(refs(source).sort()))
        throw new Error(`Maple demo lost: ${relative}`)
      const tables = (text) =>
        text
          .split('\n')
          .filter((line) => /^\s*\|/.test(line))
          .sort()
      if (JSON.stringify(tables(original)) !== JSON.stringify(tables(source)))
        throw new Error(`Maple table changed: ${relative}`)
      maplePages++
      update(file, source)
    }
    if (/\/example\/index\.vue$/.test(relative)) {
      let source = stripExampleReview(read(file))
      const family = relative.replace(/\/example\/index\.vue$/, '')
      if (!mapleGroups[family]) throw new Error(`Missing Maple example groups: ${relative}`)
      source = groupMapleExamples(source, mapleGroups[family])
      mapleExamples++
      update(file, source)
    }
  }
  const evidenceFile = path.join(root, 'design-ui/audits/component-showcase-2026-10-26/docs-integrity.json')
  if (write && !fs.existsSync(evidenceFile)) fs.writeFileSync(evidenceFile, JSON.stringify(evidence, null, 2) + '\n')
  return { changed: changed.length, files: changed, cedarPages: evidence.length, maplePages, mapleExamples }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = organizeLibraryDocs({ write: process.argv.includes('--write') })
  console.log(JSON.stringify(report, null, 2))
  if (!process.argv.includes('--write') && report.changed) process.exitCode = 1
}
