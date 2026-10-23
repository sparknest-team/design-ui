import assert from 'node:assert/strict'
import { auditThemes, rgba, over, luminance } from './theme-audit-utils.mjs'

let states = 0
let pairs = 0
let minimum = Infinity
await auditThemes('switch', ({ prefix: p, repo, brand, mode, document, tag, variables, expand, cascade }) => {
  const context = `${repo}/${brand}/${mode}/switch`
  const read = suffix => expand(variables[`--${p}-switch-${suffix}`])
  const resolve = value => expand(value.replace(new RegExp(`var\\(--${p}-switch-current-track, (var\\(--[\\w-]+\\))\\)`, 'g'), (_, fallback) => variables[`--${p}-switch-current-track`] ?? fallback))
  const node = (classes, parent = tag) => {
    const el = document.createElement('span')
    el.className = classes
    parent.append(el)
    return el
  }
  const consume = (el, property, suffix) => {
    assert.equal(resolve(cascade(el)[property]), read(suffix), `${context}/${suffix}`)
    const key = `--${p}-switch-${suffix}`, previous = variables[key]
    variables[key] = '#123456'
    assert.equal(resolve(cascade(el)[property]), '#123456', `${context}/${suffix}: override`)
    variables[key] = previous
  }
  const contrast = (fg, bg, threshold, pair) => {
    const background = typeof bg === 'string' ? rgba(bg) : bg
    const foreground = over(typeof fg === 'string' ? rgba(fg) : fg, background)
    const a = luminance(foreground), b = luminance(background)
    const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
    assert.ok(ratio >= threshold, `${context}/${pair}: ${ratio} < ${threshold}`)
    pairs++
    minimum = Math.min(minimum, ratio)
  }
  for (const variant of ['circle', 'round', 'line', 'tonal'])
    for (const checked of [false, true]) for (const disabled of [false, true])
      for (const loading of [false, true]) for (const error of [false, true])
        for (const hover of [false, true]) for (const active of [false, true]) for (const focus of [false, true]) {
          const root = node([`${p}-switch`, `${p}-switch--variant-${variant}`, checked && `${p}-switch--checked`, disabled && `${p}-switch--disabled`, loading && `${p}-switch--loading`, error && `${p}-switch--error`, hover && 'audit-hover', active && 'audit-active', focus && 'audit-focus-visible'].filter(Boolean).join(' '))
          const track = node(`${p}-switch__track`, root)
          const handle = node(`${p}-switch__handle`, root)
          const text = variant === 'line' ? undefined : node(`${p}-switch__text`, root)
          const enabledError = error && !disabled && !loading
          const tonal = variant === 'tonal' && !checked && !enabledError
          const trackToken = enabledError ? 'track-error-background' : checked ? 'track-active-background' : tonal ? 'tonal-track-background' : 'track-background'
          consume(track, 'background', trackToken)
          consume(handle, 'background', tonal ? 'tonal-border-color' : 'handle-background')
          consume(handle, 'color', tonal ? 'tonal-handle-color' : 'handle-color')
          if (text) consume(text, 'color', tonal ? 'tonal-text-color' : 'text-color')
          // Custom checked/unchecked colors keep ordinary track precedence; error is explicit.
          variables[`--${p}-switch-current-track`] = '#345678'
          assert.equal(resolve(cascade(track).background), enabledError ? read('track-error-background') : '#345678', context)
          delete variables[`--${p}-switch-current-track`]
          if (disabled || loading) assert.equal(expand(cascade(root).opacity), read('disabled-opacity'), context)
          else {
            const bg = resolve(cascade(track).background), thumb = resolve(cascade(handle).background)
            for (const surface of ['surface-default', 'surface-muted']) {
              const host = over(rgba(expand(variables[`--${p}-sys-color-${surface}`])), rgba(expand(variables[`--${p}-sys-color-surface-page`])))
              const trackPaint = over(rgba(bg), host)
              const thumbPaint = over(rgba(thumb), trackPaint)
              contrast(thumbPaint, trackPaint, 3, 'thumb/track')
              contrast(resolve(cascade(handle).color), thumbPaint, 3, 'icon/thumb')
              if (text) contrast(resolve(cascade(text).color), trackPaint, 4.5, 'text/track')
              contrast(tonal ? over(rgba(read('tonal-border-color')), trackPaint) : trackPaint, host, 3, 'boundary/host')
              if (focus) {
                assert.equal(resolve(cascade(root).outline), `${read('focus-width')} solid ${read('track-active-background')}`, context)
                contrast(read('track-active-background'), host, 3, 'focus/host')
              }
            }
          }
          states++
          root.remove()
        }
})
console.log(`Switch themes passed: ${states} states, ${pairs} contrast pairs; minimum ${minimum.toFixed(3)}:1. Default md size; disabled/loading opacity, custom colors and animation frames excluded from contrast.`)
