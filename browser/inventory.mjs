import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, relative, resolve } from 'node:path'

export const mapleGuides = [
  'atomic-css',
  'atomic-usage',
  'color',
  'palette',
  'style',
  'themes',
  'typography',
  'utilities',
]
export const cedarGuides = [
  'style/atomic-css',
  'style/atomic-usage',
  'style/color',
  'style/elevation',
  'style/palette',
  'style/typography',
  'style/utilities',
]

export function documentationPages(root, library) {
  const ui = resolve(root, `packages/ui`)
  const src = resolve(ui, 'src')
  const pages = []
  const documents = []
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (library === 'cedar' ? entry.name === 'README.md' : path.endsWith('/docs/zh-CN.md')) documents.push(path)
    }
  }
  walk(src)
  for (const document of documents.sort()) {
    const directory = relative(src, library === 'cedar' ? dirname(document) : dirname(dirname(document)))
    const markdown = readFileSync(document, 'utf8').replace(/<!--[\s\S]*?-->/g, '')
    const themeAlias =
      directory === 'theme-provider' && markdown.includes(library === 'cedar' ? '](/themes/)' : '](#/zh-CN/themes)')
    const demoDocument = themeAlias
      ? resolve(src, library === 'cedar' ? 'themes/README.md' : 'themes/docs/zh-CN.md')
      : document
    const demoMarkdown = themeAlias ? readFileSync(demoDocument, 'utf8').replace(/<!--[\s\S]*?-->/g, '') : markdown
    const route = themeAlias
      ? library === 'cedar'
        ? '/themes/'
        : '/#/zh-CN/themes'
      : library === 'cedar'
        ? /^permalink:\s*(\/components\/\S+)/m.exec(markdown)?.[1]
        : `/#/zh-CN/${directory}`
    if (!route) continue
    const guide = (library === 'cedar' ? cedarGuides : mapleGuides).includes(directory)
    const component = themeAlias
      ? directory
      : guide
        ? directory
        : library === 'cedar'
          ? basename(route.replace(/\/$/, ''))
          : directory
    const references = [
      ...demoMarkdown.matchAll(
        library === 'cedar'
          ? /^[ \t]{0,3}<demo\b[^>]*\bsrc="([^"]+\.vue)"/gm
          : /```demo\s*\n([^\n]+\.vue)\s*\n```|<demo\b[^>]*\bsrc="([^"]+\.vue)"/g,
      ),
    ]
    assert.ok(guide || references.length, `${library}/${component}: component documentation must have a runnable demo`)
    const demos = references.map((match) => {
      const file = resolve(dirname(demoDocument), (match[1] ?? match[2]).trim())
      return { file, name: basename(file), source: readFileSync(file, 'utf8') }
    })
    // The Maple compiler mounts example/index.vue when a guide has no explicit
    // demo references. Account for that actual source instead of counting zero.
    if (library === 'maple' && guide && !demos.length) {
      const file = resolve(dirname(document), '../example/index.vue')
      assert.ok(existsSync(file), `${component}: compiler fallback example must exist`)
      demos.push({ file, name: basename(file), source: readFileSync(file, 'utf8') })
    }
    pages.push({ library, component, document, route, demos, ui, guide })
  }
  return pages
}

export const componentPages = (root, library) => documentationPages(root, library).filter((page) => !page.guide)
export const guidePages = (root, library) => documentationPages(root, library).filter((page) => page.guide)

export function sourceFingerprint(root, library) {
  const source = resolve(root, `packages/ui/src`)
  const hash = createHash('sha256')
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = resolve(directory, entry.name)
      if (entry.isDirectory()) {
        if (entry.name !== '__tests__') walk(file)
      } else if (/\.(?:[cm]?[jt]sx?|vue|less|scss|css|md|json)$/.test(file))
        hash.update(relative(source, file)).update('\0').update(readFileSync(file)).update('\0')
    }
  }
  walk(source)
  return hash.digest('hex')
}

// Component source alone cannot detect a changed compiler, preview runtime,
// dependency link or site theme initializer during production acceptance.
export function productionFingerprint(root, library) {
  const hash = createHash('sha256').update(sourceFingerprint(root, library))
  function walk(directory) {
    if (!existsSync(directory)) return
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = resolve(directory, entry.name)
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && !['__tests__', 'node_modules'].includes(entry.name)) walk(file)
      } else if (
        /\.(?:[cm]?[jt]sx?|vue|less|scss|css|md|json|html|svg)$/.test(file) &&
        !/\.(?:test|spec)\./.test(file)
      ) {
        hash.update(relative(root, file)).update('\0').update(readFileSync(file)).update('\0')
      }
    }
  }
  for (const directory of library === 'cedar'
    ? ['packages/ui/docs', 'packages/ui/docs/.vuepress', 'packages/resolver/src']
    : ['packages/cli/src', 'packages/cli/site', 'packages/resolver/src'])
    walk(resolve(root, directory))
  walk(resolve(root, '../design-ui/packages/ui-doc-preview/src'))
  walk(resolve(root, '../design-ui/packages/ui-build/src'))
  for (const name of [
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    `packages/ui/package.json`,
    `packages/ui/maple.config.js`,
    `packages/ui/maple.config.ts`,
    `packages/ui/maple.config.mjs`,
    'packages/cli/package.json',
    'packages/ui/docs/.vuepress/public/logo.svg',
    '../design-ui/packages/ui-doc-preview/package.json',
  ]) {
    const file = resolve(root, name)
    if (existsSync(file)) hash.update(name).update('\0').update(readFileSync(file)).update('\0')
  }
  return hash.digest('hex')
}

export function demoIndex(page, requested) {
  if (!requested) return 0
  const found = page.demos.findIndex((demo) => demo.file.endsWith(`/${requested}`))
  assert.ok(found >= 0, `${page.library}/${page.component}: contracted demo ${requested} is not documented`)
  return found
}

export function mobileSection(page, demo) {
  const candidates = [
    resolve(page.ui, 'src', page.component, 'example/index.vue'),
    resolve(dirname(demo.file), '../index.vue'),
  ]
  for (const file of candidates) {
    if (!existsSync(file)) continue
    const source = readFileSync(file, 'utf8')
    const imports = [...source.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+\.vue)['"]/g)]
    const binding = imports.find((match) => resolve(dirname(file), match[2]) === demo.file)?.[1]
    if (!binding) continue
    for (const section of source.matchAll(/<section\b[^>]*data-demo="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)) {
      if (new RegExp(`<${binding}(?:\\s|/|>)|:is="[^"]*\\b${binding}\\b[^"]*"`).test(section[2])) return section[1]
    }
  }
  throw new Error(`${page.component}/${demo.name}: documented demo has no matching standalone section`)
}

// Some API documentation (Locale) deliberately embeds another component's
// example. Test its real route instead of inventing a nonexistent mobile page.
export function mobileComponent(page, demo) {
  if (existsSync(resolve(page.ui, 'src', page.component, 'example/index.vue'))) return page.component
  const match = demo.file.match(/\/src\/([^/]+)\/example\/demos\//)
  assert.ok(match, `${page.component}: mobile example route must resolve to a real component`)
  return match[1]
}
