import { reportContrast } from './contrast-report.mjs';
import assert from 'node:assert/strict'
import { auditThemes, rgba, over, luminance } from './theme-audit-utils.mjs'

let states = 0
let pairs = 0
let minimum = Infinity
for (const component of ['form', 'textarea']) {
  await auditThemes(component, ({ prefix: p, repo, brand, mode, document, tag, cascade, expand, variables }) => {
    const context = `${repo}/${brand}/${mode}/${component}`
    const node = (classes, parent = tag, type = 'div') => {
      const el = document.createElement(type)
      el.className = classes
      parent.append(el)
      return el
    }
    const read = name => expand(variables[`--${p}-${name}`])
    const consume = (el, token, pseudo = '') => {
      assert.equal(expand(cascade(el, pseudo).color), read(token), `${context}/${token}`)
      const key = `--${p}-${token}`, previous = variables[key]
      variables[key] = '#123456'
      assert.equal(expand(cascade(el, pseudo).color), '#123456', `${context}/${token}: override`)
      variables[key] = previous
      states++
    }
    const contrast = (token, threshold = 4.5) => {
      const surfaces = component === 'form' ? ['sys-color-surface-default', 'sys-color-surface-muted'] : ['sys-color-surface-default', 'sys-color-surface-muted', 'sys-color-state-hover', 'color-fill-3']
      for (const surface of surfaces) {
        const bg = over(rgba(read(surface)), rgba(read('sys-color-surface-page')))
        const fg = over(rgba(read(token)), bg)
        const a = luminance(fg), b = luminance(bg)
        const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
        reportContrast(ratio, threshold, `${context}/${token}: ${ratio} < ${threshold}`)
        pairs++
        minimum = Math.min(minimum, ratio)
      }
    }
    if (component === 'textarea') {
      for (const disabled of [false, true]) for (const error of [false, true]) for (const hover of [false, true]) {
        const root = node(`${p}-textarea`)
        const inner = node([`${p}-textarea__inner`, disabled && `${p}-textarea--disabled`, error && `${p}-textarea--error`, hover && 'audit-hover'].filter(Boolean).join(' '), root, 'textarea')
        if (disabled) inner.setAttribute('disabled', '')
        consume(inner, disabled ? 'field-control-text-color-disabled' : 'textarea-placeholder-color', '::placeholder')
        if (p === 'mp' && disabled) consume(inner, 'field-control-text-color-disabled')
        consume(node(`${p}-textarea__word-limit`, root), 'textarea-counter-color')
        root.remove()
      }
      contrast('textarea-placeholder-color')
      contrast('textarea-counter-color')
      return
    }
    const labelCol = node(p === 'c' ? 'c-form-item-label-col' : 'mp-form-item__label-col')
    consume(node(p === 'c' ? 'c-form-item-label' : 'mp-form-item__label', labelCol), 'form-label-text-color')
    consume(node(p === 'c' ? 'c-form-item-extra' : 'mp-form-item__help'), 'form-extra-text-color')
    consume(node(p === 'c' ? 'c-form-item-label-required-symbol' : 'mp-form-item__asterisk'), 'form-required-symbol-color')
    for (const token of ['label-text-color', 'extra-text-color', 'required-symbol-color']) contrast(`form-${token}`)
    if (p === 'c') {
      consume(node('c-form-item-label-tooltip'), 'form-tooltip-text-color')
      contrast('form-tooltip-text-color', 3)
      for (const status of ['success', 'warning', 'error', 'validating']) {
        const item = node(`c-form-item-status-${status}`)
        consume(node('c-form-item-message-help', item), `form-status-${status}-tip-text-color`)
        consume(node('c-form-item-feedback', item), `form-status-${status}-tip-icon-color`)
        contrast(`form-status-${status}-tip-text-color`)
        contrast(`form-status-${status}-tip-icon-color`, 3)
        for (const family of ['selection-field', 'input-tag']) for (const hover of [false, true]) for (const focus of [false, true]) {
          const field = node(`c-${family} c-field-decorator c-field-decorator--variant-filled${hover ? ' audit-hover' : ''}${focus ? ' c-field-decorator--focus' : ''}`, item)
          const styles = cascade(field)
          for (const prop of ['background', 'background-color', 'border-color', 'box-shadow']) assert.equal(styles[prop], undefined, `${context}: Form must not repaint FieldDecorator ${prop}`)
          states++
        }
      }
    } else {
      for (const role of ['error', 'extra']) {
        consume(node(`mp-form-details__${role}-message`), `form-details-${role}-message-color`)
        contrast(`form-details-${role}-message-color`)
      }
    }
  }, { themeFileName: component === 'form' ? 'formDetails' : 'textarea', tokenImports: component === 'textarea' ? ['field-decorator/style/token.less'] : [], importsAfter: prefix => component === 'form' && prefix === 'mp' ? ['form-details'] : [] })
}
console.log(`Form/Textarea themes passed: ${states} checks, ${pairs} contrast pairs; minimum ${minimum.toFixed(3)}:1. Compiled placeholder selectors, not browser pseudo-element rendering.`)
