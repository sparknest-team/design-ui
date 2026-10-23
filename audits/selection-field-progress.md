# 选择字段层收敛进度

## 2026-09-30 收口：日期族字段与纯面板逻辑同源

- Date、DateRange、DatePicker、DateRangePicker 四个入口完成本轮逻辑收口。DateField、DatePanel、状态协议、值/显示/渲染格式转换、严格校验、包含边界、时分秒分级禁用和选择/确认控制器均在两库独立复制；没有共享运行时、组件实例或 platform 配置。21 对源码/测试及独立展示边界纳入 check:date-family。
- 公开契约对齐：模型支持 Date/string/number，format 控制显示、valueFormat 控制模型；日期时间默认秒，useSeconds=false 明确分钟精度。禁用回调接收 Date 与 start/end，返回 disabledHours/disabledMinutes(hour)/disabledSeconds(hour, minute)。字段默认先选择再确认，纯面板默认即时提交，disableConfirm 可切换；取消/关闭丢弃草稿，确认时重新校验，不提交不完整或逆序范围，禁用端点不得改动或清空。
- defaultValue/defaultOpen、select/change 的日期及格式化载荷、confirm、open-change 和无参数 clear 已统一；Cedar 纯面板 mode 改为 type，旧调用方和 Demo 同步迁移，不保留兼容别名。嵌套配置不能接管模型、规则或控制事件。Cedar 旧 TemporalField 与旧 DatePicker TSX 转发入口删除，原集成测试迁移至新主体。
- 展示明确独立：Cedar 日历/周/季度/Trigger 与 Maple 滚轮/时钟/Popup 保留在各端文件；移动多选不假装是桌面能力。局部日历导航/手势状态不承担公开模型提交。全局语言与 Form 分别接入原系统。独立纯面板也提供可继承的活动端上下文。时钟禁用列表响应式缓存，避免每个刻度重复扫描并保证动态规则生效。
- 补充模型/显示格式、Date/时间戳及范围边界 Demo；Maple 中英文、中间独立卡片与右侧集合同步。API、类型导出、Props 清单、确认区 token、Changesets、OpenSpec 及菜单/调研同步。四个日期登记项升为“逻辑已同源”；当前为 41 已同源、12 逻辑已同源、14 待适配、3 逻辑待同源、1 独立，剩余 17 个登记项不是本轮日期族待办。
- 验证：Cedar 184 项、Maple 264 项日期/时间/字段联合测试通过；新增 SSR 与焦点回归后，最终日期/范围/字段专项 Cedar 82 项、Maple 103 项通过（各含 4 个无 DOM 的入口 SSR 测试）。Maple CLI 的测试清理在无 document 时跳过 DOM 操作，CLI 编译通过。两端类型检查与最终 UI 包 build:lib 通过；859 个 Demo SFC、21 对日期、33 对时间与 23 对字段门禁通过。Cedar 全量 lint、Maple 全库只读 lint 及本次日期源码范围 lint 通过。本轮未运行文档生产构建；本地 9991 预览端口不可连接，未完成视觉验收。以下均为历史阶段记录，以本条为当前状态。

## 2026-09-30 后续：日期默认格式基础层

- 首先从 Cedar use-format 拆出 date/date-format.ts，再独立复制到 Maple；两端各自维护源码，不共同引用运行时。Cedar 字段/面板经 use-format 接入，Maple 的 defaultDate/dateTimeFormat 经 datetime 接入。
- 区分显示格式与模型格式：周显示 gggg-wo、模型 YYYY-MM-DD；季度显示 YYYY-[Q]Q、模型 YYYY-MM。年月日默认值格式一致，日期时间精度显式参数化；Cedar 默认秒、Maple 默认分钟的既有行为本轮不改变。
- 新增两端相同的 6 项规则测试及各 2 项本地接入测试；Cedar 覆盖响应式切换与显式 format/valueFormat，Maple 覆盖滚轮输出精度。新增 checks/date-foundation-same-source.mjs 校验 2 对源码/测试及接入引用。
- 两端日期时间 Demo 补充分钟与秒两种精度及已提交模型；Maple 中英文同步。日期/范围文档说明真实能力差异，未将基础层复制误记为整组件同源；无公共 API、CSS/token 变更。
- 日期族仍为“逻辑待同源”。后续依次处理模型与严格解析（format/valueFormat、Date/时间戳）、禁用和边界、范围提交及事件，再复制主体并分离日历/滚轮展示；不得重做已完成的字段基础层或时间族。
- 验证：Cedar 日期/字段相关 50 项、Maple 日期相关 43 项测试通过；两端类型、本轮范围 ESLint、855 个 Demo SFC、日期副本与菜单同步检查通过。Maple 全库只读 lint 本轮运行报告 71 个错误，不计通过，未自动修复其他文件。本轮未运行 npm 包/文档生产构建或浏览器验收。

## 2026-09-30：纯时间面板状态与展示收口

- 两端 TimePicker/TimeRangePicker 改为 script setup，直接持有各自的 useTimePanel；Cedar 范围入口不再经单值入口转调。范围事件编排与类型化 panel-emits 独立复制，单值事件不错误拓宽为数组；没有共享运行时、实例或 platform 配置。
- Cedar 列表转换和候选确认移入 presentation/use-panel-content.ts；Maple 滚轮、时钟及范围切换留在本地展示文件。展示只消费主体 refs，不创建第二份草稿；CSS/token 不变。Cedar 原有 type 范围入口仍是明确的端侧 API，不新增兼容别名。
- 两端新增相同范围实例契约测试，覆盖属性/插槽透传、选择与确认、重复确认不重复 change、只读阻断、外部更新无事件、实例及源数组隔离。Maple 原用例改查主体到视图的状态协议，不依赖未公开实例属性。
- 单值/范围 Demo 对齐只读与外部替换模型，Maple 中英文同步；文档和 Changesets 已更新。门禁覆盖 33 对源码/测试、4 个纯面板和 2 个字段展示边界，并比对范围事件编排。
- TimePicker/TimeRangePicker 升为“逻辑已同源”，菜单和调研同步。时间族逻辑收口完成，列表/滚轮/时钟的外观差异保留；下一阶段进入日期族，不重复重做时间主体。
- 验证：Cedar 相关 149 项、Maple 相关 194 项测试通过；双端类型及 UI 包构建通过，855 个 Demo SFC 通过。Cedar 全量 lint 通过；Maple 全库只读 lint 仍有其他源码及生成入口问题，本轮按范围检查，没有自动修复全库。未执行文档生产构建或浏览器视觉验收。

## 2026-09-23 后续：时间字段主体复制到 Maple

