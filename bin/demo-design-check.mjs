import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const require = createRequire(path.join(root, 'cedar-design-web/packages/ui/package.json'))
const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc')
let demos = 0,
  references = 0
const failures = []
for (const library of ['cedar-design-web/packages/ui', 'maple-design-mobile/packages/ui']) {
  const base = path.join(root, library, 'src')
  for (const file of fs.readdirSync(base, { recursive: true })) {
    const full = path.join(base, file)
    if (file.endsWith('.md')) {
      const source = fs.readFileSync(full, 'utf8')
      for (const match of source.matchAll(/<demo\b[^>]*\bsrc="([^"]+\.vue)"|```demo\s*\n([^\n]+\.vue)\s*\n```/g)) {
        const reference = (match[1] ?? match[2]).trim()
        references++
        if (!fs.existsSync(path.resolve(path.dirname(full), reference))) failures.push(`${full}: missing ${reference}`)
      }
    }
    if (!file.endsWith('.vue') || !/\/(?:__demos__|example)\//.test('/' + file)) continue
    try {
      const source = fs.readFileSync(full, 'utf8')
      for (const match of source.matchAll(/from\s*['"](\.[^'"]+\.vue)(?:\?[^'"]+)?['"]/g))
        assert(fs.existsSync(path.resolve(path.dirname(full), match[1])), `${full}: missing import ${match[1]}`)
      const { descriptor, errors } = parse(source, { filename: full })
      assert.deepEqual(errors, [])
      const script = descriptor.scriptSetup || descriptor.script ? compileScript(descriptor, { id: full }) : undefined
      if (descriptor.template) {
        const compiled = compileTemplate({
          source: descriptor.template.content,
          filename: full,
          id: full,
          compilerOptions: { bindingMetadata: script?.bindings },
        })
        assert.deepEqual(compiled.errors, [])
      }
      demos++
    } catch (error) {
      failures.push(`${full}: ${String(error)}`)
    }
  }
}
const enrichment = JSON.parse(
  fs.readFileSync(path.join(root, 'design-ui/audits/demo-enrichment-2026-10-23.json'), 'utf8'),
)
for (const item of enrichment) {
  assert(item.dimensions.length <= 3, `${item.component}: more than three dimensions`)
  for (const [library, directory] of [
    ['cedar-design-web/packages/ui', '__demos__'],
    ['maple-design-mobile/packages/ui', 'example/demos'],
  ]) {
    assert(
      fs.existsSync(path.join(root, library, 'src', item.component, directory, `${item.name}.vue`)),
      `${item.component}: missing paired demo`,
    )
  }
}
console.log(JSON.stringify({ demos, references, newPairedDemos: enrichment.length * 2, failures }, null, 2))
if (failures.length) process.exitCode = 1
