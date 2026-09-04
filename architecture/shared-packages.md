# Cedar / Maple 基础工具边界

`shared` / `use` 表示职责相似，不代表两端实现必须相同。桌面端和移动端在 DOM 行为、手势、响应式状态和组件约束上会持续分化，因此不抽取到外部公共包。

仓库内命名按所属产品保持清晰：

- Cedar：`@cedarjs/shared`、`@cedarjs/use`
- Maple：`@maplejs/maple-shared`、`@maplejs/maple-use`

两端只统一工程契约：目录职责、导出方式、测试门禁、SSR 安全和 API 命名。具体代码允许不同；只有某个纯函数经过长期验证确实完全一致时，才考虑复制规范或单独提案，不预先建立跨仓库运行时依赖。