- Time/TimeRange 入口、TimeField 主体、field-state 协议从 Cedar 独立复制到 Maple；命名空间及 Props 导入之外保持一致，两端各自维护实例，不共同引用核心，不增加 platform.ts。
- 主体持有值、草稿、展开、确认/取消、清除、焦点与 Form 通知；本地 presentation/TimeFieldContent.vue 接收同一实例的状态。桌面 Trigger/列表与移动 Popup/滚轮/时钟，以及 Form、全局多语言接入、候选初始化分别留在明确的本地文件，不建立第二份事务。
- 保留现有端侧默认值、CSS/token、移动表单继承与公开插槽；修复面板 select 的第二个 Date 参数被误作立即提交标志，并避免受控展开重复请求。双端 selection-events Demo（含 Maple 英文）增加外部替换模型示例，说明不会触发 select/change。
- 时间同源门禁扩为 31 对，额外检查字段入口不得重新创建控制器、本地视图不得创建第二份状态。Time/TimeRange 升为“逻辑已同源”；TimePicker/TimeRangePicker 保留“逻辑待同源”，后续仅收口纯面板契约、组合关系及外观验收。
- 验证：Cedar 日期/时间/字段联合 147 项、Maple 时间/字段 192 项通过；最后展示清理后补跑 Maple 30 项通过。双端类型检查、Cedar 全量 lint、Maple 范围 lint、855 个 Demo SFC、31 对时间检查通过；Maple 根 build:lib 和双端最终 UI 包 build:lib 通过。
- Maple 最终全库 lint 仍有 27 个错误，位于站点生成文件及 _utils，不计全库通过。仓库 lint 脚本自带 --fix，本次执行也产生其他文件的自动修复；本轮范围 ESLint、时间和字段门禁最终通过。未执行文档生产构建或浏览器视觉验收。以下为历史记录，其待办以本条及调研真源为准。

## 2026-09-23 后续：Cedar 时间字段主体与日期主体拆分

- 按先重构 Cedar、再复制到 Maple 的顺序完成前置拆分：Time/TimeRange 改用专用 time/TimeField.vue；原 TemporalField 删除时间控制器、时间输入解析、次日提示及时间事件分支，仅承载日期字段。日期仍使用原有日期校验、禁用端点与返回值格式。
- 新时间主体沿用现有独立复制的 useTimeFieldController、time-value、field-placeholders 与字段状态工具；配置改用明确的时间面板/Trigger 类型，不引入 Record<string, any> 或 platform 配置。桌面 Trigger、Form 接入及反馈外观仍在 Cedar，未直接移植到移动端。
- 新增两端相同的 3 项字段实例隔离测试：清除与默认值、外部范围更新无提交、AM/PM 下的次日判断。迁移原时间主体测试到新组件，日期测试保留原主体。时间门禁扩至 27 对，新增时间不得导入日期解析、日期不得保留时间分支的检查。
- 两端多个字段 Demo（含 Maple 英文）补充实时模型显示，相关说明同步；无 CSS/token 或公开 API 变更。
- 验证：Cedar 日期/时间/字段联合 142 项加新增 3 项测试通过，Maple 时间相关 164 项通过；Cedar 类型检查、UI 包 build:lib、全量 lint，双端范围 ESLint、855 个 Demo SFC、27 对时间及 23 对字段检查通过。Cedar 联合测试退出时出现 fsevents 清理告警，测试断言全部通过且退出码为 0；单独新增测试无此告警。
- 本轮不是整组件同源完成：Maple 主体尚未复制，菜单状态保持逻辑待同源。下一步将专用时间主体接入 Maple，将移动 Popup、滚轮/时钟、触发键盘和本地 Form/文案接入留在明确的独立文件。文档生产构建和浏览器验收未执行。
- Maple 全库 lint 已实际执行，仍有 441 项问题（363 errors、78 warnings），不计通过；没有批量自动修复不相关文件。

## 2026-09-23 后续：Maple 包构建阻塞清理

- 图标生成校验失败源于生成文件被格式化，756 个文件逐一格式归一化比较没有逻辑差异。恢复生成器输出，并将图标生成目录及 types-generated 排除出普通格式化和 ESLint；继续保留 generate:check 与图标类型检查。
- 两端独立复制 SelectMenu 的显式 DefineComponent<Props> 声明，controller 保持必填且为完整控制器类型。Maple Select/Cascader 展示注册表使用具体组件 typeof 声明，避免展开巨型推导类型及不可移植依赖路径；无 any、无弱化组件类型。
- 验证：Maple 根 pnpm build:lib 全部通过（含图标和 UI 声明）；两端类型检查、Maple 65 项与 Cedar 33 项相关测试、33 对展示与 23 对字段同源检查通过。
- 全库 lint 未通过：442 项（364 errors、78 warnings），涉及站点生成文件及其他源码，未批量自动修复。未执行文档生产构建或浏览器视觉验收。
- 仅解除构建阻塞，不升级时间组件同源状态；下一步仍为时间字段主体模板复制与端侧展示扩展收口。

## 2026-09-23 后续：时间字段显式浮层配置与事件收口

- Cedar Time/TimeRange 增加正式 popupProps（配置本地 Trigger）及 inputEditable 入口；不再将未声明 attrs 混入面板配置。Maple popupProps 仍配置本地 Popup。两端嵌套浮层选项均禁止覆盖 open/defaultOpen、disabled、trigger、closeOnClickReference、preventFocus 与展开更新；顶层 popupContainer（包括 false）优先。
- 两端统一 click(event)：非禁用字段点击通知一次，只读可通知但不展开。移除 Maple 字段 close，不保留别名，使用 open-change(false) 表示关闭请求。Cedar blur() 同步请求关闭，不提交草稿。
- 原生 name/aria-* 进入实际输入框；两端 PickerField 保留显式 aria-label，不再被占位文字覆盖。Cedar 面板 class/style 进入面板根元素，不再被过滤掉或下沉到内部列面板。两库公开导出 TimePanelPresentationProps/TimePopupPresentationProps/TimeWheelPresentationProps。
- 两端 selection-events Demo（Maple 含英文）补充 click/open-change 日志。双端相同公开契约测试扩到 11 项，新增 Cedar 配置路由测试，更新 OpenSpec、Changesets 与 API 文档。
- 状态不提升：核心与公开契约已持续收口，但字段主体仍是 Cedar TemporalField 与 Maple 独立字段组装；尚未完成整组件主体复制，不应把模板一致性或所有端侧差异标记为完成。
- 验证：Cedar 139 项 / 31 文件、Maple 189 项 / 34 文件相关测试通过；两端普通类型检查、26 对时间 / 23 对字段同源检查、855 个 Demo SFC 通过，示例高亮已重生成。全库 lint 等待后请求中止，不计通过；范围 ESLint 单独校验。
- 构建：Cedar 根 build:lib 及最终 UI 包 build:lib 均成功。Maple 根 build:lib 被 icons-vue 的 Generated icon sources are stale 校验阻塞，未批量改动图标源码；单独 UI 包模块编译通过，但声明生成未通过。补充纯时间面板 options 的显式 Props 类型后，Time/Date 引用链的 TS2742 消失；最终剩余 select/SelectMenu.tsx、select/presentations/index.ts、cascader/presentations/index.ts 的 TS2742/TS7056。Maple 构建不计通过。未做文档生产构建或浏览器视觉验收。

