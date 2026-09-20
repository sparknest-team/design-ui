#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkThemeContract, collectThemeContract } from '../src/checker.mjs'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const workspace = resolve(packageRoot, '../../..')
const sources = {
  cedarSource: resolve(workspace, 'cedar-design-web/packages/cedar-ui/src'),
  mapleSource: resolve(workspace, 'maple-design-mobile/packages/maple-ui/src'),
}
const command = process.argv[2] ?? 'check'

if (command === 'sync') {
  const path = resolve(packageRoot, 'contracts/theme-contract.json')
  const contract = JSON.parse(readFileSync(path, 'utf8'))
  contract.tokens = collectThemeContract(sources)
  writeFileSync(path, `${JSON.stringify(contract, null, 2)}\n`)
  console.log(`Theme contract synchronized: ${contract.tokens.system.length} system tokens, ${contract.components.length} components.`)
} else if (command === 'check') {
  const result = checkThemeContract(sources)
  console.log(`Theme contract passed: ${result.systemCount} system tokens, ${result.componentCount} components.`)
} else {
  throw new Error(`Unknown command: ${command}`)
}
