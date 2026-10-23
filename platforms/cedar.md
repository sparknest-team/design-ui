# Cedar 平台覆盖规则

- 桌面端 Vue 3 组件库，组件前缀 `C`、类名前缀 `c-`、Token 前缀 `--c-`。
- 组件文档为组件目录 `README.md`，示例在 `__demos__`，样式在 `style/`。
- 必须覆盖键盘、hover、focus-visible 和高密度桌面布局。
- PC 特有组件可以不在 Maple 出现，但共享基础组件仍遵守跨端契约。

- Form 默认 layout=horizontal；标签/内容栅格及自动宽度 API 与另一端同义，按 FormItem 实际布局生效。
