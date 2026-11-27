import { fileURLToPath } from 'node:url'
import { createMarkdown } from 'vuepress/markdown'
import { expect, test } from 'vitest'
import { resolveHtmlBlock } from '../src/node/resolve/resolveHtmlBlock'
import { resolveOptions } from '../src/node/resolve/resolveOptions'
import { createPageCodeDepsHelper } from '../src/node/utils/dep'
import { getSourcePages, sourceAssetsPlugin } from '../src/node/utils/source-assets'

function fixture() {
  const app = { options: { base: '/' }, env: { isDev: false, isBuild: true } } as any
  const md = createMarkdown()
  const store = createPageCodeDepsHelper()
  resolveHtmlBlock(md, app, store, resolveOptions({}))
  const filePath = fileURLToPath(new URL('./fixtures/source.vue', import.meta.url))
  const pagePath = fileURLToPath(new URL('./fixtures/README.md', import.meta.url))
  const env = { filePath: pagePath }
  const markdown = `<demo src="${filePath}"></demo>`
  const assets = () => {
    const emitted: any[] = []
    ;(sourceAssetsPlugin(app).generateBundle as any).call({ emitFile: (asset: any) => emitted.push(asset) })
    return emitted
  }
  return { app, md, store, filePath, pagePath, env, markdown, assets }
}

test('metadata-only Markdown parsing cannot remove published source assets or dependencies', () => {
  const { md, env, markdown, assets, store, pagePath } = fixture()
  const html = md.render(markdown, env)
  expect(html).toContain('__demo-sources/')
  const before = assets()
  expect(before).toHaveLength(1)
  expect(store.get(pagePath)).toHaveLength(1)
  md.parse('Metadata without the rendered demo', env)
  expect(assets()).toEqual(before)
  expect(store.get(pagePath)).toHaveLength(1)
})

test('rendering the same token stream twice keeps exact source links and emitted assets', () => {
  const { md, env, markdown, assets } = fixture()
  const tokens = md.parse(markdown, env)
  const first = md.renderer.render(tokens, md.options, env)
  const before = assets()
  const second = md.renderer.render(tokens, md.options, env)
  expect(second).toBe(first)
  expect(before).toHaveLength(1)
  expect(assets()).toEqual(before)
})

test('a real demo removal clears that page but preserves other locales and their assets', () => {
  const { app, md, env, markdown, assets, store, filePath, pagePath } = fixture()
  const other = `${pagePath}.en`
  md.render(markdown, env)
  md.render(markdown, { filePath: other })
  expect(getSourcePages(app, filePath).sort()).toEqual([pagePath, other].sort())
  md.render('No demo remains on this page', env)
  expect(store.get(pagePath)).toEqual([])
  expect(store.get(other)).toHaveLength(1)
  expect(getSourcePages(app, filePath)).toEqual([other])
  expect(assets()).toHaveLength(1)
})
