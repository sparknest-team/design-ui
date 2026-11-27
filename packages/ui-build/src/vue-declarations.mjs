import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, relative, resolve } from 'node:path'

const baselines = new Map()
function baseline(ts, packageDirectory) {
  let root = resolve(packageDirectory)
  while (!existsSync(join(root, 'node_modules/vue-compat-min/package.json')) && root !== dirname(root)) {
    root = dirname(root)
  }
  // Workspaces may explicitly select their minimum; standalone projects use
  // the tool's pinned Vue 3.2.0 baseline instead of relying on a sibling repo.
  const hasWorkspaceBaseline = existsSync(join(root, 'node_modules/vue-compat-min/package.json'))
  const require = hasWorkspaceBaseline ? createRequire(join(root, 'package.json')) : createRequire(import.meta.url)
  const entry = require.resolve(`${hasWorkspaceBaseline ? 'vue-compat-min' : 'vue-compat-legacy'}/dist/vue.d.ts`)
  if (baselines.has(entry)) return baselines.get(entry)
  const program = ts.createProgram([entry], {
    moduleResolution: ts.ModuleResolutionKind.Node10,
    target: ts.ScriptTarget.ESNext,
    types: [],
    skipLibCheck: true,
  })
  const checker = program.getTypeChecker()
  const exports = new Map(
    checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry))).map((symbol) => {
      const name = symbol.name
      if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol)
      return [name, Math.max(0, ...(symbol.declarations ?? []).map((node) => node.typeParameters?.length ?? 0))]
    }),
  )
  baselines.set(entry, exports)
  return exports
}

// These are type conveniences absent from 3.2.47, expressed using its public API.
// Runtime helpers are never shimmed by this declaration transform.
const conveniences = new Set([
  'PublicProps',
  'SlotsType',
  'AriaAttributes',
  'ShallowRef',
  'MaybeRef',
  'MaybeRefOrGetter',
  'ComponentProvideOptions',
  'GlobalDirectives',
  'Reactive',
  'ClassValue',
  'Attrs',
  'InputAutoCompleteAttribute',
  'InputTypeHTMLAttribute',
  'ReservedProps',
])
const convenienceSource = `import type { AllowedComponentProps, ComponentCustomProps, HTMLAttributes, Ref, VNodeProps } from 'vue'
export type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps
export type SlotsType<T extends Record<string, any> = Record<string, any>> = { readonly __slots?: T }
export type AriaAttributes = Pick<HTMLAttributes, Extract<keyof HTMLAttributes, \`aria-\${string}\`>>
export type ShallowRef<T = any> = Ref<T>
export type MaybeRef<T = any> = T | Ref<T>
export type MaybeRefOrGetter<T = any> = MaybeRef<T> | (() => T)
export type Reactive<T> = T extends object ? ReturnType<typeof import('vue').reactive<T>> : T
export type ClassValue = false | null | undefined | string | Record<string, any> | Array<ClassValue>
export type InputAutoCompleteAttribute = NonNullable<import('vue').InputHTMLAttributes['autocomplete']>
export type InputTypeHTMLAttribute = NonNullable<import('vue').InputHTMLAttributes['type']>
export type ReservedProps = Pick<VNodeProps, 'key' | 'ref'> & { ref_for?: boolean; ref_key?: string }
export type Attrs = import('vue').ComponentPublicInstance['$attrs']
export type ComponentProvideOptions = Record<string | symbol, unknown> | (() => Record<string | symbol, unknown>)
export interface GlobalDirectives {}
`

