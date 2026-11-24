import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const mobileRequire = createRequire(path.join(root, 'maple-design-mobile/packages/vite-plugins/package.json'))
const { pinyin } = mobileRequire('pinyin-pro')
const items = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/core-strengths.json'), 'utf8'))
const check = process.argv.includes('--check')
let stale = false
function save(file, text) {
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === text) return
  if (check) {
    stale = true
    console.error(`Stale strengths page: ${file}`)
    return
  }
  fs.writeFileSync(file + '.tmp', text)
  fs.renameSync(file + '.tmp', file)
}
for (const platform of ['cedar', 'maple']) {
  const base = path.join(
    root,
    platform === 'cedar' ? 'cedar-design-web/packages/ui' : 'maple-design-mobile/packages/ui',
  )
  const selected = items.filter((item) => item[platform])
  const catalog = JSON.parse(
    fs.readFileSync(
      path.join(
        base,
        platform === 'cedar'
          ? 'docs/.vuepress/configs/component-catalog.json'
          : 'docs/components/component-catalog.json',
      ),
      'utf8',
    ),
  )
  for (const locale of platform === 'cedar' ? ['zh-CN'] : ['zh-CN', 'en-US']) {
    const componentLink = (id) =>
      platform === 'cedar'
        ? (catalog.components.find((c) => c.id === id)?.route ?? (id === 'themes' ? '/themes/' : undefined))
        : `#/${locale}/${id}`
    const title = locale === 'en-US' ? 'Core features' : '核心特点'
    let text =
      platform === 'cedar' ? `---\npermalink: /showcase/strengths/\ntitle: ${title}\npageInfo: false\n---\n\n` : ''
    text += `# ${title}\n\n`
    if (locale === 'en-US')
      text += '> Feature descriptions and example labels on this page are currently in Chinese.\n\n'
    text += `${platform === 'cedar' ? 'Cedar' : 'Maple'} 的特点既体现在单个组件，也体现在跨组件的约定和业务流程中。这里整理了 ${selected.length} 个有现有示例支撑的展示点，覆盖 ${[...new Set(selected.map((item) => item.level))].join('、')}。\n\n`
    text += '## 演示时先讲什么\n\n'
    text += '- **跨组件一致性**：一起切换输入、选择和日期字段的尺寸、变体，观察一组字段如何遵循共同约定。\n'
    text += '- **阅读与编辑闭环**：修改、取消、确认及拒绝后重试，核对临时输入与已保存数据。\n'
    text += '- **业务数据接入**：从 ID 回显、搜索候选到人员操作，展示字段如何连接业务模型与服务。\n'
    text +=
      platform === 'cedar'
        ? '- **复杂业务组合**：操作列管理、上传准备与排期事务，观察保存、失败恢复和自定义接入。\n'
        : '- **移动触控组合**：体验滑动关闭确认、刷新及安全区，检查触控操作与移动容器的配合。\n'
    text +=
      '\n以下属于本库的设计取向、已实现能力和工程保障。是否比某个参考库更省配置或体验更好，需要在逐组件页中按同一业务任务验证。\n\n'
    for (const level of [...new Set(selected.map((item) => item.level))]) {
      text += `## ${level}\n\n`
      for (const item of selected.filter((item) => item.level === level)) {
        const sample = item[platform]
        if (!fs.existsSync(path.join(base, sample.source))) throw new Error(`Missing source: ${sample.source}`)
        const components = item.components
          .filter((id) => componentLink(id))
          .filter((id) =>
            platform === 'cedar'
              ? catalog.components.some((c) => c.id === id)
              : catalog.components.some((c) => c.id === id),
          )
          .map((id) => `[${catalog.components.find((c) => c.id === id).name}](${componentLink(id)})`)
        const target = catalog.components
          .find((component) => component.id === sample.component)
          ?.demos.find((demo) => demo.source === sample.source)
        const anchor = target
          ? platform === 'cedar'
            ? target.anchor
            : /[\u4e00-\u9fa5]/.test(target.title)
              ? pinyin(target.title, { toneType: 'num' }).replaceAll(' ', '')
              : target.title.replaceAll(' ', '')
          : ''
        const docLink = componentLink(sample.component) + (anchor ? '#' + anchor : '')
        text += `### ${item.title}\n\n${item[platform + 'Value'] ?? item.value}\n\n演示方法：${item[platform + 'Demonstration'] ?? item.demonstration}\n\n[打开对应示例](${docLink})`
        if (components.length) text += ` · 相关组件：${components.join('、')}`
        text += '\n\n'
        if (item.note) text += `${item.note}\n\n`
      }
    }
    const comparisons = platform === 'cedar' ? '/showcase/components/' : `#/${locale}/showcaseComponents`
    text += `## 继续逐项比较\n\n在[逐组件对照](${comparisons})中查看其他组件库的相似示例、文档依据与待核验增量；每个特点的运行示例仍保存在对应组件目录中。\n`
    save(
      path.join(base, platform === 'cedar' ? 'docs/showcase/strengths.md' : `docs/showcaseStrengths.${locale}.md`),
      text,
    )
  }
  console.log(`${platform}: ${selected.length} source-backed presentation points`)
}
if (stale) process.exitCode = 1
