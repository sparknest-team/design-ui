import { defineUserConfig } from 'vuepress'
import { codeBlockPlugin } from './codeBlockPlugin.js'

export function defineDemoSite(config: Parameters<typeof defineUserConfig>[0]) {
  return defineUserConfig({ ...config, plugins: [...(config.plugins ?? []), codeBlockPlugin()] })
}
