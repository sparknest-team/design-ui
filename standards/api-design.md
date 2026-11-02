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

## 方位、位置、排列与操作轴命名

本节是 Cedar、Maple 和 AI 新增 / 调整组件 API 的共同约定。按语义选择属性，不要求一个值域只能对应一个属性名。不得通过 CSS 的 absolute / relative / fixed 判断应叫 position 还是 placement。

| 属性 | 适用语义 | 典型值 |
| --- | --- | --- |
| orientation | 轨道、导航、选项排列或流程的横纵轴向 | horizontal / vertical |
| direction | 内容排列顺序或具有明确组件语义的运动方向；不能替代 horizontal/vertical 轴向 | row / column / row-reverse / column-reverse；特定运动方向另行登记 |
| axis | 允许操作的坐标轴 | x / y / xy |
| position | 元素自身在所属区域、屏幕或坐标系中的位置 | bottom-right、top、坐标对象 |
| placement | 浮层 / 面板的放置方位，或内容相对另一个元素的方位 | top / right / bottom / left，可带 -start / -end |
| xxxPosition | 指明对象在所属区域中的位置 | indicatorPosition、expandIconPosition |
| xxxPlacement | 指明内容相对节点或另一元素的方位 | contentPlacement |

placement 不要求存在外部锚点，也不承诺碰撞检测或自动翻转；Drawer / Popup 以容器边缘为参照，继续使用 placement。position 同样不承诺某一种 CSS 定位实现。对边界情况优先保留清晰的既有 API，不按英文近义词批量重命名。

新 API 的值域和类型约束：

- orientation 只表示 horizontal / vertical；两端基础类型使用 Orientation / orientations。
- axis 使用 x / y / xy。Space.direction 仅实现 row/column；Card.direction 仅实现 row/column/row-reverse，不为形式统一添加尚未实现的值。
- 四边统一 top / right / bottom / left；start / end 表示沿边对齐或逻辑起止，必须说明具体参照轴和 RTL 行为。当前 Trigger 的几何计算没有读取 RTL：top/bottom 的 start/end 对应物理左/右，left/right 的 start/end 对应物理上/下，不承诺自动镜像。Badge.inlinePosition 等真正逻辑起止按各自布局语义说明。
- 角落统一“先上下、后左右”的 kebab-case：top-left / top-right / bottom-left / bottom-right。Fab 与 Notification 已统一；禁止在新组件继续引入反序或驼峰拼写。
- 属性与语义类型一致：placement → XxxPlacement，position → XxxPosition，axis → XxxAxis，orientation → XxxOrientation / Orientation。不要为 placement 再定义 XxxPosition 别名。
- 所有跨端变更同步源码、调用方、类型、文档、Demo 和测试。发布前迁移直接删除旧 API，不增加 alias。

### 组件最终命名与处理清单

“两端”表示 Cedar 和 Maple；本表列出当前已实施的最终 API；旧属性、旧类型别名和旧角落值不再提供兼容入口。

