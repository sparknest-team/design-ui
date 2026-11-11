import assert from 'node:assert/strict'
import { auditThemes, rgba, over, luminance } from './theme-audit-utils.mjs'

let states = 0, overrides = 0, contrastPairs = 0
for (const component of ['carousel', 'picker', 'time-range']) {
  await auditThemes(component, ({ prefix: p, document, tag, variables, expand, cascade }) => {
    const element = (classes, parent = tag) => { const el = document.createElement('div'); el.className = classes; parent.append(el); return el }
    const consume = (el, property, key, value) => {
      const old = variables[key]; assert.ok(old, `${key}: declared default`)
      assert.ok(cascade(el)[property].includes(`var(${key})`), key)
      variables[key] = value; assert.ok(expand(cascade(el)[property]).includes(value), key)
      variables[key] = old; overrides++
    }
    if (component === 'carousel') {
      tag.className = 'mp-carousel mp-carousel--fade'
      consume(element('mp-carousel-item', element('mp-carousel__track')), 'transition', '--mp-carousel-fade-duration', '777ms')
      tag.className = 'mp-carousel mp-carousel--card'
      consume(element('mp-carousel-item'), 'transition', '--mp-carousel-card-duration', '777ms')
    } else if (component === 'picker') {
      const el = element('mp-picker__option-check'); el.setAttribute('mp-picker-cover', '')
      consume(el, 'color', '--mp-picker-option-check-color', '#123456')
    } else {
      const el = element('mp-time-range-picker__next-day')
      consume(el, 'color', '--mp-time-range-picker-next-day-color', '#123456')
      const foreground = rgba(expand(variables['--mp-time-range-picker-next-day-color']))
      const page = rgba(expand(variables['--mp-sys-color-surface-page']))
      const background = over(rgba(expand(variables['--mp-time-range-picker-background'])), page)
      const a = luminance(over(foreground, background)), b = luminance(background)
      assert.ok((Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5, 'next-day small text contrast')
      contrastPairs++
    }
    states++
  }, { platforms: ['mp'], themeFileName: component === 'time-range' ? null : component, pointerMode: 'fine' })
}
await auditThemes('menu', ({ prefix: p, document, tag, variables, expand, cascade }) => {
  for (const selected of [false, true]) for (const disabled of [false, true]) for (const hover of [false, true]) for (const active of [false, true]) {
    tag.replaceChildren()
    const el = document.createElement('div'), base = `${p}-menu-option`, separator = p === 'c' ? '-' : '--'
    el.className = [base, selected && `${base}${separator}${p === 'c' ? 'selected' : 'selected-color'}`, disabled && `${base}${separator}disabled`, active && `${base}${separator}active`, hover && 'audit-hover'].filter(Boolean).join(' ')
    tag.append(el)
    // Both current MenuOption renderers paint selection on the row itself.
    const painted = el
    const properties = cascade(painted)
    const property = p === 'mp' && disabled ? 'background' : 'background-color'
    const selectedKey = `--${p}-menu-option-${p === 'c' ? 'bg-selected' : 'selected-background'}`
    const key = disabled ? `--${p}-menu-option-bg-disabled` : selected ? (hover || active ? `--${p}-menu-option-bg-selected-hover` : selectedKey) : null
    if (key) {
      assert.ok(variables[key], `${key}: declared default`)
      assert.ok(properties[property]?.includes(`var(${key})`), `${key}: painted row consumes variable`)
      assert.equal(expand(properties[property]), expand(variables[key]), `${p}: selected=${selected}, disabled=${disabled}, hover=${hover}, active=${active}`)
      const old = variables[key]; variables[key] = '#123456'; assert.equal(expand(properties[property]), '#123456', key); variables[key] = old; overrides++
    }
    if (disabled) {
      const textKey = `--${p}-menu-option-${p === 'c' ? 'text-color-disabled' : 'disabled-color'}`
      assert.equal(expand(cascade(el).color), expand(variables[textKey]), 'disabled text wins')
    }
    states++
  }
}, { themeFileName: 'menuOption' })
console.log(`Residual token audit passed: ${states} theme/state cases, ${overrides} overrides, ${contrastPairs} next-day contrast pairs.`)
