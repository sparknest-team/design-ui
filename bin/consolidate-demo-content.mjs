import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { composeDemoComparison } from './compose-demo-comparison.mjs'
import { enhanceConfigurationComparison } from './demo-config-comparison.mjs'
import { demoRefs, groupDemoSections, readDemoSections } from './group-demo-sections.mjs'
import { groupMapleExamples, readMapleExamples } from './group-maple-examples.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(new URL('../../cedar-design-web/packages/ui/package.json', import.meta.url))
const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc')
const write = process.argv.includes('--write')
const planFile = path.join(root, 'design-ui/configs/demo-content-consolidation.json')
const plans = JSON.parse(fs.readFileSync(planFile))
const snapshots = new Map(),
  updated = new Map(),
  retired = new Map(),
  results = [],
  errors = []
const read = (file) =>
  updated.get(file) ??
  snapshots.get(file) ??
  (() => {
    const text = fs.readFileSync(file, 'utf8')
    snapshots.set(file, text)
    return text
  })()
const set = (file, source) => updated.set(file, source)
const originals = JSON.parse(read(path.join(root, 'design-ui/audits/demo-content-before-2026-10-28.json')))
const configs = Object.fromEntries(
  ['cedar', 'maple'].map((platform) => [
    platform,
    JSON.parse(read(path.join(root, `design-ui/configs/demo-groups${platform === 'maple' ? '.maple' : ''}.json`))),
  ]),
)
const familyRoot = (platform, family) =>
  path.join(
    root,
    `${platform === 'cedar' ? 'cedar-design-web/packages/ui' : 'maple-design-mobile/packages/ui'}/src`,
    family,
  )
