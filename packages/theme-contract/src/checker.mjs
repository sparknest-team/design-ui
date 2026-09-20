import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import contract from '../contracts/theme-contract.json' with { type: 'json' }
import legacyDenylist from '../contracts/legacy-denylist.json' with { type: 'json' }

const sourceExtensions = new Set(['.less', '.css', '.scss', '.vue', '.ts', '.tsx', '.md'])
const ignoredDirectories = new Set(['node_modules', 'dist', 'coverage'])

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return ignoredDirectories.has(entry.name) ? [] : walk(path)
    return sourceExtensions.has(extname(entry.name)) ? [path] : []
  })
}

function definitions(source, prefix) {
  const pattern = new RegExp(`(--${prefix}-[a-z0-9-]+)\\s*:`, 'g')
  return new Set([...source.matchAll(pattern)].map((match) => match[1]))
}

function systemReferences(source, prefix) {
  const pattern = new RegExp(`var\\(\\s*(--${prefix}-sys-[a-z0-9-]+)`, 'g')
  return new Set([...source.matchAll(pattern)].map((match) => match[1]))
}

function allDefinitions(source, prefix) {
  const names = new Set()
  for (const file of walk(source)) {
    for (const name of definitions(readFileSync(file, 'utf8'), prefix)) names.add(name)
  }
  return names
}

function checkThemeOverrides(name, source, prefix) {
  const defined = allDefinitions(source, prefix)
  const violations = []
  const themesRoot = resolve(source, 'themes')
  for (const file of walk(themesRoot)) {
    const text = readFileSync(file, 'utf8')
    const keys = [...text.matchAll(new RegExp(`['\"](--${prefix}-[a-z0-9-]+)['\"]\\s*:`, 'g'))].map(
      (match) => match[1],
    )
    for (const key of keys) {
      if (key.startsWith(`--${prefix}-internal-`)) violations.push(`${key}: internal token in ${file}`)
      else if (!defined.has(key)) violations.push(`${key}: undefined theme override in ${file}`)
    }
  }
  assert.deepEqual(violations, [], `${name}: invalid theme overrides`)
}

function checkLegacyTokens(name, source, prefix, denied) {
  const violations = []
  const ignored = /\/(?:docs|example|__demos__|__tests__)\//
  for (const file of walk(source)) {
    if (ignored.test(file)) continue
    const text = readFileSync(file, 'utf8')
    for (const token of denied) {
      const fullName = `--${prefix}-${token}`
      const pattern = new RegExp(`${fullName}(?![a-z0-9-])`)
      if (pattern.test(text)) violations.push(`${fullName} in ${file}`)
    }
  }
  assert.deepEqual(violations, [], `${name}: legacy tokens are forbidden`)
}

function checkComponentDocs(name, source, prefix) {
  const violations = []
  const platform = prefix === contract.prefixes.cedar ? 'cedar' : 'maple'
  for (const component of contract.components) {
    const namespace = component === 'field-decorator' ? 'field' : component
    const allowed = new Set(contract.tokens.components[component])
    if (contract.platformExtensions[platform]?.includes(component)) {
      for (const token of logicalComponentTokens({ prefix, source }, component)) allowed.add(token)
    }
    const docsRoot = resolve(source, component, 'docs')
    let files = []
    try {
      files = walk(docsRoot)
    } catch {
      continue
    }
    for (const file of files.filter((path) => path.endsWith('.md'))) {
      const text = readFileSync(file, 'utf8')
      const pattern = new RegExp(
        `--(?:${prefix}-)?${namespace}-([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(?![a-z0-9-])`,
        'g',
      )
      for (const match of text.matchAll(pattern)) {
        if (!allowed.has(match[1])) violations.push(`${match[0]} in ${file}`)
      }
    }
  }
  assert.deepEqual(violations, [], `${name}: component docs contain tokens outside the contract`)
}

