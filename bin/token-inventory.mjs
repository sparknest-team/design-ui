// Read-only inventory. A local CSS non-consumer is a review candidate, NOT
// permission to delete: runtime and cross-component consumers need inspection.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { liveTokens } from './token-consumer-graph.mjs'
import { collectStyleGraph, tokenStyleLayout } from './token-style-entries.mjs'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(resolve(workspace, 'cedar-design-web/packages/ui/package.json'))
const postcss = require('postcss')
const ts = require('typescript')
const withoutComments = (source) => {
  const stripScript = (script) => {
    const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.JSX, script)
    const ranges = []
    for (let kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFileToken; kind = scanner.scan()) {
      if ([ts.SyntaxKind.SingleLineCommentTrivia, ts.SyntaxKind.MultiLineCommentTrivia].includes(kind))
        ranges.push([scanner.getTokenPos(), scanner.getTextPos()])
    }
    for (const [start, end] of ranges.reverse())
      script = script.slice(0, start) + ' '.repeat(end - start) + script.slice(end)
    return script
  }
  return source.includes('<template') || source.includes('<script')
    ? source
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(
          /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g,
          (_, open, script, close) => open + stripScript(script) + close,
        )
    : stripScript(source)
}
const contract = JSON.parse(
  readFileSync(new URL('../packages/theme-contract/contracts/theme-contract.json', import.meta.url), 'utf8'),
)
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(resolve(dir, e.name)) : [resolve(dir, e.name)],
  )
