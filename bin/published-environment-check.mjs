import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import vm from 'node:vm'

export async function checkPublishedEnvironment(root) {
  const cedar = existsSync(resolve(root, 'packages/cedar-ui/package.json'))
  const ui = resolve(root, 'packages', cedar ? 'cedar-ui' : 'maple-ui')
  const brand = cedar ? 'Cedar' : 'Maple'
  const bundle = cedar ? 'cedar' : 'maple'
  const require = createRequire(resolve(ui, 'package.json'))
  const previous = process.env.NODE_ENV
  const valid = { size: 'md', status: 'primary', underline: 'hover' }
  try {
    for (const environment of ['development', 'production']) {
      process.env.NODE_ENV = environment
      const esm = await import(`${pathToFileURL(resolve(ui, 'es/link/props.mjs')).href}?published=${environment}`)
      const file = resolve(ui, 'lib/link/props.js')
      delete require.cache[require.resolve(file)]
      const cjs = require(file)
      for (const output of [esm, cjs]) {
        assert.equal(output.linkProps.size.default, 'md')
        for (const [key, value] of Object.entries(valid)) {
          const validator = output.linkProps[key].validator
          if (environment === 'production') assert.equal(validator, undefined, `${brand} production ${key}`)
          else {
            assert.equal(validator(value), true, `${brand} development ${key}`)
            assert.equal(validator('invalid'), false, `${brand} invalid ${key}`)
          }
        }
      }
    }
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', pretendToBeVisual: true })
    try {
      assert.equal(typeof dom.window.process, 'undefined')
      vm.runInContext(readFileSync(require.resolve('vue/dist/vue.global.prod.js'), 'utf8'), dom.getInternalVMContext(), { timeout: 5000 })
      vm.runInContext(readFileSync(resolve(ui, `umd/${bundle}.js`), 'utf8'), dom.getInternalVMContext(), { timeout: 5000 })
      assert.ok(dom.window[brand].Link)
      for (const key of Object.keys(valid)) assert.equal(dom.window[brand].linkProps[key].validator, undefined)
    } finally { dom.window.close() }
    console.log(`${brand}: actual ESM/CJS development and production consumers, and browser UMD without Node globals passed`)
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = previous
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await checkPublishedEnvironment(resolve(process.argv[2] ?? process.cwd())) }
  catch (error) { console.error(`${error.name}: ${error.message}`); process.exitCode = 1 }
}