## 2026-09-23 后续：时间字段公开契约补齐

- TimeRange 两端使用独立复制的 field-placeholders.ts：字符串占位符用于两个端点，数组逐端点显示，缺项为空，显式空串不回退；Maple 公开类型补齐 string[]。不改变日期字段的既有解析。
- Maple Time/TimeRange 的公开图标插槽改为 suffix-icon，不保留 arrow-icon 别名；Cedar 向该插槽补传 focus/popupOpen。Maple focus(index = 0) 转交给 PickerField，范围支持终点聚焦，不提交模型。
- 增加双端同一份 5 项契约测试，时间门禁扩为 26 对；双端范围 field-appearance Demo 使用分别设置的起止占位符，更新中英文文档及 OpenSpec/Changesets。
- 修正文档同步流程：api-contract-inventory.mjs 默认只打印，需要 --write 才更新两份 Props 清单；本轮实际重生成并同步 component-reuse.md。
- 仍保持逻辑待同源：字段主体模板、配置入口形态和剩余事件差异尚未收口；未做生产构建及浏览器视觉验收。
- 本轮验证：Cedar 时间相关回归 93 项、Maple 155 项通过（本次命令范围不同于上一轮含字段基础的统计）；两端类型检查、范围 ESLint、26 对时间同源检查、855 个 Demo SFC、菜单同步及三库 diff --check 通过。示例高亮已重生成。全库 lint 长时间无输出后请求中止，不计为完成验证。

## 2026-09-23 后续：时间字段外壳 API 与展示配置边界

- Cedar Time/TimeRange 补齐 hint、line、textColor/focusColor/blurColor；TimeRange 补齐 separator 并允许空串。有 Form 外置标签时关闭浮动提示。Maple 两字段补齐 error，undefined 继承 Form，false 显式覆盖。
- 两端独立复制 presentation-props.ts：面板规则/模型/事件、滚轮列结构/选择/toolbar、Popup 展开状态分别由所有者管理。嵌套配置只定制展示，公开类型禁止这些键，运行时亦过滤 camelCase/kebab-case；不会从嵌套规则回退。
- 接入 Cedar 字段配置合并，Maple 字段及独立面板内部配置。移动字段向子面板显式传递自身 disabled；顶层 popupContainer（包括 false）优先。移除隐式嵌套控制通道，不保留兼容别名。
- 保留已存在的端侧默认外观：Cedar hint=false / variant=filled，Maple hint=true / variant=standard；没有新 CSS/token。需要完全相同外观可显式传相同属性。
- 新增两端 field-appearance 示例（Maple 中英文、中间卡片和右侧合集）、契约与集成测试，更新 OpenSpec、Changesets、文档、API 清单及菜单调研。时间门禁扩为 24 对。
- 整组件仍不标记已同源：剩余是字段主体模板、统一配置入口形态及端侧默认值的最终决策；本轮没有把不同 Trigger/Popup 外壳伪装为同一模板。
- 验证：最终 Cedar 128 项、Maple 213 项相关回归通过，未更新快照；两端类型、范围 ESLint、855 个 Demo SFC、24 对时间/23 对字段及所有权检查、菜单调研同步和三库 diff --check 通过。高亮产物与 API 清单已更新。全库 lint 等待后请求中止，不计为通过；未做生产构建或浏览器视觉验收。

## 2026-09-23 后续：时间字段交互与 Form 通知编排

- 两端独立复制 useTimeFieldController，将时间事务、草稿选择、清除、焦点及 Form 通知组合为每字段控制器。Maple Time/TimeRange 删除重复编排，Cedar TemporalField 的 time 分支接入；date 分支不改为时间控制器。
- 选择隔离源数组和事件载荷，默认只暂存；是否立即提交由当前交互入口决定。Cedar 子面板确认仍只进入一次字段提交，移动选择可显式立即提交。
- 清除继续绕过时间候选校验，但不绕过 clearable/只读/禁用；提交、清除、focus/blur 对应组件事件和 Form 通知各一次。受控关闭 pending 去重仍由既有事务处理。
- 滚轮候选初始化、Trigger/Popup、键盘、本库 Form 接入和格式展示留在调用侧；没有 platform 配置或跨库运行时，不共享实例。
- 两端各新增 6 项控制器回归；单时间/范围 selection-events 示例同步增加只读、禁用、clear/focus/blur 日志，Maple 中英文及公开文档同步。
- 门禁扩为 22 对源码/测试、3 个展示边界及 3 个字段控制器接入检查。整组件仍保留逻辑待同源；剩余为字段外壳组装、默认值/展示属性及配置透传边界，不重复规划本轮已完成的通知编排。
- 验证：Cedar 原 116 项、Maple 原 202 项相关回归通过，两端新增控制器测试各 6 项通过；两端最终类型检查、范围 ESLint、851 个 Demo SFC、22 对时间/23 对字段及展示和接入门禁、菜单调研同步与三库 diff --check 通过。示例高亮已更新。全库 lint 长时间无输出后请求中止，不计为通过；未做生产构建或浏览器视觉验收。

## 2026-09-23 后续：时间面板内容展示边界

- Cedar TimePicker 和 Maple TimePicker/TimeRangePicker 的公开模板对齐，内容移入各库独立 presentation/TimePanelContent.vue。Cedar 范围入口仍经本库 TimePicker 的 range 分支组合，没有跨库引用。
- 公开组件持有 useTimePanel 与本地展示 composable；Content 只接收已解析 options 和同一实例的 refs，不创建第二份模型或草稿。列表、滚轮、时钟 DOM 与交互转发留在展示文件，不引入 platform 配置。
- 原 DOM、样式类、token、默认按钮和插槽位置保持；时钟 DOM refs 仍连接原手势控制器，切换/卸载正确清空。公开 Props/事件未增加兼容分支。
- 新增两端相同的内容契约测试，以及 Maple 时钟引用生命周期测试。原三处浅挂载用例改为完整挂载，验证实际展示内容而非 stub；不更新快照。
- 两端单时间/范围 panel-behavior 示例增加 extra 和确认计数，Maple 中英文同步。时间门禁扩为 20 对源码/测试及 3 个展示所有权边界，字段门禁仍 23 对。
- 本轮完成模板分离和公开模板对齐，并非列表/滚轮/时钟内容 DOM 完全相同；整组件不提升为已同源。下一步继续处理字段主体编排和剩余公开展示属性的边界。
- 验证：Cedar 116 项、Maple 最终 202 项相关回归通过，未更新快照；两端类型和范围 ESLint、851 个 Demo SFC、20 对时间/3 个展示边界/23 对字段检查、菜单调研同步与三库 diff --check 通过。高亮产物已更新。全库 lint 等待后请求中止，不计为通过；未做生产构建或浏览器视觉验收。

