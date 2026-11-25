import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const buildRequire = createRequire(new URL('../packages/ui-build/package.json', import.meta.url))
const { parse } = createRequire(buildRequire.resolve('vite/package.json'))('postcss')

// Host-scoped adapters (.button__loading > .loading) do not embed a dependency's
// implementation. Reject rules owned by the dependency itself, including parts
// and modifiers, instead of rejecting every mention of its class name.
export function assertNoEmbeddedComponentStyles(css, prefix, dependencies, label) {
  const roots = dependencies.map((name) => new RegExp(`^\\.${prefix}-${name}(?=$|[\\s.#:[>+~]|--|__)`))
  parse(css).walkRules((rule) => {
    for (const selector of rule.selectors) {
      assert(!roots.some((root) => root.test(selector.trim())), `${label} embeds dependency styles: ${selector}`)
    }
  })
}
