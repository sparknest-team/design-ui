import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { expect, test, vi } from 'vitest'
import { parseVue } from '../src/node/parse/parseVue'
import { clearPageSources, getSourcePages, sourceAssetsPlugin } from '../src/node/utils/source-assets'

test('reparsing edited demos and companion files produces fresh URLs, highlights and copy text', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'cedar-source-update-'))
  try {
    const compPath = join(folder, 'demo.vue')
    const dataPath = join(folder, 'data.ts')
    const pagePath = join(folder, 'README.md')
    await writeFile(compPath, '<script setup lang="ts">\nimport { value } from "./data"\n</script>\n<template>before</template>')
    await writeFile(dataPath, 'export const value = 1')
    const app = { options: { base: '/' }, env: { isDev: true } } as any
    const render = () => {
      clearPageSources(app, pagePath)
      return JSON.stringify(parseVue(app, { tag: 'demo' }, {
        compPath, pagePath, compName: 'Demo', compAttrs: { id: 'demo' },
      } as any)).match(/__demo-sources\/[a-f0-9]{64}\.json/g)!
    }
    const use = vi.fn()
    ;(sourceAssetsPlugin(app).configureServer as any)({ middlewares: { use } })
    const request = (url: string) => {
      const response = { setHeader: vi.fn(), end: vi.fn(), statusCode: 200 }
      use.mock.calls[0][1]({ url: '/' + url.split('/').pop() }, response)
      return JSON.parse(response.end.mock.calls[0][0])
    }
    const before = render()
    expect(before).toHaveLength(2)
    expect(getSourcePages(app, dataPath)).toEqual([pagePath])
    expect(request(before[0]).rawCode).toContain('before')
    expect(request(before[1]).highlightCode).toContain('<pre')
    await writeFile(dataPath, 'export const value = 2')
    const updatedImport = render()
    expect(updatedImport[0]).toBe(before[0])
    expect(updatedImport[1]).not.toBe(before[1])
    expect(request(updatedImport[1]).rawCode).toBe('export const value = 2')
    await writeFile(compPath, '<template>after</template>')
    const updatedDemo = render()
    expect(updatedDemo).toHaveLength(1)
    expect(updatedDemo[0]).not.toBe(before[0])
    const latest = request(updatedDemo[0])
    expect(latest.rawCode).toBe('<template>after</template>')
    expect(latest.highlightCode).toContain('after')
    expect(latest.highlightCode).not.toContain('before')
    expect(getSourcePages(app, dataPath)).toEqual([])
  } finally {
    await rm(folder, { recursive: true, force: true })
  }
})
