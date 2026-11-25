import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const candidates = ['maple-design-mobile/packages/shared', 'cedar-design-web/packages/shared']
const compilerRoot = candidates.map((path) => resolve(workspace, path, 'package.json')).find(existsSync)
const ts = createRequire(compilerRoot)('typescript')

/** Keep declarations and type-only exports; normalize formatting, comments and brand diagnostics only. */
export function canonicalSharedSource(source) {
  const file = ts.createSourceFile('shared.ts', source.replaceAll('Cedar [', 'Maple ['), ts.ScriptTarget.Latest, true)
  assert.deepEqual(
    file.parseDiagnostics.map((error) => ts.flattenDiagnosticMessageText(error.messageText, '\n')),
    [],
  )
  const transformed = ts.transform(file, [
    (context) => {
      const visit = (node) =>
        ts.isStringLiteral(node) ? ts.factory.createStringLiteral(node.text) : ts.visitEachChild(node, visit, context)
      return (node) => ts.visitNode(node, visit)
    },
  ])
  try {
    return ts
      .createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed })
      .printFile(transformed.transformed[0])
  } finally {
    transformed.dispose()
  }
}

export function assertSharedSourcePair(left, right, name = 'shared source') {
  assert.equal(canonicalSharedSource(left), canonicalSharedSource(right), `Shared runtime/type drift: ${name}`)
}

export function checkSharedSourceContract() {
  const cedar = resolve(workspace, 'cedar-design-web/packages/shared')
  const maple = resolve(workspace, 'maple-design-mobile/packages/shared')
  const inventory = (root) => {
    const files = []
    function walk(dir, prefix = '') {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const name = prefix + entry.name
        if (entry.isDirectory()) walk(resolve(dir, entry.name), name + '/')
        else if (/\.[cm]?[jt]sx?$/.test(entry.name)) files.push(name)
      }
    }
    walk(resolve(root, 'src'))
    return files.sort()
  }
  const files = inventory(cedar)
  assert.deepEqual(files, inventory(maple), 'Shared source inventory drift; do not exclude unmatched modules')
  for (const file of files) {
    assertSharedSourcePair(
      readFileSync(resolve(cedar, 'src', file), 'utf8'),
      readFileSync(resolve(maple, 'src', file), 'utf8'),
      file,
    )
  }
  assert.equal(
    readFileSync(resolve(cedar, 'THIRD_PARTY_NOTICES'), 'utf8'),
    readFileSync(resolve(maple, 'THIRD_PARTY_NOTICES'), 'utf8'),
  )
  return files.length
}
