export * from '../packages/vuepress-plugins/bin/llms-docs.mjs'
import { prepareDocsBuild } from '../packages/vuepress-plugins/bin/llms-docs.mjs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [platform, root, output] = process.argv.slice(2)
  if (!root || !output) throw new Error('Usage: node llms-docs.mjs <cedar|maple> <package-root> <public-output>')
  prepareDocsBuild(platform, resolve(root), resolve(output))
}
