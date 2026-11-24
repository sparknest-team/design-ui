import assert from 'node:assert/strict'
import { auditThemes, luminance, over, rgba } from './theme-audit-utils.mjs'

// Button is the approved color baseline, including its intentional white solid text.
const buttonColors = new Map()
await auditThemes('button', ({ prefix, repo, brand, mode, tag, cascade, expand }) => {
  for (const status of ['default', 'primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'danger'])
    for (const variant of ['default', 'outline']) {
      tag.className = `${prefix}-button ${prefix}-button--variant-${variant} ${prefix}-button--status-${status}`
      buttonColors.set(`${repo}/${brand}/${mode}/${status}/${variant}`, rgba(expand(cascade(tag).color)))
    }
})
let states = 0,
  pairs = 0,
  overrides = 0,
  minimum = Infinity,
  belowAA = 0
await auditThemes('badge', ({ prefix, repo, brand, mode, tag, document, variables, expand, cascade }) => {
  const content = document.createElement('span')
  const wrapper = document.createElement('span')
  const contentWrapper = document.createElement('span')
  wrapper.className = `${prefix}-badge__wrapper`
  contentWrapper.className = `${prefix}-badge__content-wrapper`
  tag.append(wrapper)
  wrapper.append(contentWrapper)
  contentWrapper.append(content)
  for (const status of ['', 'default', 'primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'danger'])
    for (const variant of ['default', 'outline'])
      for (const part of ['content', 'dot-content']) {
        tag.className = `${prefix}-badge ${prefix}-badge--variant-${variant} ${status ? `${prefix}-badge--status-${status}` : ''}`
        content.className = `${prefix}-badge__${part}`
        const style = cascade(content)
        const label = `${repo}/${brand}/${mode}/${status}/${variant}/${part}`
        const base = `--${prefix}-badge-`
        const fg =
          variant === 'outline'
            ? `variant-outline-${status ? `status-${status}-` : ''}text-color`
            : `${status ? `status-${status}-` : ''}text-color`
        const bg = variant === 'outline' ? 'variant-outline-bg-color' : `${status ? `status-${status}-` : ''}bg-color`
        assert.equal(style['background-color'], `var(${base}${bg})`, label)
        if (part === 'content' || status || variant === 'outline') assert.equal(style.color, `var(${base}${fg})`, label)
        if (variant === 'outline') assert.equal(style.border, `thin solid var(${base}${fg})`, label)
        // Badge's explicit default status retains its fixed light-gray neutral fill.
        if (part === 'content' && !(status === 'default' && variant === 'default')) {
          const buttonStatus = status || 'danger'
          assert.deepEqual(
            rgba(expand(style.color)),
            buttonColors.get(`${repo}/${brand}/${mode}/${buttonStatus}/${variant}`),
            `${label}: foreground must follow Button`,
          )
        }
        states++
        if (part === 'content') {
          for (const surface of ['page', 'default', 'raised', 'overlay', 'muted']) {
            const backdrop = over(
              rgba(expand(`var(--${prefix}-sys-color-surface-${surface})`)),
              rgba(expand(`var(--${prefix}-sys-color-surface-page)`)),
            )
            const background = over(rgba(expand(style['background-color'])), backdrop)
            const foreground = over(rgba(expand(style.color)), background)
            const a = luminance(foreground),
              b = luminance(background)
            const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
            // Report contrast without replacing the user-approved Button palette.
            if (ratio < 4.5) belowAA++
            minimum = Math.min(minimum, ratio)
            pairs++
          }
        }
        const old = variables[base + bg]
        variables[base + bg] = '#123456'
        assert.equal(expand(style['background-color']), '#123456', label)
        variables[base + bg] = old
        overrides++
      }
})
console.log(
  `Badge Button color parity passed: ${states} states, ${pairs} contrast pairs, ${overrides} overrides; minimum ${minimum.toFixed(3)}:1, ${belowAA} pairs below 4.5:1.`,
)
