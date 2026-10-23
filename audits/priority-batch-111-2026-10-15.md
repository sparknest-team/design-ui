# 第一百一十一批：两端 Tooltip 键盘、关闭清理与触发方式

复用 Cedar 4185、Maple 8080 源码开发站。核对最新批次与脏仓库，不修改并行 Token/NavMenu 工作；本批不是生产构建验收。

## 浏览器实际交互

- Cedar `/components/tooltip/?audit=111-source` 基础示例：第一个按钮按 Space，出现唯一 `role=tooltip`，内容为 This is tooltip content，按钮 `aria-describedby=c-tooltip-v-0`；按 Escape 后内容卸载、关联属性清除。随后 Tab 到第二个按钮，显示对应两行提示；Shift+Tab 回到第一个按钮，恢复第一条内容，第二个按钮的关联属性清除，没有残留两个提示。[Cedar 键盘切换证据](./evidence/cedar-tooltip-batch111.png)。
- Maple `#/zh-CN/tooltip?audit=111-source` 中间基本使用按钮按 Space，显示 Tooltip 并关联 `mp-tooltip-v-0`；Escape 后内容与描述关联均清除。移开焦点后再次 Space 可以重新展开，再 Tab 离开后卸载。
- Maple 点击模式“触发方式”按钮，第一次点击展开、第二次关闭；禁用提示按钮按 Space 不产生 tooltip 或 aria-describedby。
- Maple 注册事件按钮按 Space 显示 Tooltip 和 open 消息；Escape 后实际观察到 open、opened、close 消息。没有及时捕获 closed 消息，因此不将完整四事件次序计为浏览器验收通过。[Maple 事件示例证据](./evidence/maple-tooltip-batch111.png)。

只读取可见 DOM、ARIA 与焦点，不读取 Vue 内部状态。中间示例与右侧实例分开计数，本批未操作 Maple 右侧实例。一次尝试从“内容插槽”Shift+Tab 并未回到基础按钮，未算通过；后续通过明确键盘聚焦、展开、Tab 离开完成核对。

## 验证与同步

- Cedar Tooltip 3 文件 19 项、Maple 3 文件 21 项专项测试通过，共 40 项；测试包含 Popover wrapper 的共用契约，不冒充其浏览器验收。
- 两端浏览器本批未捕获 error 级日志。未发现需要修复的新缺陷，无源码、API、样式或 Demo 变更；现有中文及 Maple 英文文档已描述 focus/hover 默认触发、禁用与 aria-describedby 关联。
- 主验收表新增 Tooltip 证据，菜单/调研分类仍为 72 族：56 已同源、15 逻辑已同源、1 独立，不将菜单“已同源”改为“全部交互通过”。两仓及审计仓库 diff 空白检查、分类同步检查通过。
- 无源码变化，未重跑类型、lint、完整文档构建。第107批完整构建阻塞尚无本批新构建结果，不宣称已解除。
- 独立部分交互证据增至 40/72（55.6%），双端部分记录 36/72（50.0%），尚无独立族级记录 32/72（44.4%）。这不是所有配置、Demo 或场景完成率。
- 仍待覆盖：真实鼠标 hover 延迟及边缘切换、触屏、外部 reference 替换/卸载、受控拒绝、多种容器与定位、Maple 右侧实例，以及完整生命周期消息次序。未提交、推送或发布。