| 组件 / 对象 | 范围 | 最终属性 | 具体含义 | 处理 |
| --- | --- | --- | --- | --- |
| Slider | 两端 | orientation | 滑块轨道和交互的横纵轴向 | 保留 |
| Divider | 两端 | orientation | 分割线自身横纵朝向 | 保留 |
| Tabs | 两端 | orientation | 导航标签的横纵轴向 | 保留 |
| Steps | 两端 | orientation | 步骤流程的横纵轴向 | 保留 |
| Timeline | Cedar | orientation | 时间轴主线的横纵轴向 | 保留 |
| Split | Cedar | orientation | 面板排列轴向；左右面板对应竖直手柄 | 保留 |
| ProgressGroup | 两端 | orientation | 线形进度轨朝向，环形模式不使用 | 保留 |
| RadioGroup / CheckboxGroup | 两端 | orientation | 组内选项横纵排列 | 已从 direction 迁移 |
| Segmented | Cedar | orientation | 分段选项横纵排列 | 已从 direction 迁移 |
| Carousel | 两端 | orientation | 内容滑动的横纵轴向 | 已从 direction 迁移 |
| Space | 两端 | direction | 子元素的行列排列顺序 | 保留 |
| Card | 两端 | direction | 封面与正文的排列顺序 | 保留 |
| Drag | Maple | axis | 允许拖动的轴 | 已从 direction 迁移；Fab.drag 同步使用 axis |
| Fab 按钮 | Maple | position | 整个按钮在容器或屏幕中的角落 | 已统一为 top-left/top-right/bottom-left/bottom-right，默认 bottom-right |
| Fab 动作菜单 | Maple | placement | 动作菜单位于触发按钮的哪一侧 | 已改为 placement / FabPlacement，不保留旧名 |
| Trigger / Tooltip / Popover / Menu / SplitButton | 两端 | placement | 浮层相对触发元素的首选方位 | 保留；MenuPlacement 类型已统一 |
| Popconfirm | Cedar | placement | 确认浮层相对触发元素的首选方位 | 保留；已直接复用 TriggerPlacement，旧语义别名已删除 |
| Drawer | Cedar | placement | 抽屉面板从容器哪一侧出现 | 保留 |
| Popup | Maple | placement | 弹层放在容器四边或中央 | 保留 |
| Layout.Sider | Cedar | placement | 侧栏放置在布局哪一侧 | 保留 |
| NavMenuItem | Cedar | placement | 子菜单相对父菜单项的方位 | 保留 |
| Pagination 条数选择器配置 | 两端 | pageSizeProps.placement | 条数下拉面板的首选方位，默认 bottom-start，经 Select.triggerProps.placement 传给 Trigger 自动定位 | 可选受限透传，普通使用无需配置；不增加 Pagination 顶层 placement |
| Date 字段选择浮层 | 两端 | popupProps.placement | 字段内联浮层相对输入框的首选方位，默认 bottom-start，由 Trigger 自动定位 | 仅保留可选透传，不新增顶层 placement；DatePicker 独立面板没有该浮层 API |
| Steps 正文 | 两端 | contentPlacement | 正文相对步骤节点位于右侧或下方 | 保留 |
| TimelineItem 正文 | Cedar | contentPlacement | 正文相对时间轴主线和节点的方位 | 已从 position 迁移；保留 Timeline.mode 的布局规则 |
| Badge | 两端 | position / inlinePosition | 浮动徽标在宿主中的物理位置 / 内联徽标的逻辑起止位置 | 保留 |
| Message | 两端 | position | 消息在屏幕中的顶部、中央或底部区域 | 保留 |
| Notification | Cedar | position | 通知所在屏幕角落 | 保留属性；角落值已统一为 top-right 等 kebab-case |
| Carousel 指示器 | 两端 | indicatorPosition | 指示器位于轮播容器哪一边或外部 | 保留 |
| Tabs 指示器 | 两端 | indicatorPosition | 指示器位于内容侧或相反侧 | 保留 normal/reverse |
| Tabs 滚动 | 两端 | scrollPosition | 选中标签在滚动视口中的目标位置或偏移 | 保留 |
| Collapse 图标 | 两端 | expandIconPosition | 展开图标位于标题区哪一侧 | 保留 |
| Date 快捷区 | 两端 | shortcutsPosition | 快捷选项区在日期面板中的区域 | 保留 |
| Image | 两端 | footerPosition / objectPosition | 说明区位于图片内外 / 图像在盒内的 CSS 对齐位置 | 保留 |
| Form 星号 | 两端 | asteriskPosition | 必填星号位于标签逻辑起点或终点 | 保留 |
| Table 分页 | Cedar | pagePosition | 分页器在表格容器中的区域 | 保留既有值域，不把 tl/tr 等当作新组件角落规范 |
| SafeArea | Maple | edges | 哪些边需要留出安全区 | 保留，不机械改为 position/placement |
| ResizeBox | Cedar | directions | 哪些边允许调整尺寸 | 保留领域用语，不机械改为 position/placement |

