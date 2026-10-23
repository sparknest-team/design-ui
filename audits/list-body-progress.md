# List 主体收口

## 本批交付

- Cedar 主体完善后，List/ListItem 使用独立复制 SFC 同源至 Maple；没有跨库运行时引用或 platform 配置。
- Maple 补齐 maxHeight、scrollbar（原生/自定义）、virtualListProps、scroll 与 scrollIntoView。虚拟化使用各库已有 VirtualList，不在 List 复制滚动算法。
- 保留 default 优先级、data/item、header/footer/empty、loading、ListItem prefix/default/suffix；两端统一 list/listitem 语义与 aria-busy。Cedar 保留 ConfigProvider 的 list 空态插槽；Maple 使用现有 Empty/全局语言系统。
- size 仅 sm/md/lg，文档明确不支持 xs/xl。InfiniteScroll 保持独立组合，不向 List 塞回分页请求状态机。
- BEM 和样式规则统一；34项公共 Token 后缀一致，平台背景、字重、密度默认值独立。Maple旧header/footer/item shorthand与item-gap直接迁移到标准字段，无兼容别名。
- appearance 在组件根消费公开 Token，支持 StyleProvider 局部覆盖；嵌套列表通过各根变量隔离 size/split，不受父列表污染。
- Maple dark/list.ts 清除重复的几何/语义颜色覆盖（无真实暗色例外），主题快照预期移除旧 List 覆盖键。
- 两端既有 VirtualList 基础一起修复 top/bottom/auto、无效key/index、连续定位的nextTick竞态、数据缩小后窗口越界、threshold全部渲染时索引与padding错误。

## 允许差异

render-adapter.ts 仅接本地 Scrollbar（Cedar公开组件、Maple已存在内部组件）和 Cedar ConfigProvider 空插槽；token.less 保留平台默认值；index安装协议保持各库原生。主体、Props、ListItem、appearance/规则、成对Demo与测试均由门禁检查。

## 验证

- Cedar List 26项 + Select依赖回归26项，共52项通过。
- Maple List 19项通过。
- 两端 List + VirtualList.vue 定向 ESLint通过（Maple附dark/list.ts）。
- node design-ui/bin/list-body-check.mjs：9对源码/类型/样式/测试/Demo、34个Token后缀以及两端Less编译通过。
- 新增每端2组Demo（普通容器/虚拟定位），Maple有独立英文文件；中英文API、Token完整记录。
- 整库类型、构建、菜单元数据和主题快照由主批次集成；尚未完成真实浏览器视觉验收，不以单测替代视觉检查。

可标记逻辑同源；默认密度/本地渲染适配差异必须登记，不宣称整目录字节一致。

最新批次集成与剩余清单以[第二批记录](./priority-batch-2-2026-10-09.md)为准。组件级“待集成”或“建议逻辑同源”为交付时快照，公共 Token 与适配边界复核后，按现有定义将本批组件登记为同源，不表示整目录逐字节一致。
