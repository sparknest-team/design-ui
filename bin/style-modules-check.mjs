import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from '../packages/ui-build/node_modules/vite/dist/node/index.js'

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const require = createRequire(resolve(workspace, 'design-ui/packages/ui-build/package.json'))
const less = require('less')
const built = process.argv.includes('--built')
for (const [repo, library, prefix] of [
  ['cedar-design-web', 'cedar-ui', 'c'],
  ['maple-design-mobile', 'maple-ui', 'mp'],
]) {
  const root = resolve(workspace, repo, 'packages', library)
  const src = resolve(root, 'src')
  const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(resolve(dir, e.name)) : [resolve(dir, e.name)])
  const entries = walk(src).filter(file => file.endsWith('/style/index.ts'))
  const css = new Map(), visiting = new Set(), visited = new Set()
  function dependencies(entry) {
    return [...readFileSync(entry, 'utf8').matchAll(/import\s+['"]([^'"]+)['"]/g)].map(m => {
      const target = resolve(dirname(entry), m[1])
      return target.endsWith('.less') ? target : resolve(target, 'index.ts')
    })
  }
  async function visit(entry) {
    assert(!visiting.has(entry), `Circular style dependency: ${entry}`)
    if (visited.has(entry)) return
    assert(existsSync(entry), `Missing style dependency: ${entry}`)
    visiting.add(entry)
    if (entry.endsWith('.less')) {
      css.set(entry, (await less.render(readFileSync(entry, 'utf8'), { filename: entry, javascriptEnabled: true })).css)
    } else {
      for (const dependency of dependencies(entry)) await visit(dependency)
      if (built) {
        for (const [out, ext] of [['es', 'mjs'], ['lib', 'js']]) {
          const target = resolve(root, out, relative(src, entry).replace(/\.ts$/, '.' + ext))
          const output = readFileSync(target, 'utf8')
          for (const dependency of dependencies(entry)) {
            const spec = relative(dirname(entry), dependency).replace(/\.less$/, '.css').replace(/\.ts$/, '.' + ext)
            assert(output.includes(spec), `${target} lost dependency ${spec}`)
            assert(existsSync(resolve(root, out, relative(src, dependency).replace(/\.less$/, '.css').replace(/\.ts$/, '.' + ext))), `Missing emitted dependency: ${dependency}`)
          }
        }
      }
    }
    visiting.delete(entry)
    visited.add(entry)
  }
  for (const entry of entries) await visit(entry)
  for (const [file, output] of css) {
    if (relative(src, file).startsWith('style/')) continue
    assert(!output.includes(`--${prefix}-font-size-xs:`), `Foundation embedded in ${file}`)
  }
  const button = css.get(resolve(src, 'button/style/index.less'))
  assert(!button.includes(`.${prefix}-loading`), `${library}: Button embeds Loading`)
  assert(!button.includes(`.${prefix}-ripple`), `${library}: Button embeds Ripple`)
  console.log(`${library}: ${entries.length} style entries, ${css.size} unique Less modules compiled; no cycles, missing imports or embedded foundation${built ? '; ESM/CJS dependencies verified' : ''}`)
  for (const name of ['button', 'message', 'menu', 'split-button']) {
    const output = css.get(resolve(src, name, 'style/index.less'))
    if (output !== undefined) console.log(`  ${name}: ${Buffer.byteLength(output)} bytes (own CSS)`)
  }
  if (built) {
    const names = ['button', 'message', 'menu', 'split-button']
    for (const [dir, ext] of [['src', 'ts'], ['es', 'mjs']]) {
      const result = await build({
        configFile: false, root, logLevel: 'silent',
        css: { preprocessorOptions: { less: { javascriptEnabled: true } } },
        plugins: [{ name: 'style-consumer-fixture',
          resolveId(id) { if (id === 'virtual:styles') return '\0styles' },
          load(id) {
            if (id === '\0styles') return names.map(name => `import ${JSON.stringify(resolve(root, dir, name, 'style/index.' + ext))}`).join('\n')
          },
        }],
        build: { write: false, minify: false, cssMinify: false, rollupOptions: { input: 'virtual:styles' } },
      })
      const output = result.output.filter(x => x.type === 'asset' && x.fileName.endsWith('.css')).map(x => x.source).join('\n')
      // A foundation can contain light/dark variants: compare against one foundation module.
      const marker = `--${prefix}-font-size-xs:`
      const foundation = css.get(resolve(src, 'style/index.less'))
      assert.equal(output.split(marker).length, foundation.split(marker).length, `${library}/${dir}: duplicated foundation`)
      assert.equal((output.match(new RegExp('^\\.' + prefix + '-loading \\{', 'gm')) ?? []).length, 1, `${library}/${dir}: duplicated Loading`)
      console.log(`  ${dir} consumer: ${Buffer.byteLength(output)} bytes, foundation and Loading included once`)
    }
  }
}
