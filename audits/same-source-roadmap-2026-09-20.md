# Cedar / Maple 未同源组件实施路线

更新日期：2026-09-20。

本文用于回答“还剩哪些组件、先改哪些”。分类真源仍是 `component-reuse.json`；组件完成改造后，必须修改真源并执行同步脚本，不能只改本文或菜单文案。

## 当前结论

- 已同源：33 组。
- 未完成：37 个登记项，其中 20 个“待适配”、17 个“逻辑待同源”。
- 独立：Table 1 组，不进入主体同源计划。
- 未完成的 37 项不是 37 个独立工程。Picker 入口、范围子组件和同一基础设施的消费者应合并实施，实际整理为 15 个待改造组件族；另有 1 个明确保持独立的 Table。
- Trigger、模态、选项、表单输入、日期时间等基础逻辑已经完成一轮独立复制；后续工作是补齐公开契约、组件主体、样式边界和门禁，不应重新造一套基础层。

“同源”仍指两库各自保存一份源码，先完成一端，再复制到另一端，只保留命名空间、本地导入和明确的 `platform` 适配。两端不共同引用运行时核心，也不共享实例或状态。

## 未完成清单（按真正的实施组件族合并）

| 组件族 | 登记项 | 当前边界 | 建议目标 |
| --- | --- | --- | --- |
| 轻量反馈 | Loading、Result | Maple 有 `dot`、`hideIcon`、`animation`、`imageSize` 等扩展 | 对齐默认渲染、状态图形和插槽；有价值的能力纳入最终 API，无价值的旧 Props 直接删除 |
| 滚动与文本 | InfiniteScroll、BackTop、Ellipsis | Props 接近；Ellipsis 依赖 Tooltip | 先做 InfiniteScroll、BackTop，Trigger 收口后做 Ellipsis |
| 水印 | Watermark | 防篡改、灰度、重复、全屏能力不同 | 同源水印生成和生命周期，平台能力作为扩展 |
| 模态 | Overlay、Drawer / Popup、Dialog、Message | 焦点、层级、锁滚动基础层已同源，布局和命令式 API 不同 | 按底层到上层依次收口；Drawer / Popup 作为异名对应组件 |
| 表单内核 | Form、Input、Textarea | 异步请求、字段路径、输入法组合逻辑已同源；公开规则和外观仍不同 | 先统一值、校验、禁用、清理和事件契约，再复制主体 |
| 基础选择控件 | Checkbox、Radio、InputNumber | 默认值、只读、表单注入和端侧反馈有差异 | 依赖 Form 契约，统一值模型与键盘/触控行为 |
| 输入派生 | Search、VerificationCode | Maple 端能力更多，Search 历史/结果区语义需保留 | 复用已完成的 Input 结果，扩展区做平台适配 |
| 进度 | Progress、ProgressGroup | percent 和 size 已同源；渲染能力仍有差异 | 对齐 line/circle、状态和 Group 协议，端侧扩展保留 |
| 数值交互 | Rate、Slider | 命中、范围、步长可同源；图标、刻度、触控标签不同 | 同源值模型和 pointer/keyboard 算法，外观放平台层 |
| 列表 | List | Cedar 有虚拟列表等桌面扩展 | InfiniteScroll 完成后统一基础列表，虚拟化保留 Cedar 扩展 |
| 视图切换 | Tabs、Carousel | 索引、自动播放可同源，手势和布局明显不同 | 同源状态机、定时器和清理，保留平台渲染/手势适配 |
| 选择器 | AutoComplete、Select、Cascader | option/tree-data 已同源，PC 与移动面板不同 | 依次验证输入、浮层、选项和树基础；只要求控制器同源，不强求面板逐行一致 |
| 时间 | Time、TimeRange、TimePicker、TimeRangePicker | Picker 名称存在入口/组合关系，不是四个独立内核 | 先单值再范围；解析、禁用、步长和范围计算同源 |
| 日期 | Date、DateRange、DatePicker、DateRangePicker | PC 日历与移动滚轮不同 | 先单值再范围；日期模型同源，面板保持平台适配 |
| 上传 | Upload | Cedar 的网络上传管线显著更完整 | 最后统一文件模型、校验、预览和状态机；网络请求仍可作为 Cedar 扩展 |
| 独立组件 | Table | Cedar 是完整数据表，Maple 是轻量容器 | 保持“独立”，不为了名称相同强行同源 |

未标记的单端组件不在本轮范围内。例如 Cedar 的 Tree、Transfer、Timeline，以及 Maple 的 PullRefresh、SwipeCell、IndexBar、NumberKeyboard、Signature；只有出现同职责的跨端实现后再立项。

## 推荐实施顺序

### 第 0 批：已完成 Trigger 浮层家族

