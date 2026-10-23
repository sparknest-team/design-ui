# Cedar / Maple 未同源组件实施路线

更新日期：2026-09-30。文件名保留路线建立日期，以下当前结论以最新调研真源为准。

本文用于回答“还剩哪些组件、先改哪些”。分类真源仍是 `component-reuse.json`；组件完成改造后，必须修改真源并执行同步脚本，不能只改本文或菜单文案。

## 当前结论

- 2026-09-30 轻量批次：BackTop / Ellipsis 主体、Props、样式、Token、配对行为及 SSR 测试独立复制完成，12 对文件门禁覆盖；中英文 Demo/API 与菜单同步。详见 scroll-text-progress.md。

- 日期族四个入口逻辑收口完成：DateField / DatePanel 主体、模型、格式、边界、禁用和提交规则独立复制，21 对源码/测试门禁覆盖。Maple 滚轮/时钟、Cedar 日历/周/季度保留明确的独立展示文件；不再重复安排日期主体改造。

- 时间字段与纯面板逻辑均完成独立复制。两端 TimePicker/TimeRangePicker 直接持有状态，范围事件编排及类型化事件同源；列表、滚轮/时钟保留本地展示，不引入共享运行时或 platform 配置。33 对时间源码/测试门禁覆盖。
- Time/TimeRange/TimePicker/TimeRangePicker 均为“逻辑已同源”。端侧外观不同，浏览器视觉验收另行进行；日期族也已完成逻辑收口，不重做日期/时间解析、事务或主体。详见 selection-field-progress.md 最新条目。
- 验证：日期/时间/字段联合回归、双端类型检查与 UI 包构建通过，859 个 Demo SFC 通过；四个日期公开入口另有 Node 环境 SSR 测试。文档生产构建和实际页面视觉验收未执行。

- 已同源：43 组，另有 12 组“逻辑已同源”。
- 未完成：15 个登记项，其中 12 个“待适配”、3 个“逻辑待同源”。
- 独立：Table 1 组，不进入主体同源计划。
- 15 个未完成登记项不等于 15 个独立工程；Picker 入口、范围子组件和同一基础设施的消费者应合并实施。下文批次保留先前规划，但已完成项不重复实施。
- Trigger、模态、选项、表单输入、日期时间等基础逻辑已经完成一轮独立复制；后续工作是补齐公开契约、组件主体、样式边界和门禁，不应重新造一套基础层。

“同源”指两库各自保存一份源码，先完成一端，再复制到另一端，只保留命名空间、本地导入和明确的独立扩展文件。不得引入 platform.ts 配置层；两端不共同引用运行时核心，也不共享实例或状态。

## 未完成清单（按真正的实施组件族合并）

| 组件族 | 登记项 | 当前边界 | 建议目标 |
| --- | --- | --- | --- |
| 轻量反馈 | Loading、Result | 2026-09-20 已同源 | 已统一渲染、动画、尺寸、状态图形、插槽与关键 token，并由专用门禁验证 |
| 滚动与文本 | InfiniteScroll、BackTop、Ellipsis | 三项均已同源 | BackTop / Ellipsis 由独立复制门禁验证，后续做真实浏览器视觉验收 |
| 水印 | Watermark | 2026-09-20 已同源 | 已统一 Canvas、多行/自动测量、repeat/staggered、灰阶、防篡改、全屏、错误事件和生命周期；详见 [Watermark 同源实施计划](../refactors/watermark-alignment/plan.md) |
| 模态 | Overlay、Drawer / Popup、Dialog、Message | 2026-09-21 已完成：Overlay 完整同源，其余三组逻辑已同源 | 已统一基础层、关闭/拖拽控制器、命令式宿主与 Message 队列；详见 [实施计划](../refactors/modal-family-alignment/plan.md) |
| 表单内核 | Form、Input、Textarea | Form 字段控制器、公开方法、提交结果与 FormItem 触发规则已逻辑同源；两端规则适配和布局保留独立 | 下一步收口 Input / Textarea 主体与样式边界 |
| 基础选择控件 | Checkbox、Radio、InputNumber | 默认值、只读、表单注入和端侧反馈有差异 | 依赖 Form 契约，统一值模型与键盘/触控行为 |
| 输入派生 | Search、VerificationCode | Maple 端能力更多，Search 历史/结果区语义需保留 | 复用已完成的 Input 结果，扩展区做平台适配 |
| 进度 | Progress、ProgressGroup | percent 和 size 已同源；渲染能力仍有差异 | 对齐 line/circle、状态和 Group 协议，端侧扩展保留 |
| 数值交互 | Rate、Slider | 命中、范围、步长可同源；图标、刻度、触控标签不同 | 同源值模型和 pointer/keyboard 算法，外观放平台层 |
| 列表 | List | Cedar 有虚拟列表等桌面扩展 | InfiniteScroll 完成后统一基础列表，虚拟化保留 Cedar 扩展 |
| 视图切换 | Tabs、Carousel | 索引、自动播放可同源，手势和布局明显不同 | 同源状态机、定时器和清理，保留平台渲染/手势适配 |
| 选择器 | AutoComplete、Select、Cascader | 2026-09-22 Select/Cascader 完成，2026-09-23 AutoComplete 完成 | 主体、公共算法、Menu 和样式独立复制；Maple Select/Cascader 的 List/Picker 为单独文件扩展；AutoComplete 只有可输入 Menu |
| 时间 | Time、TimeRange、TimePicker、TimeRangePicker | 2026-09-30 字段与纯面板均逻辑已同源 | 保留本地列表/滚轮/时钟外观，后续页面验收；不重复实施主体、范围事件编排及状态 |
| 日期 | Date、DateRange、DatePicker、DateRangePicker | 2026-09-30 四个入口逻辑已同源 | 模型、规则、字段与面板主体已收口；日历/滚轮/时钟与局部导航状态保留独立展示 |
| 上传 | Upload | Cedar 的网络上传管线显著更完整 | 最后统一文件模型、校验、预览和状态机；网络请求仍可作为 Cedar 扩展 |
| 独立组件 | Table | Cedar 是完整数据表，Maple 是轻量容器 | 保持“独立”，不为了名称相同强行同源 |

