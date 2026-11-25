// Actual compiled CSS, including Maple dark overrides; not a browser screenshot test.
import assert from 'node:assert/strict'
import { reportContrast } from './contrast-report.mjs'
import { auditThemes, luminance, over, rgba } from './theme-audit-utils.mjs'

let pairs = 0
let combinations = 0
let minimum = Infinity
const variants = ['standard', 'tonal', 'outline']
const statuses = ['default', 'info', 'success', 'warning', 'danger']
await auditThemes('alert', ({ repo, prefix, brand, mode, document, tag, variables, expand, cascade }) => {
  const parts = Object.fromEntries(
    ['title', 'content', 'icon', 'close-btn', 'action'].map((part) => {
      const element = document.createElement('span')
      element.className = `${prefix}-alert__${part}`
      tag.append(element)
      return [part, element]
    }),
  )
  for (const variant of variants)
    for (const status of statuses) {
      tag.className = `${prefix}-alert ${prefix}-alert--${variant} ${prefix}-alert--${status}`
      const root = cascade(tag)
      const key = `--${prefix}-alert-${variant}-${status}`
      const label = `${repo}/${brand}/${mode}/${variant}/${status}`
      assert.equal(root.color, `var(${key}-content)`, `${label}: root content inheritance`)
      assert.equal(
        expand(root['background-color']),
        variant === 'outline' ? 'transparent' : expand(variables[`${key}-bg`]),
        label,
      )
      assert.equal(
        expand(root['border-color']),
        variant === 'tonal' ? 'transparent' : expand(variables[`${key}-border`]),
        label,
      )
      for (const part of ['title', 'content', 'icon']) {
        const role = status === 'default' ? (part === 'title' ? 'primary' : 'secondary') : status
        assert.equal(
          expand(cascade(parts[part]).color),
          expand(variables[`--${prefix}-sys-color-content-${role}`]),
          `${label}/${part}`,
        )
      }
      combinations++
      for (const surface of ['page', 'default', 'raised', 'overlay', 'muted']) {
        const page = rgba(expand(variables[`--${prefix}-sys-color-surface-page`]))
        const backdrop = over(rgba(expand(variables[`--${prefix}-sys-color-surface-${surface}`])), page)
        const bg = over(rgba(expand(root['background-color'])), backdrop)
        for (const [part, element] of Object.entries(parts)) {
          const color = cascade(element).color ?? root.color
          const fg = over(rgba(expand(color)), bg)
          const a = luminance(fg),
            b = luminance(bg)
          const contrast = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
          reportContrast(contrast, 4.5, `${label}/${surface}/${part}: ${contrast.toFixed(3)} < 4.5`)
          minimum = Math.min(minimum, contrast)
          pairs++
        }
      }
      // A local component override must still reach its actual CSS consumer.
      for (const part of ['title', 'content', 'icon']) {
        const token = `${key}-${part}`,
          original = variables[token]
        variables[token] = '#123456'
        assert.equal(expand(cascade(parts[part]).color), '#123456', `${label}/${part}: local override`)
        variables[token] = original
      }
    }
})
console.log(
  `Alert themes passed: ${combinations} variant/status combinations, ${pairs} foreground pairs; minimum ${minimum.toFixed(3)}:1. Custom backgrounds and styled slots are excluded.`,
)
