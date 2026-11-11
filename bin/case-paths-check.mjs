import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export function actualCase(file, base, cache = new Map()) {
  const parts = relative(base, file).split(sep)
  if (parts[0] === '..' || isAbsolute(relative(base, file))) return undefined
  let current = base
  for (const part of parts) {
    let names
    try {
      names = cache.get(current) ?? readdirSync(current)
      cache.set(current, names)
    } catch { return undefined }
    const matches = names.filter(name => name.toLowerCase() === part.toLowerCase())
    const name = names.includes(part) ? part : matches.length === 1 ? matches[0] : undefined
    if (!name) return undefined
    current = join(current, name)
  }
  return current
}

export function trackedCaseDrift(root) {
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean)
  const lower = new Map()
  const cache = new Map()
  const rows = []
  for (const file of files) {
    const key = file.toLowerCase()
    assert.ok(!lower.has(key), `Case-colliding tracked paths: ${lower.get(key)} / ${file}`)
    lower.set(key, file)
    const actual = actualCase(resolve(root, file), root, cache)
    if (actual && relative(root, actual) !== file) rows.push({ tracked: file, actual: relative(root, actual) })
  }
  return rows
}

export function resolveRelativeCase(source, specifier, base, cache = new Map()) {
  if (!specifier.startsWith('.')) return undefined
  const request = resolve(dirname(source), specifier.split(/[?#]/)[0])
  const extensions = ['.ts', '.tsx', '.vue', '.js', '.jsx', '.mjs', '.cjs', '.json', '.d.ts']
  const candidates = [request, ...extensions.map(extension => request + extension), ...extensions.map(extension => join(request, 'index' + extension))]
  if (/\.[cm]?js$/.test(request)) candidates.push(request.replace(/\.js$/, '.ts'), request.replace(/\.js$/, '.tsx'), request.replace(/\.mjs$/, '.mts'), request.replace(/\.cjs$/, '.cts'))
  for (const candidate of candidates) {
    const actual = actualCase(candidate, base, cache)
    if (actual && statSync(actual).isFile()) return { candidate, actual, matches: candidate === actual }
  }
}

export function auditCasePaths(root) {
  const drift = trackedCaseDrift(root)
  const pkg = 'ui'
  const require = createRequire(join(root, 'packages', pkg, 'package.json'))
  const ts = require('typescript')
  const vue = require('vue/compiler-sfc')
  const files = []
  const skipped = /^(?:node_modules|\.git|\.maple|\.temp.*|\.cache|es|lib|umd|dist)$/
  function walk(directory) {
    let entries
    try { entries = readdirSync(directory, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      const file = join(directory, entry.name)
      if (entry.isDirectory() && !skipped.test(entry.name)) walk(file)
      else if (entry.isFile() && /\.(?:[cm]?[jt]sx?|vue)$/.test(entry.name)) files.push(file)
    }
  }
  for (const item of readdirSync(join(root, 'packages'), { withFileTypes: true })) {
    if (item.isDirectory()) walk(join(root, 'packages', item.name, 'src'))
  }
  walk(join(root, 'packages/cli/site'))
  walk(join(root, 'scripts'))
  walk(join(root, 'checks'))
  walk(join(root, 'packages', pkg, 'docs/.vuepress'))
  const imports = []
  const cache = new Map()
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    const descriptor = extname(file) === '.vue' ? vue.parse(text).descriptor : undefined
    const scripts = descriptor ? [descriptor.script?.content ?? '', descriptor.scriptSetup?.content ?? ''] : [text]
    const specifiers = scripts.flatMap(script => ts.preProcessFile(script, true, true).importedFiles.map(item => item.fileName))
    if (descriptor?.script?.src) specifiers.push(descriptor.script.src)
    for (const specifier of specifiers) {
      const match = resolveRelativeCase(file, specifier, dirname(root), cache)
      if (match && !match.matches) imports.push({ source: relative(root, file), specifier, actual: relative(root, match.actual) })
    }
  }
  return { files: files.length, drift, imports }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? process.cwd())
  const result = auditCasePaths(root)
  assert.deepEqual(result.drift, [], 'Git path spelling must match disk; record case-only renames before publishing')
  assert.deepEqual(result.imports, [], 'Relative imports must match exact filename case on Linux')
  console.log(`${root}: ${result.files} authored modules; Git paths and relative import casing match`)
}