## 2026-09-23 后续：四个时间入口的 min/max

- Cedar Time/TimeRange/TimePicker/TimeRangePicker 补齐 min/max，类型从运行时 Props 推导；字段透传面板，文本输入与确认继续使用本库复制规则。
- 两端包含端点的 24 小时制 HH:mm / HH:mm:ss 边界保持一致，不受展示格式影响；范围两端分别校验，showNextDay 不改变边界语义。动态改变限制不静默重写模型。
- Cedar 列表接入 isClockOutsideBounds，小时/分钟使用粗粒度区间，秒精确校验，并与 hideDisabledOptions 配合。修复两端倒置边界仍可能展示可用粗粒度项的问题。
- 新增两端同内容 bounds 示例（Maple 中英文、独立卡片与右侧合集），更新四个 Cedar 入口和 Maple 中英文文档、Changesets/OpenSpec、公开 Props 清单及菜单调研。无新样式/token、无跨库运行时。
- 时间门禁扩为 19 对，字段仍为 23 对；整组件状态不提升。下一步聚焦内容模板和展示扩展边界，而不是重复补 min/max 或纯面板 confirm/actions。
- 验证：Cedar 112 项与 Maple 199 项相关回归通过；新增 Cedar 字段输入/透传 2 项通过。两端类型、范围 ESLint、851 个 Maple Demo SFC、19 对时间/23 对字段副本、菜单调研同步及三库 diff --check 通过。高亮产物已更新。全库 lint 长时间无输出后请求中止，不计为通过；未做生产构建或浏览器视觉验收。

## 2026-09-23 后续：纯时间面板公开边界

- Cedar 删除纯面板遗留字段 Props（open/defaultOpen、size、variant、clearable、error、placeholder 及浮层配置）；字段 Time/TimeRange 保留相应能力。面板 Props 类型从运行时声明推导。
- 两端独立复制控制器增加 confirm(value, date)：有效确认即通知，值未变化也通知；change 仍仅在值变化时派发。Cedar 字段改由 confirm 提交并关闭，不再借纯面板 open-change 管理弹层。
- 两端纯面板提供 extra 与 actions({ confirm, canConfirm, value })；Cedar 列表渲染器保留本地展示，Maple wheel/clock 保留本地扩展。不引入跨库运行时。
- 两端公开文档更新。Maple 发布类型入口是 types-generated，由源码生成；未手工修改遗留 types 目录或生成产物。
- 本轮不提升整组件同源等级；剩余为完整内容模板、min/max 等公开 Props 差异及示例覆盖。
- 验证：原有 Cedar 107 项、Maple 196 项相关回归通过；增加确认通知断言后两端各 7 项控制器测试通过，Cedar 操作栏/extra/相同值确认共 4 项通过，弹层切换复测未再出现 open-change 透传警告。两端类型、18 对时间/23 对字段副本、847 个 Demo SFC 和菜单调研同步检查通过。全库 lint 等待后请求中止，不计为通过；未做生产构建或浏览器视觉验收。

## 2026-09-23 后续：焦点通知与移动键盘边界

- 两端独立复制 useFieldFocus：focus/blur 去重、禁用后释放焦点、实例隔离和 watch 卸载清理。Cedar TemporalField 接入，Time/TimeRange 补齐无参数 focus/blur 事件；Maple 同时转发组件与 Form 通知。
- PickerField 在 disabled 后清除 active 状态，避免重新启用后不再通知 focus；范围两端仍视为一个字段。只读保留聚焦能力，不允许展开修改。
- Maple Time/TimeRange 删除 window keydown/keyup 和重复手写逻辑，局部 presentation/use-trigger-keyboard.ts 绑定触发器。Enter/ArrowDown、Space keyup、Escape 保留，Tab 请求关闭但不 preventDefault；Popup 内部焦点约束仍归 Popup。已打开后变只读/禁用仍能取消，不会陷入无法退出状态。
- 移动 blur 不再因 open 而无限暂缓；动态禁用后不会残留 isFocusing。没有跨库共享实例、platform 配置或全局键盘监听。
- 现有 multiple-fields 示例新增独立输入框、只读开关与 focus/blur 日志；Maple 中英文及两端公开文档同步。
- 字段副本门禁扩为 23 对，时间副本仍为 18 对。本轮完成焦点通知和移动触发器键盘边界，不等于日期移动键盘全量改造或所有字段/面板模板完全同源。
- 下一步：完整面板内容模板及剩余 Props/Slots，重点核对 Cedar 纯时间面板遗留字段属性与两端插槽契约。
- 验证：最终 Cedar 107 项、Maple 196 项相关回归通过，未更新快照；两端类型、范围 ESLint、23 对字段/18 对时间副本、847 个 demo SFC、菜单调研同步及三库 diff --check 通过。示例高亮产物已更新。全库 lint 长时间无输出后中止，不计为通过；未做生产构建或浏览器视觉验收。

## 2026-09-23 后续：字段与纯面板统一提交边界

- 先改 Cedar 再独立复制 time-commit.ts / use-time-field-transaction.ts 到 Maple。Cedar TemporalField 的时间分支、Maple Time/TimeRange 字段和两端纯时间面板接入同一份本库提交规则；日期分支仍使用原事务。
- 提交统一做格式、步长、禁用、已支持的 min/max 校验，以及完整范围排序；showNextDay 保留端点顺序。修复 Cedar 文本输入漏检 step 和倒序范围与面板不一致的问题。
- 字段继续使用已有 useFieldTransaction 处理外部值替换、受控关闭去重、取消和清除。清除绕过时间候选校验但不绕过只读/禁用；移动 canConfirm 现在也包含 Form/字段只读禁用状态。
- Maple 保留打开弹层时初始化最近合法候选的展示行为；Cedar 不强行初始化候选，差异通过局部 initialize 回调进入事务，不引入 platform 配置或跨库实例。
- 删除 Maple 字段中重复的确认校验/排序及相关无用导入；时间同源门禁增至 18 对，字段门禁仍为 21 对。
- 两端 step demo 增加动态步长切换，Maple 中英文同步。文档明确文本输入与面板的提交规则；菜单/调研仍保留整组件未完成状态。
- 剩余：字段键盘/焦点与 Form 事件编排、完整面板内容模板和公开 Props/Slots 审计。本轮只完成提交主体，不宣称所有字段代码相同。
- 验证：Cedar 101 项、Maple 182 项相关回归通过；最终合并 canConfirm 校验后两端各 14 项控制器/事务专项再次通过。两端类型、范围 ESLint、18 对时间与 21 对字段副本、847 个 demo SFC、菜单调研同步及三库 diff --check 通过。示例高亮产物已更新。全库 lint 长时间无输出后中止，不计为通过；未运行生产构建或浏览器视觉验收。

## 2026-09-23 后续：字段弹层展示壳拆分

