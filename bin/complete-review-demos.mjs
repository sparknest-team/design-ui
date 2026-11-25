import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { formatReviewVue, instrument, makeField, readApi } from './generate-review-demos.mjs'
import { completeReviewField } from './review-field-recipes.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(path.join(root, 'cedar-design-web/package.json'))
const { parse } = require('@vue/compiler-sfc')
const { parse: parseDom } = require('@vue/compiler-dom')
const namespaceCache = new Map()
function componentNamespaces(prefix) {
  if (namespaceCache.has(prefix)) return namespaceCache.get(prefix)
  const base = path.join(
    root,
    prefix === 'c' ? 'cedar-design-web/packages/ui/src' : 'maple-design-mobile/packages/ui/src',
  )
  const tags = new Set()
  for (const file of fs
    .readdirSync(base, { recursive: true })
    .filter((file) => /\.(?:vue|tsx?|jsx?)$/.test(file) && !/(?:__demos__|__tests__|example|style)\//.test(file))) {
    for (const match of fs.readFileSync(path.join(base, file), 'utf8').matchAll(/createNamespace\(['"]([\w-]+)['"]\)/g))
      tags.add(prefix + '-' + match[1])
  }
  const entry = fs.readFileSync(path.join(base, prefix === 'c' ? 'cedar-vue.ts' : 'maple-vue.ts'), 'utf8')
  const exported = new Set(
    [...entry.matchAll(/^\s{2,4}([A-Z]\w+)\s*[:,]/gm)].map(
      (match) =>
        prefix +
        '-' +
        match[1]
          .replace(/^(?:Mp|C)(?=[A-Z])/, '')
          .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
          .toLowerCase(),
    ),
  )
  const publicEntry = fs.readFileSync(path.join(base, 'index.ts'), 'utf8')
  for (const block of publicEntry.matchAll(/export\s*\{([^}]+)\}/g))
    for (const name of block[1].split(',')) {
      const value = name
        .trim()
        .split(/\s+as\s+/)
        .at(-1)
      if (/^[A-Z]\w+$/.test(value)) exported.add(prefix + '-' + kebab(value))
    }
  const publicTags = new Set([...tags].filter((tag) => exported.has(tag)))
  namespaceCache.set(prefix, publicTags)
  return publicTags
}
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
export const callbackField = (field) =>
  field.kind === 'scenario' &&
  /=>|[Ff]unction|Predicate|Interceptor|BeforeFieldCommit|RenderFunction/.test(field.type) &&
  (/RenderFunction/.test(field.type) ||
    /^before-|^on-|validator|word-length|word-slice|parser|formatter|format-tag|format-label|filter|disabled-date|disabled-time|geocoder|sort|node-props|reference-attrs|render|icon|footer|content|load-more|fallback/.test(
      field.name,
    ))
export function apiCatalog(markdown, primary, prefix) {
  const lines = markdown.slice(markdown.search(/^## API\s*$/m) >= 0 ? markdown.search(/^## API\s*$/m) : 0).split('\n')
  const catalog = new Map()
  let heading = '',
    owner = primary
  const headings = []
  const normal = (s) => {
    s = kebab(s.replace(/^(?:Mp|C)(?=[A-Z])/, '').replace(/[<>]/g, ''))
    return s.startsWith(prefix + '-') ? s : prefix + '-' + s
  }
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6} /.test(lines[i])) {
      heading = lines[i]
      const level = /^#+/.exec(heading)[0].length
      while (headings.length && headings.at(-1).level >= level) headings.pop()
      headings.push({ level, text: heading })
      const section = /^##\s+([A-Z][\w-]+)(?:\s+(?:API|[\u4e00-\u9fff].*)|\s*)$/.exec(heading)
      if (section && !['API', 'Type', 'Props', 'Events', 'Methods', 'Slots'].includes(section[1]))
        owner = normal(section[1])
    }
    const exposed = /`([A-Z]\w+)\.(\w+)\([^`]*`/.exec(lines[i])
    if (exposed && /Expose|Methods|方法/.test(heading)) {
      const subject = normal(exposed[1])
      const current = catalog.get(subject) ?? { props: [], events: [], slots: [], methods: [] }
      if (!current.methods.some((item) => item.name === kebab(exposed[2])))
        current.methods.push({ name: kebab(exposed[2]), description: '文档公开实例方法', type: '', defaultValue: '' })
      catalog.set(subject, current)
    }
    if (!/^\s*\|/.test(lines[i]) || !/^\s*\|\s*:?-+/.test(lines[i + 1] ?? '')) continue
    let end = i + 2
    while (/^\s*\|/.test(lines[end] ?? '')) end++
    if (/^\s*\|\s*(?:组件|Component)\s*\|\s*(?:插槽|Slots?)\s*\|/i.test(lines[i])) {
      for (const line of lines.slice(i + 2, end)) {
        const row = line
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim().replace(/`/g, ''))
        if (!row[0] || !row[1]) continue
        const subject = normal(row[0])
        const current = catalog.get(subject) ?? { props: [], events: [], slots: [], methods: [] }
        for (const name of row[1].split(/\s*\/\s*/))
          if (!current.slots.some((item) => item.name === name))
            current.slots.push({ name, description: row[2] ?? '', type: '', defaultValue: '' })
        catalog.set(subject, current)
      }
      i = end - 1
      continue
    }
    const explicit =
      /<([^>]+)>/.exec(heading) ??
      /^#{1,6}\s+([A-Z][\w-]+)\s+(?:Props|Events|Slots|Methods|属性|事件|方法|插槽)/i.exec(heading)
    const schema = headings
      .map((h) => /^#{1,6}\s+([A-Z][\w]+)(?:\s+(Options|Action))?\s*$/.exec(h.text))
      .filter((match) => match && !['API', 'Type', 'Props', 'Events', 'Methods', 'Slots'].includes(match[1]))
      .at(-1)
    let subject = explicit ? normal(explicit[1]) : schema ? `schema:${schema[1]}${schema[2] ?? ''}` : owner
    if (subject.startsWith('schema:') && componentNamespaces(prefix).has(normal(subject.slice(7))))
      subject = normal(subject.slice(7))
    const table = lines
      .slice(i, end)
      .flatMap((line, n) => {
        const group = n > 1 ? /^\s*\|([^|]+)\|([\s\S]*)$/.exec(line) : null
        return group?.[1].includes(' / ')
          ? group[1].split(/\s+\/\s+/).map((name) => `| ${name.trim()} |${group[2]}`)
          : [line]
      })
      .join('\n')
    const api = readApi(`## API\n${heading}\n${table}`)
    const current = catalog.get(subject) ?? { props: [], events: [], slots: [], methods: [] }
    for (const kind of Object.keys(current))
      for (const entry of api[kind]) if (!current[kind].some((e) => e.name === entry.name)) current[kind].push(entry)
    catalog.set(subject, current)
    i = end - 1
  }
  const common = catalog.get(prefix + '-common')
  if (common) {
    for (const tag of [prefix + '-typography-text', prefix + '-typography-title', prefix + '-typography-paragraph']) {
      const own = catalog.get(tag) ?? { props: [], events: [], slots: [], methods: [] }
      for (const kind of Object.keys(own))
        own[kind] = [
          ...own[kind],
          ...common[kind].filter((entry) => !own[kind].some((item) => item.name === entry.name)),
        ]
      catalog.set(tag, own)
    }
    catalog.delete(prefix + '-common')
  }
  return catalog
}
function inspect(source) {
  const result = { tags: new Set(), features: new Set() }
  const d = parse(source).descriptor
  if (!d.template) return result
  const walk = (n) => {
    if (n.type === 1) {
      const tag = kebab(n.tag)
      result.tags.add(tag)
      if (/^(?:c-)?icon-/.test(tag)) result.tags.add('c-icon-xxx')
      for (const p of n.props) {
        if (p.type === 6) result.features.add(tag + ':props:' + kebab(p.name))
        if (p.type === 7 && p.arg?.isStatic) {
          if (p.name === 'bind') result.features.add(tag + ':props:' + kebab(p.arg.content))
          if (p.name === 'on') result.features.add(tag + ':events:' + kebab(p.arg.content))
        }
      }
      for (const c of n.children ?? []) {
        const slot = c.props?.find((p) => p.type === 7 && p.name === 'slot')
        if (slot?.arg?.isStatic) result.features.add(tag + ':slots:' + slot.arg.content)
      }
    }
    for (const c of n.children ?? []) walk(c)
  }
  walk(parseDom(d.template.content))
  return result
}
export function hasReviewableApi(config, api) {
  return (
    config.fields.length > 0 ||
    Boolean(api && !api.props.length && (api.slots.length || api.events.length || api.methods.length))
  )
}
export function pruneGeneratedReviewCases(directories, liveFiles) {
  const live = new Set(liveFiles.map((file) => path.resolve(file)))
  const removed = []
  for (const directory of directories) {
    for (const relative of fs.readdirSync(directory, { recursive: true })) {
      if (!/^api-review-(?!main\.vue$).+\.vue$/.test(path.basename(relative))) continue
      const filename = path.resolve(directory, relative)
      if (
        live.has(filename) ||
        !fs.readFileSync(filename, 'utf8').startsWith('<!-- Generated by design-ui/bin/generate-review-demos.mjs;')
      )
        continue
      fs.unlinkSync(filename)
      const config = filename.replace(/\.vue$/, '.config.json')
      if (fs.existsSync(config)) fs.unlinkSync(config)
      removed.push(filename)
    }
  }
  return removed
}
export async function complete() {
  const selection = process.env.REVIEW_COMPONENTS?.split(',')
  const manifest = selection
    ? JSON.parse(fs.readFileSync(path.join(root, 'design-ui/audits/demo-review-cases.json'), 'utf8')).filter(
        (row) => !selection.includes(row.platform + '/' + row.component),
      )
    : []
  const mapleFiles = []
  for (const [platform, library, prefix] of [
    ['cedar', 'cedar-design-web/packages/ui', 'c'],
    ['maple', 'maple-design-mobile/packages/ui', 'mp'],
  ]) {
    const base = path.join(root, library, 'src')
    for (const component of [
      ...fs.readdirSync(base),
      ...(platform === 'cedar' ? ['date/picker', 'time/picker'] : []),
    ].sort()) {
      if (selection && !selection.includes(platform + '/' + component)) continue
      const dir = path.join(base, component)
      const doc = path.join(dir, platform === 'cedar' ? 'README.md' : 'docs/zh-CN.md')
      if (!fs.existsSync(doc)) continue
      const mainTag = prefix + '-' + component.replaceAll('/', '-')
      const catalog = apiCatalog(fs.readFileSync(doc, 'utf8'), mainTag, prefix)
      const all = fs.readdirSync(dir, { recursive: true }).filter((file) => {
        let ancestor = path.dirname(path.join(dir, file))
        while (ancestor !== dir && ancestor.startsWith(dir + path.sep)) {
          if (fs.existsSync(path.join(ancestor, platform === 'cedar' ? 'README.md' : 'docs/zh-CN.md'))) return false
          ancestor = path.dirname(ancestor)
        }
        return true
      })
      const configRel = all.find((f) => f.endsWith('/api-review.config.json'))
      if (!configRel) continue
      const mainDir = path.dirname(path.join(dir, configRel))
      const top = path.join(mainDir, 'api-review.vue')
      let entrySource = fs.readFileSync(top, 'utf8')
      let original = entrySource
      if (entrySource.includes('ReviewSuite')) {
        const saved = path.join(mainDir, 'api-review-main.vue')
        if (fs.existsSync(saved)) original = fs.readFileSync(saved, 'utf8')
        else {
          const previous = JSON.parse(
            fs.readFileSync(path.join(root, 'design-ui/audits/demo-api-review.json'), 'utf8'),
          ).find((row) => row.platform === platform && row.component === component)
          const fixture = path.join(dir, platform === 'cedar' ? '__demos__' : 'example/demos', previous.fixture)
          original = instrument(
            fs.readFileSync(fixture, 'utf8'),
            fixture,
            mainTag,
            path.join(mainDir, 'api-review.config.json'),
            catalog.get(mainTag)?.slots ?? [],
          ).source
        }
      }
      const mainConfig = JSON.parse(fs.readFileSync(path.join(dir, configRel), 'utf8'))
      const authored = all
        .filter(
          (f) =>
            f.endsWith('.vue') &&
            /(?:__demos__|example)\//.test(f) &&
            !path.basename(f).startsWith('api-review') &&
            !/\/en-US\/|\/locale\/|\/index.vue$/.test(f),
        )
        .map((file) => {
          const source = fs.readFileSync(path.join(dir, file), 'utf8')
          return { file, source, ...inspect(source) }
        })
      const cases = []
      const primaryApi = catalog.get(mainTag)
      if (primaryApi)
        mainConfig.scenarios = mainConfig.scenarios.filter(
          (item) => item.kind !== 'slot' || primaryApi.slots.some((slot) => slot.name === item.name),
        )
      const originalFixture = /fixture: ([^.]+\.vue)/.exec(original)?.[1]
      const originalSource = authored.find((s) => path.basename(s.file) === originalFixture)
      if (originalSource && primaryApi) {
        const regenerated = instrument(
          originalSource.source,
          path.join(dir, originalSource.file),
          mainTag,
          path.join(mainDir, 'api-review.config.json'),
          primaryApi.slots,
        )
        if (regenerated) {
          original = regenerated.source
          mainConfig.slotNames = regenerated.slotNames
          mainConfig.slotDefaults = regenerated.slotDefaults
          mainConfig.events = [
            ...new Set([
              ...primaryApi.events.map((e) =>
                e.name.startsWith('update:')
                  ? 'update:' + e.name.slice(7).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
                  : e.name,
              ),
              ...mainConfig.events.filter((e) => e.startsWith('update:')),
            ]),
          ]
        }
      }
      for (const entry of primaryApi?.props ?? [])
        if (!mainConfig.fields.some((f) => f.name === entry.name)) mainConfig.fields.push(makeField(entry))
      const promote = (fields) =>
        fields.map((f) => {
          if (component === 'code' && /^(theme|light-theme|dark-theme)$/.test(f.name))
            return {
              ...f,
              kind: 'enum',
              options: ['github-light', 'github-dark', 'vitesse-light', 'vitesse-dark'],
              initial: f.name === 'dark-theme' ? 'github-dark' : 'github-light',
            }
          f = completeReviewField(f)
          if (f.kind !== 'scenario') return f
          const indexed = /^([A-Za-z]+)\[['"]([\w]+)['"]\]$/.exec(f.type)
          if (indexed) {
            const entry = catalog.get('schema:' + indexed[1])?.props.find((p) => p.name === kebab(indexed[2]))
            if (entry) f = makeField({ ...entry, ...f, type: entry.type })
          }
          if (f.kind === 'scenario' && /^(?:RegExp)$/.test(f.type)) return { ...f, kind: 'regexp', initial: '^[A-Z]' }
          if (f.kind === 'scenario' && /^(?:date|Date)$/.test(f.type))
            return { ...f, kind: 'date', initial: '2026-10-21' }
          if (f.kind === 'scenario' && /^DateValue(?:\s*[/|]\s*DateValue\[\])?$/.test(f.type))
            return { ...f, kind: 'json', initial: '"2026-10-21"' }
          if (f.kind === 'scenario' && /^(?:unknown|any)$/.test(f.type)) return { ...f, kind: 'json', initial: 'null' }
          if (
            f.kind === 'scenario' &&
            /^ClassName$|^(?:string[|/])?(?:array|object)(?:[|/](?:array|object))*$/i.test(f.type.replaceAll(' ', ''))
          )
            return { ...f, kind: 'string', initial: 'review-class' }
          if (f.kind === 'scenario' && /^(?:MessageContent|VNode(?:Child)?|JSX\.Element)$/.test(f.type))
            return { ...f, kind: 'node', initial: '审查内容 / Review content' }
          if (f.kind === 'scenario' && /^(?:string \| )?Component$/.test(f.type))
            return { ...f, kind: 'component', options: ['Button', 'Input', 'Tag', 'Checkbox'], initial: 'Input' }
          if (f.kind === 'scenario' && /^\[Boolean, Number\]$/.test(f.type)) return { ...f, kind: 'json', initial: '2' }
          if (f.kind === 'scenario' && /^\[String, Array, Object\]$/.test(f.type))
            return { ...f, kind: 'string', initial: 'review-class' }
          if (callbackField(f)) return { ...f, kind: 'callback' }
          if (
            f.kind === 'scenario' &&
            !/=>|Function|VNode|HTMLElement|Element|Ref<|Render/.test(f.type) &&
            /Props|Options|Record|Config|Descriptor|Rules|FieldNames|Data|Option|\[\]|object|\{/.test(f.type)
          )
            return {
              ...f,
              kind: 'json',
              initial:
                f.name === 'max-length'
                  ? '{"length":20,"errorOnly":false}'
                  : f.name === 'rules'
                    ? '{}'
                    : /\[\]/.test(f.type)
                      ? '[]'
                      : '{}',
            }
          return f
        })
      function withSchemas(fields) {
        const result = [...fields]
        function visit(parentType, path, depth = 0) {
          if (depth > 2) return
          // Types mentioned in callback parameters/results are not nested config data.
          if (/=>|RenderFunction|Predicate/.test(parentType)) return
          if (component === 'progress-group') parentType = parentType.replace(/ProgressGroupItem/g, 'Item')
          if (component === 'action-sheet')
            parentType = parentType.replace(/\bActions\b|\bActionItem\[\]/g, 'ActionSheetAction[]')
          if (component === 'filter-form')
            parentType = parentType.replace(/\bFilterFormFieldMap\b/g, 'Record<string, FilterFormFieldRegistration>')
          for (const [schema, schemaApi] of catalog) {
            if (!schema.startsWith('schema:')) continue
            const type = schema.slice(7)
            if (!new RegExp(`\\b${type}\\b`).test(parentType)) continue
            const dictionary = /Record<string/.test(parentType) ? [...path, '$first'] : path
            const target = /\[\]/.test(parentType) ? [...dictionary, 0] : dictionary
            const nested = []
            for (const entry of schemaApi.props) {
              const property = entry.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
              const field = promote([makeField(entry)])[0]
              const name = `${type}.${entry.name}`
              if (!result.some((item) => item.name === name))
                result.push({
                  ...field,
                  name,
                  path: [...target, property],
                  description: `${target.join('.')} · ${field.description}`,
                })
              nested.push([entry.type, [...target, property]])
            }
            for (const [childType, childPath] of nested) visit(childType, childPath, depth + 1)
          }
        }
        for (const field of fields) visit(field.type, [field.name])
        return result
      }
      mainConfig.methodNames = (primaryApi?.methods ?? []).map((entry) => entry.name)
      mainConfig.fields = withSchemas(promote(mainConfig.fields.filter((f) => !f.path)))
      const mainFile = path.join(mainDir, 'api-review-main.vue')
      fs.writeFileSync(mainFile, await formatReviewVue(original, mainFile))
      fs.writeFileSync(path.join(dir, configRel), JSON.stringify(mainConfig, null, 2) + '\n')
      cases.push({
        name: 'main',
        label: `${mainTag} · 组合属性`,
        file: path.relative(dir, mainFile),
        tag: mainTag,
        config: configRel,
        fields: mainConfig.fields.length,
      })
      for (const [tag, api] of catalog) {
        if (tag.startsWith('schema:')) continue
        const fields = withSchemas(promote(tag === mainTag ? mainConfig.fields : api.props.map(makeField)))
        if (!fields.length && !api.slots.length && !api.methods.length && !api.events.length) continue
        const candidates = authored.filter((s) => s.tags.has(tag))
        const wanted = new Set(
          Object.entries(api).flatMap(([kind, entries]) =>
            entries
              .filter(
                (e) => kind === 'slots' || kind === 'methods' || (kind === 'props' && makeField(e).kind === 'scenario'),
              )
              .map((e) => `${tag}:${kind}:${e.name}`),
          ),
        )
        const covered = new Set()
        if (tag === mainTag) {
          const mainFixture = /fixture: ([^.]+\.vue)/.exec(original)?.[1]
          const seed = candidates.find((c) => path.basename(c.file) === mainFixture)
          for (const feature of seed?.features ?? []) covered.add(feature)
        }
        let selected = 0
        while (candidates.length) {
          const required = (s) => tag === mainTag && /\/review-hook\.vue$/.test(s.file)
          candidates.sort(
            (a, b) =>
              Number(required(b)) - Number(required(a)) ||
              [...b.features].filter((f) => wanted.has(f) && !covered.has(f)).length -
                [...a.features].filter((f) => wanted.has(f) && !covered.has(f)).length,
          )
          const chosen = candidates.shift()
          const gain = [...chosen.features].filter((f) => wanted.has(f) && !covered.has(f))
          if (!gain.length && !required(chosen) && (tag === mainTag || selected)) break
          const name = `${tag}-${selected + 1}`
          const filename = path.join(dir, path.dirname(chosen.file), `api-review-${name}.vue`)
          const cfg = filename.replace(/\.vue$/, '.config.json')
          const generated = instrument(chosen.source, path.join(dir, chosen.file), tag, cfg, api.slots)
          if (!generated) continue
          const config = {
            fields,
            methodNames: api.methods.map((entry) => entry.name),
            events: api.events.map((e) =>
              e.name.startsWith('update:')
                ? 'update:' + e.name.slice(7).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
                : e.name,
            ),
            slotNames: generated.slotNames,
            slotDefaults: generated.slotDefaults,
            scenarios: [],
          }
          fs.writeFileSync(filename, await formatReviewVue(generated.source, filename))
          fs.writeFileSync(cfg, JSON.stringify(config, null, 2) + '\n')
          if (platform === 'maple') mapleFiles.push(filename)
          cases.push({
            name,
            label: `${tag} · ${path.basename(chosen.file, '.vue')}`,
            file: path.relative(dir, filename),
            tag,
            config: path.relative(dir, cfg),
            fields: fields.length,
            fixture: chosen.file,
            features: gain,
          })
          for (const feature of chosen.features) covered.add(feature)
          selected++
        }
      }
      const serviceNames = {
        notification: 'Notification',
        message: 'Message',
        dialog: 'Dialog',
        drawer: 'Drawer',
        'action-sheet': 'ActionSheet',
        picker: 'Picker',
        'loading-bar': 'LoadingBar',
        image: 'imagePreview',
      }
      const serviceName = serviceNames[component]
      if (serviceName) {
        const filename = path.join(mainDir, 'api-review-service.vue')
        const cfg = filename.replace(/\.vue$/, '.config.json')
        const schemas = [...catalog].filter(([name]) => name.startsWith('schema:') && /Options|Config$/.test(name))
        const serviceFields = promote([
          ...mainConfig.fields.filter((f) => !f.path),
          ...schemas
            .flatMap(([, api]) => api.props)
            .filter((e) => !mainConfig.fields.some((f) => f.name === e.name))
            .map(makeField),
        ])
        const events = [
          ...new Set([
            ...mainConfig.events,
            ...serviceFields.filter((f) => /^on-/.test(f.name)).map((f) => f.name.slice(3)),
          ]),
        ]
        const sample = {
          src: '/cat.jpg',
          images: ['/cat.jpg', '/cat2.jpg'],
          title: '审查 / Review',
          content: '组合配置和回调后再次触发 / Trigger after combining controls',
          message: 'Review',
          duration: 0,
          actions: [{ name: 'Review A' }, { name: 'Review B', disabled: true }],
          columns: [
            [
              { text: 'Review A', value: 'a' },
              { text: 'Review B', value: 'b' },
            ],
          ],
        }
        const libraryName = platform === 'cedar' ? '@cedar-design/ui-vue' : '@maple-design/ui-vue'
        const adapter = path
          .relative(
            mainDir,
            path.join(
              root,
              library,
              platform === 'cedar'
                ? 'docs/.vuepress/components/ApiReviewPanel.vue'
                : 'docs/components/ApiReviewPanel.vue',
            ),
          )
          .replaceAll(path.sep, '/')
        const source = `<script setup>\nimport { onUnmounted, shallowRef } from 'vue'\nimport { ${serviceName} as ReviewService } from '${libraryName}'\nimport DemoApiReviewPanel from '${adapter}'\nimport { defineReviewConfig } from '@sparknest/ui-doc-preview-vue'\nimport raw from './api-review-service.config.json'\nconst handle=shallowRef()\nconst sample=${JSON.stringify(sample)}\nconst options=bindings=>({...sample,...Object.fromEntries(Object.entries(bindings).filter(([key])=>!key.startsWith('onVnode')).map(([key,value])=>[key.replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),value]))})\nconst publicNames=['open','confirm','alert','info','success','warning','error','loading','normal','close','clear','start','finish','setDefaultOptions','resetDefaultOptions','config','destroy']\nconst service=Object.fromEntries(publicNames.filter(name=>typeof ReviewService[name]==='function').map(name=>[name,(...args)=>ReviewService[name](...args)]))\nconst methodDefaults=Object.fromEntries(publicNames.map(name=>[name,/^(open|confirm|alert|info|success|warning|error|loading|normal|config|setDefaultOptions)$/.test(name)?[sample]:[]]))\nfunction run(bindings, record){\n const config=options(bindings)\n record('service:call',[config])\n const fn=typeof ReviewService==='function'?ReviewService:ReviewService.open??ReviewService.info??ReviewService.start\n if(!fn){record('service:error',['No callable service']);return}\n handle.value=fn(config)\n record('service:return',[handle.value])\n handle.value?.then?.(value=>record('service:resolved',[value]),error=>record('service:rejected',[String(error)]))\n}\nfunction act(name, record){ const result=handle.value?.[name]?.(name==='update'?{title:'Updated review',content:'Updated review',message:'Updated review'}:undefined);record('handle:'+name,[result]) }\nonUnmounted(()=>{ReviewService.close?.();ReviewService.clear?.();ReviewService.finish?.();ReviewService.resetDefaultOptions?.()})\n</script>\n<template><DemoApiReviewPanel v-slot="scope" v-bind="defineReviewConfig(raw)" :service="service" :handle="handle" :method-defaults="methodDefaults"><p>修改配置后点击触发；可在下方选择方法、编辑参数并查看调用结果 / Trigger after changing controls; inspect methods and results below.</p><${prefix}-space wrap><${prefix}-button @click="run(scope.bindings,scope.record)">触发 / Trigger</${prefix}-button><${prefix}-button :disabled="typeof handle?.update!=='function'" @click="act('update',scope.record)">更新返回句柄 / Update handle</${prefix}-button><${prefix}-button :disabled="typeof handle?.close!=='function'" @click="act('close',scope.record)">关闭返回句柄 / Close handle</${prefix}-button></${prefix}-space></DemoApiReviewPanel></template>\n`
        fs.writeFileSync(filename, await formatReviewVue(source, filename))
        fs.writeFileSync(
          cfg,
          JSON.stringify(
            {
              fields: serviceFields,
              methodNames: [...catalog.values()].flatMap((api) => api.methods.map((entry) => entry.name)),
              events,
              slotNames: [],
              scenarios: [],
            },
            null,
            2,
          ) + '\n',
        )
        if (platform === 'maple') mapleFiles.push(filename)
        cases.push({
          name: 'service',
          label: `${serviceName} · 函数调用与返回句柄`,
          file: path.relative(dir, filename),
          tag: mainTag,
          config: path.relative(dir, cfg),
          fields: serviceFields.length,
        })
      }
      // One visible entry selects reusable authored scenarios instead of duplicating their cards.
      const selectPath = path
        .relative(mainDir, path.join(base, 'select/index.ts'))
        .replaceAll(path.sep, '/')
        .replace(/\.ts$/, '')
      const stylePath = path.relative(mainDir, path.join(base, 'select/style')).replaceAll(path.sep, '/')
      const suitePath = path
        .relative(
          mainDir,
          path.join(
            root,
            library,
            platform === 'cedar'
              ? 'docs/.vuepress/components/ApiReviewSuite.vue'
              : 'docs/components/ApiReviewSuite.vue',
          ),
        )
        .replaceAll(path.sep, '/')
      const source = `<script setup>\nimport { markRaw } from 'vue'\nimport DemoApiReviewSuite from '${suitePath}'\n${cases.map((c, i) => `import Case${i} from './${path.relative(mainDir, path.join(dir, c.file)).replaceAll(path.sep, '/').replace(/^\.\//, '')}'`).join('\n')}\nconst cases = [${cases.map((c, i) => `{name:${JSON.stringify(c.name)},label:${JSON.stringify(c.label)},component:markRaw(Case${i})}`).join(',')} ]\n</script>\n<template><DemoApiReviewSuite :cases="cases" /></template>\n`
      fs.writeFileSync(top, await formatReviewVue(source, top))
      if (platform === 'maple') mapleFiles.push(top, mainFile)
      const activeFiles = new Set(cases.flatMap((c) => [c.file, c.config]))
      for (const file of all.filter((f) => /\/api-review-[\w-]+\.(?:vue|config\.json)$/.test(f))) {
        if (activeFiles.has(file)) continue
        const absolute = path.join(dir, file)
        const contents = fs.readFileSync(absolute, 'utf8')
        if (file.endsWith('.config.json') || contents.includes('Generated by design-ui/bin/generate-review-demos.mjs'))
          fs.unlinkSync(absolute)
      }
      manifest.push({
        platform,
        component,
        directory: path.relative(root, dir),
        entry: path.relative(root, top),
        cases,
        schemas: [...catalog].filter(([k]) => k.startsWith('schema:')).map(([name, api]) => ({ name, api })),
      })
    }
  }
  const stale = pruneGeneratedReviewCases(
    ['cedar-design-web/packages/ui/src', 'maple-design-mobile/packages/ui/src'].map((base) => path.join(root, base)),
    manifest.flatMap((entry) => entry.cases.map((item) => path.join(root, entry.directory, item.file))),
  )
  console.log(`Removed ${stale.length} stale generated review cases`)
  fs.writeFileSync(path.join(root, 'design-ui/audits/demo-review-cases.json'), JSON.stringify(manifest, null, 2) + '\n')
  const previous = process.cwd()
  process.chdir(path.join(root, 'maple-design-mobile'))
  try {
    if (mapleFiles.length) {
      const { ESLint } = createRequire(path.join(root, 'maple-design-mobile/package.json'))('eslint')
      const eslint = new ESLint({ cwd: process.cwd(), fix: true })
      const results = await eslint.lintFiles(mapleFiles)
      await ESLint.outputFixes(results)
      const failures = results.filter((r) => r.errorCount || r.warningCount)
      if (failures.length)
        throw new Error(failures.map((r) => `${r.filePath}: ${r.messages.map((m) => m.message).join('; ')}`).join('\n'))
    }
  } finally {
    process.chdir(previous)
  }
  console.log(
    `Completed ${manifest.length} entries with ${manifest.reduce((n, r) => n + r.cases.length, 0)} selectable review cases`,
  )
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await complete()