function logicalSystemTokens(library) {
  const source = readFileSync(resolve(library.source, 'style/theme/system.less'), 'utf8')
  return [...definitions(source, library.prefix)]
    .filter((name) => name.startsWith(`--${library.prefix}-sys-`))
    .map((name) => name.slice(`--${library.prefix}-sys-`.length))
    .sort()
}

function logicalComponentTokens(library, component) {
  const namespace = component === 'field-decorator' ? 'field' : component
  const tokenPrefix = `--${library.prefix}-${namespace}-`
  const names = new Set()
  for (const file of walk(resolve(library.source, component))) {
    if (/\/(?:docs|example|__demos__|__tests__)\//.test(file)) continue
    for (const name of definitions(readFileSync(file, 'utf8'), library.prefix)) {
      if (name.startsWith(tokenPrefix)) names.add(name.slice(tokenPrefix.length))
    }
  }
  return [...names].sort()
}

export function collectThemeContract({ cedarSource, mapleSource }) {
  const libraries = [
    { name: 'Cedar', prefix: contract.prefixes.cedar, source: cedarSource },
    { name: 'Maple', prefix: contract.prefixes.maple, source: mapleSource },
  ]
  const [cedar, maple] = libraries
  const cedarSystem = logicalSystemTokens(cedar)
  const mapleSystem = logicalSystemTokens(maple)
  assert.deepEqual(cedarSystem, mapleSystem, 'Cedar and Maple system token names differ')

  const components = {}
  for (const component of contract.components) {
    const cedarTokens = logicalComponentTokens(cedar, component)
    const mapleTokens = logicalComponentTokens(maple, component)
    const sharedTokens = cedarTokens.filter((token) => mapleTokens.includes(token))
    components[component] = sharedTokens
  }
  return { system: cedarSystem, components }
}

export function checkThemeContract(options) {
  const actual = collectThemeContract(options)
  assert.deepEqual(actual.system, contract.tokens.system, 'System tokens differ from @ui-foundation/theme-contract')
  assert.deepEqual(actual.components, contract.tokens.components, 'Component tokens differ from @ui-foundation/theme-contract')

  for (const library of [
    { name: 'Cedar', key: 'cedar', prefix: contract.prefixes.cedar, source: options.cedarSource },
    { name: 'Maple', key: 'maple', prefix: contract.prefixes.maple, source: options.mapleSource },
  ]) {
    for (const component of contract.components) {
      const common = contract.tokens.components[component] ?? []
      const current = logicalComponentTokens(library, component)
      const missing = common.filter((token) => !current.includes(token))
      assert.deepEqual(missing, [], `${library.name} ${component} misses common component tokens`)
      if (!contract.platformExtensions[library.key]?.includes(component)) {
        assert.deepEqual(current, common, `${library.name} ${component} has undeclared platform token extensions`)
      }
    }
  }

  for (const [name, prefix, source] of [
    ['Cedar', contract.prefixes.cedar, options.cedarSource],
    ['Maple', contract.prefixes.maple, options.mapleSource],
  ]) {
    const system = new Set(actual.system.map((token) => `--${prefix}-sys-${token}`))
    const unresolved = []
    for (const file of walk(source)) {
      for (const reference of systemReferences(readFileSync(file, 'utf8'), prefix)) {
        if (!system.has(reference)) unresolved.push(`${reference} in ${file}`)
      }
    }
    assert.deepEqual(unresolved, [], `${name}: unresolved system token references`)
  }

  checkThemeOverrides('Cedar', options.cedarSource, contract.prefixes.cedar)
  checkThemeOverrides('Maple', options.mapleSource, contract.prefixes.maple)
  checkLegacyTokens('Cedar', options.cedarSource, contract.prefixes.cedar, legacyDenylist.cedar)
  checkLegacyTokens('Maple', options.mapleSource, contract.prefixes.maple, legacyDenylist.maple)
  checkComponentDocs('Cedar', options.cedarSource, contract.prefixes.cedar)
  checkComponentDocs('Maple', options.mapleSource, contract.prefixes.maple)

  return { systemCount: actual.system.length, componentCount: contract.components.length }
}
