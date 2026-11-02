import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, realpath } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
export async function verifyPackage(root) {
  root = await realpath(root)
  const files = JSON.parse(await readFile(resolve(root, 'files.sha256.json'), 'utf8'))
  let checked = 0
  assert.ok(Array.isArray(files), 'Invalid package checksum inventory')
  for (const { path: name, sha256: expected } of files) {
    const path = await realpath(resolve(root, name))
    assert.ok(path.startsWith(root + '/'), 'File must remain inside the handoff package')
    assert.equal(createHash('sha256').update(await readFile(path)).digest('hex'), expected, `Package checksum mismatch: ${name}`)
    checked++
  }
  assert.ok(checked > 0, 'Empty package checksum inventory')
  return { checked, passed: true, nativeDeviceAcceptance: false }
}
if (process.argv[1] && import.meta.url === pathToFileURL(await realpath(resolve(process.argv[1]))).href) {
  console.log(JSON.stringify(await verifyPackage(fileURLToPath(new URL('.', import.meta.url)))))
}
