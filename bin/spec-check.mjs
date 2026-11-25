#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const toolRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const configArg = args[args.indexOf('--config') + 1]
const strictWarnings = args.includes('--strict-warnings')

if (!configArg || configArg.startsWith('--')) {
  console.error('Usage: design-system-check --config <config.json> [--strict-warnings]')
  process.exit(2)
}

const configPath = resolve(process.cwd(), configArg)
const config = JSON.parse(readFileSync(configPath, 'utf8'))
const repoRoot = resolve(dirname(configPath), config.repositoryRoot)
const componentRoot = resolve(repoRoot, config.componentRoot)
const issues = []

function add(severity, rule, path, message) {
  issues.push({ severity, rule, path: relative(repoRoot, path), message })
}

function walk(path) {
  if (!existsSync(path)) return []
  return readdirSync(path).flatMap((name) => {
    if (name === 'node_modules' || name === 'dist' || name === 'es' || name === 'lib' || name === 'site') return []
    const child = join(path, name)
    return statSync(child).isDirectory() ? walk(child) : [child]
  })
}

function hasMatchingFile(root, patterns) {
  const files = walk(root).map((path) => relative(root, path).replaceAll('\\', '/'))
  return patterns.some((pattern) => {
    const expression = new RegExp(`^${pattern.replaceAll('.', '\\.').replaceAll('**', '.+').replaceAll('*', '[^/]+')}$`)
    return files.some((file) => expression.test(file))
  })
}

if (!existsSync(componentRoot)) {
  console.error(`Component root does not exist: ${componentRoot}`)
  process.exit(2)
}

const ignored = new Set(config.ignoreComponents ?? [])
const subcomponents = new Set(config.subcomponents ?? [])
const components = readdirSync(componentRoot)
  .map((name) => ({ name, path: join(componentRoot, name) }))
  .filter(({ name, path }) => statSync(path).isDirectory() && existsSync(join(path, 'index.ts')) && !ignored.has(name))

for (const component of components) {
  const isSubcomponent = subcomponents.has(component.name)
  const indexPath = join(component.path, 'index.ts')
  const indexSource = readFileSync(indexPath, 'utf8')

  if (!isSubcomponent && !existsSync(join(component.path, 'props.ts'))) {
    add('warning', 'component/props-file', component.path, 'public component has no props.ts')
  }
  if (!isSubcomponent && !existsSync(join(component.path, config.docs))) {
    add('warning', 'component/docs', component.path, `public component has no ${config.docs}`)
  }
  if (!isSubcomponent && !hasMatchingFile(component.path, config.testGlobs)) {
    add('warning', 'component/tests', component.path, 'public component has no behavior test')
  }

  if (!isSubcomponent && !/export\s+default\s+/m.test(indexSource)) {
    add('warning', 'exports/default', indexPath, 'missing default export')
  }

  const sources = walk(component.path).filter((path) => /\.(?:vue|tsx?|less)$/.test(path))
  for (const sourcePath of sources) {
    const source = readFileSync(sourcePath, 'utf8')
    const relativeSource = relative(component.path, sourcePath).replaceAll('\\', '/')
    const isExample = /(?:^|\/)(?:__demos__|example|__tests__)(?:\/|$)/.test(relativeSource)
    if (!isExample && /console\.log\s*\(/.test(source)) {
      add('error', 'source/no-console-log', sourcePath, 'console.log is forbidden')
    }

    const hardcodedName = new RegExp(
      `(?:name:\\s*['\"]${config.componentPrefix}[A-Z]|defineOptions\\(\\s*\\{\\s*name:\\s*['\"])`,
    )
    if (!isExample && /\.(?:vue|tsx?|ts)$/.test(sourcePath) && hardcodedName.test(source)) {
      add('warning', 'source/namespace-name', sourcePath, 'component name must come from createNamespace()')
    }

    if (sourcePath.endsWith('.less')) {
      for (const match of source.matchAll(/^\s*(--[a-z][a-z0-9-]*)\s*:/gm)) {
        const token = match[1]
        if (!token.startsWith(config.tokenPrefix)) {
          add('error', 'token/prefix', sourcePath, `custom property ${token} must start with ${config.tokenPrefix}`)
        }
      }
      const wrongBem = new RegExp(`&--${config.classPrefix}-[a-z]`)
      if (wrongBem.test(source)) {
        add('error', 'bem/modifier-prefix', sourcePath, `BEM modifier must not repeat ${config.classPrefix}-`)
      }
    }
  }
}

const counts = { error: 0, warning: 0 }
for (const issue of issues) {
  counts[issue.severity] += 1
  const marker = issue.severity === 'error' ? 'ERROR' : 'WARN '
  console.log(`${marker} ${issue.rule} ${issue.path}: ${issue.message}`)
}

console.log(`\n${config.name}: ${components.length} components, ${counts.error} errors, ${counts.warning} warnings`)
console.log(`Shared standards: ${relative(process.cwd(), join(toolRoot, 'standards'))}`)
process.exit(counts.error > 0 || (strictWarnings && counts.warning > 0) ? 1 : 0)
