import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function validateCIToolchain({ node, pnpm, childNode }) {
  assert.match(node, /^v20\./, 'Quality CI must use the declared Node 20 runtime')
  assert.equal(pnpm, '9.6.0', 'Quality CI must use the declared pnpm 9.6.0')
  assert.equal(childNode, node, 'Nested pnpm must not switch the Node runtime')
}

export function checkCIToolchain() {
  const run = (args) => {
    const result = spawnSync('pnpm', args, { encoding: 'utf8', timeout: 30_000 })
    if (result.error) throw result.error
    assert.equal(result.status, 0, result.stdout + result.stderr)
    return result.stdout.trim()
  }
  const versions = { node: process.version, pnpm: run(['--version']), childNode: run(['exec', 'node', '--version']) }
  validateCIToolchain(versions)
  console.log(`CI toolchain: Node ${versions.node}, pnpm ${versions.pnpm}, nested Node ${versions.childNode}`)
  return versions
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) checkCIToolchain()
