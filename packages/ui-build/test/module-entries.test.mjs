import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import { collectModuleEntries } from '../src/module-entries.mjs'

test('ESM and CJS public subpaths retain re-exported props independently from the root', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ui-public-entries-'))
  try {
    for (const directory of ['src/trigger', 'src/trigger/__tests__', 'src/trigger/style'])
      await mkdir(join(root, directory), { recursive: true })
    await writeFile(join(root, 'src/index.ts'), "export * from './trigger'\n")
    await writeFile(join(root, 'src/trigger/index.ts'), "export { props } from './props'\nexport const Trigger = {}\n")
    await writeFile(join(root, 'src/trigger/props.ts'), "export const props = { trigger: 'hover' }\n")
    await writeFile(join(root, 'src/trigger/__tests__/index.ts'), 'throw new Error("test entry leaked")\n')
    await writeFile(join(root, 'src/trigger/style/index.ts'), 'throw new Error("style entry leaked")\n')
    const input = await collectModuleEntries(root, 'src', 'src/index.ts')
    assert.deepEqual(Object.keys(input).sort(), ['index', 'trigger/index'])
    for (const format of ['es', 'cjs']) {
      const extension = format === 'es' ? 'mjs' : 'cjs'
      await build({
        configFile: false,
        root,
        logLevel: 'silent',
        build: {
          outDir: format,
          minify: false,
          rollupOptions: {
            input,
            preserveEntrySignatures: 'strict',
            output: {
              format,
              preserveModules: true,
              preserveModulesRoot: join(root, 'src'),
              entryFileNames: `[name].${extension}`,
              exports: 'named',
            },
          },
        },
      })
      const subpath = await import(pathToFileURL(join(root, format, `trigger/index.${extension}`)))
      assert.equal(subpath.props.trigger, 'hover')
      assert.ok(subpath.Trigger)
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
