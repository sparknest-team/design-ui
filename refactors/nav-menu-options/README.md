# Cedar NavMenu options 重构

2026-09-09，按用户明确授权进行破坏性重构。保留横向模式及更多收纳，移除 Item/SubMenu/ItemGroup 组合 API，统一由 options 描述结构。VNode/渲染函数/作用域插槽只负责节点内容。

实现参考本地 Naive UI 2.44.1 的数据树与祖先路径设计；运行时仍完全使用 Cedar 的 Trigger、Tooltip 与观察器。选择采用 modelValue/defaultValue，展开采用 expandedKeys/defaultExpandedKeys。公开类型、resolver、组件注册与所有旧 demo 均已迁移。

原先基于挂载收集数据的 hooks、独立子组件和旧样式已删除。新实现主要为 menu.tsx、node.tsx、tree.ts、props.ts、types.ts；不存在旧组件兼容分支。折叠提示通过 Tooltip content 插槽保留 VNode，横向缩窄时可将焦点迁移至更多入口，分组不打断祖先键盘导航。

完整 API 与迁移表见 cedar-design-web/packages/cedar-ui/src/nav-menu/README.md。验证记录见 verification.json；浏览器 fixture 为 design-ui/refactors/foundation-alignment/browser/nav-menu.html，发布入口检查为 design-ui/bin/nav-menu-runtime-check.mjs。

验收：全库 706/706；最终 NavMenu 19/19（与全库重叠）；resolver 20/20；浏览器 7/7；最终 UI 构建、声明、发布类型契约及 ESM/CJS SSR 通过。

## 独立一级 Item 扩展

新增 `NavMenu.Item` / `CNavMenuItem`，支持独立 options、受控 value/open/active、固定或跟随选中的标题、自定义内容插槽。普通下拉、通栏和右侧全高面板复用 Trigger。含默认插槽的导航采用横向滚动，纯 options 继续支持更多收纳。

验证：Cedar 全库 715 项，NavMenu 27 项，resolver 20 项；浏览器原导航 7 项、新入口尺寸与选择 3 项。浏览器入口 `foundation-alignment/browser/nav-menu-item.html`。
