import assert from 'node:assert/strict'
import { reportContrast } from './contrast-report.mjs'
import { auditThemes, luminance, over, rgba } from './theme-audit-utils.mjs'

let checks = 0
for (const component of ['hover', 'icon', 'paper', 'ripple', 'skeleton', 'space']) {
  await auditThemes(
    component,
    ({ prefix: p, repo, brand, mode, document, tag, variables, cascade, expand }) => {
      const context = `${repo}/${brand}/${mode}/${component}`
      const node = (name, parent = tag) => {
        const el = document.createElement('div')
        el.className = name
        parent.append(el)
        return el
      }
      const consume = (el, property, suffix) => {
        const key = `--${p}-${component}-${suffix}`
        const original = variables[key]
        assert.ok(cascade(el)[property]?.includes(`var(${key})`), `${context}/${property}/${suffix}`)
        variables[key] = '#123456'
        assert.ok(expand(cascade(el)[property]).includes('#123456'), `${context}/${suffix} override`)
        variables[key] = original
        checks++
      }
      if (component === 'hover') {
        for (const hovering of [false, true])
          for (const focusing of [false, true]) {
            const el = node(
              [
                `${p}-hover-overlay`,
                hovering && `${p}-hover-overlay--hovering`,
                focusing && `${p}-hover-overlay--focusing`,
              ]
                .filter(Boolean)
                .join(' '),
            )
            assert.equal(Number(expand(cascade(el).opacity)), focusing ? 0.12 : hovering ? 0.04 : 0, context)
            if (focusing || hovering) consume(el, 'opacity', focusing ? 'overlay-focusing-opacity' : 'overlay-opacity')
            checks++
          }
      }
      if (component === 'icon') {
        const el = node(`${p}-icon`)
        consume(el, 'font-size', 'size')
        assert.equal(expand(cascade(el)['font-size']), 'inherit', context)
        assert.equal(cascade(el).color, 'inherit', context)
      }
      if (component === 'paper') {
        const el = node(`${p}-paper ${p}-paper--bordered`)
        for (const [property, suffix] of [
          ['background', 'background'],
          ['border-radius', 'border-radius'],
          ['border', 'border-width'],
          ['border', 'border-color'],
          ['transition', 'transition-duration'],
        ])
          consume(el, property, suffix)
        const bg = rgba(expand(cascade(el).background))
        const fg = over(rgba(expand(variables[`--${p}-sys-color-content-primary`])), bg)
        const a = luminance(fg),
          b = luminance(bg)
        reportContrast((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), 4.5, context)
      }
      if (component === 'ripple') {
        const el = node(`${p}-ripple`)
        consume(el, 'background-color', 'color')
        consume(el, 'transition', 'cubic-bezier')
        assert.equal(expand(cascade(el)['background-color']), 'currentColor', context)
      }
      if (component === 'skeleton') {
        const root = node(`${p}-skeleton ${p}-skeleton--animation`)
        const mapping = {
          content: { padding: 'content-padding' },
          card: {
            height: 'card-height',
            'border-radius': 'card-border-radius',
            'margin-bottom': 'card-margin-bottom',
            'background-color': 'card-background-color',
          },
          avatar: {
            width: 'avatar-size',
            height: 'avatar-size',
            'border-radius': 'avatar-border-radius',
            'margin-inline-end': 'avatar-margin-right',
            'background-color': 'avatar-background-color',
          },
          title: {
            width: 'title-width',
            'border-radius': 'title-border-radius',
            'background-color': 'title-background-color',
            height: 'row-height',
          },
          row: {
            height: 'row-height',
            'border-radius': 'row-border-radius',
            'margin-top': 'row-margin-top',
            'background-color': 'title-background-color',
          },
          shimmer: { background: 'animation-background' },
        }
        for (const [part, props] of Object.entries(mapping)) {
          const el = node(`${p}-skeleton__${part}`, root)
          for (const [prop, suffix] of Object.entries(props)) consume(el, prop, suffix)
          if (part === 'shimmer') assert.equal(cascade(el).opacity, '0.3', context)
        }
        for (const size of ['sm', 'md', 'lg']) {
          const el = node(`${p}-skeleton-shape ${p}-skeleton-shape--${size}`)
          for (const prop of ['width', 'height']) consume(el, prop, `shape-size-${size}`)
          consume(el, 'border-radius', 'shape-border-radius')
          consume(el, 'background-color', 'title-background-color')
        }
      }
      if (component === 'space') {
        // Space writes these token references into inline gap; runtime tests cover that consumer.
        for (const [size, row, column] of [
          ['xs', 4, 4],
          ['sm', 8, 6],
          ['md', 12, 8],
          ['lg', 16, 12],
          ['xl', 24, 16],
        ]) {
          assert.equal(expand(variables[`--${p}-space-size-${size}-row-gap`]), `${row}px`, context)
          assert.equal(expand(variables[`--${p}-space-size-${size}-column-gap`]), `${column}px`, context)
          checks += 2
        }
      }
    },
    { themeFileName: component === 'hover' ? 'hoverOverlay' : component },
  )
}
console.log(
  `Foundation themes passed: ${checks} checks across both platforms, brands and modes. Includes token overrides and focus-over-hover; excludes browser layout, motion and custom colors.`,
)
