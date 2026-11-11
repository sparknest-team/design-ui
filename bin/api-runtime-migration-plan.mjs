import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const workspace = fileURLToPath(new URL('../../', import.meta.url))
const ts = createRequire(path.join(workspace, 'cedar-design-web/packages/ui/package.json'))('typescript')
const root = path.resolve(process.argv[2])
const helper = fs.existsSync(path.join(root, '_utils')) ? '_utils' : 'utils'
const edits = []
const selected = process.argv.includes('--file') ? process.argv[process.argv.indexOf('--file') + 1] : undefined
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.name.startsWith('.') || item.name === 'node_modules') continue
    const file = path.join(dir, item.name)
    if (item.name === '__snapshots__') continue
    if (item.isDirectory()) { walk(file); continue }
    if (selected && file !== selected) continue
    if (!/\.(ts|tsx|vue|less|md|js|snap)$/.test(file)) continue
    const before = fs.readFileSync(file, 'utf8')
    let after = before.replaceAll('outlined', 'outline')
    let addImport = false
    if (item.name === 'props.ts') {
      const ast = ts.createSourceFile(file, after, ts.ScriptTarget.Latest, true)
      const changes = []
      for (const statement of ast.statements) {
        if (!ts.isVariableStatement(statement) || !statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) continue
        for (const decl of statement.declarationList.declarations) {
          if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer)) continue
          const main = decl.name.getText() === 'props' || /Props$/.test(decl.name.getText())
          if (!main) continue
          let hasContainer = false
          for (const prop of decl.initializer.properties) {
            const name = prop.name?.getText()
            if (name === 'popupContainer') {
              hasContainer = true
              if (ts.isPropertyAssignment(prop) && prop.initializer.getText() !== 'popupContainerProp') {
                changes.push([prop.initializer.getStart(), prop.initializer.getEnd(), 'popupContainerProp'])
                addImport = true
              }
            }
            if (name === 'renderToBody') {
              let end = prop.getEnd()
              if (after[end] === ',') end++
              changes.push([prop.getFullStart(), end, ''])
            }
          }
          if (!hasContainer && /\/(auto-complete|select|cascader|date|date-range|time|time-range)\/props.ts$/.test(file)) {
            changes.push([decl.initializer.getStart() + 1, decl.initializer.getStart() + 1, '\n  popupContainer: popupContainerProp,'])
            addImport = true
          }
        }
      }
      for (const [start, end, value] of changes.sort((a,b) => b[0]-a[0])) after = after.slice(0,start)+value+after.slice(end)
    }
    if (addImport) {
      let relative = path.relative(path.dirname(file), path.join(root, helper, 'popup-container'))
      if (!relative.startsWith('.')) relative = './' + relative
      after = `import { popupContainerProp } from '${relative}'\n` + after
    }
    if (after !== before) edits.push({file, before, after})
  }
}
walk(root)
console.log(JSON.stringify(process.argv.includes('--list') ? edits.map(edit => edit.file) : edits))