- Cedar TemporalField 的 Trigger 定位配置移入 presentation/TemporalTrigger.vue；透传 open、disabled、placement、popupContainer 与触发器选项，字段保留焦点、草稿及提交所有权。Date/DateRange 作为同一外壳的使用者一并回归。
- Maple Time/TimeRange 的 Popup、标题及取消/确认工具栏移入 time/presentation/TimePopup.vue；原内容通过 slot 注入。原 CSS 类、cover 属性和样式入口保留，无新增 CSS/token 或公开 API。
- 展示壳不持有模型、草稿或展开副本，只发事件。popupProps.open 不再覆盖字段受控 open；Time 与 TimeRange 多实例仍独立。没有 platform 配置、跨库运行时或共享实例。
- 新增展示边界测试；既有确认、取消、受控展开、多个字段与范围 demo 保持原文件和入口，847 个示例语法检查继续覆盖。
- 当前完成的是弹层展示壳隔离；Time 字段主体编排、完整面板内容模板与剩余 Props/Slots 仍待收口，不提升整组件同源等级。
- 验证：Cedar 90 项原有相关回归及 1 项新增展示测试通过；Maple 最终 175 项相关测试通过，未更新快照。两端类型、范围 ESLint、15 对时间/21 对字段副本、847 个 demo SFC、菜单调研同步及三库 diff --check 通过。全库 lint 长时间无输出后中止，不计为通过；本轮未做生产构建和浏览器视觉验收。

## 2026-09-23 后续：时间面板主体控制器与展示扩展

- 先清理 Cedar 纯面板，再把 useTimePanel 独立复制到 Maple；单值与范围共用同一套库内控制器逻辑，每次 setup 创建独立状态。无跨库 import、共享实例或 platform 配置。
- 控制器负责默认/受控值、草稿、只读禁用、select/change、确认重校验及范围提交排序；确认相同值返回成功但不重复 change，便于外层关闭。Cedar 确认按钮同步受当前规则约束。
- Cedar presentation/use-list-panel.ts 隔离 Dayjs 列表边界和活动列；Maple presentation/use-mobile-time-panel.ts、time-range/presentation/use-mobile-range-panel.ts 隔离滚轮、时钟坐标/手势及活动端。展示扩展不持有独立的提交模型。
- 删除已无调用方的 Cedar use-time-state.ts 及纯面板内残留的输入、占位、展开状态逻辑；公开 API 暂不变。两端现有 panel-behavior 示例补只读与外部替换操作，Maple 中英文同步。
- 时间同源门禁扩为 15 对（新增控制器与配对测试）；字段门禁仍为 21 对。
- 验证：Cedar 90 项、Maple 172 项相关回归通过（未更新快照）；两端类型、修改范围 ESLint、15 对时间副本与 21 对字段副本检查通过，Maple 847 个 demo SFC 检查通过。菜单/调研同步检查及三库 diff --check 通过。全库 lint 已尝试，长时间无输出后中止，不计为通过；未运行生产构建或浏览器视觉验收。
- 剩余：字段 Trigger/Popup 编排、渲染模板及剩余 Props/Slots 审计。此轮是主体状态层完成，不把整组件状态改成“已同源”。

## 2026-09-23 后续：纯面板确认与禁用项展示

- Maple TimePicker/TimeRangePicker 默认保留草稿，选择只触发 select，确认才更新模型/change；disableConfirm 开启后有效选择立即提交。重复提交相同值不重复 change，外部替换覆盖草稿，动态禁用后重新校验确认，范围在提交时按 showNextDay 决定排序。
- 字段/日期/范围子面板显式关闭内层确认；时间字段通过 select 编辑外层草稿，避免提前排序或双重提交。修复外部时钟反显改变指针后误发 select 的旧问题。
- Maple 四个时间入口及 Cedar 字段声明 hideDisabledOptions：默认保留禁用选项，开启后过滤；时钟隐藏刻度但保留原 index/坐标。候选合法性规则不变。
- Maple actions 提供 confirm/canConfirm/value，旧装饰性按钮示例改为真实确认。两端新增同主题 panel-behavior demo；Maple 中英文、中间卡片与右侧预览引用相同文件。复用现有 Button 样式入口与 actions token，无新 CSS 常量。
- 验证：Cedar 83 项、Maple 165 项相关回归通过；新增确认按钮后按预期更新 11 份快照，最终非更新模式再次全部通过。两端类型检查、范围 ESLint、13 组时间副本/21 组字段副本检查与 Maple 847 个 demo 语法检查通过。未执行生产构建或浏览器视觉验收；全库 lint 长时间无输出后中止，不计为通过。
- **下一阶段**：组件主体与 PC 列表/移动滚轮/时钟渲染扩展拆分，继续核对剩余 Props/Slots；仍为“逻辑待同源”，本轮仅完成确认及禁用展示契约，不宣称两端主体源码完全相同。

## 2026-09-23 后续：选择事件与字段确认模式

- Maple TimeRange 清除模型改为 undefined，与 Cedar 一致；clear 无参数，不产生 select。Date/DateRange 的公开清除契约未改。
- 两端独立复制 time-events.ts 及测试，select/change 的第二参数为本地 Date 或 Date 数组，清除为 undefined，非法时间不产生 Invalid Date。时间门禁增至 13 组。
- Maple 字段补齐 select、change(value,date) 和 disableConfirm：默认保留草稿等待确认；开启后有效选择立即提交并请求关闭，仍遵守受控 open。滚轮和时钟经显式选择回调，不监听初始化/外部 draft 变化自动提交。
- 两端增加选择/提交事件日志 demo；Maple 中英文卡片与右侧预览使用相同文件。同步 API 表、编辑器提示、Changesets、OpenSpec 与调研菜单；无 CSS/token 修改。
- 验证：Cedar 80 项、Maple 153 项相关回归通过；追加字段对子面板事件转发后，事件专项 9 项通过。两端类型与范围 ESLint 通过，843 个 Maple demo 语法检查通过。未执行生产构建或浏览器视觉验收；全库 lint 长时间无输出后中止，不计为通过。
- **下一阶段**：纯面板的确认 UI/disableConfirm、hideDisabledOptions 以及主体渲染扩展仍未统一。四个时间入口继续保持“逻辑待同源”，本轮不是整组件完成。

## 2026-09-23 后续：默认值与受控状态

- 两端独立复制 use-field-value/use-field-open 及测试；默认值只读取一次，数组与 Date 克隆，各实例独立，外部受控值保持权威。
- Maple 四个时间入口补齐 defaultValue；字段补齐 defaultOpen/open-change，受控 open 不再自行覆盖父级；纯面板补齐 disabled 并覆盖范围两端。clear 事件统一无参数，模型清除值暂不改。
- Cedar TemporalField 与时间面板状态接入本库副本。新增两端默认值/受控 demo，Maple 中英文及左右预览共用对应 demo 文件；无 CSS/token 变更。
- 字段同源门禁增至 21 组，时间门禁仍为 11 组。Cedar 相关 77 项、Maple 142 项回归通过；两端类型、范围 ESLint 与 Maple 839 个 demo 语法检查通过。
- 未完成：范围空值 []/undefined、select/change 的附加参数、disableConfirm/hideDisabledOptions 和主体渲染扩展。四个时间入口仍为“逻辑待同源”。未运行生产构建或浏览器视觉验收；全库 lint 不计作通过。

