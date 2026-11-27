#!/usr/bin/env node
import ts from 'typescript-js'
import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(resolve(workspace, 'cedar-design-web/packages/ui/package.json'))
const relevant = /^(dir|orientation|direction|axis|position|placement)$|(?:Position|Placement|Direction)$/
const excluded = new Set(['__tests__', '__demos__', 'example', 'docs', 'style', 'node_modules'])

export function collectNamingProps(source, filename = 'props.ts') {
  // Inspect component prop declarations, not CSS, local geometry, event payloads or demo strings.
  if (filename.endsWith('.vue'))
    source = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n')
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const result = []
  const nameOf = (node) => (node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : undefined)
  function collect(properties, owner) {
    for (const node of properties) {
      const name = nameOf(node.name)
      if (!name || !relevant.test(name) || /^auto(?:Fix|Fit)Position$/.test(name)) continue
      let defaultValue
      if (ts.isPropertyAssignment(node) && ts.isObjectLiteralExpression(node.initializer)) {
        let value = node.initializer.properties.find((p) => nameOf(p.name) === 'default')?.initializer
        while (
          value &&
          (ts.isAsExpression(value) || ts.isSatisfiesExpression(value) || ts.isParenthesizedExpression(value))
        )
          value = value.expression
        if (value && ts.isStringLiteral(value)) defaultValue = value.text
      }
      const inlineValues = []
      let typeName
      function findType(n) {
        if (ts.isTypeReferenceNode(n) && n.typeName.getText(file) === 'PropType')
          typeName = n.typeArguments?.[0]?.getText(file)
        if (ts.isIndexedAccessTypeNode(n)) {
          findType(n.objectType)
          return
        }
        if (ts.isLiteralTypeNode(n) && ts.isStringLiteral(n.literal)) inlineValues.push(n.literal.text)
        ts.forEachChild(n, findType)
      }
      findType(node)
      result.push({
        owner,
        name,
        defaultValue,
        typeName,
        inlineValues: [...new Set(inlineValues)],
        line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1,
      })
    }
  }
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      /^(props|.*Props)$/.test(nameOf(node.name) ?? '') &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    )
      collect(node.initializer.properties, nameOf(node.name))
    if (ts.isCallExpression(node) && node.expression.getText(file) === 'defineComponent') {
      const options = node.arguments[0]
      if (options && ts.isObjectLiteralExpression(options)) {
        const props = options.properties.find((p) => nameOf(p.name) === 'props')?.initializer
        if (props && ts.isObjectLiteralExpression(props)) collect(props.properties, 'defineComponent.props')
      }
    }
    if (ts.isCallExpression(node) && ['defineProps', 'withDefaults'].includes(node.expression.getText(file))) {
      if (node.expression.getText(file) === 'defineProps') {
        const props = node.arguments[0]
        if (props && ts.isObjectLiteralExpression(props)) collect(props.properties, 'defineProps')
        const type = node.typeArguments?.[0]
        if (type && ts.isTypeLiteralNode(type)) collect(type.members, 'defineProps')
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return result
}

export function checkNamingProps(props, entries) {
  const issues = []
  for (const prop of props) {
    const entry = entries.find((e) => e.owner === prop.owner && (e.name === prop.name || e.target === prop.name))
    if (!entry) {
      issues.push(
        `${prop.owner}.${prop.name}: unreviewed naming; register its meaning and values in configs/api-naming.json`,
      )
      continue
    }
    const allowedValues = [...(entry.values ?? []), ...(entry.targetValues ?? [])]
    if (
      prop.name === 'direction' &&
      [prop.defaultValue, ...prop.inlineValues, ...allowedValues].some((value) =>
        ['horizontal', 'vertical'].includes(value),
      )
    )
      issues.push('horizontal/vertical axes must use orientation, not direction')
    if (
      /placement$/i.test(prop.name) &&
      prop.typeName &&
      /Position$/.test(prop.typeName) &&
      prop.typeName !== entry.pendingType
    )
      issues.push(`${prop.name}: use a Placement type name, not ${prop.typeName}`)
    if (prop.name === 'orientation' && entry.values?.some((value) => !['horizontal', 'vertical'].includes(value)))
      issues.push('orientation registry only accepts horizontal/vertical')
    if (prop.name === 'axis' && entry.values?.some((value) => !['x', 'y', 'xy'].includes(value)))
      issues.push('axis registry only accepts x/y/xy')
    if (!entry.meaning?.trim() || !entry.values?.length)
      issues.push(`${prop.name}: registry requires a meaning and value domain`)
    if (
      entry.target &&
      props.some((p) => p.owner === prop.owner && p.name === entry.name) &&
      props.some((p) => p.owner === prop.owner && p.name === entry.target)
    )
      issues.push(`${prop.owner}: old and target names cannot coexist (${entry.name}/${entry.target})`)
    if (prop.defaultValue !== undefined && !allowedValues.includes(prop.defaultValue) && !entry.freeform)
      issues.push(`${prop.name}: default ${prop.defaultValue} is outside its reviewed values`)
    if (!entry.freeform)
      for (const value of prop.inlineValues)
        if (!allowedValues.includes(value))
          issues.push(`${prop.name}: inline value ${value} is outside its reviewed values`)
    if (prop.name === 'orientation' && prop.inlineValues.some((value) => !['horizontal', 'vertical'].includes(value)))
      issues.push(`${prop.name}: orientation only accepts horizontal/vertical`)
    if (prop.name === 'axis' && prop.inlineValues.some((value) => !['x', 'y', 'xy'].includes(value)))
      issues.push(`${prop.name}: axis only accepts x/y/xy`)
  }
  for (const entry of entries) {
    if (!props.some((p) => p.owner === entry.owner && [entry.name, entry.target].includes(p.name)))
      issues.push(`${entry.owner}.${entry.name}: stale registry entry; update the naming contract`)
  }
  return [...new Set(issues)]
}

export function inventory(root) {
  const result = []
  function walk(folder) {
    for (const item of readdirSync(folder, { withFileTypes: true })) {
      if (item.name.startsWith('_') || excluded.has(item.name)) continue
      const path = join(folder, item.name)
      if (item.isDirectory()) walk(path)
      else if (/\.(ts|tsx|vue)$/.test(item.name) && !item.name.endsWith('.d.ts')) {
        const props = collectNamingProps(readFileSync(path, 'utf8'), path)
        if (props.length) result.push({ file: relative(workspace, path).replaceAll('\\', '/'), props })
      }
    }
  }
  walk(root)
  return result
}

export function runCheck(registry, inventories) {
  const issues = []
  const identities = new Set()
  for (const entry of registry.entries) {
    const identity = `${entry.file}:${entry.owner}:${entry.name}`
    if (identities.has(identity)) issues.push(`${identity}: duplicate naming contract`)
    identities.add(identity)
  }
  for (const item of inventories)
    for (const issue of checkNamingProps(
      item.props,
      registry.entries.filter((e) => e.file === item.file),
    ))
      issues.push(`${item.file}: ${issue}`)
  for (const entry of registry.entries)
    if (!inventories.some((item) => item.file === entry.file))
      issues.push(`${entry.file}: naming contract source is missing`)
  return issues
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const registry = JSON.parse(readFileSync(resolve(workspace, 'design-ui/configs/api-naming.json'), 'utf8'))
  const files = [
    inventory(resolve(workspace, 'cedar-design-web/packages/ui/src')),
    inventory(resolve(workspace, 'maple-design-mobile/packages/ui/src')),
  ].flat()
  const issues = runCheck(registry, files)
  for (const issue of issues) console.error(issue)
  const pending = registry.entries.filter((e) => e.target || e.pendingType || e.targetValues).length
  console.log(
    `API naming: ${files.length} declaration files, ${registry.entries.length} reviewed properties, ${issues.length} errors; ${pending} explicitly recorded pending property/type/value migrations.`,
  )
  process.exitCode = issues.length ? 1 : 0
}
