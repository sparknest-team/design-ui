import ts from 'typescript-js'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.argv[2])
const files = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(file)
    else if (/\.(ts|tsx|vue|js|md)$/.test(file)) files.push(file)
  }
}
walk(root)
const names = new Set()
for (const file of files) {
  if (!/\.(vue|tsx|ts)$/.test(file) || file.includes('__tests__') || file.includes('__demos__')) continue
  const source = fs.readFileSync(file, 'utf8')
  for (const match of source.matchAll(/(?:\bemit|\$emit)\(\s*['"]([a-z][a-zA-Z]+)['"]/g)) {
    if (/[A-Z]/.test(match[1])) names.add(match[1])
  }
}
const mapping = process.argv.includes('--mapping')
  ? JSON.parse(process.argv[process.argv.indexOf('--mapping') + 1])
  : Object.fromEntries(
      [...names]
        .filter((name) => !['beforeOpen', 'beforeClose'].includes(name))
        .map((name) => [name, name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())]),
    )
if (process.argv.includes('--names')) {
  console.log(JSON.stringify(mapping))
  process.exit()
}
const edits = []
const selected = process.argv.includes('--file') ? process.argv[process.argv.indexOf('--file') + 1] : undefined
for (const file of files) {
  if (selected && file !== selected) continue
  const before = fs.readFileSync(file, 'utf8')
  let after = before.replace(/(['"])([a-zA-Z]+)\1/g, (all, quote, name) =>
    mapping[name] ? quote + mapping[name] + quote : all,
  )
  let start = 0,
    source = after
  if (file.endsWith('.vue')) {
    const match = after.match(/<script[^>]*>/)
    if (!match) continue
    start = match.index + match[0].length
    source = after.slice(start, after.indexOf('</script>', start))
  }
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const replacements = []
  function visit(node) {
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText()
      if (name.startsWith('on')) {
        const event = name[2]?.toLowerCase() + name.slice(3)
        if (mapping[event])
          replacements.push([
            node.name.getStart() + start,
            node.name.getEnd() + start,
            'on' + mapping[event][0].toUpperCase() + mapping[event].slice(1),
          ])
      }
    }
    if (ts.isPropertySignature(node) && mapping[node.name.getText()]) {
      let parent = node.parent
      while (parent && !ts.isTypeReferenceNode(parent)) parent = parent.parent
      if (parent && /^(EmitFn\d*|defineEmits)$/.test(parent.typeName.getText())) {
        replacements.push([
          node.name.getStart() + start,
          node.name.getEnd() + start,
          JSON.stringify(mapping[node.name.getText()]),
        ])
      }
    }
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText() === 'emits' &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const prop of node.initializer.properties) {
        const name = prop.name?.getText()
        if (mapping[name])
          replacements.push([prop.name.getStart() + start, prop.name.getEnd() + start, JSON.stringify(mapping[name])])
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  for (const [from, to, value] of replacements.sort((a, b) => b[0] - a[0]))
    after = after.slice(0, from) + value + after.slice(to)
  if (after !== before) edits.push({ file, before, after })
}
console.log(JSON.stringify(process.argv.includes('--list') ? edits.map((e) => e.file) : edits))
