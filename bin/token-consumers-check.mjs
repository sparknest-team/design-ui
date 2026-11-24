import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { liveTokens } from './token-consumer-graph.mjs'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(resolve(workspace, 'cedar-design-web/packages/ui/package.json'))
const postcss = require('postcss')
let checked = 0
for (const [repo, pkg, prefix] of [
  ['cedar-design-web', 'ui', 'c'],
  ['maple-design-mobile', 'ui', 'mp'],
]) {
  const root = resolve(workspace, repo, 'packages', pkg, 'src')
  const less = prefix === 'c' ? require('less') : createRequire(resolve(root, '../../cli/package.json'))('less')
  for (const component of prefix === 'c' ? ['badge', 'tag', 'input-tag'] : ['badge', 'tag']) {
    const { css } = await less.render(`@import "${component}/style/index.less";`, {
      paths: [root],
      javascriptEnabled: true,
    })
    const declarations = []
    postcss.parse(css).walkDecls(({ prop, value }) => declarations.push({ prop, value }))
    const declared = new Set(
      declarations.filter((d) => d.prop.startsWith(`--${prefix}-${component}-`)).map((d) => d.prop),
    )
    const live = liveTokens(declarations)
    for (const name of declared) {
      assert.ok(live.has(name), `${repo}/${component}: no compiled CSS consumer for ${name}`)
      checked++
    }
  }
}
// InputTag is Cedar-only. Guard the removed integration in compiled output.
const { css: inputTagCss } = await require('less').render('@import "input-tag/style/index.less";', {
  paths: [resolve(workspace, 'cedar-design-web/packages/ui/src')],
  javascriptEnabled: true,
})
assert.doesNotMatch(inputTagCss, /c-icon-hover|tag-custom-icon-bg-hover|input-tag-tag-remove-icon-color-bg/)
console.log(
  `Token consumers passed: ${checked} Badge/Tag and Cedar InputTag declarations, no exceptions; InputTag legacy CSS absent. CSS reachability only, not DOM/visual proof.`,
)
