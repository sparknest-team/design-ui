import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import contract from '../contracts/theme-contract.json' with { type: 'json' }
import legacyDenylist from '../contracts/legacy-denylist.json' with { type: 'json' }
import { normalizeTokenValue } from './normalize-value.mjs'

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

function customPropertyValues(source, prefix) {
  const pattern = new RegExp(`(--${prefix}-[a-z0-9-]+)\\s*:\\s*([^;]+);`, 'g')
  return new Map([...source.matchAll(pattern)].map((match) => [match[1], match[2].replace(/\\s+/g, ' ').trim()]))
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
    if (/\/(?:__tests__|__demos__|example|docs)\//.test(file)) continue
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

function logicalSystemTokenValues(library, expected = contract.systemTokenValues) {
  const source = readFileSync(resolve(library.source, 'style/theme/system.less'), 'utf8')
  const values = customPropertyValues(source, library.prefix)
  return Object.fromEntries(
    Object.keys(expected).map((token) => {
      const name = `--${library.prefix}-sys-${token}`
      assert.ok(values.has(name), `${library.name}: ${name} has no value`)
      return [token, normalizeTokenValue(values.get(name), library.prefix)]
    }),
  )
}

function logicalComponentTokenValues(library, component, expected = contract.componentTokenValues[component]) {
  const namespace = component === 'field-decorator' ? 'field' : component
  // Govern the public :root defaults, not theme-specific overrides later in token.less.
  const source = readFileSync(resolve(library.source, component, 'style/token.less'), 'utf8')
  // Naming examples in comments may contain braces (e.g. {variant}); they are not CSS blocks.
  // Preserve quoted strings so URLs and string-valued defaults are not treated as comments.
  const uncommented = source.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,
    (match) => match.startsWith('//') || match.startsWith('/*') ? '' : match)
  const defaults = [...uncommented.matchAll(/(?:^|\n)\s*:root\s*\{([^}]*)\}/g)].map((match) => match[1]).join('\n')
  const values = customPropertyValues(defaults, library.prefix)
  return Object.fromEntries(
    Object.keys(expected).map((token) => {
      const name = `--${library.prefix}-${namespace}-${token}`
      assert.ok(values.has(name), `${library.name}: ${name} has no value`)
      return [token, normalizeTokenValue(values.get(name), library.prefix)]
    }),
  )
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
  assert.deepEqual(actual.system, contract.tokens.system, 'System tokens differ from @sparknest/theme-contract-vue')
  assert.deepEqual(actual.components, contract.tokens.components, 'Component tokens differ from @sparknest/theme-contract-vue')

  for (const library of [
    { name: 'Cedar', key: 'cedar', prefix: contract.prefixes.cedar, source: options.cedarSource },
    { name: 'Maple', key: 'maple', prefix: contract.prefixes.maple, source: options.mapleSource },
  ]) {
    assert.deepEqual(
      logicalSystemTokenValues(library),
      contract.systemTokenValues,
      `${library.name}: system token values differ from @sparknest/theme-contract-vue`,
    )
    const platformSystem = contract.platformSystemTokenValues?.[library.key] ?? {}
    for (const token of Object.keys(platformSystem)) assert.ok(!(token in contract.systemTokenValues), `${library.name}: duplicate system default ${token}`)
    assert.deepEqual(logicalSystemTokenValues(library, platformSystem), platformSystem, `${library.name}: platform system defaults differ`)
    assert.deepEqual([...Object.keys(contract.systemTokenValues), ...Object.keys(platformSystem)].sort(), actual.system, `${library.name}: every system default must be governed`)
    for (const [component, expected] of Object.entries(contract.componentTokenValues)) {
      assert.deepEqual(
        logicalComponentTokenValues(library, component),
        expected,
        `${library.name} ${component}: component token values differ from @sparknest/theme-contract-vue`,
      )
    }
    for (const [component, expected] of Object.entries(contract.platformComponentTokenValues?.[library.key] ?? {})) {
      for (const token of Object.keys(expected)) {
        assert.ok(!(token in (contract.componentTokenValues[component] ?? {})), `${library.name} ${component}/${token}: duplicate shared and platform default`)
      }
      assert.deepEqual(
        logicalComponentTokenValues(library, component, expected),
        expected,
        `${library.name} ${component}: registered platform defaults differ`,
      )
    }
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

  return {
    systemCount: actual.system.length,
    systemValueCount: Object.keys(contract.systemTokenValues).length,
    platformSystemValueCount: Object.values(contract.platformSystemTokenValues ?? {}).reduce((count, values) => count + Object.keys(values).length, 0),
    componentValueCount: Object.values(contract.componentTokenValues).reduce(
      (count, values) => count + Object.keys(values).length,
      0,
    ),
    componentCount: contract.components.length,
    platformComponentValueCount: Object.values(contract.platformComponentTokenValues ?? {}).reduce(
      (count, components) => count + Object.values(components).reduce((sum, values) => sum + Object.keys(values).length, 0), 0,
    ),
  }
}
