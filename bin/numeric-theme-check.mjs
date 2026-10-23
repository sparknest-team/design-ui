import assert from 'node:assert/strict'
import { auditThemes, rgba, over, luminance } from './theme-audit-utils.mjs'

let consumers = 0, pairs = 0, minimum = Infinity
for (const component of ['count-to', 'countdown', 'statistic', 'progress-group']) {
  await auditThemes(component, ({ prefix: p, repo, brand, mode, document, tag, variables, expand, cascade }) => {
    const context = `${repo}/${brand}/${mode}/${component}`
    const read = suffix => expand(variables[`--${p}-${suffix}`])
    const node = (classes, parent = tag) => {
      const el = document.createElement('div')
      el.className = classes
      parent.append(el)
      return el
    }
    const consume = (el, property, suffix) => {
      const key = `--${p}-${component}-${suffix}`, old = variables[key]
      assert.equal(expand(cascade(el)[property]), expand(old), `${context}/${suffix}`)
      variables[key] = '#123456'
      assert.equal(expand(cascade(el)[property]), '#123456', `${context}/${suffix}: override`)
      variables[key] = old
      consumers++
    }
    const contrast = (fg, bg, threshold = 4.5) => {
      const background = over(rgba(bg), rgba(read('sys-color-surface-default')))
      const foreground = over(rgba(fg), background)
      const a = luminance(foreground), b = luminance(background)
      const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
      assert.ok(ratio >= threshold, `${context}: ${ratio} < ${threshold}`)
      minimum = Math.min(minimum, ratio)
      pairs++
    }
    const text = (el, suffix) => {
      consume(el, 'color', suffix)
      for (const host of ['surface-default', 'surface-muted']) contrast(read(`${component}-${suffix}`), read(`sys-color-${host}`))
    }
    const root = node(`${p}-${component}`)
    if (component === 'count-to' || component === 'countdown') text(root, 'text-color')
    if (component === 'statistic') {
      for (const part of ['title', 'value', 'prefix', 'suffix', 'extra']) {
        const el = node(`${p}-statistic__${part}`, root)
        text(el, `${part}-color`)
        if (part === 'value') {
          const counter = node(`${p}-count-to`, el)
          assert.equal(cascade(counter).color, 'inherit', `${context}: animated value inherits statistic color`)
        }
      }
    }
    if (component === 'progress-group') {
      text(root, 'text-color')
      for (const part of ['status', 'value']) text(node(`${p}-progress-group__${part}`, root), 'muted-color')
      text(node(`${p}-progress-group__circle-status`, root), 'text-color')
      consume(node(`${p}-progress-group__track`, root), 'background', 'track-color')
      consume(node(`${p}-progress-group__circle-track`, root), 'stroke', 'track-color')
      const tooltip = node(`${p}-progress-group__tooltip`, root)
      consume(tooltip, 'color', 'tooltip-color')
      consume(tooltip, 'background', 'tooltip-bg')
      contrast(read('progress-group-tooltip-color'), read('progress-group-tooltip-bg'))
      contrast(read('sys-color-content-brand'), read('progress-group-track-color'), 3)
    }
    root.remove()
  }, { themeFileName: ['countdown', 'statistic'].includes(component) ? component : null })
}
console.log(`Numeric themes passed: ${consumers} consumers, ${pairs} contrast pairs, minimum ${minimum.toFixed(3)}:1. Compiled CSS and token overrides; excludes custom colors, browser layout and animation.`)
