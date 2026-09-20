# API 设计

## status 与 variant

`status` 表示组件状态，包括语义意图和业务过程状态；各组件导出自己的适用集合。`variant` 表示同一组件的视觉方案，例如 `filled`、`outline`、`text`。两者正交，但不要求所有组件都提供。

| 组件类型                    | status                                    | variant                      |
| --------------------------- | ----------------------------------------- | ---------------------------- |
| Button、Tag、Alert、Badge   | 通常需要                                  | 通常需要                     |
| Input、Select、DatePicker   | 校验状态由 Form 管理；不要随意暴露 status | 有明确外观方案时提供         |
| Progress、Result、Steps     | 表达结果/阶段时提供                       | 有不同呈现方案时提供         |
| Layout、Space、Grid、Portal | 不提供                                    | 不提供                       |
| Dialog、Drawer             | 通常不提供                                | 仅设计系统确有外观方案时提供 |

Tooltip 使用 default/primary/info/success/warning/danger 表示面板主题意图。

新增 `status`/`variant` 前必须有设计稿、Token、文档和测试。禁止为了“API 看起来统一”加入没有视觉或行为效果的属性。

共享语义状态统一为：`default | primary | secondary | info | success | warning | danger | tertiary`。组件只能选择适用子集，不得用 `error` 与 `danger` 表达同一语义。

流程状态仍使用 `status`，如 Steps 的 `wait | process | finish | error`；其中 error 表示流程失败，不是 danger 主题色的别名。无需为了主题色集合重命名状态属性。将来若改进流程枚举的措辞，必须同时迁移两端父子组件、状态推导和示例。

描边变体的公共拼写统一为 `outline`；`outlined` 在逐批迁移中删除。Card 目标集合为 `default | outline | tonal`。不把描述不同外观的 standard、filled、tonal 机械合并。

Badge 默认 `status='danger'`，实心变体为红色背景、白色文字；显式 `status='default'` 为中性色。`outline` 使用透明背景和状态色描边。

## orientation 与 direction

`orientation` 表示组件整体朝向；`direction` 表示内部排列或运动方向。例如 Card 封面与正文采用 direction: row/column，Carousel 的滑动采用 direction。迁移必须根据行为归类，不能批量替换所有同名字段。

## AutoComplete 展开与过滤

两端统一 `shouldOpen(inputValue)` 和 `filterOption(inputValue, option)`。前者决定是否允许打开，后者决定哪些选项显示。filterOption=false 表示不进行本地过滤，可用于远程搜索；shouldOpen=false 禁止打开。禁用、只读或无可展示选项时不打开。二者必须同名同义，不用 getShow 表示展开条件，也不把展开条件当成选项过滤回调。

## placement 与 position

二者不是全局同义词：

- `placement`：浮层相对锚点/触发器的首选方位，适用于 Tooltip、Popover、Menu、Picker popup；它通常参与碰撞检测，最终渲染方位可能发生 flip/shift，值通常是 `top-start`、`bottom`、`left`。
- `position`：元素在自身布局上下文、屏幕区域或坐标系中的固定位置，适用于 Badge 角落、Notification/Message 屏幕区域、Timeline 图标位置和拖拽坐标；它不暗示浮层碰撞算法。
- Drawer 虽然没有外部锚点，但描述从容器哪一侧进入，沿用生态通行的 `placement`。
- Badge 保留 `position`。其徽标是宿主盒子内部的绝对定位元素，不是锚点浮层。两端公共集合为四角及 `left/right` 两个中点，表示物理方位；RTL 不反转这些方位。
- 内部布局算法可使用 `position` 局部变量，不属于公开 API。

同一组件不得以两个属性表达同一方位。正式发布前直接迁移并删除旧名称，不保留 alias；正式发布后按版本规范提供弃用周期。

对标说明：Element Plus、Arco Design Vue、Naive UI 的 Badge 固定默认角落，只提供 `offset`；Vuetify Badge 使用 `location`。生态并不存在 Badge 必须使用 `placement` 的共识，因此本规范按是否存在“锚点浮层定位算法”区分，而不是按英文近义词机械统一。
