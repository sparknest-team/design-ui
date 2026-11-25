import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFile, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import test from 'node:test'
import { sealReport } from './native-handoff.mjs'
import { startKitServers } from './native-kit/serve.mjs'

test('evidence sealing hashes actual files without granting a pass and rejects missing or escaping evidence', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'native-seal-test-'))
  try {
    const evidence = 'UNIT TEST EVIDENCE',
      report = { targets: [{ status: 'pending', cases: { ime: 'pending' }, evidence: ['probe.json'] }] }
    const path = resolve(root, 'report.json')
    await writeFile(resolve(root, 'probe.json'), evidence)
    await writeFile(path, JSON.stringify(report))
    await sealReport(path)
    const sealed = JSON.parse(await readFile(path))
    assert.equal(sealed.targets[0].status, 'pending')
    assert.equal(sealed.targets[0].cases.ime, 'pending')
    assert.equal(sealed.targets[0].evidenceSha256['probe.json'], createHash('sha256').update(evidence).digest('hex'))
    for (const file of ['../outside.json', 'missing.json']) {
      report.targets[0].evidence = [file]
      await writeFile(path, JSON.stringify(report))
      await assert.rejects(sealReport(path), file.startsWith('..') ? /inside/ : /ENOENT/)
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('handoff serves each original build at its own root and only exposes readonly contained files', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'native-kit-server-test-'))
  let kit
  try {
    await writeFile(resolve(root, 'index.html'), 'control')
    for (const library of ['cedar', 'maple']) {
      await mkdir(resolve(root, library, 'assets'), { recursive: true })
      await writeFile(resolve(root, library, 'index.html'), `<script src="/assets/build.js"></script>${library}`)
      await writeFile(resolve(root, library, 'assets/build.js'), library)
    }
    await symlink('/etc/hosts', resolve(root, 'outside'))
    kit = await startKitServers(root, { port: 0 })
    const origin = (name) => `http://127.0.0.1:${kit.ports[name]}`
    assert.equal(await (await fetch(origin('control'))).text(), 'control')
    assert.deepEqual(await (await fetch(origin('control') + '/server.json')).json(), kit.ports)
    for (const library of ['cedar', 'maple']) {
      assert.ok((await (await fetch(origin(library))).text()).includes(library))
      assert.equal(await (await fetch(origin(library) + '/assets/build.js')).text(), library)
    }
    assert.equal((await fetch(origin('control') + '/outside')).status, 403)
    assert.equal((await fetch(origin('control'), { method: 'POST', body: 'test' })).status, 405)
    const range = await fetch(origin('control') + '/index.html', { headers: { range: 'bytes=0-2' } })
    assert.equal(range.status, 206)
    assert.equal(await range.text(), 'con')
    assert.equal(
      (await fetch(origin('control') + '/index.html', { method: 'HEAD' })).headers.get('content-length'),
      '7',
    )
  } finally {
    await kit?.close()
    await rm(root, { recursive: true, force: true })
  }
})

test('handoff checksum verification rejects modified payloads', async () => {
  const { verifyPackage } = await import('./native-kit/verify.mjs')
  const root = await mkdtemp(resolve(tmpdir(), 'native-kit-checksum-'))
  try {
    await writeFile(resolve(root, 'payload.txt'), 'original')
    await writeFile(
      resolve(root, 'files.sha256.json'),
      JSON.stringify([{ path: 'payload.txt', sha256: createHash('sha256').update('original').digest('hex') }]),
    )
    assert.equal((await verifyPackage(root)).checked, 1)
    await writeFile(resolve(root, 'payload.txt'), 'changed')
    await assert.rejects(verifyPackage(root), /checksum mismatch/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('handoff CLI verifies packages reached through a symlinked directory', async () => {
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  const root = await mkdtemp(resolve(tmpdir(), 'native-kit-cli-'))
  try {
    const kit = resolve(root, 'kit')
    await mkdir(kit)
    await copyFile(new URL('./native-kit/verify.mjs', import.meta.url), resolve(kit, 'verify.mjs'))
    await writeFile(resolve(kit, 'payload.txt'), 'original')
    await writeFile(
      resolve(kit, 'files.sha256.json'),
      JSON.stringify([{ path: 'payload.txt', sha256: createHash('sha256').update('original').digest('hex') }]),
    )
    await symlink(kit, resolve(root, 'alias'))
    const { stdout } = await promisify(execFile)(process.execPath, [resolve(root, 'alias/verify.mjs')])
    assert.equal(JSON.parse(stdout).checked, 1)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
