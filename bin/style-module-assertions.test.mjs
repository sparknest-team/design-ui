import assert from 'node:assert/strict'
import test from 'node:test'
import { assertNoEmbeddedComponentStyles } from './style-module-assertions.mjs'

for (const prefix of ['c', 'mp']) {
  test(`${prefix}: host adapters and similarly named components remain allowed`, () => {
    assert.doesNotThrow(() =>
      assertNoEmbeddedComponentStyles(
        `
      .${prefix}-button__loading > .${prefix}-loading { width: 1em; }
      .${prefix}-button .${prefix}-ripple { border-radius: inherit; }
      .${prefix}-loading-bar { height: 2px; }
    `,
        prefix,
        ['loading', 'ripple'],
        'Button',
      ),
    )
  })
  test(`${prefix}: real embedded dependency rules still fail, including nested rules`, () => {
    for (const selector of [
      `.${prefix}-loading`,
      `.${prefix}-loading--circle`,
      `.${prefix}-loading__line`,
      `.${prefix}-ripple`,
      `.${prefix}-button, .${prefix}-loading:hover`,
    ]) {
      assert.throws(
        () =>
          assertNoEmbeddedComponentStyles(
            `@media (width > 1px) { ${selector} { display: flex; } }`,
            prefix,
            ['loading', 'ripple'],
            'Button',
          ),
        /embeds dependency styles/,
      )
    }
  })
}
