import assert from 'node:assert/strict'
import { auditThemes } from './theme-audit-utils.mjs'

let cases = 0,
  pairedOverrides = 0,
  instantConsumers = 0
for (const pointerMode of ['fine', 'coarse'])
  for (const reducedMotion of [false, true]) {
    await auditThemes(
      'image',
      ({ prefix: p, document, tag, variables, cascade, expand }) => {
        const root = document.createElement('div')
        root.className = p + '-image-preview'
        tag.append(root)
        const track = document.createElement('div')
        track.className = p + '-image-preview__track'
        track.setAttribute('data-image-preview-track', '')
        root.append(track)
        if (reducedMotion) {
          assert.equal(cascade(track).transition, 'none')
        } else {
          const duration = '--' + p + '-sys-motion-duration-slow'
          const easing = '--' + p + '-sys-motion-easing-standard'
          assert.ok(cascade(track).transition.includes('var(' + duration + ')'))
          assert.ok(cascade(track).transition.includes('var(' + easing + ')'))
          assert.ok(expand(cascade(track).transition).includes('240ms'))
          const oldDuration = variables[duration],
            oldEasing = variables[easing]
          variables[duration] = '888ms'
          variables[easing] = 'linear'
          assert.equal(expand(cascade(track).transition), 'transform 888ms linear')
          variables[duration] = oldDuration
          variables[easing] = oldEasing
          pairedOverrides++
          for (const modifier of ['track-instant', 'track-moving']) {
            track.className = p + '-image-preview__track ' + p + '-image-preview__' + modifier
            assert.equal(cascade(track).transition, 'none')
            instantConsumers++
          }
        }
        cases++
      },
      { reducedMotion, pointerMode, themeFileName: 'imagePreview' },
    )
  }
console.log(
  'Preview track compiled motion: ' +
    cases +
    ' theme/preference cases, ' +
    pairedOverrides +
    ' paired overrides, ' +
    instantConsumers +
    ' instant/moving consumers. Not browser/OS acceptance.',
)
