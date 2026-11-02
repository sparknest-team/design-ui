# 表单控件契约

本文件是 Cedar 与 Maple 表单类组件的公共代码契约。适用于 Form、FormItem、FieldDecorator、Input、Textarea、InputNumber、Select、AutoComplete、Search、Checkbox、Radio、Switch、Date、Time、Upload 等可参与表单的组件。

## 1. 公共状态模型

公共状态只使用以下名称：`modelValue`、`defaultValue`、`disabled`、`readonly`、`size`、`variant`、`error`、`loading`、`clearable`。同名属性在两端必须同义；平台专属的展示能力不能改变公共状态语义。

- 值：`modelValue` 表示受控值，`defaultValue` 只初始化非受控值。是否受控以 `modelValue !== undefined` 判断，不能用 truthy 判断。
- 弹层：统一使用 `open`、`defaultOpen`、`update:open`。移动端的 picker/popup 只是 presentation，不另造可见性状态。
- 继承：组件显式值、Group/FormItem、Form、ConfigProvider、组件默认值的优先级必须在组件族内唯一确定。可继承 Boolean 的缺省值使用 `undefined`；合并时使用 `??`，禁止无说明地混用 `||`。
- 禁用：不触发输入、清空、选择或提交事件，不进入可编辑焦点序列。
- 只读：允许聚焦和复制，不改变值、不清空、不打开会改变值的面板。
- 加载：是否阻止交互必须写入组件契约，不得仅靠遮罩或 CSS 假禁用。
- 错误：`error` 只表达视觉/无障碍错误态；校验文本和生命周期由 FormItem 管理。

## 2. 尺寸与外观

- 通用尺寸集合为 `xs | sm | md | lg | xl`，默认值由平台配置决定；组件未实现某尺寸时必须声明窄集合，不能接受后静默回退。
- 通用输入外观为 `filled | outline | standard`。平台 presentation（例如 picker、menu、list）与输入 variant 分开。
- 尺寸只通过 `--{prefix}-sys-control-height-*` 和组件公共 token 派生。`current-*`、计算中间值和布局私有量必须使用 `internal` 命名空间。
- 可用于主题/品牌定制的颜色、间距、圆角、字号优先暴露 CSS 变量，不重复暴露 `textColor`、`focusColor`、`blurColor` 一类样式 Props。只有逐实例动态值确有必要时才允许样式 Prop，并登记平台扩展。

## 3. 事件与原生元素

- 文本输入顺序：用户输入 → `input` → `update:modelValue`；确认/失焦后的语义变化发 `change`。IME composition 期间不得提前裁剪或重复发 change。
- 清空必须发 `clear`，同时遵守同一套 `input`、`update:modelValue`、`change` 顺序。
- 选择类统一发 `update:modelValue`、`change`；弹层统一发 `update:open`、`popup-visible-change`（如保留该事件）。
- 原生属性通过 `inputAttrs` / `textareaAttrs` 透传；公共无障碍属性可直接暴露。内部状态开关不得进入公开 Props 导出。
- Radio / Checkbox 的原生 `input.checked`、ARIA 状态与模型必须一致；受控拒绝更新后需恢复原生属性。RadioGroup 同时恢复被点击项及被原生同名互斥取消的原选中项。
- 同一次原生激活产生的 `click` / `change` 只提出一次值更新。允许的 Radio 激活不取消默认行为后再抢先回写状态；只读和禁用按状态契约拦截。浏览器回归必须读取原生属性，不能仅凭选中样式或 `aria-checked` 判定通过。
- `expose()` 的 `focus`、`blur`、原生元素引用和 FormItem 方法需在两端同名同义。

## 4. Form 集成

- 所有表单控件通过同一逻辑接口接收 FormItem 的 `disabled`、`readonly`、`size`、`error` 和事件处理器。
- FormItem 负责字段路径、规则、触发时机、异步竞态、错误消息、reset/clear/validate；控件不复制规则引擎。
- Form 至少统一 `model`、`layout`、`disabled`、`readonly`、`size`、`rules`、`scrollToError`、`scrollToErrorOffsetY` 的语义。Form/Item 的 labelAlign、labelColProps、wrapperColProps、labelColStyle、wrapperColStyle、labelColFlex、autoLabelWidth 使用两端独立复制的同义布局逻辑：horizontal 默认 5/24 标签与 19/24 内容，Item 覆盖 Form，数字 flex 是伸缩比例而非 px；自动宽度按各项实际 horizontal 布局计算并清理观察器。Cedar 默认 horizontal、Maple 默认 vertical，移动端 details 保留本地展示。
- 异步校验必须有运行序号或取消机制，旧结果不能覆盖新值的校验状态。