export function downlevelVueDeclarations(packageDirectory, outputDirectory, ts) {
  const root = resolve(packageDirectory, outputDirectory)
  const exports = baseline(ts, packageDirectory)
  const files = []
  const collect = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name)
      if (entry.isDirectory()) collect(file)
      else if (/\.d\.(?:ts|cts|mts)$/.test(entry.name) && entry.name !== 'vue-compat.d.ts') files.push(file)
    }
  }
  collect(root)
  const printer = ts.createPrinter()
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    if (!/['"]vue['"]/.test(text)) continue
    const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
    // Vue language tools can append an empty synthetic component to a
    // script-only SFC which already forwards its implementation's default.
    // The forwarded declaration is the component's full public contract.
    if (file.endsWith('.vue.d.ts') && ast.statements.length === 4) {
      const [forward, component, alias, assignment] = ast.statements
      if (
        ts.isExportDeclaration(forward) && forward.moduleSpecifier && forward.exportClause &&
        ts.isNamedExports(forward.exportClause) && forward.exportClause.elements.some(item => item.name.text === 'default') &&
        ts.isVariableStatement(component) && component.declarationList.declarations[0]?.name.getText(ast) === '__VLS_export' &&
        ts.isVariableStatement(alias) && alias.declarationList.declarations[0]?.type?.getText(ast) === 'typeof __VLS_export' &&
        ts.isExportAssignment(assignment) && assignment.expression.getText(ast) === alias.declarationList.declarations[0].name.getText(ast)
      ) {
        writeFileSync(file, forward.getText(ast) + '\n')
        continue
      }
    }
    const imports = new Map()
    const namespaces = new Set()
    for (const node of ast.statements)
      if (ts.isImportDeclaration(node) && node.moduleSpecifier.text === 'vue') {
        const bindings = node.importClause?.namedBindings
        if (bindings && ts.isNamedImports(bindings))
          for (const item of bindings.elements) imports.set(item.name.text, (item.propertyName ?? item.name).text)
        if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text)
      }
    let helper = relative(dirname(file), join(root, 'vue-compat')).replaceAll('\\', '/')
    if (!helper.startsWith('.')) helper = `./${helper}`
    const importType = (module, name, args, isTypeOf = false) =>
      ts.factory.createImportTypeNode(
        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(module)),
        undefined,
        ts.factory.createIdentifier(name),
        args,
        isTypeOf,
      )
    const nameOf = (node) => {
      if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        node.argument.literal.text === 'vue' &&
        node.qualifier &&
        ts.isIdentifier(node.qualifier)
      )
        return node.qualifier.text
      if (ts.isTypeReferenceNode(node)) {
        if (ts.isIdentifier(node.typeName)) return imports.get(node.typeName.text)
        if (
          ts.isQualifiedName(node.typeName) &&
          ts.isIdentifier(node.typeName.left) &&
          namespaces.has(node.typeName.left.text)
        )
          return node.typeName.right.text
      }
    }
    const transformed = ts.transform(ast, [
      (context) => {
        const visit = (original) => {
          const name = nameOf(original)
          if (!name) return ts.visitEachChild(original, visit, context)
          let target = name
          let args = original.typeArguments ? [...original.typeArguments] : undefined
          let node
          let slots
          if (name === 'CreateComponentPublicInstanceWithMixins') {
            target = 'CreateComponentPublicInstance'
            slots = original.typeArguments?.[12]
            args = args?.slice(0, 11)
          } else if (name === 'DefineComponent') slots = original.typeArguments?.[12]
          if (exports.has(target)) {
            if (args) args = args.slice(0, exports.get(target))
            node = importType('vue', target, args?.length ? args : undefined, original.isTypeOf)
          } else if (conveniences.has(target)) node = importType(helper, target, args)
          else
            throw new Error(`${file}: cannot downlevel unknown Vue type ${target}; choose a 3.2-compatible public type`)
          node = ts.visitEachChild(node, visit, context)
          // Vue 3.2 has no SlotsType parameter. Preserve consumer slot inference as
          // an explicit instance intersection, rather than deleting the slot API.
          if (slots && nameOf(slots) === 'SlotsType' && slots.typeArguments?.[0]) {
            const slotType = ts.visitNode(slots.typeArguments[0], visit)
            const members = [ts.factory.createPropertySignature(undefined, '$slots', undefined, slotType)]
            const exposed = ts.factory.createTypeLiteralNode(members)
            const extra =
              name === 'DefineComponent'
                ? ts.factory.createTypeLiteralNode([ts.factory.createConstructSignature(undefined, [], exposed)])
                : exposed
            node = ts.factory.createIntersectionTypeNode([node, extra])
          }
          return node
        }
        return (source) => {
          const transformed = ts.visitNode(source, visit)
          // References to unavailable named convenience types were rewritten above;
          // retaining their old imports would still break strict consumer checking.
          return ts.factory.updateSourceFile(
            transformed,
            transformed.statements.flatMap((node) => {
              if (
                !ts.isImportDeclaration(node) ||
                node.moduleSpecifier.text !== 'vue' ||
                !node.importClause?.namedBindings ||
                !ts.isNamedImports(node.importClause.namedBindings)
              )
                return [node]
              const bindings = node.importClause.namedBindings.elements.filter((item) =>
                exports.has((item.propertyName ?? item.name).text),
              )
              if (!bindings.length && !node.importClause.name) return []
              return [
                ts.factory.updateImportDeclaration(
                  node,
                  node.modifiers,
                  ts.factory.updateImportClause(
                    node.importClause,
                    node.importClause.isTypeOnly,
                    node.importClause.name,
                    ts.factory.updateNamedImports(node.importClause.namedBindings, bindings),
                  ),
                  node.moduleSpecifier,
                  node.attributes,
                ),
              ]
            }),
          )
        }
      },
    ])
    writeFileSync(file, printer.printFile(transformed.transformed[0]))
    transformed.dispose()
  }
  writeFileSync(join(root, 'vue-compat.d.ts'), convenienceSource)
}
