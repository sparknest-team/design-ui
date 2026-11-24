import { defineConfig } from '@configurajs/prettier'

/**
 * 与 cedar / maple 共用同一个预设，保证三仓格式口径一致：
 * 单引号、无分号、printWidth 120、对象折行补尾逗号。
 *
 * trailingComma 与 endOfLine 显式声明，不吃 Prettier 的默认值，
 * 避免上游改默认值时本仓风格被动漂移。
 */
export default defineConfig({
  trailingComma: 'all',
  endOfLine: 'lf',
})
