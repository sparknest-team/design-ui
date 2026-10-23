import assert from 'node:assert/strict'
import { auditThemes } from './theme-audit-utils.mjs'

let states = 0, overrides = 0
for (const component of ['hover', 'icon', 'paper', 'ripple', 'skeleton']) for (const reducedMotion of [false, true]) {
  await auditThemes(component, ({ prefix: p, document, tag, variables, cascade, expand, repo, brand, mode }) => {
    const context = `${repo}/${brand}/${mode}/${component}/reduce=${reducedMotion}`
    const node = (classes, parent = tag) => {
      const el = document.createElement('div')
      el.className = classes
      parent.append(el)
      return el
    }
    const consume = (el, property, suffix) => {
      const key = `--${p}-${component}-${suffix}`, old = variables[key]
      assert.ok(cascade(el)[property].includes(`var(${key})`), context)
      variables[key] = '777ms'
      assert.ok(expand(cascade(el)[property]).includes('777ms'), context)
      variables[key] = old
      overrides++
    }
    const root = node(`${p}-${component}`)
    if (component === 'hover') {
      root.className = `${p}-hover-overlay ${p}-hover-overlay--hovering ${p}-hover-overlay--focusing`
      assert.equal(expand(cascade(root).opacity), '0.12', context)
      if (reducedMotion) assert.equal(cascade(root).transition, 'none', context)
      else consume(root, 'transition', 'transition-duration')
    }
    if (component === 'paper') {
      if (reducedMotion) assert.equal(cascade(root).transition, 'none', context)
      else consume(root, 'transition', 'transition-duration')
    }
    if (component === 'icon') {
      root.className += ` ${p}-icon--spin ${p}-icon--shrinking`
      if (reducedMotion) {
        assert.equal(cascade(root).animation, 'none', context)
        assert.equal(cascade(root).transform, 'none', context)
        assert.equal(cascade(root).transition, 'none', context)
      } else consume(root, 'animation', 'spin-duration')
    }
    if (component === 'ripple') {
      if (reducedMotion) {
        assert.equal(cascade(root).opacity, '0', context)
        assert.equal(cascade(root).transition, 'none', context)
      } else {
        consume(root, 'transition', 'expand-duration')
        consume(root, 'transition', 'fade-duration')
      }
    }
    if (component === 'skeleton') {
      root.className += ` ${p}-skeleton--animation`
      const shimmer = node(`${p}-skeleton__shimmer`, root)
      if (reducedMotion) {
        assert.equal(cascade(shimmer).animation, 'none', context)
        assert.equal(cascade(shimmer).opacity, '0', context)
      } else consume(shimmer, 'animation', 'animation-duration')
      for (const part of ['card', 'avatar', 'title', 'row', 'fullscreen']) {
        const el = node(`${p}-skeleton__${part}`, root)
        if (reducedMotion) assert.equal(cascade(el).transition, 'none', context)
        else consume(el, 'transition', 'transition-duration')
      }
    }
    states++
  }, { reducedMotion, themeFileName: component === 'hover' ? 'hoverOverlay' : component })
}
let modalConsumers = 0, modalOverrides = 0
for (const component of ['drawer', 'popup']) for (const reducedMotion of [false, true]) {
  await auditThemes(component, ({ prefix, document, tag, cascade, expand, variables }) => {
    const durationKey = `--${prefix}-${component}-transition-duration`
    const easingKey = `--${prefix}-${component}-transition-timing-function`
    const checkOverride = el => {
      const duration = variables[durationKey], easing = variables[easingKey]
      assert.ok(cascade(el).transition.includes(`var(${durationKey})`))
      assert.ok(cascade(el).transition.includes(`var(${easingKey})`))
      variables[durationKey] = '600ms'; variables[easingKey] = 'linear'
      assert.match(expand(cascade(el).transition), /600ms linear/)
      variables[durationKey] = duration; variables[easingKey] = easing
      modalOverrides++
    }
    if (component === 'popup') {
      assert.equal(variables[durationKey], '250ms')
      assert.equal(variables[easingKey], 'ease')
    }
    const names = component === 'drawer'
      ? ['fade-drawer', ...['left', 'right', 'top', 'bottom'].map(side => `slide-${side}-drawer`)]
      : ['mp-fade', ...['center', 'left', 'right', 'top', 'bottom'].map(side => `mp-pop-${side}`)]
    for (const name of names) for (const phase of ['enter-active', 'leave-active']) {
      const el = document.createElement('div')
      el.className = name + '-' + phase
      tag.append(el)
      const transition = cascade(el).transition
      if (reducedMotion) assert.equal(transition, 'none', `${name}/${phase}: reduced motion must beat normal CSS`)
      else { assert.match(expand(transition), /(?:ms|s)/, 'real duration consumer'); checkOverride(el) }
      modalConsumers++
    }
    if (reducedMotion) for (const name of names) for (const phase of ['enter-from', 'leave-to']) {
      const el = document.createElement('div')
      el.className = name + '-' + phase
      tag.append(el)
      assert.equal(cascade(el).transform, 'none', 'no scale/slide starting frame')
    }
    if (component === 'popup') for (const part of ['content', 'overlay']) {
      const el = document.createElement('div')
      el.className = `mp-popup__${part}`
      tag.append(el)
      if (reducedMotion) assert.equal(cascade(el).transition, 'none', 'base transition cannot keep running')
      else { assert.equal(expand(cascade(el).transition), 'all 250ms ease', 'preserve existing default duration/easing'); checkOverride(el) }
    }
    states++
  }, { reducedMotion, platforms: component === 'drawer' ? ['c'] : ['mp'] })
}
console.log(`Motion themes passed: ${states} theme/preference cases, ${overrides} primitive duration overrides, ${modalConsumers} modal active consumers and ${modalOverrides} paired duration/easing overrides. Compiled CSS only; no OS preference or browser-frame claim.`)
