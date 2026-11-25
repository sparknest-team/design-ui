import assert from 'node:assert/strict'
import { auditThemes, rgba } from './theme-audit-utils.mjs'

const statuses = ['default', 'primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'danger']
const baseline = new Map()
await auditThemes('button', ({ prefix: p, brand, mode, tag, cascade, expand }) => {
  for (const status of statuses)
    for (const disabled of [false, true]) {
      tag.className = `${p}-button ${p}-button--variant-text ${p}-button--status-${status} ${disabled ? `${p}-button--disabled` : ''}`
      baseline.set(`${p}/${brand}/${mode}/${status}/${disabled}`, rgba(expand(cascade(tag).color)))
    }
})
let checks = 0
await auditThemes('link', ({ prefix: p, brand, mode, tag, cascade, expand }) => {
  for (const status of statuses)
    for (const state of ['', 'disabled', 'loading'])
      for (const interaction of ['', 'audit-hover', 'audit-active']) {
        tag.className = `${p}-link ${p}-link--status-${status} ${state ? `${p}-link--${state}` : ''} ${interaction}`
        assert.deepEqual(
          rgba(expand(cascade(tag).color)),
          state
            ? rgba(expand(`var(--${p}-sys-color-content-disabled)`))
            : baseline.get(`${p}/${brand}/${mode}/${status}/false`),
          `${p}/${brand}/${mode}/${status}/${state}/${interaction}: Link follows Button text foreground`,
        )
        checks++
      }
})
console.log(
  `Link colors passed: ${checks} cases; normal/hover/active follow Button text, disabled/loading share neutral content-disabled.`,
)

let sizeChecks = 0
await auditThemes('link', ({ prefix: p, tag, document, variables, cascade, expand }) => {
  const icon = document.createElement('span')
  icon.className = `${p}-link__icon`
  tag.append(icon)
  for (const [size, px] of [
    ['xs', 12],
    ['sm', 13],
    ['md', 14],
    ['lg', 16],
    ['xl', 18],
  ]) {
    tag.className = `${p}-link ${p}-link--size-${size}`
    assert.equal(expand(cascade(tag)['font-size']), `${px}px`)
    assert.equal(expand(cascade(icon)['font-size']), '1em')
    const token = `--${p}-link-size-${size}-font-size`,
      previous = variables[token]
    variables[token] = '23px'
    assert.equal(expand(cascade(tag)['font-size']), '23px')
    variables[token] = previous
    sizeChecks++
  }
  tag.className = `${p}-link ${p}-link--size-md`
  variables[`--${p}-link-font-size`] = '19px'
  assert.equal(expand(cascade(tag)['font-size']), '19px', 'md preserves existing font customization')
})
console.log(`Link size scale, em icons and overrides passed: ${sizeChecks} theme/size cases.`)
