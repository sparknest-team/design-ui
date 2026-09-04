# 组件结构

公开组件必须具有入口、运行时 Props、Props 类型、实例类型、文档、示例和行为测试。子组件可复用父组件文档，但必须在父组件测试中覆盖。内部组件必须显式登记为 `internal`，不要求公共文档。

组件分类：`public`、`subcomponent`、`internal`、`utility`。规范检查器根据分类应用不同规则，禁止仅因目录中存在 `index.ts` 就把工具目录当作公开组件。

公开入口至少导出：默认组件、`XxxProps`、`xxxProps`、`XxxInstance` 和 resolver 所需内部别名。新增组件必须通过生成器创建，减少结构漂移。
