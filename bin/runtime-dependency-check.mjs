import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { implementationFiles, runtimeGraph } from './runtime-dependency-graph.mjs'

export const libraries = {
  cedar: { repository: 'cedar-design-web', directory: 'cedar-ui', packageName: '@cedar-design/ui', shared: 'cedar-shared', use: 'cedar-use' },
  maple: { repository: 'maple-design-mobile', directory: 'maple-ui', packageName: '@maple-design/ui', shared: 'maple-shared', use: 'maple-use' },
}

// Parse syntax rather than matching comments/documentation about prohibited workarounds.
export function hmrPolicyViolations(source, file, ts) {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const violations = []
  function scan(node) {
    let reason
    if (ts.isStringLiteral(node) && node.text === 'full-reload') reason = 'forced full-reload'
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(ast).replace(/\s/g, '')
      if (/^(?:(?:window|globalThis|document)\.)?location(?:\.reload|\[['"]reload['"]\])$/.test(callee)) reason = 'location.reload'
      if (/\bhot\.(?:accept|invalidate)$/.test(callee)) reason = 'manual HMR acceptance/invalidation'
    }
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === 'hmr' && node.initializer.kind === ts.SyntaxKind.FalseKeyword) reason = 'disabled HMR'
    if (reason) violations.push({ file, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, reason })
    ts.forEachChild(node, scan)
  }
  scan(ast)
  return violations
}

function toolingFiles(root) {
  if (!existsSync(root)) return []
  const files = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (/^(?:node_modules|lib|es|dist|coverage|__.*__|\.temp.*|\.cache.*|\.git|\.maple)$/.test(entry.name)) continue
    const file = resolve(root, entry.name)
    if (entry.isDirectory()) files.push(...toolingFiles(file))
    else if (/\.[cm]?[jt]sx?$/.test(file) && !/\.d\.ts$|\.(?:test|spec)\./.test(file)) files.push(file)
  }
  return files
}

export function auditRuntimeDependencies(repositoryRoot, library) {
  const config = libraries[library]
  assert.ok(config, `Unknown library: ${library}`)
  const sourceDir = resolve(repositoryRoot, 'packages', config.directory, 'src')
  const require = createRequire(resolve(sourceDir, '../package.json'))
  const ts = require('typescript')
  const { parse } = require('vue/compiler-sfc')
  const workspacePackages = {}
  const roots = implementationFiles(sourceDir)
  for (const directory of [config.shared, config.use]) {
    const pkgRoot = resolve(repositoryRoot, 'packages', directory)
    const pkg = JSON.parse(readFileSync(resolve(pkgRoot, 'package.json'), 'utf8'))
    workspacePackages[pkg.name] = resolve(pkgRoot, 'src/index.ts')
    roots.push(...implementationFiles(resolve(pkgRoot, 'src')))
  }
  const result = runtimeGraph(sourceDir, config.packageName, roots, { workspacePackages })
  const tooling = [
    ...toolingFiles(resolve(repositoryRoot, 'packages', config.directory, 'docs/.vuepress')),
    ...toolingFiles(resolve(repositoryRoot, 'packages', library === 'maple' ? 'maple-cli' : 'cedar-cli', 'src')),
    ...toolingFiles(resolve(repositoryRoot, 'packages', library === 'maple' ? 'maple-vite-plugins' : 'cedar-vite-plugins', 'src')),
  ]
  const violations = []
  for (const file of new Set([...result.graph.keys(), ...tooling])) {
    let source = readFileSync(file, 'utf8')
    if (file.endsWith('.vue')) {
      const { descriptor, errors } = parse(source, { filename: file })
      if (errors.length) throw errors[0]
      source = [descriptor.script?.content, descriptor.scriptSetup?.content].filter(Boolean).join('\n')
    }
    violations.push(...hmrPolicyViolations(source, relative(repositoryRoot, file), ts))
  }
  const report = {
    library, runtimeModules: result.graph.size, toolingModules: tooling.length,
    cycles: result.cycles.map(chain => chain.map(file => relative(repositoryRoot, file))),
    rootImports: result.bareRootImports.map(file => relative(repositoryRoot, file)),
    hmrWorkarounds: violations, externalPackages: result.externalPackages,
  }
  assert.deepEqual(report.cycles, [], `${library}: runtime cycles`)
  assert.deepEqual(report.rootImports, [], `${library}: implementation must not import package root`)
  assert.deepEqual(report.hmrWorkarounds, [], `${library}: do not hide dependency faults with HMR workarounds`)
  return report
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const workspace = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  const selected = args.includes('--library') ? [args[args.indexOf('--library') + 1]] : Object.keys(libraries)
  for (const library of selected) {
    const root = args.includes('--root') ? resolve(args[args.indexOf('--root') + 1]) : resolve(workspace, libraries[library].repository)
    console.log(JSON.stringify(auditRuntimeDependencies(root, library), null, 2))
  }
}
