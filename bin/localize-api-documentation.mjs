import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanPublicDocumentation } from './clean-public-component-docs.mjs'
import { demoRefs, groupDemoSections, readDemoSections } from './group-demo-sections.mjs'
import { inventoryDemoContent } from './inventory-demo-content.mjs'
import { componentName, normalizeApiHeadings } from './normalize-api-headings.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const dictionaryFile = path.join(root, 'design-ui/configs/api-documentation.en-US.json')
const dictionary = JSON.parse(fs.readFileSync(dictionaryFile, 'utf8'))
Object.assign(dictionary, {
  本组配置对照: 'Configuration reference for this comparison',
  '#### 本组配置对照': '#### Configuration reference for this comparison',
  配置: 'Configuration',
  作用: 'Purpose',
  相关示例: 'Related examples',
})
const hasChinese = (value) => /[\u4e00-\u9fff]/.test(value)
const normalize = (value) => value.trim().replace(/\s+/g, ' ')
// Keep same-named demos in different component directories distinct across locales.
const demoIdentity = (ref) =>
  path.posix.normalize(
    ref
      .replaceAll('\\', '/')
      .replace(/(^|\/)(?:en-US|zh-CN)\//g, '$1')
      .replace(/\.en-US\.vue$/, '.vue'),
  )
const unknown = new Map()
function protectInlineCode(source, translated) {
  const literals = [...new Set([...source.matchAll(/`([^`]+)`/g)].map((match) => match[1]))].sort(
    (a, b) => b.length - a.length,
  )
  for (const literal of literals) {
    // Authored translations may already mark the intended occurrence. Avoid
    // marking ordinary prose occurrences of short identifiers such as `to`.
    if (hasChinese(literal) || translated.includes('`' + literal + '`')) continue
    const escaped = literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Punctuation-only values (for example `-`) must not match inside words.
    const punctuationOnly = !/[\p{L}\p{N}_]/u.test(literal)
    const expression = new RegExp(
      (/^\w/.test(literal) || punctuationOnly ? '(?<![\\w-])' : '') +
        escaped +
        (/\w$/.test(literal) || punctuationOnly ? '(?![\\w-])' : ''),
      'g',
    )
    translated = translated
      .split(/(`[^`]*`|\]\([^)]*\))/g)
      .map((part, index) => (index % 2 ? part : part.replace(expression, (match) => '`' + match + '`')))
      .join('')
  }
  return translated
}
function translateText(value, owner, inCode = false, extra = {}) {
  if (!hasChinese(value)) return value
  const key = normalize(value)
  const translated = extra[key] ?? dictionary[key]
  if (translated === undefined) {
    if (!inCode && !hasChinese(value.replace(/`[^`]*`/g, ''))) return value
    if (!unknown.has(key)) unknown.set(key, new Set())
    unknown.get(key).add(owner)
    return value
  }
  return (value.match(/^\s*/)?.[0] ?? '') + (inCode ? translated : protectInlineCode(key, translated))
}
export function translateFragment(source, owner, extra = {}) {
  let fence = false
  return source
    .split('\n')
    .map((line) => {
      if (/^\s*```/.test(line)) {
        fence = !fence
        return line
      }
      if (!fence && line.startsWith('|')) {
        const cells = line.split(/(?<!\\)\|/).slice(1, -1)
        const argumentHeader = /^(?:事件(?:名|名称)?|方法(?:名|名称)?|名称|插槽)$/.test(cells[0]?.trim() ?? '')
        return (
          '| ' +
          cells
            .map((cell) =>
              (argumentHeader && cell.trim() === '参数'
                ? 'Arguments'
                : translateText(cell.trim(), owner, false, extra)
              ).replace(/(?<!\\)\|/g, '\\|'),
            )
            .join(' | ') +
          ' |'
        )
      }
      return translateText(line, owner, fence, extra)
    })
    .join('\n')
    .replace(/\]\(#\/zh-CN\//g, '](#/en-US/')
    .replace(/\]\(\/zh-CN\//g, '](#/en-US/')
    .replace(/\]\(\/components\//g, '](/en/components/')
}
// Translated preserved chapters (for example FormItem) originate in Chinese.
// Prefer an authored English demo when one exists, just as the demo selector does.
export function localizeDemoReferences(source, englishFile) {
  return source.replace(/(\.\.\/example\/demos\/)(?!en-US\/)([A-Za-z0-9_./-]+\.vue)/g, (reference, prefix, name) => {
    const localized = `${prefix}en-US/${name}`
    return fs.existsSync(path.resolve(path.dirname(englishFile), localized)) ? localized : reference
  })
}
const notes = /\n?<!-- demo-config-notes:start -->[\s\S]*?<!-- demo-config-notes:end -->\n*/g
export function configurationNotes(chinese, english, owner) {
  const titles = new Map(
    chinese.cases.map((item) => [
      item.title,
      english.cases.find((candidate) => demoIdentity(candidate.refs[0]) === demoIdentity(item.refs[0]))?.title,
    ]),
  )
  const extra = {}
  for (const item of chinese.cases)
    for (const match of item.text.matchAll(
      /<!-- demo-config-notes:start -->([\s\S]*?)<!-- demo-config-notes:end -->/g,
    )) {
      for (const line of match[1].split('\n').filter((line) => line.startsWith('|'))) {
        const cells = line
          .split(/(?<!\\)\|/)
          .slice(1, -1)
          .map((cell) => cell.trim())
        if (cells.length !== 3 || !hasChinese(cells[2]) || cells[2] === '相关示例') continue
        let translated = cells[2]
        for (const [zh, en] of [...titles].filter(([zh, en]) => en).sort((a, b) => b[0].length - a[0].length))
          translated = translated.replaceAll(zh, en)
        if (!hasChinese(translated)) extra[normalize(cells[2])] = translated.replaceAll('、', ', ')
      }
    }
  return english.cases.map((item) => {
    const primary = chinese.cases.find((candidate) => demoIdentity(candidate.refs[0]) === demoIdentity(item.refs[0]))
    const block = primary?.text.match(/<!-- demo-config-notes:start -->[\s\S]*?<!-- demo-config-notes:end -->/)?.[0]
    const translatedBlock = block ? translateFragment(block, owner, extra) : undefined
    const existingBlock = item.text.match(/<!-- demo-config-notes:start -->[\s\S]*?<!-- demo-config-notes:end -->/)?.[0]
    if (translatedBlock && existingBlock === translatedBlock) return translateFragment(item.text, owner, extra)
    const clean = item.text.replace(notes, '\n\n')
    const normalized = translatedBlock ? clean.replace(/^(###[^\n]*)\n{3,}/, '$1\n\n') : clean
    const enriched = translatedBlock
      ? normalized.replace(/^(###[^\n]*\n\n)/, '$1' + translatedBlock + '\n\n')
      : normalized
    return translateFragment(enriched, owner, extra)
  })
}
function findMissingLocations(missing, sourceDocuments) {
  const preferredLocations = new Map()
  const unresolved = new Set()
  for (const { text, owners } of missing) {
    for (const owner of owners) {
      const documents = sourceDocuments.get(owner) ?? []
      for (const { file, source } of documents) {
        const index = source.split('\n').findIndex(
          (line) =>
            normalize(line) === text ||
            (line.startsWith('|') &&
              line
                .split(/(?<!\\)\|/)
                .slice(1, -1)
                .some((cell) => normalize(cell) === text)),
        )
        if (index < 0) continue
        if (!preferredLocations.has(owner)) preferredLocations.set(owner, new Map())
        preferredLocations.get(owner).set(text, `${path.relative(root, file)}:${index + 1}`)
        break
      }
      if (!preferredLocations.get(owner)?.has(text)) unresolved.add(text)
    }
  }
  if (!unresolved.size) return { preferredLocations, locations: new Map() }

  const locations = new Map()
  for (const project of ['cedar-design-web', 'maple-design-mobile']) {
    const sourceDir = path.join(root, project, 'packages/ui/src')
    const documents = fs
      .readdirSync(sourceDir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => path.join(entry.parentPath ?? entry.path, entry.name))
      .sort()
    for (const file of documents) {
      const lines = fs.readFileSync(file, 'utf8').split('\n')
      for (const [index, line] of lines.entries()) {
        const normalized = normalize(line)
        for (const key of unresolved) {
          if (!normalized.includes(key)) continue
          locations.set(key, `${path.relative(root, file)}:${index + 1}`)
          unresolved.delete(key)
        }
        if (!unresolved.size) return { preferredLocations, locations }
      }
    }
  }
  return { preferredLocations, locations }
}

function reportMissingTranslations(missing, sourceDocuments) {
  const { preferredLocations, locations } = findMissingLocations(missing, sourceDocuments)
  const groups = new Map()
  for (const row of missing) {
    for (const owner of row.owners) {
      if (!groups.has(owner)) groups.set(owner, [])
      groups.get(owner).push(row.text)
    }
  }
  const report = [`缺少 ${missing.length} 条英译`]
  for (const [owner, keys] of groups) {
    report.push(`\n${owner}`)
    for (const key of keys) {
      const characters = [...key]
      const preview = characters.length > 160 ? characters.slice(0, 160).join('') + '…' : key
      const location = preferredLocations.get(owner)?.get(key) ?? locations.get(key)
      report.push(`  ${location ?? '未找到源文档位置'}  ${preview}`)
    }
  }
  report.push(
    '\n请把译文加到 design-ui/configs/api-documentation.en-US.json（键为中文原句原文，值为此处英文），再运行 node bin/localize-api-documentation.mjs --write。',
  )
  console.error(report.join('\n'))
}

export function localizeApiDocumentation({ write = false, onGenerated, skeleton = false } = {}) {
  unknown.clear()
  const writes = [],
    records = [],
    debugWrites = []
  const sourceDocuments = new Map()
  const manifests = Object.fromEntries(
    ['cedar', 'maple'].map((platform) => [
      platform,
      JSON.parse(
        fs.readFileSync(path.join(root, `design-ui/configs/demo-groups${platform === 'maple' ? '.maple' : ''}.json`)),
      ),
    ]),
  )
  for (const row of inventoryDemoContent()) {
    const zhFile = path.join(root, row.document),
      enFile = zhFile
        .replace(/README\.md$/, 'README.en-US.md')
        .replace(/PICKER\.md$/, 'PICKER.en-US.md')
        .replace(/zh-CN\.md$/, 'en-US.md')
    const generated = /<!-- component-css-variables:start -->[\s\S]*?<!-- component-css-variables:end -->/
    const placeholder = '<!-- component-css-localization-placeholder -->'
    const before = fs.readFileSync(enFile, 'utf8')
    const englishVariables = before.match(generated)?.[0]
    const chineseSource = fs.readFileSync(zhFile, 'utf8')
    sourceDocuments.set(row.platform + '/' + row.family, [
      { file: zhFile, source: chineseSource },
      { file: enFile, source: before },
    ])
    if (generated.test(chineseSource) && !englishVariables)
      throw new Error('Generate bilingual CSS variable documentation first: ' + enFile)
    // The component CSS generator owns both languages and checks them against
    // compiled source. API translation must not retranslate its generated table.
    const zh = readDemoSections(chineseSource.replace(generated, placeholder)),
      en = readDemoSections(before.replace(generated, placeholder))
    const seen = new Set()
    en.cases = en.cases
      .filter((item) => {
        const id = demoIdentity(item.refs[0])
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
      .map((item) => {
        if (hasChinese(item.title) && dictionary[item.title])
          return {
            ...item,
            title: dictionary[item.title],
            text: item.text.replace(/^(###)[^\n]+/, '$1 ' + dictionary[item.title]),
          }
        if (hasChinese(item.title) && item.title.includes(' / ')) {
          const translated = item.title.split(' / ').find((part) => !hasChinese(part))
          if (translated)
            return { ...item, title: translated, text: item.text.replace(/^(###)[^\n]+/, '$1 ' + translated) }
        }
        return item
      })
    const cases = configurationNotes(zh, en, row.platform + '/' + row.family)
    const preserved = zh.preserved.map((section) => translateFragment(section, row.platform + '/' + row.family))
    const api = translateFragment(zh.api, row.platform + '/' + row.family)
    const grouped = groupDemoSections(
      [
        translateFragment(en.prefix.trimEnd(), row.platform + '/' + row.family),
        '## Cases\n\n' + cases.join('\n\n'),
        ...preserved,
        api.trimEnd(),
      ]
        .filter(Boolean)
        .join('\n\n') + '\n',
      manifests[row.platform][row.family],
      true,
    )
    const primary = componentName(row.family)
    const next = normalizeApiHeadings(
      cleanPublicDocumentation(localizeDemoReferences(grouped, enFile), { primary }).text,
      primary,
    ).replace(placeholder, englishVariables ?? '')
    const ids = (source) => [...new Set(demoRefs(source).map(demoIdentity))].sort()
    if (JSON.stringify(ids(next)) !== JSON.stringify(ids(fs.readFileSync(zhFile, 'utf8'))))
      throw new Error('Example parity failed: ' + enFile)
    if (/complete component API reference in Chinese/.test(next))
      throw new Error('Chinese API fallback retained: ' + enFile)
    if (!skeleton && process.argv.includes('--debug') && next !== before)
      debugWrites.push([
        path.join('/tmp/api-documentation-debug', row.platform, row.family.replaceAll('/', '-') + '.md'),
        next,
      ])
    onGenerated?.({ platform: row.platform, family: row.family, source: next })
    writes.push([enFile, next])
    records.push({
      platform: row.platform,
      family: row.family,
      file: path.relative(root, enFile),
      changed: next !== before,
      apiLines: api.split('\n').filter(Boolean).length,
      preservedSections: preserved.length,
      examples: ids(next).length,
    })
  }
  const missing = [...unknown].map(([text, owners], id) => ({ id, text, owners: [...owners] }))
  const result = {
    families: records.length,
    changed: records.filter((row) => row.changed).length,
    missing: missing.length,
  }
  if (missing.length) reportMissingTranslations(missing, sourceDocuments)
  if (skeleton) {
    console.log(JSON.stringify(Object.fromEntries(missing.map((row) => [row.text, ''])), null, 2))
    if (missing.length) process.exitCode = 1
    return result
  }
  if (write && missing.length) throw new Error(`Missing ${missing.length} authored translations; no documents written`)
  for (const [file, source] of debugWrites) {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, source)
  }
  fs.writeFileSync('/tmp/api-documentation-missing.json', JSON.stringify(missing, null, 2) + '\n')
  fs.writeFileSync('/tmp/api-documentation-missing.tsv', missing.map((row) => row.id + '\t' + row.text).join('\n'))
  if (write) {
    for (const [file, source] of writes) if (fs.readFileSync(file, 'utf8') !== source) fs.writeFileSync(file, source)
    fs.writeFileSync(
      path.join(root, 'design-ui/audits/api-documentation-locales-2026-10-28.json'),
      JSON.stringify(
        { families: records.length, changed: records.filter((row) => row.changed).length, missing: 0, records },
        null,
        2,
      ) + '\n',
    )
  }
  return result
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const skeleton = process.argv.includes('--skeleton')
  const result = localizeApiDocumentation({ write: process.argv.includes('--write'), skeleton })
  if (!skeleton) console.log(JSON.stringify(result, null, 2))
}
