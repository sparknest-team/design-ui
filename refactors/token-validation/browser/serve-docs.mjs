import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const cedarRoot = fileURLToPath(new URL('../../../../cedar-design-web/packages/ui/', import.meta.url))
const platform = process.argv[2] ?? 'cedar'
if (!['cedar', 'maple'].includes(platform)) throw new Error('Expected cedar or maple')
const root =
  platform === 'cedar'
    ? cedarRoot
    : fileURLToPath(new URL('../../../../maple-design-mobile/packages/ui/', import.meta.url))
const require = createRequire(cedarRoot + 'package.json')
const { preview } = require('vite')
const port = platform === 'cedar' ? 5199 : 5200
await preview({
  configFile: false,
  root,
  build: { outDir: platform === 'cedar' ? 'dist' : 'site' },
  preview: { host: '127.0.0.1', port, strictPort: true },
})
console.log(`http://127.0.0.1:${port}/${platform === 'cedar' ? 'guide/design-tokens/' : '#/zh-CN/designTokens'}`)
