import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

// Keep each module format's declaration graph in the corresponding TS module mode.
// The caller provides its TypeScript instance, matching the vue-tsc used to emit types.
export function writeDualDeclarations(root, ts) {
  if (!ts || typeof ts.createSourceFile !== 'function') {
    throw new Error('TypeScript compiler API is required to generate dual declarations')
  }
  root = resolve(root)
  const files = []
  function collect(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name)
      if (entry.isDirectory()) collect(file)
      else if (entry.isFile() && entry.name.endsWith('.d.ts')) files.push(file)
    }
  }
  collect(root)
  const contents = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]))
  const outputs = []
  for (const [file, text] of contents) {
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    if (source.parseDiagnostics.length) throw new Error(`Cannot parse declaration: ${file}`)
    const edits = []
    function add(literal) {
      if (!literal || !ts.isStringLiteral(literal) || !literal.text.startsWith('.')) return
      let specifier = literal.text
      let target = resolve(dirname(file), specifier)
      if (existsSync(target) && statSync(target).isDirectory()) {
        target = join(target, 'index')
        specifier = specifier === '.' ? './index' : `${specifier}/index`
      }
      if (!contents.has(`${target}.d.ts`)) {
        throw new Error(`Unresolved declaration ${literal.text} in ${relative(root, file)}`)
      }
      edits.push({ start: literal.getStart(source) + 1, end: literal.getEnd() - 1, specifier })
    }
    function visit(node) {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) add(node.moduleSpecifier)
      else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) add(node.argument.literal)
      else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
        add(node.moduleReference.expression)
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
    edits.sort((a, b) => b.start - a.start)
    for (const [suffix, extension] of [
      ['.d.ts', 'js'],
      ['.d.cts', 'cjs'],
    ]) {
      let result = text
      for (const edit of edits) {
        result = result.slice(0, edit.start) + `${edit.specifier}.${extension}` + result.slice(edit.end)
      }
      outputs.push([file.slice(0, -'.d.ts'.length) + suffix, result])
    }
  }
  for (const [file, text] of outputs) {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, text)
  }
}
