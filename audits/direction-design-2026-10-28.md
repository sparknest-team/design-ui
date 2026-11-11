# Cedar 和 Maple 双向布局设计与现状

这是实现前的审查快照。最新实现和待验收范围见 [双向布局实施计划](../refactors/reading-direction-plan.md)。
这里将 LTR 特性理解为 LTR 和 RTL 双向布局。LTR 是从左向右的默认阅读方向；如果只要求中文、英文的常规 LTR 使用，两端已有默认基础。需要专项设计的是在 LTR 和 RTL 之间切换、局部混用，并保持布局、交互和弹层一致。

**可以把双向能力作为全组件库的统一目标，但当前不能宣称所有组件已经支持。** 每个视觉组件都应在双向环境下正常工作，方向无关的组件自然继承即可；水平交互组件要主动适配。代码、数字、媒体、地图和笔迹等内容需要保留自身语义，不做整体镜像。

本次为源码静态审查，覆盖公开入口涉及的 Cedar 100 个、Maple 94 个组件目录及基础设施项。子组件归入所属组件族。逐组件结果见 [能力清单](./direction-component-matrix-2026-10-28.md)，逐行线索、可提取的公开组件名及每类验收要求见 [JSON](./direction-inventory-2026-10-28.json)。没有进行双向浏览器验收，不能据此给出已支持率。

## 标准组件库的实现方式

不存在所有组件库都遵循的同一套 API；常见设计都需要解决方向状态、样式和交互的同步。

