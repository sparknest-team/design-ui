import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { build } from '../packages/ui-build/node_modules/vite/dist/node/index.js'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(new URL('../packages/ui-build/package.json', import.meta.url))
const ts = require('typescript')

for (const [brand, repo] of [['cedar', 'cedar-design-web'], ['maple', 'maple-design-mobile']]) {
  test(`${brand}: global styles have strict side-effect import declarations`, () => {
    const root = mkdtempSync(join(tmpdir(), `${brand}-style-types-`))
    try {
      const namespace = join(root, 'node_modules', `@${brand}-design`)
      mkdirSync(namespace, { recursive: true })
      symlinkSync(resolve(workspace, repo, 'packages/ui'), join(namespace, 'ui-vue'), 'dir')
      const specifier = `@${brand}-design/ui-vue`
      const source = `import '${specifier}/style'\nimport '${specifier}/reset.css'\n// @ts-expect-error CSS side-effect entry has no named JavaScript exports\nimport { invalid } from '${specifier}/style'\nvoid invalid\n`
      for (const extension of ['ts', 'mts', 'cts']) {
        const file = join(root, `entry.${extension}`)
        writeFileSync(file, source)
        const nodeNext = extension !== 'ts'
        const program = ts.createProgram([file], {
          strict: true, noEmit: true, skipLibCheck: false, noUncheckedSideEffectImports: true, types: [],
          target: ts.ScriptTarget.ES2022,
          module: nodeNext ? ts.ModuleKind.NodeNext : ts.ModuleKind.ESNext,
          moduleResolution: nodeNext ? ts.ModuleResolutionKind.NodeNext : ts.ModuleResolutionKind.Bundler,
        })
        const diagnostics = ts.getPreEmitDiagnostics(program)
        assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
          getCanonicalFileName: file => file,
          getCurrentDirectory: () => root,
          getNewLine: () => '\n',
        }))
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test(`${brand}: Vite resolves both single and nested component style exports`, async () => {
    const root = mkdtempSync(join(tmpdir(), `${brand}-style-exports-`))
    try {
      const packageRoot = join(root, 'node_modules', `@${brand}-design`, 'ui-vue')
      mkdirSync(packageRoot, { recursive: true })
      writeFileSync(join(root, 'package.json'), '{"private":true,"type":"module"}')
      writeFileSync(join(packageRoot, 'package.json'), readFileSync(resolve(workspace, repo, 'packages/ui/package.json')))
      for (const [entry, selector] of [['button', 'style-button'], ['date/picker', 'style-picker']]) {
        const dir = join(packageRoot, 'es', entry, 'style')
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.mjs'), "import './index.css'\n")
        writeFileSync(join(dir, 'index.css'), `.${selector} { display: block; }\n`)
      }
      const entry = join(root, 'entry.mjs')
      writeFileSync(entry, `import '@${brand}-design/ui-vue/button/style'\nimport '@${brand}-design/ui-vue/date/picker/style'\n`)
      const result = await build({
        configFile: false, root, logLevel: 'silent',
        build: { write: false, minify: false, cssMinify: false, rollupOptions: { input: entry } },
      })
      const css = result.output.filter(item => item.type === 'asset' && item.fileName.endsWith('.css')).map(item => item.source).join('\n')
      assert.match(css, /\.style-button/)
      assert.match(css, /\.style-picker/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
}
