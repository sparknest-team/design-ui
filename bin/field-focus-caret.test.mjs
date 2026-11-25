import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { renderCatalog } from './token-catalog.mjs'

const workspace = new URL('../../', import.meta.url)
const cedarRequire = createRequire(new URL('cedar-design-web/packages/ui/package.json', workspace))
const postcss = cedarRequire('postcss')
const scan = spawnSync(process.execPath, [fileURLToPath(new URL('./token-inventory.mjs', import.meta.url))], {
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
})
assert.equal(scan.status, 0, scan.stderr)
const report = JSON.parse(scan.stdout)
const section = (text) => text.split('## field-decorator\n\n')[1]?.split('\n## ')[0].trim()

for (const [repo, pkg, p] of [
  ['cedar-design-web', 'ui', 'c'],
  ['maple-design-mobile', 'ui', 'mp'],
]) {
  const root = new URL(repo + '/packages/' + pkg + '/', workspace)
  const less =
    p === 'c' ? cedarRequire('less') : createRequire(new URL(repo + '/packages/cli/package.json', workspace))('less')
  const compile = async (component) => {
    const entry = new URL('src/' + component + '/style/index.less', root)
    return postcss.parse(
      (
        await less.render(readFileSync(entry, 'utf8'), {
          filename: fileURLToPath(entry),
          javascriptEnabled: true,
        })
      ).css,
    )
  }
  const css = await compile('field-decorator')
  const declarations = (selector, property) => {
    const values = []
    css.walkRules((rule) => {
      if (rule.selectors.includes(selector)) rule.walkDecls(property, (decl) => values.push(decl.value))
    })
    return values
  }
  const block = '.' + p + '-field-decorator'
  test(p + ': variant focus routes remain, without an extra outer outline', () => {
    const expected = [
      [
        block + '--variant-outline:focus-within ' + block + '__border-state',
        'border-color',
        '--' + p + '-field-variant-outline-border-color-focus',
      ],
      [block + '--variant-filled:focus-within', 'background', '--' + p + '-field-variant-filled-background-focus'],
      [block + '--variant-standard:focus-within ' + block + '__border-state', 'transform', 'scaleX(1)'],
      [block + '__clear-btn:focus-visible', 'outline', '--' + p + '-field-focus-color'],
    ]
    for (const [selector, prop, value] of expected)
      assert.ok(
        declarations(selector, prop).some((item) => item.includes(value)),
        selector + '/' + prop,
      )
    css.walkDecls(/^outline(?:-offset)?$/, (decl) => {
      assert.ok(
        decl.parent.selectors.every((selector) => selector === block + '__clear-btn:focus-visible'),
        decl.parent.selector,
      )
      assert.notEqual(decl.prop, 'outline-offset')
    })
    assert.ok(declarations(block + block + '--disabled ' + block + '__border-state', 'opacity').includes('0'))
    assert.ok(
      declarations(
        block + block + '--variant-outline' + block + '--error ' + block + '__border-state',
        'border-color',
      ).some((value) => value.includes('--' + p + '-field-variant-outline-border-color-error')),
    )
  })

  test(p + ': actual Input/Textarea/InputNumber caret follows text, not field focus/error', async () => {
    for (const component of ['input', 'textarea', 'input-number']) {
      const leaf = await compile(component)
      const selector = '.' + p + '-' + component + (component === 'input-number' ? '__input' : '__inner')
      let found = false
      leaf.walkDecls('caret-color', (decl) => {
        assert.equal(decl.value, `var(--${p}-${component}-caret-color)`, component + '/' + decl.parent.selector)
        if (decl.parent.selectors.includes(selector)) found = true
      })
      assert.ok(found, component + ': real native-control class')
      const aliases = []
      leaf.walkDecls(`--${p}-${component}-caret-color`, (decl) => aliases.push(decl.value))
      assert.ok(aliases.includes(`var(--${p}-field-caret-color)`), component + ': shared caret alias')
      assert.ok(declarations(':root', `--${p}-field-caret-color`).includes('currentColor'), 'shared caret default')
      const entry = readFileSync(new URL('src/' + component + '/style/index.ts', root), 'utf8')
      if (!entry.includes('field-decorator/style')) {
        assert.match(entry, /import '\.\.\/\.\.\/input\/style'/)
        const inputEntry = readFileSync(new URL('src/input/style/index.ts', root), 'utf8')
        assert.match(inputEntry, /field-decorator\/style/)
      }
    }
  })

  test(p + ': outline offsets belong to actual focus-visible inner controls', async () => {
    for (const [component, selector] of [
      ['_components/selection-field', `.${p}-selection-field__tag-label--truncated:focus-visible`],
      ['input-number', `.${p}-input-number__step-button:focus-visible`],
    ]) {
      const actual = await compile(component)
      let found = false
      actual.walkRules(selector, (rule) =>
        rule.walkDecls('outline-offset', (decl) => {
          if (decl.value.includes('border-width')) found = true
        }),
      )
      assert.ok(found, component + ': focus-visible outline offset')
    }
  })

  test(p + ': field focus/error tokens have consumers without controlling the caret', () => {
    const row = report.components.find((row) => row.platform === p && row.component === 'field-decorator')
    for (const token of ['border-width', 'focus-color', 'error-color']) {
      const properties = row.tokens['--' + p + '-field-' + token].consumerProperties
      assert.ok(!properties.includes('caret-color'), token)
      // Global consumer data also includes legitimate inner :focus-visible controls.
      if (token === 'border-width') assert.ok(properties.includes('outline-offset'))
      assert.ok(properties.includes(token === 'error-color' ? 'color' : 'outline'), token)
    }
  })

  for (const [lang, path] of p === 'c'
    ? [['zh', 'docs/guide/design-token-reference.md']]
    : [
        ['zh', 'docs/designTokenReference.zh-CN.md'],
        ['en', 'docs/designTokenReference.en-US.md'],
      ]) {
    test(p + '/' + lang + ': generated FieldDecorator section matches current evidence', () => {
      const actual = readFileSync(new URL(path, root), 'utf8')
      assert.equal(section(actual), section(renderCatalog(report, p, lang)))
    })
  }
}
