// Verify option gutters and semantic primary roles in both theme families.
import assert from 'node:assert/strict'
import { auditThemes } from './theme-audit-utils.mjs'

let checks = 0
await auditThemes('select', ({ prefix, document, tag, variables, cascade, expand, repo, brand, mode }) => {
  const context = `${repo}/${brand}/${mode}`
  const wrapper = document.createElement('div')
  wrapper.className = `${prefix}-select-dropdown-list-wrapper`
  const dropdown = document.createElement('div')
  dropdown.className = `${prefix}-select-dropdown`
  dropdown.append(wrapper)
  tag.append(dropdown)
  const option = document.createElement('div')
  option.className = `${prefix}-select-option`
  dropdown.append(option)
  const vertical = expand(variables[`--${prefix}-select-popup-padding-vertical`])
  assert.notEqual(vertical, '0', `${context}: option list needs vertical breathing room`)
  assert.equal(expand(cascade(dropdown).padding), `${vertical} 0`, `${context}: popup vertical padding`)
  dropdown.classList.add(`${prefix}-select-dropdown-has-header`, `${prefix}-select-dropdown-has-footer`)
  assert.equal(expand(cascade(wrapper)['padding-block-start']), vertical, `${context}: space below header`)
  assert.equal(expand(cascade(wrapper)['padding-block-end']), vertical, `${context}: space above footer`)
  const editor = document.createElement('div')
  editor.className = `${prefix}-selection-editor ${prefix}-selection-editor--select`
  tag.append(editor)
  dropdown.className = `${prefix}-select-dropdown`
  editor.append(dropdown)
  assert.equal(expand(cascade(dropdown).padding), `${vertical} 0`, `${context}: editor vertical padding`)
  checks += 5
  assert.equal(expand(cascade(wrapper)['padding-inline']), '0', `${context}: no outer option gutter`)
  assert.notEqual(expand(variables[`--${prefix}-select-popup-option-padding-horizontal`]), '0', `${context}: option text retains padding`)
  variables[`--${prefix}-sys-color-action-primary`] = 'rgb(12, 34, 56)'
  assert.equal(expand(variables[`--${prefix}-select-popup-option-text-color-selected`]), 'rgb(12, 34, 56)', `${context}: selected color follows primary button`)
  checks += 3
}, { importsAfter: ['_components/selected-options'] })

// The mobile popup panel has its own horizontal inset, outside the dropdown.
await auditThemes('select', ({ prefix: p, document, tag, cascade, expand }) => {
  const popup = document.createElement('div')
  popup.className = `${p}-popup`
  popup.innerHTML = `<div class="${p}-field-presentation__panel"><div class="${p}-field-presentation__body"><div class="${p}-selection-editor ${p}-selection-editor--mobile ${p}-selection-editor--select"></div></div></div>`
  tag.append(popup)
  const panel = popup.querySelector(`.${p}-field-presentation__panel`)
  const body = popup.querySelector(`.${p}-field-presentation__body`)
  assert.equal(expand(cascade(body)['margin-inline']), 'calc(-1 * 8px)', 'Mobile selection body removes panel gutter')
  assert.match(cascade(panel)['padding-left'], /safe-area-left/, 'Left safe area remains on panel')
  assert.match(cascade(panel)['padding-right'], /safe-area-right/, 'Right safe area remains on panel')
  body.firstElementChild.remove()
  assert.equal(cascade(body)['margin-inline'], undefined, 'Other field editors keep panel gutter')
  checks += 4
}, { platforms: ['mp'], tokenImports: ['_components/field-presentation/style.less'] })

await auditThemes('cascader', ({ prefix: p, document, tag, variables, cascade, expand, repo, brand, mode }) => {
  const context = `${repo}/${brand}/${mode}/cascader`
  const wrapper = document.createElement('div')
  wrapper.className = `${p}-cascader-list-wrapper ${p}-cascader-list-wrapper-with-footer`
  wrapper.innerHTML = `<ul class="${p}-cascader-list"></ul>`
  tag.append(wrapper)
  const vertical = expand(variables[`--${p}-cascader-popup-padding-vertical`])
  assert.notEqual(vertical, '0', `${context}: vertical spacing`)
  assert.equal(expand(cascade(wrapper).padding), `${vertical} 0`, `${context}: wrapper padding`)
  assert.equal(expand(cascade(wrapper.firstElementChild)['padding-block-end']), vertical, `${context}: space above footer`)
  checks += 3
}, { importsAfter: ['_components/selected-options'] })

await auditThemes('tree-select', ({ prefix: p, document, tag, variables, cascade, expand, repo, brand, mode }) => {
  const context = `${repo}/${brand}/${mode}/tree-select`
  const popup = document.createElement('div')
  popup.className = `${p}-tree-select-popup ${p}-tree-select-has-header ${p}-tree-select-has-footer`
  popup.innerHTML = `<div class="${p}-tree-select-tree-wrapper"></div>`
  tag.append(popup)
  const wrapper = popup.firstElementChild
  const vertical = expand(variables[`--${p}-tree-select-popup-padding-vertical`])
  assert.notEqual(vertical, '0', `${context}: vertical spacing`)
  assert.equal(expand(cascade(wrapper)['padding-block-start']), vertical, `${context}: space below header`)
  assert.equal(expand(cascade(wrapper)['padding-block-end']), vertical, `${context}: space above footer`)
  checks += 3
}, { platforms: ['c'], tokenImports: ['select/style/index.less'] })

for (const [component, platforms, tokens] of [
  ['calendar', ['c'], ['cell-today-border-color']],
  ['table', ['c'], ['resizing-border-color']],
  ['date', ['mp'], ['input-trigger-outline-color', 'picker-range-preview-outline']],
  ['picker', ['mp'], ['option-check-color']],
  ['loading-bar', ['mp'], ['color']],
  ['loading', ['mp'], ['color']],
]) {
  await auditThemes('select', ({ prefix, variables, expand, repo, brand, mode }) => {
    variables[`--${prefix}-sys-color-action-primary`] = 'rgb(12, 34, 56)'
    for (const token of tokens) {
      assert.ok(expand(variables[`--${prefix}-${component}-${token}`]).includes('rgb(12, 34, 56)'), `${repo}/${brand}/${mode}: ${component}-${token} follows the primary action token`)
      checks++
    }
  }, { platforms, tokenImports: [`${component}/style/token.less`] })
}
console.log(`Selection spacing and primary roles passed: ${checks} theme checks.`)
