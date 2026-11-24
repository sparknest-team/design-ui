import assert from 'node:assert/strict'
import { auditThemes } from './theme-audit-utils.mjs'

let cases = 0,
  reducedCases = 0
await auditThemes(
  'notification',
  ({ tag, cascade, variables, expand }) => {
    for (const [className, duration, easing] of [
      ['c-notification', 'transition-duration', 'transition-timing-function'],
      ...['left', 'right'].flatMap((direction) =>
        ['enter', 'leave'].map((phase) => [
          'slide-' + direction + '-notification-' + phase + '-active',
          'transition-duration-' + phase,
          'transition-timing-function-' + phase,
        ]),
      ),
    ]) {
      tag.className = className
      const transition = cascade(tag).transition
      const timeKey = '--c-notification-' + duration,
        curveKey = '--c-notification-' + easing
      assert.ok(transition.includes('var(' + timeKey + ')'))
      assert.ok(transition.includes('var(' + curveKey + ')'))
      const oldTime = variables[timeKey],
        oldCurve = variables[curveKey]
      variables[timeKey] = '777ms'
      variables[curveKey] = 'linear'
      assert.ok(expand(transition).includes('777ms linear'))
      variables[timeKey] = oldTime
      variables[curveKey] = oldCurve
      cases++
    }
  },
  { platforms: ['c'], themeFileName: null },
)
await auditThemes(
  'notification',
  ({ tag, cascade }) => {
    for (const className of [
      'c-notification',
      ...['left', 'right'].flatMap((direction) =>
        ['enter-from', 'appear-from', 'enter-active', 'appear-active', 'leave-active'].map(
          (phase) => 'slide-' + direction + '-notification-' + phase,
        ),
      ),
    ]) {
      tag.className = className
      const css = cascade(tag)
      if (className.endsWith('-from')) assert.equal(css.transform, 'none', className + ': reduced starting movement')
      else assert.equal(css.transition, 'none', className + ': reduced transition')
      reducedCases++
    }
  },
  { platforms: ['c'], themeFileName: null, reducedMotion: true },
)
console.log(
  'Notification compiled motion: ' +
    cases +
    ' normal consumers/paired overrides; ' +
    reducedCases +
    ' reduced selectors. Not OS/browser acceptance.',
)
