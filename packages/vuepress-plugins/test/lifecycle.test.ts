import { expect, test, vi } from 'vitest'
import { codeBlockPlugin } from '../src/node/codeBlockPlugin'
import { prepareClientIframe, prepareVmiComponents } from '../src/node/prepare'

vi.mock('../src/node/prepare', () => ({ prepareClientIframe: vi.fn(), prepareVmiComponents: vi.fn() }))
vi.mock('../src/node/resolve', () => ({
  resolveOptions: () => ({}), resolveHtmlBlock: vi.fn(), resolveScriptSetup: vi.fn(), resolvePageHeaders: vi.fn(),
}))
vi.mock('../src/node/plugins', () => ({ vitePageHMR: vi.fn(), vitePageProxy: vi.fn(), vitePageIframe: vi.fn() }))

test('initialization batches all pages into one map; only dev changes refresh it', async () => {
  for (const isDev of [false, true]) {
    vi.mocked(prepareVmiComponents).mockClear()
    const plugin = codeBlockPlugin() as any
    const app = { env: { isDev }, pages: [] }
    for (let i = 0; i < 100; i++) await plugin.extendsPage({}, app)
    expect(prepareVmiComponents).not.toHaveBeenCalled()
    await plugin.onInitialized(app)
    expect(prepareClientIframe).toHaveBeenCalled()
    expect(prepareVmiComponents).toHaveBeenCalledTimes(1)
    await plugin.extendsPage({}, app)
    expect(prepareVmiComponents).toHaveBeenCalledTimes(isDev ? 2 : 1)
  }
})


test('reuses fenced highlights across locales while respecting metadata, edits and app isolation', () => {
  const render = vi.fn((code, lang, attrs) => `${lang}:${attrs}:${code}`)
  const md = { options: { highlight: render } }
  const plugin = codeBlockPlugin() as any
  plugin.extendsMarkdown(md, {})
  expect(md.options.highlight('const a = 1', 'ts', '')).toBe('ts::const a = 1')
  md.options.highlight('const a = 1', 'ts', '')
  expect(render).toHaveBeenCalledTimes(1)
  md.options.highlight('const a = 1', 'ts', '{1}')
  md.options.highlight('const a = 1', 'js', '')
  md.options.highlight('const a = 2', 'ts', '')
  expect(render).toHaveBeenCalledTimes(4)
  const other = { options: { highlight: render } }
  plugin.extendsMarkdown(other, {})
  other.options.highlight('const a = 1', 'ts', '')
  expect(render).toHaveBeenCalledTimes(5)
})
