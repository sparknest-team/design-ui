import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { improvementsFor, libraries, reference } from './build-component-catalog.mjs'
import { featureRows } from './component-feature-analysis.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const base = path.join(root, 'maple-design-mobile/packages/ui')
const spec = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/component-showcase.json'), 'utf8'))
const coreStrengths = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/core-strengths.json'), 'utf8'))
const groups = spec.groups.map(({ components, ...group }) => group)
const placement = Object.fromEntries(spec.groups.flatMap((group) => group.components.map((id) => [id, group.id])))
const extra = {
  general: 'code',
  layout: 'flex safe-area cell',
  navigation: 'tab-bar index-bar sticky',
  text: 'number-keyboard signature',
  selection: 'picker',
  forms: 'form-details uploader',
  data: 'display highlighter-provider notice-bar swipe-cell pull-refresh',
  feedback: 'action-sheet popup loading-bar floating-panel fab',
  foundation: 'drag lazy locale locale-provider',
}
for (const [group, names] of Object.entries(extra)) for (const id of names.split(' ')) placement[id] = group
const canonical = {
  popup: 'drawer',
  'tab-bar': 'tabs',
  'action-sheet': 'menu',
  'notice-bar': 'alert',
  uploader: 'upload',
  flex: 'space',
  sticky: 'affix',
  'loading-bar': 'progress',
  'locale-provider': 'config-provider',
  'form-details': 'form',
  picker: 'select',
  'number-keyboard': 'input',
  'floating-panel': 'drawer',
  cell: 'list',
}
const components = []
const ignored = new Set(
  'atomic-css atomic-usage palette utilities themes style shadow rounded size spacing position'.split(' '),
)
for (const directory of fs.readdirSync(path.join(base, 'src')).sort()) {
  const file = path.join(base, 'src', directory, 'docs/zh-CN.md')
  if (!fs.existsSync(file) || ignored.has(directory)) continue
  const documentation = fs.readFileSync(file, 'utf8')
  const group = placement[directory]
  if (!group) throw new Error(`Missing mobile category: ${directory}`)
  const headings = [...documentation.matchAll(/^#{2,4} (.+)$/gm)]
  const demos = [...documentation.matchAll(/```demo\s*\n([^\n]+\.vue)/g)].map((match) => ({
    title: headings.filter((h) => h.index < match.index).at(-1)?.[1] ?? '示例',
    source: path.relative(base, path.resolve(path.dirname(file), match[1].trim())),
    anchor: '',
  }))
  const fullRefs = libraries.map((lib) => reference(lib, canonical[directory] ?? directory)).filter(Boolean)
  components.push({
    coreStrengths: coreStrengths
      .filter((item) => item.maple && item.components.includes(directory))
      .map(({ id, title }) => ({ id, title })),
    id: directory,
    group,
    route: `/components/${directory}/`,
    name: spec.labels[directory] ?? /^# (.+)$/m.exec(documentation)?.[1] ?? directory,
    feature:
      spec.mobileFeatures[directory] ??
      spec.features[directory] ??
      '面向触控场景，按基础使用、状态变化与业务组合体验。',
    members: [],
    topics: [],
    demos,
    featurePoints: featureRows({ id: directory, group, demos }, documentation, fullRefs),
    references: fullRefs.map(({ _examples, ...ref }) => ref),
  })
}
components.sort(
  (a, b) =>
    groups.findIndex((g) => g.id === a.group) - groups.findIndex((g) => g.id === b.group) ||
    (spec.groups.find((g) => g.id === a.group)?.components.indexOf(a.id) ?? 1000) -
      (spec.groups.find((g) => g.id === b.group)?.components.indexOf(b.id) ?? 1000),
)
const target = path.join(base, 'docs/components/component-catalog.json')
const text =
  JSON.stringify(
    {
      improvements: improvementsFor('maple'),
      groups,
      libraries: libraries.map(({ id, name, type }) => ({ id, name, type })),
      components,
    },
    null,
    2,
  ) + '\n'
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== text)
    throw new Error('Mobile component catalog is stale')
} else if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== text) {
  fs.writeFileSync(target + '.tmp', text)
  fs.renameSync(target + '.tmp', target)
}
console.log(`Maple: ${components.length} component entries, ${groups.length} categories`)
