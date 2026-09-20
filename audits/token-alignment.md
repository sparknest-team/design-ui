# Cedar / Maple Token 对齐审计

## 执行原则

按 `Button → Alert → Tag → Badge → Input → Select → Form` 处理。对齐指逻辑 Token 后缀、片段顺序和语义一致，不要求数值相同；PC 与 Mobile 可以有不同默认值。

每个组件按以下步骤处理：

1. 提取两端 Token 和使用位置。
2. 将同义异名 Token 映射到 canonical 名。
3. 区分共享状态与平台专属状态。
4. 同步源码、主题、文档和测试。
5. 将该组件加入 token diff strict allowlist。

## 当前基线

| 组件 | 状态 | 结论 |
| --- | --- | --- |
| Button | 已对齐并门禁 | 71 个逻辑 Token 全部同名，size/status/variant 维度由严格差异检查保护 |
| Alert | 已对齐并门禁 | 81 个逻辑 Token 全部同名；移除 Maple 30 个无效旧变量，三套主题改用细粒度 title/content/icon，并纳入公共契约与 denylist |
| Tag | 已对齐并门禁 | 145 个逻辑 Token 全部同名；移除 Maple 35 个旧变量和重复主题覆盖，加入公共契约与 denylist |
| Badge | 已对齐并门禁 | 78 个逻辑 Token 全部同名；补齐 Cedar 的 default/secondary/tertiary 样式，保留平台 position 扩展 |
| Input | 已对齐并门禁 | Input 自身 7 个 Token 全部同名；输入框架的尺寸、variant、error 状态归属 Field 契约，InputTag/InputNumber 不再被前缀扫描误算为 Input |
| Select | 已对齐共同契约 | 11 个 popup/option 共同 Token 同名；Cedar 分组、hover、阴影与 Maple tags、移动面板布局登记为平台扩展 |
| Form | 已对齐共同契约 | 8 个标签、必填、帮助信息及间距 Token 同名；Cedar 完整状态反馈与 Maple 移动端固定标签几何登记为平台扩展，输入外观仍归 Field |

单组件查询：

```bash
node bin/token-diff.mjs --component button
```

全量差异继续用于发现候选项，不把平台独有组件误判为失败。Button、Alert、Tag、Badge、Input 已启用逐组件 strict 门禁；Select、Form 由 `@ui-foundation/theme-contract` 同时检查共同 Token 和显式平台扩展。公共契约当前覆盖 34 个组件。

## 平台扩展边界

- Select：Cedar 独有分组标题、hover/highlight、边框阴影；Maple 独有 tags 排列、箭头与 standard 菜单间距。共同 popup 背景、圆角、字号、高度、padding，以及 option 的高度、padding、文本和选中/禁用状态必须同名。
- Form：Cedar 独有多尺寸、inline、反馈图标与 warning/success/error/validating 状态；Maple 独有移动端标签固定宽度、间距和星号间距。共同标签文本、必填色、帮助文本、垂直间距必须同名。
- 平台扩展只允许存在于公共契约的 `platformExtensions` 登记组件中；其他 32 个组件仍要求两端完整 Token 后缀集合一致。
