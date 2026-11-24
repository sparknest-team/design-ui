import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { auditThemes } from './theme-audit-utils.mjs'

// The platform entry points must keep the same resize layout logic.
const workspace = fileURLToPath(new URL('../../', import.meta.url))
const normalize = (source) =>
  source
    .replaceAll('--c-', '--mp-')
    .replaceAll('.c-', '.mp-')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\s+/g, '')
const cedar = readFileSync(`${workspace}cedar-design-web/packages/ui/src/textarea/style/desktop.less`, 'utf8')
const maple = readFileSync(`${workspace}maple-design-mobile/packages/ui/src/textarea/style/mobile.less`, 'utf8')
assert.equal(normalize(cedar), normalize(maple), 'Cedar and Maple resize styles share the same logic')

let checks = 0
await auditThemes(
  'textarea',
  ({ prefix: p, document, tag, variables, cascade, expand, repo, brand, mode }) => {
    const context = `${repo}/${brand}/${mode}`
    const root = document.createElement('div')
    root.className = `${p}-textarea`
    root.innerHTML = `<div class="${p}-field-decorator"><div class="${p}-field-decorator__middle"><textarea class="${p}-textarea__inner"></textarea></div></div>`
    tag.append(root)
    const field = root.querySelector(`.${p}-field-decorator`)
    const input = root.querySelector('textarea')
    const styles = cascade(input)
    const inset = expand(variables[`--${p}-field-padding-horizontal`])
    const textPadding = expand(variables[`--${p}-textarea-padding-horizontal`])
    assert.equal(expand(styles.width), `calc(100% + ${inset})`, `${context}: textarea reaches field edge`)
    assert.equal(expand(styles['margin-inline-end']), `calc(-1 * ${inset})`, `${context}: removes outer inset`)
    assert.equal(
      expand(styles['padding-inline-end']),
      `calc(${textPadding} + ${inset})`,
      `${context}: text retains its inset`,
    )
    const suffix = document.createElement('span')
    suffix.className = `${p}-field-decorator__suffix`
    field.append(suffix)
    assert.match(cascade(input).width, /100cqw/, `${context}: textarea extends past suffix`)
    assert.match(cascade(input)['padding-inline-end'], /100cqw - 100%/, `${context}: suffix space is reserved`)
    assert.equal(cascade(field)['container-type'], 'inline-size', `${context}: suffix width responds to layout`)
    assert.equal(cascade(suffix)['pointer-events'], 'none', `${context}: suffix wrapper does not block resize`)
    const button = document.createElement('button')
    suffix.append(button)
    assert.equal(cascade(button)['pointer-events'], 'auto', `${context}: suffix controls remain interactive`)
    checks += 8
  },
  { platforms: ['c'], tokenImports: ['field-decorator/style/token.less', 'textarea/style/desktop.less'] },
)
console.log(`Cedar textarea resize styles passed: ${checks} checks.`)
