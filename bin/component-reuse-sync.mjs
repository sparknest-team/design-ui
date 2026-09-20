import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Documentation metadata only. Does not generate or import component runtime code.
const root = fileURLToPath(new URL('../../', import.meta.url))
const audit = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/audits/component-reuse.json'), 'utf8'))
const check = process.argv.includes('--check')
const write = (relative, content) => {
  const target = path.join(root, relative)
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) throw Error(`Reuse metadata drift: ${relative}`)
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, content)
  }
}
const english = { same: 'Same source (verified)', pending: 'Same source (planned)', adapt: 'Adapt (planned)', logic: 'Logic copies (planned)', separate: 'Separate' }
for (const side of ['cedar', 'maple']) {
  const seen = new Set()
  for (const item of audit.components) {
    if (seen.has(item[side])) throw Error(`Duplicate ${side}: ${item[side]}`)
    seen.add(item[side])
    if (!fs.existsSync(path.join(root, item.sources[side]))) throw Error(`Missing source: ${item.sources[side]}`)
  }
}
const maps = Object.fromEntries(['cedar', 'maple'].map(side => [side, Object.fromEntries(audit.components.map(item => [item[side], {
  label: audit.labels[item.level], en: english[item.level], reason: item.reason,
}]))]))
write('cedar-design-web/packages/cedar-ui/docs/.vuepress/configs/sidebar/component-reuse.json', JSON.stringify(maps.cedar, null, 2) + '\n')
write('maple-design-mobile/packages/maple-ui/component-reuse.json', JSON.stringify(maps.maple, null, 2) + '\n')
const counts = Object.entries(audit.labels).map(([key, label]) => `${label} ${audit.components.filter(item => item.level === key).length} 组`).join('；')
const intro = `# Cedar / Maple 跨端代码复用调研\n\n审计日期：${audit.date}。基于当前工作区源码（包含正在进行的 API 对齐改动），不是发布版本保证。标记规则更新：2026-09-08；已完成原待同源 11 组组件及 Link / Paper 的独立复制与双端验证；待适配和逻辑待同源仍为候选。\n\n${counts}。按组件族计数，包含子组件及异名 Drawer / Popup；不等于菜单条目数量。\n\n## 菜单标记\n\n| 标记 | 含义 | 建议顺序 |\n| --- | --- | --- |\n| [已同源] | 已完成对应范围的源码对齐并纳入一致性检查；两端各自维护源码 | P0：保持检查，作为后续样板 |\n| [待同源] | 主体适合同源复制；尚待实现对齐与双端验证，不是已完成 | P1 |\n| [待适配] | 先对齐 API 或适配依赖，再同源复制主体；尚未完成 | P2 |\n| [逻辑待同源] | 计划将内部逻辑同源复制为两份，保留端侧展示/交互；尚未完成 | P3 |\n| [独立] | 同名但语义层级不同，不要求主体同源 | 暂缓 |\n\n未标记表示本次没有确认跨端对应关系，或是主题/指南/指令等页面；不表示无法复用。原“共用”统一改为“待同源”。所有候选均采用独立复制、双端同步维护；不引用同一份核心，不建立跨库运行时依赖，不通过外部模板生成组件源码。各库内部工具复用不受影响。\n\n## 调研依据和限制\n\n重新运行 api-contract-inventory.mjs，从 TypeScript 根入口追踪得到 Cedar 113 / Maple 114 个运行时 Props 导出，82 个同名导出可比较（包含子组件）。Props 名称相同不能证明默认值、类型、事件、插槽、方法和行为完全一致。额外检查了主体模板/TSX、事件触发、插槽、计时与弹层依赖；详细 Props 键差异见下方附录。Search 等根导出不对称也单独列为候选。\n\ncopied-components-check.mjs 已扩展至原待同源 11 组及 Link 的主体、Props、关键样式和配对测试。安装入口、主题 token、图标/配置适配仍由两库独立维护；最新覆盖以脚本及运行结果为准。新增检查不会自动升级分类，须完成双端验证后更新。其余属于源码静态评估，没有声称所有端侧行为已经通过验证。\n\n初轮完成调研、菜单和文档标记；后续已完成的复制重构按同源标记维护。后续严格遵循包内复制 + platform 适配 + 一致性检查方式：先修改并验证一端，再复制至另一端，仅调整前缀、本地导入与必要的平台适配，后续两边同步修改。不抽取两端共同引用的核心实现，不共享实例或状态。\n\n## 逐组件建议\n\n| Cedar | Maple | 标记 | 依据 / 同源对齐前置条件 |\n| --- | --- | --- | --- |\n`
const rows = audit.components.map(item => `| ${item.cedar} | ${item.maple} | ${audit.labels[item.level]} | ${item.reason} |`).join('\n')
const tail = `\n\n## 后续维护与实施\n\n1. 以 Card / Badge / Affix / Switch 的 platform 适配和源码一致性检查为模板。\n2. 原待同源 11 组和 Link / Paper 已完成；后续按待适配、逻辑待同源分类逐项推进，不因本批完成而自动升级其他候选。\n3. 每个组件先固定 Props 类型/默认值、事件载荷和顺序、Slots 参数、Expose，以及受控/非受控语义；子组件必须一并验收。\n4. 配对测试各自保存在两库并分别运行，覆盖键盘与触控、禁用/只读、SSR、挂载清理和主题。弹层额外覆盖嵌套、焦点恢复及滚动锁。通过后再升级为已同源标记。\n\n## 未配对范围\n\nCedar 的 Tree / Transfer / Descriptions / Timeline / FilterForm 等，以及 Maple 的 PullRefresh / SwipeCell / IndexBar / NumberKeyboard / Signature 等，本次没有确认可直接同源对齐的对应组件，保留原菜单。Drawer / Popup 是异名候选；Message 不直接等同 NoticeBar 或 Notification。Cedar 日期/时间 picker 在内部子目录，Maple 菜单通过字段文档组织，标记数量因此不同。\n\n## 维护\n\n唯一分类数据：design-ui/audits/component-reuse.json。修改后从工作区运行 node design-ui/bin/component-reuse-sync.mjs，同步两库的文档元数据；--check 检查漂移。复制的是文档元数据，不是组件源码。后续源码变化后应重新运行 Props 审计并复核分级，不能只更新日期。\n`
const inventory = fs.readFileSync(path.join(root, 'design-ui/audits/component-reuse-props.md'), 'utf8')
const inventorySummary = inventory.match(/Cedar：(\d+) 个 Props 导出；Maple：(\d+) 个；同名可比较：(\d+) 个。/)
if (!inventorySummary) throw Error('Invalid Props inventory summary')
const [, cedarProps, mapleProps, sharedProps] = inventorySummary
const currentIntro = intro.replace(
  'Cedar 113 / Maple 114 个运行时 Props 导出，82 个同名导出可比较',
  `Cedar ${cedarProps} / Maple ${mapleProps} 个运行时 Props 导出，${sharedProps} 个同名导出可比较`,
)
const report = currentIntro + rows + tail + '\n## Props 差异快照\n\n' + inventory.replace(/^# .*\n/, '')
write('design-ui/audits/component-reuse.md', report + '\n## 源码索引\n\n' + audit.components.map(item => `- ${item.cedar} / ${item.maple}：[Cedar](../../${item.sources.cedar}) · [Maple](../../${item.sources.maple})`).join('\n') + '\n')
write('cedar-design-web/packages/cedar-ui/docs/guide/component-reuse.md', '---\npermalink: /guide/component-reuse/\n---\n\n' + report)
write('maple-design-mobile/packages/maple-ui/docs/componentReuse.zh-CN.md', report)
write('maple-design-mobile/packages/maple-ui/docs/componentReuse.en-US.md', '# Cross-platform component reuse\n\nThe labels mean: Same source (verified copies), Same source (planned copies), Adapt (planned copies after adaptation), Logic copies (planned; keep platform UI), Separate (different abstraction). Each library owns its source; there is no shared runtime core or generated component source. Planned labels do not mean completed alignment. Unmarked entries are unassessed or have no confirmed counterpart. The detailed audit below is maintained in Chinese.\n\n' + report)
console.log(`${check ? 'Checked' : 'Updated'} ${audit.components.length} component families: ${counts}`)