## 5. CSS 与 Token

- 公共 token 后缀必须一致并表达同一 CSS 功效；前缀仅为 `--c-` / `--mp-`。
- 组件源码只读取已定义 token。公共 token 放 `style/token.less`，实现样式放组件样式文件；禁止在实现体重复写品牌色和系统常量。
- 桌面与移动实现结构不同的复杂面板，只统一语义层 token；面板内部 token 作为明确的平台扩展，不强求伪一致。
- 新增、删除或改名 token 时，组件代码、文档、`@sparknest/theme-contract` 与检查用例必须在同一变更中更新。

## 6. 必要测试矩阵

每个表单控件至少覆盖：受控/非受控、Form 继承、显式覆盖、disabled、readonly、clear、IME、maxLength、五档尺寸（或声明的窄集合）、三种 variant、错误态、暗色主题、SSR。选择类额外覆盖 open 受控、键盘/触控选择、空选项、异步选项和弹层关闭后的焦点恢复。

## 7. Time / TimeRange 禁用契约

- Time、TimePicker、TimeRange、TimeRangePicker 使用 `disabledHours(): number[]`、`disabledMinutes(hour?): number[]`、`disabledSeconds(hour?, minute?): number[]`；返回禁用值，小时统一为 0–23，不随十二小时显示改变。
- 移动滚轮与时钟必须同时遵守组件的禁用规则和 min/max，不能只在一种 presentation 生效。空候选或非法草稿不得确认；外部模型的更新不得触发自动写回。
- Date 的 disabledTime 是日期组件的独立契约，向内部时间面板转换不得在 Time 上保留同名兼容属性。Date 的跨端 API 收口另行验收。

## FormItem 装饰与状态（2026-10-12）

- contentClass/contentFlex、labelComponent/labelAttrs、showColon/tooltip 两端同义；contentFlex 默认 true，自定义 Grid 时关闭。labelAttrs.for 必须指向控件真实原生 id，而非 FormItem 外壳 id。
- required 或 required 规则产生星号；hideAsterisk 仅隐藏标记，不关闭校验。asteriskPosition 为 start/end。
- validateStatus 是 success/warning/error/validating 校验展示状态，不是主题色 status。显式状态优先，不改变 validate 返回值。仅 error 展示错误消息，其他状态可显示 help；feedback 使用相同状态。
- 自动校验 validating → success/error；clearValidate 恢复未校验。setFields 仅传 message 视为 error，显式 status='' 和 message='' 清空。校验规则引擎仍各自维护。

## 日期字段与纯面板（2026-10-12）

- Date/DateRange 管理输入与浮层；DatePicker/DateRangePicker 仅为嵌入式选择面板，不暴露 open/defaultOpen、popupContainer、placement、triggerProps、placeholder、variant、clearable。
- 面板公共协议包括模型、格式、日期/时间禁用、包含边界、disabled/readonly、disableConfirm、dayStartOfWeek 与本库 timePickerProps。dayStartOfWeek 为整数 0～6，默认 0（周日），仅日历展示使用；移动范围日历必须同步转发。showCurrent 是当前日/月/年高亮，不等于 showNowButton 的“选择当前”动作。
- 嵌套 DatePickerOptions/DateRangePickerOptions 仅配置展示，不包含顶层模型、格式、边界、禁用规则和状态所有权。运行时仍过滤控制监听器与所有权键，不能用类型检查替代运行时保护。
- 公共入口及 date/date-range 子路径导出 Props/Instance/Type/Options/Emits，纯面板支持独立 app.use。DatePicker 单选 payload 为标量，多选和范围 payload 为数组；每次通知均为 value、Date(s)、formatted text(s) 三参数，focus/blur/clear 无参数。确认通过 actions 的 confirm/disabled 协议接入。

## 当前日期与范围交互（2026-10-12）

- showCurrent 默认 true，只影响日历高亮；DatePicker 单选的 showNowButton 默认 true，通过当前 type、时间精度和 valueFormat 生成候选，复用日期/时间禁用、边界、readonly/disabled 与确认事务。多选/范围不提供单值当前动作。
- actions 插槽提供 confirm/disabled/selectNow/nowDisabled；自定义按钮调用受保护动作，不旁路写入模型。
- DateRangePicker exchangeTime 默认 true，反序交互交换整个日期时间端点；false 交换日期、保留端点时间位置。最后继续验证端点与锁定状态。外部模型、手输和快捷项不自动重排。
- 两端面板独立维护相同控制器源码；全局 Locale 接入各自系统。删除旧 showNowBtn 和 Cedar ConfigProvider 的 exchangeTime 覆盖，不保留别名。