未标记的单端组件不在本轮范围内。例如 Cedar 的 Tree、Transfer、Timeline，以及 Maple 的 PullRefresh、SwipeCell、IndexBar、NumberKeyboard、Signature；只有出现同职责的跨端实现后再立项。

## 推荐实施顺序

### 第 0 批：已完成 Trigger 浮层家族

Trigger、Tooltip、Popover 已完成独立同源复制。Tooltip 只负责提示语义与轻量外观，Popover 只负责标题/正文与面板外观；定位、交互、Teleport 和关闭契约继续由 Trigger 提供，没有向包装组件复制定位算法。

详细实施设计见 [Trigger 同源改造方案](../refactors/trigger-alignment/plan.md)。

该批结果已经为 Ellipsis、Select、Cascader、AutoComplete 和日期时间弹层提供稳定依赖。

### 第 1 批：低耦合叶子组件

1. InfiniteScroll。（已完成）
2. Loading。（已完成）
3. Result。（已完成）
4. BackTop。（已完成，2026-09-30）
5. Ellipsis。（已完成，2026-09-30）

这批改动面小、依赖少，适合先把复制流程、契约测试和文档同步机制跑顺。Watermark 已单独完成，未与 BackTop 捆绑实施。

### 第 2 批：模态基础设施消费者

按 `Overlay -> Drawer / Popup -> Dialog -> Message` 实施。

2026-09-21 本批已完成。Overlay 为完整同源；Drawer / Popup、Dialog 与 Message 为逻辑同源，分别接入双端独立复制的 modal-surface、命令式宿主与消息队列核心。详细边界见 [模态组件族同源实施计划](../refactors/modal-family-alignment/plan.md)。

### 第 3 批：表单与输入（当前主阶段）

1. Form、Input、Textarea 作为一个批次收口。
2. Checkbox、Radio、InputNumber。
3. Search、VerificationCode。

公共 FormControl 上下文、继承链、Input、Textarea、InputNumber 和 Search 的 API 契约已经完成一轮对齐。2026-09-21 Form/FormItem 字段控制器完成独立同源复制，统一注册与卸载、异步批次竞态、validate/validateField/reset/clear/setFields、提交载荷和错误定位。2026-09-22 又统一了 change/input/focus/blur/clear 的触发判断、Input/Textarea 的输入法结束去重与数值/长度归一化；Textarea 的自动高度尺寸计算与 Form 状态继承，以及 Input 的受控值、trim 提交、change 去重和清空基线也已对齐，两端独立复制并添加门禁和测试。Cedar b-validate 与 Maple 函数/Zod 规则层继续作为本地适配。Input/textarea 主体仍为 adapt，不应把这轮逻辑收口误记为主体已同源。

### 第 4 批：进度、数值与列表状态机

1. Progress、ProgressGroup。
2. Rate、Slider。
3. List。
4. Tabs、Carousel。
5. Watermark（已完成）。

Progress 的 `percent`、`size: number | string` 现有公共约束继续保留，不退化成固定尺寸枚举。Tabs / Carousel 只要求索引、自动播放、暂停恢复、销毁清理同源；桌面键盘导航和移动手势仍是平台能力。

