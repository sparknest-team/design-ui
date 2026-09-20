import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { build } from 'vite'
import { buildLibrary } from '../src/index.mjs'

test('published styles preserve dependencies and the consumer deduplicates CSS modules', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ui-style-deps-'))
  try {
    const files = {
      'src/index.ts': 'export const Button = {}\n',
      'src/style/index.less': ':root { --fixture-foundation: 1; }',
      'src/loading/style/index.less': '.fixture-loading { opacity: .5; }',
      'src/loading/style/index.ts': "import '../../style/index.less'\nimport './index.less'\n",
      'src/button/style/index.less': '.fixture-button { color: red; }',
      'src/button/style/index.ts': "import '../../style/index.less'\nimport '../../loading/style'\nimport './index.less'\n",
    }
    for (const [file, source] of Object.entries(files)) {
      await mkdir(join(root, file, '..'), { recursive: true })
      await writeFile(join(root, file), source)
    }
    await buildLibrary({ root, name: 'fixture', globalName: 'Fixture', bundleName: 'fixture', emitTypes: false })
    const fullCss = await readFile(join(root, 'es/fixture.css'), 'utf8')
    assert(fullCss.indexOf('.fixture-loading') < fullCss.indexOf('.fixture-button'))
    assert.equal(fullCss.split('.fixture-loading').length - 1, 1)
    for (const [dir, ext] of [['es', 'mjs'], ['lib', 'js']]) {
      const entry = await readFile(join(root, dir, `button/style/index.${ext}`), 'utf8')
      assert(entry.includes('../../loading/style/index.' + ext))
      assert(entry.includes('../../style/index.css'))
      assert(!entry.includes('.less'))
      const ownCss = await readFile(join(root, dir, 'button/style/index.css'), 'utf8')
      assert(!ownCss.includes('fixture-loading'))
      assert(!ownCss.includes('fixture-foundation'))
    }
    await writeFile(join(root, 'consumer.js'), "import './es/button/style/index.mjs'\nimport './es/loading/style/index.mjs'\n")
    const result = await build({ configFile: false, root, logLevel: 'silent', build: {
      write: false, minify: false, cssMinify: false,
      rollupOptions: { input: join(root, 'consumer.js') },
    } })
    const css = result.output.filter(x => x.type === 'asset' && x.fileName.endsWith('.css')).map(x => x.source).join('\n')
    for (const marker of ['--fixture-foundation:', '.fixture-loading', '.fixture-button']) {
      assert.equal(css.split(marker).length - 1, 1, marker)
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
