import assert from 'node:assert/strict'
import { auditThemes } from './theme-audit-utils.mjs'

let checks = 0
await auditThemes('checkbox', ({ prefix: p, brand, variables, expand }) => {
  if (brand === 'default') {
    assert.equal(expand(variables[`--${p}-checkbox-mark-color`]), expand(variables[`--${p}-sys-color-content-on-dark`]), 'Default checkbox mark uses the white foreground role')
    checks++
  }
}, { platforms: ['mp'], pointerMode: 'fine' })

await auditThemes('textarea', ({ prefix: p, document, tag, variables, cascade, expand }) => {
  const root = document.createElement('div')
  root.className = `${p}-textarea`
  root.innerHTML = `<div class="${p}-field-decorator"><div class="${p}-field-decorator__middle"><textarea class="${p}-textarea__inner"></textarea></div></div><div class="${p}-textarea__word-limit">0/30</div>`
  tag.append(root)
  const field = root.querySelector(`.${p}-field-decorator`)
  const input = root.querySelector('textarea')
  const counter = root.querySelector(`.${p}-textarea__word-limit`)
  assert.equal(expand(variables[`--${p}-textarea-padding-vertical`]), expand(variables[`--${p}-field-content-padding-vertical`]), 'Multiline vertical padding follows field spacing')
  assert.equal(expand(cascade(input)['margin-inline-end']), 'calc(-1 * 16px)', 'Native resize edge extends to the field boundary')
  assert.equal(expand(cascade(input)['padding-inline-end']), 'calc(0px + 16px)', 'Text keeps its horizontal inset')
  assert.equal(cascade(counter)['text-align'], 'end', 'Counter stays aligned to the logical end')
  const suffix = document.createElement('span')
  suffix.className = `${p}-field-decorator__suffix`
  field.append(suffix)
  assert.match(cascade(input).width, /100cqw/, 'Textarea extends past the suffix')
  assert.match(cascade(input)['padding-inline-end'], /100cqw - 100%/, 'Suffix space is reserved for text')
  assert.equal(cascade(field)['container-type'], 'inline-size', 'Suffix width responds to layout')
  assert.equal(cascade(suffix)['pointer-events'], 'none', 'Suffix wrapper does not block resize')
  const button = document.createElement('button')
  suffix.append(button)
  assert.equal(cascade(button)['pointer-events'], 'auto', 'Suffix controls remain interactive')
  checks += 9
}, { platforms: ['mp'], pointerMode: 'fine', tokenImports: ['field-decorator/style/token.less', 'textarea/style/mobile.less'] })
console.log(`Maple field details passed: ${checks} theme/layout checks.`)