## 2026-09-23 后续：时间格式与模型值协议

- 四个 Maple 时间入口统一为 Cedar 的 format token / use12Hours，默认 HH:mm:ss；未显式设置 format 的十二小时模式默认 hh:mm:ss a。删除 Time.useSeconds、旧 format 枚举及根 Format 类型导出，没有兼容分支。
- 两端独立复制 time-value.ts 与测试，TimeValue=string|number|Date；字符串严格解析，不回退 Date 猜测或溢出修正。Date/毫秒时间戳按本地时间反显，选择后输出格式化字符串，范围为数组。Cedar 字段与纯面板均接入；纯面板非法受控值不回退到旧的非受控值。
- Maple 滚轮/时钟在渲染边界转换为 24 小时值；范围排序、次日提示、禁用/min/max 不比较 AM/PM 文本。隐藏单位按零参与候选约束，时钟和滚轮只显示 format 中的单位；禁用回调仍接收 0–23 小时。
- Date/DateRange 保留自身 useSeconds，内部生成 HH:mm 或 HH:mm:ss 调用新 TimePicker。内部时钟的制式和秒标志不是公开兼容 API。
- 迁移现有 demo 与文档中的静态示例；新增两端模型类型/固定文字 demo，Maple 中英文卡片与右侧集合引用同一文件。同步类型导出、编辑器提示、OpenSpec、Changeset 和十一组同源门禁。无组件 CSS/token 修改。
- **下一阶段**：收敛 Time/TimeRange 主体与其余面板 API/事件；PC 列表和移动滚轮/时钟保留独立渲染扩展。菜单与调研继续为“逻辑待同源”，不把基础协议完成当成整组件完成。
- 验证：Cedar 日期/时间 45 项、追加后格式集成 6 项；Maple 日期/时间 114 项（最终不更新快照运行）通过。两端类型、范围 ESLint、十一组独立副本门禁和 835 个 Maple demo 语法检查通过。全库 Maple lint 长时间无输出，发出中止后返回，不计为完整验收；未执行生产构建或浏览器视觉验收。Maple 沿用 Dayjs ESM 入口，避免额外引入另一套 Dayjs；门禁只归一化该依赖路径和本地工具路径。

## 2026-09-23 后续：时间格式基础层

- 独立复制 time/time-format.ts 及测试：默认格式解析、方括号字面量排除、十二小时识别及纯时钟标签格式化；同源门禁扩为九组。
- Cedar 字段、TimePicker、Panel、RangePanel 不再各自决定默认格式；未设置 format 时 use12Hours 可正确得到 hh:mm:ss a。移除 props 的固定默认值，并跟踪动态添加/变更的格式属性。
- Cedar Time/TimeRange 格式 demo 增加固定文字案例；Maple 标签接入本库副本，AM/PM 与 24 小时输出保持不变，无组件 CSS/token 修改。
- **未完成**：Maple 的 format=ampm/24hr、useSeconds、模型值类型尚未迁移；没有新增兼容 alias，也不标记 Time 整组件已同源。下一阶段须同时改四个时间入口、Date 内部调用、demo、公开类型与格式化返回值。
- 验证：Cedar 日期/时间 39 项及追加后格式集成 5 项、Maple 时间 68 项通过；两端类型、范围 ESLint、九组源码门禁、831 个 Maple demo 语法检查通过。全库 Maple lint 发出中止后返回，未计为完整验收；未运行生产构建和浏览器视觉验收。

## 2026-09-23 后续：AM/PM、步长与连续浮层

- 修复 Cedar 连续点击多个 Time/TimeRange 后旧浮层不关闭：Trigger 原来在冒泡阶段判断外部点击，新浮层已先进入顶层，旧浮层因此跳过关闭。两端将判断移到 click 捕获阶段；嵌套后代包含关系及受控关闭请求语义保留。两端配对 Trigger 测试及 Cedar 三个真实时间字段回归通过。
- Maple 滚轮加入 AM/PM 列，字段和范围标签显示 AM/PM；12 AM=00 点、12 PM=12 点，模型仍是 24 小时字符串。修复时钟中午/午夜识别与切换，按合法时段筛选候选，不跳到被禁用的半天。
- Maple 四个时间入口新增 step={hour,minute,second}。时间纯规则独立复制；两端小时候选统一从 0 点开始取步长，再转换十二小时显示。无效步长回退为 1，正小数向下取整且至少为 1；边界与禁用叠加。
- 新增两端同主题 demo：午夜/中午、步长、多个独立字段、范围跨日；Cedar 原混合示例收敛为纯格式示例。Maple 中英文各自写文案，中间卡片与右侧集合引用同一文件。Cedar 连续点击切换浮层，Maple 底部模态示例则明确为打开/取消后切换字段，不伪称交互完全一致。
- 本轮无组件 CSS/token 修改。公开 format/use12Hours、模型类型及主体仍待收口；文档写明现有两端差异，菜单保持逻辑待同源。七组源码/测试门禁涵盖时间规则与浮层交互。
- 验证：Cedar 时间/Trigger 75 项、Maple 日期/时间/Trigger 159 项测试通过；两端类型及 831 个 Demo SFC 检查通过。全库 Maple lint 长时间无输出后中止，不记为通过；未运行浏览器视觉验收或整库 npm/文档构建。

## 2026-09-23 后续：Time 禁用 API 与移动候选约束

- Time、TimePicker、TimeRange、TimeRangePicker 的禁用 API 已统一到 Cedar：disabledHours/disabledMinutes/disabledSeconds 返回禁用数组，小时参数统一为 0–23。Maple 删除旧 disabledTime，不保留兼容入口。两端导出 TimeDisabledRules。
- Date/DateRange 尚有独立的日期时间谓词 API，其 DisabledTime 类型移到 date/time-constraints.ts；调用本库 TimePicker 时内部转换。不是在时间组件上留下别名，也不代表 Date 的公开 API 已同源。
- 两库独立复制候选生成/确认校验算法。Maple 滚轮 min/max 生效，小时/分钟要求存在合法后代；不显示秒时按秒为 0 校验。打开字段时按小时、分钟、秒依次选取最近合法草稿，不主动写回外部模型；约束或模型动态变化后再次校验，空候选及非法草稿不确认。范围两端分别校验，既有跨日排序策略保留。
- Maple 时钟同步使用相同候选规则，修复 12 AM 按 0 点而非 12 点判断的问题，并跟踪禁用回调内部响应式依赖。两张 min/max 快照只变更午夜刻度的禁用 class，已核对并补断言。
- 新增 Time/TimeRange 中英文滚轮限制 demo；中间卡片与右侧集合引用相同源码。迁移旧禁用示例、公开文档、类型、Props 清单、OpenSpec 和 changeset；四个菜单登记项仍诚实保留“逻辑待同源”。本轮没有修改组件 CSS/token。
- 同源门禁扩为四组算法/测试；后续继续统一 format/use12Hours、模型值类型与步长，再收敛主体，不重复字段层工程。
- 验证：Cedar 23 项、Maple 日期/时间相关 91 项测试通过；两端 typecheck、修改范围 lint、四组同源检查、821 个 Demo SFC 检查通过。Maple 全库 lint 长时间无输出后中止，未记为通过；本轮未运行浏览器视觉验收及全量 npm/文档构建。