### 第 5 批：选择器体系

按 `AutoComplete -> Select -> Cascader` 实施。

本批已完成。Select/Cascader 公共主体、控制器、Menu 与样式有 33 组同源检查；AutoComplete 主体、Props、入口、样式及配对测试有 7 组检查。移动 List/Picker 保留独立扩展文件；AutoComplete 不引入滚轮模式。详见 selection-field-progress.md。浏览器验收和全量生产构建的执行情况应查各轮验证记录，不由“已同源”标签推定。

### 第 6 批：日期时间体系（逻辑收口完成）

2026-09-30：日期四入口与时间四入口均已完成逻辑同源，以下保留此前逐步实施记录，不再作为当前待办。日期验证和真实展示边界见 selection-field-progress.md 最新记录。

按 `Time -> TimeRange -> Date -> DateRange` 实施。`TimePicker`、`TimeRangePicker`、`DatePicker`、`DateRangePicker` 作为对应入口或组合层验收，不重复建立四套内核任务。

公共范围包括解析、格式化边界、min/max、禁用规则、步长、12 小时制、跨日和范围排序；PC 日历/时间列表与移动滚轮/底部面板保留平台实现。

2026-09-23：禁用回调 API 已统一，移动滚轮 min/max、合法后代候选、动态规则和确认校验已接入，纯规则四组同源检查。Time 旧 disabledTime 已删除，Date 自己的谓词契约由内部转换接入。本轮已补齐 Maple step 和 AM/PM 滚轮；尚待统一 format/use12Hours、模型值类型及完整主体，当前不是整组件完成。

后续已落地格式基础层：默认解析和方括号文字识别独立复制，修复 Cedar 字段/面板默认格式不一致，Maple 标签使用本库副本。当前九组基础源码/测试门禁；Maple 公开 format/use12Hours 及模型类型仍需原子迁移，不能视为已统一。

再下一阶段已完成：四个时间入口统一 format token / use12Hours / TimeValue，Maple 旧时间格式枚举与 Time.useSeconds 已删除；Date 内部调用、demo、文档与类型同步迁移，严格解析与渲染边界转换独立复制，门禁十一组。后续任务收敛主体、其余面板 API/事件，不再重复格式/值类型迁移。

### 第 7 批：Upload

Upload 最后处理。先统一文件标识、受控列表、校验、预览、进度和取消状态，再决定 Cedar 的 `action` / `customRequest` 等网络能力是否成为标准 API 或显式平台扩展。不能为了 Props 对齐削弱桌面端已有上传能力，也不为旧命名保留兼容入口。

## 每批完成标准

每个组件或组件族只有同时满足以下条件，才能改成“已同源”：

1. 明确选定基线实现，并完成 Props、默认值、事件、插槽、Expose、受控/非受控和无障碍契约表。
2. 一端完成后复制到另一端；差异只允许出现在前缀、本地导入、资源和明确的独立扩展文件，不引入 platform 配置层。
3. 主体、Props、关键样式与配对测试加入对应同源检查；已完成的纯逻辑同源标记“逻辑已同源”，未完成的才保留“逻辑待同源”。
4. 双端通过组件测试、类型检查、SSR、构建；涉及弹层时补焦点恢复、滚动锁、Teleport、卸载和 KeepAlive；涉及输入时补输入法和异步竞态。
5. Demo 按同一功能分组，但允许 PC / 移动特有效果独立展示。
6. 更新 `component-reuse.json`，运行 `node bin/component-reuse-sync.mjs`，同步 Cedar 菜单、Maple 菜单和调研文档。
7. 运行复制门禁和 `git diff --check`，确认没有只改一端或只改文档的漂移。

## 下一步建议

日期和时间八个入口的逻辑主体已完成，不再重复安排格式、值类型、确认事务或主体拆分。当前剩余清单是 12 个待适配项及 Tabs / Carousel / Upload 三个逻辑待同源项。

1. BackTop / Ellipsis 已收口，不重复安排；继续基础选择控件批次。
2. 再按 Checkbox / Radio / InputNumber、Rate / Slider 分组推进值模型、键盘和触控协议。
3. Input / Textarea / Search / VerificationCode 已有后续基础改造，先根据当前源码与门禁核验登记状态，不按旧原因重做，也不未经核验批量提升状态。
4. Tabs / Carousel 统一受控状态、定时器和生命周期，展示与手势保留独立文件；Upload 放最后处理网络能力边界。

已完成日期族仍需在文档开发服务可连接时做页面视觉验收。本轮本地 9991 预览无法连接；这不是尚未实现模型或主体。每一批实施后继续同步组件文档、菜单、调研和复制门禁。
