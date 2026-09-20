import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(path.join(workspace, 'cedar-design-web/packages/cedar-ui/package.json'))
const ts = require('typescript')
const source = path.resolve(process.argv[2])
const roots = fs.readdirSync(source, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))
  .flatMap(entry => ['index.ts', 'index.tsx'].map(name => path.join(source, entry.name, name))).filter(file => fs.existsSync(file))
const program = ts.createProgram([...roots, path.join(source, 'index.ts')], {
  target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext,
  jsx: ts.JsxEmit.Preserve,
  moduleResolution: ts.ModuleResolutionKind.NodeJs, skipLibCheck: true,
  allowSyntheticDefaultImports: true, noEmit: true,
})
const checker = program.getTypeChecker()
const exported = file => {
  const symbol = checker.getSymbolAtLocation(program.getSourceFile(file))
  return symbol ? checker.getExportsOfModule(symbol) : []
}
const rootNames = new Set(exported(path.join(source, 'index.ts')).map(symbol => symbol.name))
const edits = []
const report = []
const rootLines = []
for (const file of roots) {
  const symbols = exported(file)
  const names = new Set(symbols.map(symbol => symbol.name))
  const lines = []
  const publicTypes = new Set(symbols.filter(s => {
    const original = s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s
    return (original.flags & ts.SymbolFlags.Type) && /(?:Props|Size|Variant|Direction|Orientation|Mode|Target|Status)$/.test(s.name)
  }).map(s => s.name))
  for (const symbol of symbols) {
    if (!/^[a-z].*Props$/.test(symbol.name)) continue
    const original = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
    const declaration = original.valueDeclaration
    if (!declaration || !ts.isVariableDeclaration(declaration)) continue
    const publicName = symbol.name[0].toUpperCase() + symbol.name.slice(1)
    const definition = declaration.getSourceFile().fileName
    if (!definition.startsWith(source)) continue
    if (!names.has(publicName)) {
      let relative = path.relative(path.dirname(file), definition).replace(/\.tsx?$/, '')
      if (!relative.startsWith('.')) relative = './' + relative
      lines.push(`export type ${publicName} = import('vue').ExtractPublicPropTypes<typeof import('${relative}').${declaration.name.getText()}>`)
    }
    publicTypes.add(publicName)
    report.push({ component: path.basename(path.dirname(file)), runtime: symbol.name, publicType: publicName, missing: !names.has(publicName) })
  }
  if (lines.length) edits.push({ file, append: '\n' + lines.join('\n') + '\n' })
  const missingRoot = [...publicTypes].filter(name => !rootNames.has(name))
  if (missingRoot.length) {
    rootLines.push(`export type { ${missingRoot.join(', ')} } from './${path.basename(path.dirname(file))}'`)
    missingRoot.forEach(name => rootNames.add(name))
  }
}
if (rootLines.length) edits.push({ file: path.join(source, 'index.ts'), append: '\n' + rootLines.join('\n') + '\n' })
// Read-only. --edits describes append-only patches; --check also guards common root types.
const missingContracts = ['ComponentSize', 'SemanticStatus', 'PopupContainer'].filter(name => !rootNames.has(name))
if (process.argv.includes('--check')) {
  console.log(JSON.stringify({ missingExports: edits, missingContracts }, null, 2))
  if (edits.length || missingContracts.length) process.exitCode = 1
} else {
  console.log(JSON.stringify(process.argv.includes('--edits') ? edits : report, null, 2))
}