Timeline.labelPosition 表示标签与正文处于 same / relative 区域，暂保留；它不是正文方位的第二个属性。事件 payload 的 sort direction、dropPosition、坐标、CSS 原生属性和内部几何函数不按本节机械改名。

### 值域统一与透传边界

统一基本方位词和拼写，不统一所有属性的完整枚举，也不为命名一致而增加未实现的能力：

| 用途 | 当前适用值域 | 说明 |
| --- | --- | --- |
| Steps.contentPlacement | right / bottom | dot 按朝向推导；navigation 固定 right |
| TimelineItem.contentPlacement | top / right / bottom / left | 仅 alternate 模式读取单项设置；竖向支持 left/right，横向支持 top/bottom |
| Trigger 及其浮层 placement | 四边 + 每边 -start/-end，共十二方位 | 首选方位；默认 autoFitPosition=true 时可能翻转和约束；与固定角落枚举不同 |
| Drawer.placement / Fab.placement | 四边 | Drawer 当前不是锚点浮层；Fab 不承诺自动翻转 |
| Popup.placement | 四边 + center | 不相对触发按钮定位 |
| Layout.Sider.placement | left / right | 只实现左右侧栏 |
| Message.position | top / center / bottom | 屏幕区域 |
| Badge.position | 四角 + left/right 中点 | 宿主物理位置，不因 RTL 反转 |
| Fab.position / Notification.position | 四角 kebab-case | 已同步类型、调用方、样式和文档，不接受旧拼写 |

下拉控件默认自动定位，placement 是可选的“偏好”，不是关闭自动避让的命令。Pagination 保留 pageSizeProps.placement 的受限覆盖，真正传给 Select.triggerProps.placement；Date 保留 popupProps.placement，底层是 Trigger（Cedar 经内部 TemporalTrigger 适配），不是 Popup / Popover。DatePicker 公开入口是独立面板；date/picker 旧目录中的遗留 placement 声明不能据此推广为现行公开 API。不得为方便统一再增加一份字段级顶层 placement。

ResizeBox.directions 描述启用调整手柄的边，默认 right，可组合四边，不是鼠标移动向量；保留已有名称。新设计 edges 更直接，但不是本次已授权的运行时 API 改名。

### 已完成的迁移

以下三类迁移已完成，类型改名与角落值改名分别处理；旧 API 已直接删除：

| 类别 | 原 API | 最终 API | 影响 |
| --- | --- | --- | --- |
| 属性名 | Maple Fab.expandDirection | Fab.placement / FabPlacement | 动作菜单侧别；不改变按钮 position |
| 属性名 | Cedar TimelineItem.position / PositionType | contentPlacement / TimelineItemContentPlacement | 正文侧别；保留父级 mode/orientation 约束 |
| 类型名 | 两端 MenuPosition | MenuPlacement | TriggerPlacement 的十二方位别名；Menu 与 SplitButton 文档同步 |
| 类型/常量别名 | 两端旧 TriggerPosition / TRIGGER_POSITIONS（原 Cedar Popconfirm、NavMenu 调用） | TriggerPlacement / triggerPlacements | 删除旧语义别名；Trigger、Tooltip、Popover 当前已经用最终类型 |
| 值域拼写 | Maple Fab.position 的 left-top/right-top/left-bottom/right-bottom | top-left/top-right/bottom-left/bottom-right | 只改角落拼写，语义不变 |
| 值域拼写 | Cedar Notification.position 的 topLeft/topRight/bottomLeft/bottomRight | top-left/top-right/bottom-left/bottom-right | 同步命令式配置、类型、文档、调用方 |

### API 描述要求

相关 API 表和源码注释必须写明：放置的对象、参照物、当前默认值、是否自动避让、配置入口/透传链路、受 variant/type/orientation 等条件约束的行为。待迁移名称、类型或值域必须标为“待迁移”，不能把目标示例当成当前可调用 API；中英文说明同步。属性名相同不代表枚举完全一致；日期/分页默认下方与自动避让可以同时成立。

### AI 与静态校验

