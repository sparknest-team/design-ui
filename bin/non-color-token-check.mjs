import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { auditThemes } from './theme-audit-utils.mjs'

// Geometry is intentionally platform-specific. Test consumption and accessibility,
// rather than freezing desktop/mobile density to one number.
const components = [
  'badge',
  'tag',
  'button',
  'alert',
  'hover',
  'paper',
  'ripple',
  'skeleton',
  'link',
  'space',
  'tabs',
  'pagination',
  'switch',
  'back-top',
  'ellipsis',
  'auto-complete',
  'avatar',
  'checkbox',
  'collapse',
  'count-to',
  'countdown',
  'divider',
  'empty',
  'field-decorator',
  'icon',
  'input',
  'overlay',
  'popover',
  'progress-group',
  'statistic',
  'tooltip',
  'trigger',
  'input-number',
]
let cases = 0,
  overrides = 0
for (const component of components) {
  const name = component === 'hover' ? 'hoverOverlay' : component.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  const themeFileName = existsSync(
    new URL(`../../maple-design-mobile/packages/ui/src/themes/dark/${name}.ts`, import.meta.url),
  )
    ? name
    : null
  await auditThemes(
    component,
    ({ prefix: p, variables, expand }) => {
      const root = `--${p}-${component}-`
      for (const [key, value] of Object.entries(variables)) {
        if (
          !key.startsWith(root) ||
          !/(?:font-size|font-weight|duration|radius|height|width|gap|padding|margin|scale|opacity)/.test(key)
        )
          continue
        if (/color|background|bg-/.test(key)) continue
        let resolved
        try {
          resolved = expand(value)
        } catch (error) {
          throw new Error(`${component}/${p}: ${key} = ${value}`, { cause: error })
        }
        assert.ok(!resolved.includes('var('), `${key}: unresolved ${resolved}`)
        assert.ok(!/undefined|NaN/.test(resolved), `${key}: ${resolved}`)
      }
      cases++
    },
    {
      themeFileName,
      pointerMode: 'fine',
      importsAfter:
        component === 'auto-complete' ? ['select'] : component === 'input-number' ? ['field-decorator'] : [],
    },
  )
}
for (const component of ['tag', 'alert', 'button', 'switch'])
  for (const reducedMotion of [false, true]) {
    await auditThemes(
      component,
      ({ prefix: p, document, tag, variables, cascade, expand }) => {
        const suffix = {
          tag: 'fade-duration',
          alert: 'close-duration',
          button: 'transition-duration',
          switch: 'loading-duration',
        }[component]
        const classes = {
          tag: `${p}-tag-fade-leave-active`,
          alert: `${p}-alert-leave-leave-active`,
          button: `${p}-button`,
          switch: `${p}-switch__loading`,
        }
        const el = document.createElement('div')
        el.className = classes[component]
        tag.append(el)
        const property = component === 'switch' ? 'animation' : 'transition'
        if (reducedMotion) assert.equal(cascade(el)[property], 'none', `${component} reduced motion`)
        else {
          const key = component === 'button' ? `--${p}-sys-motion-duration-standard` : `--${p}-${component}-${suffix}`
          assert.ok(cascade(el)[property].includes(`var(${key})`), key)
          variables[key] = '777ms'
          assert.ok(expand(cascade(el)[property]).includes('777ms'), `${key} override`)
          overrides++
        }
        cases++
      },
      { reducedMotion, pointerMode: 'fine' },
    )
  }
await auditThemes(
  'progress-group',
  ({ prefix: p, document, tag, variables, cascade, expand }) => {
    const checks = [
      ['tooltip', 'max-width', 'tooltip-max-width'],
      ['tooltip', 'padding', 'tooltip-padding'],
      ['tooltip', 'border-radius', 'tooltip-radius'],
      ['tooltip', 'font-size', 'tooltip-font-size'],
      ['tooltip', 'line-height', 'tooltip-line-height'],
      ['tooltip', 'animation', 'tooltip-duration'],
      ['circle-status', 'font-weight', 'text-font-weight'],
      ['segment', 'transition', 'transition-duration'],
      ['circle-tooltip', 'bottom', 'tooltip-offset'],
    ]
    for (const [part, property, suffix] of checks) {
      const el = document.createElement('div')
      el.className = `${p}-progress-group__${part}`
      tag.append(el)
      const key = `--${p}-progress-group-${suffix}`,
        old = variables[key]
      assert.ok(cascade(el)[property]?.includes(`var(${key})`), key)
      variables[key] = '777px'
      assert.ok(expand(cascade(el)[property]).includes('777px'), key)
      variables[key] = old
      overrides++
    }
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl'])
      for (const direction of ['horizontal', 'vertical']) {
        tag.className = `${p}-progress-group ${p}-progress-group--${direction} ${p}-progress-group--${size}`
        const el = document.createElement('div')
        el.className = `${p}-progress-group__track`
        tag.append(el)
        const property = direction === 'horizontal' ? 'height' : 'width',
          key = `--${p}-progress-group-size-${size}-thickness`,
          old = variables[key]
        assert.ok(cascade(el)[property].includes(`var(${key})`), key)
        variables[key] = '777px'
        assert.equal(expand(cascade(el)[property]), '777px', key)
        variables[key] = old
        overrides++
      }
  },
  { themeFileName: null },
)
for (const component of ['avatar', 'collapse', 'checkbox', 'overlay', 'trigger', 'progress-group']) {
  await auditThemes(
    component,
    ({ prefix: p, document, tag, cascade }) => {
      const selectors = {
        avatar: [`${p}-avatar--hoverable`, `${p}-avatar__trigger-icon-button`, `${p}-avatar__trigger-icon-overlay`],
        collapse: [`${p}-collapse-item`, `${p}-collapse-item__expand-icon`, 'collapse-slider-leave-active'],
        checkbox: [`${p}-checkbox__control`, `${p}-checkbox__icon`],
        overlay: [`${p}-overlay--fade-leave-active`],
        trigger: ['trigger-fade-leave-active'],
        'progress-group': [
          `${p}-progress-group__active-segment`,
          `${p}-progress-group__tooltip`,
          `${p}-progress-group__circle-active-segment`,
        ],
      }
      tag.className = `${p}-${component}`
      for (const cls of selectors[component]) {
        const el = document.createElement('div')
        el.className = cls
        tag.append(el)
        const property = /tooltip|circle-active/.test(cls) ? 'animation' : 'transition'
        assert.equal(cascade(el)[property], 'none', `${component}/${cls}: reduced motion`)
        cases++
      }
    },
    {
      reducedMotion: true,
      pointerMode: 'fine',
      themeFileName: ['trigger', 'progress-group'].includes(component) ? null : component,
    },
  )
}
console.log(
  `Non-color tokens passed: ${components.length} families, ${cases} theme/preference cases, ${overrides} motion overrides. Platform geometry is retained; this is not browser layout acceptance.`,
)
