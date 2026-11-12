// Compiled CSS checks; browser layout, pseudo-elements and animation are separate gates.
import assert from 'node:assert/strict'
import { auditThemes, rgba, over, luminance } from './theme-audit-utils.mjs'

let states = 0
let pairs = 0
let minimum = Infinity
let textMinimum = Infinity
for (const component of ['input', 'select', 'auto-complete']) {
  await auditThemes(component, ({ prefix: p, repo, brand, mode, document, tag, variables, cascade, expand }) => {
    const label = `${repo}/${brand}/${mode}/${component}`
    const read = name => expand(variables[`--${p}-${name}`])
    const element = (classes, parent = tag) => {
      const node = document.createElement('div')
      node.className = classes
      parent.append(node)
      return node
    }
    const contrast = (fg, bg, threshold) => {
      const background = over(rgba(bg), rgba(read('sys-color-surface-page')))
      const foreground = over(rgba(fg), background)
      const a = luminance(foreground), b = luminance(background)
      const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
      assert.ok(ratio >= threshold, `${label}: contrast ${ratio} < ${threshold}`)
      minimum = Math.min(minimum, ratio)
      if (threshold === 4.5) textMinimum = Math.min(textMinimum, ratio)
      pairs++
    }
    const consume = (node, property, token) => {
      const value = color => property === 'border' ? `1px solid ${color}` : color
      assert.equal(expand(cascade(node)[property]), value(read(token)), `${label}/${token}`)
      const key = `--${p}-${token}`, previous = variables[key]
      variables[key] = '#123456'
      assert.equal(expand(cascade(node)[property]), value('#123456'), `${label}/${token}: override must reach consumer`)
      variables[key] = previous
    }
    if (component === 'input') {
      for (const [suffix, role] of [['', 'sys-color-surface-muted'], ['-hover', 'sys-color-state-hover'], ['-focus', 'color-fill-3']]) {
        assert.equal(variables[`--${p}-field-variant-filled-background${suffix}`], `var(--${p}-${role})`, `${label}: filled progression must survive theme overrides`)
      }
      const root = element(`${p}-input`)
      const counter = element(`${p}-input__word-limit`, root)
      consume(counter, 'color', 'input-counter-color')
      for (const surface of ['sys-color-surface-default', 'sys-color-surface-muted', 'sys-color-state-hover', 'color-fill-3']) {
        contrast(expand(cascade(counter).color), read(surface), 4.5)
      }
      for (const status of ['success', 'warning', 'error', 'validating']) {
        const node = element(`${p}-input-feedback ${p}-input-feedback--${status}`)
        consume(node, 'color', `input-feedback-${status}-color`)
        for (const surface of ['sys-color-surface-default', 'sys-color-surface-muted', 'sys-color-state-hover', 'color-fill-3']) {
          // Feedback SVGs are non-text indicators; enforce 3:1 against all filled states.
          contrast(expand(cascade(node).color), read(surface), 3)
          states++
        }
      }
      return
    }
    const root = element(`${p}-select-dropdown${component === 'auto-complete' ? ` ${p}-auto-complete__dropdown` : ''}`)
    // AutoComplete deliberately adapts Select's local variables on its own popup.
    const local = cascade(root)
    for (const [key, value] of Object.entries(local)) if (key.startsWith('--')) variables[key] = value
    const token = (suffix) => component === 'auto-complete' ? `auto-complete-${suffix}` : `select-popup-${suffix.replace('option-bg-default', 'option-bg').replace('option-text-color-default', 'option-text-color')}`
    assert.equal(read(token('option-bg-selected')), 'transparent', `${label}: selection has no resting fill`)
    assert.equal(read(token('option-text-color-selected')), read('sys-color-action-primary'), `${label}: selected text matches the primary button`)
    consume(root, 'background-color', `${component}-popup-bg`)
    consume(root, 'border', `${component}-popup-border-color`)
    if (component === 'select') {
      const group = element(`${p}-select-group`, root)
      const title = element(`${p}-select-group-title`, group)
      consume(title, 'color', 'select-popup-group-title-text-color')
      contrast(expand(cascade(title).color), read('select-popup-bg'), 4.5)
    }
    for (const selected of [false, true]) for (const active of [false, true]) for (const hover of [false, true]) for (const disabled of [false, true]) {
      const node = element([`${p}-select-option`, selected && `${p}-select-option-selected`, active && `${p}-select-option-active`, hover && 'audit-hover', disabled && `${p}-select-option-disabled`].filter(Boolean).join(' '), root)
      const colorState = disabled ? 'disabled' : selected ? 'selected' : active || hover ? 'hover' : 'default'
      const backgroundState = disabled ? 'disabled' : active || hover ? selected && component === 'select' ? 'selected-hover' : 'hover' : selected ? 'selected' : 'default'
      consume(node, 'color', token(`option-text-color-${colorState}`))
      consume(node, 'background-color', token(`option-bg-${backgroundState}`))
      if (!disabled && !selected) contrast(expand(cascade(node).color), expand(cascade(node)['background-color']), 4.5)
      states++
      node.remove()
    }
  }, { tokenImports: component === 'input' ? ['field-decorator/style/token.less'] : component === 'auto-complete' ? ['select/style/index.less'] : [], darkThemeFiles: component === 'input' ? ['themes/dark/field.ts'] : [], themeFileName: component === 'auto-complete' ? 'select' : component })
}
console.log(`Selection themes passed: ${states} states, ${pairs} contrast pairs; minimum ${minimum.toFixed(3)}:1, text minimum ${textMinimum.toFixed(3)}:1 (unselected text ≥4.5, feedback icons ≥3; selected text follows the requested primary button color).`)
