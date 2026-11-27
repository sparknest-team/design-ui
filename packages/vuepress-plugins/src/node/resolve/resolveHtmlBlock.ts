import type { App } from '@vuepress/core'
import type { Markdown, MarkdownEnv } from 'vuepress/markdown'
import type { CodeBlockPluginOptions } from '../index.js'
import type { PageCodeDepsHelper } from '../utils/index.js'
import { clearPageSources } from '../utils/source-assets.js'
import { parseCodeBlock } from '../parse/index.js'

export const resolveHtmlBlock = (
  md: Markdown,
  app: App,
  store: PageCodeDepsHelper,
  options: CodeBlockPluginOptions,
) => {
  // Search/metadata plugins also call md.parse with the page's filePath, but
  // never render its demo tokens. Only a real render may replace that page's
  // dependency/source registrations; parse-only passes must be read-only.
  const render = md.renderer.render
  md.renderer.render = function (tokens, opts, env) {
    if (env?.filePath) {
      store.clear(env.filePath)
      clearPageSources(app, env.filePath)
    }
    return render.call(this, tokens, opts, env)
  }
  const rawRule = md.renderer.rules.html_inline!

  md.renderer.rules.html_inline = function (tokens, idx, opts, env: MarkdownEnv, self) {
    const content = tokens[idx].content

    if (content.startsWith(`<${options.name}`)) {
      tokens[idx].content = parseCodeBlock(app, store, options, content, env.filePath!)
      try {
        return rawRule(tokens, idx, opts, env, self)
      } finally {
        // Markdown renderers can reuse a parsed token stream. Keep its authored
        // <demo> token so the next render can register the same assets again.
        tokens[idx].content = content
      }
    }

    return rawRule(tokens, idx, opts, env, self)
  }
}