## 2026-09-23 后续：Time / TimeRange 第一阶段——纯时间规则

- 新增两库各自维护的 time/time-rules.ts，统一合法时钟判断、禁用回调执行和包含边界的时/分/秒区间判断。没有共享运行时、实例或 platform 配置。已存在的 picker-data 解析、12/24 小时转换、步长与跨日比较也纳入配对测试；本轮未重写这些已同源算法。
- Cedar 十二小时面板使用真实的 0–23 小时计算小时禁用、分钟/秒回调和 hideDisabledOptions，AM/PM 切换保持响应式。Maple 时钟修复 min 秒数比较方向、其他小时的秒数边界串扰，并让秒数判断遵守所属小时/分钟的禁用规则。
- 两端禁用示例已更新：Cedar 展示十二小时联动；Maple 限制示例显式使用 clock，初始值改为合法候选。公开 API 与 CSS/token 未变；未新增兼容别名。
- 新增 check:time-rules 检查三组独立算法/测试副本。通过 Cedar 19 项（其中 Timeline 2 项）、Maple 42 项时间相关测试，两端类型检查，817 个 Demo SFC 检查及修改范围 lint；三组同源检查通过。
- 全库 Maple lint 已运行，长时间无输出后中止，未算通过。本轮未运行浏览器视觉验收、全量 npm/文档生产构建。
- **不是整组件完成**：菜单保留“逻辑待同源”，更新真实进度；公开 format、值类型、disabled API、移动滚轮 min/max 以及范围提交协议仍需收口。下一阶段先统一这些公开契约与接入，再判断整组件同源程度；不重造 PickerField。

## 2026-09-23：AutoComplete 完整同源

- 接续 Select/Cascader，以 Cedar 为基线补齐后独立复制到 Maple：主体、Props、公共类型、入口、Menu 样式及交互测试一致，仅前缀与本地导入不同。两端通过各自的 Input、Trigger、Select 与 useInputForm 接入现有系统，没有共享实例、跨库运行时或 platform 配置。
- AutoComplete 保持自由文本输入 + Menu，不引入 list/picker。shouldOpen 只控制展开，filterOption 只控制候选过滤；Trigger 配置不能越过禁用/只读/展开条件。
- 修复分组选项渲染、映射字段下严格过滤、选择候选的 maxLength/wordSlice、自定义 render，以及动态 attrs 更新。补齐 Group/Form 继承和 hint/line/颜色/enterkeyhint；使用 Vue useId 稳定 SSR 标识。
- Maple 移除旧 DropdownMenu 主体、全局键盘和重复焦点/Form 通知。值统一为 string，clear 载荷统一为 Event；复杂候选用 option 插槽或 render，不保留旧函数/VNode label 类型别名。实例类型明确声明 focus/blur。
- 两端十个 Demo 主题对齐；Maple 中英文各有独立源码，中心卡片与右侧集合引用相同文件。旧 standard/outline 大集合拆分，修正 Space 的旧 vertical 值和固定宽度，示例无旧 locale 导入。
- 新增 check:auto-complete：7 组公共源码/测试逐文件核对，两份 Less 编译。AutoComplete 纳入主题契约，公共 Token 通过 Select Menu 局部变量桥接生效，样式依赖仍由静态入口去重。
- 验证：两端各 38 项 AutoComplete 测试（含无 window/document 的 SSR）；Cedar Select/Cascader 相关回归通过；Maple AutoComplete + Form 共 63 项通过；817 个 Demo SFC、两端类型、组件范围 lint、同源及 CSS 契约检查通过。两端 AutoComplete 入口及样式已做 Vite 生产模式 JS/CSS 构建，通过。
- 完整仓库 lint 曾运行，但长时间无输出后中止，未标记通过；未进行浏览器视觉验收和全量 npm/文档生产构建。组件生产模式构建不等同于整库发布验证。
- 菜单/调研已同步为 AutoComplete“已同源”，目前 41 组已同源、4 组逻辑已同源；剩余 25 个未完成登记项。下一阶段优先 Time/TimeRange 解析、禁用和范围算法，不重造已完成的 PickerField。

## 2026-09-22：Select / Cascader 整体同源与展示扩展完成

- 以 Cedar 为标准重构后独立复制主体、控制器、选项/树算法、Menu 和语义样式到 Maple。没有跨库 import、共享实例或 platform 配置；每个实例创建自己的控制器与草稿。
- Cedar 只接受 presentation=menu；Maple 的 list/picker 是本库静态扩展文件，主组件仍只有一份 SelectionField 模板。扩展不重建 Form、选项 key 或已提交模型。
- Menu 即时提交；List 单选即时提交、多选确认提交；Picker 确认提交。取消、关闭与 Escape 丢弃草稿；受控父级保持打开也不会重复确认；外部值更新同步草稿。
- 对齐搜索、异步选项回显、虚拟列表、分组、对象值、严格/路径选择与禁用行为。按类型和值/路径编码身份，不以 label 识别；懒加载去重，并忽略替换树后的旧回调。虚拟列表保留插槽 Option 注册。
- Maple 新增独立 CascaderPanel、Optgroup 及 Resolver 映射；两端导出 CascaderPanelProps/cascaderPanelProps，并统一 OptionInstance、OptgroupInstance、OptionProps、OptgroupProps 及运行时 Props 导出。Cedar 原 SelectOptionInstance / SelectOptGroupInstance 直接改名，不保留别名。删除旧 Maple Select 主体、旧控制器/注入文件与旧组件样式，直接迁移 tag → show-tags 等调用方。
- Popup 的 unmountOnClose=false 从初始关闭即挂载内容，保证插槽选项注册；Picker 空列不再取空选项值。均有独立回归测试。
- 两端 API 文档、异步设备 Demo、Maple 中英文 Demo 与右侧集合、菜单/调研状态、Props 清单、OpenSpec 和 changeset 已同步。Maple touch 布局、presentation Props 和本地系统接入差异明确保留。
- 新增两端 check:selection-presentations：33 组公共源码逐文件检查，仅允许前缀/导入替换，并编译四份组件 Less；此前 check:selection-field 的 18 组字段层检查继续保留。
- 验证：两端类型检查通过；Cedar 68 项、Maple 127 项回归通过；Resolver 构建及 18 项测试通过；799 个 Demo SFC 检查通过；33 组同源、18 组字段层、CSS 变量契约通过；两端本轮主体/扩展 ESLint 通过。
- 未完成浏览器视觉验收：内置浏览器与 Chrome 自动化连接均超时。未将此记为通过，也未运行全库 npm/文档生产构建。此处“已同源”指源码结构与公共逻辑完成，不代表上述未执行的验证已通过。

