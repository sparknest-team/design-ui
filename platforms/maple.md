# Maple 平台覆盖规则

- 移动端 Vue 3 组件库，组件前缀 `Mp`、类名前缀 `mp-`、Token 前缀 `--mp-`。
- 文档为 `docs/zh-CN.md`，示例在 `example/`，样式为组件目录下单一 Less 文件。
- 触控目标、Pointer/Touch 取消、safe-area、软键盘和横竖屏属于移动端必测项。
- 移动端特有手势和导航组件可以不在 Cedar 出现。

- Form 默认 layout=vertical；标签/内容栅格及自动宽度 API 与另一端同义，按 FormItem 实际布局生效。

- Date/DateRange 允许手输时，输入与日历按钮分别管理软键盘和 Popup 触发。日期按钮的 input-trigger-padding/outline-width/outline-color/outline-offset 为移动展示扩展，登记于 theme-contract 的 platformComponentTokenValues.maple.date；桌面 Trigger 不增加无消费者 Token。
