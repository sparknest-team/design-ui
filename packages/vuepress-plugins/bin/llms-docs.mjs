#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, realpathSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { acquireDocsBuild } from './docs-build-lock.mjs'
import { fileURLToPath } from 'node:url'

const slash = (value) => value.split(path.sep).join('/')
const read = (file) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
const stripFrontmatter = (text) => text.replace(/^---\n[\s\S]*?\n---\n*/, '')

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
    .flatMap((entry) => {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') return []
      const file = path.join(dir, entry.name)
      return entry.isDirectory() ? walk(file) : [file]
    })
}

export function collectPages(root, platform) {
  const pages = []
  const files = [...walk(path.join(root, 'docs')), ...walk(path.join(root, 'src'))]
  for (const file of files) {
    const source = slash(path.relative(root, file))
    let route, locale
    const raw = file.endsWith('.md') ? read(file) : ''
    if (platform === 'cedar') {
      if (!/^(docs\/|src\/.*\/README(?:\.en-US)?\.md$)/.test(source)) continue
      const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
      route = frontmatter.match(/^permalink:\s*(\/\S*)\s*$/m)?.[1]
      if (!route) continue
      locale = route.startsWith('/en/') ? 'en-US' : 'zh-CN'
    } else {
      const match =
        source.match(/^docs\/([^/]+)\.(zh-CN|en-US)\.md$/) ?? source.match(/^src\/(.+)\/docs\/(zh-CN|en-US)\.md$/)
      if (!match) continue
      const [, name, language] = match
      locale = language
      route = `/${locale}/${name}`
    }
    const content = stripFrontmatter(raw)
    const slug =
      route
        .replace(/^\/en\//, '/')
        .replace(/^\/(?:zh-CN|en-US)\//, '/')
        .replace(/^\/|\/$/g, '') || 'index'
    const title =
      content.match(/^#\s+(.+)$/m)?.[1] ??
      raw.match(/^heroText:\s*(.+)$/m)?.[1] ??
      route.split('/').filter(Boolean).at(-1) ??
      'Documentation'
    const output = `llms/${locale}/${slug}.md`
    pages.push({ file, source, route, locale, title, output, content })
  }
  pages.sort((a, b) => a.output.localeCompare(b.output, 'en'))
  const outputs = new Set()
  for (const page of pages) {
    if (outputs.has(page.output)) throw new Error(`Duplicate LLM page: ${page.output}`)
    outputs.add(page.output)
  }
  return pages
}

export function renderPage(page, pages, root, bundled = false) {
  const example = (reference) => {
    const file = path.resolve(path.dirname(page.file), reference.trim())
    if (!file.startsWith(`${path.resolve(root)}${path.sep}`) || !existsSync(file)) {
      throw new Error(`Missing or external demo in ${page.source}: ${reference}`)
    }
    const code = read(file).trimEnd()
    const fence = '`'.repeat(Math.max(3, ...Array.from(code.matchAll(/`+/g), (match) => match[0].length + 1)))
    return `Example source: ${slash(path.relative(root, file))}\n\n${fence}vue\n${code}\n${fence}`
  }
  // Treat a demo fence as an include; all other fences remain literal code.
  let content = page.content.replace(
    /^(`{3,}|~{3,})([^\n]*)\n[\s\S]*?^\1[ \t]*$|<demo\s+src=["']([^"']+)["'][^>]*?(?:\/>|>\s*<\/demo>)/gm,
    (block, fence, info, reference) => {
      if (reference) return example(reference)
      if (info.trim() === 'demo') return example(block.trimEnd().split('\n').slice(1, -1).join('\n'))
      return block
    },
  )
  // Rewrite documentation links to their standalone Markdown counterparts.
  // Leave fenced code untouched, including Vue templates and string literals.
  let inFence = false,
    fence = ''
  content = content
    .split('\n')
    .map((line) => {
      const marker = line.match(/^\s*(`{3,}|~{3,})/)
      if (marker) {
        if (!inFence) {
          inFence = true
          fence = marker[1]
        } else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) inFence = false
        return line
      }
      if (inFence) return line
      return line.replace(/(!?\[[^\]]*\]\()([^\s)]+)(\))/g, (all, start, href, end) => {
        if (/^(?:[a-z]+:|#|\/\/)/i.test(href)) return all
        const [target, hash] = href.split('#')
        const resolved = path.resolve(path.dirname(page.file), target)
        const linked = pages.find(
          (candidate) =>
            candidate.file === resolved || candidate.route.replace(/\/$/, '') === target.replace(/\/$/, ''),
        )
        if (linked) {
          const relative = slash(path.relative(bundled ? '.' : path.dirname(page.output), linked.output))
          return `${start}${relative}${hash ? `#${hash}` : ''}${end}`
        }
        // Public assets are still served by the documentation site.
        if (target.startsWith('/') || /^(?:\.\.?\/)+llms(?:-full)?\.txt$/.test(target)) {
          const relative = slash(
            path.relative(bundled ? '.' : path.dirname(page.output), target.replace(/^(?:\.\.?\/)+|^\//, '')),
          )
          return `${start}${relative}${hash ? `#${hash}` : ''}${end}`
        }
        return all
      })
    })
    .join('\n')
  return `<!-- Source: ${page.source}; locale: ${page.locale}; page: ${page.route} -->\n\n${content.trim()}\n`
}

export function generateDocs({ root, platform, output }) {
  if (!['cedar', 'maple'].includes(platform)) throw new Error('Platform must be cedar or maple')
  const pages = collectPages(root, platform)
  if (!pages.length) throw new Error(`No public documentation found in ${root}`)
  const name = platform === 'cedar' ? 'Cedar Design Web' : 'Maple Design Mobile'
  const prefix = platform === 'cedar' ? 'C / c-' : 'Mp / mp-'
  const intro = `# ${name}\n\n> Vue 3 component library. Package: @${platform}-design/ui-vue. Component prefix: ${prefix}.\n\nRead the quick start and the relevant component page before generating code. Follow the documented props, events, slots, imports and styles. Do not substitute APIs from another component library.\n\n`
  const artifacts = new Map()
  let index = `${intro}Links are relative to this file and work under a documentation deployment subpath. English pages are included only when an authored English source exists.\n\n- [Full documentation](./llms-full.txt): All pages and expanded Vue examples; large context required.\n`
  let full = intro
  for (const locale of ['zh-CN', 'en-US']) {
    let localizedIndex = `${intro}Documentation language: ${locale}.\n\n- [Full documentation](./llms-full.${locale}.txt)\n`
    let localizedFull = `${intro}Documentation language: ${locale}.\n`
    index += `\n## ${locale}\n\n`
    for (const page of pages.filter((page) => page.locale === locale)) {
      const content = renderPage(page, pages, root)
      artifacts.set(page.output, content)
      const entry = `- [${page.title.replace(/[\[\]]/g, '')}](./${page.output}): ${page.route}\n`
      index += entry
      localizedIndex += entry
      const document = `\n---\n\nDocument: ${page.output}\n\n${renderPage(page, pages, root, true)}`
      full += document
      localizedFull += document
    }
    artifacts.set(`llms.${locale}.txt`, localizedIndex)
    artifacts.set(`llms-full.${locale}.txt`, localizedFull)
  }
  artifacts.set('llms.txt', index)
  artifacts.set('llms-full.txt', full)
  // Build all content before touching existing outputs so broken references fail safely.
  for (const [file, content] of artifacts) {
    const destination = path.join(output, file)
    mkdirSync(path.dirname(destination), { recursive: true })
    // Standalone text/Markdown responses may have no HTTP charset. The UTF-8
    // signature prevents browsers from guessing a legacy encoding such as GBK.
    const encoded = '\uFEFF' + content
    if (!existsSync(destination) || readFileSync(destination, 'utf8') !== encoded) {
      writeFileSync(destination, encoded, 'utf8')
    }
  }
  for (const file of walk(path.join(output, 'llms'))) {
    if (!artifacts.has(slash(path.relative(output, file)))) rmSync(file)
  }
  return { pages: pages.length, files: artifacts.size }
}

// Hold the lock through VuePress rendering and its final output hooks.
export function prepareDocsBuild(platform, root, output, destination) {
  const args = process.argv.slice(2)
  const destIndex = args.findIndex(arg => arg === '--dest' || arg === '-d')
  const explicitDest = args.find(arg => arg.startsWith('--dest='))?.slice('--dest='.length)
  const target = explicitDest || (destIndex < 0 ? destination : args[destIndex + 1])
  const release = acquireDocsBuild(root, target && path.resolve(root, target))
  try {
    const result = generateDocs({ platform, root, output })
    console.log(`${platform}: prepared ${result.files} LLM files from ${result.pages} documentation pages`)
    process.once('exit', release)
  } catch (error) {
    release()
    throw error
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [platform, root, output] = process.argv.slice(2)
  if (!root || !output) throw new Error('Usage: ui-docs-llms <cedar|maple> <package-root> <public-output>')
  prepareDocsBuild(platform, path.resolve(root), path.resolve(output))
}
