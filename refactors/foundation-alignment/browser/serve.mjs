import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../../', import.meta.url))
const require = createRequire(path.join(root, 'cedar-design-web/packages/ui/package.json'))
const { createServer } = require('vite')
const { default: vue } = await import(require.resolve('@vitejs/plugin-vue'))
const { default: jsx } = await import(require.resolve('@vitejs/plugin-vue-jsx'))
const server = await createServer({
  configFile: false,
  root,
  optimizeDeps: {
    entries: [
      'design-ui/refactors/foundation-alignment/browser/main.js',
      'design-ui/refactors/foundation-alignment/browser/menu.js',
      'design-ui/refactors/foundation-alignment/browser/bubbles.js',
    ],
  },
  plugins: [
    vue(),
    jsx(),
    {
      name: 'trigger-ssr-fixture',
      configureServer(server) {
        server.middlewares.use('/trigger-ssr', async (request, response) => {
          try {
            const { render } = await server.ssrLoadModule('/design-ui/refactors/foundation-alignment/browser/ssr.js')
            const name = new URL(request.url, 'http://localhost').searchParams.get('name')
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ html: await render(name) }))
          } catch (error) {
            response.statusCode = 500
            response.end(String(error))
          }
        })
      },
    },
  ],
  resolve: {
    alias: {
      'vue/server-renderer': require.resolve('@vue/server-renderer/dist/server-renderer.esm-bundler.js'),
      '@vue/server-renderer': require.resolve('@vue/server-renderer/dist/server-renderer.esm-bundler.js'),
      vue: require.resolve('vue/dist/vue.esm-bundler.js'),
    },
    dedupe: ['vue'],
  },
  server: { host: '127.0.0.1', port: 5197, strictPort: true },
})
await server.listen()
console.log('http://127.0.0.1:5197/design-ui/refactors/foundation-alignment/browser/index.html')
