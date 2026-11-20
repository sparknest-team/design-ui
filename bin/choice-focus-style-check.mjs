import assert from 'node:assert/strict'
import { auditThemes } from './theme-audit-utils.mjs'

let checked = 0
for (const component of ['checkbox', 'radio']) {
  await auditThemes(component, ({ prefix: p, document, tag, cascade, expand, variables }) => {
    for (const selected of [false, true]) {
      const root = document.createElement('label')
      root.className = `${p}-${component}${selected ? ` ${p}-${component}--checked` : ''}`
      const input = `<input class="${p}-${component}__input audit-focus-visible">`
      const iconMarkup = `<span class="${p}-${component}__icon"></span>`
      root.innerHTML = component === 'checkbox'
        ? `<span class="${p}-checkbox__control">${input}<span class="${p}-checkbox__visual">${iconMarkup}</span></span>`
        : `${input}<span class="${p}-radio__control">${iconMarkup}</span>`
      tag.append(root)
      const control = root.querySelector(`.${p}-${component}__control`)
      const icon = root.querySelector(`.${p}-${component}__icon`)
      assert.equal(cascade(control).outline, undefined, `${p}/${component}: no outer ring`)
      assert.equal(expand(cascade(icon)['box-shadow']), `inset 0 0 0 ${expand(variables[`--${p}-internal-${component}-focus-width`])} ${expand(variables[`--${p}-sys-color-content-primary`])}`, `${p}/${component}: keyboard focus is visible on the icon`)
      root.remove()
      checked++
    }
  }, { pointerMode: 'fine' })
}
console.log(`Choice focus styles passed: ${checked} theme/state checks.`)
