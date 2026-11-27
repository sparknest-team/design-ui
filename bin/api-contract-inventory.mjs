import ts from 'typescript-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Read-only inventory of actual public runtime Props exports, including child components.
// A name-set difference is not evidence of a semantic mismatch or missing implementation.
const workspace = fileURLToPath(new URL('../../', import.meta.url))
function inventory(relative) {
  const root = path.join(workspace, relative, 'src')
  const entry = path.join(root, 'index.ts')
  const program = ts.createProgram([entry], {
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    target: ts.ScriptTarget.ESNext,
    jsx: ts.JsxEmit.Preserve,
    skipLibCheck: true,
    allowSyntheticDefaultImports: true,
  })
  const checker = program.getTypeChecker()
  const module = checker.getSymbolAtLocation(program.getSourceFile(entry))
  const result = new Map()
  for (const exported of checker.getExportsOfModule(module)) {
    if (!/^[a-z].*Props$/.test(exported.name)) continue
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
    if (!symbol.valueDeclaration) continue
    const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
    const props = checker
      .getPropertiesOfType(type)
      .map((prop) => prop.name)
      .sort()
    result.set(exported.name, { props, source: path.relative(root, symbol.valueDeclaration.getSourceFile().fileName) })
  }
  return result
}
const cedar = inventory('cedar-design-web/packages/ui')
const maple = inventory('maple-design-mobile/packages/ui')
const shared = [...cedar.keys()].filter((name) => maple.has(name)).sort()
const cell = (values) => (values.length ? values.map((value) => '`' + value + '`').join(', ') : '—')
const lines = [
  '# 公共 Props 导出集合复核',
  '',
  '由 api-contract-inventory.mjs 从两库根入口追踪 TypeScript 符号生成（含子组件）。',
  '仅比较实际公开运行时 Props 的键，不把工具目录当组件，也不据此声称事件、插槽、方法或行为完全相同。',
  '已批准且实施的语义迁移见 api-alignment-plan.md；剩余集合差异是后续能力规划清单，不自动求并集。',
  '',
  `Cedar：${cedar.size} 个 Props 导出；Maple：${maple.size} 个；同名可比较：${shared.length} 个。`,
  '',
  '| Props | Cedar / Maple 键数量 | 仅 Cedar | 仅 Maple |',
  '| --- | --- | --- | --- |',
]
for (const name of shared) {
  const a = cedar.get(name).props,
    b = maple.get(name).props
  lines.push(
    `| ${name} | ${a.length} / ${b.length} | ${cell(a.filter((key) => !b.includes(key)))} | ${cell(b.filter((key) => !a.includes(key)))} |`,
  )
}
for (const [name, own, other] of [
  ['Cedar', cedar, maple],
  ['Maple', maple, cedar],
]) {
  lines.push(
    '',
    `## 仅 ${name} 根入口存在的 Props 导出`,
    '',
    cell([...own.keys()].filter((key) => !other.has(key)).sort()),
  )
}
const output = lines.join('\n') + '\n'
if (process.argv.includes('--write')) {
  for (const relative of ['audits/api-props-inventory.md', 'audits/component-reuse-props.md']) {
    fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', relative), output)
  }
  console.log(`Updated Props inventory: ${cedar.size} Cedar / ${maple.size} Maple / ${shared.length} shared`)
} else {
  console.log(output)
}
