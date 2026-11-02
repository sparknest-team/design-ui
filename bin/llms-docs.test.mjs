import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { collectPages, generateDocs, renderPage } from './llms-docs.mjs'

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'llms-docs-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  return { root, put(file, content) {
    const destination = path.join(root, file)
    mkdirSync(path.dirname(destination), { recursive: true })
    writeFileSync(destination, content)
  } }
}

test('Cedar includes public permalinks and expands demos while preserving literal code', t => {
  const { root, put } = fixture(t)
  put('docs/guide/start.md', '---\npermalink: /guide/start/\n---\n# Start\n[Button](/components/button/)\n```html\n<demo src="./missing.vue"></demo>\n```\n')
  put('docs/practices/internal.md', '# Internal\n```yaml\npermalink: /internal/\n```')
  put('src/button/README.md', '---\npermalink: /components/button/\n---\n# Button\n<demo src="./__demos__/basic.vue"></demo>\n\n## API\n| prop | type |\n| --- | --- |\n| size | string |')
  put('src/button/__demos__/basic.vue', '<template><c-button>Save</c-button></template>')
  const output = path.join(root, 'public')
  assert.equal(generateDocs({ root, platform: 'cedar', output }).pages, 2)
  const button = readFileSync(path.join(output, 'llms/zh-CN/components/button.md'), 'utf8')
  assert.match(button, /```vue\n<template><c-button>/)
  assert.match(button, /\| size \| string \|/)
  const guide = readFileSync(path.join(output, 'llms/zh-CN/guide/start.md'), 'utf8')
  assert.match(guide, /\[Button\]\(\.\.\/components\/button.md\)/)
  assert.match(guide, /<demo src=".\/missing.vue"><\/demo>/)
  const full = readFileSync(path.join(output, 'llms-full.txt'), 'utf8')
  assert.match(full, /\[Button\]\(llms\/zh-CN\/components\/button.md\)/)
})

test('Maple retains locales, excludes drafts, expands demo fences, and cleans removed pages', t => {
  const { root, put } = fixture(t)
  put('docs/llms.en-US.md', '# LLM docs\n[Index](./llms.txt)')
  put('src/button/docs/zh-CN.md', '# Button\n```demo\n../example/basic.vue\n```\n\n')
  put('src/button/docs/en-US.md', '# Button\nEnglish API')
  put('src/button/docs/zh-CN.draft.md', '# Draft')
  put('src/button/example/basic.vue', '<template><mp-button>Save</mp-button></template>')
  const output = path.join(root, 'public')
  generateDocs({ root, platform: 'maple', output })
  const index = readFileSync(path.join(output, 'llms.txt'), 'utf8')
  assert.match(index, /## zh-CN/)
  assert.match(index, /## en-US/)
  assert.doesNotMatch(index, /Draft/)
  for (const [, href] of index.matchAll(/\]\(([^)]+)\)/g)) assert.ok(existsSync(path.resolve(output, href)), href)
  const english = readFileSync(path.join(output, 'llms/en-US/llms.md'), 'utf8')
  assert.match(english, /\[Index\]\(\.\.\/\.\.\/llms.txt\)/)
  const first = readFileSync(path.join(output, 'llms-full.txt'), 'utf8')
  assert.match(first, /<mp-button>Save<\/mp-button>/)
  generateDocs({ root, platform: 'maple', output })
  assert.equal(readFileSync(path.join(output, 'llms-full.txt'), 'utf8'), first)
  rmSync(path.join(root, 'src/button/docs/en-US.md'))
  generateDocs({ root, platform: 'maple', output })
  assert.ok(!existsSync(path.join(output, 'llms/en-US/button.md')))
})

test('missing demos fail without replacing previous assets', t => {
  const { root, put } = fixture(t)
  put('docs/start.zh-CN.md', '# Start\n```demo\nmissing.vue\n```')
  put('public/llms.txt', 'previous index')
  assert.throws(() => generateDocs({ root, platform: 'maple', output: path.join(root, 'public') }), /Missing or external demo/)
  assert.equal(readFileSync(path.join(root, 'public/llms.txt'), 'utf8'), 'previous index')
})

test('demo includes cannot read outside the package', t => {
  const { root, put } = fixture(t)
  put('docs/start.zh-CN.md', '# Start\n```demo\n../../secret.vue\n```')
  const pages = collectPages(root, 'maple')
  assert.throws(() => renderPage(pages[0], pages, root), /external demo/)
})

test('self-closing demos expand without executing demo-like strings in code', t => {
  const { root, put } = fixture(t)
  put('docs/start.zh-CN.md', '# Start\n<demo src="./basic.vue" />\n\n```html\n<demo src="missing.vue" />\n```')
  put('docs/basic.vue', '<template>Example</template>')
  const pages = collectPages(root, 'maple')
  const rendered = renderPage(pages[0], pages, root)
  assert.match(rendered, /```vue\n<template>Example<\/template>/)
  assert.match(rendered, /<demo src="missing.vue" \/>/)
})

test('language indexes and bundles contain only their authored locale', t => {
  const { root, put } = fixture(t)
  put('docs/start.zh-CN.md', '# 中文指南\n中文内容')
  put('docs/start.en-US.md', '# English guide\nEnglish content')
  const output = path.join(root, 'public')
  generateDocs({ root, platform: 'maple', output })
  const english = readFileSync(path.join(output, 'llms.en-US.txt'), 'utf8')
  const full = readFileSync(path.join(output, 'llms-full.en-US.txt'), 'utf8')
  assert.match(english, /English guide/)
  assert.doesNotMatch(english, /中文指南/)
  assert.match(full, /English content/)
  assert.doesNotMatch(full, /中文内容/)
  for (const [, href] of english.matchAll(/\]\(([^)]+)\)/g)) assert.ok(existsSync(path.resolve(output, href)))
})


test('Cedar locale home pages have named files and their authored hero title', t => {
  const { root, put } = fixture(t)
  put('docs/en/README.md', '---\npermalink: /en/\nheroText: Cedar Design Web\n---\n## Start\nEnglish introduction')
  const output = path.join(root, 'public')
  generateDocs({ root, platform: 'cedar', output })
  const index = readFileSync(path.join(output, 'llms.en-US.txt'), 'utf8')
  assert.match(index, /\[Cedar Design Web\]\(\.\/llms\/en-US\/index.md\)/)
  assert.ok(existsSync(path.join(output, 'llms/en-US/index.md')))
  assert.ok(!existsSync(path.join(output, 'llms/en-US/.md')))
})
