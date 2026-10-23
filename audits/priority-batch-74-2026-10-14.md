# 第七十四批：Maple Picker 禁用交互 Demo

## 实现与浏览器验收

- Maple Picker 新增独立“禁用选择器”Demo，初始选中 A 且禁用；中英组件文档均列出该 Demo，右侧移动端 Demo 集合由现有入口自动包含，菜单仍指向 Picker 组件页，无需新建菜单项。
- 在已构建的 Maple 生产站 `/#/zh-CN/picker` 实际操作：禁用时列表 `tabindex=-1`，强制点击 B 后仍选中 A、模型值仍为 A；取消禁用后列表 `tabindex=0`，点击 B 后选中与模型值均变为 B，按 ArrowDown 后均变为 C；重新禁用并点击 A，仍保持 C。此为浏览器交互，不将触摸惯性宣称为已验收。
- Picker 禁用能力及 Time/TimeRange 内嵌只读转发的源码和测试详见第七十一批；本批补足公开示例，并未改动两库共享运行时。

## 验证与余项

- Maple 新 Demo 的受影响 ESLint、库 typecheck、完整 `build:doc` 已通过；构建收集 1026 个 Demo SFC，Vite 构建通过，仍有既有大 chunk 警告。`git diff --check` 通过。两库未提交、推送或发布。
- 尚未在真实触屏设备验证禁用中途的惯性滚动；其他 Picker 配置组合仍待验收。
