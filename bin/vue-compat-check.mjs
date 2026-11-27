import ts from 'typescript-js'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const json = (file) => JSON.parse(readFileSync(file, 'utf8'))
const packages = ['shared', 'use', 'icons', 'ui']
const versions = ['3-3', '3-4', 'current']

function walk(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (/^(?:node_modules|__tests__|__demos__|example|docs|style)$/.test(entry.name)) return []
    const file = join(root, entry.name)
    return entry.isDirectory() ? walk(file) : [file]
  })
}

// Parse code rather than matching strings: comments, aliases and type imports must
// not produce false positives. The same checker handles generated ESM and CJS.
export function inspectVueCode(ts, text, file, exportsFor, source = false) {
  if (source)
    text = ts.transpileModule(text, {
      fileName: file.replace(/\.vue$/, '.ts'),
      compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.Preserve },
    }).outputText
  const ast = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  // Bind the single in-memory file so hoisting and shadowing follow TypeScript's
  // lexical resolution without loading dependencies or type definitions.
  const program = ts.createProgram(
    [file],
    { allowJs: true, alwaysStrict: true, noLib: true, noResolve: true, types: [] },
    {
      getSourceFile: (name) => (name === file ? ast : undefined),
      getDefaultLibFileName: () => '',
      getCurrentDirectory: () => '',
      getCanonicalFileName: (name) => name,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => '\n',
      fileExists: (name) => name === file,
      readFile: (name) => (name === file ? text : undefined),
    },
  )
  const checker = program.getTypeChecker()
  const symbolFor = (node) => checker.resolveName(node.text, node, ts.SymbolFlags.Value | ts.SymbolFlags.Alias, false)
  const requireModule = (node) => {
    const call = node.initializer
    if (
      call &&
      ts.isCallExpression(call) &&
      ts.isIdentifier(call.expression) &&
      call.expression.text === 'require' &&
      !symbolFor(call.expression) &&
      call.arguments[0] &&
      ts.isStringLiteral(call.arguments[0])
    )
      return call.arguments[0].text
  }
  const namespaceModule = (node) => {
    if (!ts.isIdentifier(node)) return
    for (const declaration of symbolFor(node)?.declarations ?? []) {
      if (ts.isNamespaceImport(declaration) && !declaration.parent.isTypeOnly) {
        const specifier = declaration.parent.parent.moduleSpecifier
        if (ts.isStringLiteral(specifier)) return specifier.text
      }
      if (ts.isVariableDeclaration(declaration) && ts.isIdentifier(declaration.name)) {
        const module = requireModule(declaration)
        if (module !== undefined) return module
      }
    }
  }
  const vueName = (node) => {
    if (ts.isIdentifier(node)) {
      const symbol = symbolFor(node)
      // Preserve checks for unbound compiler macros and auto-imports.
      if (!symbol) return node.text
      const declaration = symbol.declarations?.[0]
      if (declaration && ts.isImportSpecifier(declaration) && !declaration.isTypeOnly) {
        const clause = declaration.parent.parent
        const specifier = clause.parent.moduleSpecifier
        if (!clause.isTypeOnly && ts.isStringLiteral(specifier) && specifier.text === 'vue') {
          return (declaration.propertyName ?? declaration.name).text
        }
      }
    }
    if (ts.isPropertyAccessExpression(node) && namespaceModule(node.expression) === 'vue') return node.name.text
  }
  const issues = []
  const check = (module, name, node) => {
    const available = exportsFor(module)
    if (available && !available.has(name)) {
      const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1
      issues.push(`${file}:${line}: ${module}.${name} is unavailable in Vue 3.2.47`)
    }
  }
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const module = node.moduleSpecifier.text
      const clause = node.importClause
      if (clause && !clause.isTypeOnly) {
        const bindings = clause.namedBindings
        if (bindings && ts.isNamedImports(bindings)) {
          for (const item of bindings.elements)
            if (!item.isTypeOnly) {
              const name = (item.propertyName ?? item.name).text
              check(module, name, item)
            }
        }
      }
    }
    if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !node.isTypeOnly &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      for (const item of node.exportClause.elements)
        if (!item.isTypeOnly) check(node.moduleSpecifier.text, (item.propertyName ?? item.name).text, item)
    }
    if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name)) {
      const module = requireModule(node)
      if (module !== undefined)
        for (const item of node.name.elements) check(module, (item.propertyName ?? item.name).getText(ast), item)
    }
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
      const module = namespaceModule(node.expression)
      if (module !== undefined) {
        if (ts.isPropertyAccessExpression(node)) check(module, node.name.text, node)
        else if (ts.isStringLiteral(node.argumentExpression)) check(module, node.argumentExpression.text, node)
      }
    }
    if (source && ts.isCallExpression(node)) {
      const name = vueName(node.expression)
      if (name === 'defineModel') issues.push(`${file}: defineModel requires a newer runtime; use props + emits`)
      if (name === 'toRef' && node.arguments.length === 1)
        issues.push(
          `${file}: the single-argument toRef overload requires Vue 3.3; use ref/computed or toRef(object, key)`,
        )
      if (name === 'computed') {
        const getter = node.arguments[0]
        if (getter && (ts.isArrowFunction(getter) || ts.isFunctionExpression(getter)) && getter.parameters.length)
          issues.push(`${file}: computed previous-value getters require Vue 3.4`)
      }
      if (['h', 'createVNode', 'createBlock'].includes(name) && node.arguments.length > 1) {
        const target = node.arguments[0]
        const props = node.arguments[1]
        if (
          vueName(target) === 'Teleport' &&
          ts.isObjectLiteralExpression(props) &&
          props.properties.some((prop) => prop.name && prop.name.getText(ast).replace(/^['"]|['"]$/g, '') === 'defer')
        ) {
          issues.push(`${file}: Teleport defer requires Vue 3.5`)
        }
      }
      // These options are silently ignored or have different semantics on 3.2.
      if (/^(?:watch|watchEffect|watchPostEffect|watchSyncEffect)$/.test(name)) {
        for (const arg of node.arguments)
          if (ts.isObjectLiteralExpression(arg))
            for (const prop of arg.properties) {
              if (!ts.isPropertyAssignment(prop)) continue
              const key = prop.name.getText(ast).replace(/['"]/g, '')
              if (key === 'once' || (key === 'deep' && ts.isNumericLiteral(prop.initializer)))
                issues.push(`${file}: watch option ${prop.getText(ast)} requires a newer Vue runtime`)
            }
      }
    }
    if (source && (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))) {
      if (
        vueName(node.tagName) === 'Teleport' &&
        node.attributes.properties.some((prop) => ts.isJsxAttribute(prop) && prop.name.getText(ast) === 'defer')
      ) {
        issues.push(`${file}: Teleport defer requires Vue 3.5`)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return issues
}

// Teleport is available in Vue 3.2, but its defer prop is only supported in 3.5.
// Parse SFC templates to avoid treating comments and text as component usage.
export function inspectVueTemplate(sfc, text, file) {
  const parsed = sfc.parse(text, { filename: file })
  assert.deepEqual(parsed.errors, [], `Cannot inspect invalid SFC: ${file}`)
  const issues = []
  const visit = (node) => {
    if (
      node.type === 1 &&
      node.tag.toLowerCase() === 'teleport' &&
      node.props.some(
        (prop) =>
          (prop.type === 6 && prop.name === 'defer') ||
          (prop.type === 7 &&
            prop.name === 'bind' &&
            prop.arg?.type === 4 &&
            prop.arg.isStatic &&
            prop.arg.content === 'defer'),
      )
    ) {
      issues.push(`${file}:${node.loc.start.line}: Teleport defer requires Vue 3.5`)
    }
    for (const child of node.children ?? []) visit(child)
  }
  if (parsed.descriptor.template?.ast) visit(parsed.descriptor.template.ast)
  return issues
}

function runtimeExports(requireMinimum) {
  const cache = new Map()
  return (name) => {
    if (name !== 'vue' && !/^@vue\/(?:shared|runtime-core|runtime-dom|reactivity)$/.test(name)) return undefined
    if (!cache.has(name)) cache.set(name, new Set(Object.keys(requireMinimum(name))))
    return cache.get(name)
  }
}

export function checkVueSources(root) {
  const requireRoot = createRequire(join(root, 'package.json'))
  const sfc = requireRoot('@vue/compiler-sfc')
  const minimum = createRequire(requireRoot.resolve('vue-compat-min/package.json'))
  const exportsFor = runtimeExports(minimum)
  const issues = []
  for (const pkg of packages)
    for (const file of walk(join(root, 'packages', pkg, 'src'))) {
      if (!/\.(?:ts|tsx|js|vue)$/.test(file) || file.endsWith('.d.ts')) continue
      let text = readFileSync(file, 'utf8')
      if (file.endsWith('.vue')) {
        issues.push(...inspectVueTemplate(sfc, text, relative(root, file)))
        text = [...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n')
      }
      issues.push(...inspectVueCode(ts, text, relative(root, file), exportsFor, true))
    }
  assert.deepEqual(issues, [], `Vue source compatibility failed:\n${issues.join('\n')}`)
  checkVuePeerRanges(root)
  assert.equal(
    requireRoot('vue/package.json').version,
    requireRoot('@vue/compiler-sfc/package.json').version,
    'Development Vue and SFC compiler must match',
  )
  assert.equal(
    createRequire(join(root, 'packages/ui/package.json'))('@vue/runtime-core/package.json').version,
    requireRoot('vue/package.json').version,
  )
  assert.equal(
    createRequire(join(root, 'packages/ui/package.json'))('@vue/server-renderer/package.json').version,
    requireRoot('vue/package.json').version,
    'Development SSR renderer must match Vue; compatibility fixtures must not affect hoisting',
  )
  assert.equal(
    createRequire(join(root, 'tests/vue-compat/current/package.json'))('vue/package.json').version,
    requireRoot('vue/package.json').version,
    'Update the current consumer fixture when upgrading development Vue',
  )
  console.log(
    'Vue source APIs support 3.2.47; UI peer range is 3 (Vue 3.0 and 3.1 are not verified); development runtime/compiler match',
  )
}

export function checkVuePeerRanges(root) {
  for (const pkg of ['ui', 'icons', 'use']) {
    assert.equal(json(join(root, 'packages', pkg, 'package.json')).peerDependencies.vue, pkg === 'ui' ? '3' : '^3.2.47')
  }
}

function linkPackage(directory, name, target) {
  const path = join(directory, 'node_modules', name)
  if (existsSync(path)) return
  mkdirSync(dirname(path), { recursive: true })
  symlinkSync(target, path, 'dir')
}

export function clearVueRuntimeLinks(consumer) {
  for (const name of [
    'vue',
    '@vue/shared',
    '@vue/runtime-core',
    '@vue/runtime-dom',
    '@vue/reactivity',
    '@vue/server-renderer',
  ]) {
    try {
      unlinkSync(join(consumer, 'node_modules', name))
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
}

function packageRoot(requireFrom, name) {
  try {
    return dirname(requireFrom.resolve(`${name}/package.json`))
  } catch {
    let dir = dirname(requireFrom.resolve(name))
    while (dir !== dirname(dir)) {
      if (existsSync(join(dir, 'package.json')) && json(join(dir, 'package.json')).name === name) return dir
      dir = dirname(dir)
    }
    throw new Error(`Cannot find dependency package ${name}`)
  }
}

export async function checkVueArtifacts(root) {
  const requireRoot = createRequire(join(root, 'package.json'))
  const requireUI = createRequire(join(root, 'packages/ui/package.json'))
  const exportsFor = runtimeExports(createRequire(requireRoot.resolve('vue-compat-min/package.json')))
  const temp = mkdtempSync(join(tmpdir(), 'vue-library-compat-'))
  try {
    const packed = []
    for (const pkg of packages) {
      const directory = join(root, 'packages', pkg)
      const manifest = json(join(directory, 'package.json'))
      const output = join(temp, 'packed', pkg)
      console.log(`Packing ${manifest.name} for Vue compatibility checks`)
      mkdirSync(output, { recursive: true })
      // pnpm pack applies the actual files allowlist and resolves workspace: ranges.
      execFileSync('pnpm', ['pack', '--pack-destination', output], { cwd: directory, stdio: 'pipe' })
      const archive = readdirSync(output).find((file) => file.endsWith('.tgz'))
      assert.ok(archive, `${manifest.name}: package archive was not produced`)
      execFileSync('tar', ['-xzf', join(output, archive), '-C', output])
      const content = join(output, 'package')
      for (const field of ['main', 'module', 'types', 'typings'])
        if (manifest[field])
          assert.ok(
            existsSync(join(content, manifest[field])),
            `${manifest.name}: missing published ${manifest[field]}; run build:lib first`,
          )
      const issues = []
      for (const file of walk(content))
        if (/\.(?:mjs|cjs|js)$/.test(file))
          issues.push(
            ...inspectVueCode(
              ts,
              readFileSync(file, 'utf8'),
              `${manifest.name}/${relative(content, file)}`,
              exportsFor,
            ),
          )
      assert.deepEqual(issues, [], `Published runtime imports are incompatible:\n${issues.join('\n')}`)
      packed.push({ manifest: json(join(content, 'package.json')), content })
    }
    // Move the extracted archives once, then change only the runtime links.
    // Each row runs in a fresh process and creates a fresh TS program, so module
    // caches cannot cross versions. Recopying thousands of files per row is wasteful.
    const consumer = join(temp, 'consumer')
    mkdirSync(consumer, { recursive: true })
    writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }))
    for (const { manifest, content } of packed) {
      const target = join(consumer, 'node_modules', manifest.name)
      mkdirSync(dirname(target), { recursive: true })
      renameSync(content, target)
    }
    for (const { manifest } of packed)
      for (const name of Object.keys(manifest.dependencies ?? {})) {
        if (name === 'vue' || name.startsWith('@vue/')) continue
        linkPackage(consumer, name, packageRoot(requireUI, name))
      }
    linkPackage(consumer, 'jsdom', packageRoot(requireUI, 'jsdom'))
    cpSync(fileURLToPath(new URL('./vue-compat-consumer.mjs', import.meta.url)), join(consumer, 'check.mjs'))
    for (const alias of versions) {
      const fixtureRequire = createRequire(join(root, 'tests/vue-compat', alias, 'package.json'))
      const runtimeRoot = dirname(fixtureRequire.resolve('vue/package.json'))
      const runtimeRequire = createRequire(join(runtimeRoot, 'package.json'))
      const version = json(join(runtimeRoot, 'package.json')).version
      console.log(`Checking packed consumers with Vue ${version}`)
      clearVueRuntimeLinks(consumer)
      linkPackage(consumer, 'vue', runtimeRoot)
      const domRequire = createRequire(runtimeRequire.resolve('@vue/runtime-dom/package.json'))
      const coreRequire = createRequire(domRequire.resolve('@vue/runtime-core/package.json'))
      linkPackage(consumer, '@vue/runtime-dom', packageRoot(runtimeRequire, '@vue/runtime-dom'))
      linkPackage(consumer, '@vue/runtime-core', packageRoot(domRequire, '@vue/runtime-core'))
      for (const dependency of ['@vue/shared', '@vue/reactivity'])
        linkPackage(consumer, dependency, packageRoot(coreRequire, dependency))
      linkPackage(consumer, '@vue/server-renderer', packageRoot(fixtureRequire, '@vue/server-renderer'))
      // Separate processes prevent the first runtime from leaking into later rows.
      const ui = packed.find(({ manifest }) => manifest.name.includes('/ui-')).manifest.name
      execFileSync(process.execPath, [join(consumer, 'check.mjs'), ui, version, 'ssr'], {
        cwd: consumer,
        stdio: 'inherit',
      })
      execFileSync(process.execPath, [join(consumer, 'check.mjs'), ui, version], { cwd: consumer, stdio: 'inherit' })
      const imports = packed
        .map(
          ({ manifest }) =>
            `import * as P${packages.indexOf(manifest.name.split('/')[1].replace('-vue', ''))} from '${manifest.name}';`,
        )
        .join('\n')
      writeFileSync(
        join(consumer, 'types.ts'),
        `${imports}\nimport { Button, Input, Switch, type ButtonProps } from '${ui}';\nconst props: ButtonProps = { disabled: true };\nconst instance: InstanceType<typeof Input> | undefined = undefined;\nvoid [Button, Switch, props, instance];\n// @ts-expect-error invalid public prop must still be rejected\nconst invalid: ButtonProps = { disabled: 'invalid' };\nvoid invalid;\n`,
      )
      const program = ts.createProgram([join(consumer, 'types.ts')], {
        noEmit: true,
        strict: true,
        skipLibCheck: false,
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        lib: ['lib.esnext.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
        types: [],
        allowSyntheticDefaultImports: true,
      })
      const diagnostics = ts.getPreEmitDiagnostics(program)
      assert.equal(
        diagnostics.length,
        0,
        `Vue ${version} published type errors:\n${ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: (file) => file, getCurrentDirectory: () => consumer, getNewLine: () => '\n' })}`,
      )
      console.log(`Vue ${version}: packed ESM/CJS, SSR, DOM interactions, hydration and declarations passed`)
    }
  } catch (error) {
    console.error(`Vue compatibility failure: ${error.message}`)
    throw error
  } finally {
    execFileSync('rm', ['-rf', temp])
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const root = resolve(process.cwd())
  try {
    if (process.argv.includes('--source')) checkVueSources(root)
    else {
      checkVueSources(root)
      await checkVueArtifacts(root)
    }
  } catch (error) {
    console.error(error.stack)
    process.exitCode = 1
  }
}
