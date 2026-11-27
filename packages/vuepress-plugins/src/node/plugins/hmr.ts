import { getSourcePages } from '../utils/source-assets.js'
import { handlePageChange as handleVuePressPageChange } from 'vuepress/cli'
import type { App } from '@vuepress/core'
import type { Plugin, HmrContext } from 'vite'

// https://cn.vitejs.dev/guide/api-plugin.html#handlehotupdate
export const vitePageHMR = (app: App): Plugin => {
  return {
    name: 'cedar:code-block-vue:hmr',
    enforce: 'post',
    apply: 'serve',
    async handleHotUpdate(ctx: HmrContext) {
      const paths = new Set<string>()
      for (const module of ctx.modules) {
        for (const importer of module.importers) {
          const tempPath = importer.file
          if (tempPath?.endsWith('.md')) {
            paths.add(tempPath)
          }
        }
      }
      const files = new Set([...getSourcePages(app, ctx.file), ...app.pages
        .filter(page => paths.has(page.chunkFilePath) && !(page as any)._PageMapPluginOptions)
        .map(page => page.filePath)
        .filter((file): file is string => !!file)])
      for (const file of files) await handleVuePressPageChange(app, file)
    },
  }
}
