import assert from 'node:assert/strict'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const ts = createRequire(path.join(workspace, 'cedar-design-web/packages/ui/package.json'))('typescript')

function publicProps(relative, exportName) {
  const entry = path.join(workspace, relative, 'src/index.ts')
  const program = ts.createProgram([entry], {
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    target: ts.ScriptTarget.ESNext,
    jsx: ts.JsxEmit.Preserve,
    skipLibCheck: true,
    allowSyntheticDefaultImports: true,
  })
  const checker = program.getTypeChecker()
  const source = program.getSourceFile(entry)
  const module = checker.getSymbolAtLocation(source)
  const exported = checker.getExportsOfModule(module).find((symbol) => symbol.name === exportName)
  assert(exported, `${relative} does not export ${exportName}`)
  const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
  assert(symbol.valueDeclaration, `${exportName} is not a runtime export`)
  return new Set(
    checker.getPropertiesOfType(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
      .map((property) => property.name),
  )
}

const libraries = {
  cedar: 'cedar-design-web/packages/ui',
  maple: 'maple-design-mobile/packages/ui',
}
const requiredFormProps = [
  'model',
  'layout',
  'disabled',
  'readonly',
  'size',
  'rules',
  'scrollToError',
  'scrollToErrorOffsetY',
]
const forbiddenInputProps = [
  'isForceFocusingEffect',
  'isForceErrorEffect',
  'placeholderFocusColor',
]
const requiredInputProps = [
  'modelValue',
  'modelModifiers',
  'defaultValue',
  'type',
  'ariaLabel',
  'maxLength',
  'readonly',
  'autofocus',
  'enterkeyhint',
  'inputAttrs',
  'error',
  'size',
  'variant',
  'placeholder',
  'disabled',
  'clearable',
  'showWordLimit',
  'wordLength',
  'wordSlice',
]

for (const [name, relative] of Object.entries(libraries)) {
  const form = publicProps(relative, 'formProps')
  const input = publicProps(relative, 'inputProps')
  assert.deepEqual(
    requiredInputProps.filter((property) => !input.has(property)),
    [],
    `${name} Input misses shared control props`,
  )
  assert.deepEqual(
    requiredFormProps.filter((property) => !form.has(property)),
    [],
    `${name} Form misses shared control props`,
  )
  assert.deepEqual(
    forbiddenInputProps.filter((property) => input.has(property)),
    [],
    `${name} Input exposes internal state props`,
  )
}

console.log('Form control contract passed for Cedar and Maple.')
