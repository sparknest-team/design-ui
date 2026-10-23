# 共享规范索引

以下规范是 Cedar 与 Maple 的共同契约：

1. [组件结构](component-anatomy.md)
2. [API 设计](api-design.md)
3. [事件与 v-model](events-and-models.md)
4. [TypeScript](typescript.md)
5. [样式与 BEM](styling-and-bem.md)
6. [Design Token](design-tokens.md)
7. [可访问性](accessibility.md)
8. [测试](testing.md)
9. [SSR 与兼容性](ssr-and-browser.md)
10. [文档](documentation.md)
11. [版本与兼容性](release-and-compatibility.md)
12. [跨端契约](cross-platform-contract.md)
13. [Dialog 组件契约](dialog.md)
14. [表单控件契约](form-controls.md)

共享不表示文件结构必须相同；文件名、样式入口、PC/移动交互差异由 `platforms/` 覆盖。共享的是对用户可见的 API 语义和质量底线。

## 待评审设计

- [表单字段阅读与编辑统一设计草案](../refactors/form-control-alignment/cell-editing-design.md)：Form/FormItem/字段组件的职责、统一 presentation（inline/popup/popover/dialog/read）、搜索、异步数据与提交协议。尚未实施，不替代现行表单控件契约。
