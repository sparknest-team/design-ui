import { reportContrast } from './contrast-report.mjs';
import assert from 'node:assert/strict'
import { auditThemes, rgba, over, luminance } from './theme-audit-utils.mjs'

let states = 0, pairs = 0, minimum = Infinity
for (const component of ['tabs', 'steps']) for (const pointerMode of component === 'tabs' ? ['fine', 'coarse'] : ['fine']) {
  await auditThemes(component, ({ prefix: p, repo, brand, mode, document, tag, variables, cascade, expand }) => {
    const context = `${repo}/${brand}/${mode}/${component}/${pointerMode}`
    const read = token => expand(variables[`--${p}-${token}`])
    const node = (classes, parent = tag) => { const el = document.createElement('div'); el.className = classes; parent.append(el); return el }
    const consume = (el, property, token, pseudo = '') => {
      assert.equal(expand(cascade(el, pseudo)[property]), read(token), `${context}/${token}`)
      const key = `--${p}-${token}`, old = variables[key]
      variables[key] = '#123456'
      assert.equal(expand(cascade(el, pseudo)[property]), '#123456', `${context}/${token}: override`)
      variables[key] = old
    }
    const contrast = (fg, bg, threshold = 4.5) => {
      const background = over(rgba(bg), rgba(read('sys-color-surface-default')))
      const foreground = over(rgba(fg), background)
      const a = luminance(foreground), b = luminance(background)
      const ratio = (Math.max(a,b)+.05)/(Math.min(a,b)+.05)
      reportContrast(ratio, threshold, `${context}: ${ratio} < ${threshold}`)
      minimum = Math.min(minimum, ratio); pairs++
    }
    if (component === 'tabs') {
      for (const variant of ['line','card','outline','plain','capsule','enclosed'])
        for (const selected of [false,true]) for (const disabled of [false,true]) for (const hover of [false,true]) {
          const root = node(`${p}-tabs ${p}-tabs--variant-${variant}`)
          const list = node(`${p}-tabs__nav-list`, root)
          const item = node([`${p}-tabs__tab`,selected && `${p}-tabs--tab-active`,disabled && `${p}-tabs--tab-disabled`,hover && 'audit-hover'].filter(Boolean).join(' '),list)
          const highlighted = pointerMode === 'fine' && hover && !disabled
          const token = disabled ? 'title-text-color-disabled' : selected || highlighted && ['line','outline'].includes(variant) ? 'title-text-color-active' : 'title-text-color'
          if (cascade(item).color) consume(item,'color',`tabs-${token}`)
          else consume(root,'color',`tabs-${token}`)
          const bgToken = highlighted && !selected && !['line','outline'].includes(variant) ? 'hover-background' : ['card','capsule','enclosed'].includes(variant) && selected ? 'background' : variant === 'card' ? 'muted-background' : null
          if (bgToken) consume(item,'background',`tabs-${bgToken}`)
          else assert.equal(cascade(item).background, undefined, context)
          if (['capsule','enclosed'].includes(variant)) consume(list,'background','tabs-muted-background')
          if (variant === 'line' && selected) consume(item,'background','tabs-title-text-color-active','::after')
          const bg = bgToken ? read(`tabs-${bgToken}`) : ['capsule','enclosed'].includes(variant) ? read('tabs-muted-background') : read('tabs-background')
          if (!disabled) contrast(read(`tabs-${token}`),bg)
          states++; root.remove()
        }
      return
    }
    for (const variant of ['circle','dot','arrow','navigation']) for (const status of ['wait','process','finish','error'])
      for (const active of [false,true]) for (const disabled of [false,true]) for (const hover of [false,true]) {
        const root = node(`${p}-steps ${p}-steps-mode-${variant} ${p}-steps-changeable ${p}-steps-label-horizontal`)
        const item = node([`${p}-steps-item`,`${p}-steps-item-${status}`,active && `${p}-steps-item-active`,disabled && `${p}-steps-item-disabled`,hover && 'audit-hover'].filter(Boolean).join(' '),root)
        const content = node(`${p}-steps-item-content`,item)
        const family = variant === 'navigation' ? 'circle' : variant
        const hovered = hover && !active && !disabled && !(variant === 'arrow' && ['process','error'].includes(status))
        const bg = variant === 'arrow' ? read(`steps-arrow-item-bg-${status}`) : read('sys-color-surface-default')
        if (variant === 'arrow') consume(item,'background-color',`steps-arrow-item-bg-${status}`)
        for (const part of ['title','description']) {
          const el = node(`${p}-steps-item-${part}`,content)
          const token = hovered ? 'steps-changeable-hover-text-color' : `steps-${family}-item-${part}-color-${status}`
          consume(el,'color',token)
          if (!disabled) contrast(read(token),bg)
        }
        if (variant === 'circle' || variant === 'navigation') {
          const icon = node(`${p}-steps-icon`,item)
          consume(icon,'background-color',`steps-circle-item-bg-${status}`)
          consume(icon,'color',`steps-circle-item-icon-text-color-${status}`)
          if (!disabled) contrast(read(`steps-circle-item-icon-text-color-${status}`),read(`steps-circle-item-bg-${status}`))
        } else if (variant === 'dot') {
          consume(node(`${p}-steps-item-node`,item),'background-color',`steps-dot-item-bg-${status}`)
          if (!disabled) contrast(read(`steps-dot-item-bg-${status}`),bg,3)
        }
        if (variant === 'navigation' && active) consume(item,'background-color','steps-navigation-ink-bg','::after')
        states++; root.remove()
      }
  }, { pointerMode, themeFileName: component === 'steps' ? null : component })
}
console.log(`Navigation themes passed: ${states} states, ${pairs} contrast pairs, minimum ${minimum.toFixed(3)}:1. Tabs fine/coarse media; Steps node/text states. No browser layout or custom slot validation.`)
