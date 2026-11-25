import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { demoRefs } from './group-demo-sections.mjs'
import { inventoryDemoContent } from './inventory-demo-content.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const normalize = (source) =>
  [
    ...new Set(
      demoRefs(source).map((ref) =>
        ref
          .replace('/en-US/', '/')
          .replace('/zh-CN/', '/')
          .split('/')
          .at(-1)
          .replace(/\.en-US(?=\.vue$)/, ''),
      ),
    ),
  ].sort()

test('every Cedar and Maple family exposes the same scenarios in both languages', () => {
  const rows = inventoryDemoContent()
  const expected = ['demo-groups.json', 'demo-groups.maple.json'].reduce(
    (count, name) =>
      count + Object.keys(JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs', name), 'utf8'))).length,
    0,
  )
  assert.ok(expected >= 209, 'Previously covered component families must not disappear')
  assert.equal(rows.length, expected)
  for (const row of rows) {
    const zh = path.join(root, row.document)
    const en = zh
      .replace(/README\.md$/, 'README.en-US.md')
      .replace(/PICKER\.md$/, 'PICKER.en-US.md')
      .replace(/zh-CN\.md$/, 'en-US.md')
    assert.notEqual(zh, en, row.document)
    assert.ok(fs.existsSync(en), en)
    assert.deepEqual(
      normalize(fs.readFileSync(zh, 'utf8')),
      normalize(fs.readFileSync(en, 'utf8')),
      row.platform + '/' + row.family,
    )
  }
})

test('retired standalone scenarios never return to public groups', () => {
  const plans = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/demo-content-consolidation.json')))
  for (const platform of ['cedar', 'maple']) {
    const groups = JSON.parse(
      fs.readFileSync(path.join(root, `design-ui/configs/demo-groups${platform === 'maple' ? '.maple' : ''}.json`)),
    )
    for (const plan of plans.filter((plan) => plan.platform === platform)) {
      const cases = groups[plan.family].flatMap((group) => group.cases)
      assert.ok(cases.includes(plan.into), platform + '/' + plan.family + '/' + plan.into)
      for (const retired of plan.cases.filter((name) => name !== plan.into))
        assert.ok(!cases.includes(retired), platform + '/' + plan.family + '/' + retired)
    }
  }
})

test('authored showcase and guide pages keep valid demo references after consolidation', () => {
  for (const platform of ['cedar', 'maple']) {
    const base = path.join(
      root,
      platform === 'cedar' ? 'cedar-design-web/packages/ui/docs' : 'maple-design-mobile/packages/ui/docs',
    )
    for (const name of fs
      .readdirSync(base, { recursive: true })
      .filter((name) => name.endsWith('.md') && !name.split('/').some((part) => part.startsWith('.')))) {
      const file = path.join(base, name)
      const raw = fs.readFileSync(file, 'utf8')
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)?.[1] ?? ''
      if (platform === 'cedar' && !/^permalink:/m.test(frontmatter)) continue
      const authored = raw.replace(/^```(?!demo\b)[^\n]*\n[\s\S]*?^```[ \t]*$/gm, '')
      for (const ref of demoRefs(authored))
        assert.ok(fs.existsSync(path.resolve(path.dirname(file), ref)), file + ': ' + ref)
    }
  }
})