- AI 新增 / 调整上述语义属性前 MUST 读本节，说明参照物、含义、值域、默认值和 RTL 语义，并检查两端是否对应。
- 机器契约为 design-ui/configs/api-naming.json；新增受管属性 MUST 经评审登记 file、owner、name、meaning、values。不得仅复制现有字段绕过语义判断；不得自动生成基线掩盖新增冲突。
- 命名 lint 为 design-ui/bin/api-naming-check.mjs，通过两端 pnpm check:api-naming 运行；Cedar 的 lint、Maple 的 lint/lint:check 已接入，quality 因此执行同一检查。共享回归：design-ui 中 pnpm check:api-naming。
- 检查组件 props 对象、defineComponent.props 和内联 defineProps 的声明；拒绝未登记字段、非法默认值 / 内联类型值、orientation/axis 值域混用、placement 新增 Position 类型名、旧新属性并存以及过期登记。
- 既有待迁移属性 / 类型 / 值域必须精确登记，不形成全局旧名豁免。完成迁移后同时删除该记录的过渡字段。
- 静态检查不能判断“参照物是谁”，也不代替 TypeScript 对导入 / 继承 / 泛型值域的检查；CSS、事件载荷和下划线内部基础设施不在此声明扫描范围。类型检查、行为测试和语义评审仍必需。

## AutoComplete 展开与过滤

两端统一 `shouldOpen(inputValue)` 和 `filterOption(inputValue, option)`。前者决定是否允许打开，后者决定哪些选项显示。filterOption=false 表示不进行本地过滤，可用于远程搜索；shouldOpen=false 禁止打开。禁用、只读或无可展示选项时不打开。二者必须同名同义，不用 getShow 表示展开条件，也不把展开条件当成选项过滤回调。

## placement 与 position

二者不是全局同义词：

- `placement`：浮层、面板或内容的放置方位。Tooltip / Popover / Menu 以触发器为参照；Drawer / Popup 以容器边缘为参照；contentPlacement 以节点为参照。是否提供碰撞修正由具体组件决定。
- `position`：元素在自身布局上下文、屏幕区域或坐标系中的固定位置，适用于 Badge 角落、Notification/Message 屏幕区域、组件内区域和拖拽坐标；它不暗示浮层碰撞算法。
- Drawer 虽然没有外部锚点，但描述从容器哪一侧进入，沿用生态通行的 `placement`。
- Badge 保留 `position`。其徽标是宿主盒子内部的绝对定位元素，不是锚点浮层。两端公共集合为四角及 `left/right` 两个中点，表示物理方位；RTL 不反转这些方位。
- 内部布局算法可使用 `position` 局部变量，不属于公开 API。

同一组件不得以两个属性表达同一方位。正式发布前直接迁移并删除旧名称，不保留 alias；正式发布后按版本规范提供弃用周期。

对标说明：Element Plus、Arco Design Vue、Naive UI 的 Badge 固定默认角落，只提供 `offset`；Vuetify Badge 使用 `location`。生态并不存在 Badge 必须使用 `placement` 的共识，因此本规范按位置与放置方位的语义、组件惯例和实际行为判断，而不是按 CSS 定位方式或是否具有碰撞算法机械统一。

## Maple NavMenu 迁移

Maple 保留 NavMenu/NavMenuItem 与 Cedar 的独立筛选入口 API。mode 仅 horizontal；optionsMode 使用 horizontal/vertical。popupLayout 为 full-width/full，默认 full-width；两者都从整个筛选栏底边向下展开，不自动翻转。full 占满下方可视区域。Cedar 同步增加 full，从入口底边开始；既有 dropdown/full-width/full-height 行为和默认值保留。popupContainer 只指定挂载位置，不改变视口布局参照。

## 阅读方向 dir

`dir: ltr | rtl` 表示阅读方向，省略继承；不复用 orientation/direction。Cedar ConfigProvider 和 Maple LocaleProvider 提供作用域，原生 DOM dir 可局部覆盖。详细契约见 [reading-direction.md](./reading-direction.md)。
