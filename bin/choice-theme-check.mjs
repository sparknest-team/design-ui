// Compiled selector/default checks, not a browser or pseudo-element rendering test.
import assert from 'node:assert/strict'
import { reportContrast } from './contrast-report.mjs'
import { auditThemes, luminance, over, rgba } from './theme-audit-utils.mjs'

let states = 0
let pairs = 0
let minimum = Infinity
for (const pointerMode of ['fine', 'coarse'])
  for (const component of ['checkbox', 'radio', 'switch']) {
    await auditThemes(
      component,
      ({ prefix: p, repo, brand, mode, document, tag, cascade, expand, variables }) => {
        const context = `${repo}/${brand}/${mode}/${component}`
        const node = (classes, parent = tag) => {
          const element = document.createElement('div')
          element.className = classes
          parent.append(element)
          return element
        }
        const defaultColor = (value) =>
          expand(value).replace(/^var\(--(?:c|mp)-internal-(?:checkbox|radio)-instance-[\w-]+,\s*(.*)\)$/, '$1')
        const read = (name) => expand(variables[`--${p}-${name}`])
        const consume = (element, property, name) => {
          assert.equal(defaultColor(cascade(element)[property]), read(name), `${context}/${name}`)
          const key = `--${p}-${name}`,
            previous = variables[key]
          variables[key] = '#123456'
          assert.equal(defaultColor(cascade(element)[property]), '#123456', `${context}/${name}: public override`)
          variables[key] = previous
        }
        const contrast = (color, background, threshold) => {
          const bg = over(rgba(background), rgba(read('sys-color-surface-page')))
          const fg = over(rgba(color), bg)
          const a = luminance(fg),
            b = luminance(bg)
          const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
          reportContrast(ratio, threshold, `${context}: ${ratio} < ${threshold}`)
          pairs++
          minimum = Math.min(minimum, ratio)
        }
        if (component === 'switch') {
          for (const variant of ['circle', 'round', 'line', 'tonal'])
            for (const checked of [false, true])
              for (const disabled of [false, true])
                for (const loading of [false, true])
                  for (const error of [false, true]) {
                    const root = node(
                      [
                        `${p}-switch`,
                        `${p}-switch--variant-${variant}`,
                        checked && `${p}-switch--checked`,
                        disabled && `${p}-switch--disabled`,
                        loading && `${p}-switch--loading`,
                        error && `${p}-switch--error`,
                      ]
                        .filter(Boolean)
                        .join(' '),
                    )
                    const track = node(`${p}-switch__track`, root)
                    if (error && !disabled && !loading) consume(track, 'background', 'switch-track-error-background')
                    else {
                      const token = checked
                        ? 'track-active-background'
                        : variant === 'tonal'
                          ? 'tonal-track-background'
                          : 'track-background'
                      assert.equal(
                        cascade(track).background,
                        `var(--${p}-switch-current-track, var(--${p}-switch-${token}))`,
                        context,
                      )
                    }
                    states++
                    root.remove()
                  }
          return
        }
        if (component === 'radio') {
          for (const checked of [false, true])
            for (const disabled of [false, true])
              for (const error of [false, true])
                for (const hover of [false, true]) {
                  const parent = node(p + '-radio-group ' + p + '-radio-group--button')
                  const root = node(
                    [
                      p + '-radio',
                      p + '-radio--button',
                      checked && p + '-radio--checked',
                      disabled && p + '-radio--disabled',
                      error && p + '-radio--error',
                      hover && 'audit-hover',
                    ]
                      .filter(Boolean)
                      .join(' '),
                    parent,
                  )
                  const token = disabled ? 'radio-label-text-color-disabled' : 'radio-label-text-color'
                  consume(root, 'color', token)
                  if (error && !disabled)
                    assert.equal(
                      expand(cascade(root)['box-shadow']),
                      `inset 0 0 0 ${read('internal-radio-focus-width')} ${read('radio-control-color-error')}`,
                      context + '/button error indicator',
                    )
                  if (checked)
                    assert.equal(
                      expand(cascade(root).background),
                      read('internal-radio-segment-bg'),
                      context + '/button background',
                    )
                  if (!disabled)
                    contrast(
                      read(token),
                      read(checked ? 'internal-radio-segment-bg' : 'internal-radio-segment-group-bg'),
                      4.5,
                    )
                  states++
                  parent.remove()
                }
        }
        for (const selected of component === 'checkbox'
          ? ['unchecked', 'checked', 'indeterminate']
          : ['unchecked', 'checked'])
          for (const disabled of [false, true])
            for (const error of [false, true])
              for (const hover of [false, true]) {
                const selectedState = selected !== 'unchecked'
                const classes = [
                  `${p}-${component}`,
                  selectedState && `${p}-${component}--${selected}`,
                  disabled && `${p}-${component}--disabled`,
                  error && `${p}-${component}--error`,
                  hover && 'audit-hover',
                ]
                const root = node(classes.filter(Boolean).join(' '))
                const control = node(`${p}-${component}__control`, root)
                const suffix = disabled ? '-disabled' : error ? '-error' : selectedState ? '-checked' : ''
                const token = `${component}-control-color${suffix}`
                consume(component === 'checkbox' ? root : control, 'color', token)
                const label = node(`${p}-${component}__label`, root)
                consume(label, 'color', `${component}-label-text-color${disabled ? '-disabled' : ''}`)
                if (!disabled)
                  for (const surface of ['sys-color-surface-default', 'sys-color-surface-muted']) {
                    contrast(read(token), read(surface), 3)
                    contrast(read(`${component}-label-text-color`), read(surface), 4.5)
                  }
                states++
                root.remove()
                label.remove()
              }
      },
      { pointerMode },
    )
  }
console.log(
  `Choice themes passed: ${states} states; ${pairs} contrast pairs, minimum ${minimum.toFixed(3)}:1. Switch checks priority only; pseudo-elements and custom inline colors require separate review.`,
)
