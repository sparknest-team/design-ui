# Changeset 归档 —— 已随 1.1.0 发布消耗

> 生成时间：2026-11-10 16:41
> 原因：本次按用户要求手动控版本发 1.1.0（绕开 changeset 会推出的 2.0.0），
> 这些 changeset 的变更内容已包含在 1.1.0 里，故归档后从 `.changeset/` 清除，
> 避免下次 `pnpm changeset version` 再跳 2.0.0。`config.json` 与 `README.md` 保留。

## cedar（211 条）

bump 类型分布：? 4、major 55、minor 39、patch 126

### (未解析)（4 条）

- **[?]** --- --- Add an observable autoplay toggle to Carousel demos and clean up all InfiniteScroll demo request timers across unmount/deactivation.
- **[?]** --- --- Make the async Form demo actionable with submit/reset results, prefixed Checkbox and cancellable local validation timers.
- **[?]** --- --- Use a native button for the InfiniteScroll demo retry action and clear simulated request timers on unmount or deactivation.
- **[?]** --- --- Add observable model state, one-shot failure/retry and explicit parent acceptance to the independent Scheduler async demo, with local request cleanup. Avoid spying on fake global interval functions in the clock regression tests; verify active interval cleanup directly and restore native time…

### @cedar-design/cli（5 条）

- **[minor]** Align Cedar and Maple component API contracts: copied independent Card/Affix/Badge implementations, documented size subsets, popup containers and placements, lifecycle notifications, status/outline/orientation naming, Form error targeting, and complete public Props type exports. See API-MIGRATION.md…
- **[patch]** Only resolve known public Cedar component names. Prevent CSS, CSSStyleSheet and other unrelated C-prefixed globals from generating nonexistent component/style imports during docs auto-import transforms. Verify the shipped component registry against UI root exports and test the real size-length helpe…
- **[patch]** 修复完整构建生成器错误排除 FieldDecorator 导致全量安装器缺少该组件的问题；保留入口生成的回归检查。为文档生产构建配置显式 Node 堆内存，并将时间范围文档对齐现行的端点不交换校验。
- **[patch]** Link 保留尺寸功能及开发校验，生产包不携带 Vue 不执行的自定义校验函数；发布编译入口显式使用 production 环境。
- **[patch]** 统一按需样式入口依赖，移除跨组件 Less 的重复 CSS，抽离 FieldDecorator 纯 mixin；发布依赖图由构建器直接保留，不再依赖构建后的入口补写。

### @cedar-design/resolver（6 条）

- **[minor]** 新增 CedarStyleImports Vite 插件，与 Maple 显式导入样式补全对齐，覆盖函数式 API 和普通组件具名导入、别名与去重；文档站默认接入。补齐 imagePreview resolver 映射。
- **[patch]** Register FieldDecorator in the resolver catalog, support standalone and complete-library installation, and expose its Vue global component type.
- **[patch]** Only resolve known public Cedar component names. Prevent CSS, CSSStyleSheet and other unrelated C-prefixed globals from generating nonexistent component/style imports during docs auto-import transforms. Verify the shipped component registry against UI root exports and test the real size-length helpe…
- **[major]** Unify the Cedar command menu as Menu at `@cedar-design/ui/menu`. Keep MenuOption and the existing select event contract, remove MenuGroup/MenuSubmenu and multi-select tree behavior, model hierarchy and groups through options, and use menu CSS classes, variables and DOM markers. Expose option data as…
- **[major]** Unify the command menu as Menu across exports, package/style paths, types, resolver, documentation and examples. Refresh legacy migration guidance, validation fixtures and playground assets. Fix align-point context menus so pointer movement and reference re-entry preserve the opening position; anoth…
- **[patch]** SplitButton 独立同源复制：补齐浮层类名、屏幕轴偏移和实例方法；默认向下箭头，直接保留点击 Promise 以驱动自动加载。新增按需样式依赖入口，Menu 提供对应透传和方法。

### @cedar-design/shared（1 条）

- **[major]** Converge the unreleased shared API with Maple: use independent local tree-shakeable utilities, explicit runtime/type exports and no wholesale rattail or unused legacy helper exports. Align internal popup validation, geometry and resize observation with the shared foundation contract. Applications ta…

### @cedar-design/ui（206 条）

