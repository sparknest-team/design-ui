import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import test from 'node:test'
import { componentPages, demoIndex, mobileSection, guidePages, mapleGuides, sourceFingerprint, productionFingerprint } from './inventory.mjs'
import { contractFor } from './contracts.mjs'
import { copyProductionSnapshot } from './snapshot.mjs'

const workspace = fileURLToPath(new URL('../../', import.meta.url))

test('production snapshots preserve nested files independently of later builds', async () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'docs-snapshot-test-'))
  try {
    const source = resolve(directory, 'source'), target = resolve(directory, 'snapshot')
    mkdirSync(resolve(source, 'assets/empty'), { recursive: true })
    writeFileSync(resolve(source, 'index.html'), 'original')
    writeFileSync(resolve(source, 'assets/code.js'), 'code')
    await copyProductionSnapshot(source, target)
    writeFileSync(resolve(source, 'index.html'), 'next build')
    rmSync(resolve(source, 'assets/code.js'))
    assert.equal(readFileSync(resolve(target, 'index.html'), 'utf8'), 'original')
    assert.equal(readFileSync(resolve(target, 'assets/code.js'), 'utf8'), 'code')
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('production acceptance detects compiler, theme client and lockfile edits, excluding generated caches and tests', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'docs-production-inventory-'))
  try {
    mkdirSync(resolve(directory, 'packages/cedar-ui/src'), { recursive: true })
    const docs = resolve(directory, 'packages/cedar-ui/docs/.vuepress')
    mkdirSync(docs, { recursive: true })
    writeFileSync(resolve(docs, 'client.ts'), 'export const theme = "light"')
    const initial = productionFingerprint(directory, 'cedar')
    writeFileSync(resolve(docs, 'client.ts'), 'export const theme = "dark"')
    assert.notEqual(productionFingerprint(directory, 'cedar'), initial)
    writeFileSync(resolve(docs, 'client.ts'), 'export const theme = "light"')
    mkdirSync(resolve(docs, '.temp-build'))
    writeFileSync(resolve(docs, '.temp-build/generated.ts'), 'export {}')
    writeFileSync(resolve(docs, 'client.test.ts'), 'export {}')
    assert.equal(productionFingerprint(directory, 'cedar'), initial)
    const home = resolve(docs, '../README.md')
    writeFileSync(home, '# Homepage')
    assert.notEqual(productionFingerprint(directory, 'cedar'), initial)
    rmSync(home)
    assert.equal(productionFingerprint(directory, 'cedar'), initial)
    mkdirSync(resolve(docs, 'public'))
    const logo = resolve(docs, 'public/logo.svg')
    writeFileSync(logo, '<svg/>')
    assert.notEqual(productionFingerprint(directory, 'cedar'), initial)
    rmSync(logo)
    assert.equal(productionFingerprint(directory, 'cedar'), initial)
    writeFileSync(resolve(directory, 'pnpm-lock.yaml'), 'lockfileVersion: 9')
    assert.notEqual(productionFingerprint(directory, 'cedar'), initial)
    mkdirSync(resolve(directory, 'packages/maple-ui/src'), { recursive: true })
    const cli = resolve(directory, 'packages/maple-cli/src/node')
    mkdirSync(cli, { recursive: true })
    writeFileSync(resolve(cli, 'build.ts'), 'export const version = 1')
    const originalCompiler = productionFingerprint(directory, 'maple')
    writeFileSync(resolve(cli, 'build.ts'), 'export const version = 2')
    assert.notEqual(productionFingerprint(directory, 'maple'), originalCompiler)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('Maple production fingerprint includes HTML templates, site runtime and mjs configuration', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'docs-html-inventory-'))
  try {
    mkdirSync(resolve(directory, 'packages/maple-ui/src'), { recursive: true })
    mkdirSync(resolve(directory, 'packages/maple-cli/site/pc'), { recursive: true })
    for (const file of ['packages/maple-cli/site/index.html', 'packages/maple-cli/site/mobile.html', 'packages/maple-cli/site/pc/App.vue', 'packages/maple-ui/maple.config.mjs']) {
      const before = productionFingerprint(directory, 'maple')
      writeFileSync(resolve(directory, file), 'changed production input')
      assert.notEqual(productionFingerprint(directory, 'maple'), before, file)
      rmSync(resolve(directory, file))
      assert.equal(productionFingerprint(directory, 'maple'), before)
    }
    const before = productionFingerprint(directory, 'maple')
    writeFileSync(resolve(directory, 'packages/maple-cli/site/pc/App.spec.ts'), 'test only')
    assert.equal(productionFingerprint(directory, 'maple'), before)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

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
