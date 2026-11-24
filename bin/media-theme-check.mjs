import assert from 'node:assert/strict'
import { auditThemes } from './theme-audit-utils.mjs'

let states = 0
let overrides = 0
for (const pointerMode of ['fine', 'coarse']) {
  await auditThemes(
    'image',
    ({ document, tag, cascade, variables, expand }) => {
      for (const direction of ['left', 'right'])
        for (const disabled of [false, true]) {
          const arrow = document.createElement('button')
          arrow.className = `mp-image-preview__arrow-${direction} audit-hover`
          arrow.disabled = disabled
          tag.append(arrow)
          const name = `--mp-image-preview-arrow-background${pointerMode === 'fine' && !disabled ? '-hover' : ''}`
          assert.equal(cascade(arrow)['background-color'], `var(${name})`)
          const previous = variables[name]
          variables[name] = '#123456'
          assert.equal(expand(cascade(arrow)['background-color']), '#123456')
          variables[name] = previous
          states++
          overrides++
          arrow.remove()
        }
    },
    { platforms: ['mp'], themeFileName: null, pointerMode },
  )
}
for (const reducedMotion of [false, true]) {
  await auditThemes(
    'carousel',
    ({ prefix, document, tag, variables, cascade, expand }) => {
      // Assert the compiled result, not Less source: slash alpha must not become division.
      for (const [suffix, channels, alpha] of [
        ['indicator-color-default', '255 255 255', '35%'],
        ['arrow-background', '0 0 0', '35%'],
        ['arrow-background-hover', '0 0 0', '55%'],
      ]) {
        assert.equal(
          variables[`--${prefix}-carousel-${suffix}`],
          `rgb(${channels} / ${alpha})`,
          `${prefix} ${suffix} preserves all channels and alpha after Less compilation`,
        )
      }
      const node = (name, parent = tag) => {
        const el = document.createElement('div')
        el.className = `${prefix}-${name}`
        parent.append(el)
        return el
      }
      const consume = (el, property, suffix, value) => {
        const key = `--${prefix}-carousel-${suffix}`
        assert.ok(variables[key], key + ' declared')
        assert.ok(cascade(el)[property]?.includes(`var(${key})`), key + ' consumed')
        const previous = variables[key]
        variables[key] = value
        assert.ok(expand(cascade(el)[property]).includes(value), key + ' instance override')
        variables[key] = previous
        overrides++
      }
      tag.className = `${prefix}-carousel ${prefix}-carousel--slide`
      const track = node('carousel__track')
      const item = node('carousel-item', track)
      const arrow = node('carousel__arrow')
      consume(arrow, 'width', 'arrow-size', '53px')
      consume(arrow, 'color', 'arrow-color', '#123456')
      for (const effect of ['slide', 'fade', 'card']) {
        tag.className = `${prefix}-carousel ${prefix}-carousel--${effect}`
        const target = effect === 'slide' ? track : item
        if (reducedMotion) assert.equal(cascade(target).transition, 'none', effect + ' respects reduced motion')
        else consume(target, 'transition', effect === 'slide' ? 'transition-duration' : `${effect}-duration`, '777ms')
        states++
      }
    },
    { reducedMotion, pointerMode: 'fine' },
  )
}
for (const pointerMode of ['fine', 'coarse'])
  await auditThemes(
    'upload',
    ({ prefix, document, tag, variables, cascade, expand }) => {
      tag.className = `${prefix}-upload`
      const node = (name) => {
        const el = document.createElement('div')
        el.className = `${prefix}-upload__${name}`
        tag.append(el)
        return el
      }
      const trigger = node('trigger')
      const action = node('action')
      const item = node('item')
      const consume = (el, property, suffix, value) => {
        const key = `--${prefix}-upload-${suffix}`
        assert.ok(variables[key], key + ' declared')
        assert.ok(cascade(el)[property]?.includes(`var(${key})`), key + ' consumed')
        const previous = variables[key]
        variables[key] = value
        assert.ok(expand(cascade(el)[property]).includes(value), key + ' instance override')
        variables[key] = previous
        overrides++
      }
      consume(tag, 'color', 'text-color', '#123456')
      consume(trigger, 'background', 'background', '#abcdef')
      consume(trigger, 'min-height', 'trigger-min-height', '61px')
      consume(action, 'width', 'action-size', '47px')
      item.classList.add(`${prefix}-upload__item--error`)
      consume(item, 'color', 'error-color', '#654321')
      trigger.setAttribute('aria-disabled', 'true')
      consume(trigger, 'opacity', 'disabled-opacity', '0.37')
      states++
    },
    { pointerMode },
  )
console.log(
  `Media themes passed: ${states} theme/state cases and ${overrides} token overrides. Compiled CSS checks, not browser visual acceptance.`,
)
