import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'
import test from 'node:test'
import { buildLibrary } from '../src/index.mjs'

test('published modules retain consumer diagnostics while UMD is standalone production', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ui-library-env-'))
  const previous = process.env.NODE_ENV
  try {
    await mkdir(join(root, 'src/button'), { recursive: true })
    await writeFile(join(root, 'package.json'), '{"private":true}')
    await writeFile(join(root, 'src/index.ts'), "export * from './button/props'\n")
    await writeFile(join(root, 'src/button/index.ts'), "export * from './props'\n")
    await writeFile(join(root, 'src/button/props.ts'), [
      'export const productionBuild = import.meta.env.PROD',
      "export const props = { validator: process.env.NODE_ENV !== 'production' ? (value: string) => value === 'valid' : undefined }",
    ].join('\n'))
    await writeFile(join(root, 'src/index.less'), ':root { --fixture-color: red; }\n')
    const config = { root, name: 'fixture', bundleName: 'fixture', globalName: 'Fixture', emitTypes: false }
    await mkdir(join(root, 'es'))
    await writeFile(join(root, 'es/previous.txt'), 'previous build')
    process.env.NODE_ENV = 'compile'
    await assert.rejects(buildLibrary(config), /requires NODE_ENV=production/)
    assert.equal(await readFile(join(root, 'es/previous.txt'), 'utf8'), 'previous build', 'preflight must not delete existing outputs')
    process.env.NODE_ENV = 'production'
    await buildLibrary(config)
    assert.equal(process.env.NODE_ENV, 'production')
    const require = createRequire(join(root, 'package.json'))
    for (const environment of ['development', 'production']) {
      process.env.NODE_ENV = environment
      const esm = await import(`${pathToFileURL(join(root, 'es/button/props.mjs')).href}?env=${environment}`)
      const file = join(root, 'lib/button/props.js')
      delete require.cache[require.resolve(file)]
      const cjs = require(file)
      for (const output of [esm, cjs]) {
        assert.equal(output.productionBuild, true, 'Vue/build-only branches are compiled in production mode')
        if (environment === 'development') {
          assert.equal(output.props.validator('valid'), true)
          assert.equal(output.props.validator('invalid'), false)
        } else {
          assert.equal(output.props.validator, undefined, 'production consumers must drop diagnostic-only functions')
        }
      }
    }
    const context = {}
    vm.runInNewContext(await readFile(join(root, 'umd/fixture.js'), 'utf8'), context, { timeout: 1000 })
    assert.equal(context.Fixture.productionBuild, true)
    assert.equal(context.Fixture.props.validator, undefined, 'UMD must work without a process global')
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = previous
    await rm(root, { recursive: true, force: true })
  }
})
