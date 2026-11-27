import { describe, expect, test, vi } from 'vitest'
import { createHighlightCache } from '../src/node/utils/highlight-cache'
import { createPageCodeDepsHelper } from '../src/node/utils/dep'
import { prepareVmiComponents } from '../src/node/prepare/prepareVmiComponents'
import { vitePageHMR } from '../src/node/plugins/hmr'
import { registerSource } from '../src/node/utils/source-assets'
import { handlePageChange } from 'vuepress/cli'

vi.mock('vuepress/cli', () => ({ handlePageChange: vi.fn() }))

describe('documentation repeated work', () => {
  test('reuses unchanged content but invalidates changed code and languages', () => {
    const cached = createHighlightCache()
    const render = vi.fn(() => '<pre>code</pre>')
    cached('code', 'ts', render)
    cached('code', 'ts', render)
    expect(render).toHaveBeenCalledTimes(1)
    cached('changed', 'ts', render)
    cached('code', 'js', render)
    expect(render).toHaveBeenCalledTimes(3)
  })
  test('evicts old entries and does not retain oversized results', () => {
    const cached = createHighlightCache(20)
    const render = vi.fn(() => 'x')
    cached('a', 'ts', render)
    cached('b', 'ts', render)
    cached('a', 'ts', render)
    cached('c', 'ts', render)
    cached('b', 'ts', render)
    expect(render).toHaveBeenCalledTimes(4)
    const large = vi.fn(() => 'x'.repeat(30))
    cached('big', 'ts', large)
    cached('big', 'ts', large)
    expect(large).toHaveBeenCalledTimes(2)
  })
  test('isolates generated files by app, skips unchanged writes and drops removed demos', async () => {
    const store = createPageCodeDepsHelper()
    store.add({ pagePath: 'page.md', compPath: 'demo.vue', compHash: 'demo', isGenerateIframe: true } as any)
    const app = { pages: [{ filePath: 'page.md' }, { filePath: 'page.md' }], writeTemp: vi.fn() } as any
    await prepareVmiComponents(app, store)
    await prepareVmiComponents(app, store)
    expect(app.writeTemp).toHaveBeenCalledTimes(1)
    expect(app.writeTemp.mock.calls[0][1].match(/import\(/g)).toHaveLength(1)
    const other = { ...app, writeTemp: vi.fn() }
    await prepareVmiComponents(other, store)
    expect(other.writeTemp).toHaveBeenCalledTimes(1)
    store.clear('page.md')
    await prepareVmiComponents(app, store)
    expect(app.writeTemp.mock.calls[1][1]).not.toContain('demo.vue')
  })
  test('updates a shared page once per HMR event and tolerates virtual modules', async () => {
    vi.mocked(handlePageChange).mockClear()
    const app = { pages: [
      { chunkFilePath: 'page.md', filePath: 'page.md' },
      { chunkFilePath: 'en.md', filePath: 'page.md' },
    ] } as any
    const plugin = vitePageHMR(app)
    expect(plugin.apply).toBe('serve')
    await (plugin.handleHotUpdate as any)({ modules: [
      { importers: [{ file: 'page.md' }, { file: null }] },
      { importers: [{ file: 'page.md' }, { file: 'en.md' }] },
    ] })
    expect(handlePageChange).toHaveBeenCalledTimes(1)
    expect(handlePageChange).toHaveBeenCalledWith(app, 'page.md')
  })
})


test('refreshes every page referencing an edited companion source even without direct module importers', async () => {
  vi.mocked(handlePageChange).mockClear()
  const app = { options: { base: '/' }, pages: [] } as any
  const source = { name: 'data.ts', rawCode: 'export const value = 1', highlightCode: '' }
  registerSource(app, 'first', source, { filePath: '/data.ts', pagePath: '/first.md' })
  registerSource(app, 'duplicate', source, { filePath: '/data.ts', pagePath: '/first.md' })
  registerSource(app, 'second', source, { filePath: '/data.ts', pagePath: '/second.md' })
  await (vitePageHMR(app).handleHotUpdate as any)({ file: '/data.ts', modules: [] })
  expect(handlePageChange).toHaveBeenCalledTimes(2)
  expect(handlePageChange).toHaveBeenCalledWith(app, '/first.md')
  expect(handlePageChange).toHaveBeenCalledWith(app, '/second.md')
})
