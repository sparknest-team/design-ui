import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../../', import.meta.url))
const require = createRequire(root + 'cedar-design-web/packages/ui/package.json')
const { createServer } = require('vite')
const vue = (await import(require.resolve('@vitejs/plugin-vue'))).default
const jsx = (await import(require.resolve('@vitejs/plugin-vue-jsx'))).default
const server = await createServer({
  configFile: false,
  root,
  plugins: [vue(), jsx()],
  resolve: { alias: { vue: require.resolve('vue/dist/vue.esm-bundler.js') }, dedupe: ['vue'] },
  optimizeDeps: { entries: ['design-ui/refactors/token-validation/browser/main.js'] },
  css: { preprocessorOptions: { less: { javascriptEnabled: true } } },
  // Freeze a visual run so unrelated source/docs builds cannot reload it mid-case.
  server: {
    host: '127.0.0.1',
    port: 5198,
    strictPort: true,
    watch:
      process.env.TOKEN_ACCEPTANCE_FROZEN === '1'
        ? null
        : { ignored: ['**/packages/ui/dist/**', '**/packages/ui/site/**', '**/.maple/**'] },
  },
})
await server.listen()
console.log('http://127.0.0.1:5198/design-ui/refactors/token-validation/browser/index.html')