- **[major]** Align AutoComplete value, option, filtering, event, focus, keyboard, slot, and accessibility contracts with Maple while keeping free text input.
- **[major]** Align the first component-contract batch with Maple: - Badge defaults to danger (red background, white text), supports left/right midpoint positions, and uses an independently copied SFC and styles. - AutoComplete adds shouldOpen(inputValue), defaulting to non-empty input. It permits opening without…
- **[major]** Separate date field and pure-panel props, standardize numeric dayStartOfWeek without legacy aliases, add independent panel installation and typed date event/Options exports.
- **[minor]** Unify Menu strategy across the root and all submenu levels, including reactive changes. Export positioning/reference/submenu types and split local appearance from independently copied positioning options.
- **[minor]** Align FormItem decoration props and label rendering; explicit validation status controls presentation only. Unify validating/success/error transitions and clear empty field state.
- **[minor]** Align Form and FormItem label/grid configuration using independently copied layout and label-width logic. Support responsive columns, fixed label flex and dynamic automatic widths with observer cleanup; keep device-specific default layouts and validation views.
- **[major]** Search 与 AutoComplete 同步 Input 的 input → update:modelValue 输入顺序和 clear → input → update:modelValue → change 清空管线；清空不会重复写模型、执行搜索或重开候选面板。AutoComplete 的 search 在模型更新通知后触发，候选选择行为不变。 修复 Search 遗漏 trim 提交模型更新，Enter 搜索等待已接受的受控值；AutoComplete 被拒绝的连续清空/候选选择不丢 change，键盘清空归焦不重开面板，补齐 Form 单次通知依赖回归。
- **[major]** Align Input value, event, type, maxLength, slot, native attribute, and accessibility contracts with Maple while defaulting to the outlined variant and disabling clearable by default.
- **[major]** Align Cedar and Maple component API contracts: copied independent Card/Affix/Badge implementations, documented size subsets, popup containers and placements, lifecycle notifications, status/outline/orientation naming, Form error targeting, and complete public Props type exports. See API-MIGRATION.md…
- **[major]** List/ListItem 两端独立同源，补齐 Maple 最大高度、自定义滚动条、虚拟化和定位能力，统一 BEM、34 项公共 Token 与类型。保留独立默认密度，删除旧 Token 别名。修复两端虚拟列表 align、数据缩小空白及 threshold 的索引/占位问题。
- **[patch]** Pagination 内 Input 与 Select 统一使用 standard 变体，移除 outline 专用覆盖。保留输入框高度对齐及条数选择器宽度优化；Maple Less 入口补齐 FieldDecorator 样式依赖。
- **[minor]** Paper 两端独立同源：Cedar 新增基础表面组件，两端新增 bordered 并与 elevation 独立。不引入 variant，保留尺寸、圆角与水波能力，无默认 padding。默认使用主题表面背景，仅 ripple 时使用 pointer。公开 click 载荷为 MouseEvent。
- **[major]** Progress / ProgressGroup 使用两端独立复制的主体与样式；Progress 补齐 track、rotate、textClass 和环形不确定进度，修复 animation/bufferColor/响应式渐变/SSR ID。统一五档及自定义长度、0–100 百分比，公开样式变量迁移为语义集合。ProgressGroup 的布尔 status 与 status 插槽直接改为 showText/text，无旧 API 别名；线形/圆形统一累计裁剪并补键盘 tooltip。
- **[major]** Align RadioGroup local keyboard navigation, roving tab entry and dynamic/KeepAlive registration. Copy button variant styles and five size heights independently into both libraries. Maple gains button variants and removes Ripple's eager runtime style import; import ripple/style manually when not usin…
- **[major]** 统一 Rate 受控值、表单只读继承、键盘/点击清空、ARIA 和独立同源样式规则，补齐 aria-label 与 focus/blur 类型。修复默认选中色失效；移除旧兼容入口，保留两端独立主题和触控间距。
- **[major]** 统一 Rate 两端公开样式 Token 后缀，补齐几何、状态、焦点与动效定制；删除旧命名和重复暗色覆盖。默认配色与触控间距保持平台差异，错误色使用统一系统语义角色。
- **[major]** Align Search value, field, editing, submission, clear, loading, history, button, and accessibility contracts with Maple.
- **[minor]** 统一 Search 控制逻辑、Props、事件和公开类型。字段 model 改为不可变提议，受控拒绝和历史搜索遵循实际接受值；补齐取消、字段模型反显、全屏历史、Input属性和样式 token。桌面/移动展示与默认密度保持本地实现。
- **[major]** Align Skeleton with Maple: the default slot now renders loaded content, custom placeholders use the `template` slot, and built-in article, card, fullscreen, line, and shape placeholders share one API.
- **[major]** Slider 独立同源：Pointer Events统一鼠标/触控/笔，本地键盘、固定不交叉范围、数值边界和步长归一化。补只读、颜色/几何、三态showTooltip、button插槽及类型；保留marks/ticks/InputNumber，内部数字输入只触发一次Form验证。样式Token收口，两端生命周期与SSR一致。
- **[major]** Align Textarea value, event, length, height, slot, native attribute, and accessibility contracts with Maple while defaulting to the outlined variant.
- **[minor]** Expose the canonical TimeDisabledRules contract. Independently copy constrained clock candidate algorithms. Maple Time/TimeRange and their panels replace disabledTime predicates with disabledHours/disabledMinutes/disabledSeconds arrays; wheel and clock constraints, dynamic callbacks and commit guard…
- **[major]** Unify Upload's independent queue, reading, request, cancellation, Form and preview contracts across Cedar and Maple. Add typed read/rejected events, cancelable preview events, requestChoose, external-upload support and safe object-URL ownership. Replace legacy aliases with documented canonical APIs;…
- **[patch]** Cancel Anchor visual scroll and measurement on replacement, suspension, disposal and container/boundary change. Isolate stale/replayed notifications, measurements and completion; preserve same-target pending change. Replace private uncancellable tween loop with owned cancellable RAF retaining300ms/q…
- **[major]** Rename TreeSelect.allowSearch to filterable and move its retainInputValue object option to the independent retainInputValue boolean prop. The old API is removed by explicit user request; migrate allow-search to filterable, and object settings to filterable + retain-input-value. This change requires …
- **[patch]** Honor BackTop scroll-target document motion preferences, stop scrolling on the next frame when reduce is enabled, and invalidate dequeued callbacks after cancellation without changing duration/easing defaults.
- **[patch]** Isolate BackTop measurement/listener and animation-frame generations across replacement, deactivation and disposal. Consume dequeued frames once, recheck after custom easing, and request/cancel RAF with the target owner window/time origin. Preserve duration/easing/defaults/API and independent source…
- **[patch]** 将徽标默认通知样式统一为红底白字。
- **[patch]** 徽标文字与描边配色以 Button 为准，两端同步实心白字及 outline 语义色。
- **[patch]** Parse datetime boundaries in their original model format before validating calendar days, retaining exact time validation and invalid-boundary rejection.
- **[patch]** Own Card floating render/timer/layout continuation work by lifecycle, generation and node identity. Reject stale/consumed deliveries, reentrant geometry disposal and inactive retained input; activation starts fresh current state without duplicate initial waiting. Preserve500ms ripple policy, public …
- **[patch]** Own autoplay, observer/event binding, loop settlement timer and double-frame delivery by lifecycle/generation/node/window. Reject canceled or consumed work, suspend retained navigation/input during deactivation/disposal, and cancel held RAF via original window. Preserve playback intervals, move-spee…
- **[major]** Align standalone Checkbox/Radio value controllers as independent source copies. Replace defaultChecked with defaultValue. Checkbox uses boolean/array models; Radio uses an option value or null and selects without toggling off. Replace Radio.toggle with select; expose focus/blur and unify Checkbox.to…
- **[major]** Unify CheckboxGroup and RadioGroup controlled/uncontrolled state using independent local source copies. Group changes are emitted once at the group boundary; child/external synchronization no longer emits duplicate updates or form validation. Add inherited readonly/disabled/error contracts and Maple…
- **[patch]** 清理 Textarea 同源迁移后不再使用的私有尺寸声明和旧 Less 尺寸 mixin；InputTag 直接调用现有原生样式 mixin，ColorPicker 改用同值公开字号 Token，避免跨组件依赖私有变量。
- **[major]** Authorized Select catalog follow-up revalidates the formatting-only hook hash and flat group-heading consumers, preserving production behavior/defaults. Shared motion/catalog gates pass; this audit adds no product API or native-acceptance claim. Remove unused public CSS token interfaces after verify…
- **[patch]** 参考本地 Varlet Pagination：跳页 Input 缩为 32px 并去除横向留白，条数 Select 改为内容自适应宽度，保留 standard 变体、单行文字及触控高度。
- **[patch]** 取消 Pagination 窄屏简洁模式下上一页、下一页按钮的 44px 强制最小尺寸，统一跟随 size（默认 md 为 36px），与宽屏显式 simple 模式保持一致。
- **[patch]** Publish a generated component CSS variable reference in the documentation menu, distinguish public and internal variables, and document conditional values and consumer evidence. Complete shared and platform-specific system default governance and normalize equivalent CSS syntax without erasing semant…
- **[patch]** 对齐 11 组待同源组件的独立实现、关键样式和配对契约测试；修复动态插槽、图标切换清理、倒计时结束及 Tag 属性透传。公开 Props 保留，PageHeader 内部类名统一为 BEM，关闭和返回交互改善键盘支持。
- **[patch]** 两端独立复制 Time/TimeRange 入口、TimeField 主体与展示状态协议。字段持有唯一模型、草稿和通知，桌面 Trigger 与移动 Popup/滚轮/时钟使用各自展示文件；保留本地 Form、多语言和初始化差异，不引入跨库运行时。
- **[patch]** Isolate stale/consumed countdown RAF and reentrant change callbacks from replacement runs. Defer inactive auto-start/reset work until activation, honor explicit pause, and reject disposed controls without changing business timing or CSS tokens.
- **[patch]** 同步 Maple Counter 长按任务归属与交互节奏规范，不改 Cedar InputNumber 时序或新增组件／Token。
- **[patch]** Keep a confirmed Date or DateRange selection settled when a controlled parent echoes the committed model but rejects closing. A new selection starts a fresh transaction; add visible transaction demos and regression tests.
- **[major]** 日期面板统一 showCurrent 高亮、showNowButton 当前动作与 exchangeTime 范围交互策略。删除 showNowBtn，不保留别名；当前动作复用校验/确认，范围交换使用独立复制算法。Cedar 同时移除 ConfigProvider.exchangeTime 覆盖。同步 Demo、文档、类型与测试。
- **[minor]** 日期族的值、严格校验、范围、字段与面板提交逻辑独立同源复制。统一 Date/string/number、format/valueFormat、Date 禁用回调、默认秒精度、type 和 confirm/open-change/clear 事件；差异展示保留本地文件。更新 Demo、文档和门禁，不保留旧 API 别名。
- **[patch]** Extract independently copied date display/model format rules while preserving existing public defaults. Document minute/second precision and test local integration.
- **[major]** 日期解析/显示接入实例 Locale 上下文，不切换宿主 Dayjs 默认语言或覆盖基础语言配置；周起始日互不影响。模型 valueFormat 固定英文日期协议，展示与手输文本使用界面 Locale，避免切换语言后月份名称模型失效。不保留旧模型语言兼容分支。
- **[major]** 日期族统一使用全局 Locale，不再支持 Cedar 日期级 locale；Maple 范围日历外观参数收窄为实际支持的选项并按白名单转发。修复日历分支继承滚轮默认布局及字段空配置覆盖嵌套外观的问题。不保留旧 API 兼容。
- **[minor]** 统一日期与范围日期日历的月份缩写语义，补齐 Maple abbreviation 开关；两端独立复制月份标签逻辑。
- **[major]** 删除没有实际渲染分支的 Date.pickerProps、DateRange.pickerProps/datePickerProps，不保留兼容入口。迁移旧日期 Demo 的初始时间到顶层 defaultValue。
- **[minor]** 日期面板统一快捷项、预览与确认校验，以及独立的 pickerValue 视口控制和通知；补齐类型、Demo 和独立复制门禁。
- **[patch]** Document unchanged Maple year-panel native-scroll evidence and Date candidate closure:31/33 families,165/178 hints;not parallel integration or native acceptance. Own single Date shortcut-preview grace timers across replacement,configuration changes,suspension and disposal. Reject stale/consumed deli…
- **[major]** 收窄日期内嵌时间与移动滚轮展示参数并按白名单转发，不保留无效控制参数。两端独立复制时间展示选项。补齐 Maple 单值滚轮配置，明确 calendarClock 的时钟展示，Cedar 时间列精度遵守日期根 useSeconds。
- **[minor]** Add optional IANA timeZone to date fields/panels with strict civil-time parsing, deterministic DST handling and instant-preserving Date/timestamp output.
- **[patch]** Preserve untouched range fold occurrences and hidden precision, fix DST-aware date exchange and partial-hour time constraints, and bound repeated timezone parsing work.
- **[major]** 移除 Grid.Row/Grid.Col 及 Grid 入口的 Row/Col 组件、Props 和类型转导出，移除 GridRowInstance/GridColInstance；仅保留 Grid.Item。Row/Col 从独立入口或库根入口导入并单独注册，文档和 Demo 独立维护。
- **[patch]** Align standalone time panel state and event wiring, keep range ownership direct and isolate local list/wheel/clock presentation. Add range-instance regression coverage and readonly/external-update demos.
- **[minor]** Add emptyValues recognition and inherited emptyText for readPretty fields, defaulting to '-'. Built-in required can use the field policy while custom validators retain original values. Preserve existing ownership and clear-output contracts.
- **[minor]** Layout 增加原生滚动与 scrollTo、区域边框、侧栏位置和折叠模式；补齐零宽度展开入口与键盘操作，增加固定头尾和侧栏配置演示。
- **[major]** Replace AutoComplete.strict with caseSensitive by explicit user request, without a compatibility alias. Migrate strict/strict=true to case-sensitive/caseSensitive=true; default false and boolean meaning are unchanged. This removal requires the next major release. Add caseSensitive to Select and Casc…
- **[major]** Add searchFields (default ['label']) to selection components; fields use OR matching and fieldNames mapping, with custom callbacks retaining priority. Cedar TreeSelect now defaults to case-insensitive label search by explicit user request; recover its previous defaults with searchFields=['value'] an…
- **[minor]** Add opt-in component-specific trigger/popup configuration types for AutoComplete, Select, Cascader, Date and DateRange; Cedar also exports TreeSelect tree/trigger options. Keep published wide Props and all runtime merge/filter behavior unchanged. Document host ownership, container fallback and exist…
- **[minor]** Add opt-in TypedTableConfig<Row>, TypedTableColumn<Row> and related row/path types with defineTableConfig<Row>. Check data, identity fields, nested/array column paths and row callbacks together, then adapt the same object to the existing TableProps for Vue and TSX consumers. Keep all legacy Table ty…
- **[patch]** 补充 Message／Notification 业务展示期限与CSS动效完成的职责说明及审计分类证据；不更改运行时、API或Token默认值。
- **[patch]** Register FieldDecorator in the resolver catalog, support standalone and complete-library installation, and expose its Vue global component type.
- **[major]** Add edit-mode to Form, FormItem and editable fields. direct replaces the ambiguous inline editing name; existing popup/click/dblclick behaviors and independent readPretty remain unchanged. Remove the old editing presentation prop, its type aliases and the inline editing value without compatibility s…
- **[patch]** 核实 FieldDecorator 焦点／caret 的真实编译及 DOM 消费，同步生成目录和焦点颜色说明，补充回归；保留并行业务、无额外外环与 currentColor caret 设计，不改生产样式、默认 Token 或公开 API。真实原生焦点可辨识性与浏览器验收仍保留环境阻塞。
- **[patch]** Keep field focus visible independently of error and filled backgrounds. Associate Date and Time native comboboxes with their named popup through stable per-instance ARIA IDs.
- **[patch]** Retire FieldPresentation search and close-focus tasks by their active instance/request and original reference. Reject late,duplicate,replaced and suspended/disposed work,including reentrant delay reads. Preserve Form/Select draft,validation,reset and submit behavior. Catalog private implementation v…
- **[patch]** 核实 FilterForm 的 13 项真实样式消费者及 Form 别名传递路径，同步生成 Token 目录与局部覆盖说明，补充目录和 DOM 回归；保留现有生产样式、Token 默认值和并行业务改造。全量目录的独立 FieldDecorator 漂移仍待审，不改变公开 API。
- **[patch]** Finalize replaced imperative image previews exactly once so Upload preview URL leases are released; preserve newer reentrant previews and isolate old handles.
- **[minor]** Align Carousel and CarouselItem as independent source copies: controlled state, measured multi-page layouts, fade/card effects, pointer lifecycle, accessible visibility, global Locale labels and tokenized motion. Long cyclic jumps requiring duplicate interactive instances now snap safely.
- **[patch]** Complete the independent Tabs family source contract, remove unused platform adapters and export event, slot and navigation resize types.
- **[patch]** Remove the persistent Button focus fill after pointer clicks. Keep hover/ripple feedback and the keyboard focus-visible outline.
- **[patch]** Grid 转导出 Row/Col 原始符号，避免根入口生成时重复声明 _RowComponent / _ColComponent。保留 Grid.Row/Grid.Col 及独立组件入口，重新生成后仍无重复导出。
- **[patch]** 修复 Layout 非受控侧栏折叠状态类名、底部触发器定位和嵌套 flex 收缩；修复演示旧颜色变量和全局样式污染，补充折叠演示。 默认侧栏跟随页面主题背景，修复暗色主题下文字与白色背景的对比度问题。
- **[patch]** 删除 Pagination 简洁模式下 controls 的 flex-basis: 100%，条数选择器与分页主体按内容宽度同行排布，仅空间不足时自然换行；两端保持同源样式。
- **[minor]** Restore Switch Form/FormItem disabled and readonly inheritance with explicit false overrides. Preserve Select 1.x clear results, accurately type undefined, and add optional emptyValue for stable single-select clearing. Make Table.pagination.total optional without weakening standalone Pagination.tota…
- **[patch]** Keep native Radio checked values synchronized with the model after clicks and keyboard activation. Restore every member after a rejected controlled group selection and avoid duplicate click/change proposals.
- **[patch]** Only resolve known public Cedar component names. Prevent CSS, CSSStyleSheet and other unrelated C-prefixed globals from generating nonexistent component/style imports during docs auto-import transforms. Verify the shipped component registry against UI root exports and test the real size-length helpe…
- **[patch]** Document Maple Form scroll-task baseline boundaries without extrapolating controlled failures to Cedar or claiming a completed repair/native acceptance. Latest explicit Cedar runtime takeover:guard instance/validation/registered-field/native offset batch ownership,preserve original duplicate-registr…
- **[patch]** 修复完整构建生成器错误排除 FieldDecorator 导致全量安装器缺少该组件的问题；保留入口生成的回归检查。为文档生产构建配置显式 Node 堆内存，并将时间范围文档对齐现行的端点不交换校验。
- **[patch]** Reject stale/consumed Icon name-transition callbacks, cancel pending phases when transition duration changes, and suspend timers/media listeners during KeepAlive deactivation. Bind reduced-motion observation to the actual Icon owner document and reject detached listener deliveries. Preserve default …
- **[patch]** Invalidate canceled/consumed ImagePreview long-press and double-tap timers, suspend retained input during deactivation/disposal, detach keyboard/coarse-pointer observation and release capture. Activation reads current mode without replay. Preserve500ms/320ms policies, public API and CSS tokens; Prev…
- **[patch]** Invalidate canceled or consumed InfiniteScroll measurement callbacks and disconnected observer deliveries across target replacement, deactivation and disposal. Preserve status locking, immediate policy and check/retry API; no CSS motion token.
- **[major]** Add PeopleSelect options array/loader and a reactive fallback-option display callback, avatars and optional built-in call/chat icons. Reuse setPropsDefaults and local props for business callbacks, with generic action renderers/slots as an extension. Each field owns cancellation, loading and stale re…
- **[patch]** inline 多选下拉移除重复的已选汇总和清空入口，由字段负责展示与移除；日期弹层按完整可视窗口限制高度，避免正常窗口下日历内部出现多余滚动条。
- **[major]** InputNumber 主体、Props、数值控制器与样式独立同源复制。统一字段继承、variant/hint、五档尺寸、IME、受控提案恢复、Decimal 运算和触控长按。清空改为 input/update/change/clear 顺序；旧 field-number Token 及 Form 的旧步进偏移 Token 移除。增加 select/inputRef，Demo 重组为七组。
- **[minor]** InputNumber 同步数量控制 API：禁止手输、独立禁用/隐藏加减、长按开关、方向事件及 inline beforeCommit 事务拦截，补充取消/异步安全测试和示例。
- **[patch]** Reject cancelled, consumed and inactive long-press timer callbacks before stepping; preserve reentrant replacement holds and existing 800ms/150ms cadence. No public API or CSS token changes.
- **[patch]** 修复 InputNumber 重复解析、科学计数法精度、范围边界与长按清理；补充独立数值工具、双端配对回归与边界 Demo。按钮模式不再隐式提交表单。
- **[patch]** Link 各状态文字色统一遵循 Button 的文字变体，修复明暗主题中性文字及禁用配色差异。
- **[minor]** Link 新增五档 size，两端文字、图标和加载图标同步缩放，默认 md。
- **[patch]** Link 保留尺寸功能及开发校验，生产包不携带 Vue 不执行的自定义校验函数；发布编译入口显式使用 production 环境。
- **[patch]** 同步 Maple 独有 LoadingBar 的任务派发与渲染续体规范；Cedar不新增运行时组件或CSS变量。
- **[patch]** Stop default click actions and propagation on the Loading directive overlay so clicks do not reach the host Card or ancestor click handlers. Keep normal clicks after loading ends.
- **[major]** Rename Loading content-mask class to content-overlay and loading-mask-background token to loading-overlay-background. Update custom CSS selectors and tokens; directive background options and click blocking are unchanged.
- **[patch]** Document Map's SDK migration fallback and interaction-delay responsibilities without claiming active SDK lifecycle acceptance or changing CSS Tokens/API.
- **[patch]** Own Mention textarea mirror relocation by generation, rendered node pair and active lifetime. Reject stale/replayed/reentrant nextTick work, follow open-content changes and zero scroll origin, isolate old resize bindings, and read current owner-window styles. Keep public focus/blur signatures while …
- **[major]** Unify the Cedar command menu as Menu at `@cedar-design/ui/menu`. Keep MenuOption and the existing select event contract, remove MenuGroup/MenuSubmenu and multi-select tree behavior, model hierarchy and groups through options, and use menu CSS classes, variables and DOM markers. Expose option data as…
- **[major]** Unify the command menu as Menu across exports, package/style paths, types, resolver, documentation and examples. Refresh legacy migration guidance, validation fixtures and playground assets. Fix align-point context menus so pointer movement and reference re-entry preserve the opening position; anoth…
- **[major]** Remove the deprecated `Spin` component and merge its component API, styles, demos, and internal usages into `Loading`, including the namespaced `v-c-loading` directive. Loading sizes use `xs | sm | md | lg | xl` and also accept numeric pixel values.
- **[patch]** Honor reduced-motion in isolated Message styles without changing normal CSS tokens or business display deadlines. Preserve static positioning when removing animated displacement; Cedar also cancels decorative icon fades.
- **[patch]** Clean up Message display timers during KeepAlive deactivation and prevent scheduling after unmount. Reactivation starts the full current duration; exhausted hover deadlines close on resume, explicit zero remains persistent, and non-finite durations do not schedule auto-close. CSS motion tokens and d…
- **[patch]** Prevent stale Message display timer callbacks after restart, hover pause, clear, close or unmount without changing display duration or CSS motion tokens.
- **[patch]** Let Message CSS transition completion control service disposal instead of fixed 150ms/200ms waits. Clean up never-mounted entries immediately and clear from an item snapshot; preserve business display duration and same-id reopen ownership.
- **[major]** Message adds neutral/tonal/solid variants, keeps neutral default, replaces ambiguous color tokens with variant/status roles, and removes unused close offsets.
- **[patch]** Honor reduced-motion in built-in modal transitions from component-local CSS, disabling starting scale/slide movement without changing normal timing, public APIs or tokens. Compiled selector regression covers the preference branch; real OS preference switching remains separate acceptance.
- **[patch]** 统一按需样式入口依赖，移除跨组件 Less 的重复 CSS，抽离 FieldDecorator 纯 mixin；发布依赖图由构建器直接保留，不再依赖构建后的入口补写。
- **[patch]** 修复独立 NavMenu.Item 的停用窗口监听泄漏、跨激活旧测量与过期焦点任务；几何读取中卸载后不再注册监听，停用保留命令无效，受控open语义与公开API／CSS变量保持。
- **[patch]** 修复 NavMenu 节点 enter／Escape 的旧焦点续体跨关闭／激活执行、重复请求和停用保留键盘入口；当前文档外部控件接管焦点时不再抢回，无新增公开API或CSS变量。
- **[patch]** 修复 NavMenu 根级停用／卸载后的保留命令、关闭回调重入及旧节点注销误删新注册；卸载释放注册表，保留正常激活与公开API。
- **[patch]** 修复 NavMenu 根级选择与响应式折叠的旧焦点归位抢占外部控件焦点；保留正常归位及主动 focus 行为。
- **[patch]** 修复 NavMenu 根级响应式测量、selection返回焦点的旧nextTick跨停用／激活执行及重复交付问题；测量在几何读取重入卸载后停止，保留原公开API及CSS变量。
- **[patch]** 修复 NavMenu scrollTo 旧请求在新命令、禁用、配置变化或 KeepAlive 停用后仍滚动的问题；卸载失效，激活只接受新命令，保留现有 Promise<void> 和 nearest 对齐，无新增公开 API。
- **[minor]** Add explicit Tag fade, Alert close, Button transition and Switch loading duration variables and respect reduced-motion preferences. Align component spacing, typography and radius references with existing system roles while retaining component geometry and desktop density. Expose ProgressGroup track/…
- **[patch]** Release Notification logical IDs on clear and assign fresh internal component identity to new items so re-added IDs cannot inherit old display timers. Honor reduced motion in the isolated Notification style entry without changing normal CSS token defaults or business display time.
- **[patch]** Deduplicate Notification close and cancel owned timers after close, updates, KeepAlive deactivation and disposal. Ignore stale dequeued callbacks, restart active display time on reactivation, and preserve CSS motion defaults.
- **[minor]** Select 新增 autoFitPopupWidth（默认 true，保留原行为）。Pagination 内部设置为 false，条数弹出菜单按内容自适应宽度，不再受紧凑触发框限制。
- **[patch]** Restore the PeopleSelect documentation demo with a local asynchronous ID lookup and search adapter. Remove obsolete credential storage and hidden, uninitialized examples. Correct the Notification public type example and clarify that the Popconfirm demo demonstrates confirmation rather than business …
- **[patch]** Retain modal content through leave completion and emit opened/closed once per valid phase. Keep rapid reopen and disposal safe, with independent foundation parity and lifecycle regressions aligned to Maple. No new Cedar CSS tokens or component props.
- **[patch]** 与 Maple 独立复制 SelectMenu 的显式声明类型，保持 controller 必填及完整类型约束。
- **[patch]** Accept valid popup-container HTMLElements from an iframe's own realm while still rejecting SVG and non-elements. Preserve real Teleport target, state, event ownership and cleanup contracts with regression coverage. Document component-variable scopes, root alias computation and Teleport inheritance b…
- **[patch]** Own PreviewGroup recenter and double-frame work by generation, lifecycle and track window; reject canceled/consumed/reentrant deliveries and suspend retained commands while inactive/disposed. Preserve loop/public APIs. Recenter follows computed transform duration/delay (400ms only unresolved fallbac…
- **[patch]** Document Maple PullRefresh gesture cancellation, listener ownership and private scroll-lock leases in the shared Token guide, without adding a Cedar runtime counterpart.
- **[patch]** Explain Maple PullRefresh business display, rebound and icon timing responsibilities in the shared Token guide; no Cedar runtime counterpart added.
- **[major]** Align Radio/RadioGroup native input bodies, public input attributes, names, scoped icon slots and per-instance appearance in independently maintained copies. Replace legacy DOM classes/providers with BEM rules. Keep controlled input restoration and local keyboard navigation. Cedar Ripple now uses th…
- **[patch]** Unify range-field endpoint activation and focus boundaries. Moving between inputs retains the text draft without an intermediate commit or form blur. Range panels follow the activated endpoint with instance-local state; standalone panels remain independent.
- **[patch]** Restore Rate's public scale-animation duration and timing-function token consumers after the shared-style refactor.
- **[major]** Remove Card.loading and its body replacement/click suppression. Use the Loading directive for loading feedback and explicitly disable interactive children when needed. Remove the Card loading demo and direct loading style dependency.
- **[minor]** Add a Menu selected-hover background variable. Keep selected content through pointer hover and keyboard active states, while disabled appearance takes precedence.
- **[patch]** Isolate disconnected ResizeObserver notifications and dequeued measurement RAF from replacement bindings, including KeepAlive reactivation. No public API or motion token changes.
- **[patch]** Honor resolved Ripple transform/opacity timing during cleanup without changing 200ms/140ms defaults or 250ms minimum policies. Deduplicate release, isolate nested waves, bind document events to the mounted ownerDocument, and match keyboard release to its activation key.
- **[patch]** 修复 Ripple 已取消／重复交付的计时回调复活任务，以及几何／样式读取中卸载残留波纹；保留既有时序、Token与公开API。
- **[patch]** Revalidate current independent Ripple and VirtualList source responsibilities and document controlled test coverage without modifying parallel product implementations or granting native acceptance.
- **[minor]** SplitButton 独立同源复制：补齐浮层类名、屏幕轴偏移和实例方法；默认向下箭头，直接保留点击 Promise 以驱动自动加载。新增按需样式依赖入口，Menu 提供对应透传和方法。
- **[patch]** Own Scheduler dependency measurement RAF by host window, clean original listeners/observers on replacement or KeepAlive suspension, reject stale frames/continuations and clear connectors when host is removed.
- **[patch]** Show submitted event times and resource IDs in the scheduler drag demo and provide a reset action, making independent movement and resize results observable.
- **[patch]** 隔离Scheduler独立卡片拖动的旧监听、取消、点击结算与回调重入，保留原手势／拖影默认策略。
- **[patch]** 修复Scheduler受管卡片长按及finished／点击解锁回调的取消、停用与重复交付，保留公开协议和默认等待。
- **[patch]** 修复Scheduler卡片drag开始／结束归属与保留resize入口资格，避免旧结束回调或传输回调重入影响新请求。
- **[patch]** Cancel Scheduler current-time clock/listener resources during KeepAlive suspension and reject stale interval/visibility callbacks after replacement or disposal, retaining the thirty-second business cadence.
- **[patch]** 修复 Scheduler 时间线指针旧帧、停用／卸载及回调重入的会话归属，保留边缘滚动策略与公开API。
- **[patch]** 隔离TimeGrid范围新建的旧监听、长按、取消、几何读取与点击结算，补齐停用／卸载与配置失效，保留原吸附和默认阈值。
- **[patch]** Invalidate stale Scheduler timeline row restoration across suspension/disposal, validate restored list/viewport ownership and isolate old scroll bindings while preserving anchor fallback and geometry.
- **[patch]** Restore original global timer descriptors in Scheduler test fixtures after legacy fake-clock cleanup, with dedicated regression evidence. No Scheduler runtime timing or CSS Token change.
- **[minor]** BackTop / Ellipsis 独立同源：统一滚动容器、动画清理、原生按钮和受控展开，补齐类型、键盘、SSR、Demo 与样式 Token。预发布迁移删除旧 Token 与任意 BTween 字符串，不保留别名。
- **[patch]** Suspend retained Scrollbar commands/events/measurements during deactivation/disposal and isolate old activation bindings/reentrant geometry. Correct zero-origin scrolling, zero thumb reset, horizontal ratio and zero-viewport metrics in independent copies. Preserve native options and public signature…
- **[patch]** Invalidate Select shared-hook open-scroll work across close/reopen, newer navigation, deactivation and disposal. Consume empty deliveries once, guard retained interaction entries, and recheck after virtual callbacks before DOM writes. Preserve late registration, keyboard/option protocol and CSS/publ…
- **[patch]** 将 Time/TimeRange 主体从日期字段中独立出来，删除日期主体的时间分支，并以明确的时间选项类型替代通用配置类型。保留字段输入、草稿、焦点和 Form 通知行为，为后续向 Maple 独立复制时间主体建立边界。
- **[patch]** Bind JS scroll RAF and reduced-motion queries to the target owner window, complete zero/invalid durations without queued interpolation, and reject consumed/completed frame replay. Preserve default 300ms/caller easing; no cancellation API or CSS token changes.
- **[patch]** Connect documentation language switching to component locales and embedded previews. Preserve component routes, use native language controls, reuse translated documentation, and explicitly label missing translations. Simplify title-only demo messages without adding translation dependencies to standa…
- **[patch]** Document Maple SwipeCell business-confirmation ownership and pending click/drag audit boundaries in the shared Token guide; no Cedar runtime counterpart added.
- **[patch]** Document Maple SwipeCell event-turn settlement, drag cancellation and listener ownership in the Token guide; no Cedar runtime counterpart added.
- **[patch]** Own each Scrollbar Thumb mouse gesture by session/node/axis/original window. Remove move/up/contextmenu/blur listeners on end/cancel/geometry changes/deactivation/disposal; reject old move/end and inactive retained input. Preserve equal-geometry drag continuity, current setOffset/track behavior and …
- **[major]** Fix sibling Trigger dismissal before a newly opened popup replaces the top layer. Align midnight-anchored hour step candidates across twelve/24-hour displays. Maple gains time step props, AM/PM wheel columns and labels, and correct noon/midnight clock switching. Add matching Time/TimeRange examples …
- **[minor]** Align inclusive min/max time constraints across fields and pure panels. Cedar adds public bounds and disabled list presentation; both independent rule copies reject reversed bounds consistently. Add dynamic bounds examples, contract tests and documentation.
- **[patch]** Use independent instance-local value/open state. Maple time fields and panels support defaultValue; fields support defaultOpen and open-change, panels support disabled. Controlled open now requires parent acceptance and clear emits no arguments. Matching demos and regression tests document the contr…
- **[patch]** Unify field and standalone time panel commit validation using independent local copies. Revalidate current format, steps, disabled rules and supported bounds; sort ranges unless showNextDay is enabled. Cedar typed times now enforce step and use the same range ordering as panels. Mobile confirmation …
- **[minor]** Use explicit popupProps and inputEditable for time fields, forward native attributes to the field, and align click/open-change notifications with Maple. Panel class/style options now reach the panel root.
- **[patch]** Consolidate Time/TimeRange selection, commit, clear, focus and Form notifications into independently copied per-field controllers. Preserve local presentation initialization and keyboard handling. Add paired regression tests and synchronized interaction demos.
- **[minor]** Align time field focus boundaries using independent local copies. Add Cedar Time/TimeRange focus and blur events, deduplicate component/Form notifications, keep readonly fields focusable, and release disabled focus state. Scope Maple trigger shortcuts locally instead of window, preserve native Tab n…
- **[minor]** Align time-field appearance APIs and nested-option ownership before release. Cedar adds floating hints, line/colors and range separators; Maple adds explicit Form error overrides. Reject state, validation and owner event overrides in nested presentation options at type and runtime boundaries. Set th…
- **[minor]** Align time field endpoint placeholders and expose focus/popupOpen to suffix-icon slots.
- **[patch]** Unify field and standalone time-panel format defaults, preserve use12Hours, ignore bracketed literals when resolving columns, and keep format changes reactive.
- **[minor]** Align standalone time panel confirmation and disabled-option visibility. Maple panels now keep selection drafts until confirmation by default; disableConfirm opts into immediate commit. Nested fields/date panels explicitly skip inner confirmation. Add hideDisabledOptions to public time fields and mo…
- **[patch]** Separate time panel presentation templates from their state owners. Preserve local controller refs, slots, confirmation ownership, clock DOM refs, DOM structure and style tokens. Add presentation ownership regression checks and synchronized demos.
- **[patch]** Consolidate single/range time panel drafts, validation, selection and confirmation in independently copied controllers. Extract desktop Dayjs/list and mobile wheel/clock interaction adapters. Remove obsolete input/open-state logic from Cedar's pure panel; keep popup closing at the component boundary…
- **[patch]** Independently copy and verify pure clock rules. Correct twelve-hour disabled callback evaluation in Cedar and inclusive second/minute boundaries in Maple clock panels. Document and test actual clock-hour semantics without changing public APIs.
- **[patch]** Keep private time-column scroll tasks cancellable and owner-window scoped; reject stale/replayed frames and settle invalid durations/reduced motion immediately. Preserve positive linear timing. Component lifecycle wiring remains a separate audit phase. Follow-up: TimeColumn now owns the private disp…
- **[patch]** Align time selection and commit payloads with independent event-date helpers. Maple TimeRange clears to undefined; time fields and panels emit select/change with local Date parameters. Maple fields add disableConfirm for immediate valid commits. Add matching demos, API docs and regression tests; sta…
- **[patch]** Reconcile rejected or invalid PickerField text commits and discard drafts when editing becomes unavailable.
- **[major]** Align time format and model contracts: strict formatted strings, local Date and millisecond timestamp inputs, and formatted string outputs. Maple replaces the ampm/24hr enum and Time.useSeconds with format tokens and use12Hours; Date internal callers are migrated. Add independent source copies, matc…
- **[minor]** Complete InputTag xl content tokens and prevent tagProps from bypassing parent disabled/readonly or keyboard-removal restrictions. Preserve explicit tag colors while disabled and map neutral content to system roles. Improve Tag preset contrast using palette step 9 foregrounds and system secondary gr…
- **[patch]** Centralize Watermark canvas content-color in its token file without changing the compiled value. Keep Input source parity and expose the private PickerField draft commit hook consistently with Maple. Update token architecture, runtime consumer evidence and generated component references.
- **[patch]** Keep generated CSS variable reference tables horizontally scrollable within their own containers so long token names do not widen the entire documentation page at narrow desktop widths.
- **[patch]** Tooltip 彩色实心状态的文字统一遵循 Button 白字规则。
- **[patch]** Document Tree scrollIntoView delegation and existing VirtualList lifecycle ownership, with seven real-component integration regressions on unchanged product sources; no new API or CSS Token.
- **[patch]** Prevent stale Trigger delayed state commits after cancel, replacement, deactivation or unmount; inactive/disposed owners reject retained requests without changing interaction delays or CSS tokens.
- **[patch]** Keep popup main-axis positioning inside the visual viewport when neither preferred nor opposite placement fits.
- **[patch]** Schedule/cancel Trigger positioning RAF on its owner window and prevent canceled dequeued frames from consuming replacement scroll work. No public API or motion token changes.
- **[patch]** Detach Trigger scroll listeners from their original binding window when popup refs change or disappear, including unmount before watcher flush.
- **[patch]** Isolate Typography copy-feedback timers and ellipsis measurement frames by generation and lifecycle. Cancel replacements, feature changes, deactivation and disposal; reject stale/replayed/reentrant work and unavailable interaction. Preserve copy-delay default3000ms and disabled-text measurement; no …
- **[major]** Add useAsyncData for reusable zero-argument initialization loaders and external search loaders, with per-owner state, optional debounce/cache, AbortSignal, latest-result ownership, explicit error results and scope disposal. Keep component options/data as arrays; add Select initialization examples on…
- **[major]** Independently align AutoComplete source and Menu styles across Cedar and Maple. Unify form inheritance, grouped/async/virtual suggestions, selection length rules, focus/keyboard/SSR behavior and event payloads. Add hint/color/keyboard props to Cedar; migrate Maple to canonical option.render/option s…
- **[major]** Unify Avatar and AvatarGroup with Maple. `size` accepts CSS lengths, `ObjectFit` is renamed to `AvatarObjectFit`, and image load/error plus group stacking share one implementation.
- **[major]** Unify Button and ButtonGroup on the feature-complete Maple implementation. Add icon/autofocus and complete loading controls, fix disabled links and async reentry, and share five sizes/eight statuses and paired demos. loading-type selects the spinner; migrate Cedar default/fill/line to loading-mode. …
- **[major]** Unify Empty with Maple. Drop `icon` and `inConfigProvider`; ConfigProvider empty slot is handled in platform.
- **[major]** Unify Grid/GridItem and Row/Col across platforms. Add independent Row/Col source, style, import and documentation entries while preserving Grid family aliases. Fix responsive zero values, plain-div mode, listener cleanup and dynamic collapsed items. Cedar column/row classes now use BEM modifiers mat…
- **[minor]** Image 与 Maple 同源：统一加载回退、预览控制器和命令式 API，组件默认值走 setPropsDefaults。
- **[minor]** 将 Input、InputPassword、InputGroup、InputGroupLabel 和 FieldDecorator 整理为两端独立复制的同源实现。补齐浮动提示、外部标签处理、组合状态继承、校验反馈、原生属性与光标保持；移动端保留有值常驻清除按钮。迁移 FieldDecorator 调用方并补齐子组件按需解析、demo 和类型。
- **[major]** Unify Loading and Result with Maple: Loading now shares icon, tip, hidden-indicator and accessibility behavior without the legacy dot/element APIs; Result adds image sizing and animation while standardizing nine status graphics and icon/extra/default slots.
- **[minor]** Link 两端采用独立同源复制：Maple 补齐 hoverable，统一 MouseEvent、原生属性透传、动态 icon 插槽、加载动画与键盘焦点。禁用/加载不能被 tabindex 覆盖。内部状态类统一为 --status-*；保留端侧主题 token 和图标依赖。
- **[patch]** Converge the unreleased shared API with Maple: use independent local tree-shakeable utilities, explicit runtime/type exports and no wholesale rattail or unused legacy helper exports. Align internal popup validation, geometry and resize observation with the shared foundation contract. Applications ta…
- **[major]** Align PageHeader with a composable content model, where `showBack` controls the back button and header, avatar, content, extra, and footer are composable slots.
- **[major]** 统一 Pagination 两端 API、状态、页码按钮和布局；增加容器响应式简洁模式，补齐尺寸、键盘和非法输入处理及 12 组配对 demo。 pageSizeProps 收敛为 PaginationPageSizeProps，size 默认 md，elevation 默认 false。默认开启 responsive（480px）；完整页码设 responsive=false。DOM 与 CSS token 更新，详见 API-MIGRATION.md。当前尚未发布的同源批次统一迁移，不保留旧属性透传。 修复 Less 3 对 max(var(...)) 的编译错误，使用转义字符串保留浏览器…
- **[major]** Unify Progress.percent on the 0–100 scale, including decimal numeric strings. Migrate Cedar ratios and text slot consumers. Independently copy the same four-variant Switch implementation to both libraries; unify asynchronous beforeChange, values, events, slots and sizes. Maple standard becomes line …
- **[patch]** Render Select through the same-source SelectionField directly backed by FieldDecorator; fix inherited field state and preserve key-based tag removal.
- **[major]** Unify Select and Cascader controllers, Menu rendering, field APIs and semantic style tokens using independently maintained source copies. Cedar supports menu; Maple adds isolated list/picker presentations with explicit draft commit/cancel. Align defaults and events without compatibility aliases, exp…
- **[minor]** Space 完整独立同源：统一 wrap=false，五档行列间距采用 Cedar 值，Maple 内置主题同步更新。Maple 依赖隐式换行的使用方需显式添加 wrap。修正文档旧 API 和行列 token 值，补充默认行为、动态插槽、单位与属性透传测试。
- **[major]** Unify Tabs / TabsNavs / TabNav / TabsItems / TabItem across Cedar and Maple. Share controlled selection, six variants, lifecycle, keyboard accessibility and optional touch swipes. Maple replaces Tab/name and standalone carousel panels with the Cedar key-based composition. Migrate legacy appearance t…
- **[minor]** Finish Cascader and date/time field-layer convergence with independent SelectionField/PickerField copies and draft/commit/cancel transactions. Remove obsolete Cedar field shells and date/time Picker hideTrigger mode; keep panels independent from Form ownership. Update demos, docs and reuse audit bou…
- **[patch]** Extend the local upload queue demo with generated files, first-attempt failure, visible status/request counts, cancellation and retry. Clean up demo timers on unmount and deactivation.
- **[minor]** Upload 新增 reupload、replace 方法和事件、视频 duration 秒数与时长角标；同步原子替换校验、受控模型、旧请求失效、视频预览挂载容器及资源清理。
- **[patch]** Invalidate stale VirtualList post-render scroll corrections when superseded, data/mode changes, deactivated or disposed. Ignore retained inactive/disposed commands; consume corrections once and preserve existing List API and alignment behavior. No new CSS motion token.

### @cedar-design/use（2 条）

- **[minor]** Add useAsyncData for reusable zero-argument initialization loaders and external search loaders, with per-owner state, optional debounce/cache, AbortSignal, latest-result ownership, explicit error results and scope disposal. Keep component options/data as arrays; add Select initialization examples on…
- **[patch]** Converge the unreleased shared API with Maple: use independent local tree-shakeable utilities, explicit runtime/type exports and no wholesale rattail or unused legacy helper exports. Align internal popup validation, geometry and resize observation with the shared foundation contract. Applications ta…

## maple（217 条）

bump 类型分布：? 4、major 55、minor 45、patch 132

### (未解析)（4 条）

- **[?]** --- --- Add an observable autoplay toggle to Carousel demos and clean up all InfiniteScroll demo request timers across unmount/deactivation.
- **[?]** --- --- Make the custom Form demo control keyboard-accessible and inherit both Form and FormItem disabled/readonly state through the public composable.
- **[?]** --- --- Fix native Form demo submit/reset buttons, display model results, and use theme-aware backgrounds in InfiniteScroll demos.
- **[?]** --- --- Use a native button for the InfiniteScroll demo retry action and clear simulated request timers on unmount or deactivation.

### @maple-design/cli（14 条）

- **[minor]** Align component contracts with Cedar, including independent Card/Affix/Badge source copies, size subsets, popup containers and placements, events and enums, and Upload naming/file models. Generate published declaration files and complete public Props exports from source. See API-MIGRATION.md for mig…
- **[minor]** Add captured Alps and Firefly light themes and Maple-adapted dark themes, documentation and Playground theme options, and a complete booking form with local four-edge App safe-area simulation, live measurements, fixed actions, and contained editor portals. Expose outline field background and checkbo…
- **[patch]** 日期族的值、严格校验、范围、字段与面板提交逻辑独立同源复制。统一 Date/string/number、format/valueFormat、Date 禁用回调、默认秒精度、type 和 confirm/open-change/clear 事件；差异展示保留本地文件。更新 Demo、文档和门禁，不保留旧 API 别名。 Maple CLI 测试清理在 Node SSR 环境跳过 DOM，支持无 window/document 的组件渲染测试。
- **[patch]** Fix site-language detection for standalone desktop documentation demos, restore SplitButton action/menu labels in both preview areas, keep Textarea Props tables contiguous, and only allow SwipeCell confirmation to close on Dialog's confirm action. Constrain the FloatingPanel documentation demo to it…
- **[patch]** 文档开发直接使用源码入口，不再在启动或配置/调研重启时清空 es 并写入旧占位模块，保留 npm 发布产物与 Playground 构建资源。
- **[patch]** Resolve documentation components directly from their public source modules without circular barrel imports. Render standalone demo tags and demo fences through the same live/source pipeline, preserving code samples and demo-file hot updates. Remove stale Fab source snippets and correct the viewport …
- **[patch]** Adapt the documentation layout to narrow windows with a keyboard-accessible navigation disclosure and stacked demo preview. Preserve language selection on small screens and keep Rate's independent scale duration and easing in its shared style rules.
- **[patch]** Recover lazy document navigation after a preview rebuild replaces hashed assets. Reload the requested route once for chunk loading failures instead of silently leaving the previous page open.
- **[patch]** 新增 MapleStyleImports Vite 插件，复用 resolver 映射为显式具名函数和组件导入自动补齐样式，支持别名与去重。文档开发配置默认启用，修复 SplitButton Demo 调用 Message 缺少样式的问题，不增加 SplitButton 对 Message 的组件依赖。
- **[patch]** Preserve the public useUploader runtime export when generating the Maple library entry. The composable does not inject component styles.
- **[patch]** Link 保留尺寸功能及开发校验，生产包不携带 Vue 不执行的自定义校验函数；发布编译入口改用 production，而非自定义 compile 环境。
- **[patch]** 按 Arco 的静态样式入口模式拆分公共基础和组件依赖，避免 Less 重复内嵌 CSS；文档站基础样式使用统一模块路径，发布入口保留依赖图。
- **[patch]** Connect documentation language switching to component locales and embedded previews. Preserve component routes, use native language controls, reuse translated documentation, and explicitly label missing translations. Simplify title-only demo messages without adding translation dependencies to standa…
- **[patch]** 将命令入口移动到随源码发布的稳定 bootstrap，确保 pnpm 首次安装时即能创建 bin 链接，之后构建 lib 便可执行命令，不依赖工作区残留产物。

### @maple-design/icons-vue（1 条）

- **[patch]** 修复 Select/Cascader 构建声明的不可移植推导类型，保留完整控制器与展示组件类型；恢复图标生成器输出并防止格式化导致生成校验漂移。

### @maple-design/resolver（6 条）

- **[minor]** Add the namespaced `v-mp-loading` directive backed by Maple's built-in `Loading` component, including fullscreen and custom overlay options. Standardize Loading and Menu sizes on `xs | sm | md | lg | xl`; Loading also accepts numeric pixel sizes.
- **[minor]** 新增 MapleStyleImports Vite 插件，复用 resolver 映射为显式具名函数和组件导入自动补齐样式，支持别名与去重。文档开发配置默认启用，修复 SplitButton Demo 调用 Message 缺少样式的问题，不增加 SplitButton 对 Message 的组件依赖。
- **[major]** Unify the command menu as Menu across exports, package/style paths, types, resolver, documentation and examples. Refresh legacy migration guidance, validation fixtures and playground assets. Keep context-menu point capture in sync with Cedar: opening position stays fixed until another right click.
- **[major]** Rename BottomNavigation and BottomNavigationItem to TabBar and TabBarItem, including component tags, module/style entries, types, theme tokens and automatic resolution. Remove the old names as part of the explicit major migration. Props, events and layout behavior remain unchanged; see API-MIGRATION…
- **[patch]** 将 Input、InputPassword、InputGroup、InputGroupLabel 和 FieldDecorator 整理为两端独立复制的同源实现。补齐浮动提示、外部标签处理、组合状态继承、校验反馈、原生属性与光标保持；移动端保留有值常驻清除按钮。迁移 FieldDecorator 调用方并补齐子组件按需解析、demo 和类型。
- **[major]** Replace AppBar with PageHeader. The component exposes `showBack`, title, subtitle, and extra props, and provides header, back, avatar, content, extra, and footer slots.

### @maple-design/shared（2 条）

- **[patch]** Consolidate Icon namespace and predicate helpers in maple-shared, remove the duplicate Icon-only utility files, and keep UI-specific prop-default and CSS size handling in the existing component utilities. Preserve behavior and tighten bundle checks so consolidation does not increase on-demand Icon s…
- **[minor]** 将仓库实际使用的工具和类型迁入 maple-shared 的静态模块，移除未使用的整包转发导出、rattail 依赖及 pnpm 补丁。保留现有组件使用的工具语义，按需入口不再携带无关工具、存储初始化和 mitt。

### @maple-design/ui（207 条）

- **[major]** Add the namespaced `v-mp-loading` directive backed by Maple's built-in `Loading` component, including fullscreen and custom overlay options. Standardize Loading and Menu sizes on `xs | sm | md | lg | xl`; Loading also accepts numeric pixel sizes.
- **[major]** Align the first component-contract batch with Cedar: - Badge defaults to danger (red background, white text), supports left/right midpoint positions, and uses independently copied source and styles. - AutoComplete renames getShow to shouldOpen and adds filterOption (default true) and strict (default…
- **[major]** Separate date field and pure-panel props, standardize numeric dayStartOfWeek without legacy aliases, add independent panel installation and typed date event/Options exports.
- **[minor]** Unify Menu strategy across the root and all submenu levels, including reactive changes. Export positioning/reference/submenu types and split local appearance from independently copied positioning options.
- **[minor]** Align FormItem decoration props and label rendering; explicit validation status controls presentation only. Unify validating/success/error transitions and clear empty field state.
- **[minor]** Align Form and FormItem label/grid configuration using independently copied layout and label-width logic. Support responsive columns, fixed label flex and dynamic automatic widths with observer cleanup; keep device-specific default layouts and validation views.
- **[major]** Search 与 AutoComplete 同步 Input 的 input → update:modelValue 输入顺序和 clear → input → update:modelValue → change 清空管线；清空不会重复写模型、执行搜索或重开候选面板。AutoComplete 的 search 在模型更新通知后触发，候选选择行为不变。 修复 Search 遗漏 trim 提交模型更新，Enter 搜索等待已接受的受控值；AutoComplete 被拒绝的连续清空/候选选择不丢 change，键盘清空归焦不重开面板，补齐 Form 单次通知依赖回归。
- **[major]** Align Input value, event, type, maxLength, slot, native attribute, and accessibility contracts with Cedar while defaulting to the outlined variant and disabling clearable by default.
- **[major]** Align component contracts with Cedar, including independent Card/Affix/Badge source copies, size subsets, popup containers and placements, events and enums, and Upload naming/file models. Generate published declaration files and complete public Props exports from source. See API-MIGRATION.md for mig…
- **[major]** List/ListItem 两端独立同源，补齐 Maple 最大高度、自定义滚动条、虚拟化和定位能力，统一 BEM、34 项公共 Token 与类型。保留独立默认密度，删除旧 Token 别名。修复两端虚拟列表 align、数据缩小空白及 threshold 的索引/占位问题。
- **[patch]** Pagination 内 Input 与 Select 统一使用 standard 变体，移除 outline 专用覆盖。保留输入框高度对齐及条数选择器宽度优化；Maple Less 入口补齐 FieldDecorator 样式依赖。
- **[minor]** Paper 两端独立同源：Cedar 新增基础表面组件，两端新增 bordered 并与 elevation 独立。不引入 variant，保留尺寸、圆角与水波能力，无默认 padding。默认使用主题表面背景，仅 ripple 时使用 pointer。公开 click 载荷为 MouseEvent。
- **[major]** 独立复制 Cedar Progress / ProgressGroup 主体与样式。Progress 补齐 steps、animation、bufferColor，showText 默认 true，百分比完成自动推导 success（显式状态不变），统一主题变量及 SSR 稳定渐变。ProgressGroup 布尔 status/status 插槽直接迁移 showText/text，无兼容别名，补累计裁剪、聚焦提示与 Escape 关闭。size 继续支持 number|string。
- **[major]** Align RadioGroup local keyboard navigation, roving tab entry and dynamic/KeepAlive registration. Copy button variant styles and five size heights independently into both libraries. Maple gains button variants and removes Ripple's eager runtime style import; import ripple/style manually when not usin…
- **[major]** 统一 Rate 受控值、表单只读继承、键盘/点击清空、ARIA 和独立同源样式规则，补齐 aria-label 与 focus/blur 类型。修复默认选中色失效；移除旧兼容入口，保留两端独立主题和触控间距。
- **[major]** 统一 Rate 两端公开样式 Token 后缀，补齐几何、状态、焦点与动效定制；删除旧命名和重复暗色覆盖。默认配色与触控间距保持平台差异，错误色使用统一系统语义角色。
- **[major]** Align Search value, field, editing, submission, clear, loading, history, button, and accessibility contracts with Cedar.
- **[minor]** 统一 Search 控制逻辑、Props、事件和公开类型。字段 model 改为不可变提议，受控拒绝和历史搜索遵循实际接受值；补齐取消、字段模型反显、全屏历史、Input属性和样式 token。桌面/移动展示与默认密度保持本地实现。
- **[minor]** Align Skeleton with Cedar by adding the `animation` prop, custom `template` slot, and exported SkeletonLine and SkeletonShape primitives.
- **[major]** 复制Cedar完善后的Slider主体，补marks/showTicks/showInput/defaultValue/formatTooltip，移除labelVisible并迁移showTooltip:boolean|'always'，不保留alias。统一Pointer Events、本地键盘、不可交叉范围、受控拒绝、Form继承、数值归一化及主题Token。安装与Form接线独立维护。
- **[major]** Align Textarea value, event, length, height, slot, native attribute, and accessibility contracts with Cedar while defaulting to the outlined variant and removing the default rows value.
- **[major]** Expose the canonical TimeDisabledRules contract. Independently copy constrained clock candidate algorithms. Maple Time/TimeRange and their panels replace disabledTime predicates with disabledHours/disabledMinutes/disabledSeconds arrays; wheel and clock constraints, dynamic callbacks and commit guard…
- **[major]** Unify Upload's independent queue, reading, request, cancellation, Form and preview contracts across Cedar and Maple. Add typed read/rejected events, cancelable preview events, requestChoose, external-upload support and safe object-URL ownership. Replace legacy aliases with documented canonical APIs;…
- **[minor]** Add captured Alps and Firefly light themes and Maple-adapted dark themes, documentation and Playground theme options, and a complete booking form with local four-edge App safe-area simulation, live measurements, fixed actions, and contained editor portals. Expose outline field background and checkbo…
- **[minor]** Export AutoComplete/Select Emits, Slots and Expose types; derive event argument tuples from the runtime validators. Remove misleading upstream 2.x version annotations, correct field presentation documentation, add a Steps appearance comparison and simplify Search/Scheduler learning paths where suppo…
- **[patch]** Align BackTop runtime motion preference and stale-frame cancellation with Cedar. Preserve public duration/easing defaults and independent source copies.
- **[patch]** Isolate BackTop measurement/listener and animation-frame generations across replacement, deactivation and disposal. Consume dequeued frames once, recheck after custom easing, and request/cancel RAF with the target owner window/time origin. Preserve duration/easing/defaults/API and independent source…
- **[patch]** 将徽标默认通知样式统一为红底白字。
- **[patch]** 徽标文字与描边配色以 Button 为准，两端同步实心白字及 outline 语义色。
- **[patch]** 修复 Alps / Firefly 亮暗主题 选择器选中态及清空文字的前景色，区分操作背景色与内容色。
- **[patch]** Parameterize LoadingBar width/opacity/color transitions, consume resolved transition timing before cleanup, deduplicate completion, clear/reset owned options, unmount completed services and guard SSR calls. Preserve Button white foreground as an explicitly documented contrast design exception.
- **[patch]** Parse datetime boundaries before reducing calendar validation to day precision, preventing timestamp and Date models from disabling every day. Align range demo controls across both fields and verify actual date/time clicks in page, scroll and line modes.
- **[minor]** Add explicit IANA calendar time zones, virtual multi-month and line week views, and a cancellable asynchronous Popup close guard covering every enabled close source. Preserve existing Form draft ownership and page/date-time renderers. Extend four-theme complete-form examples with timezone, viewport …
- **[patch]** Own Card floating render/timer/layout continuation work by lifecycle, generation and node identity. Reject stale/consumed deliveries, reentrant geometry disposal and inactive retained input; activation starts fresh current state without duplicate initial waiting. Preserve500ms ripple policy, public …
- **[patch]** Own autoplay, observer/event binding, loop settlement timer and double-frame delivery by lifecycle/generation/node/window. Reject canceled or consumed work, suspend retained navigation/input during deactivation/disposal, and cancel held RAF via original window. Preserve playback intervals, move-spee…
- **[major]** Align standalone Checkbox/Radio value controllers as independent source copies. Replace defaultChecked with defaultValue. Checkbox uses boolean/array models; Radio uses an option value or null and selects without toggling off. Replace Radio.toggle with select; expose focus/blur and unify Checkbox.to…
- **[major]** Unify CheckboxGroup and RadioGroup controlled/uncontrolled state using independent local source copies. Group changes are emitted once at the group boundary; child/external synchronization no longer emits duplicate updates or form validation. Add inherited readonly/disabled/error contracts and Maple…
- **[major]** The subsequent explicitly authorized Select/Menu/FloatingPanel audit synchronizes the remaining21catalog rows and3inventory/hash entries after compiled/rendered consumer checks. Preserve existing parallel surfaces/geometry/business;no new production fix/API. Full motion/catalog gates now pass;SDK/na…
- **[patch]** 参考本地 Varlet Pagination：跳页 Input 缩为 32px 并去除横向留白，条数 Select 改为内容自适应宽度，保留 standard 变体、单行文字及触控高度。
- **[patch]** 取消 Pagination 窄屏简洁模式下上一页、下一页按钮的 44px 强制最小尺寸，统一跟随 size（默认 md 为 36px），与宽屏显式 simple 模式保持一致。
- **[patch]** Publish bilingual generated component CSS variable references in the documentation menu, distinguishing public/internal variables, conditional declarations and consumer evidence. Complete shared/platform system default governance and tighten Ellipsis and InputNumber test/demo types.
- **[patch]** 对齐 11 组待同源组件的独立实现、关键样式和配对契约测试；保留本地 token、安装和图标适配，不引入跨库运行时。修复动态插槽、图标切换清理、倒计时结束及 Tag 属性透传；Alert 内部关闭类统一为 __close-btn。
- **[patch]** 两端独立复制 Time/TimeRange 入口、TimeField 主体与展示状态协议。字段持有唯一模型、草稿和通知，桌面 Trigger 与移动 Popup/滚轮/时钟使用各自展示文件；保留本地 Form、多语言和初始化差异，不引入跨库运行时。
- **[patch]** Isolate stale/consumed countdown RAF and reentrant change callbacks from replacement runs. Defer inactive auto-start/reset work until activation, honor explicit pause, and reject disposed controls without changing business timing or CSS tokens.
- **[patch]** Keep a confirmed Date or DateRange selection settled when a controlled parent echoes the committed model but rejects closing. Preserve the first calendar range click across an equal controlled-array rerender, and add visible transaction demos and regression tests.
- **[major]** 日期面板统一 showCurrent 高亮、showNowButton 当前动作与 exchangeTime 范围交互策略。删除 showNowBtn，不保留别名；当前动作复用校验/确认，范围交换使用独立复制算法。Cedar 同时移除 ConfigProvider.exchangeTime 覆盖。同步 Demo、文档、类型与测试。
- **[minor]** 日期族的值、严格校验、范围、字段与面板提交逻辑独立同源复制。统一 Date/string/number、format/valueFormat、Date 禁用回调、默认秒精度、type 和 confirm/open-change/clear 事件；差异展示保留本地文件。更新 Demo、文档和门禁，不保留旧 API 别名。 Maple CLI 测试清理在 Node SSR 环境跳过 DOM，支持无 window/document 的组件渲染测试。
- **[patch]** Extract independently copied date display/model format rules while preserving existing public defaults. Document minute/second precision and test local integration.
- **[major]** 日期解析/显示接入实例 Locale 上下文，不切换宿主 Dayjs 默认语言或覆盖基础语言配置；周起始日互不影响。模型 valueFormat 固定英文日期协议，展示与手输文本使用界面 Locale，避免切换语言后月份名称模型失效。不保留旧模型语言兼容分支。
- **[major]** 日期族统一使用全局 Locale，不再支持 Cedar 日期级 locale；Maple 范围日历外观参数收窄为实际支持的选项并按白名单转发。修复日历分支继承滚轮默认布局及字段空配置覆盖嵌套外观的问题。不保留旧 API 兼容。
- **[minor]** 统一日期与范围日期日历的月份缩写语义，补齐 Maple abbreviation 开关；两端独立复制月份标签逻辑。
- **[minor]** 日期面板统一快捷项、预览与确认校验，以及独立的 pickerValue 视口控制和通知；补齐类型、Demo 和独立复制门禁。
- **[patch]** Fix calendar popovers being clipped by a half-viewport height cap. Keep actions inside the visual viewport when neither placement fits, and add standalone timezone, DST, calendar view and range lock demos with UTC results.
- **[minor]** Open every DateRange field editor session at the start endpoint, falling back to the end when the start is locked. Keep both endpoint summaries visible, open the calendar at the start date when possible, edit the active endpoint and retain the other endpoint, and allow initially empty fields to conf…
- **[patch]** Make date-range wheel endpoint and calendar/time view controls native keyboard-accessible buttons with active-state semantics, without changing draft or confirmation behavior.
- **[patch]** Normalize the single date emitted by DateRange endpoint calendars into the range viewport pair. Multi-month scrolling and previous/next week navigation now update the visible dates without changing the selected range or snapping back to the previous viewport.
- **[patch]** Document Cedar single Date shortcut-preview timer evidence and unchanged Maple/date-range boundaries without granting native or whole-family acceptance. Add seven unchanged-source Maple year-panel native-scroll controls and document Date runtime-candidate closure:31/33 families,165/178 hints,not par…
- **[major]** 收窄日期内嵌时间与移动滚轮展示参数并按白名单转发，不保留无效控制参数。两端独立复制时间展示选项。补齐 Maple 单值滚轮配置，明确 calendarClock 的时钟展示，Cedar 时间列精度遵守日期根 useSeconds。
- **[patch]** Align the single-week calendar with existing date panels: separate weekday headings from date buttons, highlight the date with a compact round selection, display the visible week's date range, and localize previous/next week labels. Preserve date selection, endpoint locks and theme behavior.
- **[minor]** Support date-time and endpoint-locked ranges in scroll/line calendars while retaining existing Form drafts and time wheels. Preserve unchanged fold instants and hidden precision, correctly handle partial-hour DST gaps, and order ranges by actual timestamps. Extend all four brand form previews with c…
- **[major]** 移除 Grid.Row/Grid.Col 及 Grid 入口的 Row/Col 组件、Props 和类型转导出，移除 GridRowInstance/GridColInstance；仅保留 Grid.Item。Row/Col 从独立入口或库根入口导入并单独注册，文档和 Demo 独立维护。
- **[patch]** Fix site-language detection for standalone desktop documentation demos, restore SplitButton action/menu labels in both preview areas, keep Textarea Props tables contiguous, and only allow SwipeCell confirmation to close on Dialog's confirm action. Constrain the FloatingPanel documentation demo to it…
- **[patch]** Align standalone time panel state and event wiring, keep range ownership direct and isolate local list/wheel/clock presentation. Add range-instance regression coverage and readonly/external-update demos.
- **[patch]** Resolve documentation components directly from their public source modules without circular barrel imports. Render standalone demo tags and demo fences through the same live/source pipeline, preserving code samples and demo-file hot updates. Remove stale Fab source snippets and correct the viewport …
- **[patch]** Adapt the documentation layout to narrow windows with a keyboard-accessible navigation disclosure and stacked demo preview. Preserve language selection on small screens and keep Rate's independent scale duration and easing in its shared style rules.
- **[minor]** Add emptyValues recognition and inherited emptyText for readPretty fields, defaulting to '-'. Preserve custom validator/Zod inputs and existing ownership, proxy and clear-output behavior.
- **[minor]** Add TabBar default-active for uncontrolled selection, numeric item names, and active state in the label slot. Explicit names take precedence over index matching. Cancel stale async guards after a newer click, external selection, item change or unmount, and treat rejected guards as cancelled selectio…
- **[major]** Replace AutoComplete.strict with caseSensitive by explicit user request, without a compatibility alias. Migrate strict/strict=true to case-sensitive/caseSensitive=true; default false and boolean meaning are unchanged. This removal requires the next major release. Add caseSensitive to Select and Casc…
- **[minor]** Add searchFields (default ['label']) to selection components; fields use OR matching and fieldNames mapping, with custom callbacks retaining priority. Cedar TreeSelect now defaults to case-insensitive label search by explicit user request; recover its previous defaults with searchFields=['value'] an…
- **[minor]** Add opt-in component-specific trigger/popup configuration types for AutoComplete, Select, Cascader, Date and DateRange; Cedar also exports TreeSelect tree/trigger options. Keep published wide Props and all runtime merge/filter behavior unchanged. Document host ownership, container fallback and exist…
- **[patch]** 补充 Message 业务展示期限与CSS动效完成的职责说明及审计分类证据；不更改运行时、API或Token默认值。
- **[major]** Add edit-mode to Form, FormItem and editable fields. direct replaces the ambiguous inline editing name; existing popup/click/dblclick behaviors and independent readPretty remain unchanged. Remove the old editing presentation prop, its type aliases and the inline editing value without compatibility s…
- **[patch]** 核实 FieldDecorator 焦点／caret 的真实编译及 DOM 消费，同步生成目录和焦点颜色说明，补充回归；保留并行业务、无额外外环与 currentColor caret 设计，不改生产样式、默认 Token 或公开 API。真实原生焦点可辨识性与浏览器验收仍保留环境阻塞。
- **[patch]** Keep field focus visible independently of error and filled backgrounds. Associate Date and Time native comboboxes and editable-Time triggers with their named popup through stable per-instance ARIA IDs.
- **[patch]** Declare the Date and Time field popovers' unmount-on-close policy explicitly, including range fields. Dispose the popup shell with its field-owned panel and recreate it from the current value when reopened.
- **[patch]** Retire FieldPresentation search and close-focus tasks by their active instance/request and original reference;reject late,duplicate,replaced and suspended/disposed work. Preserve Form/Select draft,validation,reset and submit behavior. Keep the private panel min-width CSS min() expression intact thro…
- **[patch]** Finalize replaced imperative image previews exactly once so Upload preview URL leases are released; preserve newer reentrant previews and isolate old handles.
- **[minor]** Align Carousel and CarouselItem as independent source copies: controlled state, measured multi-page layouts, fade/card effects, pointer lifecycle, accessible visibility, global Locale labels and tokenized motion. Long cyclic jumps requiring duplicate interactive instances now snap safely.
- **[patch]** Complete the independent Tabs family source contract, remove obsolete hidden-panel registration and export event, slot and navigation resize types.
- **[patch]** Match Firefly Link primary, secondary and tertiary foregrounds to Button text/outline roles in light and dark modes. Bind the existing canonical Link tokens as well, preserving the same palette when converting the theme to Cedar. Add bilingual Link/Button palette examples.
- **[patch]** Fix BottomNavigation spacing around its floating action button for even and odd item counts. Restore SVG icons and numeric badges in the examples, and demonstrate the floating button as a create-post action with a separate placement control.
- **[patch]** Remove the persistent Button focus fill after pointer clicks. Keep hover/ripple feedback and the keyboard focus-visible outline.
- **[patch]** Grid 转导出 Row/Col 原始符号，避免根入口生成时重复声明 _RowComponent / _ColComponent。保留 Grid.Row/Grid.Col 及独立组件入口，重新生成后仍无重复导出。
- **[patch]** 删除 Pagination 简洁模式下 controls 的 flex-basis: 100%，条数选择器与分页主体按内容宽度同行排布，仅空间不足时自然换行；两端保持同源样式。
- **[minor]** Restore Switch Form/FormItem disabled and readonly inheritance with explicit false overrides. Preserve Select 1.x clear results, accurately type undefined, and add optional emptyValue for stable single-select clearing. Existing props and defaults remain available. Select event handlers must account …
- **[patch]** Keep native Radio checked values synchronized with the model after clicks and keyboard activation. Restore every member after a rejected controlled group selection and avoid duplicate click/change proposals.
- **[patch]** 统一关闭原生输入自动填充，补齐八套主题的选择、日期、Radio、Switch 和上传状态对照；修复 Cascader 勾选、日期选中文字、Radio 按钮文字、Switch 状态文字和上传图层的对比度，并补齐日期时间品牌圆角与上传禁用视觉。
- **[patch]** 修复无外置标签的弹层表单字段被误限为 40% 宽度，统一萤火虫亮暗主题 Popover 圆角并修正箭头形状。
- **[patch]** Record the initial controlled Form scroll-task baseline and historical pending authorization. Preserve API,Tokens and open classification status;do not claim whole-family or native acceptance. Latest authorized follow-up:replace unconditional Form300ms completion waiting with owned render settlement…
- **[patch]** 修复默认/Maple 主题选择器高亮、勾选、清空和字段聚焦/错误提示的低对比度；补齐 Alps/Firefly 各字段变体的普通、悬停、聚焦、错误和禁用映射。新增 Checkbox 勾选前景色主题角色，以及完整表单变体/尺寸和状态对照。
- **[patch]** Reject stale/consumed Icon name-transition callbacks, cancel pending phases when transition duration changes, and suspend timers/media listeners during KeepAlive deactivation. Bind reduced-motion observation to the actual Icon owner document and reject detached listener deliveries. Preserve default …
- **[patch]** Invalidate canceled/consumed ImagePreview long-press and double-tap timers, suspend retained input during deactivation/disposal, detach keyboard/coarse-pointer observation and release capture. Activation reads current mode without replay. Preserve500ms/320ms policies, public API and CSS tokens; Prev…
- **[patch]** Give IndexBar cancellable owner-window entry, interpolation and two-frame settlement tasks. Superseded, inactive and disposed commands cannot scroll or clear a newer pending state. Restore the active position after KeepAlive child registration. Preserve void scrollTo, event:false, default zero durat…
- **[patch]** Invalidate canceled or consumed InfiniteScroll measurement callbacks and disconnected observer deliveries across target replacement, deactivation and disposal. Preserve status locking, immediate policy and check/retry API; no CSS motion token.
- **[major]** Add PeopleSelect options array/loader and a reactive fallback-option display callback, avatars and optional built-in call/chat icons. Reuse setPropsDefaults and local props for business callbacks, with generic action renderers/slots as an extension. Each field owns cancellation, loading and stale re…
- **[patch]** Inline Select/Cascader 下拉不再重复展示已选和清空，Popup 编辑器保留完整选择管理；基础表单改用 InputNumber，并说明与仍保留导出的 Counter 的迁移边界。
- **[major]** InputNumber 与 Cedar 使用独立复制的主体、Props、数值控制器和样式。统一字段继承、variant/hint、五档尺寸、IME、受控提案恢复和触控长按；公开 Props 改为可选消费类型。清空改为 input/update/change/clear 顺序，不保留旧行为。补全全局多语言、select/inputRef、七组中英文 Demo 和输入框 Token。
- **[patch]** Reject cancelled, consumed and inactive long-press timer callbacks before stepping; preserve reentrant replacement holds and existing 800ms/150ms cadence. No public API or CSS token changes.
- **[patch]** 修复 InputNumber 重复解析、科学计数法精度、范围边界与长按清理；补充独立数值工具、双端配对回归及中英文边界 Demo。错误状态使用现行 Input error 属性。
- **[patch]** Link 各状态文字色统一遵循 Button 的文字变体，修复明暗主题中性文字及禁用配色差异。
- **[minor]** Link 新增五档 size，两端文字、图标和加载图标同步缩放，默认 md。
- **[patch]** Link 保留尺寸功能及开发校验，生产包不携带 Vue 不执行的自定义校验函数；发布编译入口改用 production，而非自定义 compile 环境。
- **[patch]** 修复 LoadingBar 重复计时／渲染交付及样式读取重启后旧阶段污染新加载；保留既有Token、API、默认时序和清理下限。
- **[patch]** Stop default click actions and propagation on the Loading directive overlay so clicks do not reach the host Card or ancestor click handlers. Keep normal clicks after loading ends.
- **[major]** Rename Loading content-mask class to content-overlay and loading-mask-background token to loading-overlay-background. Update custom CSS selectors and tokens; directive background options and click blocking are unchanged.
- **[patch]** Align Design Token guides on Cedar Map's SDK suppression-window classification and remaining provider lifecycle acceptance; Maple adds no Map runtime.
- **[minor]** 统一使用与 Cedar 同源的 Menu 承接命令菜单，选项数据类型为 MenuOptionData，子项组件保留 MenuOption。
- **[major]** Unify the command menu as Menu across exports, package/style paths, types, resolver, documentation and examples. Refresh legacy migration guidance, validation fixtures and playground assets. Keep context-menu point capture in sync with Cedar: opening position stays fixed until another right click.
- **[patch]** Honor reduced-motion in isolated Message styles without changing normal CSS tokens or business display deadlines. Preserve static positioning when removing animated displacement; Cedar also cancels decorative icon fades.
- **[patch]** Clean up Message display timers during KeepAlive deactivation and prevent scheduling after unmount. Reactivation starts the full current duration; exhausted hover deadlines close on resume, explicit zero remains persistent, and non-finite durations do not schedule auto-close. CSS motion tokens and d…
- **[patch]** Prevent stale Message display timer callbacks after restart, hover pause, clear, close or unmount without changing display duration or CSS motion tokens.
- **[patch]** Let Message CSS transition completion control service disposal instead of fixed 150ms/200ms waits. Clean up never-mounted entries immediately and clear from an item snapshot; preserve business display duration and same-id reopen ownership.
- **[major]** Message adds neutral/tonal/solid variants, keeps solid default, and replaces ambiguous color tokens with the shared variant/status color contract.
- **[patch]** Honor reduced-motion in built-in modal transitions from component-local CSS, disabling starting scale/slide movement without changing normal timing, public APIs or tokens. Compiled selector regression covers the preference branch; real OS preference switching remains separate acceptance.
- **[patch]** 按 Arco 的静态样式入口模式拆分公共基础和组件依赖，避免 Less 重复内嵌 CSS；文档站基础样式使用统一模块路径，发布入口保留依赖图。
- **[minor]** Add explicit Tag fade, Alert close, Button transition and Switch loading duration variables and respect reduced-motion preferences. Align component spacing, typography and radius references with existing system roles while retaining component geometry and mobile density. Shared specification: Cedar …
- **[minor]** Select 新增 autoFitPopupWidth（默认 true，保留原行为）。Pagination 内部设置为 false，条数弹出菜单按内容自适应宽度，不再受紧凑触发框限制。
- **[minor]** Add Popup transition-duration (250ms) and transition-timing-function (ease) CSS tokens, preserving defaults and reduced-motion priority. Align modal lifecycle with Cedar: retain content during leaving, ignore duplicate completion callbacks and keep rapid-reopen state. Document actual Teleport-host s…
- **[patch]** 移除 Popup 运行时主体的样式副作用导入。样式仍由既有 popup/style 及调用方 style 入口静态引入，避免 Search/Popup 在 Node SSR 裸导入时加载 CSS。
- **[patch]** 修复 Select/Cascader 构建声明的不可移植推导类型，保留完整控制器与展示组件类型；恢复图标生成器输出并防止格式化导致生成校验漂移。
- **[patch]** Accept valid popup-container HTMLElements from an iframe's own realm while still rejecting SVG and non-elements. Preserve real Teleport target, state, event ownership and cleanup contracts with regression coverage. Document component-variable scopes, root alias computation and Teleport inheritance b…
- **[patch]** Own PreviewGroup recenter and double-frame work by generation, lifecycle and track window; reject canceled/consumed/reentrant deliveries and suspend retained commands while inactive/disposed. Preserve loop/public APIs. Recenter follows computed transform duration/delay (400ms only unresolved fallbac…
- **[patch]** Cancel PullRefresh touch sessions without refreshing, isolate stale bindings after activation/target changes, guard reentrant measurement and coordinate same-module per-target scroll-lock leases without removing another holder's or pre-existing external lock.
- **[patch]** Own and cancel PullRefresh success, reset and icon timers across replacement, disabled, suspension and disposal; settle cancelled icon waits and reject stale refresh continuations while preserving controlled model acknowledgements and configured durations.
- **[major]** Align Radio/RadioGroup native input bodies, public input attributes, names, scoped icon slots and per-instance appearance in independently maintained copies. Replace legacy DOM classes/providers with BEM rules. Keep controlled input restoration and local keyboard navigation. Cedar Ripple now uses th…
- **[patch]** Unify range-field endpoint activation and focus boundaries. Moving between inputs retains the text draft without an intermediate commit or form blur. Range panels follow the activated endpoint with instance-local state; standalone panels remain independent.
- **[major]** Remove Card.loading and its body replacement/click suppression. Use the Loading directive for loading feedback and explicitly disable interactive children when needed. Remove the Card loading demo and direct loading style dependency.
- **[major]** Rename BottomNavigation and BottomNavigationItem to TabBar and TabBarItem, including component tags, module/style entries, types, theme tokens and automatic resolution. Remove the old names as part of the explicit major migration. Props, events and layout behavior remain unchanged; see API-MIGRATION…
- **[minor]** Register Carousel effect durations, Picker check color and TimeRange next-day color. Use readable content roles and correct variable names in documentation. Add independent Menu selected-hover and disabled backgrounds while preserving the selected cover painting model.
- **[patch]** Isolate disconnected ResizeObserver notifications and dequeued measurement RAF from replacement bindings, including KeepAlive reactivation. No public API or motion token changes.
- **[patch]** Align Ripple with Cedar: honor computed transition timing without truncating longer CSS token overrides, preserve default timing and minimum cleanup policies, deduplicate release and isolate nested/document/keyboard lifecycle ownership.
- **[patch]** 修复 Ripple 已取消／重复交付的计时回调复活任务，以及几何／样式读取中卸载残留波纹；保留既有时序、Token与公开API。
- **[patch]** Document current Ripple and VirtualList classification revalidation, separating controlled lifecycle/measurement/mouse tests from native input and OS acceptance. No runtime or Token change in this audit batch.
- **[patch]** SplitButton 采用与 Cedar 独立同源的主体、Props 和契约测试。统一 icon 插槽和点击冒泡，修复异步点击自动加载以及整体禁用优先级，保留菜单实例方法。
- **[patch]** Align Design Token guides on business-clock lifecycle ownership and file-level parallel audit boundaries; no Maple Scheduler runtime is added.
- **[patch]** Align Design Token guides on Scheduler dependency measurement ownership and remaining acceptance boundaries; no Maple runtime added.
- **[patch]** 同步Cedar独立卡片拖动生命周期及分层证据指南，不新增移动端组件或Token。
- **[patch]** 同步Cedar受管卡片长按与点击结算的Token职责和阶段性验收边界；不新增移动端Scheduler。
- **[patch]** 同步Cedar SchedulerEvent三阶段源码职责分类及合成事件／原生证据边界，不新增Maple运行时。
- **[patch]** 同步调度与Token指南中的Cedar指针帧归属及证据边界，不新增移动端Scheduler组件。
- **[patch]** 同步Scheduler运行时候选分类和TimeGrid范围会话证据边界，不新增移动端Scheduler或Token。
- **[patch]** Align Design Token guides on Scheduler two-phase state settlement and parent-consumer verification boundaries;no Maple runtime added.
- **[patch]** Document Cedar Scheduler test-clock cleanup evidence separately from product timing and native acceptance; Maple runtime and tokens are unchanged.
- **[minor]** BackTop / Ellipsis 独立同源：默认监听页面、200ms/quartOut，补齐动态目标、动画取消、原生按钮、受控 expand/defaultExpand 和 Tooltip 契约。Demo 使用隔离容器，CSS Token 与 Cedar 对齐。
- **[patch]** Suspend retained Scrollbar commands/events/measurements during deactivation/disposal and isolate old activation bindings/reentrant geometry. Correct zero-origin scrolling, zero thumb reset, horizontal ratio and zero-viewport metrics in independent copies. Preserve native options and public signature…
- **[patch]** Invalidate Select shared-hook open-scroll work across close/reopen, newer navigation, deactivation and disposal. Consume empty deliveries once, guard retained interaction entries, and recheck after virtual callbacks before DOM writes. Preserve late registration, keyboard/option protocol and CSS/publ…
- **[patch]** Clip Select dropdown contents to the popup radius, including option, header and footer backgrounds, while preserving the popup shadow and scrolling.
- **[patch]** 将移动选择展示 Token 声明移到独立 presentation 扩展，公共选择字段 Token 与 Cedar 保持同源，现有变量名称、值和视觉行为不变。
- **[patch]** Bind JS scroll RAF and reduced-motion queries to the target owner window, complete zero/invalid durations without queued interpolation, and reject consumed/completed frame replay. Preserve default 300ms/caller easing; no cancellation API or CSS token changes.
- **[major]** 六组独立同源收口：选择组件改用当前 Checkbox/Radio BEM；Message 默认 variant 与 Cedar 统一为 neutral（显式 solid/tonal 不变，无旧默认兼容）。补齐计时器和默认变体测试，保留移动 presentation 扩展。
- **[patch]** Reduce Tooltip, Popover and Ellipsis entry overhead by removing duplicate prop-default setup, unused positioning fields and inactive ResizeObserver polyfill plumbing. Keep popup-container DOM-brand validation in development builds, where Vue uses it. Preserve native observation, viewport fallback, p…
- **[patch]** Consolidate Icon namespace and predicate helpers in maple-shared, remove the duplicate Icon-only utility files, and keep UI-specific prop-default and CSS size handling in the existing component utilities. Preserve behavior and tighten bundle checks so consolidation does not increase on-demand Icon s…
- **[patch]** Use a neutral BottomNavigation surface across themes. Highlight standard items with primary text and icons, and use a subtle primary tint for the variant indicator instead of unrelated purple and blue fills.
- **[patch]** Prevent stale SwipeCell close confirmations from closing reopened cells or writing after suspension/disposal; preserve current veto and explicit Promise rejection. Document tested lifecycle boundaries.
- **[patch]** Cancel stale SwipeCell click-unlock tasks and drag sessions on replacement, disabled, suspension and disposal; restore pre-gesture position on touchcancel and isolate stale touch listeners across activation. Preserve current transition and threshold, and guard callback reentry.
- **[minor]** 将 TabBar variant 改为 standard / pill 命名样式；明确稳定 key 与选中保持示例，并简化自定义选中标签。
- **[patch]** Own each Scrollbar Thumb mouse gesture by session/node/axis/original window. Remove move/up/contextmenu/blur listeners on end/cancel/geometry changes/deactivation/disposal; reject old move/end and inactive retained input. Preserve equal-geometry drag continuity, current setOffset/track behavior and …
- **[major]** Fix sibling Trigger dismissal before a newly opened popup replaces the top layer. Align midnight-anchored hour step candidates across twelve/24-hour displays. Maple gains time step props, AM/PM wheel columns and labels, and correct noon/midnight clock switching. Add matching Time/TimeRange examples …
- **[minor]** Align inclusive min/max time constraints across fields and pure panels. Cedar adds public bounds and disabled list presentation; both independent rule copies reject reversed bounds consistently. Add dynamic bounds examples, contract tests and documentation.
- **[major]** Use independent instance-local value/open state. Maple time fields and panels support defaultValue; fields support defaultOpen and open-change, panels support disabled. Controlled open now requires parent acceptance and clear emits no arguments. Matching demos and regression tests document the contr…
- **[patch]** Unify field and standalone time panel commit validation using independent local copies. Revalidate current format, steps, disabled rules and supported bounds; sort ranges unless showNextDay is enabled. Cedar typed times now enforce step and use the same range ordering as panels. Mobile confirmation …
- **[minor]** Remove the time field close event in favor of open-change(false). Protect field interaction from popupProps overrides and forward explicit native labels to the field input.
- **[patch]** Consolidate Time/TimeRange selection, commit, clear, focus and Form notifications into independently copied per-field controllers. Preserve local presentation initialization and keyboard handling. Add paired regression tests and synchronized interaction demos.
- **[patch]** Align time field focus boundaries using independent local copies. Add Cedar Time/TimeRange focus and blur events, deduplicate component/Form notifications, keep readonly fields focusable, and release disabled focus state. Scope Maple trigger shortcuts locally instead of window, preserve native Tab n…
- **[minor]** Align time-field appearance APIs and nested-option ownership before release. Cedar adds floating hints, line/colors and range separators; Maple adds explicit Form error overrides. Reject state, validation and owner event overrides in nested presentation options at type and runtime boundaries. Set th…
- **[minor]** Align time fields with Cedar: suffix-icon, focus(index), and string/array range placeholders. Remove the arrow-icon field slot without an alias.
- **[patch]** Use an independently copied time-format foundation for clock labels and add paired format regression checks. Public time format and model APIs are unchanged in this stage.
- **[major]** Align standalone time panel confirmation and disabled-option visibility. Maple panels now keep selection drafts until confirmation by default; disableConfirm opts into immediate commit. Nested fields/date panels explicitly skip inner confirmation. Add hideDisabledOptions to public time fields and mo…
- **[patch]** Separate time panel presentation templates from their state owners. Preserve local controller refs, slots, confirmation ownership, clock DOM refs, DOM structure and style tokens. Add presentation ownership regression checks and synchronized demos.
- **[patch]** Consolidate single/range time panel drafts, validation, selection and confirmation in independently copied controllers. Extract desktop Dayjs/list and mobile wheel/clock interaction adapters. Remove obsolete input/open-state logic from Cedar's pure panel; keep popup closing at the component boundary…
- **[patch]** Make time-range wheel and clock endpoint controls native keyboard-accessible buttons, preserving draft and confirmation behavior.
- **[patch]** Independently copy and verify pure clock rules. Correct twelve-hour disabled callback evaluation in Cedar and inclusive second/minute boundaries in Maple clock panels. Document and test actual clock-hour semantics without changing public APIs.
- **[patch]** Document Cedar private Time scroll-task evidence and the unchanged Maple wheel/clock boundary without granting whole-family or native acceptance. Document the completed Cedar TimeColumn consumer phase and30/33 runtime-candidate family registration,without certifying parallel Maple Time panels or cha…
- **[major]** Align time selection and commit payloads with independent event-date helpers. Maple TimeRange clears to undefined; time fields and panels emit select/change with local Date parameters. Maple fields add disableConfirm for immediate valid commits. Add matching demos, API docs and regression tests; sta…
- **[minor]** Add optional inputEditable to Time and TimeRange, retaining selection-only mobile defaults and picker/clock presentations. Flush text before opening the panel and reconcile rejected text commits.
- **[major]** Align time format and model contracts: strict formatted strings, local Date and millisecond timestamp inputs, and formatted string outputs. Maple replaces the ampm/24hr enum and Time.useSeconds with format tokens and use12Hours; Date internal callers are migrated. Add independent source copies, matc…
- **[patch]** Centralize 375 cross-platform public CSS declarations in owning token files without changing their effective defaults. Fix ImagePreview enabled-arrow hover consumption, remove the unused Counter disabled-color variable, and make omitted TabBar z-index consume its CSS variable (visual default 1; prop…
- **[patch]** Improve Tag preset contrast using palette step 9 foregrounds and system secondary gray; use gold step 2 for light hover backgrounds. Connect FieldDecorator outline-error and standard-error/disabled public overrides, using border-subtle for disabled underlines. Remove the unconsumed internal placehol…
- **[patch]** Contain generated CSS variable reference table overflow and recognize flat language-suffixed demo files during documentation validation without requiring both languages in each page.
- **[patch]** Tooltip 彩色实心状态的文字统一遵循 Button 白字规则。
- **[patch]** Synchronize the guide's Cedar Tree delegation classification and verification boundaries; no Maple Tree runtime counterpart added.
- **[patch]** 将仓库实际使用的工具和类型迁入 maple-shared 的静态模块，移除未使用的整包转发导出、rattail 依赖及 pnpm 补丁。保留现有组件使用的工具语义，按需入口不再携带无关工具、存储初始化和 mitt。
- **[patch]** Prevent stale Trigger delayed state commits after cancel, replacement, deactivation or unmount; inactive/disposed owners reject retained requests without changing interaction delays or CSS tokens.
- **[patch]** Schedule/cancel Trigger positioning RAF on its owner window and prevent canceled dequeued frames from consuming replacement scroll work. No public API or motion token changes.
- **[patch]** Detach Trigger scroll listeners from their original binding window when popup refs change or disappear, including unmount before watcher flush.
- **[patch]** Add useAsyncData for reusable zero-argument initialization loaders and external search loaders, with per-owner state, optional debounce/cache, AbortSignal, latest-result ownership, explicit error results and scope disposal. Keep component options/data as arrays; add Select initialization examples on…
- **[major]** Independently align AutoComplete source and Menu styles across Cedar and Maple. Unify form inheritance, grouped/async/virtual suggestions, selection length rules, focus/keyboard/SSR behavior and event payloads. Add hint/color/keyboard props to Cedar; migrate Maple to canonical option.render/option s…
- **[major]** Unify Avatar and AvatarGroup with Cedar. `size` accepts CSS lengths, `ObjectFit` is renamed to `AvatarObjectFit`, and image load/error plus group stacking share one implementation.
- **[major]** Unify Button and ButtonGroup on the feature-complete Maple implementation. Add icon/autofocus and complete loading controls, fix disabled links and async reentry, and share five sizes/eight statuses and paired demos. loading-type selects the spinner; migrate Cedar default/fill/line to loading-mode. …
- **[major]** Unify Empty with Cedar. Default illustration uses IconEmpty; click no longer stops propagation.
- **[major]** Unify Grid/GridItem and Row/Col across platforms. Add independent Row/Col source, style, import and documentation entries while preserving Grid family aliases. Fix responsive zero values, plain-div mode, listener cleanup and dynamic collapsed items. Cedar column/row classes now use BEM modifiers mat…
- **[minor]** Image 与 Cedar 同源：统一加载回退、预览控制器和命令式 API，组件默认值走 setPropsDefaults。
- **[minor]** 将 Input、InputPassword、InputGroup、InputGroupLabel 和 FieldDecorator 整理为两端独立复制的同源实现。补齐浮动提示、外部标签处理、组合状态继承、校验反馈、原生属性与光标保持；移动端保留有值常驻清除按钮。迁移 FieldDecorator 调用方并补齐子组件按需解析、demo 和类型。
- **[major]** Unify Loading and Result with Cedar: Loading adds custom and hidden-indicator support plus shared accessibility behavior; Result standardizes nine status graphics and migrates image/footer slots to icon/extra with an additional default details slot.
- **[minor]** Link 两端采用独立同源复制：Maple 补齐 hoverable，统一 MouseEvent、原生属性透传、动态 icon 插槽、加载动画与键盘焦点。禁用/加载不能被 tabindex 覆盖。内部状态类统一为 --status-*；保留端侧主题 token 和图标依赖。
- **[major]** Replace AppBar with PageHeader. The component exposes `showBack`, title, subtitle, and extra props, and provides header, back, avatar, content, extra, and footer slots.
- **[major]** 统一 Pagination 两端 API、状态、页码按钮和布局；增加容器响应式简洁模式，补齐尺寸、键盘和非法输入处理及 12 组配对 demo。 pageSizeProps 收敛为 PaginationPageSizeProps，size 默认 md，elevation 默认 false。默认开启 responsive（480px）；完整页码设 responsive=false。DOM 与 CSS token 更新，详见 API-MIGRATION.md。当前尚未发布的同源批次统一迁移，不保留旧属性透传。 修复 Less 3 对 max(var(...)) 的编译错误，使用转义字符串保留浏览器…
- **[major]** Unify Progress.percent on the 0–100 scale, including decimal numeric strings. Migrate Cedar ratios and text slot consumers. Independently copy the same four-variant Switch implementation to both libraries; unify asynchronous beforeChange, values, events, slots and sizes. Maple standard becomes line …
- **[major]** 统一使用 InputNumber，彻底移除 Counter 的组件、导出、样式、主题、示例和文档，不提供兼容别名。InputNumber 新增按钮专用输入、独立禁用/隐藏加减、长按开关、方向事件及 inline beforeCommit 事务拦截，并补充完整示例。
- **[patch]** Use the independent same-source SelectionField for Select menu/picker/list, fix duplicate-label tag removal and default clear rendering.
- **[major]** Unify Select and Cascader controllers, Menu rendering, field APIs and semantic style tokens using independently maintained source copies. Cedar supports menu; Maple adds isolated list/picker presentations with explicit draft commit/cancel. Align defaults and events without compatibility aliases, exp…
- **[minor]** Space 完整独立同源：统一 wrap=false，五档行列间距采用 Cedar 值，Maple 内置主题同步更新。Maple 依赖隐式换行的使用方需显式添加 wrap。修正文档旧 API 和行列 token 值，补充默认行为、动态插槽、单位与属性透传测试。
- **[major]** Unify Tabs / TabsNavs / TabNav / TabsItems / TabItem across Cedar and Maple. Share controlled selection, six variants, lifecycle, keyboard accessibility and optional touch swipes. Maple replaces Tab/name and standalone carousel panels with the Cedar key-based composition. Migrate legacy appearance t…
- **[minor]** Finish Cascader and date/time field-layer convergence with independent SelectionField/PickerField copies and draft/commit/cancel transactions. Remove obsolete Cedar field shells and date/time Picker hideTrigger mode; keep panels independent from Form ownership. Update demos, docs and reuse audit bou…
- **[patch]** Align Chinese and English local upload queue demos with Cedar: generated files, first-attempt failure, visible status/request counts, cancellation and retry, and complete demo timer cleanup.
- **[minor]** 新增逐项覆盖上传、视频时长读取与展示。替换经过完整校验及删除守卫，保持受控模型、请求失效和资源清理语义。底部 Popup/ActionSheet 支持从指定头部下拉关闭，字段编辑器将其作为取消草稿并在确认 pending 时禁用。Alps/Firefly 亮暗完整表单接入替换守卫、本地视频样例和手势验证。
- **[patch]** Invalidate stale VirtualList post-render scroll corrections when superseded, data/mode changes, deactivated or disposed. Ignore retained inactive/disposed commands; consume corrections once and preserve existing List API and alignment behavior. No new CSS motion token.

### @maple-design/use（1 条）

- **[minor]** Add useAsyncData for reusable zero-argument initialization loaders and external search loaders, with per-owner state, optional debounce/cache, AbortSignal, latest-result ownership, explicit error results and scope disposal. Keep component options/data as arrays; add Select initialization examples on…

### @maple-design/vite-plugins（1 条）

- **[patch]** Resolve documentation components directly from their public source modules without circular barrel imports. Render standalone demo tags and demo fences through the same live/source pipeline, preserving code samples and demo-file hot updates. Remove stale Fab source snippets and correct the viewport …