## 字段编辑与纯阅读（2026-10-21）

- `edit-mode`：Cedar 为 `direct | click | dblclick`；Maple 为 `direct | popup`。Cedar 默认 `direct`；Maple 的 Select、Cascader、AutoComplete、Date/DateRange、Time/TimeRange 默认 `popup`，其他字段默认 `direct`。Form/FormItem 未指定时保留各字段默认值，显式设置才统一覆盖；字段 > FormItem > Form。显式 `direct` 保留直接编辑。旧编辑属性 `presentation`、类型别名与编辑值 `inline` 直接移除，不保留兼容层。
- Search 的 `edit-mode` 两端统一为 `direct | popup`，默认 `direct`；分别使用历史菜单与本地全屏搜索弹层，不再提供 `historyPopup`。
- `readPretty?: boolean` 独立于 `readonly`、`disabled`；字段 > FormItem > Form 继承，显式 `false` 覆盖父级。仅展示格式化值和 read 插槽，不挂载编辑器或请求搜索。
- Cedar 的 click/dblclick 使用 Teleport 固定定位覆盖字段原位并复用原控件，保留占位，可扩宽但不得超出视口；Enter/F2 也能进入。没有模态遮罩或 presentation=popover/dialog；悬浮/聚焦显示编辑图标及单击/双击提示，点击图标可直接编辑。
- Maple popup 点击值区域进入，左侧默认“请输入/请选择”、右侧关闭，底部确认；inline 保留直接编辑。
- inline 即时更新；其他编辑方式隔离草稿。候选校验通过后调用 beforeCommit，成功只写回一次；拒绝/失败保留草稿。异步期间禁用编辑、确认和取消；重置、外部替换或状态变化取消事务并作废迟到结果。
- 日期、时间在宿主事务中禁用内层确认并即时更新草稿，只有外层保存；独立面板 API 和操作区不变。

### Cedar 原位编辑离开与切换（2026-10-22）

- 点击外部、Tab 离开或切换字段时先保存；保存失败保留当前草稿和错误，阻止打开新编辑器。同文档内跨 Form、独立字段共用单编辑器约束。
- 原生面板打开时 Enter 选值，Esc 仅关闭最上层面板并恢复控件焦点、保留字段草稿；面板关闭后 Enter 保存、Esc 取消。多行 Enter 换行，Ctrl/Cmd+Enter 保存，IME 组合输入不提交。
- 字段自身传送到 body 的下拉/日期/时间面板属于内部区域；校验失败后收起候选面板，避免遮挡错误。外部保存成功不抢回焦点。
- 异步保存复用同一等待结果，期间不能重复确认、取消或打开另一编辑器。重置立即终止保存及等待中的切换，即使业务任务不响应 AbortSignal，也不阻塞后续编辑，迟到结果不写回。

## 共享字段加载

带 FieldDecorator 外壳的字段复用 fieldLoadingProps：loading 表示等待状态，loadingMode 取 default/line，默认 default。默认指示器和底部不定进度线只在 FieldDecorator 渲染；Input/SelectionField/PickerField 负责传入状态并将 aria-busy 关联到原生控件。远程选择器合并自身请求状态后传入，不能再同时绘制尾部 spinner。line 模式保留箭头/搜索图标及原有交互，不让图标跟随旧 spinner class 旋转。

加载展示不隐式改变 disabled/readonly；原有组件对异步操作的业务门控仍按各自契约执行。纯阅读展示和独立面板不因声明字段 loading 就自动套用编辑外壳。Switch、Checkbox、Radio 不套用文本字段的线形布局。

## 按需接入加载（2026-10-30 修订）

fieldPresentationProps 不声明 loading。带输入外壳的字段按需复用 FieldDecorator 的 fieldLoadingProps，不能给所有表单控件统一追加转圈。Checkbox/CheckboxGroup、Radio/RadioGroup、Slider、Rate、VerificationCode、Color、Transfer、Upload 不提供整组件 loading；Scheduler 不提供外部 loading 属性或 loading 插槽，数据加载占位由业务在外层组合 Loading，需要禁止修改时显式设置 readonly。Switch 保留原有开关指示器，Upload 保留文件进度和明确 before 钩子的汇总等待。Message 的 loading 是现有消息类型，不是布尔 loading 属性。

beforeCommit 的确认等待继续由字段提交会话管理，输入框/选择框将 pending 合并到原有指示器，其他字段在编辑面板确认按钮展示等待；不会因此将直接编辑的 change 改为可等待任务。

纯阅读模式不主动触发异步任务；支持 loading 的字段在业务显式传入时仍展示共享反馈，不挂载编辑器。
