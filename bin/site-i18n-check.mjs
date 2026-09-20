import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../', import.meta.url))
const req = createRequire(path.join(root, 'maple-design-mobile/package.json'))
const ts = req('typescript')
const uiRequire = createRequire(path.join(root, 'maple-design-mobile/packages/maple-ui/package.json'))
function evaluate(relative, overrides = {}) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8')
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = { exports: {} }
  new Function('require', 'module', 'exports', output)(name => overrides[name] ?? uiRequire(name), module, module.exports)
  return module.exports
}
const language = evaluate('maple-design-mobile/packages/maple-cli/src/client/language.ts')
assert.equal(language.normalizeLanguage('en-US'), 'en-US')
assert.equal(language.normalizeLanguage('invalid'), 'zh-CN')
assert.equal(language.getSavedLanguage('en-US'), 'en-US') // SSR / unavailable storage
const messages = language.createDemoMessages({ 'zh-CN': { title: '标题', fallback: '回退' }, 'en-US': { title: 'Title' } })
assert.equal(messages.t('title'), '标题')
messages.use('en-US')
assert.equal(messages.t('title'), 'Title')
assert.equal(messages.t('fallback'), '回退')
assert.equal(messages.t('missing'), 'missing')
messages.use('unknown')
assert.equal(messages.t('title'), '标题')
const nav = evaluate('cedar-design-web/packages/cedar-ui/docs/.vuepress/i18n/navigation.ts')
const source = [{ text: 'Button 按钮 [已同源]', link: '/components/button/', children: [{ text: '设计规范', link: 'https://example.com' }] }]
const en = nav.translateNavigation(source)
assert.equal(en[0].text, 'Button [Shared]')
assert.equal(en[0].link, '/en/components/button/')
assert.equal(en[0].children[0].link, 'https://example.com')
assert.equal(source[0].text, 'Button 按钮 [已同源]')
const cases = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/audits/same-source-demos.json')))
for (const [component, demos] of Object.entries(cases)) {
  const base = path.join(root, 'cedar-design-web/packages/cedar-ui/src', component)
  const english = fs.readFileSync(path.join(base, 'README.en-US.md'), 'utf8')
  assert(english.includes(`permalink: /en/components/${component}/`))
  assert(english.includes('lang: en-US'))
  for (const demo of demos) {
    assert(english.includes(`### ${demo.en}`), `${component}/${demo.name} English heading`)
    assert(english.includes(`<demo src="./__demos__/${demo.name}.vue">`))
  }
}
console.log('PASS site language normalization, SSR fallback, reactive demo messages, navigation mapping and 9 native English component pages')
const changes = []
const localeBridge = evaluate('cedar-design-web/packages/cedar-ui/docs/.vuepress/i18n/client.ts', {
  '../../../src/locale': { addI18nMessages: packs => assert.deepEqual(Object.keys(packs), ['zh-CN', 'en-US']), useLocale: lang => changes.push(lang) },
  '../../../src/locale/lang/en-us': { locale: 'en-US' },
  '../../../src/locale/lang/zh-cn': { locale: 'zh-CN' },
})
let onRoute
localeBridge.connectComponentLanguage({ currentRoute: { value: { path: '/en/components/button/', query: {} } }, afterEach: callback => { onRoute = callback } })
onRoute({ path: '/components/button/', query: {} })
onRoute({ path: '/demo-id', query: { language: 'en-US' } })
assert.deepEqual(changes, ['en-US', 'zh-CN', 'en-US'])
console.log('PASS component language bridge across document routes and standalone iframes')
