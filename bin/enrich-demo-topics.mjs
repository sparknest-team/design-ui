import ts from 'typescript-js'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { enhanceConfigurationComparison } from './demo-config-comparison.mjs'
import { renderConfigurationField } from './demo-control-policy.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(path.join(root, 'cedar-design-web/packages/ui/package.json'))
const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc')
const { parse: parseDom } = require('@vue/compiler-dom')
const write = process.argv.includes('--write')
const owners = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/audits/demo-review-cases.json'), 'utf8'))
const generated = []

function identifiers(text) {
  const names = new Set()
  const source = ts.createSourceFile('demo.ts', text, ts.ScriptTarget.Latest, true)
  function visit(node) {
    if (ts.isIdentifier(node)) names.add(node.text)
    ts.forEachChild(node, visit)
  }
  visit(source)
  return names
}
function scriptFor(script, template) {
  if (!script) return ''
  const ast = ts.createSourceFile('demo.ts', script.content, ts.ScriptTarget.Latest, true)
  const units = ast.statements.flatMap((statement) =>
    ts.isVariableStatement(statement)
      ? statement.declarationList.declarations.map((node) => ({
          names: [...identifiers(node.name.getText(ast))],
          text: `${statement.declarationList.flags & ts.NodeFlags.Const ? 'const' : 'let'} ${node.getText(ast)}`,
        }))
      : !ts.isImportDeclaration(statement) && statement.name
        ? [{ names: [statement.name.text], text: statement.getText(ast) }]
        : [],
  )
  const needed = new Set(template.match(/\b[A-Za-z_$][\w$]*\b/g) ?? [])
  const selected = new Set()
  let changed = true
  while (changed) {
    changed = false
    for (const unit of units)
      if (!selected.has(unit) && unit.names.some((name) => needed.has(name))) {
        selected.add(unit)
        changed = true
        for (const name of identifiers(unit.text)) needed.add(name)
      }
  }
  const imports = ast.statements.filter(ts.isImportDeclaration).flatMap((statement) => {
    const clause = statement.importClause
    if (!clause) return [statement.getText(ast)]
    const names = []
    if (clause.name && needed.has(clause.name.text)) names.push(clause.name.text)
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      const values = clause.namedBindings.elements
        .filter((item) => needed.has(item.name.text))
        .map((item) => item.getText(ast))
      if (values.length) names.push(`{ ${values.join(', ')} }`)
    }
    return names.length
      ? [`import ${clause.isTypeOnly ? 'type ' : ''}${names.join(', ')} from ${statement.moduleSpecifier.getText(ast)}`]
      : []
  })
  return [...imports, ...units.filter((unit) => selected.has(unit)).map((unit) => unit.text)].join('\n')
}
function fixture(owner) {
  const directory = path.join(root, owner.directory)
  const canonicalDirectory = path.join(directory, owner.platform === 'cedar' ? '__demos__' : 'example/demos')
  const demoDirectory = fs.existsSync(canonicalDirectory)
    ? canonicalDirectory
    : path.dirname(path.join(root, owner.entry))
  const tag = `${owner.platform === 'cedar' ? 'c' : 'mp'}-${owner.component}`
  const controls = {
    input: ['示例内容', '', ''],
    textarea: ['这是一段可以编辑的多行内容。', '', ''],
    'input-number': [3, ':min="0" :max="10"', ''],
    select: [
      'design',
      ':options="options" clearable',
      '',
      [
        { label: '研发', value: 'dev' },
        { label: '设计', value: 'design' },
        { label: '运营', value: 'ops', disabled: true },
      ],
    ],
    'auto-complete': [
      '研发',
      ':options="options" clearable',
      '',
      [{ value: '研发' }, { value: '研发平台' }, { value: '设计' }],
    ],
    cascader: [
      'shanghai',
      ':options="options" clearable',
      '',
      [
        {
          label: '华东',
          value: 'east',
          children: [
            { label: '上海', value: 'shanghai' },
            { label: '杭州', value: 'hangzhou' },
          ],
        },
      ],
    ],
    date: ['2026-10-23', 'value-format="YYYY-MM-DD"', ''],
    'date-range': [['2026-10-23', '2026-10-25'], 'value-format="YYYY-MM-DD"', ''],
    time: ['09:30', 'format="HH:mm"', ''],
    'time-range': [['09:30', '18:00'], 'format="HH:mm"', ''],
    'verification-code': ['123456', ':length="6"', ''],
    checkbox: [false, '', '同意条款'],
    radio: ['design', 'value="design"', '设计'],
    switch: [false, '', ''],
    rate: [3, '', ''],
    slider: [30, '', ''],
    upload: [[], ':auto-upload="false"', ''],
  }
  if (controls[owner.component]) {
    const [initial, attributes, content, options] = controls[owner.component]
    const source = `<script setup>\nimport { ref } from 'vue'\nconst value = ref(${JSON.stringify(initial)})\n${options ? `const options = ${JSON.stringify(options)}` : ''}\n</script>\n<template><${tag} v-model="value" ${attributes}>${content}</${tag}></template>`
    const { descriptor } = parse(source)
    const node = parseDom(descriptor.template.content).children[0]
    return {
      source: node.loc.source,
      offset: node.props.at(-1).loc.end.offset - node.loc.start.offset,
      descriptor,
      file: path.join(demoDirectory, 'basic.vue'),
    }
  }
  const choices = []
  const searchDirectories = [...new Set([demoDirectory, path.dirname(path.join(root, owner.entry))])]
  for (const file of searchDirectories.flatMap((directory) =>
    fs
      .readdirSync(directory)
      .filter((file) => file.endsWith('.vue') && !/api-review|review-|lifecycle|-lab|workbench|race/.test(file))
      .map((file) => path.join(directory, file)),
  )) {
    const source = fs.readFileSync(file, 'utf8')
    if (source.split('\n').length > 160) continue
    const { descriptor, errors } = parse(source, { filename: file })
    if (errors.length || (descriptor.script && !descriptor.scriptSetup)) continue
    if (!descriptor.template) continue
    function visit(node, scoped = false) {
      if (node.type === 1) {
        const ownScope = node.props.some(
          (prop) => prop.type === 7 && ['for', 'if', 'else', 'else-if', 'slot'].includes(prop.name),
        )
        if (!scoped && !ownScope && node.tag === tag && node.loc.source.length < 3500) {
          const start = node.props.at(-1)?.loc.end.offset ?? node.loc.start.offset + node.tag.length + 1
          choices.push({
            source: node.loc.source,
            offset: start - node.loc.start.offset,
            descriptor,
            file,
            score: node.loc.source.length + (descriptor.scriptSetup?.content.length ?? 0) / 2,
          })
        }
        for (const child of node.children) visit(child, scoped || ownScope)
      } else for (const child of node.children ?? []) visit(child, scoped)
    }
    visit(parseDom(descriptor.template.content))
  }
  return choices.sort((a, b) => a.score - b.score)[0]
}
function save(file, source) {
  if (write) fs.writeFileSync(file, source)
}
for (const component of [...new Set(owners.map((owner) => owner.component))]) {
  if (component.includes('/') || component === 'button') continue
  const pair = ['cedar', 'maple'].map((platform) =>
    owners.find((owner) => owner.platform === platform && owner.component === component),
  )
  if (pair.some((owner) => !owner)) continue
  const configs = pair.map((owner) =>
    JSON.parse(
      fs.readFileSync(
        path.join(root, owner.directory, owner.cases.find((item) => item.name === 'main').config),
        'utf8',
      ),
    ),
  )
  const appearances = ['variant', 'status', 'size'].flatMap((name) => {
    const fields = configs.map((config) => config.fields.find((field) => field.name === name && field.kind === 'enum'))
    if (fields.some((field) => !field)) return []
    const options = fields[0].options.filter((value) => fields[1].options.includes(value))
    return options.length > 1
      ? [
          {
            name,
            options,
            initial: options.includes('md') ? 'md' : options.includes('default') ? 'default' : options[0],
          },
        ]
      : []
  })
  const layouts = ['orientation', 'direction', 'align', 'justify']
    .flatMap((name) => {
      const fields = configs.map((config) =>
        config.fields.find((field) => field.name === name && field.kind === 'enum'),
      )
      if (fields.some((field) => !field)) return []
      const options = fields[0].options.filter((value) => fields[1].options.includes(value))
      return options.length > 1 ? [{ name, options, initial: options[0] }] : []
    })
    .slice(0, 3)
  const states = ['disabled', 'readonly', 'error'].filter((name) =>
    configs.every((config) => config.fields.some((field) => field.name === name && field.kind === 'boolean')),
  )
  const fixtures = pair.map(fixture)
  if (fixtures.some((item) => !item)) continue
  for (const [name, fields, zh, en, explanation, english] of [
    [
      'appearance-lab',
      appearances,
      '外观组合',
      'Appearance combinations',
      '组合调整外观，观察同一内容在不同配置下的表现。每次最多调整变体、状态色和尺寸三个维度。',
      'Combine at most three appearance dimensions: variant, semantic color and size. Compare the same content as you change each setting.',
    ],
    [
      'state-lab',
      states.map((name) => ({ name })),
      '交互状态切换',
      'Interaction states',
      '切换状态后操作控件，观察可编辑性、只读展示和错误反馈。控制区始终可用，便于恢复。',
      'Change the state and interact with the component. Compare editing, read-only display and error feedback; the controls remain available to restore the example.',
    ],
    [
      'layout-lab',
      layouts,
      '布局与对齐',
      'Layout and alignment',
      '切换排列方向和对齐方式，对比内容如何分配可用空间。适合在不同宽度的页面中选择布局。',
      'Change direction and alignment to compare how content uses the available space, then choose a layout for your container.',
    ],
  ]) {
    if (fields.length < 2) continue
    const sources = []
    for (let index = 0; index < pair.length; index++) {
      const owner = pair[index],
        seed = fixtures[index],
        prefix = index ? 'mp' : 'c'
      const directory = path.join(root, owner.directory, owner.platform === 'cedar' ? '__demos__' : 'example/demos')
      const file = path.join(directory, `${name}.vue`)
      const prop =
        name === 'appearance-lab' ? '__demoAppearance' : name === 'layout-lab' ? '__demoLayout' : '__demoState'
      let seedSource = seed.source
      const rootNode = parseDom(seedSource).children[0]
      for (const attribute of [...rootNode.props].reverse()) {
        const name =
          attribute.type === 6 ? attribute.name : attribute.name === 'bind' ? attribute.arg?.content : undefined
        if (fields.some((field) => field.name === name))
          seedSource = seedSource.slice(0, attribute.loc.start.offset) + seedSource.slice(attribute.loc.end.offset)
      }
      const cleanNode = parseDom(seedSource).children[0]
      const offset = cleanNode.props.at(-1)?.loc.end.offset ?? cleanNode.tag.length + 1
      const target = (seedSource.slice(0, offset) + ` v-bind="${prop}"` + seedSource.slice(offset)).replace(
        /\s+(?:disabled|readonly|error)(?=[\s/>])/g,
        '',
      )
      const selectors = fields
        .map((field) => renderConfigurationField(prefix, field, `${prop}['${field.name}']`))
        .join('\n')
      const template = `<${prefix}-space direction="column" :size="16">\n<${prefix}-form layout="vertical">\n${selectors}\n</${prefix}-form>\n${target}\n</${prefix}-space>`
      const originalScript = scriptFor(seed.descriptor.scriptSetup, target).replace(
        /from (['"])(\.[^'"]+)\1/g,
        (_, quote, relative) =>
          `from ${quote}${path.relative(directory, path.resolve(path.dirname(seed.file), relative)).replace(/^(?!\.)/, './')}${quote}`,
      )
      const values = Object.fromEntries(fields.map((field) => [field.name, field.initial ?? false]))
      const styles = seed.descriptor.styles
        .map((style) => `<style scoped${style.lang ? ` lang="${style.lang}"` : ''}>${style.content}</style>`)
        .join('\n')
      let source = `<script setup${seed.descriptor.scriptSetup?.lang ? ` lang="${seed.descriptor.scriptSetup.lang}"` : ''}>\nimport { reactive as __demoReactive } from 'vue'\n${originalScript}\nconst ${prop} = __demoReactive(${JSON.stringify(values)})\n</script>\n<template>\n${template}\n</template>\n${styles}\n`
      if (name === 'appearance-lab') source = enhanceConfigurationComparison(source)
      const { descriptor, errors } = parse(source, { filename: file })
      if (errors.length) throw errors
      const compiled = compileScript(descriptor, { id: file })
      const result = compileTemplate({
        source: descriptor.template.content,
        filename: file,
        id: file,
        compilerOptions: { bindingMetadata: compiled.bindings },
      })
      if (result.errors.length) throw result.errors
      sources.push({ file, source })
    }
    for (let index = 0; index < pair.length; index++) {
      const owner = pair[index]
      if (write) fs.mkdirSync(path.dirname(sources[index].file), { recursive: true })
      save(sources[index].file, sources[index].source)
      for (const lang of owner.platform === 'cedar' ? ['zh-CN'] : ['zh-CN', 'en-US']) {
        const docFile = path.join(root, owner.directory, owner.platform === 'cedar' ? 'README.md' : `docs/${lang}.md`)
        if (!fs.existsSync(docFile)) continue
        let doc = fs.readFileSync(docFile, 'utf8')
        const labels = {
          variant: ['变体', 'variant'],
          status: ['状态', 'status'],
          size: ['尺寸', 'size'],
          disabled: ['禁用', 'disabled'],
          readonly: ['只读', 'read-only'],
          error: ['错误反馈', 'error feedback'],
          orientation: ['方向', 'orientation'],
          direction: ['排列方向', 'direction'],
          align: ['交叉轴对齐', 'cross-axis alignment'],
          justify: ['主轴分配', 'main-axis distribution'],
        }
        const dimensions = fields
          .map((field) => labels[field.name]?.[lang === 'en-US' ? 1 : 0] ?? field.name)
          .join(lang === 'en-US' ? ', ' : '、')
        const useCases = {
          input: ['表单中的单行文本输入', 'single-line form inputs'],
          textarea: ['备注、说明等多行输入', 'notes and multi-line descriptions'],
          'input-number': ['数量、配额等数值输入', 'quantities and numeric limits'],
          select: ['选项数据明确的单选输入', 'single selection from a known list'],
          'auto-complete': ['允许自由输入的候选提示', 'suggestions while allowing free text'],
          cascader: ['地区等层级选项', 'hierarchical choices such as regions'],
          checkbox: ['协议确认和独立勾选', 'agreement and independent checks'],
          radio: ['互斥选项', 'mutually exclusive choices'],
          switch: ['即时生效的开关设置', 'settings that take effect immediately'],
          date: ['选择单个日期', 'selecting a date'],
          'date-range': ['预订或查询的起止日期', 'booking and query date ranges'],
          time: ['选择时间点', 'selecting a time'],
          'time-range': ['营业时段等时间范围', 'time ranges such as opening hours'],
          rate: ['评分反馈', 'rating feedback'],
          slider: ['连续区间内的数值调整', 'adjusting values within a continuous range'],
          upload: ['附件列表展示与本地选取', 'attachment lists and local file selection'],
          form: ['整张表单的状态继承', 'state inherited by form controls'],
          alert: ['提示信息的强调程度', 'the emphasis of informational messages'],
          badge: ['通知数量和标记', 'notification counts and markers'],
          card: ['信息分组和内容层次', 'content grouping and visual hierarchy'],
          tabs: ['同级内容之间的切换', 'switching between peer content panels'],
          tag: ['短标签与分类标记', 'short labels and category markers'],
          steps: ['多步骤流程的当前状态', 'the current state of a multi-step flow'],
          tooltip: ['悬浮时的补充说明', 'supplementary descriptions on hover'],
          message: ['操作结果的即时反馈', 'immediate feedback after an action'],
          'verification-code': ['分格验证码输入', 'segmented verification-code input'],
          search: ['关键词输入与搜索提交', 'keyword input and search submission'],
          'split-button': ['主操作和附加菜单', 'a primary action and secondary menu'],
        }
        const useCase = useCases[component]?.[lang === 'en-US' ? 1 : 0] ?? component
        const detail =
          lang === 'en-US'
            ? `Use this example for ${useCase}. Adjust ${dimensions} and compare the component with the same data. ${name === 'state-lab' ? 'The controls remain available to restore editing; error appearance alone does not run validation.' : 'Keep the content unchanged while comparing the available settings.'}`
            : `适用于${useCase}。调整${dimensions}，用相同数据观察变化。${name === 'state-lab' ? '控制区始终可用，可以随时恢复编辑；错误外观本身不会触发表单校验。' : '内容保持一致，便于比较不同设置的实际效果。'}`
        const block =
          `### ${lang === 'en-US' ? en : zh}\n\n${detail}\n\n` +
          (owner.platform === 'cedar'
            ? `<demo src="./__demos__/${name}.vue"></demo>`
            : `\x60\x60\x60demo\n../example/demos/${name}.vue\n\x60\x60\x60`) +
          '\n\n'
        const reference = `/${name}.vue`
        if (doc.includes(reference)) {
          const index = doc.indexOf(reference)
          const start = [...doc.slice(0, index).matchAll(/^### /gm)].at(-1)?.index
          const next = /^#{1,3} |<!-- api-review:start -->/m.exec(doc.slice(index + reference.length))
          if (start !== undefined)
            save(docFile, doc.slice(0, start) + block + (next ? doc.slice(index + reference.length + next.index) : ''))
          continue
        }
        const anchor = doc.indexOf('<!-- api-review:start -->')
        if (anchor < 0) throw new Error(`${docFile}: missing example boundary`)
        doc = doc.slice(0, anchor) + block + doc.slice(anchor)
        save(docFile, doc)
      }
    }
    generated.push({
      component,
      name,
      dimensions: fields.map((field) => field.name),
      fixtures: fixtures.map((seed) => path.relative(root, seed.file)),
    })
  }
}
console.log(JSON.stringify({ pairs: generated.length, demos: generated.length * 2, generated }, null, 2))
if (write)
  fs.writeFileSync(
    path.join(root, 'design-ui/audits/demo-enrichment-2026-10-23.json'),
    JSON.stringify(generated, null, 2) + '\n',
  )
