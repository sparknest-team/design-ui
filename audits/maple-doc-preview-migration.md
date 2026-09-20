# Maple 文档预览迁移状态

更新日期：2026-09-17

## 当前覆盖

- Maple 共有 196 份组件中英文文档。
- 186 份文档存在组件级 `example/index.vue`，已由 Markdown 适配器自动生成中间预览和源码入口。
- 85 个组件均在中英文文档中显式使用 `demo` 文件引用块，共 1158 个引用；中间按场景生成独立卡片，右侧仍使用 `example/index.vue` 集合页。
- 当前 85 个组件共维护 662 个独立 Demo 文件，其中 83 个是需要单独英文展示文案的 `en-US` 版本。普通示例按标题切分；多个控件共同驱动同一预览、共享异步流程或必须整体呈现的示例保留为一个完整交互 Demo。
- 余下 8 个拥有示例入口的页面均为 CSS、主题、排版或工具规范：Atomic CSS、Atomic Usage、Color、Palette、Style、Themes、Typography、Utilities。它们不是组件页，不强制套用组件 Demo 切分协议。
- 10 份未生成预览的文档对应 5 个没有示例入口的底层能力：FormDetails、HighlighterProvider、Locale、LocaleProvider、Trigger。

## 同步结论

新预览的运行内容和源码面板由同一引用文件生成，修改该文件会进入 Vite 依赖图并触发 HMR，生产构建也会直接导入该文件。这一链路不存在“预览改了、源码面板没改”的手写副本。

组件页均已生成可运行的逐案例 Demo。Breadcrumb、Cascader、Code、Date、DateRange、FloatingPanel、Form、Input、NoticeBar、NumberKeyboard、ProgressGroup、PullRefresh、Search、Skeleton、Space、Steps、Time、VerificationCode 已启用“单源文档”约束，Markdown 不再复制可运行组件案例。其余页面保留的 `html` / `vue` 代码块属于 API 配置说明、平台差异或尚未拆分的组合说明，不参与实时预览；CSS、主题、排版和工具规范页继续采用说明页结构，不计入组件迁移完成率。

迁移脚本现在优先以稳定的 Demo 文件引用匹配章节；没有引用时再使用入口中的直接中英文标题匹配。中文标题不再经过会丢失非 ASCII 内容的 slug 作为唯一依据，任何未匹配 Demo 都会直接报错，不允许静默追加到文档末尾。85 个组件的中英文映射已全部通过该规则审计。

## 验证

- Demo SFC 检查：774 个 Example/Demo SFC，0 failures。检查同时覆盖中英文文档的重复引用、遗漏 Demo、失效引用、重复的顶层 `API` 章节、独立 Demo 错误引入组件 example locale、入口重复维护标题 locale、入口漏导入 `AppType`，以及 Demo 脚本末尾残留自由代码块等问题。
- 已对全部 93 个中英文文档路由分别逐页运行审计，共打开 186 个页面；每页均成功生成内容与至少一个实时预览，浏览器控制台没有组件解析失败、预转换错误或未处理异常。List、ProgressGroup 右侧入口漏导入 `AppType` 的问题已修复并加入自动检查。
- Fab 已由单个混合案例拆分为 10 个独立运行案例，中间卡片和右侧移动端集合保持一致；浮层工具对已解析 HTMLElement 目标改为立即挂载，字符串选择器仍在 mounted 后解析。
- Code、Drag、IndexBar 的容器化回归已修复：Code 不再覆盖 Shiki 的主题背景，文档也已明确 Shiki 是可替换的可选依赖，安装方式使用普通 Markdown 说明而非 Demo/代码预览；Drag 在 `popup-container=false` 时改为相对定位父元素就地渲染并按父容器计算边界，6 组示例各自使用独立拖拽区域；IndexBar 的索引列表增加定位包装层，中间示例改为卡片内滚动和容器内粘滞，不再漂移到页面侧栏或浏览器最右侧。
- 独立 Demo 的展示文案已与组件 Locale 解耦：Demo SFC 不再从 `example/locale` 引入翻译状态；全部 93 个 `example/index.vue` 入口也不再调用 `t()`、`createDemoMessages()` 或维护单独的标题 locale，而是监听站点语言并直接选择中英文标题。组件自身的 Locale API 只服务组件内置文案。Input、Search、Date、DateRange、Time、Space 等需要不同展示文案的页面分别引用中英文 Demo 文件，右侧集合随站点语言选择对应版本。
- Link 中间预览的 `tertiary` 等状态曾被 `.maple-site-doc a` 的高权重文档链接样式覆盖；文档排版规则现已排除 `.loca-doc-preview__example` 内链接。中间与右侧均计算为 `rgb(171, 171, 172)`，状态类和 token 一致生效。
- SwipeCell 已从一个混合案例拆为“基本使用 / 左右两侧 / 关闭前确认”3 张独立卡片，并同步右侧集合。Form / FormItem 已整理为“基础表单 / 表单控制 / 表单事件 / 外置标签 / 左右布局 / 浮动占位 / 帮助信息 / 自定义控件”8 张单源卡片，中英文各自维护直接文案，右侧集合复用同一批文件；旧静态源码、旧 FormItem 聚合副本和 example locale 副本已删除。Breadcrumb 已移除位于实时 Demo 之前的旧静态源码区，9 个示例直接归入对应章节，中英文结构同步；Breadcrumb、Form、Select 及其余子组件文档的重复顶层 `API` 已改为组件内嵌 API 层级。
- Demo 目录已启用 ESLint `no-undef`，用于在构建前拦截普通 JavaScript SFC 中 `timer`、`open`、跨 Demo ref 等未定义变量；本轮涉及的全部入口、迁移脚本及新增中英文 Demo 已通过 ESLint，Vue 类型检查通过。
- Markdown 全量转换审计：196 份文档中 186 份生成预览；170 份组件文档已逐案例分组，16 份非组件说明文档保留页面结构，剩余 10 份均没有 `example/index.vue`。
- Maple `pnpm build:doc` 通过（3699 modules transformed），独立 Demo、集合预览与源码面板均进入生产构建。
- Cedar `pnpm build:doc` 通过，共享预览背景与原有预览插件样式均可正常编译。
