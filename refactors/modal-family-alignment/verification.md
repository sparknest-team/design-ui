# 模态组件族验证记录

## 2026-09-21：Overlay

已通过：

- Cedar Overlay：5 项目标测试；
- Maple Overlay：8 项目标测试；
- 两端 popup-layer/scroll-lock 基础契约各 14 项；Cedar Trigger 联动回归合计 60 项；
- Cedar 与 Maple 全量类型检查；
- 两端 Overlay 与 popup-layer 定向 lint；
- Overlay SFC、Props、结构样式同源门禁；
- 两端公共主题 token 契约检查（含 `overlay-content-z-index`）；
- Cedar `build:lib` 与 `build:doc`；
- Maple UI 包 `build:lib`、Demo SFC 检查与 `build:doc`。

Maple 根级 `build:lib` 在 UI 构建前被既有 icons `generate:check` 阻断：共享图标源报告大量生成文件过期。本次没有重写图标生成物；随后直接运行 Maple UI 包构建并通过，证明 Overlay 的发布编译、类型产物和模块产物正常。

Maple 文档构建仍输出既有的跨 chunk 循环导出与大 chunk 警告，但构建成功；没有 Overlay 新增错误。

联动测试曾发现 Cedar Trigger 仍使用旧 1000 层级管理器，而新 Overlay 使用统一 2000 分配器，导致父 Overlay 错误高于子 Trigger。Cedar Trigger 已在不改变公开 API 的前提下改用本地 `useZIndex + usePopupLayer`，完整 Trigger 回归通过。

## 2026-09-21：Drawer / Popup

- 两端分别新增并保存相同的 `modal-surface.ts`，统一受控/非受控状态、卸载策略、Teleport/KeepAlive、容器解析、层级、焦点、锁滚动、遮罩 pointer 序列、ESC、显式路由关闭和四段生命周期；已加入 foundation 同源门禁。
- Maple Popup 直接迁移到最终 API：`placement`、`unstyled`、`safeAreaInsetTop/Bottom`、`defaultOpen`、`unmountOnClose`、`closeOnRouteChange`；删除 `position`、`defaultStyle`、`safeArea`、`safeAreaTop` 和 `route-change` 事件，不保留兼容 alias。
- Cedar Drawer 统一 `cancelButtonText` 与 `beforeClose(action, done, refs)`，补齐双按钮 loading/disabled、`drawerClass`、`lockScroll`、`closeOnRouteChange`、`zIndex` 和 `key-escape`。确认、取消、关闭三种 action 不再混用。
- Cedar Drawer 2 项、Maple Popup 15 项目标测试通过；Maple Dialog、ActionSheet、Picker 核心链 52 项通过。日期/时间、Select、Cascader、Upload、NumberKeyboard、Result、Search 与 InputNumber 等扩展调用链也已回归；预期 DOM 快照更新和既有发布类型阻塞修复后，相关测试组全部通过。
- 两端 `modal-surface.ts` 字节一致，67 份基础源码同源门禁通过；两库 `git diff --check`、目标 lint、Cedar/Maple 类型检查通过。
- Cedar 与 Maple UI `build:lib`、两端 `build:doc`、780 个 Maple Demo SFC 检查、ES/CJS 模态组件 SSR/no-DOM 产物检查均通过。Maple 文档仍输出既有 Rollup 跨 chunk 循环导出警告，但构建成功。
- Dialog 阶段已在下节完成；下一步进入 Message。

## 2026-09-21：Dialog

- Cedar 与 Maple Dialog 都已直接消费各自本地的同源 `modal-surface.ts`；Maple 不再嵌套 Popup，Cedar 删除旧的 popup manager、overflow、全局键盘和端侧 open 状态机。
- 两端分别保存字节级一致的 `use-dialog.ts`、`use-dialog-drag.ts` 与 `service.ts`，统一异步 `beforeClose` 请求失效、按钮临时状态、Pointer 拖拽清理、Promise 动作、动态更新、默认配置、宿主销毁和 app context；三份文件进入同源门禁。
- `closeOnRouteChange` 统一为显式 Prop，默认 `false`；路由、遮罩、ESC 和关闭按钮均使用 `close` action，确认/取消只在关闭提交后发出。
- Cedar 19 项、Maple 32 项 Dialog 目标测试通过，覆盖旧异步完成失效、路由关闭、组件式与函数式调用、SSR、焦点与 Button Props；两端类型检查和 70 对独立源码同源门禁通过。
- 最终分类为“逻辑已同源”：控制与服务核心同源，PC/移动端 DOM、图标、布局 token 和视觉样式保留端侧实现。
- Cedar `build:lib`、`build:doc`，Maple UI 包 `build:lib`、780 个 Demo SFC 检查与 `build:doc` 通过；Maple 根 `build:lib` 仍被本阶段前已存在的图标生成物过期检查拦截，未在 Dialog 改造中批量重写图标。
- 目标 lint、三仓 `git diff --check`、审计同步检查及发布产物 no-DOM/SSR 检查通过。Maple 当前只发布聚合 ESM 文件，组件级 no-DOM SSR 检查使用其 CommonJS 分组件产物，另检查聚合 ESM 产物存在。
