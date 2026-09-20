# Pagination API、实现取舍与窄屏验证

## 实现比较

| 维度 | Cedar 原实现 | Maple 原实现 | 最终选择 |
| --- | --- | --- | --- |
| 主体 | TSX 中混合计算页码与构造 VNode | 页码描述数组 + SFC 模板，但有重复 Options API 配置 | 以 Maple 的描述数组/模板结构为基础，改为 script setup 与独立状态 hook |
| 页码算法 | 与 Maple 基本相同 | 与 Cedar 基本相同 | 同一份算法，规范化页码边界与输入 |
| 受控与自动调整 | 两个 watcher 分别调整 pageSize 与 pages | 同样的双 watcher | 合并为一次状态决策，批量变更只发一对 current 事件，显式父级 current 优先 |
| 尺寸 | 传到选择器与跳转框，但分页 CSS 缺 xl | 分页按钮有五档，内部选择与跳转未传 size | 采用 Cedar 的尺寸传递方式，补齐五档布局及 Maple 依赖 token |
| 禁用 | 总入口阻止跳页，但省略按钮自身无禁用 | 子项禁用更完整 | 保留每层禁用防护，使用原生 button，补 ARIA 和键盘 |
| 跳转 | InputNumber 管理格式，依赖 change 时序 | Input + blur/Enter；空值变为 1，可能重入 | 两端 Input + 同一个提交规则，非法输入不跳转，Enter/blur 去重，受控值回显 |
| 条数选择 | Select，透传任意 SelectProps | Menu，但也叫 pageSizeProps | 两端 Select，公共类型 PaginationPageSizeProps，由薄适配层映射 placement |
| 样式与触控 | 桌面单行，缺窄屏策略 | 移动页码数量多时超宽 | 共用布局和按钮样式，容器 <=480px 简洁模式，按钮至少 44px，辅助控件换行 |

不存在可以无修正直接替换的整套赢家。选择 Maple 的主体组织方式、Cedar 的尺寸传递和 Select 方案，修复双方共有的状态与输入问题。两端独立拥有源文件，不运行时跨仓库引用。

## 最终 API

23 项 Props、4 个数值事件、6 个插槽；无公开方法。size 默认 md、elevation 默认 false。新增 responsive=true、compactBreakpoint=480。pageSizeProps 收敛为 disabled / placement / popupContainer / class / style。完整表见两端 Pagination 文档。

原生 button 替换不可聚焦的 li/span，提供 aria-current、图标可访问名称及 focus-visible。组件内部使用本库 Input/Select；demo 的控制项使用 RadioGroup、Switch、Button。

## Demo 与窄屏

12 组配对场景：基础双向绑定、更多页码与省略跳转、条数选择、跳转插槽、五档尺寸与阴影、简洁模式、总数插槽、完整交互、自定义按钮、禁用/隐藏、自动调整、容器响应式。原有 9 类能力保留，新增 3 个场景。

两端相同规则：280 / 360 / 480px 容器简洁分页，640px 恢复完整页码；响应式可关闭，关闭后仅页码列表内部横向滚动。简洁模式不重复显示独立 jumper，保留总数和条数选择。

## 验证

- 两端分页单测：46 项通过（含受控、非法输入、事件去重、动态布局、Observer 清理、所有插槽、尺寸、ARIA）。
- 两端 SSR：2 项通过，无浏览器全局依赖。
- 所有已配对 demo：156 项挂载及交互测试通过，Pagination 24 个 demo 均无 Vue 警告。
- 文档门禁：76 对 demo、18 个真实 Markdown 转换、9 套完整 API 表通过。
- Pagination 的 13 个主体/逻辑/样式/测试副本通过规范化比较；全库检查当时另有 Breadcrumb 副本漂移，不属于此修改。
- Cedar 类型检查通过；Maple 检查没有 Pagination 错误，但依赖 Checkbox、Picker、Select 已有 emit 回调类型不匹配使整体检查失败。
- 两端 ESM/CJS 组件构建、Node ESM 产物导入及包含两端真实 demo 的生产预览构建通过。
- 独立浏览器预览：两端 280 / 360 / 480 / 640px 均 scrollWidth == clientWidth；简洁按钮 44×44；条数 10→20、当前页 5→3 一致；Enter/Space 翻页到 2，输入 9 后均跳至 9。

常规文档站受到其它组件热更新错误影响，本轮浏览器验收使用独立预览，直接引用同一批组件和 demo 源码。

## 迁移

本轮按尚未发布的同源批次进行 major 迁移。旧任意 pageSizeProps 透传、旧 CSS 结构/token、Maple 默认阴影、Cedar 隐式全局尺寸继承和默认宽屏布局均在两库 API-MIGRATION.md 记录。

## Less 3 编译修正

初轮独立预览使用 Less 4.6.7，未覆盖 Maple CLI 的 Less 3.13.1。后续修正两端 implementation.less 以及 Maple platform.less 中的 max(var(...))，转义为原生 CSS 表达式。已分别使用实际安装的 Less 3.13.1、4.6.7 编译两端完整 Pagination 样式入口，四项均通过且产物保留原生 max()；两端主体样式规范化一致。

## Standard 控件紧凑化

按用户最终选择，两端 Input/Select 使用 standard。参考本地 varlet/packages/varlet-ui/src/pagination/pagination.less 的 32px 输入宽度和无横向留白；条数选择器采用内容自适应宽度。两端输入框实测均为 32px，默认中文条数选择器 Cedar 约 67px、Maple 约 78px（原 140px），280px 容器内单行文字完整显示。保留触控高度及宽度 token 自定义。Less 3 编译通过。

## 简洁模式翻页按钮尺寸

按用户反馈移除 compact 模式对按钮的 44px 强制最小尺寸。上一页/下一页现在始终跟随 size，默认 md 实测两端均 36×36px；浏览器点击下一页后两端输入值均从 1 更新为 2。输入与条数控件的高度规则不变。
