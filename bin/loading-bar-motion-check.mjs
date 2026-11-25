import assert from 'node:assert/strict'
import { auditThemes } from './theme-audit-utils.mjs'

let cases = 0,
  overrides = 0
for (const reducedMotion of [false, true]) {
  await auditThemes(
    'loading-bar',
    ({ tag, cascade, expand, variables }) => {
      tag.className = 'mp-loading-bar'
      const normal = cascade(tag)
      assert.equal(expand(normal.height), '3px')
      assert.equal(normal['background-color'], 'var(--mp-loading-bar-color)')
      tag.classList.add('mp-loading-bar--error')
      assert.equal(cascade(tag)['background-color'], 'var(--mp-loading-bar-error-color)')
      if (reducedMotion) assert.equal(normal.transition, 'none')
      else {
        assert.ok(normal.transition.includes('width var(--mp-loading-bar-transition-duration)'))
        assert.ok(normal.transition.includes('opacity var(--mp-loading-bar-transition-duration)'))
        assert.equal(variables['--mp-loading-bar-transition-duration'], '250ms')
        assert.equal(variables['--mp-loading-bar-transition-timing-function'], 'ease')
        variables['--mp-loading-bar-transition-duration'] = '777ms'
        variables['--mp-loading-bar-transition-timing-function'] = 'linear'
        assert.ok(expand(normal.transition).includes('width 777ms linear'))
        assert.ok(expand(normal.transition).includes('opacity 777ms linear'))
        overrides++
      }
      cases++
    },
    { platforms: ['mp'], themeFileName: null, reducedMotion },
  )
}
console.log(
  `LoadingBar: ${cases} compiled theme/preference cases, ${overrides} paired overrides. No native browser/OS claim.`,
)
