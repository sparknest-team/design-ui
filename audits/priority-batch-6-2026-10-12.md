# 第六批：Time / TimeRange 可选手输

## 实施范围

- Maple 新增并实际消费 `inputEditable`，默认 false；Cedar 保持 true。没有旧别名，也没有共享运行时、实例或 platform 配置。
- 两端独立复制 PickerField 和时间解析/约束/提交代码；移动端 presentation 单独负责输入点击、时钟按钮和 ArrowDown 打开原有 picker/clock 面板。
- Enter/整字段失焦提交，Esc 撤销；范围两端移动不提交，输入法组合期间不提交。无效或受控拒绝的文本恢复模型值；切换不可编辑/只读/禁用丢弃未提交文本。
- 打开移动端面板前先释放输入焦点并完成提交，避免 Popup 自动聚焦后失焦提交反过来关闭面板。时钟按钮有名称、显隐状态及禁用语义。
- 新按钮样式只引用系统 token，TimeRange 沿用现有 Time 样式依赖，没有重复增加样式入口。
- 两端 Time/TimeRange 中文 Demo、Maple 英文 Demo、中间卡片与右侧集合、API 文档、发布类型消费者、changeset、同源调研和菜单均同步。
- 仍归类 logicSame；移动端面板布局和默认手输行为有意不同。当前统计仍为 55 same / 15 logicSame / 1 separate，不代表所有 API 差异已清零。

## 验证

- Cedar 日期/时间及 PickerField 回归：43 文件、196 项通过。
- Maple 同范围首轮 278 项通过，新增 2 项聚焦测试发现测试在 focus 更新完成前立即输入；调整为真实交互的 focus → Vue 更新 → 输入时序。最终手输/键盘专项 21 项通过，含真实 Popup（仅面板叶子 stub）的打开路径。合计覆盖 280 项，无未解决的测试失败。
- Cedar 使用项目既定 `pnpm typecheck` 通过；直接对 tsconfig.json 检查会触发既有 rootDir/export-map 歧义，不修改构建配置来绕过。
- Maple 全源码 vue-tsc 通过；两端受影响源码/新 Demo/类型样例 ESLint 通过。
- Time 门禁 34 对、字段底层门禁 23 对及四份 Less 编译通过。字段门禁只规范化 Less @import 引号（两端 formatter 差异），未忽略样式或逻辑内容。
- Maple style-vars：64 shared system tokens、57 governed system values、1055 governed component values、49 component contracts；无未解析系统变量。
- Maple docs:check：972 Demo SFC，0 失败。公共 Props 清单与 71 族菜单同步检查通过。
- 两端 build:lib 与发布类型消费者 typecheck:contracts 均通过，包含 inputEditable 可选 Boolean 正反类型用例。
- Cedar Vitest 报告通过，但旧版本收尾仍有 close timed out 提示。
- 未运行整站生产文档构建，也未进行真实浏览器/触屏视觉验收；jsdom Popup 测试不代替这些验收。

## 后续优先级

1. Form label/grid 布局能力：已由[第七批](./priority-batch-7-2026-10-12.md)补齐；两端独立复制布局与标签宽度生命周期逻辑，保留平台默认布局和校验展示。
2. DatePicker / DateRangePicker 的字段与面板命名/导出层级映射，不按同名 Props 数量机械补齐。
3. 保留 Select/Cascader/日期时间的移动 presentation 扩展；Table 继续独立。浏览器验收任务的 Radio 问题不在本批修改范围内。
