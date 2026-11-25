import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { markdownSections } from './api-document-structure.mjs'
import {
  cleanPublicComponentDocs,
  cleanPublicDocumentation,
  internalDocumentationNotes,
} from './clean-public-component-docs.mjs'
import { documentationFiles, normalizeApiHeadings } from './normalize-api-headings.mjs'

test('maintenance paragraphs move out while public behavior remains', () => {
  const source =
    '## 同源实现与平台边界\n\n两端各自保存完整源码，不引用公共核心，不共享组件实例或响应式状态；修改时同步维护两份实现。主体、Props、关键样式及配对测试纳入只读源码一致性检查，主题 token 和安装入口各自维护。\n\n关闭按钮支持键盘操作，close 只触发一次，closed 在离场动画完成后触发。Maple 内部关闭类由 __close-icon 调整为 __close-btn；默认图标资源由各库本地适配。\n'
  const result = cleanPublicDocumentation(source)
  assert.doesNotMatch(result.text, /源码|内部关闭类|配对测试/)
  assert.ok(result.text.includes('关闭按钮支持键盘操作；close 只触发一次，closed 在离场动画完成后触发。'))
  assert.ok(result.edits.length >= 2)
  assert.equal(cleanPublicDocumentation(result.text).text, result.text)
})

test('code, API tables and domain maintenance remain intact while API migration history is removed', () => {
  const source =
    '# Scheduler\n\n## 维护禁用时段\n\n通过 disabled-ranges 配置设备维护。\n\n## API\n\n| Prop | Description |\n| --- | --- |\n| audit | 审计记录 |\n\n```md\n## 同源实现与平台边界\n\n源码一致性检查与配对测试。\n```\n\n## 迁移\n\n旧 allow-search 改为 filterable。\n'
  assert.equal(
    cleanPublicDocumentation(source).text,
    source.replace('\n## 迁移\n\n旧 allow-search 改为 filterable。\n', ''),
  )
  assert.deepEqual(internalDocumentationNotes(source), [])
})

test('style notes join a single CSS Variables chapter without losing defaults or layout', () => {
  const table = '| Variable | Default |\n| --- | --- |\n| --c-card-gap | 4px |\n'
  const source =
    '# Card\n\n## Card CSS Variables\n\n' +
    table +
    '\n## 同源实现与平台边界\n\n### 动效变量\n\n| Variable | Default |\n| --- | --- |\n| --c-card-duration | 200ms |\n'
  const result = cleanPublicDocumentation(source, { primary: 'Card' }).text
  const tree = markdownSections(result)
  assert.equal(tree.children.filter((n) => n.title === 'CSS Variables').length, 1)
  assert.ok(tree.children.find((n) => n.title === 'CSS Variables').children.some((n) => n.title === '动效变量'))
  assert.ok(result.includes(table))
  assert.ok(result.includes('| --c-card-duration | 200ms |'))
  assert.doesNotMatch(result, /[^\n]## CSS Variables/)
  assert.equal(cleanPublicDocumentation(result, { primary: 'Card' }).text, result)
})

test('style-only directive pages remain stable across cleanup and heading normalization', () => {
  const source =
    '# Hover\n\n## HoverOverlay helpers\n\nPublic helper.\n\n## CSS Variables\n\n### 默认样式变量\n\n| Token | Default |\n| --- | --- |\n| --mp-hover-opacity | 0.04 |\n'
  const normalize = (text) => normalizeApiHeadings(cleanPublicDocumentation(text, { primary: 'Hover' }).text, 'Hover')
  const expected = source.replace('### 默认样式变量\n\n', '')
  assert.equal(normalize(source), expected)
  assert.equal(normalize(normalize(source)), expected)
})

test('all public component pages are free of engineering-process notes and cleanup is idempotent', () => {
  assert.equal(cleanPublicComponentDocs().changed, 0)
  const remaining = []
  for (const { filename } of documentationFiles()) {
    for (const note of internalDocumentationNotes(fs.readFileSync(filename, 'utf8'))) remaining.push({ filename, note })
  }
  assert.deepEqual(remaining, [])
})
