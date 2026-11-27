import ts from 'typescript-js'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { apiCatalog } from './complete-review-demos.mjs'
import { readApi } from './generate-review-demos.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(path.join(root, 'cedar-design-web/packages/ui/package.json'))
const { parse } = require('@vue/compiler-sfc')
const { parse: parseDom } = require('@vue/compiler-dom')
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const records = []
const caseManifest = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/audits/demo-review-cases.json'), 'utf8'))
const caseRuntime = JSON.parse(
  fs.readFileSync(path.join(root, 'design-ui/audits/evidence/demo-recheck-2026-10-21/runtime.json'), 'utf8'),
)
for (const [platform, library] of [
  ['cedar', 'cedar-design-web/packages/ui'],
  ['maple', 'maple-design-mobile/packages/ui'],
]) {
  const base = path.join(root, library, 'src')
  const components = [...fs.readdirSync(base), ...(platform === 'cedar' ? ['date/picker', 'time/picker'] : [])]
  for (const component of components.sort()) {
    const directory = path.join(base, component)
    const doc = path.join(directory, platform === 'cedar' ? 'README.md' : 'docs/zh-CN.md')
    if (!fs.existsSync(doc)) continue
    const markdown = fs.readFileSync(doc, 'utf8')
    const demos = fs
      .readdirSync(directory, { recursive: true })
      .filter((file) => file.endsWith('.vue') && /(?:__demos__|example)\//.test(file) && !/api-review\.vue$/.test(file))
    const sources = demos.map((file) => ({
      file,
      source: fs.readFileSync(path.join(directory, file), 'utf8'),
    }))
    for (const [index, block] of [...markdown.matchAll(/```(?:vue|html)[^\n]*\n([\s\S]*?)```/g)].entries())
      sources.push({
        file: path.relative(directory, doc) + '#example-' + (index + 1),
        source: block[1],
      })
    const evidence = []
    const methods = new Map()
    for (const { file, source } of sources) {
      const full = path.join(directory, file)
      const sfc = parse(source, { filename: full }).descriptor
      const refs = new Map()
      if (sfc.template) {
        function visit(node) {
          if (node.type === 1) {
            const refName = node.props.find((prop) => prop.type === 6 && prop.name === 'ref')?.value?.content
            if (refName) refs.set(refName, kebab(node.tag))
            const props = [],
              events = [],
              slots = []
            for (const prop of node.props) {
              if (prop.type === 6) props.push(kebab(prop.name))
              if (prop.type === 7 && prop.arg?.isStatic) {
                if (prop.name === 'bind') props.push(kebab(prop.arg.content))
                if (prop.name === 'on') events.push(kebab(prop.arg.content))
                if (prop.name === 'model') {
                  const name = kebab(prop.arg?.content ?? 'model-value')
                  props.push(name)
                  events.push('update:' + name)
                }
              }
              if (prop.type === 7 && prop.name === 'model' && !prop.arg) {
                props.push('model-value')
                events.push('update:model-value')
              }
            }
            for (const child of node.children ?? []) {
              const slot = child.props?.find((prop) => prop.type === 7 && prop.name === 'slot')
              if (slot?.arg?.isStatic) slots.push(slot.arg.content)
            }
            if (
              (node.children ?? []).some(
                (child) =>
                  child.type !== 3 &&
                  (child.type !== 2 || child.content.trim()) &&
                  !(child.type === 1 && child.props?.some((prop) => prop.type === 7 && prop.name === 'slot')),
              )
            )
              slots.push('default')
            evidence.push({ file, tag: kebab(node.tag), props, events, slots })
          }
          for (const child of node.children ?? []) visit(child)
        }
        visit(parseDom(sfc.template.content))
      }
      for (const script of [sfc.script, sfc.scriptSetup].filter(Boolean)) {
        const ast = ts.createSourceFile(full, script.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
        function visit(node) {
          if (ts.isCallExpression(node)) {
            let service = ts.isIdentifier(node.expression)
              ? node.expression.text
              : ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.expression)
                ? node.expression.expression.text
                : undefined
            if (service && /^[A-Z]/.test(service))
              for (const argument of node.arguments)
                if (ts.isObjectLiteralExpression(argument)) {
                  evidence.push({
                    file,
                    tag: `${platform === 'cedar' ? 'c' : 'mp'}-${kebab(service)}`,
                    props: argument.properties
                      .filter(ts.isPropertyAssignment)
                      .map((item) => kebab(item.name.text ?? item.name.getText(ast).replace(/['\"]/g, ''))),
                    events: argument.properties
                      .filter(ts.isPropertyAssignment)
                      .map((item) => item.name.text ?? '')
                      .filter((name) => /^on[A-Z]/.test(name))
                      .map((name) => kebab(name.slice(2)).replace(/^-/, '').toLowerCase()),
                    slots: [],
                  })
                }
          }
          if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
            const name = kebab(node.expression.name.text)
            let receiver = node.expression.expression
            while (ts.isPropertyAccessExpression(receiver) || ts.isNonNullExpression(receiver))
              receiver = receiver.expression
            if (ts.isIdentifier(receiver)) {
              const subject =
                refs.get(receiver.text) ??
                (/^[A-Z]/.test(receiver.text)
                  ? `${platform === 'cedar' ? 'c' : 'mp'}-${kebab(receiver.text)}`
                  : undefined)
              if (subject) {
                const key = subject + ':' + name
                methods.set(key, [...new Set([...(methods.get(key) ?? []), file])])
              }
            }
          }
          ts.forEachChild(node, visit)
        }
        visit(ast)
      }
    }
    const configFile = fs
      .readdirSync(directory, { recursive: true })
      .find((file) => file.endsWith('/api-review.config.json'))
    const config = configFile ? JSON.parse(fs.readFileSync(path.join(directory, configFile), 'utf8')) : undefined
    const prefix = platform === 'cedar' ? 'c' : 'mp'
    const mainTag = prefix + '-' + component.replaceAll('/', '-')
    const catalog = apiCatalog(markdown, mainTag, prefix)
    const cases = caseManifest.find((row) => row.platform === platform && row.component === component)?.cases ?? []
    const configurations = cases.map((item) => ({
      ...item,
      value: JSON.parse(fs.readFileSync(path.join(directory, item.config), 'utf8')),
    }))
    for (const owner of caseManifest)
      for (const item of owner.cases) {
        if (
          owner.platform !== platform ||
          !catalog.has(item.tag) ||
          configurations.some((config) => config.tag === item.tag)
        )
          continue
        const absolute = path.join(root, owner.directory, item.file)
        configurations.push({
          ...item,
          file: path.relative(directory, absolute),
          rootFile: path.join(owner.directory, item.file),
          value: JSON.parse(fs.readFileSync(path.join(root, owner.directory, item.config), 'utf8')),
        })
      }
    const apis = []
    for (const [tag, api] of catalog)
      for (const kind of ['props', 'events', 'slots', 'methods'])
        for (const entry of api[kind]) {
          const schema = tag.startsWith('schema:')
          const own = evidence.filter((item) => item.tag === tag)
          const hits =
            kind === 'methods'
              ? (methods.get(tag + ':' + entry.name.split('.').at(-1)) ?? [])
              : own.filter((item) => item[kind]?.includes(entry.name)).map((item) => item.file)
          const relevant = configurations.filter(
            (item) => schema || item.tag === tag || (component === 'image' && item.name === 'service'),
          )
          const fields =
            kind === 'props'
              ? relevant.flatMap((item) =>
                  item.value.fields
                    .filter(
                      (field) =>
                        field.name === (schema ? tag.slice(7) + '.' : '') + entry.name ||
                        (schema && item.name === 'service' && field.name === entry.name),
                    )
                    .map((field) => ({ field, file: item.file })),
                )
              : []
          const control = fields.find((item) => item.field.kind !== 'scenario')
          const slotToggle = kind === 'slots' && relevant.some((item) => item.value.slotNames?.includes(entry.name))
          const log =
            kind === 'events' &&
            relevant.some((item) => item.value.events?.some((event) => kebab(event) === entry.name))
          const exposed =
            kind === 'methods' &&
            relevant
              .filter((item) =>
                caseRuntime.some(
                  (row) =>
                    row.file.endsWith(item.rootFile ?? item.file) &&
                    (row.methods?.some((method) => kebab(method) === entry.name.split('.').at(-1)) ||
                      row.exposedProperties?.some((name) => kebab(name) === entry.name)),
                ),
              )
              .map((item) => item.file)
          const runtimeEvidence = relevant.flatMap((item) =>
            caseRuntime.filter((row) => row.file.endsWith(item.rootFile ?? item.file)).map((row) => ({ item, row })),
          )
          const schemaName = schema ? tag.slice(7) : undefined
          const argumentCases = schema
            ? runtimeEvidence
                .filter(({ row }) =>
                  Object.values(row.methodArguments ?? {}).some((examples) =>
                    examples.some((example) => example.schemas?.includes(schemaName)),
                  ),
                )
                .map(({ item }) => item.file)
            : []
          const eventSchema = { SearchResult: 'search', TableChangeExtra: 'change' }[schemaName]
          const outputCases = eventSchema
            ? relevant.filter((item) => item.value.events?.includes(eventSchema)).map((item) => item.file)
            : []
          const handleCases =
            schemaName === 'NotificationReturn' && entry.name === 'close'
              ? runtimeEvidence
                  .filter(({ item, row }) => item.name === 'service' && row.methods?.includes('close'))
                  .map(({ item }) => item.file)
              : []
          const hookCases =
            schemaName === 'FormItemEventHandler'
              ? sources
                  .filter(
                    (item) =>
                      item.source.includes('useFormItem') &&
                      item.source.includes(entry.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())),
                  )
                  .map((item) => item.file)
              : []
          const functionCases =
            kind === 'methods' && ['image-preview', 'message', 'action-sheet'].includes(entry.name)
              ? relevant.filter((item) => item.name === 'service').map((item) => item.file)
              : []
          const contractCases = [
            ...new Set([...argumentCases, ...outputCases, ...handleCases, ...hookCases, ...functionCases]),
          ]
          const contractKind = argumentCases.length
            ? 'method-editor'
            : outputCases.length
              ? 'output-log'
              : handleCases.length
                ? 'handle-method'
                : hookCases.length
                  ? 'hook-demo'
                  : functionCases.length
                    ? 'function-trigger'
                    : undefined
          apis.push({
            subject: tag,
            kind,
            name: entry.name,
            type: entry.type,
            control: control?.field.kind,
            contractKind,
            contractCases: contractCases.length ? contractCases : undefined,
            controlPath: control?.field.path,
            reviewCases: control
              ? fields.map((item) => item.file)
              : slotToggle
                ? relevant.filter((item) => item.value.slotNames?.includes(entry.name)).map((item) => item.file)
                : exposed?.length
                  ? exposed
                  : undefined,
            slotToggle: slotToggle || undefined,
            eventLog: log || undefined,
            authoredDemos: [...new Set(hits)],
            status:
              control || slotToggle || exposed?.length
                ? 'interactive'
                : contractCases.length
                  ? 'contract-inspector'
                  : hits.length
                    ? 'authored'
                    : log
                      ? 'event-log'
                      : 'needs-scenario',
          })
        }
    // Keep source-only inherited fields visible, independently of documentation tables.
    for (const field of config?.fields.filter((field) => !field.path) ?? [])
      if (
        !apis.some(
          (item) =>
            item.kind === 'props' &&
            item.name === field.name &&
            item.subject === `${platform === 'cedar' ? 'c' : 'mp'}-${component.replaceAll('/', '-')}`,
        )
      ) {
        const hits = evidence
          .filter(
            (item) =>
              item.tag === `${platform === 'cedar' ? 'c' : 'mp'}-${component.replaceAll('/', '-')}` &&
              item.props.includes(field.name),
          )
          .map((item) => item.file)
        apis.push({
          subject: `${platform === 'cedar' ? 'c' : 'mp'}-${component.replaceAll('/', '-')}`,
          kind: 'props',
          name: field.name,
          type: field.type,
          control: field.kind === 'scenario' ? undefined : field.kind,
          authoredDemos: [...new Set(hits)],
          sourceOnly: true,
          status: field.kind !== 'scenario' ? 'interactive' : hits.length ? 'authored' : 'needs-scenario',
        })
      }
    records.push({
      platform,
      component,
      document: path.relative(root, doc),
      demoFiles: demos.length,
      review: configFile ?? null,
      apis,
    })
  }
}
const folder = path.join(root, 'design-ui/audits/evidence/demo-recheck-2026-10-21')
fs.mkdirSync(folder, { recursive: true })
fs.writeFileSync(path.join(folder, 'coverage.json'), JSON.stringify(records, null, 2) + '\n')
for (const platform of ['cedar', 'maple']) {
  const components = records.filter((item) => item.platform === platform)
  const apis = components.flatMap((item) => item.apis)
  console.log(
    platform,
    JSON.stringify({
      components: components.length,
      apis: apis.length,
      interactive: apis.filter((item) => item.status === 'interactive').length,
      eventLog: apis.filter((item) => item.status === 'event-log').length,
      authored: apis.filter((item) => item.status === 'authored').length,
      contracts: apis.filter((item) => item.status === 'contract-inspector').length,
      needsScenario: apis.filter((item) => item.status === 'needs-scenario').length,
    }),
  )
}
console.log(
  'Coverage identifies concrete template bindings and method calls. It is not behavioral or visual acceptance.',
)

const runtimeFile = path.join(folder, 'runtime.json')
const runtime = fs.existsSync(runtimeFile) ? JSON.parse(fs.readFileSync(runtimeFile, 'utf8')) : []
const report = [
  '# Cedar / Maple Demo 复查 — 2026-10-21',
  '',
  `本轮包含 ${caseManifest.length} 个审查入口、${caseManifest.reduce((n, item) => n + item.cases.length, 0)} 个可选择场景；API 展示待补项 ${records.flatMap((item) => item.apis).filter((item) => item.status === 'needs-scenario').length} 项。该数字表示展示证据完整度，不表示所有行为和取值组合均已人工验收。`,
  '',
  '本表逐页记录 API 展示证据及组合运行检查。interactive 表示可切换控件或插槽；authored 表示模板有明确绑定或脚本有方法调用；contract-inspector 表示方法参数预设、返回句柄、输出日志或 composable 回调专项；event-log 仅表示审查面板已订阅事件，不能替代事件行为验收。needs-scenario 表示本轮未找到可靠证据，需要继续核对，不能当作覆盖完成。',
  '',
  '属性统计包含子组件和命令式配置表，尚未证明的项目保留在 coverage.json。词语命中不计为覆盖，回调、动态绑定和复杂插槽可能需要人工追踪，因此待核对数量不等于已确认的缺陷数量。',
  '',
  '[逐项 API 与案例路径](./evidence/demo-recheck-2026-10-21/coverage.json) · [逐组件运行记录](./evidence/demo-recheck-2026-10-21/runtime.json)',
  '[执行摘要](./evidence/demo-recheck-2026-10-21/results.json) · [Cedar 浏览器证据](./evidence/demo-recheck-2026-10-21/cedar-method-callback.png) · [Maple 浏览器证据](./evidence/demo-recheck-2026-10-21/maple-callback-slots.png)',
  '',
  '运行检查会挂载真实组件，检查每个可操作字段的控件，组合两个属性，验证取消覆盖、重新挂载和重置；包含合适枚举或布尔项的案例另验证取值切换。对可见的目标实例核对实际 Props。JSDOM 不验证排版、手势、第三方 SDK 和浏览器原生交互；Cedar Form 与 Maple Textarea 另做浏览器检查。',
  '',
  '运行命令：`node design-ui/bin/review-demos-check.mjs`、`node design-ui/bin/demo-api-coverage-check.mjs`；组合运行使用 `node design-ui/bin/review-demo-runtime-check.mjs` 分平台启动独立进程。',
  '',
  '| 平台 / 组件 | API 项 | 可切换 | authored | 契约检查 | 事件日志 | 待核对 | 组合运行 |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
]
for (const item of records) {
  const status = (state) => item.apis.filter((api) => api.status === state).length
  const expected = caseManifest.find((row) => row.platform === item.platform && row.component === item.component)
  const current =
    expected?.cases.map((c) => runtime.find((row) => row.file.endsWith(expected.directory + '/' + c.file))) ?? []
  const result = current.length
    ? `${current.filter((row) => row?.status === 'passed').length}/${current.length} passed`
    : undefined
  report.push(
    `| ${item.platform}/${item.component} | ${item.apis.length} | ${status('interactive')} | ${status('authored')} | ${status('contract-inspector')} | ${status('event-log')} | ${status('needs-scenario')} | ${result ? result : item.review ? '未运行' : '参考页'} |`,
  )
}
report.push(
  '',
  '地图仅验证缺少 SDK 时的降级外壳与属性切换，真实地图加载、定位和逆地理解析仍待具备 SDK 的环境验收。案例中的 API 控制项、插槽操作与编辑宿主均使用各自组件库控件；Scheduler 的 capture 事件容器只负责事件观察。',
  '',
)
fs.writeFileSync(path.join(root, 'design-ui/audits/demo-recheck-2026-10-21.md'), report.join('\n'))
