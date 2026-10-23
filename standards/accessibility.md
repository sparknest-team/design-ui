# 可访问性

目标为 WCAG 2.2 AA，并参考 WAI-ARIA Authoring Practices。

- 原生语义优先；非原生交互必须补齐 role、键盘行为和状态。
- 所有操作均可仅用键盘完成，使用 `:focus-visible` 提供可见焦点。
- 纯图标按钮必须有 accessible name；装饰图标使用 `aria-hidden="true"`。
- `disabled` 阻止交互；`loading` 暴露 `aria-busy` 并防止重复提交。
- 错误不得只靠颜色表达；动画尊重 `prefers-reduced-motion`。
- 输入字段通过各变体已有的边框、底线或背景表达聚焦状态，不额外绘制外圈 outline；内部操作按钮保留自身键盘焦点指示。
- Date/Time 的原生 combobox 在展开时通过稳定的 `aria-controls` 关联实际命名弹层；关闭后同步 `aria-expanded`，不保留指向已卸载弹层的关联。`aria-describedby` 等业务说明属性必须到达原生控件。
- Dialog/Drawer 管理初始焦点、焦点循环、Esc 和关闭后的焦点恢复。
- Tooltip/Popover 通过 `aria-describedby`/`aria-controls` 与触发器关联。
- Tabs、Menu、Select、Checkbox、Radio、Switch 遵循对应 APG 键盘模型。

每个公开交互组件至少包含一组键盘测试、一组关键 ARIA 断言，并在文档中写明键盘操作。CI 使用 axe 自动检查常见错误，但 axe 不能替代行为测试和人工审查。
