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
| Button | 审计中 | 两端 size/status/variant 维度已存在，但属性片段顺序和状态覆盖不完全一致 |
| Alert | 待迁移 | Cedar 使用细粒度 title/content/icon，Maple 仍有 background/text-color 简写 |
| Tag | 待迁移 | 需要统一 checkable/checked 与 status/variant 的片段顺序 |
| Badge | 已对齐并门禁 | 78 个逻辑 Token 全部同名；补齐 Cedar 的 default/secondary/tertiary 样式，保留平台 position 扩展 |
| Input | 待迁移 | 需先明确 Field/Form 状态归属，再统一 variant 与 error token |
| Select | 待迁移 | 复用 Input/Field 基础 Token，popup Token 独立 |
| Form | 待迁移 | 只保留表单语义/反馈 Token，不复制 Input 外观 Token |

单组件查询：

```bash
node bin/token-diff.mjs --component button
```

迁移完成前全量差异只报告，不阻塞；完成一个组件后，对该组件启用 strict 门禁。目前 Badge 已执行 `--component badge --strict`，后续差异会直接阻断检查。
