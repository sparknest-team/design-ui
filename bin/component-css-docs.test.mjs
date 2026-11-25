import assert from 'node:assert/strict'
import test from 'node:test'
import { publicTokens, renderComponentVariables, updateComponentDocument } from './component-css-docs.mjs'

const token = {
  visibility: 'public',
  values: ['8px'],
  definitions: [
    { selector: ':root', value: '8px' },
    { selector: ':root[theme=dark]', value: '12px' },
  ],
  consumer: 'local-css',
  consumerProperties: ['padding'],
}
test('publishes complete scoped public declarations and preserves conditions', () => {
  const report = {
    components: [
      {
        platform: 'c',
        component: 'date',
        tokens: { '--c-date-gap': token, '--c-internal-date-offset': { ...token, visibility: 'internal' } },
      },
      { platform: 'c', component: 'date/picker', tokens: { '--c-date-picker-gap': token } },
      { platform: 'mp', component: 'date', tokens: { '--mp-date-gap': token } },
    ],
  }
  const tokens = publicTokens(report, 'c', 'date')
  assert.deepEqual(Object.keys(tokens), ['--c-date-gap', '--c-date-picker-gap'])
  const block = renderComponentVariables(tokens)
  assert.match(block, /theme=dark/)
  assert.match(block, /`padding`/)
  assert.doesNotMatch(block, /--c-internal/)
  assert.doesNotMatch(block, /--mp-/)
  assert.equal(Object.keys(publicTokens(report, 'c', 'date/picker')).length, 1)
})
test('keeps authored API and semantic notes, replaces partial defaults, and is idempotent', () => {
  const source =
    '# Button\n\n## API\n\n### Button Props\n\n| Prop | Default |\n| --- | --- |\n| size | md |\n\n## CSS Variables\n\nState notes.\n\n| Variable | Default |\n| --- | --- |\n| --c-old | 2px |\n\n### Colors\n\nKeep semantic roles.\n\n## Keyboard\n\nTab focuses.\n'
  const block = renderComponentVariables({ '--c-button-padding': token }, { en: true })
  const next = updateComponentDocument(source, block)
  assert.match(next, /\| size \| md \|/)
  assert.match(next, /State notes/)
  assert.match(next, /Keep semantic roles/)
  assert.match(next, /Tab focuses/)
  assert.doesNotMatch(next, /--c-old/)
  assert.equal(updateComponentDocument(next, block), next)
  assert.equal((next.match(/^## CSS Variables$/gm) ?? []).length, 1)
})
test('documents styleless composition without inventing variables', () => {
  const block = renderComponentVariables({}, { en: true, dependencies: ['input', 'textarea'] })
  assert.match(block, /no independent public CSS variables/)
  assert.match(block, /`input`/)
  assert.doesNotMatch(block, /\| Variable/)
  const source = '# Mention\n\n## API\n\nUse its props.'
  const next = updateComponentDocument(source, block)
  assert.match(next, /Use its props\.\n\n## CSS Variables/)
  assert.equal(updateComponentDocument(next, block), next)
})

test('replaces partial Chinese default tables consistently with their English translations', () => {
  const block = renderComponentVariables({ '--c-button-padding': token })
  const source = '# Button\n\n## CSS Variables\n\n### 颜色\n\n| 变量 | 默认 |\n| --- | --- |\n| --c-old | 2px |\n'
  const result = updateComponentDocument(source, block)
  assert.doesNotMatch(result, /--c-old|\| 变量 \| 默认 \|/)
  assert.equal(updateComponentDocument(result, block), result)
})
test('refuses to document a declaration whose consumption is unreviewed', () => {
  assert.throws(
    () => renderComponentVariables({ '--c-example-unused': { ...token, consumer: 'needs-review' } }),
    /review its consumer/,
  )
})

test('local theme selector extensions preserve baseline and dark documentation conditions', () => {
  const block = renderComponentVariables({
    '--c-demo-gap': {
      ...token,
      definitions: [
        { selector: ':root,\n:where([data-c-theme])', value: '8px' },
        { selector: ':root[cedar-theme="dark"],\n:where([data-c-theme="dark"])', value: '12px' },
      ],
    },
  })
  assert.match(block, /`8px`<br>`12px`/)
  assert.match(block, /cedar-theme="dark"/)
  assert.doesNotMatch(block, /data-c-theme|where\(/)
})

test('preserves semantic-role and purpose tables alongside generated defaults', () => {
  const source =
    '# Switch\n\n## CSS Variables\n\n### Track and handle colors\n\n| Variable suffix (`--c-switch-`) | Default system role | Purpose |\n| --- | --- | --- |\n| track-background | content-secondary | Unchecked track |\n'
  const block = renderComponentVariables(
    {
      '--c-switch-track-background': {
        visibility: 'public',
        values: ['gray'],
        consumer: 'local-css',
        consumerProperties: ['background'],
      },
    },
    { en: true },
  )
  const result = updateComponentDocument(source, block, { en: true })
  assert.match(result, /\| track-background \| content-secondary \| Unchecked track \|/)
  const semantic =
    '# Collapse\n\n## CSS Variables\n\n| Variable | Default semantic value |\n| --- | --- |\n| `--c-collapse-border-color` | `--c-sys-color-border-default` |\n'
  assert.match(updateComponentDocument(semantic, block, { en: true }), /Default semantic value/)
  assert.equal(updateComponentDocument(result, block, { en: true }), result)
})
