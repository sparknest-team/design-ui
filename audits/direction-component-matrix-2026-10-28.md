> 本文保留初始审查/阶段实现记录；当前状态见 [全量收尾](direction-closeout-2026-10-30.md) 与更新后的逐项清单。

# Cedar 和 Maple 组件方向能力清单

这是实现前的审查快照。最新实现和待验收范围见 [双向布局实施计划](../refactors/reading-direction-plan.md)。
本清单检查 LTR 和 RTL 的实现线索，不将默认 LTR 可用或包含 rtl 字段视为完整双向支持。各项均需结合共享依赖和浏览器行为验收。

源码静态盘点；忽略构建产物、demo、文档、token 声明。计数为匹配行数；未递归追踪跨目录依赖；物理 CSS 只是复核线索，不等于错误。测试计数是已有方向相关测试源码线索，并非本次运行结果。

数字为匹配行数，不能用于计算支持率。横向坐标、左右边框可能具有明确物理语义，不能批量替换。每类的验收重点见同目录方向设计报告；JSON 提供每个目录的 requiredChecks。

## Cedar 逐组件清单

共 100 个组件目录或基础设施项。子组件归入所属组件族；JSON 中保留可提取的公开组件名和逐行证据。

| 组件目录 | 分类 | 源码现状 | 方向分支 / 逻辑 CSS / 物理 CSS / 交互 / 方向测试 |
| --- | --- | --- | --- |
| [affix](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/affix) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [alert](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/alert) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 4 / 0 / 0 |
| [anchor](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/anchor) | 导航与流程 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 7 / 0 / 0 |
| [auto-complete](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/auto-complete) | 选择与输入 | [F 批核心方向验收通过](./direction-batch-f-2026-10-30.md)；完整组合待 P6 | 0 / 3 / 0 / 0 / 0 |
| [avatar](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/avatar) | 布局与展示 | 含逻辑 CSS；整体双向能力待验证 | 0 / 5 / 0 / 0 / 0 |
| [back-top](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/back-top) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 3 / 0 / 0 |
| [badge](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/badge) | 布局与展示 | 已有方向入口与逻辑间距，浮动角落保持物理语义 | 1 / 3 / 6 / 0 / 2 |
| [breadcrumb](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/breadcrumb) | 导航与流程 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 0 / 0 |
| [button](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/button) | 布局与展示 | H 批核心方向验收通过；全量检查限制/完整组合见 [记录](direction-batch-h-2026-10-30.md) | 0 / 1 / 2 / 2 / 0 |
| [calendar](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/calendar) | 滚动与表格 | 有 RTL 样式，未找到对应运行时类名接线 | 8 / 0 / 20 / 0 / 0 |
| [card](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/card) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 3 / 0 / 0 |
| [carousel](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/carousel) | 横向交互 | 已定位水平交互按 LTR 固定计算 | 0 / 0 / 6 / 9 / 0 |
| [cascader](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/cascader) | 选择与输入 | [F 批核心方向验收通过](./direction-batch-f-2026-10-30.md)；完整组合待 P6 | 0 / 2 / 11 / 0 / 0 |
| [checkbox](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/checkbox) | 横向交互 | [E 批核心方向验收通过](./direction-batch-e-2026-10-29.md)；完整组合待 P6 | 0 / 1 / 1 / 0 / 0 |
| [col](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/col) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [collapse](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/collapse) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [color](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/color) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [color-picker](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/color-picker) | 选择与输入 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 10 / 5 / 0 |
| [config-provider](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/config-provider) | 基础设施 | 提供 rtl 状态；自身不输出 dir 容器 | 4 / 0 / 0 / 0 / 0 |
| [context](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/context) | 基础设施 | 基础设施，按职责处理方向 | 0 / 0 / 0 / 0 / 0 |
| [count-to](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/count-to) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [countdown](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/countdown) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [date](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/date) | 选择与输入 | G 批核心方向验收通过；完整组合待 P6，见 [记录](direction-batch-g-2026-10-30.md) | 0 / 1 / 18 / 0 / 0 |
| [date-range](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/date-range) | 选择与输入 | G 批核心方向验收通过；完整组合待 P6，见 [记录](direction-batch-g-2026-10-30.md) | 0 / 0 / 0 / 0 / 0 |
| [descriptions](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/descriptions) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 13 / 0 / 0 |
| [dialog](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/dialog) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 12 / 2 / 0 |
| [divider](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/divider) | 布局与展示 | H 批核心方向验收通过；全量检查限制/完整组合见 [记录](direction-batch-h-2026-10-30.md) | 0 / 16 / 8 / 0 / 0 |
| [drawer](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/drawer) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 9 / 8 / 0 |
| [ellipsis](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/ellipsis) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [empty](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/empty) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [field-decorator](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/field-decorator) | 选择与输入 | [D 批核心方向验收通过](./direction-batch-d-2026-10-29.md)；完整组合待 P6 | 0 / 4 / 3 / 0 / 0 |
| [filter-form](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/filter-form) | 选择与输入 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [form](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/form) | 选择与输入 | [E 批核心方向验收通过](./direction-batch-e-2026-10-29.md)；完整组合待 P6 | 0 / 1 / 10 / 0 / 0 |
| [grid](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/grid) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [hover](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/hover) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [icon](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/icon) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [image](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/image) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 13 / 23 / 0 |
| [infinite-scroll](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/infinite-scroll) | 滚动与表格 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [input](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/input) | 选择与输入 | [D 批核心方向验收通过](./direction-batch-d-2026-10-29.md)；完整组合待 P6 | 0 / 1 / 0 / 0 / 0 |
| [input-number](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/input-number) | 选择与输入 | [D 批核心方向验收通过](./direction-batch-d-2026-10-29.md)；完整组合待 P6 | 0 / 11 / 0 / 0 / 0 |
| [input-tag](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/input-tag) | 选择与输入 | [D 批核心方向验收通过](./direction-batch-d-2026-10-29.md)；完整组合待 P6 | 0 / 0 / 6 / 0 / 0 |
| [layout](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/layout) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 7 / 1 / 0 |
| [link](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/link) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 0 / 0 |
| [list](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/list) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [loading](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/loading) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 16 / 1 / 0 |
| [locale](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/locale) | 基础设施 | 基础设施，按职责处理方向 | 0 / 0 / 0 / 0 / 0 |
| [map](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/map) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 7 / 0 / 0 |
| [mention](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/mention) | 选择与输入 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [menu](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/menu) | 导航与流程 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 4 / 10 / 0 |
| [message](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/message) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 5 / 1 / 0 |
| [nav-menu](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/nav-menu) | 导航与流程 | 含逻辑 CSS；整体双向能力待验证 | 0 / 2 / 7 / 5 / 0 |
| [notification](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/notification) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 10 / 4 / 0 |
| [overflow-list](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/overflow-list) | 滚动与表格 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [overlay](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/overlay) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [page-header](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/page-header) | 导航与流程 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [pagination](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/pagination) | 导航与流程 | 含逻辑 CSS；整体双向能力待验证 | 0 / 3 / 0 / 0 / 0 |
| [paper](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/paper) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [people-select](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/people-select) | 选择与输入 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [popconfirm](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/popconfirm) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 4 / 0 / 0 |
| [popover](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/popover) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 0 / 0 |
| [progress](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/progress) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 2 / 0 |
| [progress-group](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/progress-group) | 布局与展示 | 含逻辑 CSS；整体双向能力待验证 | 0 / 1 / 5 / 2 / 0 |
| [radio](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/radio) | 横向交互 | [E 批核心方向验收通过](./direction-batch-e-2026-10-29.md)；完整组合待 P6 | 0 / 2 / 0 / 2 / 0 |
| [rate](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/rate) | 横向交互 | 已定位水平交互按 LTR 固定计算 | 0 / 0 / 1 / 4 / 0 |
| [resize-box](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/resize-box) | 横向交互 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 5 / 0 / 0 |
| [result](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/result) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [ripple](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/ripple) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 2 / 0 |
| [row](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/row) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [scheduler](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/scheduler) | 领域坐标专项 | [C 批核心方向验收通过](./direction-batch-c-2026-10-29.md)；完整业务组合待 P6 验收 | 0 / 2 / 33 / 33 / 0 |
| [scrollbar](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/scrollbar) | 滚动与表格 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 10 / 14 / 0 |
| [search](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/search) | 选择与输入 | 含逻辑 CSS；整体双向能力待验证 | 0 / 5 / 0 / 0 / 0 |
| [segmented](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/segmented) | 横向交互 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [select](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/select) | 选择与输入 | [D 批核心方向验收通过](./direction-batch-d-2026-10-29.md)；完整组合待 P6 | 0 / 1 / 4 / 0 / 0 |
| [skeleton](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/skeleton) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 3 / 2 / 0 |
| [slider](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/slider) | 横向交互 | 已定位水平交互按 LTR 固定计算 | 0 / 1 / 8 / 6 / 0 |
| [space](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/space) | 布局与展示 | H 批核心方向验收通过；全量检查限制/完整组合见 [记录](direction-batch-h-2026-10-30.md) | 0 / 0 / 0 / 0 / 0 |
| [split](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/split) | 横向交互 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [split-button](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/split-button) | 布局与展示 | H 批核心方向验收通过；全量检查限制/完整组合见 [记录](direction-batch-h-2026-10-30.md) | 0 / 0 / 0 / 0 / 0 |
| [statistic](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/statistic) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [steps](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/steps) | 导航与流程 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 51 / 1 / 0 |
| [style-provider](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/style-provider) | 基础设施 | 基础设施，按职责处理方向 | 0 / 0 / 0 / 0 / 0 |
| [switch](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/switch) | 横向交互 | [E 批核心方向验收通过](./direction-batch-e-2026-10-29.md)；完整组合待 P6 | 0 / 4 / 0 / 0 / 0 |
| [table](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/table) | 滚动与表格 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 41 / 13 / 0 |
| [table-column-manager](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/table-column-manager) | 滚动与表格 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [tabs](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/tabs) | 横向交互 | 已有方向分支及局部测试，需完整验收 | 13 / 8 / 0 / 7 / 9 |
| [tag](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/tag) | 布局与展示 | Cedar 有 RTL 修正；Maple 方向适配未接全 | 5 / 0 / 7 / 0 / 0 |
| [textarea](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/textarea) | 选择与输入 | [D 批核心方向验收通过](./direction-batch-d-2026-10-29.md)；完整组合待 P6 | 0 / 3 / 0 / 0 / 0 |
| [themes](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/themes) | 基础设施 | 基础设施，按职责处理方向 | 0 / 0 / 0 / 0 / 0 |
| [time](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/time) | 选择与输入 | G 批核心方向验收通过；完整组合待 P6，见 [记录](direction-batch-g-2026-10-30.md) | 0 / 1 / 3 / 0 / 0 |
| [time-range](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/time-range) | 选择与输入 | G 批核心方向验收通过；完整组合待 P6，见 [记录](direction-batch-g-2026-10-30.md) | 0 / 0 / 0 / 0 / 0 |
| [timeline](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/timeline) | 导航与流程 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 44 / 4 / 0 |
| [tooltip](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/tooltip) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 0 / 0 |
| [transfer](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/transfer) | 滚动与表格 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 15 / 0 / 0 |
| [tree](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/tree) | 滚动与表格 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 22 / 2 / 0 |
| [tree-select](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/tree-select) | 选择与输入 | [F 批核心方向验收通过](./direction-batch-f-2026-10-30.md)；完整组合待 P6 | 0 / 0 / 3 / 3 / 0 |
| [trigger](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/trigger) | 浮层 | 已定位 start/end 按物理左/右计算；需方向上下文 | 0 / 0 / 13 / 15 / 0 |
| [typography](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/typography) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 8 / 0 / 0 |
| [upload](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/upload) | 布局与展示 | 含逻辑 CSS；整体双向能力待验证 | 0 / 3 / 0 / 0 / 0 |
| [verification-code](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/verification-code) | 选择与输入 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 2 / 0 |
| [watermark](/Users/shuaimeng/github_web/cedar-design-web/packages/cedar-ui/src/watermark) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |

## Maple 逐组件清单

共 94 个组件目录或基础设施项。子组件归入所属组件族；JSON 中保留可提取的公开组件名和逐行证据。

| 组件目录 | 分类 | 源码现状 | 方向分支 / 逻辑 CSS / 物理 CSS / 交互 / 方向测试 |
| --- | --- | --- | --- |
| [action-sheet](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/action-sheet) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [affix](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/affix) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [alert](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/alert) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 4 / 0 / 0 |
| [auto-complete](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/auto-complete) | 选择与输入 | [F 批核心方向验收通过](./direction-batch-f-2026-10-30.md)；完整组合待 P6 | 0 / 3 / 0 / 0 / 0 |
| [avatar](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/avatar) | 布局与展示 | 含逻辑 CSS；整体双向能力待验证 | 0 / 5 / 0 / 0 / 0 |
| [back-top](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/back-top) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 3 / 0 / 0 |
| [badge](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/badge) | 布局与展示 | 已有方向入口与逻辑间距，浮动角落保持物理语义 | 0 / 3 / 6 / 0 / 2 |
| [breadcrumb](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/breadcrumb) | 导航与流程 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 0 / 0 |
| [button](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/button) | 布局与展示 | H 批核心方向验收通过；全量检查限制/完整组合见 [记录](direction-batch-h-2026-10-30.md) | 0 / 1 / 2 / 2 / 0 |
| [card](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/card) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 3 / 0 / 0 |
| [carousel](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/carousel) | 横向交互 | 已定位水平交互按 LTR 固定计算 | 0 / 0 / 8 / 9 / 0 |
| [cascader](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/cascader) | 选择与输入 | [F 批核心方向验收通过](./direction-batch-f-2026-10-30.md)；完整组合待 P6 | 0 / 2 / 11 / 0 / 0 |
| [cell](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/cell) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 4 / 0 / 0 |
| [checkbox](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/checkbox) | 横向交互 | [E 批核心方向验收通过](./direction-batch-e-2026-10-29.md)；完整组合待 P6 | 0 / 1 / 1 / 0 / 0 |
| [code](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/code) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [col](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/col) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [collapse](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/collapse) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [context](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/context) | 基础设施 | 基础设施，按职责处理方向 | 0 / 0 / 0 / 0 / 0 |
| [count-to](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/count-to) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [countdown](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/countdown) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [date](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/date) | 选择与输入 | G 批核心方向验收通过；完整组合待 P6，见 [记录](direction-batch-g-2026-10-30.md) | 0 / 14 / 20 / 10 / 0 |
| [date-range](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/date-range) | 选择与输入 | G 批核心方向验收通过；完整组合待 P6，见 [记录](direction-batch-g-2026-10-30.md) | 0 / 5 / 1 / 0 / 0 |
| [dialog](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/dialog) | 浮层 | 含逻辑 CSS；整体双向能力待验证 | 0 / 1 / 3 / 2 / 0 |
| [divider](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/divider) | 布局与展示 | H 批核心方向验收通过；全量检查限制/完整组合见 [记录](direction-batch-h-2026-10-30.md) | 0 / 16 / 8 / 0 / 0 |
| [drag](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/drag) | 横向交互 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 6 / 2 / 0 |
| [ellipsis](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/ellipsis) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [empty](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/empty) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [fab](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/fab) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 11 / 2 / 0 |
| [field-decorator](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/field-decorator) | 选择与输入 | [D 批核心方向验收通过](./direction-batch-d-2026-10-29.md)；完整组合待 P6 | 0 / 4 / 1 / 0 / 0 |
| [floating-panel](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/floating-panel) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 0 / 0 |
| [form](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/form) | 选择与输入 | [E 批核心方向验收通过](./direction-batch-e-2026-10-29.md)；完整组合待 P6 | 0 / 2 / 4 / 0 / 0 |
| [form-details](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/form-details) | 选择与输入 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 3 / 0 / 0 |
| [grid](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/grid) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [highlighter-provider](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/highlighter-provider) | 基础设施 | 基础设施，按职责处理方向 | 0 / 0 / 0 / 0 / 0 |
| [hover](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/hover) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [icon](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/icon) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [image](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/image) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 12 / 23 / 0 |
| [index-bar](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/index-bar) | 滚动与表格 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 3 / 0 / 0 |
| [infinite-scroll](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/infinite-scroll) | 滚动与表格 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [input](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/input) | 选择与输入 | [D 批核心方向验收通过](./direction-batch-d-2026-10-29.md)；完整组合待 P6 | 0 / 1 / 0 / 0 / 0 |
| [input-number](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/input-number) | 选择与输入 | [D 批核心方向验收通过](./direction-batch-d-2026-10-29.md)；完整组合待 P6 | 0 / 11 / 0 / 0 / 0 |
| [lazy](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/lazy) | 基础设施 | 基础设施，按职责处理方向 | 0 / 0 / 0 / 0 / 0 |
| [link](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/link) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 0 / 0 |
| [list](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/list) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [loading](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/loading) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 17 / 1 / 0 |
| [loading-bar](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/loading-bar) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 0 / 0 |
| [locale](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/locale) | 基础设施 | 基础设施，按职责处理方向 | 0 / 0 / 0 / 0 / 0 |
| [locale-provider](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/locale-provider) | 基础设施 | 基础设施，按职责处理方向 | 0 / 0 / 0 / 0 / 0 |
| [menu](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/menu) | 导航与流程 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 3 / 10 / 0 |
| [message](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/message) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 4 / 2 / 0 |
| [notice-bar](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/notice-bar) | 导航与流程 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 2 / 0 |
| [number-keyboard](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/number-keyboard) | 选择与输入 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [overlay](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/overlay) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [page-header](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/page-header) | 导航与流程 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [pagination](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/pagination) | 导航与流程 | 含逻辑 CSS；整体双向能力待验证 | 0 / 2 / 0 / 0 / 0 |
| [paper](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/paper) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [people-select](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/people-select) | 选择与输入 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [picker](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/picker) | 选择与输入 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 3 / 0 / 0 |
| [popover](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/popover) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 0 / 0 |
| [popup](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/popup) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 12 / 4 / 0 |
| [progress](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/progress) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 4 / 0 |
| [progress-group](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/progress-group) | 布局与展示 | 含逻辑 CSS；整体双向能力待验证 | 0 / 1 / 5 / 2 / 0 |
| [pull-refresh](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/pull-refresh) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 1 / 0 |
| [radio](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/radio) | 横向交互 | [E 批核心方向验收通过](./direction-batch-e-2026-10-29.md)；完整组合待 P6 | 0 / 2 / 0 / 2 / 0 |
| [rate](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/rate) | 横向交互 | 已定位水平交互按 LTR 固定计算 | 0 / 0 / 1 / 4 / 0 |
| [result](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/result) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [ripple](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/ripple) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 2 / 0 |
| [row](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/row) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [safe-area](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/safe-area) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 4 / 0 / 0 |
| [search](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/search) | 选择与输入 | 含逻辑 CSS；整体双向能力待验证 | 0 / 7 / 0 / 0 / 0 |
| [select](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/select) | 选择与输入 | [D 批核心方向验收通过](./direction-batch-d-2026-10-29.md)；完整组合待 P6 | 0 / 1 / 4 / 0 / 0 |
| [signature](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/signature) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 2 / 0 |
| [skeleton](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/skeleton) | 布局与展示 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 3 / 2 / 0 |
| [slider](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/slider) | 横向交互 | 已定位水平交互按 LTR 固定计算 | 0 / 1 / 8 / 6 / 0 |
| [space](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/space) | 布局与展示 | H 批核心方向验收通过；全量检查限制/完整组合见 [记录](direction-batch-h-2026-10-30.md) | 0 / 0 / 0 / 0 / 0 |
| [split-button](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/split-button) | 布局与展示 | H 批核心方向验收通过；全量检查限制/完整组合见 [记录](direction-batch-h-2026-10-30.md) | 0 / 0 / 0 / 0 / 0 |
| [statistic](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/statistic) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 0 / 0 |
| [steps](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/steps) | 导航与流程 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 51 / 1 / 0 |
| [style-provider](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/style-provider) | 基础设施 | 基础设施，按职责处理方向 | 0 / 0 / 0 / 0 / 0 |
| [swipe-cell](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/swipe-cell) | 横向交互 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 2 / 3 / 0 |
| [switch](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/switch) | 横向交互 | [E 批核心方向验收通过](./direction-batch-e-2026-10-29.md)；完整组合待 P6 | 0 / 4 / 0 / 0 / 0 |
| [tab-bar](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/tab-bar) | 横向交互 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 7 / 0 / 0 |
| [table](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/table) | 滚动与表格 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |
| [tabs](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/tabs) | 横向交互 | 已有方向分支及局部测试，需完整验收 | 13 / 11 / 0 / 7 / 6 |
| [tag](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/tag) | 布局与展示 | 平台 rtl 固定 false；继承 dir 未触发间距修正 | 5 / 0 / 7 / 0 / 0 |
| [textarea](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/textarea) | 选择与输入 | [D 批核心方向验收通过](./direction-batch-d-2026-10-29.md)；完整组合待 P6 | 0 / 3 / 0 / 0 / 0 |
| [themes](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/themes) | 基础设施 | 基础设施，按职责处理方向 | 0 / 0 / 0 / 0 / 0 |
| [time](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/time) | 选择与输入 | G 批核心方向验收通过；完整组合待 P6，见 [记录](direction-batch-g-2026-10-30.md) | 0 / 2 / 3 / 0 / 0 |
| [time-range](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/time-range) | 选择与输入 | G 批核心方向验收通过；完整组合待 P6，见 [记录](direction-batch-g-2026-10-30.md) | 0 / 3 / 2 / 0 / 0 |
| [tooltip](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/tooltip) | 浮层 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 1 / 0 / 0 |
| [trigger](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/trigger) | 浮层 | 已定位 start/end 按物理左/右计算；需方向上下文 | 0 / 0 / 12 / 16 / 0 |
| [upload](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/upload) | 布局与展示 | 含逻辑 CSS；整体双向能力待验证 | 0 / 3 / 0 / 0 / 0 |
| [verification-code](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/verification-code) | 选择与输入 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 2 / 0 |
| [watermark](/Users/shuaimeng/github_web/maple-design-mobile/packages/maple-ui/src/watermark) | 内容语义 | 未发现显式方向分支；继承及依赖能力待验证 | 0 / 0 / 0 / 0 / 0 |

