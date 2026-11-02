# 双向布局实施计划

目标是 Cedar 与 Maple 全组件在 LTR/RTL 环境正确运行，并在文档导航提供统一切换入口。基础盘点为 [方向审查](/Users/shuaimeng/github_web/design-ui/audits/direction-design-2026-10-28.md) 与 [逐组件清单](/Users/shuaimeng/github_web/design-ui/audits/direction-component-matrix-2026-10-28.md)，194 项包括组件族及基础设施，不能当作独立组件总数或支持率。

用户已授权设计与实现。采用 [阅读方向规范](/Users/shuaimeng/github_web/design-ui/standards/reading-direction.md)，各阶段按行为、源码与浏览器证据验收，不用批量替换 left/right 代替实现。

| 阶段 | 范围 | 验收条件 | 状态 |
| --- | --- | --- | --- |
| P0 | dir 契约、两端 useDirection、Cedar ConfigProvider、Maple LocaleProvider | 继承、嵌套、原生容器、动态切换、SSR、清理 | 已实现并通过方向门禁 |
| P1 | 文档导航切换、存储、移动预览同步、代码方向 | 两端导航可操作、刷新保留、预览同步 | 两端导航与手机预览已验证 |
| P2 | Slider、Rate、Carousel、Tabs、Tag、Badge、Calendar | 水平输入与视觉一致，垂直行为稳定 | 已实现；专项和全库方向矩阵通过 |
| P3 | Trigger 定位与 Teleport 方向 | 逻辑对齐、方向更新、自定义容器、箭头原点 | 已实现；方向与模态回归通过 |
| P4 | 展示与输入布局 | 按组件族处理间距、边框、圆角、前后缀、关闭按钮、混合文字 | 已有组件核心方向实现及全库文档矩阵完成，见全量收尾记录 |
| P5 | Table、Scrollbar、Tree、Transfer、Scheduler、移动手势 | 固定列、负 scrollLeft、虚拟化、拖动及领域语义专项浏览器验收 | 已修复滚动条/表格坐标及 A 批 Tree/Transfer；B 批 Split/ResizeBox/Table 核心验收完成；Scheduler 核心专项完成，见 C 批记录 |
| P6 | 全库验收与门禁 | 更新逐组件证据、完整类型/lint/测试/构建、LTR 回归及 RTL 浏览器覆盖 | 本轮 RTL 本机核心验收完成；全局动画历史审计漂移与发布边界另列 |

各阶段实施和最终验收已关联证据；完整主题、业务与自定义插槽组合仍按明确边界描述。此次不包含发布、推送或部署。


## 本轮完成的工程内容

- 两端同源 useDirection / provideDirection，支持明确配置、原生局部 dir、动态切换、SSR 上下文与订阅清理。
- Cedar ConfigProvider 从 rtl 迁移到 dir；Maple LocaleProvider 提供 dir；未指定的嵌套 Provider 不覆盖更近的原生 dir。
- 文档导航共用 DirectionToggle；默认 LTR，持久化选择，PC 与移动 iframe 同步；代码块保留 LTR。
- Slider、Rate、Carousel、Tabs、Tag、Badge、Calendar 的已定位方向缺口；Menu 与 Radio 的水平键盘行为。
- Trigger 逻辑 start/end、箭头原点、外部弹层方向；Dialog、Drawer、Popup、Overlay、Message、BackTop、FloatingPanel、Drag 传递来源方向；Cedar 字段编辑浮层按阅读起点对齐。
- 展示和输入组件的逻辑间距及分组边框；滚动条负 scrollLeft、表格边界与列宽调整方向。
- 统一门禁：在 design-ui 运行 `pnpm check:direction`；各库根同名命令保留本端基础回归；新增方向用例也由组件族测试自动收集。

## 实施与验收记录

1. 展示与输入类已完成 LTR/RTL、局部反向覆盖和运行时恢复的全组件文档矩阵；前后缀、逻辑间距与分组边界按规范处理。
2. A—H 专项保留结构、拖动、滚动、键盘、浮层、窄屏及领域坐标证据；SwipeCell 槽位、Drag、地图、签名和媒体平移继续遵守显式物理语义。
3. 上下文、SSR、订阅清理、Portal 与多实例等基础设施由方向门禁和专项集成验收，逐组件清单关联实际证据。

最终源码、构建、浏览器版本、原失败与复验来源见 [全量收尾记录](/Users/shuaimeng/github_web/design-ui/audits/direction-closeout-2026-10-30.md)。本机核心方向验收不等于穷举所有主题或自定义业务组合。

## 分批补齐进度（2026年10月29日起）

