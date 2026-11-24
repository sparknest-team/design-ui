import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const workspace = new URL('../../', import.meta.url)
const require = createRequire(new URL('cedar-design-web/packages/ui/package.json', workspace))
const postcss = require('postcss')
const less = createRequire(new URL('maple-design-mobile/packages/cli/package.json', workspace))('less')
const maple = new URL('maple-design-mobile/packages/ui/src/', workspace)
async function compile(component) {
  const filename = fileURLToPath(new URL(component + '/style/index.less', maple))
  return postcss.parse((await less.render(readFileSync(filename, 'utf8'), { filename, javascriptEnabled: true })).css)
}
test('Maple Time keeps its overridable min-width in real compiled output', async () => {
  const css = await compile('time')
  const values = []
  css.walkRules('.mp-time-picker', (rule) => rule.walkDecls('min-width', (decl) => values.push(decl.value)))
  assert.ok(values.includes('min(100%, var(--mp-time-picker-min-width))'))
})
test('temporal defaults are internal, and the DateRange public alias reaches real summary styles', async () => {
  const css = await compile('date-range')
  const declarations = []
  // DateRange's TS style entry imports the private temporal-panel styles. Its
  // own Less entry intentionally does not embed another component's defaults.
  const shared = await compile('_components/temporal-panel')
  shared.walkDecls((decl) => declarations.push(decl))
  css.walkDecls((decl) => declarations.push(decl))
  assert.ok(declarations.some((decl) => decl.prop === '--mp-internal-temporal-panel-summary-active-color'))
  assert.ok(
    declarations.some(
      (decl) =>
        decl.prop === '--mp-date-range-picker-value-active-color' &&
        decl.value === 'var(--mp-internal-temporal-panel-summary-active-color)',
    ),
  )
  assert.ok(
    declarations.some(
      (decl) => decl.prop === 'color' && decl.value === 'var(--mp-date-range-picker-value-active-color)',
    ),
  )
  assert.equal(declarations.filter((decl) => decl.prop.startsWith('--mp-temporal-panel-')).length, 0)
  assert.equal(declarations.filter((decl) => decl.value.includes('--mp-temporal-panel-')).length, 0)
  for (const component of ['date', 'date-range', 'time', 'time-range'])
    for (const language of ['zh-CN', 'en-US'])
      assert.doesNotMatch(
        readFileSync(new URL(`${component}/docs/${language}.md`, maple), 'utf8'),
        /--mp-temporal-panel-/,
      )
})
test('every current declaration has CSS or reviewed runtime consumption', () => {
  const run = spawnSync(
    process.execPath,
    [fileURLToPath(new URL('./token-inventory.mjs', import.meta.url)), '--check-consumers'],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  )
  assert.equal(run.status, 0, run.stderr)
  const report = JSON.parse(run.stdout)
  assert.equal(report.totals.errors, 0)
  assert.equal(report.totals.needsManualReview, 0)
  const row = (name) => report.components.find((item) => item.platform === 'c' && item.component === name)
  assert.ok(row('switch').reviewedRuntimeReferences['--c-switch-shadow-color'])
  assert.ok(row('nav-menu').reviewedRuntimeReferences['--c-nav-menu-panel-width'])
  assert.deepEqual(row('table').reviewedRuntimeReferences['--c-table-empty-image-size'], ['table/table.tsx'])
  assert.deepEqual(row('table').tokens['--c-table-empty-image-size'].consumerProperties, [
    'font-size',
    'height',
    'width',
  ])
  assert.ok(
    row('_components/field-presentation').dynamicRuntimeReferences['--c-field-presentation-editor-action-width'],
  )
  const privatePicker = report.components.find(
    (item) => item.platform === 'mp' && item.component === '_components/picker-field',
  )
  assert.ok(Object.values(privatePicker.tokens).every((token) => token.visibility === 'internal'))
})

// Layout/NavMenu share theme-aware public appearance variables. Dark mode
// must not leave a second, unconsumed component-variable contract behind.
const obsoleteLayoutNavTokens = [
  '--c-layout-font-color-dark',
  '--c-layout-sider-background',
  '--c-layout-trigger-dark-color',
  '--c-nav-menu-dark-bg',
  '--c-nav-menu-dark-item-bg-hover',
  '--c-nav-menu-dark-item-bg-selected',
  '--c-nav-menu-dark-item-text-color',
  '--c-nav-menu-dark-item-text-color-disabled',
  '--c-nav-menu-dark-item-text-color-selected',
]
async function compileCedar(component) {
  const filename = fileURLToPath(new URL(`cedar-design-web/packages/ui/src/${component}/style/index.less`, workspace))
  return postcss.parse(
    (await require('less').render(readFileSync(filename, 'utf8'), { filename, javascriptEnabled: true })).css,
  )
}
function cssValues(css, selector, property) {
  const result = []
  css.walkRules((rule) => {
    if (rule.selectors.includes(selector)) rule.walkDecls(property, (decl) => result.push(decl.value))
  })
  return result
}
test('Layout shadow and theme-aware background reach the real Sider properties', async () => {
  const css = await compileCedar('layout')
  assert.ok(cssValues(css, '.c-layout-sider', 'box-shadow').includes('var(--c-layout-sider-light-box-shadow)'))
  assert.ok(cssValues(css, '.c-layout-sider', 'background').includes('var(--c-layout-sider-background-light)'))
  assert.ok(cssValues(css, '.c-layout-sider-trigger', 'color').includes('var(--c-layout-font-color)'))
})
test('NavMenu theme variables reach root, popup and interaction-state properties through their aliases', async () => {
  const { liveTokens } = await import('./token-consumer-graph.mjs')
  const css = await compileCedar('nav-menu')
  const declarations = []
  css.walkDecls((decl) => declarations.push(decl))
  const live = liveTokens(declarations)
  for (const suffix of [
    'bg',
    'item-bg-hover',
    'item-bg-selected',
    'item-text-color',
    'item-text-color-disabled',
    'item-text-color-selected',
  ])
    assert.ok(live.has('--c-nav-menu-light-' + suffix), suffix)
  assert.ok(cssValues(css, '.c-nav-menu__popup', 'background').includes('var(--c-nav-menu-current-bg)'))
  assert.ok(cssValues(css, '.c-nav-menu__item:hover', 'background').includes('var(--c-nav-menu-current-hover)'))
  assert.ok(
    cssValues(css, '.c-nav-menu__item.c-nav-menu--selected', 'color').includes('var(--c-nav-menu-current-selected)'),
  )
  assert.ok(
    cssValues(css, '.c-nav-menu__item.c-nav-menu--disabled', 'color').includes('var(--c-nav-menu-current-disabled)'),
  )
})
test('obsolete Layout/NavMenu dark variables cannot return in styles or public component tables', async () => {
  for (const component of ['layout', 'nav-menu']) {
    const css = await compileCedar(component)
    const compiled = css.toString()
    const directory = new URL(`cedar-design-web/packages/ui/src/${component}/`, workspace)
    const docs = ['README.md', 'README.en-US.md']
      .map((file) => readFileSync(new URL(file, directory), 'utf8'))
      .join('\n')
    for (const name of obsoleteLayoutNavTokens) {
      const pattern = new RegExp(name + '(?![a-z0-9-])')
      assert.doesNotMatch(compiled, pattern, name)
      assert.doesNotMatch(docs, pattern, name)
    }
  }
})
