import { fs } from 'vuepress/utils'
import type { App } from '@vuepress/core'
import type { Plugin } from 'vite'

// VuePress handles every .html navigation as a documentation page. Serve the
// demo shell before the history fallback, including deployments below a base.
export const vitePageProxy = (app: App): Plugin => ({
  name: 'vuepress-demo:preview-entry',
  configureServer(server) {
    const url = app.options.base + '-iframe.html'
    server.middlewares.use(async (request, response, next) => {
      const target = new URL(request.url ?? '/', 'http://localhost')
      if (target.pathname !== url || target.searchParams.has('html-proxy')) return next()
      try {
        const template = await fs.readFile(app.dir.temp('vite-root/-iframe.html'), 'utf8')
        const html = await server.transformIndexHtml(url, template, request.originalUrl)
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.end(html)
      } catch (error) {
        next(error)
      }
    })
  },
})