| 批次 | 组件 | 实施内容 | 进度 |
| --- | --- | --- | --- |
| A | Cedar Steps、Timeline、NavMenu、Tree、Transfer；Maple Steps、NavMenu | 逻辑布局、连接线、层级键盘、焦点、局部方向与弹层；不新增 Maple 缺失组件 | 已实现；两端单测、类型/lint、方向门禁和三引擎生产夹具通过 |
| B | Split、ResizeBox、Table 与虚拟横向滚动 | 区分逻辑面板尺寸与物理手柄，统一坐标与滚动换算 | 已实现；单测、方向门禁、类型/lint 和三引擎生产夹具通过 |
| C | Scheduler | 日期、逻辑位置、屏幕坐标的集中转换；拖动、拉伸、缩放、定位共享规则 | 已实现；验收结果见 C 批记录 |
| D | Cedar Input、InputNumber、InputTag、Textarea、Select；Maple 对应四类控件 | 浮动提示几何、默认逻辑对齐、显式物理对齐、原生编辑、输入框组和下拉/移动面板 | 核心方向契约已实现，验收见 D 批记录 |
| E | Form、Checkbox、Radio、Switch | 两端 start/end 默认与物理对齐、校验/业务状态、选择键盘和开关运动 | 核心实现与三引擎验收完成，见 E 批记录 |
| F | Cascader、TreeSelect、AutoComplete | 层级方向、清空重开、搜索/标签、跨容器与组合输入缓冲；Maple 覆盖现有两类 | 已实现；2026-10-30 核心三引擎验收见 F 批记录 |
| G | Date/DatePicker、DateRange、Time、TimeRange | 逻辑范围高亮、翻页图形、时间列、物理快捷区、键盘与跨容器方向 | 已实现；2026-10-30 核心三引擎与窄屏验收完成，见 G 批记录 |
| H | Button/ButtonGroup、SplitButton、Space、Divider | 组拥有的拼接边界、单按钮圆角、逻辑分隔线、原生按键、菜单焦点与嵌套切换 | 核心实现与三引擎/窄屏验收完成；全量检查限制见 H 批记录 |
| 全量收尾 | Breadcrumb、Pagination、Link 及其余组件 | 一次补齐剩余方向缺口，并运行全部文档组件和 A—H 专项回归 | 实现及核心方向验收完成 |

A 批使用现有导航 DirectionToggle；不为每个组件增加重复开关。生产夹具命令为 `pnpm check:direction:browser`（design-ui），覆盖 LTR → RTL → LTR、局部 LTR、水平/垂直交互、浮层、虚拟 Tree 和实际几何位置。专项结果与完整变体边界见 [A 批实现记录](/Users/shuaimeng/github_web/design-ui/audits/direction-batch-a-2026-10-29.md)。

B 批包括两端 VirtualList 横向位置保持和 Maple 原生 Table；不新增 Maple 缺失的 Split/ResizeBox，也不增加未定义的列虚拟化 API。B 批结果见 [实现与验收记录](/Users/shuaimeng/github_web/design-ui/audits/direction-batch-b-2026-10-29.md)。C 批 Scheduler 结果见 [实现与验收记录](/Users/shuaimeng/github_web/design-ui/audits/direction-batch-c-2026-10-29.md)。D 批输入族验收见 [实现记录](/Users/shuaimeng/github_web/design-ui/audits/direction-batch-d-2026-10-29.md)。E 批表单与选择控件验收见 [实现记录](/Users/shuaimeng/github_web/design-ui/audits/direction-batch-e-2026-10-29.md)。F 批层级选择与补全验收见 [实现记录](/Users/shuaimeng/github_web/design-ui/audits/direction-batch-f-2026-10-30.md)。G 批日期与时间验收见 [实现记录](/Users/shuaimeng/github_web/design-ui/audits/direction-batch-g-2026-10-30.md)。G 批追加覆盖共享日期面板所服务的 DateRange。H 批按钮与布局验收见 [实现记录](/Users/shuaimeng/github_web/design-ui/audits/direction-batch-h-2026-10-30.md)，其中记录了 Maple 全量 lint 的其他组件错误。Breadcrumb、Pagination、Link 已合入全量收尾，不再逐批交接。本轮已有组件的核心方向验收已完成；全库 quality 的历史漂移及发布边界见全量收尾记录。

## 全量收尾（2026-10-30，用户授权一次完成剩余项）

不再按 I/J 等批次向用户逐次交接，集中完成剩余实现与本机可执行验收。基线 194 项包括基础设施，不等于独立组件数；本次另核对当前公开入口，补录后续新增或遗漏的入口。

| 工作 | 验收与证据 | 状态 |
| --- | --- | --- |
| 当前源码复核 | 逐项区分逻辑布局、物理 API、数值/媒体/地图/签名领域坐标；复核键盘、手势和动画 | 已完成 |
| 剩余实现 | 导航图形、内容对齐/边框、移动端栏位与滚动、菜单及预览导航；保留已完成 A—H 的行为 | 已实现 |
| 全入口证据 | 当前组件目录/公开入口/文档案例逐一映射，实际运行 LTR/RTL/动态切换；基础设施关联集成/SSR/生命周期证据 | 已完成，三引擎及复验来源见清单 |
| 完整本机检查 | 受影响回归、方向门禁、类型/lint、构建与三引擎；真实结果归档，不用样式扫描替代组件验收 | 已完成；全库动画审计的独立历史漂移另列 |
| 文档与清单闭环 | 更新标准、组件中英文说明、逐组件状态、未完成检查的具体原因 | 已完成，195 项逐项关联证据 |

本地自动化不冒充原生手机、系统输入法或未提供的历史浏览器版本验收；发布、推送、部署仍不在本次范围内。

最终结果见 [全量收尾记录](/Users/shuaimeng/github_web/design-ui/audits/direction-closeout-2026-10-30.md)：1095 个组件目录测试文件、7461 个用例获得通过结果；方向门禁 132 用例；三引擎组件案例 1710 项、指南 90 项完成案例级验收。原始失败、复验、构建版本与范围边界均保留。全库 quality 的历史动画审计漂移不等同于本轮 RTL 实现待办。
