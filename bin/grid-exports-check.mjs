import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const ts = createRequire(resolve(workspace, 'cedar-design-web/packages/ui/package.json'))('typescript')
for (const library of ['cedar-design-web/packages/ui', 'maple-design-mobile/packages/ui']) {
  const paths = ['index.ts', 'grid/index.ts', 'row/index.ts', 'col/index.ts'].map((file) =>
    resolve(workspace, library, 'src', file),
  )
  for (const oldFile of ['grid-row.vue', 'grid-col.vue', 'Row.vue', 'Col.vue', 'style/row.less', 'style/col.less']) {
    assert(
      !existsSync(resolve(workspace, library, 'src/grid', oldFile)),
      library + ': obsolete Grid wrapper ' + oldFile,
    )
  }
  const program = ts.createProgram(paths, {
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.Preserve,
    skipLibCheck: true,
  })
  const checker = program.getTypeChecker()
  const exported = (file, name) => {
    const symbol = checker.getSymbolAtLocation(program.getSourceFile(file))
    const result = checker.getExportsOfModule(symbol).find((item) => item.name === name)
    assert(result, library + ': missing ' + name)
    return result.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(result) : result
  }
  for (const [name, file] of [
    ['_RowComponent', paths[2]],
    ['_ColComponent', paths[3]],
  ]) {
    assert.equal(exported(paths[0], name), exported(file, name), library + ': root must use canonical ' + name)
    const gridSymbol = checker.getSymbolAtLocation(program.getSourceFile(paths[1]))
    const gridNames = checker.getExportsOfModule(gridSymbol).map((item) => item.name)
    for (const removed of [
      'Row',
      'Col',
      '_RowComponent',
      '_ColComponent',
      'rowProps',
      'colProps',
      'RowProps',
      'ColProps',
      'RowInstance',
      'ColInstance',
      'GridRowInstance',
      'GridColInstance',
    ]) {
      assert(!gridNames.includes(removed), library + ': Grid must not export ' + removed)
    }
    const declarations = program
      .getSourceFile(paths[0])
      .statements.filter(ts.isExportDeclaration)
      .flatMap((node) =>
        node.exportClause && ts.isNamedExports(node.exportClause)
          ? node.exportClause.elements.map((item) => item.name.text)
          : [],
      )
    assert(declarations.filter((item) => item === name).length <= 1, library + ': duplicate explicit ' + name)
  }
  console.log('PASS ' + library + ': canonical Grid/Row/Col exports')
}
