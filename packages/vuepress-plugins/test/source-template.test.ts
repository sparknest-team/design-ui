import { expect, test } from 'vitest'
import { fileURLToPath } from 'node:url'
import { parseVue } from '../src/node/parse/parseVue'
import { sourceAssetsPlugin } from '../src/node/utils/source-assets'

test('demo templates carry asset URLs rather than encoded source/highlight strings', () => {
  const app = { options: { base: '/' }, env: { isDev: false } } as any
  const compPath = fileURLToPath(new URL('./fixtures/source.vue', import.meta.url))
  const node = parseVue(app, { tag: 'demo' }, {
    compPath, compName: 'VmiExampleSource', compAttrs: { id: 'source' },
  } as any)
  const template = JSON.stringify(node)
  expect(template).toContain('__demo-sources/')
  expect(template).not.toContain('rawCode')
  expect(template).not.toContain('highlightCode')
  expect(template).not.toContain('源码内容')
  const assets: any[] = []
  ;(sourceAssetsPlugin(app).generateBundle as any).call({ emitFile: (asset: any) => assets.push(asset) })
  expect(assets).toHaveLength(1)
  expect(JSON.parse(assets[0].source).rawCode).toContain('源码内容')
  expect(JSON.parse(assets[0].source).highlightCode).toContain('<pre')
})
