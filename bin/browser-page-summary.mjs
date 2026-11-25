import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const evidence = path.join(root, 'design-ui/audits/evidence/demo-reorganization-2026-10-23')
const inventory = JSON.parse(fs.readFileSync(path.join(evidence, 'browser-inventory.json'), 'utf8'))
  .filter((p) => p.library === 'maple' || /^\/components\/[^/]+\/$/.test(p.route))
  .map((p) =>
    p.component === 'dropdown-menu' ? { ...p, component: 'menu', route: p.route.replace('dropdown-menu', 'menu') } : p,
  )
const attempts = JSON.parse(fs.readFileSync(path.join(evidence, 'all-pages/results.json'), 'utf8'))
const fixesFile = path.join(evidence, 'fixes/validation.json')
const fixes = fs.existsSync(fixesFile) ? JSON.parse(fs.readFileSync(fixesFile, 'utf8')) : []
const complete = new Map()
for (const r of attempts)
  if (r.themes.light && r.themes.dark && !r.renderIncomplete)
    complete.set(r.library + ':' + (r.component === 'dropdown-menu' ? 'menu' : r.component), r)
const previous = new Set(['button', 'tabs', 'select', 'form'])
const normalize = (text) => text.replace(/[\s;,]/g, '').replace(/'/g, '"')
const rows = inventory.map((p) => {
  const key = p.library + ':' + p.component,
    r = complete.get(key)
  const followup = fixes.filter((item) => item.page === key)
  const latestSource = followup.filter((item) => item.sourceIndex === 0).at(-1)
  const dialogPass = ['light', 'dark'].every((mode) =>
    followup.some((item) => item.mode === mode && item.opened && item.closed),
  )
  const schedulerPass = ['light', 'dark'].every((mode) =>
    followup.some((item) => item.mode === mode && item.rendered && item.navigationChanged && item.editorCancelled),
  )
  if (!r && !dialogPass && !schedulerPass)
    return {
      library: p.library,
      component: p.component,
      status: previous.has(p.component) ? '前轮已验' : '未完成',
      source: '-',
      interaction: '-',
    }
  if (!r)
    return {
      library: p.library,
      component: p.component,
      status: '亮暗已查',
      source: latestSource?.sourceMatches ? '首例一致（修复后补验）' : '待复验',
      interaction: dialogPass ? '打开并取消通过 / 打开并取消通过' : '翻页、新建与取消通过 / 翻页、新建与取消通过',
    }
  let source = latestSource?.sourceMatches ? '首例一致（修复后补验）' : r.sourceMatch ? '首例一致' : '待复验'
  const capture = path.join(evidence, 'all-pages', `${p.library}-${p.component}-source.txt`)
  if (!latestSource?.sourceMatches && !r.sourceMatch && fs.existsSync(capture)) {
    const shown = normalize(fs.readFileSync(capture, 'utf8'))
    const match = p.demos.find((d) => normalize(fs.readFileSync(path.join(root, d.file), 'utf8')) === shown)
    if (match) source = match.file === p.demos[0].file ? '与当前首例一致（静态补核）' : '对应页内其他案例（待复验顺序）'
  }
  const interaction = ['light', 'dark']
    .map((mode) => {
      const extra = followup.filter((item) => item.mode === mode).at(-1)
      if (extra?.selection && extra.closed) return '选中回填并关闭通过'
      if (extra?.controlled && extra.trim) return '值模型与 trim 通过'
      if ((extra?.nativeDragOpened && extra.actionClosed) || (extra?.opened && extra.closed))
        return '真实侧滑与关闭通过'
      if (extra?.confirmedDataImage && extra.resetThenConfirmImages === 0) return '真实绘制与清空通过'
      if (extra?.moved) return '真实拖动通过'
      if (extra?.loadedMore || (typeof extra?.before === 'number' && extra.after > extra.before))
        return '滚动新增列表通过'
      if (extra?.loadedAfterNativeScroll) return '懒加载触发通过'
      if (extra?.enteredAndRestored) return '悬停进入与恢复通过'
      if (extra?.nativePullUpdatedList) return '下拉刷新通过'
      if (extra?.localMockOnly && extra.retrySucceeded && extra.cancelled && extra.noActiveRequest)
        return '本地失败、重试、取消通过'
      if (extra?.localPositionChanged && extra.reset) return '本地位置切换与重置通过'
      const a = r.interaction[mode]
      if (!a || a.status) return '展示／专项待验'
      if (a.error) return '操作未完成'
      if (a.valueChanged || (a.before && JSON.stringify(a.before) !== JSON.stringify(a.after))) return '控件状态改变'
      return '已操作，未单独断言结果'
    })
    .join(' / ')
  return { library: p.library, component: p.component, status: '亮暗已查', source, interaction }
})
const remaining = rows.filter((r) => r.status === '未完成')
const totals = Object.fromEntries(
  ['cedar', 'maple'].map((lib) => [
    lib,
    {
      total: rows.filter((r) => r.library === lib).length,
      checkedThisTurn: rows.filter((r) => r.library === lib && r.status === '亮暗已查').length,
      checkedPreviously: rows.filter((r) => r.library === lib && r.status === '前轮已验').length,
      remaining: remaining.filter((r) => r.library === lib).length,
    },
  ]),
)
if (process.argv.includes('--json')) console.log(JSON.stringify({ totals, remaining, rows }, null, 2))
else {
  console.log('# Cedar 和 Maple 页面巡检明细\n')
  console.log(
    '2026-10-23。亮暗已查表示实际打开页面、切换默认亮暗主题、检查 DOM 几何和保存截图，不表示全部案例交互或全部源码均验收。源码列只记录首例；交互列按亮色／暗色分别记录。\n',
  )
  console.log(
    '统计为累计巡检记录；Menu 已按新名称在两端重新核验，不继承旧名称作为兼容入口。开发环境的并行改动、实际验收边界及最终状态见 [收尾报告](./demo-reorganization-2026-10-23.md)。\n',
  )
  console.log('| 组件库 | 页面总数 | 本轮亮暗已查 | 前轮已验 | 未完成 |\n| --- | ---: | ---: | ---: | ---: |')
  for (const [lib, t] of Object.entries(totals))
    console.log(`| ${lib} | ${t.total} | ${t.checkedThisTurn} | ${t.checkedPreviously} | ${t.remaining} |`)
  console.log('\n## 未完成页面\n')
  for (const lib of ['cedar', 'maple'])
    console.log(
      `${lib}：${
        remaining
          .filter((r) => r.library === lib)
          .map((r) => r.component)
          .join('、') || '无页面层面的未完成项'
      }。\n`,
    )
  console.log(
    '## 逐页覆盖\n\n| 组件库 | 页面 | 页面与主题 | 源码 | 代表性交互 亮色／暗色 |\n| --- | --- | --- | --- | --- |',
  )
  for (const r of rows) console.log(`| ${r.library} | ${r.component} | ${r.status} | ${r.source} | ${r.interaction} |`)
  console.log(
    '\n原始操作记录：[results.json](./evidence/demo-reorganization-2026-10-23/all-pages/results.json)；修复后的补验：[validation.json](./evidence/demo-reorganization-2026-10-23/fixes/validation.json)。历史尝试保留，统计优先采用已完成的修复后记录。\n',
  )
}
