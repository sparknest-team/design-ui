import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, extname, resolve } from 'node:path'

/** Analyze emitted runtime imports, not type-only source references. */
/** Include private/orphan modules too: public entry reachability alone misses regressions. */
export function implementationFiles(sourceDir) {
  const files = []
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        if (!/^(?:__.*__|example|examples|docs|node_modules)$/.test(entry.name)) walk(file)
      } else if (/\.(?:[cm]?[jt]sx?|vue)$/.test(entry.name) && !/\.d\.ts$|\.(?:test|spec)\./.test(entry.name))
        files.push(file)
    }
  }
  walk(sourceDir)
  return files.sort()
}

export function runtimeGraph(
  sourceDir,
  packageName,
  roots = implementationFiles(sourceDir),
  { workspacePackages = {} } = {},
) {
  const require = createRequire(resolve(sourceDir, '../package.json'))
  const ts = require('typescript')
  const { parse, compileScript } = require('vue/compiler-sfc')
  const graph = new Map()
  const bareRootImports = []
  const externalPackages = new Set()
  function resolveFile(path) {
    const stem = path.replace(/\.js$/, '')
    return [path, `${stem}.ts`, `${stem}.tsx`, `${stem}.vue`, `${path}/index.ts`, `${path}/index.tsx`].find(
      (file) => existsSync(file) && /\.(?:[cm]?[jt]sx?|vue|css|less|scss|sass|svg|png|jpe?g|gif|webp|json)$/.test(file),
    )
  }
  function visit(file) {
    if (graph.has(file)) return
    graph.set(file, [])
    let source = readFileSync(file, 'utf8')
    if (file.endsWith('.vue')) {
      const { descriptor, errors } = parse(source, { filename: file })
      if (errors.length) throw errors[0]
      source =
        descriptor.script || descriptor.scriptSetup
          ? compileScript(descriptor, {
              id: 'runtime-dependency-graph',
              fs: { fileExists: existsSync, readFile: (file) => readFileSync(file, 'utf8') },
            }).content
          : ''
    }
    const js = ts.transpileModule(source, {
      fileName: file.endsWith('.vue') ? `${file}.ts` : file,
      compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.Preserve },
    }).outputText
    const ast = ts.createSourceFile(file, js, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
    const imports = []
    function scan(node) {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        imports.push(node.moduleSpecifier.text)
      } else if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        imports.push(node.arguments[0].text)
      }
      ts.forEachChild(node, scan)
    }
    scan(ast)
    for (const specifier of imports) {
      let target
      if (specifier.startsWith('.')) target = resolveFile(resolve(dirname(file), specifier))
      else if (specifier === packageName) {
        bareRootImports.push(file)
        target = resolveFile(resolve(sourceDir, 'index'))
      } else if (specifier.startsWith(packageName + '/')) {
        target = resolveFile(resolve(sourceDir, specifier.slice(packageName.length + 1)))
      } else if (workspacePackages[specifier]) {
        target = resolveFile(workspacePackages[specifier])
        if (!target) throw new Error(`Missing workspace source: ${specifier}`)
      } else if (!specifier.startsWith('.')) {
        externalPackages.add(specifier)
      }
      if (
        !target &&
        specifier.startsWith('.') &&
        !/\.(?:css|less|scss|sass|svg|png|jpe?g|gif|webp|json)$/.test(specifier)
      ) {
        throw new Error(`Unresolved runtime dependency: ${file} -> ${specifier}`)
      }
      if (!target || !/\.(?:[cm]?[jt]sx?|vue)$/.test(target)) continue
      if (target === resolve(sourceDir, 'index.ts') && !bareRootImports.includes(file)) bareRootImports.push(file)
      graph.get(file).push(target)
      visit(target)
    }
  }
  for (const root of roots) visit(resolve(sourceDir, root))
  return { graph, cycles: findRuntimeCycles(graph), bareRootImports, externalPackages: [...externalPackages].sort() }
}

export function findRuntimeCycles(graph) {
  const cycles = []
  const active = new Set(),
    complete = new Set(),
    stack = []
  function inspect(file) {
    if (active.has(file)) {
      cycles.push([...stack.slice(stack.indexOf(file)), file])
      return
    }
    if (complete.has(file)) return
    active.add(file)
    stack.push(file)
    for (const target of graph.get(file) ?? []) inspect(target)
    stack.pop()
    active.delete(file)
    complete.add(file)
  }
  for (const file of graph.keys()) inspect(file)
  return cycles
}
