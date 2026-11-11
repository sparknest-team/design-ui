import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { normalizeButtonSize, normalizeSwitchEditMode } from './same-source-demo-normalization.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(path.join(root, 'cedar-design-web/packages/ui/package.json'))
const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc')
const ts = require('typescript')
const kebab = name => name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
const sorted = names => [...names].sort()
function canonicalDemo(source, filename) {
  const { descriptor, errors } = parse(source, { filename })
  assert.deepEqual(errors, [], filename)
  if (descriptor.scriptSetup || descriptor.script) compileScript(descriptor, { id: filename })
  const template = descriptor.template
    ? compileTemplate({ source: descriptor.template.content, filename, id: filename }).code
        .replace(/\s+/g, '')
        .replace(/([":])\.(\d)/g, '$10.$2')
    : ''
  return template
}
function apiBlock(source) {
  const block = source.split('<!-- same-source-api:start -->\n')[1]?.split('<!-- same-source-api:end -->')[0]
  assert(block, 'Missing same-source API block')
  return block.trim()
}
function documentedNames(block, section) {
  const heading = new RegExp(`^### (?:[A-Za-z][\\w.-]* )?${section}\\r?$`, 'm').exec(block)
  const content = heading ? block.slice(heading.index + heading[0].length).split(/\n### /)[0] : undefined
  assert(content !== undefined, `Missing API section: ${section}`)
  return content.split('\n').filter(line => line.startsWith('|')).slice(2)
    .map(line => line.split('|')[1].replaceAll('`', '').trim())
}
function sourceApi(directory, component, filename) {
  const names = { Props: [], Events: [], Slots: [], Methods: [] }
  const propsFile = path.join(directory, 'props.ts')
  const program = ts.createProgram([propsFile], { target: ts.ScriptTarget.ESNext, moduleResolution: ts.ModuleResolutionKind.NodeJs, skipLibCheck: true })
  const checker = program.getTypeChecker()
  const props = program.getSourceFile(propsFile)
  const visitProps = node => {
    if (ts.isVariableDeclaration(node) && node.name.getText(props) === `${component}Props`) {
      assert(ts.isObjectLiteralExpression(node.initializer), `${component}: unsupported props declaration`)
      names.Props = checker.getPropertiesOfType(checker.getTypeAtLocation(node.name)).map(prop => kebab(prop.name))
    }
    ts.forEachChild(node, visitProps)
  }
  visitProps(props)
  assert(names.Props.length, `${component}: no props found`)
  // Listener-shaped declarations represent notification events, not ordinary
  // template attributes. Their return values do not create component tasks.
  const listenerProps = names.Props.filter(name => name.startsWith('on-'))
  names.Events = listenerProps.map(name => name.slice(3))
  names.Props = names.Props.filter(name => !listenerProps.includes(name))
  const { descriptor } = parse(fs.readFileSync(path.join(directory, filename), 'utf8'))
  const script = ts.createSourceFile(filename + '.ts', descriptor.scriptSetup.content, ts.ScriptTarget.Latest, true)
  const visitScript = node => {
    if (ts.isCallExpression(node) && node.expression.getText(script) === 'defineEmits') {
      const type = node.typeArguments?.[0]
      assert(type && ts.isTypeLiteralNode(type), `${component}: unsupported emits declaration`)
      names.Events = type.members.flatMap(member => {
        if (ts.isCallSignatureDeclaration(member)) {
          const event = member.parameters[0]?.type
          assert(event, `${component}: missing event type`)
          return (ts.isUnionTypeNode(event) ? event.types : [event]).map(value => {
            assert(ts.isLiteralTypeNode(value), `${component}: unsupported event overload`)
            return kebab(value.literal.text)
          })
        }
        assert(member.name, `${component}: unnamed event`)
        return kebab(member.name.text)
      })
    }
    if (ts.isCallExpression(node) && node.expression.getText(script) === 'defineExpose') {
      assert(ts.isObjectLiteralExpression(node.arguments[0]), `${component}: unsupported expose declaration`)
      names.Methods = node.arguments[0].properties.map(prop => prop.name.text)
    }
    ts.forEachChild(node, visitScript)
  }
  visitScript(script)
  names.Slots = [...new Set([...descriptor.template.content.matchAll(/<slot\b([^>]*)>/g)]
    .map(match => match[1].match(/\bname="([^"]+)"/)?.[1] ?? 'default'))]
  return names
}
const scenarios = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/audits/same-source-demos.json'), 'utf8'))
const mapleRequire = createRequire(path.join(root, 'maple-design-mobile/packages/cli/package.json'))
const { markdown } = await import(mapleRequire.resolve('@maple-design/vite-plugins-vue'))
let count = 0
for (const [component, cases] of Object.entries(scenarios)) {
  const cedar = path.join(root, 'cedar-design-web/packages/ui/src', component)
  const maple = path.join(root, 'maple-design-mobile/packages/ui/src', component)
  const readme = fs.readFileSync(path.join(cedar, 'README.md'), 'utf8')
  const example = fs.readFileSync(path.join(maple, 'example/index.vue'), 'utf8')
  const cedarApi = apiBlock(readme)
  const mapleApi = apiBlock(fs.readFileSync(path.join(maple, 'docs/zh-CN.md'), 'utf8'))
  const comparableCedarApi = component === 'switch' ? normalizeSwitchEditMode(cedarApi, 'cedar') : component === 'button' ? normalizeButtonSize(cedarApi, 'cedar') : cedarApi
  const comparableMapleApi = component === 'switch' ? normalizeSwitchEditMode(mapleApi, 'maple') : component === 'button' ? normalizeButtonSize(mapleApi, 'maple') : mapleApi
  assert.equal(comparableCedarApi, comparableMapleApi, `${component}: Chinese API documentation drift`)
  const englishApi = apiBlock(fs.readFileSync(path.join(maple, 'docs/en-US.md'), 'utf8'))
  const contract = sourceApi(cedar, component, `${component}.vue`)
  assert.deepEqual(sourceApi(maple, component, `${component[0].toUpperCase()}${component.slice(1)}.vue`), contract, `${component}: public API names drift`)
  for (const section of ['Props', 'Events', 'Slots', 'Methods']) {
    assert.deepEqual(sorted(documentedNames(cedarApi, section)), sorted(contract[section]), `${component}: Chinese ${section} coverage`)
    assert.deepEqual(sorted(documentedNames(englishApi, section)), sorted(contract[section]), `${component}: English ${section} coverage`)
  }
  assert.deepEqual([...readme.matchAll(/<demo src="\.\/__demos__\/([^"/]+)\.vue"/g)].map(m => m[1]), cases.map(c => c.name), `${component}: Cedar scenario order`)
  // Cross-component reference demos (e.g. FieldDecorator's control sizes) are
  // checked by their owning component, not duplicated in this component's manifest.
  const externalDemos = new Set([...fs.readFileSync(path.join(maple, 'docs/zh-CN.md'), 'utf8')
    .matchAll(/```demo\s*\n([^\n]+\.vue)\s*\n```/g)]
    .filter(m => !path.resolve(maple, 'docs', m[1].trim()).startsWith(path.join(maple, 'example/demos') + path.sep))
    .map(m => path.basename(m[1].trim(), '.vue')))
  assert.deepEqual([...example.matchAll(/data-demo="([^"]+)"/g)].map(m => m[1]).filter(name => !externalDemos.has(name)), cases.map(c => c.name), `${component}: Maple scenario order`)
  // Generated review scenarios have their own manifest and compiler gate.
  const authored = f => f.endsWith('.vue') && !/^api-review(?:-|\.)/.test(f)
  assert.deepEqual(fs.readdirSync(path.join(cedar, '__demos__')).filter(authored).sort(), cases.map(c => `${c.name}.vue`).sort(), `${component}: untracked Cedar demo`)
  assert.deepEqual(fs.readdirSync(path.join(maple, 'example/demos')).filter(authored).sort(), cases.map(c => `${c.name}.vue`).sort(), `${component}: untracked Maple demo`)
  // Maple reserves vue fences for preview imports, not complete example SFCs.
  // Validate the document after the real site transform, not only its snippets.
  for (const lang of ['zh-CN', 'en-US']) {
    const messages = JSON.parse(fs.readFileSync(path.join(maple, 'example/messages.json'), 'utf8'))
    assert(messages[lang], `${component}: missing ${lang} messages`)
    const filename = path.join(maple, 'docs', `${lang}.md`)
    const docs = fs.readFileSync(filename, 'utf8')
    const source = markdown({}).transform.call({
      addWatchFile() {},
      error(error) { throw error },
    }, docs, filename)
    const { descriptor, errors } = parse(source, { filename })
    assert.deepEqual(errors, [], filename)
    compileScript(descriptor, { id: filename })
    const template = compileTemplate({ source: descriptor.template.content, filename, id: filename })
    assert.deepEqual(template.errors, [], filename)
  }
  for (const item of cases) {
    const left = fs.readFileSync(path.join(cedar, '__demos__', `${item.name}.vue`), 'utf8')
    const right = fs.readFileSync(path.join(maple, 'example/demos', `${item.name}.vue`), 'utf8')
    // Compile both copies. Source formatting, attribute order and platform asset
    // URLs may differ; public API coverage and scenario order are gated above.
    canonicalDemo(left.replaceAll('c-', 'mp-'), `${component}-${item.name}-cedar.vue`)
    canonicalDemo(right, `${component}-${item.name}-maple.vue`)
    for (const lang of ['zh-CN', 'en-US']) {
      const docs = fs.readFileSync(path.join(maple, 'docs', `${lang}.md`), 'utf8')
      assert(
        docs.includes(`../example/demos/${item.name}.vue`) ||
          (lang === 'en-US' && docs.includes(`../example/demos/en-US/${item.name}.vue`)),
        `${component}/${item.name}: ${lang} demo reference drift`,
      )
      const locale = JSON.parse(fs.readFileSync(path.join(maple, 'example/messages.json'), 'utf8'))
      assert(locale[lang]?.[item.name], `${component}/${item.name}: missing locale`)
    }
    for (const [side, source] of [['cedar', left], ['maple', right]]) {
      const filename = `${side}/${component}/${item.name}.vue`
      const { descriptor, errors } = parse(source, { filename })
      assert.deepEqual(errors, [], filename)
      const script = descriptor.scriptSetup ? compileScript(descriptor, { id: filename }) : undefined
      const result = compileTemplate({ source: descriptor.template.content, filename, id: filename, compilerOptions: { bindingMetadata: script?.bindings } })
      assert.deepEqual(result.errors, [], filename)
    }
    count++
  }
}
console.log(`PASS ${count} paired demos: source, scenario order, bilingual snippets, locales, SFC compilation, ${Object.keys(scenarios).length * 2} site Markdown transforms and ${Object.keys(scenarios).length} complete public API tables`)
