import { mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, expect, test, vi } from 'vitest'
import { clearPageSources, getSourcePages, registerSource, sourceAssetsPlugin } from '../src/node/utils/source-assets'
import { loadSource } from '../src/client/source-data'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })
const source = { name: 'basic.vue', rawCode: '<template>你好 & 100%</template>', highlightCode: '<pre>你好 &amp; 100%</pre>' }
test('emits one content-addressed asset for both locales, replacing edited sources', () => {
  const app = { options: { base: '/docs/' } } as any
  const url = registerSource(app, 'basic:0', source)
  expect(registerSource(app, 'basic:0', source)).toBe(url)
  expect(url).toMatch(/^\/docs\/__demo-sources\/[a-f0-9]{64}\.json$/)
  const plugin = sourceAssetsPlugin(app)
  const emitFile = vi.fn()
  ;(plugin.generateBundle as any).call({ emitFile })
  expect(emitFile).toHaveBeenCalledTimes(1)
  expect(JSON.parse(emitFile.mock.calls[0][0].source)).toEqual(source)
  emitFile.mockClear()
  const changed = registerSource(app, 'basic:0', { ...source, rawCode: 'changed' })
  expect(changed).not.toBe(url)
  ;(plugin.generateBundle as any).call({ emitFile })
  expect(emitFile).toHaveBeenCalledTimes(1)
  expect(JSON.parse(emitFile.mock.calls[0][0].source).rawCode).toBe('changed')
  const other = sourceAssetsPlugin({ options: { base: '/' } } as any)
  emitFile.mockClear()
  ;(other.generateBundle as any).call({ emitFile })
  expect(emitFile).not.toHaveBeenCalled()
})
test('dev only serves registered assets and rejects unknown paths', () => {
  const app = { options: { base: '/docs/' } } as any
  const url = registerSource(app, 'a', source)
  const use = vi.fn()
  ;(sourceAssetsPlugin(app).configureServer as any)({ middlewares: { use } })
  expect(use.mock.calls[0][0]).toBe('/docs/__demo-sources/')
  const handler = use.mock.calls[0][1]
  const response = { setHeader: vi.fn(), end: vi.fn(), statusCode: 200 }
  handler({ url: '/' + url.split('/').pop() }, response)
  expect(JSON.parse(response.end.mock.calls[0][0])).toEqual(source)
  handler({ url: '/../../package.json' }, response)
  expect(response.statusCode).toBe(404)
})
test('source requests deduplicate, preserve exact text and retry after failure', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => source })
  globalThis.fetch = fetcher
  const [first, second] = await Promise.all([loadSource('/source-ok'), loadSource('/source-ok')])
  expect(first).toEqual(source)
  expect(second.rawCode).toBe(source.rawCode)
  expect(fetcher).toHaveBeenCalledTimes(1)
  fetcher.mockResolvedValueOnce({ ok: false, status: 500 })
  await expect(loadSource('/source-retry')).rejects.toThrow('500')
  await expect(loadSource('/source-retry')).resolves.toEqual(source)
})

test('defers dev highlights until requested and reuses the response', () => {
  const app = { options: { base: '/' } } as any
  const highlight = vi.fn(() => '<pre>lazy</pre>')
  const snapshot = { ...source, highlightCode: '' }
  const url = registerSource(app, 'lazy', snapshot, { highlight })
  expect(highlight).not.toHaveBeenCalled()
  const use = vi.fn()
  ;(sourceAssetsPlugin(app).configureServer as any)({ middlewares: { use } })
  const handler = use.mock.calls[0][1]
  const response = { setHeader: vi.fn(), end: vi.fn(), statusCode: 200 }
  const request = { url: '/' + url.split('/').pop() }
  handler(request, response)
  handler(request, response)
  expect(highlight).toHaveBeenCalledTimes(1)
  expect(JSON.parse(response.end.mock.calls[0][0])).toEqual({ ...snapshot, highlightCode: '<pre>lazy</pre>' })
  expect(JSON.parse(response.end.mock.calls[0][0])).not.toHaveProperty('filePath')
})

test('edited and removed assets cannot return an old cached response', () => {
  const app = { options: { base: '/' } } as any
  const url = registerSource(app, 'edit', source, { pagePath: '/page.md', filePath: '/demo.vue' })
  const changed = { ...source, rawCode: '<template>updated</template>', highlightCode: '' }
  const newUrl = registerSource(app, 'edit', changed, { highlight: () => '<pre>updated</pre>', pagePath: '/page.md', filePath: '/demo.vue' })
  expect(newUrl).not.toBe(url)
  const use = vi.fn()
  ;(sourceAssetsPlugin(app).configureServer as any)({ middlewares: { use } })
  const handler = use.mock.calls[0][1]
  const response = { setHeader: vi.fn(), end: vi.fn(), statusCode: 200 }
  handler({ url: '/' + url.split('/').pop() }, response)
  expect(response.statusCode).toBe(404)
  handler({ url: '/' + newUrl.split('/').pop() }, response)
  expect(JSON.parse(response.end.mock.calls[1][0]).rawCode).toBe(changed.rawCode)
  clearPageSources(app, '/page.md')
  handler({ url: '/' + newUrl.split('/').pop() }, response)
  expect(response.statusCode).toBe(404)
  expect(getSourcePages(app, '/demo.vue')).toEqual([])
})


test('HMR resolves symlinked source files to the same registered dependency', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'cedar-source-realpath-'))
  try {
    const file = join(folder, 'data.ts')
    const alias = join(folder, 'alias.ts')
    await writeFile(file, 'export const value = 1')
    await symlink(file, alias)
    const app = { options: { base: '/' } } as any
    registerSource(app, 'alias', source, { filePath: alias, pagePath: '/example.md' })
    expect(getSourcePages(app, file)).toEqual(['/example.md'])
    expect(getSourcePages(app, alias)).toEqual(['/example.md'])
  } finally { await rm(folder, { recursive: true, force: true }) }
})