const stem = (ref) => path.basename(ref, '.vue').replace(/\.en-US$/, '')
const label = (source) => /^###\s+(.+)$/m.exec(source)?.[1] ?? ''
function validate(source, file) {
  const { descriptor, errors } = parse(source, { filename: file })
  if (errors.length) throw new Error(errors.join(','))
  const script = compileScript(descriptor, { id: file })
  const result = compileTemplate({
    source: descriptor.template.content,
    filename: file,
    id: file,
    compilerOptions: { bindingMetadata: script.bindings },
  })
  if (result.errors.length) throw new Error(result.errors.join(','))
}
function metadata(source, names) {
  return readDemoSections(source).cases.flatMap((item) =>
    item.refs.filter((ref) => names.includes(stem(ref))).map((ref) => ({ ...item, refs: [ref] })),
  )
}
function prose(item) {
  return item.text
    .replace(/^###[^\n]*\n*/, '')
    .replace(/<demo\b[^>]*>\s*<\/demo>|```demo\s*\n[^\n]+\n```/g, '')
    .trim()
}
function block(plan, items, reference, english) {
  const prefix = english ? plan.en : plan.title
  const isAppearance = plan.into === 'appearance-lab'
  if (!isAppearance && plan.into !== 'state-lab' && (!plan.explanation || !plan.english))
    throw new Error('Comparison requires authored bilingual explanations: ' + plan.family + '/' + plan.into)
  const explanation =
    plan.explanation ??
    (isAppearance
      ? '选择一个对比维度后，同屏展示它的全部可选值；其余配置和内容保持一致。可切换其他配置检查组合效果；输入类预览共享一个值。'
      : '在同一实例上切换禁用、只读和错误状态后再操作控件，比较可编辑性和交互反馈。恢复开关位于目标控件外；错误外观本身不会执行校验。')
  const enExplanation =
    plan.english ??
    (isAppearance
      ? 'Choose a dimension to compare all its values side by side while keeping other settings and content identical. Change the other settings to inspect combinations; input specimens share one model.'
      : 'Toggle disabled, read-only and error states, then interact with the same instance. Recovery controls remain outside the target; error appearance alone does not validate data.')
  const details = [
    ...new Set(items.map((item) => (prose(item) ? `#### ${label(item.text)}\n\n${prose(item)}` : '')).filter(Boolean)),
  ]
  const preserved = details.length
    ? `\n\n<details>\n<summary>${english ? 'Configuration details and limits' : '配置说明与使用限制'}</summary>\n\n${details.join('\n\n')}\n\n</details>`
    : ''
  return `### ${prefix}\n\n${english ? enExplanation : explanation}${preserved}\n\n${reference}\n`
}
function redirectImports(source, from, to) {
  return source.replace(
    /(from\s*['"])(\.[^'"]+)(['"])/g,
    (_, a, ref, c) =>
      a + path.relative(path.dirname(to), path.resolve(path.dirname(from), ref)).replace(/^(?!\.)/, './') + c,
  )
}
function transformDoc(file, plan, newGroups, english, newFile) {
  if (!fs.existsSync(file)) return
  const source = read(file),
    parsed = readDemoSections(source),
    names = [...plan.cases, ...(plan.mode === 'covered' ? [plan.into] : [])]
  const items = metadata(source, names)
  if (!items.length) return

  for (const item of items)
    if (item.refs.some((ref) => !names.includes(stem(ref))))
      throw new Error(`${file}: mixed independent sources in ${item.title}`)
  const relative = path.relative(path.dirname(file), newFile).replace(/^(?!\.)/, './')
  const reference = plan.platform === 'cedar' ? `<demo src="${relative}"></demo>` : '```demo\n' + relative + '\n```'
  const combined = block(plan, items, reference, english)
  let inserted = false
  const cases = parsed.cases.flatMap((item) => {
    if (!names.includes(stem(item.refs[0]))) return [item.text]
    if (inserted) return []
    inserted = true
    return [combined]
  })
  const next =
    [parsed.prefix.trimEnd(), '## 案例\n\n' + cases.join('\n\n'), ...parsed.preserved, parsed.api.trim()]
      .filter(Boolean)
      .join('\n\n') + '\n'
  set(file, groupDemoSections(next, newGroups, english))
  for (const item of items)
    for (const ref of item.refs)
      if (stem(ref) !== plan.into) retired.set(path.resolve(path.dirname(file), ref), plan.into)
}
function transformEntry(file, plan, newGroups, newFile, enFile) {
  const source = read(file),
    parsed = readMapleExamples(source)
  const selected = new Set([...plan.cases, ...(plan.mode === 'covered' ? [plan.into] : [])])
  const original = parsed.cases.filter((item) => selected.has(item.name))
  if (!original.length) throw new Error(`${file}: phone scenarios not found`)
  const local = `Content${plan.into.replace(/(^|-)(\w)/g, (_, a, c) => c.toUpperCase())}`
  const bilingual = `<h3 class="mobile-demo-case-heading"><span lang="zh-CN">${plan.title}</span><span lang="en-US">${plan.en}</span></h3>`
  let imports = '',
    component
  if (plan.mode === 'covered') {
    const existing = original.find((item) => item.name === plan.into)
    if (!existing) throw new Error(`${file}: missing comparison entry`)
    component = existing.text.replace(/<(?:app-type|AppType)\b[^>]*>[\s\S]*?<\/(?:app-type|AppType)>/, bilingual)
  } else {
    const ref = path.relative(path.dirname(file), newFile).replace(/^(?!\.)/, './')
    imports = `\nimport ${local} from '${ref}'\n`
    let body = `<${local} />`
    if (enFile !== newFile) {
      const enRef = path.relative(path.dirname(file), enFile).replace(/^(?!\.)/, './')
      imports += `import ${local}En from '${enRef}'\n`
      if (!source.includes('import { demoEnglish as english }'))
        imports += `import { demoEnglish as english } from '@maple-design/cli-vue/demo-language'\n`
      body = `<component :is="english ? ${local}En : ${local}" />`
    }
    component = `<section data-demo="${plan.into}">\n${bilingual}\n${body}\n</section>`
  }
  let inserted = false
  const cases = parsed.cases.flatMap((item) => {
    if (!selected.has(item.name)) return [item.text]
    if (inserted) return []
    inserted = true
    return [component]
  })
  let result =
    source.slice(0, parsed.template.loc.start.offset) +
    '\n' +
    [...parsed.introductions, ...cases].join('\n\n') +
    '\n' +
    source.slice(parsed.template.loc.end.offset)
  const descriptor = parse(result).descriptor
  result =
    result.slice(0, descriptor.scriptSetup.loc.end.offset) +
    imports +
    result.slice(descriptor.scriptSetup.loc.end.offset)
  const remainingTemplate = parse(result).descriptor.template.content
  for (const item of original)
    for (const ref of item.refs)
      if (stem(ref) !== plan.into) {
        retired.set(path.resolve(path.dirname(file), ref), plan.into)
        const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        result = result.replace(
          new RegExp(`import\\s+(\\w+)\\s+from\\s+['"]${escaped}['"];?\\n?`, 'g'),
          (statement, name) => (new RegExp(`\\b${name}\\b`).test(remainingTemplate) ? statement : ''),
        )
      }
  set(file, groupMapleExamples(result, newGroups, /data-demo-component="([^"]+)"/.exec(source)?.[1]))
}
// Validate all source compositions before making any filesystem changes.
for (const plan of plans) {
  const base = familyRoot(plan.platform, plan.family),
    directory = base + (plan.platform === 'cedar' ? '/__demos__' : '/example/demos')
  const manifest = configs[plan.platform][plan.family]
  if (!plan.cases.some((name) => manifest.some((group) => group.cases.includes(name)))) {
    results.push({ ...plan, status: 'already-consolidated' })
    continue
  }
  try {
    const docs = plan.platform === 'cedar' ? ['README.md', 'README.en-US.md'] : ['docs/zh-CN.md', 'docs/en-US.md']
    const zhFile = path.join(base, docs[0]),
      enDoc = path.join(base, docs[1])
    const zhCases = metadata(read(zhFile), plan.cases),
      enCases = fs.existsSync(enDoc) ? metadata(read(enDoc), plan.cases) : []
    const file = path.join(directory, plan.into + '.vue')
    let enFile = file
    if (plan.mode === 'compose') {
      if (zhCases.length !== plan.cases.length) throw new Error('Missing or combined authored source cases')
      const scenes = plan.cases.map((name) => {
        const item = zhCases.find((item) => stem(item.refs[0]) === name),
          english = enCases.find((item) => stem(item.refs[0]) === name)
        const originalFile = path.resolve(path.dirname(zhFile), item.refs[0])
        return {
          name,
          file: originalFile,
          source: redirectImports(read(originalFile), originalFile, file),
          title: label(item.text),
          en: english ? label(english.text) : name.replaceAll('-', ' '),
        }
      })
      const source = composeDemoComparison(scenes, { language: 'zh-CN' })
      validate(source, file)
      set(file, source)
      if (enCases.length === plan.cases.length) {
        enFile = path.join(directory, 'en-US', plan.into + '.vue')
        const englishScenes = plan.cases.map((name) => {
          const item = enCases.find((item) => stem(item.refs[0]) === name),
            originalFile = path.resolve(path.dirname(enDoc), item.refs[0]),
            zh = scenes.find((scene) => scene.name === name)
          return {
            name,
            file: originalFile,
            source: redirectImports(read(originalFile), originalFile, enFile),
            title: zh.title,
            en: label(item.text),
          }
        })
        const source = composeDemoComparison(englishScenes, { language: 'en-US' })
        validate(source, enFile)
        set(enFile, source)
      }
    } else if (plan.into === 'appearance-lab') {
      const source = enhanceConfigurationComparison(read(file))
      validate(source, file)
      set(file, source)
    }
    let inserted = false
    const groups = manifest
      .map((group) => ({
        ...group,
        cases: group.cases.flatMap((name) => {
          if (plan.cases.includes(name)) {
            if (plan.mode === 'covered' || inserted) return []
            inserted = true
            return [plan.into]
          }
          return [name]
        }),
      }))
      .filter((group) => group.cases.length)
    configs[plan.platform][plan.family] = groups
    transformDoc(zhFile, plan, groups, false, file)
    transformDoc(enDoc, plan, groups, true, enFile)
    if (plan.platform === 'maple') transformEntry(path.join(base, 'example/index.vue'), plan, groups, file, enFile)
    results.push({ ...plan, status: 'consolidated', source: path.relative(root, file) })
  } catch (error) {
    errors.push({ platform: plan.platform, family: plan.family, into: plan.into, error: String(error) })
  }
}
// Appearance comparisons are also useful where a unique standalone scene must remain.
for (const row of originals)
  for (const item of row.entries.filter((item) => item.name === 'appearance-lab')) {
    const file = path.join(root, item.file)
    try {
      const source = enhanceConfigurationComparison(read(file))
      validate(source, file)
      set(file, source)
    } catch (error) {
      errors.push({ platform: row.platform, family: row.family, error: String(error) })
    }
  }
for (const platform of ['cedar', 'maple'])
  set(
    path.join(root, `design-ui/configs/demo-groups${platform === 'maple' ? '.maple' : ''}.json`),
    JSON.stringify(configs[platform], null, 2) + '\n',
  )
const report = {
  reviewedFamilies: originals.length,
  plans: plans.length,
  consolidated: results.filter((r) => r.status === 'consolidated').length,
  changedFiles: [...updated]
    .filter(([file, text]) => !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text)
    .map(([file]) => path.relative(root, file)),
  retired: [...retired].map(([file, into]) => ({ file: path.relative(root, file), into })),
  results,
  errors,
}
fs.writeFileSync('/tmp/demo-content-consolidation-result.json', JSON.stringify(report, null, 2) + '\n')
console.log(
  JSON.stringify(
    {
      reviewedFamilies: report.reviewedFamilies,
      plans: report.plans,
      consolidated: report.consolidated,
      changed: report.changedFiles.length,
      retired: retired.size,
      errors,
    },
    null,
    2,
  ),
)
if (errors.length) {
  process.exitCode = 1
} else if (write) {
  for (const [file, source] of updated) {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== source) fs.writeFileSync(file, source)
  }
  // Retire only sources whose documentation/phone references were migrated. Leave
  // reusable source dependencies intact; no public duplicate remains in either case.
  const allSources = []
  for (const platform of ['cedar', 'maple']) {
    const base = path.join(
      root,
      `${platform === 'cedar' ? 'cedar-design-web/packages/ui' : 'maple-design-mobile/packages/ui'}/src`,
    )
    for (const relative of fs.readdirSync(base, { recursive: true }))
      if (/\.(?:vue|tsx?|mjs|md)$/.test(relative)) {
        const file = path.join(base, relative)
        if (!retired.has(file)) allSources.push([file, fs.readFileSync(file, 'utf8')])
      }
  }
  for (const [file, into] of retired) {
    if (!fs.existsSync(file)) continue
    const needed = allSources.some(
      ([owner, source]) =>
        (owner.endsWith('.md') && demoRefs(source).some((ref) => path.resolve(path.dirname(owner), ref) === file)) ||
        [...source.matchAll(/(?:from\s*|import\s*\()(['"])(\.[^'"]+)\1/g)].some(
          (match) => path.resolve(path.dirname(owner), match[2]) === file,
        ),
    )
    if (!needed) fs.unlinkSync(file)
  }
  // Generated API review manifests point at the actual consolidated source.
  for (const row of originals) {
    const directory = path.join(
      familyRoot(row.platform, row.family.replace(/\/picker$/, '')),
      row.platform === 'cedar' ? '__demos__' : 'example/demos',
    )
    if (!fs.existsSync(directory)) continue
    for (const name of fs.readdirSync(directory).filter((name) => name.endsWith('.config.json'))) {
      const file = path.join(directory, name)
      const json = JSON.parse(fs.readFileSync(file))
      function migrate(value) {
        if (Array.isArray(value)) {
          const mapped = value.map((item) =>
            typeof item === 'string' && retired.has(path.resolve(directory, item))
              ? retired.get(path.resolve(directory, item)) + '.vue'
              : migrate(item),
          )
          return mapped.every((item) => typeof item === 'string' && item.endsWith('.vue'))
            ? [...new Set(mapped)]
            : mapped
        }
        if (value && typeof value === 'object')
          return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, migrate(item)]))
        return value
      }
      const source = JSON.stringify(migrate(json), null, 2) + '\n'
      if (fs.readFileSync(file, 'utf8') !== source) fs.writeFileSync(file, source)
    }
  }
  if (report.consolidated)
    fs.writeFileSync(
      path.join(root, 'design-ui/audits/demo-content-consolidation-2026-10-28.json'),
      JSON.stringify(report, null, 2) + '\n',
    )
}