const report = []
const entryErrors = []
for (const [repo, pkg, prefix] of [
  ['cedar-design-web', 'ui', 'c'],
  ['maple-design-mobile', 'ui', 'mp'],
]) {
  const root = resolve(workspace, repo, 'packages', pkg, 'src')
  const less = prefix === 'c' ? require('less') : createRequire(resolve(root, '../../cli/package.json'))('less')
  const allDeclarations = []
  const compiledEntries = new Set()
  const platformRows = []
  const sourceFiles = walk(root).filter((p) => !/\/(themes|__tests__|__demos__|example|docs)\//.test(p))
  const styleGraph = collectStyleGraph(root, sourceFiles, (p) => readFileSync(p, 'utf8'), existsSync, ts)
  const runtimeSources = walk(root)
    .filter((p) => /\.(vue|tsx?|jsx?)$/.test(p) && !/\/(themes|__tests__|__demos__|example|docs)\//.test(p))
    .map((p) => [relative(root, p), withoutComments(readFileSync(p, 'utf8'))])
  for (const file of walk(root).filter((p) => p.endsWith('/token.less'))) {
    const layout = tokenStyleLayout(root, file, styleGraph, existsSync)
    const { component, entry } = layout
    const row = {
      platform: prefix,
      component,
      sharedContract: contract.components.includes(component),
      declarations: 0,
      localCssCandidates: [],
    }
    if (layout.internal) row.declarationSource = layout.declarationSource
    if (layout.error) {
      row.error = layout.error
      report.push(row)
      continue
    }
    try {
      const { css: ownCss } = await less.render(readFileSync(file, 'utf8'), { filename: file, javascriptEnabled: true })
      const declared = new Set()
      row.tokens = {}
      postcss.parse(ownCss).walkDecls((d) => {
        if (!d.prop.startsWith(`--${prefix}-`)) return
        declared.add(d.prop)
        const token = (row.tokens[d.prop] ??= {
          visibility: layout.internal || d.prop.startsWith(`--${prefix}-internal-`) ? 'internal' : 'public',
          values: [],
          definitions: [],
        })
        if (!token.values.includes(d.value)) token.values.push(d.value)
        const definition = { selector: d.parent.selector ?? ':root', value: d.value }
        if (!token.definitions.some((item) => item.selector === definition.selector && item.value === definition.value))
          token.definitions.push(definition)
      })
      const { css } = await less.render(readFileSync(entry, 'utf8'), { filename: entry, javascriptEnabled: true })
      compiledEntries.add(entry)
      const declarations = []
      postcss.parse(css).walkDecls((d) => declarations.push(d))
      allDeclarations.push(...declarations)
      const live = liveTokens(declarations)
      row.declarations = declared.size
      row.localCssCandidates = [...declared].filter((name) => !live.has(name)).sort()
    } catch (error) {
      row.error = error.message
    }
    report.push(row)
    platformRows.push(row)
  }
  // Consumers such as Search have style entries but no token.less of their own.
  // Include those entries before deciding that a declaration is unreachable.
  for (const entry of walk(root).filter((file) => file.endsWith('/style/index.less') && !compiledEntries.has(file))) {
    try {
      const { css } = await less.render(readFileSync(entry, 'utf8'), { filename: entry, javascriptEnabled: true })
      postcss.parse(css).walkDecls((d) => allDeclarations.push(d))
    } catch (error) {
      entryErrors.push({ platform: prefix, entry: relative(root, entry), error: error.message })
    }
  }
  // The executable static graph also includes adjacent private style.ts entries.
  // Do not rescan raw import-looking text: comments must not create consumers.
  const extraStyleEntries = new Set([...styleGraph.less].filter((entry) => !compiledEntries.has(entry)))
  for (const entry of extraStyleEntries) {
    try {
      const { css } = await less.render(readFileSync(entry, 'utf8'), { filename: entry, javascriptEnabled: true })
      postcss.parse(css).walkDecls((d) => allDeclarations.push(d))
    } catch (error) {
      entryErrors.push({ platform: prefix, entry: relative(root, entry), error: error.message })
    }
  }
  const globalLive = liveTokens(allDeclarations)
  // Preserve actual terminal CSS property evidence through aliases. This is a
  // reachability inventory, not a claim that every selector matches runtime DOM.
  const consumerProperties = new Map()
  const dependencies = new Map()
  const references = (value) => [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((match) => match[1])
  for (const { prop, value } of allDeclarations) {
    if (prop.startsWith('--')) {
      const deps = dependencies.get(prop) ?? new Set()
      references(value).forEach((name) => deps.add(name))
      dependencies.set(prop, deps)
    } else {
      for (const name of references(value)) {
        const properties = consumerProperties.get(name) ?? new Set()
        properties.add(prop)
        consumerProperties.set(name, properties)
      }
    }
  }
  const pending = [...consumerProperties.keys()]
  while (pending.length) {
    const name = pending.pop()
    for (const dependency of dependencies.get(name) ?? []) {
      const properties = consumerProperties.get(dependency) ?? new Set()
      const previousSize = properties.size
      for (const property of consumerProperties.get(name)) properties.add(property)
      consumerProperties.set(dependency, properties)
      if (properties.size !== previousSize) pending.push(dependency)
    }
  }
  for (const row of platformRows) {
    row.crossComponentCss = row.localCssCandidates.filter((name) => globalLive.has(name))
    // Require a var() expression, not a name in a comment claiming parity with
    // a numeric JS constant (the former FilterForm col-gap false positive).
    row.literalRuntimeReferences = Object.fromEntries(
      row.localCssCandidates
        .filter((name) => !globalLive.has(name))
        .map((name) => [
          name,
          runtimeSources
            .filter(
              ([, source]) =>
                source.includes(`var(${name})`) ||
                (new RegExp(`const TOKEN_NAME\\s*=\\s*['"]${name}['"]`).test(source) &&
                  source.includes('getPropertyValue(TOKEN_NAME)')),
            )
            .map(([file]) => file),
        ])
        .filter(([, files]) => files.length),
    )
    // Only reviewed executable paths may bypass the manual-review gate. New
    // literal references remain hints until their data flow has been checked.
    const reviewedRuntime = [
      ['--mp-tab-bar-z-index', 'tab-bar/TabBar.vue', [':style="{ zIndex: zIndex ??', "'var(--mp-tab-bar-z-index)'"]],
      [
        `--${prefix}-watermark-content-color`,
        'watermark/watermark.tsx',
        ['getPropertyValue(TOKEN_NAME)', 'const options =', 'color,', 'renderWatermark(options)'],
      ],
      [
        '--mp-floating-panel-transition-timing-function',
        'floating-panel/FloatingPanel.vue',
        [':style="{', 'transition: touching', 'var(--mp-floating-panel-transition-timing-function)'],
      ],
      [
        '--mp-time-picker-clock-item-disable-background',
        'time/Clock.vue',
        [':style="getStyle(', "backgroundColor: 'var(--mp-time-picker-clock-item-disable-background)'"],
      ],
      [
        `--${prefix}-switch-shadow-color`,
        'switch/Switch.vue',
        ['const handleStyle = computed<CSSProperties>', 'boxShadow: level ?', ':style="handleStyle"'],
      ],
      [
        '--c-nav-menu-panel-width',
        'nav-menu/item.tsx',
        ["width: 'var(--c-nav-menu-panel-width)'", "props.popupLayout === 'full-height'", 'props.popupStyle'],
      ],
      [
        '--c-scheduler-editor-width',
        'scheduler/components/SchedulerEditor.vue',
        ['<CDrawer', 'width="var(--c-scheduler-editor-width)"'],
      ],
      [
        '--c-scheduler-virtual-height',
        'scheduler/components/SchedulerTimelineRows.vue',
        [':height="options.height ??', "'var(--c-scheduler-virtual-height)'"],
      ],
      [
        '--c-table-empty-image-size',
        'table/table.tsx',
        ['<Empty imageSize={compact ?', '"var(--c-table-empty-image-size)"', 'renderEmptyContent(true)'],
        ['width', 'height', 'font-size'],
        [['empty/Empty.vue', [':style="imageStyle"', 'return { width: size, height: size, fontSize: size }']]],
      ],
      [
        '--mp-table-empty-image-size',
        'table/table-impl.tsx',
        ['<Empty imageSize={compact ?', "'var(--mp-table-empty-image-size)'", 'renderEmptyContent(true)'],
        ['width', 'height', 'font-size'],
        [['empty/Empty.vue', [':style="imageStyle"', 'return { width: size, height: size, fontSize: size }']]],
      ],
    ]
    row.reviewedRuntimeReferences = {}
    for (const [name, path, expressions, properties = [], dependencies = []] of reviewedRuntime) {
      const source = runtimeSources.find(([file]) => file === path)?.[1]
      const dependenciesMatch = dependencies.every(([path, expressions]) => {
        const source = runtimeSources.find(([file]) => file === path)?.[1]
        return source && expressions.every((expression) => source.includes(expression))
      })
      if (
        row.literalRuntimeReferences[name]?.includes(path) &&
        expressions.every((expression) => source.includes(expression)) &&
        dependenciesMatch
      ) {
        row.reviewedRuntimeReferences[name] = [path]
        const consumers = consumerProperties.get(name) ?? new Set()
        properties.forEach((property) => consumers.add(property))
        consumerProperties.set(name, consumers)
      }
    }
    // Reviewed finite expansion: both Space implementations render these values
    // through gapStyle -> style.gap. Require the source expression to remain.
    row.dynamicRuntimeReferences = {}
    // The private field editor resolves its width from the anchor's computed
    // custom property before assigning the measured popup position.
    const fieldPresentation = runtimeSources.find(
      ([file]) => file === '_components/field-presentation/FieldPresentation.vue',
    )
    if (
      prefix === 'c' &&
      row.component === '_components/field-presentation' &&
      fieldPresentation?.[1].includes('getPropertyValue(`--c-field-presentation-${name}`)') &&
      fieldPresentation[1].includes("metric('editor-action-width', 88)") &&
      fieldPresentation[1].includes('position.value = {')
    ) {
      row.dynamicRuntimeReferences['--c-field-presentation-editor-action-width'] = [
        '_components/field-presentation/FieldPresentation.vue: metric -> place -> position',
      ]
    }
    const space = runtimeSources.find(([file]) => file === (prefix === 'c' ? 'space/space.tsx' : 'space/Space.tsx'))
    if (row.component === 'space' && space?.[1].includes('gap: gapStyle.value')) {
      for (const axis of ['row', 'column']) {
        const expression = 'var(--' + prefix + '-space-size-${size}-' + axis + '-gap)'
        if (!space[1].includes(expression)) continue
        for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
          const name = `--${prefix}-space-size-${size}-${axis}-gap`
          if (row.localCssCandidates.includes(name))
            row.dynamicRuntimeReferences[name] = [`${space[0]}: getSize -> gapStyle -> style.gap`]
        }
      }
    }
    row.needsManualReview = row.localCssCandidates.filter(
      (name) => !globalLive.has(name) && !row.reviewedRuntimeReferences[name] && !row.dynamicRuntimeReferences[name],
    )
    for (const [name, token] of Object.entries(row.tokens ?? {})) {
      token.consumerProperties = [...(consumerProperties.get(name) ?? [])].sort()
      token.consumer = !row.localCssCandidates.includes(name)
        ? 'local-css'
        : globalLive.has(name)
          ? 'cross-component-css'
          : row.literalRuntimeReferences[name]
            ? 'literal-runtime-reference'
            : row.dynamicRuntimeReferences[name]
              ? 'reviewed-dynamic-runtime'
              : 'needs-review'
    }
  }
}
const result = {
  scope:
    'Every src/**/token.less. Declared values, visibility, compiled CSS reachability, literal runtime references and reviewed Space dynamic names. DOM reachability and other dynamic names still need review. Candidates are not confirmed dead tokens.',
  totals: {
    files: report.length,
    declarations: report.reduce((n, r) => n + r.declarations, 0),
    candidates: report.reduce((n, r) => n + r.localCssCandidates.length, 0),
    crossComponentCss: report.reduce((n, r) => n + (r.crossComponentCss?.length ?? 0), 0),
    literalRuntime: report.reduce((n, r) => n + Object.keys(r.literalRuntimeReferences ?? {}).length, 0),
    dynamicRuntime: report.reduce((n, r) => n + Object.keys(r.dynamicRuntimeReferences ?? {}).length, 0),
    needsManualReview: report.reduce((n, r) => n + (r.needsManualReview?.length ?? 0), 0),
    errors: report.filter((r) => r.error).length + entryErrors.length,
  },
  entryErrors,
  components: report,
}
console.log(JSON.stringify(process.argv.includes('--summary') ? result.totals : result, null, 2))
if (entryErrors.length || report.some((row) => row.error)) process.exitCode = 1
if (process.argv.includes('--check-consumers') && report.some((row) => row.needsManualReview?.length)) {
  console.error(
    'Unreviewed token consumers remain. Inspect the report; do not delete declarations solely to satisfy this gate.',
  )
  process.exitCode = 1
}