以下为此前阶段的历史记录；其中“仍待对齐”的 Select/Cascader 项已由本节完成。

## 2026-09-22 后续：范围活动端与组内焦点

- 两端 PickerField 与范围面板接入独立复制的 range-field-context。每个字段在 setup 内创建自己的状态，不跨实例、不跨库复用状态；独立面板无 provider 时使用自己的局部状态。
- 点击或聚焦结束输入时，Cedar 范围面板、Maple 日期滚轮和时间滚轮/时钟激活结束端。Maple 日期日历仍按两次日期选择组成范围，不将其误标为逐端编辑。
- 原生起止输入间移动焦点不再派发整个字段的 blur/focus，不提前提交部分草稿。Enter 或离开两端后提交一次；Escape 丢弃整个文本草稿。
- focus() 跳过禁用端；卸载后的输入引用被清理。基础字段和上下文的测试源码保持两端一致；额外的接入测试覆盖实际面板和表单事件。
- Demo 中增加操作说明，范围字段中英文文档、OpenSpec、changeset 和菜单调研说明同步更新。未新增公开兼容 API，也没有 platform 配置。
- 同源检查扩大到 18 组文件。整组件面板算法/公开 API 仍未完全同源，继续保留真实的“逻辑待同源”标记。
- 本轮验证：Cedar 28 项、Maple 40 项回归通过；两端类型检查、18 组同源及 CSS 变量检查通过，Maple 795 个 demo SFC 检查通过；修改范围 ESLint 通过。
- 全库 lint 已运行，但持续高 CPU 且数分钟无输出后中止，未记为通过。本轮未重复运行浏览器交互或全量 npm/文档生产构建。
- 公共 Props 清单重新从真实源码生成（124 Cedar / 117 Maple / 92 同名导出），移除过时的 hideTrigger 等记录。

## 2026-09-22：字段层已完成

本轮完成此前列出的 Cascader 和日期/时间字段改造。两端独立维护源码，通过复制及本地前缀/导入替换保持一致，不引入跨库运行时、共享实例或 platform 配置。

| 使用方 | 字段链路 | 状态 |
| --- | --- | --- |
| 两端 Select、Cascader | SelectionField → FieldDecorator | 字段层同源 |
| Cedar TreeSelect | SelectionField → FieldDecorator | 已接入并移除旧 SelectView |
| 两端 Date、DateRange、Time、TimeRange | PickerField → FieldDecorator | 字段层、范围输入和事务协议同源 |
| Cedar 日期/时间 Picker | 纯面板 | 不再注入 FormItem 或渲染触发器 |

### 职责

- FieldDecorator：边框、hint、尺寸、前后缀、清除按钮与缺口测量。
- SelectionField：标签、原生搜索输入、IME、焦点和键盘删除；items 为 key/value/label/closable/tagProps，不用 label 当身份。
- PickerField：日期/时间文本、单值/范围原生输入、独立禁用端、跨日提示、键盘提交与取消。桌面允许有效文本输入；移动端为只读触发器，不唤起软键盘。
- useFieldTransaction：独立草稿、确认提交、取消丢弃、外部模型替换、清除与受控关闭防重复提交。
- 使用方：合并 Form 状态、解析业务值、面板算法及弹层。只有字段所有者派发表单 change/clear/focus/blur。
- Cedar 的 TemporalField 是库内日期/时间字段编排组件，负责本库 Dayjs 格式协议、Trigger 和 Form；不是跨端核心，也不是 platform 配置。Maple 的各字段保留 Popup/滚轮编排。

### 清理与修复

- Cascader 按稳定值/完整路径删除；Maple pathMode=false 多选不再错误过滤掉标量叶子值。
- Cedar Cascader 保留 filled 默认外观，补齐 readonly/variant；未声明 disabled/error/readonly 时可继承表单。
- Cedar TreeSelect 最后一个旧消费者迁移后，删除 SelectView、InputLabel 和旧日期 Input/InputRange 及其样式；相关 CSS 引用同步迁移。
- Maple 四种日期/时间字段及 Cascader 删除旧标签、占位、箭头样式；旧 Cascader 主题覆盖同步删除。
- 日期/时间 Picker 的 hideTrigger 双模式删除，不保留兼容入口；字段组件负责触发器，自定义触发器示例改为 Date/DateRange。
- 保留日期格式、Date/timestamp 返回类型、禁用日期/时间、跨日范围、前后缀、清除和自定义触发器。
- 新增两端字段契约、Cascader 同名路径/叶子删除回归，以及日期页面“四类字段与提交”示例；Maple 中英文卡片和右侧集合引用同一 demo 文件。

### 自动核对

两端运行 `pnpm check:selection-field`，目前覆盖 18 组独立源码、4 份 Less 编译结果，并检查 Cedar 字段消费者不再导入 SelectView、纯面板不再注入 FormItem/渲染 Trigger。

### 与整组件同源的边界

本轮“字段层与提交协议”已完成，不代表 Select/Cascader/日期时间整组件及全部公开 API 完全同源。选项解析、搜索/虚拟列表、异步数据，以及桌面日历/时间列表与移动滚轮/时钟的格式和禁用 API 仍有差异；调研与菜单保留“逻辑待同源”，原因已经更新为实际已完成范围。后续如继续收敛，应针对面板/数据算法单独规划，不再重复改字段壳。

### 验证记录

- 两端类型检查通过。
- Cedar 相关回归 72 项通过；纯面板旧代码移除后又回归 30 项通过。
- Maple 相关回归 168 项已覆盖通过（同名 Cascader 删除测试明确开启 tag）；另有 7 项主题测试。
- 两端 16 组同源检查、CSS 变量契约通过；Maple 795 个 demo SFC 检查通过。
- 新增/修改源码范围 ESLint 通过；全库 lint 长时间无输出后中止，不计作全库验证通过。
- 最终纯面板布局清理后，Cedar 字段与日期/时间回归 21 项再次通过。
- 浏览器实测：Cedar 日期选择写回并关闭；Maple 日期取消保留原值，日历确认写回 2026-09-23；移动预览范围输入和“次日”提示显示正常。Maple 本次页面检查未捕获 error 日志。
- 尚未运行两库全量 npm/文档生产构建，不将开发预览或单测当成生产构建通过。