Trigger、Tooltip、Popover 已完成独立同源复制。Tooltip 只负责提示语义与轻量外观，Popover 只负责标题/正文与面板外观；定位、交互、Teleport 和关闭契约继续由 Trigger 提供，没有向包装组件复制定位算法。

详细实施设计见 [Trigger 同源改造方案](../refactors/trigger-alignment/plan.md)。

该批结果已经为 Ellipsis、Select、Cascader、AutoComplete 和日期时间弹层提供稳定依赖。

### 第 1 批：低耦合叶子组件

1. InfiniteScroll。
2. Loading。
3. Result。
4. BackTop。
5. Ellipsis（在 Trigger 家族收口后）。

这批改动面小、依赖少，适合先把复制流程、契约测试和文档同步机制跑顺。Watermark 可随后单独完成，不与 BackTop 捆绑提交。

### 第 2 批：模态基础设施消费者

按 `Overlay -> Drawer / Popup -> Dialog -> Message` 实施。

已有焦点管理、滚动锁、层级和过渡基础，不再新建另一套核心。先固定 Overlay 和 Popup/Drawer 的关闭原因、容器、堆叠、受控状态与生命周期，再让 Dialog 和函数式 Message 消费同一份本地协议。命令式实例仍由各库分别创建。

### 第 3 批：表单与输入

1. Form、Input、Textarea 作为一个批次收口。
2. Checkbox、Radio、InputNumber。
3. Search、VerificationCode。

Form 与 Input 互相影响，不能把 Form 留到所有输入组件之后。先定值模型、`disabled` / `readonly`、校验时机、输入法、清理和事件载荷，再复制 UI 主体；移动端提示、线框和触控反馈通过平台 Props 与样式保留。

### 第 4 批：进度、数值与列表状态机

1. Progress、ProgressGroup。
2. Rate、Slider。
3. List。
4. Tabs、Carousel。
5. Watermark。

Progress 的 `percent`、`size: number | string` 现有公共约束继续保留，不退化成固定尺寸枚举。Tabs / Carousel 只要求索引、自动播放、暂停恢复、销毁清理同源；桌面键盘导航和移动手势仍是平台能力。

### 第 5 批：选择器体系

按 `AutoComplete -> Select -> Cascader` 实施。

AutoComplete 先验证 Input + Trigger + Popup + option-data 组合；Select 再补齐多选、筛选、异步选项和反显；Cascader 最后接 tree-data、路径和值映射。PC 下拉面板和移动 Picker 不应被强制复制成相同 DOM。

### 第 6 批：日期时间体系

按 `Time -> TimeRange -> Date -> DateRange` 实施。`TimePicker`、`TimeRangePicker`、`DatePicker`、`DateRangePicker` 作为对应入口或组合层验收，不重复建立四套内核任务。

公共范围包括解析、格式化边界、min/max、禁用规则、步长、12 小时制、跨日和范围排序；PC 日历/时间列表与移动滚轮/底部面板保留平台实现。

### 第 7 批：Upload

Upload 最后处理。先统一文件标识、受控列表、校验、预览、进度和取消状态，再决定 Cedar 的 `action` / `customRequest` 等网络能力是否成为标准 API 或显式平台扩展。不能为了 Props 对齐削弱桌面端已有上传能力，也不为旧命名保留兼容入口。

## 每批完成标准

每个组件或组件族只有同时满足以下条件，才能改成“已同源”：

1. 明确选定基线实现，并完成 Props、默认值、事件、插槽、Expose、受控/非受控和无障碍契约表。
2. 一端完成后复制到另一端；差异只允许出现在前缀、本地导入、资源和显式 `platform` 适配。
3. 主体、Props、关键样式与配对测试加入 `copied-components-check.mjs`；仅逻辑同源的加入基础层门禁，并保留“逻辑待同源”标签。
4. 双端通过组件测试、类型检查、SSR、构建；涉及弹层时补焦点恢复、滚动锁、Teleport、卸载和 KeepAlive；涉及输入时补输入法和异步竞态。
5. Demo 按同一功能分组，但允许 PC / 移动特有效果独立展示。
6. 更新 `component-reuse.json`，运行 `node bin/component-reuse-sync.mjs`，同步 Cedar 菜单、Maple 菜单和调研文档。
7. 运行复制门禁和 `git diff --check`，确认没有只改一端或只改文档的漂移。

## 下一步建议

下一次从第 1 批的 InfiniteScroll 开始，它是最适合继续验证完整同源流程的低风险组件。随后处理 Loading、Result、BackTop 和 Ellipsis。不要直接从 Select、Cascader 或日期范围组件开工，否则仍会同时撞上 Popup、Input、Form 和选项协议，返工面较大。
