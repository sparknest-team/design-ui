import { createHash } from 'node:crypto'
import { realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import type { App } from '@vuepress/core'
import type { Plugin } from 'vite'
import type { CodeSource } from '../../shared/index.js'

interface SourceEntry {
  id: string
  json: string
  source: CodeSource
  filePath?: string
  pagePath?: string
  highlight?: () => string
}
const stores = new WeakMap<App, Map<string, SourceEntry>>()
function sources(app: App) {
  let store = stores.get(app)
  if (!store) stores.set(app, store = new Map())
  return store
}

export function clearPageSources(app: App, pagePath: string) {
  for (const [key, entry] of sources(app)) {
    if (entry.pagePath === pagePath) sources(app).delete(key)
  }
}

function canonicalFile(filePath: string) {
  try { return realpathSync(filePath) } catch { return resolve(filePath) }
}

export function getSourcePages(app: App, filePath: string): string[] {
  if (!filePath) return []
  filePath = canonicalFile(filePath)
  return [...new Set([...sources(app).values()]
    .filter(entry => entry.filePath === filePath && entry.pagePath)
    .map(entry => entry.pagePath!))]
}

function sourceJson(entry: SourceEntry) {
  if (entry.highlight) {
    entry.json = JSON.stringify({ ...entry.source, highlightCode: entry.highlight() })
    entry.highlight = undefined
  }
  return entry.json
}

export function registerSource(app: App, key: string, source: CodeSource, options: {
  filePath?: string
  pagePath?: string
  highlight?: () => string
} = {}) {
  // Store immutable content, never a callback that rereads a mutable file. A source
  // edit gets a new URL, including when its imported companion file changes.
  const snapshot = { name: source.name, rawCode: source.rawCode, highlightCode: source.highlightCode }
  const json = JSON.stringify(snapshot)
  const id = createHash('sha256').update(json).digest('hex')
  // Replace a file's old version during HMR rather than retaining every edit.
  const previous = sources(app).get(key)
  sources(app).set(key, previous?.id === id ? previous : { id, json, source: snapshot, ...options, filePath: options.filePath ? canonicalFile(options.filePath) : undefined })
  return `${app.options.base}__demo-sources/${id}.json`
}

export function sourceAssetsPlugin(app: App): Plugin {
  let ssr = false
  return {
    name: 'cedar-demo-source-assets',
    configResolved(config) { ssr = !!config.build.ssr },
    configureServer(server) {
      server.middlewares.use(`${app.options.base}__demo-sources/`, (request, response) => {
        const id = request.url?.split('?')[0]?.match(/^\/?([a-f0-9]{64})\.json$/)?.[1]
        const source = id && [...sources(app).values()].find(item => item.id === id)
        if (!source) { response.statusCode = 404; response.end(); return }
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Cache-Control', 'no-cache')
        response.end(sourceJson(source))
      })
    },
    generateBundle() {
      if (ssr) return
      const emitted = new Set<string>()
      for (const entry of sources(app).values()) {
        const { id } = entry
        if (emitted.has(id)) continue
        emitted.add(id)
        this.emitFile({ type: 'asset', fileName: `__demo-sources/${id}.json`, source: sourceJson(entry) })
      }
    },
  }
}
