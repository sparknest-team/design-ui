import ts from 'typescript-js'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Compile consumers of the published declarations; never emit or rewrite sources.
const workspace = fileURLToPath(new URL('../../', import.meta.url))
for (const [repo, declarations] of [
  ['cedar-design-web/packages/ui', 'types'],
  ['maple-design-mobile/packages/ui', 'types-generated'],
]) {
  const root = resolve(workspace, repo)
  assert.ok(existsSync(resolve(root, declarations, 'index.d.ts')), `${repo}: build the library first`)
  const filename = resolve(root, '__input_batch_published_types__.ts')
  const source =
    ['index', 'verification-code/index', 'search/index']
      .map((entry, index) => {
        const components =
          entry === 'index'
            ? ['VerificationCode', 'Search']
            : entry.startsWith('verification-code')
              ? ['VerificationCode']
              : ['Search']
        return components
          .map((name) => {
            const suffix = name + index
            const imports = ['Props', 'Emits', 'Slots', 'Expose']
              .map((part) => `${name}${part} as ${suffix}${part}`)
              .join(', ')
            const value =
              name === 'VerificationCode'
                ? "{ type: 'alphanumeric', length: 4, variant: 'outline', allowPaste: false, masked: true }"
                : "{ modelValue: 'query', model: { name: 'query' }, fields: [{ value: 'name', label: 'Name' }], readonly: true }"
            return `
import type { ${imports} } from './${declarations}/${entry}'
export const defaults${suffix}: ${suffix}Props = {}
export const props${suffix}: ${suffix}Props = ${value}
export type events${suffix} = ${suffix}Emits
export type slots${suffix} = ${suffix}Slots
export type expose${suffix} = ${suffix}Expose
// @ts-expect-error size is a named component size, not a pixel count
export const invalid${suffix}: ${suffix}Props = { size: 123 }
`
          })
          .join('\n')
      })
      .join('\n') +
    ['index', 'tabs/index']
      .map(
        (entry, index) => `
import type {
  TabsProps as TabsProps${index}, TabsEmits as TabsEmits${index}, TabsSlots as TabsSlots${index},
  TabPaneSlots as TabPaneSlots${index}, TabNavSlots as TabNavSlots${index}, TabsNavsSlots as TabsNavsSlots${index},
  TabItemSlots as TabItemSlots${index}, TabsItemsSlots as TabsItemsSlots${index}, TabsNavsExpose as TabsNavsExpose${index},
} from './${declarations}/${entry}'
export const tabs${index}: TabsProps${index} = { active: 'one', size: 'md', orientation: 'vertical' }
export type tabsEvents${index} = TabsEmits${index}
export type tabsSlots${index} = [TabsSlots${index}, TabPaneSlots${index}, TabNavSlots${index}, TabsNavsSlots${index}, TabItemSlots${index}, TabsItemsSlots${index}]
export function resize${index}(navs: TabsNavsExpose${index}) { navs.resize() }
// @ts-expect-error active is a string or number, not a boolean
export const invalidTabs${index}: TabsProps${index} = { active: false }
`,
      )
      .join('\n')
  const options = {
    noEmit: true,
    strict: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    allowSyntheticDefaultImports: true,
  }
  const host = ts.createCompilerHost(options)
  const getSourceFile = host.getSourceFile.bind(host)
  host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) =>
    file === filename
      ? ts.createSourceFile(file, source, languageVersion, true)
      : getSourceFile(file, languageVersion, onError, shouldCreateNewSourceFile)
  const program = ts.createProgram([filename], options, host)
  const diagnostics = ts.getPreEmitDiagnostics(program)
  assert.equal(
    diagnostics.length,
    0,
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }),
  )
  const checker = program.getTypeChecker()
  const module = checker.getSymbolAtLocation(program.getSourceFile(filename))
  for (const symbol of checker.getExportsOfModule(module)) {
    const type =
      symbol.flags & ts.SymbolFlags.TypeAlias
        ? checker.getDeclaredTypeOfSymbol(symbol)
        : checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
    assert.ok(!(type.flags & ts.TypeFlags.Any), `${repo}: ${symbol.name} degraded to any`)
  }
  console.log(`${repo}: root/subpath Props, Emits, Slots, Expose declarations passed`)
}