| 参考 | 实现方式 | 对我们有用的设计 |
| --- | --- | --- |
| [MUI](https://mui.com/material-ui/customization/right-to-left/) | DOM `dir`、主题 direction、RTL 样式插件配合；Portal 组件需要补方向 | 只改主题或 CSS 都不足以覆盖全链路；弹层必须单独考虑 |
| [Chakra UI](https://chakra-ui.com/guides/overview-rtl-support) | DOM `dir` 配合 LocaleProvider，将方向传给有行为逻辑的组件 | 布局与行为应消费一致的方向 |
| [Reka UI](https://reka-ui.com/docs/utilities/config-provider) | ConfigProvider 为基础组件提供 dir；[useDirection](https://reka-ui.com/docs/utilities/use-direction) 支持局部覆盖 | 用统一上下文和 composable 服务组件，无需每个组件复制一套布尔开关 |
| 本地 Naive UI 源码 | ConfigProvider 接收组件 RTL 配置，useRtl 按组件挂载 RTL 样式并接入 SSR | 旧样式较多时，可逐组件补适配层；注册和样式存在仍不能替代交互验收 |

Naive UI 的本地证据为 [ConfigProvider.ts](/Users/shuaimeng/github_web/naive-ui/src/config-provider/src/ConfigProvider.ts:137) 和 [use-rtl.ts](/Users/shuaimeng/github_web/naive-ui/src/_mixins/use-rtl.ts:12)。该项描述当前本地版本。

[W3C 的方向指南](https://www.w3.org/International/questions/qa-html-dir)建议用 HTML `dir` 表达基础阅读方向，使用逻辑 CSS 管理随方向变化的间距和对齐。内容自动识别可使用 `dir="auto"`；组件布局上下文最终仍应解析为确定的 ltr 或 rtl。

## 当前实现和明确缺口

| 组件或基础设施 | 当前实现 | 尚需完成 |
| --- | --- | --- |
| Cedar ConfigProvider | 提供响应式 rtl，默认 false；只渲染 slot | 统一 DOM 与行为方向；局部覆盖、嵌套、SSR 和弹层传播 |
| Maple 方向入口 | Badge 依赖调用者或文档的 dir；Tabs 会读 DOM；Tag 的平台 rtl 固定 false | 统一方向上下文；可评估扩展现有 LocaleProvider 或提供轻量方向作用域 |
| Tabs，两端 | 逻辑 CSS；左右键、滑动和滚动读取方向；有局部方向测试 | 验收嵌套、动态切换、滚动边界、CSS 继承及 dir=auto 的行为；不能视为全面通过 |
| Badge，两端 | inline 模式使用逻辑间距；Cedar 接配置，Maple 继承 DOM；有 dir 属性测试 | 浮动 position 本来表示物理角落，应保持；验收局部覆盖和混合文字 |
| Tag | Cedar 从配置添加 RTL 类并修正图标、关闭按钮间距；Maple 有相同样式分支，但 rtl 固定 false | Maple 接通实际方向；两端同时支持 DOM 局部作用域；方向宜由 dir 表达 |
| Divider，两端 | start/end 文本对齐和逻辑间距可随继承方向工作 | 验收各排列、插槽、边距和垂直模式；无需为其添加 rtl 布尔属性 |
| Cedar Calendar | 有 -rtl Less 样式 | 主渲染文件未找到对应 RTL 类名或状态消费，需接线并检查日期、导航语义 |
| Slider，两端 | 水平位置用 left；指针值用 clientX-rect.left；左右键增减固定 | 指针、轨道、标记、范围填充与按键统一消费方向；垂直逻辑单独保持 |
| Rate，两端 | 半星命中按星形左半边判断；右键增加，左键减少 | RTL 半星命中、图形填充与键盘同步，不能只倒转排列 |
| Carousel，两端 | 水平手势、左右键和前后箭头没有方向分支 | 页面顺序、拖动、运动、箭头与键盘按统一约定适配 |
| Trigger，两端 | top/bottom 的 start 按左对齐、end 按右对齐计算；没有方向参数 | 逻辑对齐按 dir 解析，物理 left/right 保持；修正箭头和变换原点 |
| Trigger 的外部弹层 | 支持把调用者显式 attrs 传给 popup | 来源父容器的 dir 不会自动成为 attrs；需要解析来源方向并输出到 Teleport 的实际根节点 |
| Table、Scrollbar、Tree 等 | 有物理坐标、固定列或嵌套布局 | 专项审查滚动、固定边、阴影、缩进、展开键；不能仅通过替换样式判断支持 |
| 其他组件 | 已逐目录列出方向分支、逻辑与物理 CSS、交互及测试线索 | 尚未逐一做浏览器认证；无 rtl 关键字不表示不支持，含逻辑 CSS 也不表示完整支持 |

关键源码证据：

- [Cedar ConfigProvider](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/src/config-provider/ConfigProvider.vue:1)：slot 模板及提供的 rtl 状态。
- [Tabs 左右键](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/src/tabs/TabNav.vue:98)：根据最近 dir 切换 previous/next。
- [Badge](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/src/badge/Badge.vue:30)：浮动角落明确使用物理语义。
- [Maple Tag](/Users/shuaimeng/github_web/maple-design-mobile/packages/ui/src/tag/platform.ts:6)：rtl 固定 false。
- [Slider 位置](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/src/slider/Slider.vue:118)、[指针](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/src/slider/Slider.vue:209)、[按键](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/src/slider/Slider.vue:302)。
- [Rate 半星命中](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/src/rate/rate-core.tsx:150)、[按键](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/src/rate/rate-core.tsx:175)。
- [Carousel 按键](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/src/carousel/carousel.vue:340)。
- [Trigger 对齐计算](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/src/trigger/geometry.ts:45)、[弹层 attrs](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/src/trigger/trigger.tsx:122)。

## 建议采用的统一设计

公共方向语义采用 `dir: 'ltr' | 'rtl'`，未指定时继承。保留 HTML 对内容使用 `auto` 的能力，但不要把 auto 当成第三种布局算法。现有标准中 direction 已表示排列或运动方向，因此不要复用 direction 作为阅读方向，见 [API 设计](/Users/shuaimeng/github_web/design-ui/standards/api-design.md:27)。

方向状态与实际 DOM 要由同一作用域解析。组件显式 dir 覆盖继承值，嵌套作用域可切回 LTR；两端提供一致的 useDirection 类内部接口，输出确定的 dir 和 isRtl。Cedar 可用现有 ConfigProvider 承载，Maple 可用轻量作用域或扩展现有 Provider，公共使用约定保持一致。具体 API 改造需按仓库的规范流程收敛，不在本次审查中改动生产代码。

对外部原生容器 dir 的支持也应写入契约：不能出现 CSS 从最近 DOM 继承 RTL，而 JS 继续使用远处 Provider 的 LTR。可让方向作用域同时提供上下文与真实 dir，并在接入原生 DOM 时统一解析；SSR 首屏优先使用明确配置，客户端读取 DOM 的兜底需考虑动态更新和清理。

组件实现分四层：

1. **布局。** 语义间距使用 margin-inline、padding-inline、inset-inline 和 text-align:start/end；分组首尾边框、圆角和图标间距一起处理。带方向的四值 shorthand 也要复核。flex row 已受 dir 影响，避免再 row-reverse 导致二次反转。
2. **行为。** 统一水平坐标、逻辑滚动、previous/next 键映射与手势符号。Slider 的数值沿 inline 方向增长时，RTL 指针比例应从右侧起算；垂直模式不因 rtl 自动倒转。每个组件按其交互模型验收。
3. **弹层。** Trigger 和模态基础设施接收来源的 resolvedDir，写入实际弹层根节点；动态切换后更新定位。函数式 Message、Notification、Dialog 需要带应用上下文的入口或明确 dir，不能任意借用某个全局实例的状态。
4. **内容。** 返回、前进、层级箭头按语义处理；品牌、照片、媒体播放符号、地图和签名不整体翻转。混合语言可用 bdi 或合适的 unicode-bidi 隔离；电话号码、代码、验证码等按产品语义局部设 LTR，避免强制改写原始文本。

逻辑 start/end 随阅读方向变化；明确命名为 left/right 的物理方位保持其含义。例如 Badge 的 top-right 应继续是右上角，Drawer 如需“从阅读起点进入”可设计 start/end，但不能悄悄改变已有 left/right 的含义。Table 固定列、拖动坐标也必须先判断其 API 语义。

## 各类组件的验收要求

| 类别 | 必须覆盖的能力 |
| --- | --- |
| Button、Card、Alert、List、Tag 等展示组件 | 图标与文字顺序、逻辑间距、关闭按钮、分组边框与圆角、插槽 |
| Input、Textarea、Search、Form 等输入组件 | 标签、前后缀、清除按钮、校验信息、混合文字；编辑行为尽量交给原生输入 |
| Select、Cascader、Date、Time 等选择组件 | 输入区、弹层方向、列表顺序、键盘、定位；日期区域化与阅读方向分别配置 |
| Tabs、Slider、Rate、Carousel 等横向组件 | 指针、键盘、触摸、滚动、填充、指示器和动画的一致性 |
| Tooltip、Popover、Dialog、Drawer 等弹层 | Teleport、局部方向、嵌套弹层、逻辑对齐、箭头、动画、函数式上下文 |
| Table、Tree、Transfer、Scrollbar、Scheduler | 固定边、横滚、虚拟化、调整宽度、缩进、展开键和领域语义 |
| Image、Icon、Map、Signature、Code、数字展示 | 外壳可跟随方向，内容保持正确；图标仅按明确语义镜像 |
| Provider、Locale、Themes 等基础设施 | 在职责范围传递状态；无视觉输出的工具无需自行镜像 |

基础测试场景包括 LTR、RTL、LTR 内嵌 RTL、RTL 内嵌 LTR、运行时切换、SSR 与 hydration。高交互组件再覆盖鼠标、键盘、触摸、横竖模式和滚动边界；弹层覆盖默认外部容器和自定义容器。原生 dir 继承与 Provider 配置均应有场景。

现有方向相关测试源码主要出现在两端 Tabs 和 Badge。Badge 测试主要检查属性传递，不能证明视觉、动态更新或全部变体验收通过。后续以组件行为契约记录通过情况，静态扫描仅用于捕捉新增物理方向和遗漏项。

## 实施顺序

先收敛 dir 契约、作用域和两端内部方向接口，打通 Trigger、弹层与水平坐标工具；再修复 Slider、Rate、Carousel、Tag 和 Calendar 等已知缺口。随后分批检查展示与输入组件，最后专项处理 Table、Scrollbar、Tree、Transfer、Scheduler 和移动手势组件。

最终交付应是逐组件的双向行为与视觉验收记录。技术上各组件都能做到正确运行；复杂度主要集中在滚动、指针计算、虚拟列表、固定列和业务组件。全库统一能力不要求每个组件新增 rtl 属性，也不要求所有内容都反向。
