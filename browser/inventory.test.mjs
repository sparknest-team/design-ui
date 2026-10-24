import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import test from 'node:test'
import { componentPages, demoIndex, mobileSection, guidePages, mapleGuides, sourceFingerprint } from './inventory.mjs'
import { contractFor } from './contracts.mjs'

const workspace = fileURLToPath(new URL('../../', import.meta.url))

test('acceptance fingerprint detects implementation/style edits but not unrelated test formatting', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'docs-browser-inventory-'))
  const source = resolve(directory, 'packages/cedar-ui/src/button')
  mkdirSync(source, { recursive: true })
  const file = resolve(source, 'Button.vue')
  try {
    writeFileSync(file, '<template><button>Original</button></template>')
    const original = sourceFingerprint(directory, 'cedar')
    writeFileSync(file, '<template><button>Changed</button></template>')
    assert.notEqual(sourceFingerprint(directory, 'cedar'), original)
    writeFileSync(file, '<template><button>Original</button></template>')
    mkdirSync(resolve(source, '__tests__'))
    writeFileSync(resolve(source, '__tests__/format-only.spec.ts'), 'export {}')
    assert.equal(sourceFingerprint(directory, 'cedar'), original)
    writeFileSync(resolve(source, 'style.less'), '.button { color: red }')
    assert.notEqual(sourceFingerprint(directory, 'cedar'), original)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

for (const [library, repo, minimum] of [['cedar', 'cedar-design-web', 97], ['maple', 'maple-design-mobile', 91]]) {
  test(`${library}: every actual documented component has an explicit executable browser contract`, () => {
    const pages = componentPages(resolve(workspace, repo), library)
    assert.ok(pages.length >= minimum, 'component coverage cannot silently shrink')
    if (library === 'cedar') {
      assert.ok(pages.some((page) => page.component === 'date-picker'))
      assert.ok(pages.some((page) => page.component === 'time-picker'))
      assert.equal(guidePages(resolve(workspace, repo), library).length, 7)
    }
    const actions = readFileSync(new URL('./actions.mjs', import.meta.url), 'utf8')
    for (const page of pages) {
      const contract = contractFor(library, page.component)
      const index = demoIndex(page, contract.demo)
      assert.ok(page.demos[index].source.trim(), 'contract uses real authored source')
      if (contract.kind === 'interaction') assert.ok(actions.includes(`case '${contract.action}':`), `${page.component}: action must be implemented`)
      else assert.ok(contract.minimum > 0 && contract.root)
      if (library === 'maple') assert.ok(mobileSection(page, page.demos[index]))
    }
    assert.throws(() => contractFor(library, 'new-unreviewed-component'), /missing an explicit/)
    assert.throws(() => demoIndex(pages[0], 'not-a-real-demo.vue'), /not documented/)
  })
}

test('all source syntaxes and every Maple guide remain accounted for', () => {
  const root = resolve(workspace, 'maple-design-mobile')
  const pages = componentPages(root, 'maple')
  const form = pages.find((page) => page.component === 'form')
  assert.ok(form.demos.some((demo) => demo.name === 'field-presentation.vue'), 'HTML-style demo references count alongside fenced demos')
  for (const guide of mapleGuides) {
    assert.ok(!pages.some((page) => page.component === guide))
    assert.ok(readFileSync(resolve(root, `packages/maple-ui/src/${guide}/docs/zh-CN.md`), 'utf8').trim())
  }
})
