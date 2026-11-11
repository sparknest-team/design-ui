import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
for (const repo of ['cedar-design-web/packages/ui', 'maple-design-mobile/packages/ui']) {
  const root = resolve(workspace, repo)
  const require = createRequire(resolve(root, 'package.json'))
  const { createSSRApp, h } = require('vue')
  const { renderToString } = require('@vue/server-renderer')
  const names = ['input', 'textarea', 'slider', 'list', 'rate', 'search', 'auto-complete', 'verification-code', 'tabs']
  if (repo.startsWith('maple')) names.push('popup')
  for (const name of names) {
    // No CSS loader: runtime entries must not depend on styles.
    const esm = await import(pathToFileURL(resolve(root, 'es', name, 'index.mjs')).href)
    const cjs = require(resolve(root, 'lib', name, 'index.js'))
    assert.ok(esm.default, name + ' ESM entry')
    assert.ok(cjs.default, name + ' CJS entry')
    const props =
      name === 'slider'
        ? { defaultValue: [20, 70], range: true, showInput: true, showTooltip: 'always', ariaLabel: ['Low', 'High'] }
        : name === 'list'
          ? { data: ['one', 'two'], maxHeight: 120, scrollbar: true }
          : name === 'rate'
            ? { defaultValue: 2.5, allowHalf: true }
            : name === 'popup'
              ? { open: false }
              : name === 'verification-code'
                ? { defaultValue: '123456', length: 6, ariaLabel: 'Verification code' }
                : name === 'search'
                  ? { modelValue: 'query', recentSearches: ['history'], ariaLabel: 'Search' }
                  : { defaultValue: 'hello', hint: true, placeholder: 'Name' }
    for (const entry of [esm, cjs]) {
      const renderInstance = () =>
        name === 'tabs'
          ? h(
              entry.default,
              { defaultValue: 'one', lazyLoad: false },
              {
                default: () => [
                  h(entry.TabPane, { name: 'one', title: 'One' }, { default: () => 'First panel' }),
                  h(entry.TabPane, { name: 'two', title: 'Two' }, { default: () => 'Second panel' }),
                ],
              },
            )
          : h(entry.default, props)
      const html = await renderToString(
        createSSRApp({ render: () => h('section', [renderInstance(), renderInstance()]) }),
      )
      assert.ok(html.length > 0)
      assert.ok(!html.includes('NaN') && !html.includes('[object Object]'), name + ' serialized values')
      if (name === 'slider') assert.equal((html.match(/role="slider"/g) || []).length, 4)
      if (name === 'tabs') {
        for (const child of ['TabPane', 'TabNav', 'TabsNavs', 'TabItem', 'TabsItems'])
          assert.ok(entry[child], child + ' export')
        const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
        assert.equal(ids.length, 8, 'two Tabs instances each have two tabs and two panels')
        assert.equal(new Set(ids).size, ids.length, 'Tabs independent ARIA IDs')
        for (const match of html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g)) {
          assert.ok(ids.includes(match[1]), 'Tabs ARIA target ' + match[1])
        }
      }
      if (['input', 'textarea', 'search', 'verification-code'].includes(name)) {
        const ids = [...html.matchAll(/<(?:input|textarea)[^>]*\sid="([^"]+)"/g)].map((match) => match[1])
        const expectedCount = name === 'verification-code' ? 12 : 2
        assert.equal(ids.length, expectedCount, name + ' native inputs')
        assert.equal(new Set(ids).size, expectedCount, name + ' independent label IDs')
      }
    }
    console.log(repo + '/' + name + ': bare ESM/CJS import and two-instance SSR passed')
  }
}
