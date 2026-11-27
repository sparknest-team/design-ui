import { path, getDirname } from 'vuepress/utils'
import type { Plugin } from '@vuepress/core'
import type { CodeUserConfig, CodeLocaleConfig } from '../shared/index.js'
import { createPageCodeDepsHelper } from './utils/index.js'
import { prepareClientIframe, prepareVmiComponents } from './prepare/index.js'
import { vitePageHMR, vitePageProxy, vitePageIframe } from './plugins/index.js'
import { resolveOptions, resolveHtmlBlock, resolveScriptSetup, resolvePageHeaders } from './resolve/index.js'
import { createHighlightCache } from './utils/highlight-cache.js'
import { sourceAssetsPlugin } from './utils/source-assets.js'
import { finishInitialSourceReads } from './utils/initial-source-reads.js'

const __dirname = getDirname(import.meta.url)

/**
 * Options of cedar:code-block-vue
 */
export interface CodeBlockPluginOptions {
  name: string
  headers: boolean
  config: CodeUserConfig
  locales: CodeLocaleConfig
}

export const codeBlockPlugin = (config: Partial<CodeBlockPluginOptions> = {}): Plugin => {
  const store = createPageCodeDepsHelper()
  let initialized = false

  const options = resolveOptions(config)

  return {
    name: 'cedar:code-block-vue',

    clientConfigFile: path.resolve(__dirname, '../../src/client/clientConfig.ts'),

    extendsMarkdown(md, app) {
      // Locale fallbacks render the same fenced code again. Keep the cache local
      // to this Markdown instance so themes/options cannot leak across apps.
      const highlight = md.options.highlight
      if (highlight) {
        const cached = createHighlightCache()
        md.options.highlight = (code, lang, attrs) =>
          cached(code, JSON.stringify([lang, attrs]), () => highlight(code, lang, attrs))
      }
      resolveHtmlBlock(md, app, store, options)
    },

    async extendsPage(page, app) {
      resolveScriptSetup(page, store)
      resolvePageHeaders(page, store, options.headers)
      if (initialized && app.env.isDev) await prepareVmiComponents(app, store)
    },

    async onInitialized(app) {
      finishInitialSourceReads(app)
      await prepareClientIframe(app)
      await prepareVmiComponents(app, store)
      initialized = true
    },

    extendsBundlerOptions(bundlerOptions, app) {
      if (app.options.bundler.name === '@vuepress/bundler-vite') {
        bundlerOptions.viteOptions ??= {}
        bundlerOptions.viteOptions.plugins ??= []
        bundlerOptions.viteOptions.plugins.push(vitePageHMR(app), vitePageProxy(app), vitePageIframe(app), sourceAssetsPlugin(app))
      }
    },
  }
}
