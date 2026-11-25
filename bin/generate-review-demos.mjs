import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
// Review fixtures remain available to internal checks; they are not published demos.
const { publicReviewDemos } = JSON.parse(
  fs.readFileSync(path.join(root, 'design-ui/configs/component-showcase.json'), 'utf8'),
)
const require = createRequire(path.join(root, 'cedar-design-web/packages/ui/package.json'))
const ts = require('typescript')
const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc')
const { parse: parseTemplate } = require('@vue/compiler-dom')
const panel = path.join(root, 'design-ui/packages/ui-doc-preview/src/ReviewPanel.vue')
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const camel = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
const clean = (text) =>
  text
    ?.replace(/[`*_]/g, '')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .trim() ?? ''
function cells(line) {
  return line
    .replace(/\\\|/g, '\u0001')
    .split('|')
    .slice(1, -1)
    .map((cell) => clean(cell.replaceAll('\u0001', '|')))
}
export function readApi(markdown) {
  const result = { props: [], events: [], slots: [], methods: [] }
  const apiStart = /^## API\s*$/im.exec(markdown)
  const lines = (apiStart ? markdown.slice(apiStart.index) : markdown).split('\n')
  let heading = ''
  let primaryProps = false
  for (let index = 0; index < lines.length; index++) {
    if (/^#{2,}/.test(lines[index])) heading = lines[index]
    if (!lines[index].trim().startsWith('|') || !/^\s*\|\s*:?-+/.test(lines[index + 1] ?? '')) continue
    const header = cells(lines[index])
    let kind = /slot|插槽/i.test(heading)
      ? 'slots'
      : /event|事件/i.test(heading)
        ? 'events'
        : /method|方法/i.test(heading)
          ? 'methods'
          : /prop|属性|参数|config|options|选项/i.test(heading)
            ? 'props'
            : undefined
    if (
      !kind &&
      /^(属性|参数|参数名|选项|Prop|Name)$/i.test(header[0]) &&
      header.some((cell) => /^(类型|Type)$/i.test(cell))
    )
      kind = 'props'
    if (!kind) continue
    if (kind === 'props' && primaryProps) continue
    if (kind === 'props') primaryProps = true
    const typeIndex = header.findIndex((cell) => /^(类型|Type)$/i.test(cell))
    const descriptionIndex = header.findIndex((cell) => /说明|描述|Description/i.test(cell))
    const defaultIndex = header.findIndex((cell) => /默认|Default/i.test(cell))
    index += 2
    while (lines[index]?.trim().startsWith('|')) {
      const row = cells(lines[index++])
      let name = clean(row[0])
        .replace(/\s*\(.*$/, '')
        .replace(/^v-model:/, '')
        .replace(/^v-model$/, 'model-value')
      if (!name || !/^[\w:.-]+$/.test(name)) continue
      const entry = {
        name: kebab(name),
        description: row[descriptionIndex] ?? '',
        type: row[typeIndex] ?? '',
        defaultValue: row[defaultIndex] ?? '',
      }
      if (!result[kind].some((item) => item.name === entry.name)) result[kind].push(entry)
    }
    index--
  }
  for (const [kind, pattern] of [
    ['events', /事件(?:为|：|:)\s*([^。\n]+)/g],
    ['slots', /插槽为\s*([^。\n]+)/g],
  ]) {
    for (const match of markdown.matchAll(pattern)) {
      for (const token of match[1].matchAll(/`([\w:.-]+)(?:\([^`]*\))?`/g)) {
        const name = kebab(token[1])
        if (!result[kind].some((item) => item.name === name))
          result[kind].push({
            name,
            description: '文档公开 API / Documented API',
            type: '',
            defaultValue: '',
          })
      }
    }
  }
  return result
}
export function makeField(entry) {
  const type = entry.type.trim()
  const field = { ...entry, kind: 'scenario' }
  if (
    /container$/.test(entry.name) &&
    /PopupContainer|popupContainerProp|TeleportProps|HTMLElement/.test(type) &&
    !/=>|Function|Ref</.test(type)
  )
    return { ...field, kind: 'json', initial: '"body"' }
  if (/CSSProperties|^StyleValue$|^StyleVars(?:\s*\|\s*null)?$/.test(type))
    return { ...field, kind: 'json', initial: '{}' }
  if (/ComponentSize/.test(type) && /number/.test(type)) return { ...field, kind: 'scalar', initial: 'md' }
  if (type === 'RenderContent') return { ...field, kind: 'string' }
  if (/=>|function|VNode|HTMLElement|Element|Component|Ref<|Render/i.test(type) && !/^ComponentSize$/.test(type))
    return field
  if (/^boolean$/i.test(type)) field.kind = 'boolean'
  else if (/^number$/i.test(type)) field.kind = 'number'
  else {
    let options = [...type.matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1])
    if (!options.length && /^[a-z0-9-]+(?:\s*[/|]\s*[a-z0-9-]+)+$/.test(type)) options = type.split(/\s*[/|]\s*/)
    if (type === 'SemanticStatus')
      options = ['default', 'primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'danger']
    if (type === 'ComponentSize') options = ['xs', 'sm', 'md', 'lg', 'xl']
    if (type === 'Direction' || type === 'Orientation') options = ['horizontal', 'vertical']
    if (options.length && !/number|boolean|\[|\{|string/.test(type.replace(/['"][^'"]+['"]/g, ''))) {
      field.kind = 'enum'
      field.options = [...new Set(options)]
      const defaultOption = entry.defaultValue.replace(/^['"]|['"]$/g, '')
      field.initial = field.options.includes(defaultOption) ? defaultOption : field.options[0]
    } else if (/^(?:string|number)(?:\s*[/|]\s*(?:string|number|undefined|null))*$/.test(type))
      field.kind = /number/.test(type) ? 'scalar' : 'string'
    // Structured values often contain callbacks or component instances. Preserve the
    // authored fixture rather than replacing it with a misleading empty object.
  }
  if (/^(?:boolean|number|null|undefined)(?:\s*[/|]\s*(?:boolean|number|null|undefined))+$/.test(type)) {
    field.kind = 'json'
    field.initial = /^(true|false|\d+|null)$/.test(entry.defaultValue) ? entry.defaultValue : '0'
  }
  if (/^(?:string|number)\[\]$/.test(type)) {
    field.kind = 'json'
    field.initial = '[]'
  }
  if (entry.name === 'locale' && field.kind === 'string') {
    field.kind = 'enum'
    field.options = ['zh-CN', 'en-US']
    field.initial = 'zh-CN'
  }
  if (field.kind === 'string' && /color$/.test(entry.name) && /undefined|—|^-$/.test(entry.defaultValue))
    field.initial = '#5268cc'
  return field
}
const sourceContexts = new Map()
function sourceContext(filename) {
  if (sourceContexts.has(filename)) return sourceContexts.get(filename)
  if (!fs.existsSync(filename)) return undefined
  const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true)
  const context = {
    filename,
    source,
    declarations: new Map(),
    imports: new Map(),
    aliases: new Map(),
  }
  sourceContexts.set(filename, context)
  function scan(node) {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier.text.startsWith('.')) {
      for (const item of node.importClause?.namedBindings?.elements ?? []) {
        const base = path.resolve(path.dirname(filename), node.moduleSpecifier.text)
        const target = [base + '.ts', path.join(base, 'index.ts')].find(fs.existsSync)
        if (target) context.imports.set(item.name.text, [target, item.propertyName?.text ?? item.name.text])
      }
    }
    if (ts.isVariableDeclaration(node) && node.initializer)
      context.declarations.set(node.name.getText(source), node.initializer)
    if (ts.isTypeAliasDeclaration(node)) context.aliases.set(node.name.text, node.type)
    ts.forEachChild(node, scan)
  }
  scan(source)
  return context
}
function resolveSourceExpression(node, context, depth = 0) {
  if (!node || !context || depth > 20) return { node, context }
  if (ts.isIdentifier(node)) {
    const imported = context.imports.get(node.text)
    const nextContext = imported ? sourceContext(imported[0]) : context
    const next = nextContext?.declarations.get(imported?.[1] ?? node.text)
    if (next) return resolveSourceExpression(next, nextContext, depth + 1)
  }
  if (ts.isPropertyAccessExpression(node)) {
    const base = resolveSourceExpression(node.expression, context, depth + 1)
    if (base.node && ts.isObjectLiteralExpression(base.node)) {
      const prop = sourceProperty(base.node, base.context, node.name.text, depth + 1)
      if (prop) return resolveSourceExpression(prop.node, prop.context, depth + 1)
    }
  }
  return { node, context }
}
function sourceProperty(node, context, name, depth = 0) {
  if (depth > 20 || !ts.isObjectLiteralExpression(node)) return undefined
  for (const prop of [...node.properties].reverse()) {
    if (ts.isPropertyAssignment(prop) && prop.name?.getText(context.source) === name)
      return { node: prop.initializer, context }
    if (ts.isSpreadAssignment(prop)) {
      const spread = resolveSourceExpression(prop.expression, context, depth + 1)
      if (spread.node) {
        const inherited = sourceProperty(spread.node, spread.context, name, depth + 1)
        if (inherited) return inherited
      }
    }
  }
}
function sourceType(type, context, depth = 0) {
  if (!context || depth > 8 || !/^\w+$/.test(type)) return type
  const imported = context.imports.get(type)
  const next = imported ? sourceContext(imported[0]) : context
  const alias = next?.aliases.get(imported?.[1] ?? type)
  if (!alias) return type
  if (ts.isIndexedAccessTypeNode(alias)) {
    let object = alias.objectType
    while (ts.isParenthesizedTypeNode(object)) object = object.type
    if (ts.isTypeQueryNode(object)) {
      let values = next.declarations.get(object.exprName.getText(next.source))
      while (values && (ts.isAsExpression(values) || ts.isParenthesizedExpression(values))) values = values.expression
      if (values && ts.isArrayLiteralExpression(values) && values.elements.every(ts.isStringLiteral))
        return values.elements.map((item) => JSON.stringify(item.text)).join(' | ')
    }
  }
  const value = alias.getText(next.source)
  // Expand scalar aliases; keep callbacks and object structures scenario-based.
  return /^(?:['"\w\s|.-]+)$/.test(value) ? sourceType(value, next, depth + 1) : type
}
export function sourceProps(filename, variable, seen = new Set()) {
  if (!fs.existsSync(filename) || seen.has(`${filename}:${variable}`)) return []
  seen.add(`${filename}:${variable}`)
  const context = sourceContext(filename)
  const { source, imports, declarations } = context
  const object = declarations.get(variable) ?? declarations.get('props')
  if (!object || !ts.isObjectLiteralExpression(object)) return []
  const result = new Map()
  for (const prop of object.properties) {
    if (ts.isSpreadAssignment(prop)) {
      const reference = prop.expression.getText(source)
      const imported = imports.get(reference)
      for (const field of imported ? sourceProps(...imported, seen) : sourceProps(filename, reference, seen))
        result.set(field.name, field)
      continue
    }
    if (!ts.isPropertyAssignment(prop)) continue
    const name = kebab(prop.name.text ?? prop.name.getText(source).replace(/['"]/g, ''))
    if (name.startsWith('on-')) continue
    const resolved = resolveSourceExpression(prop.initializer, context)
    let initializer = resolved.node
    let typeContext = resolved.context
    let defaultValue = 'undefined'
    if (ts.isObjectLiteralExpression(initializer)) {
      const defaultProp = sourceProperty(initializer, resolved.context, 'default')
      if (defaultProp) {
        const resolvedDefault = resolveSourceExpression(defaultProp.node, defaultProp.context)
        defaultValue = resolvedDefault.node.getText(resolvedDefault.context.source)
      }
      const typeProp = sourceProperty(initializer, resolved.context, 'type')
      if (typeProp) {
        initializer = typeProp.node
        typeContext = typeProp.context
      }
    }
    let type = initializer.getText(typeContext.source)
    const generic = /PropType<([\s\S]*)>/.exec(type)
    if (generic) type = generic[1].trim()
    else
      type =
        {
          Boolean: 'boolean',
          String: 'string',
          Number: 'number',
          Array: 'unknown[]',
          Object: 'object',
          Function: 'Function',
        }[type] ?? type
    type = sourceType(type, typeContext)
    if (/^\[(?:String|Number)(?:,\s*(?:String|Number))+\]$/.test(type)) type = 'string | number'
    if (type === 'boolean' && defaultValue === 'undefined' && !ts.isObjectLiteralExpression(resolved.node))
      defaultValue = 'false'
    const description =
      ts
        .getLeadingCommentRanges(source.text, prop.pos)
        ?.map((range) =>
          source.text
            .slice(range.pos, range.end)
            .replace(/\/\*\*?|\*\/|^\s*\* ?/gm, '')
            .trim(),
        )
        .join(' ') || '源码公开属性 / Public source prop'
    result.set(name, { name, type, defaultValue, description })
  }
  return [...result.values()]
}
function files(directory) {
  return fs.existsSync(directory)
    ? fs
        .readdirSync(directory, { withFileTypes: true })
        .flatMap((item) =>
          item.isDirectory() && !['en-US', 'locale'].includes(item.name)
            ? files(path.join(directory, item.name)).map((file) => `${item.name}/${file}`)
            : item.isFile() &&
                item.name.endsWith('.vue') &&
                !item.name.startsWith('api-review') &&
                item.name !== 'index.vue'
              ? [item.name]
              : [],
        )
    : []
}
function reviewPanelImport(filename) {
  if (path.basename(filename) === 'review-fixture.vue' && path.basename(path.dirname(filename)) === 'example')
    filename = path.join(path.dirname(filename), 'demos/api-review.vue')
  const wrapper = filename.startsWith(path.join(root, 'cedar-design-web'))
    ? path.join(root, 'cedar-design-web/packages/ui/docs/.vuepress/components/ApiReviewPanel.vue')
    : path.join(root, 'maple-design-mobile/packages/ui/docs/components/ApiReviewPanel.vue')
  return `import DemoApiReviewPanel from '${path.relative(path.dirname(filename), wrapper).split(path.sep).join('/')}'`
}
export function instrument(source, filename, componentTag, configPath, apiSlots = []) {
  const { descriptor, errors } = parse(source, { filename })
  if (errors.length || !descriptor.template || descriptor.template.src) return undefined
  // A second <script setup> would replace Options API setup(), losing its
  // returned state. Prefer an authored setup-script fixture instead.
  if (descriptor.script && !descriptor.scriptSetup && /\bsetup\s*\(/.test(descriptor.script.content)) return undefined
  const template = descriptor.template.content
  const ast = parseTemplate(template)
  const edits = []
  const slotNames = new Set()
  const slotDefaults = {}
  function visit(node) {
    if (node.type === 1 && componentTag.endsWith('-ripple')) {
      for (const directive of node.props.filter((prop) => prop.type === 7 && prop.name === 'ripple')) {
        if (directive.exp)
          edits.push({
            offset: directive.exp.loc.start.offset,
            end: directive.exp.loc.end.offset,
            content: `{ ...(${directive.exp.content}), ...__apiReview.bindings }`,
          })
        else
          edits.push({
            offset: directive.loc.end.offset,
            content: '="{ ...__apiReview.bindings }"',
          })
      }
    }
    if (
      node.type === 1 &&
      (kebab(node.tag) === componentTag ||
        (componentTag === 'c-icon-xxx' && /^(?:c-)?icon-/.test(kebab(node.tag))) ||
        (componentTag === 'c-field-decorator' && node.tag === 'FieldDecorator'))
    ) {
      // Append after authored bindings so enabled controls win, without replacing
      // the fixture's slots, children, handlers, model or data dependencies.
      const afterProps = Math.max(
        node.loc.start.offset + node.tag.length + 1,
        ...node.props.map((prop) => prop.loc.end.offset),
      )
      const closing = template.indexOf('>', afterProps)
      const opening = template.slice(node.loc.start.offset, closing + 1)
      if (opening) {
        const offset = node.loc.start.offset + opening.length - (opening.endsWith('/>') ? 2 : 1)
        const spread = node.props.find((prop) => prop.type === 7 && prop.name === 'bind' && !prop.arg && prop.exp)
        if (spread)
          edits.push({
            offset: spread.exp.loc.start.offset,
            end: spread.exp.loc.end.offset,
            content: `{ ...(${spread.exp.content}), ...__apiReview.bindings }`,
          })
        // Keep listeners after generated bindings, matching Vue attribute ordering,
        // while retaining the authored prop order and review override precedence.
        const listeners = node.props.filter((prop) => prop.type === 7 && prop.name === 'on')
        for (const listener of listeners) {
          edits.push({ offset: listener.loc.start.offset, end: listener.loc.end.offset, content: '' })
        }
        edits.push({
          offset,
          content:
            (spread ? '' : ' v-bind="__apiReview.bindings"') +
            listeners.map((listener) => ` ${listener.loc.source}`).join('') +
            ' v-on="__apiReview.listeners" ',
        })
        for (const child of node.children ?? []) {
          if (child.type !== 1 || child.tag !== 'template') continue
          const slot = child.props.find((prop) => prop.type === 7 && prop.name === 'slot' && prop.arg?.isStatic)
          if (!slot || child.props.some((prop) => prop.type === 7 && ['if', 'else', 'else-if'].includes(prop.name)))
            continue
          const name = slot.arg.content
          slotNames.add(name)
          slotDefaults[name] = true
          const after = Math.max(child.loc.start.offset + 9, ...child.props.map((prop) => prop.loc.end.offset))
          const slotOffset = child.loc.start.offset + '<template'.length
          edits.push({
            offset: slotOffset,
            content: ` v-if="__apiReview.slotEnabled[${JSON.stringify(name).replaceAll('\"', '&quot;')}] !== false" `,
          })
        }
        const simpleSlots = new Set([
          'icon',
          'prefix',
          'suffix',
          'header',
          'footer',
          'title',
          'description',
          'content',
          'action',
          'extra',
          'empty',
          'close-icon',
          'cover',
          'avatar',
          'loading',
        ])
        const authoredSlots = new Set(
          (node.children ?? []).flatMap(
            (child) =>
              child.props?.filter((prop) => prop.type === 7 && prop.name === 'slot').map((prop) => prop.arg?.content) ??
              [],
          ),
        )
        const additions = node.props.some((prop) => prop.type === 7 && prop.name === 'slot')
          ? []
          : apiSlots.filter(
              (slot) =>
                (slot.name !== 'default' ||
                  ([
                    'c-config-provider',
                    'c-people-select',
                    'c-progress',
                    'c-tree-select',
                    'mp-alert',
                    'mp-notice-bar',
                    'mp-result',
                  ].includes(componentTag) &&
                    !(node.children ?? []).some(
                      (child) =>
                        child.type !== 3 &&
                        (child.type !== 2 || child.content.trim()) &&
                        !(
                          child.type === 1 &&
                          child.tag === 'template' &&
                          child.props?.some((prop) => prop.type === 7 && prop.name === 'slot')
                        ),
                    ))) &&
                !authoredSlots.has(slot.name),
            )
        const templates = additions
          .map((slot) => {
            slotNames.add(slot.name)
            slotDefaults[slot.name] ??= false
            const content =
              slot.name === 'columns' && componentTag === 'c-table'
                ? '<c-table-column title="Review column" data-index="name"><template #cell="__reviewCell"><DemoReviewSlot name="cell" :context="__reviewCell" :controls="__apiReview.controls" :record="__apiReview.record" /></template></c-table-column>'
                : `<DemoReviewSlot name="${slot.name}" :context="__reviewSlot" :controls="__apiReview.controls" :record="__apiReview.record" />`
            return `<template v-if="__apiReview.slotEnabled['${slot.name}']" #${slot.name}="__reviewSlot">${content}</template>`
          })
          .join('\n')
        if (templates) {
          if (opening.endsWith('/>')) {
            const bindingEdit = edits.find((edit) => edit.offset === offset)
            bindingEdit.end = closing + 1
            bindingEdit.content += `>${templates}</${node.tag}>`
          } else
            edits.push({
              offset: template.lastIndexOf('</', node.loc.end.offset - 1),
              content: templates,
            })
        }
      }
    }
    for (const child of node.children ?? []) visit(child)
  }
  visit(ast)
  if (!edits.length) return undefined
  let transformed = template
  for (const edit of edits.sort((a, b) => b.offset - a.offset))
    transformed = transformed.slice(0, edit.offset) + edit.content + transformed.slice(edit.end ?? edit.offset)
  const relativePanel = path.relative(path.dirname(filename), panel).split(path.sep).join('/')
  const imports = `\n${reviewPanelImport(filename)}\nimport { defineReviewConfig, ReviewSlot as DemoReviewSlot } from '@sparknest/ui-doc-preview-vue'\nimport __apiReviewRawConfig from './${path.basename(configPath)}'\n`
  const wrapped = `\n<DemoApiReviewPanel v-slot="__apiReview" v-bind="defineReviewConfig(__apiReviewRawConfig)">\n${transformed}\n</DemoApiReviewPanel>\n`
  const replacements = [
    {
      start: descriptor.template.loc.start.offset,
      end: descriptor.template.loc.end.offset,
      value: wrapped,
    },
  ]
  if (descriptor.scriptSetup)
    replacements.push({
      start: descriptor.scriptSetup.loc.start.offset,
      end: descriptor.scriptSetup.loc.start.offset,
      value: imports,
    })
  for (const edit of replacements.sort((a, b) => b.start - a.start))
    source = source.slice(0, edit.start) + edit.value + source.slice(edit.end)
  if (!descriptor.scriptSetup) {
    // Vue's SFC parser omits an empty setup block from the descriptor.
    // Remove that empty block before inserting the generated imports.
    source = source.replace(/<script\b[^>]*\bsetup\b[^>]*>\s*<\/script>\s*/g, '')
  }
  if (!descriptor.scriptSetup)
    source = `<script setup${descriptor.script?.lang ? ` lang="${descriptor.script.lang}"` : ''}>${imports}</script>\n${source}`
  const parsed = parse(source, { filename })
  if (parsed.errors.length) throw new Error(`${filename}: ${parsed.errors}`)
  const script = compileScript(parsed.descriptor, { id: filename })
  const compiled = compileTemplate({
    source: parsed.descriptor.template.content,
    filename,
    id: filename,
    compilerOptions: { bindingMetadata: script.bindings },
  })
  if (compiled.errors.length) throw new Error(`${filename}: ${compiled.errors}`)
  return {
    source: `<!-- Generated by design-ui/bin/generate-review-demos.mjs; fixture: ${path.basename(filename)}. Edit the authored scenario, then regenerate. -->\n${source}`,
    instances: edits.length,
    slotNames: [...slotNames],
    slotDefaults,
  }
}
export async function formatReviewVue(source, filename) {
  const mapleRequire = createRequire(path.join(root, 'maple-design-mobile/package.json'))
  const prettier = mapleRequire('prettier')
  const parsed = parse(source, { filename })
  if (parsed.errors.length) throw new Error(`${filename}: ${parsed.errors.map((error) => error.message).join(', ')}`)
  const config = await prettier.resolveConfig(filename)
  return prettier.format(source, {
    ...config,
    plugins: (config?.plugins ?? []).map((plugin) =>
      typeof plugin === 'string' ? mapleRequire.resolve(plugin) : plugin,
    ),
    filepath: filename,
  })
}

export async function generate() {
  const reports = []
  const mapleFiles = []
  for (const platform of ['cedar', 'maple']) {
    const base = path.join(
      root,
      platform === 'cedar' ? 'cedar-design-web/packages/ui/src' : 'maple-design-mobile/packages/ui/src',
    )
    for (const component of [
      ...fs.readdirSync(base),
      ...(platform === 'cedar' ? ['date/picker', 'time/picker'] : []),
    ].sort()) {
      const directory = path.join(base, component)
      const doc = path.join(directory, platform === 'cedar' ? 'README.md' : 'docs/zh-CN.md')
      if (!fs.existsSync(doc)) continue
      const markdown = fs.readFileSync(doc, 'utf8')
      const api = readApi(markdown)
      const declared = sourceProps(path.join(directory, 'props.ts'), `${camel(component.replaceAll('/', '-'))}Props`)
      const undocumented = declared.filter((field) => !api.props.some((item) => item.name === field.name))
      api.props.push(...undocumented)
      // Runtime prop references may expose a concrete scalar type hidden behind
      // a documentation alias. Keep prose but use that resolved control type.
      for (const entry of api.props) {
        const declaration = declared.find((item) => item.name === entry.name)
        if (declaration) {
          entry.defaultValue = declaration.defaultValue
          if (
            makeField(declaration).kind === 'enum' ||
            (makeField(entry).kind === 'scenario' && makeField(declaration).kind !== 'scenario')
          )
            entry.type = declaration.type
        }
      }
      const demoDirectory = path.join(directory, platform === 'cedar' ? '__demos__' : 'example/demos')
      const candidates = [
        ...files(demoDirectory),
        ...(platform === 'maple'
          ? files(path.dirname(demoDirectory))
              .filter((file) => !file.startsWith('demos/'))
              .map((file) => `../${file}`)
          : []),
      ].sort((a, b) => {
        const rank = (name) =>
          path.basename(name) === 'review-fixture.vue'
            ? -1
            : /^(basic|basic-usage|base|default)\.vue$/i.test(path.basename(name))
              ? 0
              : 1
        return rank(a) - rank(b) || a.localeCompare(b)
      })
      const sources = candidates.map((name) => ({
        name,
        source: fs.readFileSync(path.join(demoDirectory, name), 'utf8'),
      }))
      const fields = api.props.map(makeField)
      const scenarios = [
        ...api.props.filter((_, i) => fields[i].kind === 'scenario').map((item) => ({ ...item, kind: 'prop' })),
        ...api.slots.map((item) => ({ ...item, kind: 'slot' })),
        ...api.methods.map((item) => ({ ...item, kind: 'method' })),
      ].map((item) => ({
        name: item.name,
        kind: item.kind,
        demos: sources
          .filter((demo) => demo.source.includes(item.name) || demo.source.includes(camel(item.name)))
          .map((demo) => demo.name),
      }))
      const events = api.events.map((item) =>
        item.name.startsWith('update:') ? `update:${camel(item.name.slice(7))}` : item.name,
      )
      for (const field of fields)
        if (['model-value', 'open', 'show', 'current', 'checked', 'expanded-keys', 'collapsed'].includes(field.name))
          events.push(`update:${camel(field.name)}`)
      const config = { fields, events: [...new Set(events)], scenarios }
      let generated
      let fixture
      for (const candidate of sources) {
        try {
          generated = instrument(
            candidate.source,
            path.join(demoDirectory, candidate.name),
            `${platform === 'cedar' ? 'c' : 'mp'}-${component.replaceAll('/', '-')}`,
            path.join(demoDirectory, 'api-review.config.json'),
            api.slots,
          )
        } catch (error) {
          throw new Error(`${platform}/${component}/${candidate.name}: ${error.message}`)
        }
        if (generated) {
          fixture = candidate.name
          break
        }
      }
      if (!generated && platform === 'maple' && ['hover', 'lazy'].includes(component)) {
        const field = (name, type, initial, description, options) => ({
          name,
          type,
          initial,
          description,
          defaultValue: String(initial),
          kind: options ? 'enum' : type,
          ...(options ? { options } : {}),
        })
        let preview
        if (component === 'hover') {
          fields.push(
            field('device', 'string', 'all', '指令参数：全部、桌面或移动 / Directive device argument', [
              'all',
              'desktop',
              'mobile',
            ]),
            field('enabled', 'boolean', true, '启用悬停样式 / Enable hover styles'),
            field('color', 'string', '#ffffff', '悬停文字色 / Hover text color'),
            field('background', 'string', '#5268cc', '悬停背景色 / Hover background'),
          )
          preview = `<mp-paper style="padding:32px;text-align:center" v-hover:[__apiReview.bindings.device]="__apiReview.bindings.enabled===false?{}:{color:__apiReview.bindings.color??'#ffffff',background:__apiReview.bindings.background??'#5268cc'}">鼠标移入、移出以验证 / Move pointer in and out</mp-paper>`
        } else {
          fields.push(
            field('src', 'string', '/cat.jpg', 'v-lazy 图片地址；可输入无效地址验证失败 / Image URL'),
            field('lazy-loading', 'string', '', '加载占位图片 / Loading placeholder'),
            field('lazy-error', 'string', '', '失败占位图片 / Error placeholder'),
            field('lazy-attempt', 'number', 3, '失败重试次数 / Retry attempts'),
          )
          preview = `<p>修改地址或加载选项后点击重新挂载；滚动图片进入可视区 / Remount after editing, then scroll the image into view.</p><div style="height:240px;overflow:auto"><div style="height:260px">向下滚动 / Scroll down</div><img v-lazy="__apiReview.bindings.src??'/cat.jpg'" :lazy-loading="__apiReview.bindings['lazy-loading']" :lazy-error="__apiReview.bindings['lazy-error']" :lazy-attempt="__apiReview.bindings['lazy-attempt']??3" alt="Lazy review" style="width:100%;height:180px;object-fit:cover" /></div>`
        }
        generated = {
          slotNames: [],
          source: `<script setup>\n${reviewPanelImport(path.join(demoDirectory, 'api-review.vue'))}\nimport { defineReviewConfig } from '@sparknest/ui-doc-preview-vue'\nimport __apiReviewRawConfig from './api-review.config.json'\n</script>\n<template><DemoApiReviewPanel v-slot="__apiReview" v-bind="defineReviewConfig(__apiReviewRawConfig)">${preview}</DemoApiReviewPanel></template>\n`,
        }
        fixture = 'directive-api.vue'
      }
      if (
        !generated &&
        ((platform === 'cedar' && component === 'notification') ||
          (platform === 'maple' && component === 'loading-bar'))
      ) {
        const service = component === 'notification' ? 'Notification' : 'LoadingBar'
        const library = platform === 'cedar' ? '@cedar-design/ui-vue' : '@maple-design/ui-vue'
        const actions =
          service === 'Notification' ? ['info', 'success', 'warning', 'error'] : ['start', 'finish', 'error']
        const prefix = platform === 'cedar' ? 'c' : 'mp'
        const buttons = actions
          .map(
            (action) =>
              `<${prefix}-button @click="run('${action}', __apiReview.bindings)">${action}</${prefix}-button>`,
          )
          .join('\n')
        const command =
          service === 'Notification'
            ? "Notification[action]({ title: '审查通知 / Review', content: '切换属性后再次触发通知 / Trigger again after changing controls', ...options })"
            : '(LoadingBar.setDefaultOptions(options), LoadingBar[action]())'
        generated = {
          slotNames: [],
          source: `<script setup>\n${reviewPanelImport(path.join(demoDirectory, 'api-review.vue'))}\nimport { onUnmounted } from 'vue'\nimport { ${service} } from '${library}'\nimport { defineReviewConfig } from '@sparknest/ui-doc-preview-vue'\nimport __apiReviewRawConfig from './api-review.config.json'\nfunction run(action, bindings) {\n const options = Object.fromEntries(Object.entries(bindings).filter(([key]) => !key.startsWith('onVnode')).map(([key, value]) => [key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), value]))\n ${command}\n}\n${service === 'LoadingBar' ? 'onUnmounted(() => { LoadingBar.finish(); LoadingBar.resetDefaultOptions() })' : ''}\n</script>\n<template>\n<DemoApiReviewPanel v-slot="__apiReview" v-bind="defineReviewConfig(__apiReviewRawConfig)">\n<p>修改选项后重新触发 / Trigger again to apply options.</p>\n<${platform === 'cedar' ? 'c' : 'mp'}-space wrap :size="12">${buttons}</${platform === 'cedar' ? 'c' : 'mp'}-space>\n</DemoApiReviewPanel>\n</template>\n`,
        }
        fixture = 'programmatic-api.vue'
      }
      const record = {
        platform,
        component,
        props: fields.length,
        undocumented: undocumented.map((field) => field.name),
        controls: fields.filter((field) => field.kind !== 'scenario').length,
        fixture: fixture ?? null,
        scenarios,
      }
      reports.push(record)
      if (!generated) continue
      config.slotNames = generated.slotNames
      config.slotDefaults = generated.slotDefaults ?? {}
      const reviewDirectory = fixture.endsWith('../review-fixture.vue')
        ? demoDirectory
        : path.dirname(path.join(demoDirectory, fixture))
      const reviewFile = path.join(reviewDirectory, 'api-review.vue')
      if (platform === 'maple') mapleFiles.push(reviewFile)
      fs.writeFileSync(reviewFile, await formatReviewVue(generated.source, reviewFile))
      fs.writeFileSync(path.join(reviewDirectory, 'api-review.config.json'), JSON.stringify(config, null, 2) + '\n')
      const block =
        platform === 'cedar'
          ? '\n### 功能调试\n\n<demo src="./__demos__/api-review.vue"></demo>\n\n'
          : `\n### 功能调试\n\n\`\`\`demo\n${path.relative(path.dirname(doc), reviewFile)}\n\`\`\`\n\n`
      const start = '<!-- api-review:start -->'
      const end = '<!-- api-review:end -->'
      if (publicReviewDemos)
        for (const docPath of [doc, ...(platform === 'maple' ? [path.join(directory, 'docs/en-US.md')] : [])]) {
          if (!fs.existsSync(docPath)) continue
          let text = fs
            .readFileSync(docPath, 'utf8')
            .replace(/\s*<!-- api-review:start -->[\s\S]*?<!-- api-review:end -->\s*/g, '\n\n')
          const insertion = `${start}${block}${end}\n`
          const heading = /^## API\s*$/m.exec(text)
          if (heading) text = text.slice(0, heading.index) + '\n\n' + insertion + text.slice(heading.index)
          else {
            const apiHeading = /^## API\s*$/m.exec(text)
            if (apiHeading) text = text.slice(0, apiHeading.index) + insertion + '\n' + text.slice(apiHeading.index)
            else text += '\n' + insertion
          }
          fs.writeFileSync(docPath, text)
        }
      if (platform === 'maple' && publicReviewDemos) {
        const indexPath = path.join(directory, 'example/index.vue')
        if (!fs.existsSync(indexPath)) {
          fs.writeFileSync(
            indexPath,
            `<script setup>\nimport DemoApiReview from './${path.relative(path.dirname(indexPath), reviewFile)}'\n</script>\n<template><section data-demo="api-review"><DemoApiReview /></section></template>\n`,
          )
          continue
        }
        let text = fs.readFileSync(indexPath, 'utf8')
        if (!text.includes("import DemoApiReview from '")) {
          const parsed = parse(text, { filename: indexPath }).descriptor
          if (parsed.scriptSetup) {
            const at = parsed.scriptSetup.loc.start.offset
            text =
              text.slice(0, at) +
              `\nimport DemoApiReview from './${path.relative(path.dirname(indexPath), reviewFile)}'\n` +
              text.slice(at)
            text = text.replace(
              /<\/template>\s*$/,
              '  <section data-demo="api-review"><DemoApiReview /></section>\n</template>',
            )
            fs.writeFileSync(indexPath, await formatReviewVue(text, indexPath))
          } else record.mobileEntry = 'needs-options-api-adapter'
        }
        fs.writeFileSync(indexPath, await formatReviewVue(text, indexPath))
      }
    }
  }
  const previousDirectory = process.cwd()
  process.chdir(path.join(root, 'maple-design-mobile'))
  try {
    const { ESLint } = createRequire(path.join(root, 'maple-design-mobile/package.json'))('eslint')
    const eslint = new ESLint({
      cwd: path.join(root, 'maple-design-mobile'),
      fix: true,
    })
    const lint = await eslint.lintFiles(mapleFiles)
    await ESLint.outputFixes(lint)
    const failures = lint.flatMap((result) =>
      result.messages
        .filter((message) => message.severity > 0)
        .map((message) => `${result.filePath}:${message.line}: ${message.message}`),
    )
    if (failures.length) throw new Error(failures.join('\n'))
  } finally {
    process.chdir(previousDirectory)
  }
  fs.writeFileSync(path.join(root, 'design-ui/audits/demo-api-review.json'), JSON.stringify(reports, null, 2) + '\n')
  for (const platform of ['cedar', 'maple']) {
    const subset = reports.filter((item) => item.platform === platform)
    console.log(
      `${platform}: ${subset.filter((item) => item.fixture).length}/${subset.length} component review demos; ${subset.reduce((sum, item) => sum + (item.fixture ? item.controls : 0), 0)} interactive controls`,
    )
    console.log(
      'Without fixtures:',
      subset
        .filter((item) => !item.fixture)
        .map((item) => item.component)
        .join(', '),
    )
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await generate()
