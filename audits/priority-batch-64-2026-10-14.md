# 第六十四批：Cedar Form 错误滚动与字段重置真实交互

## 浏览器实测

- 在 Cedar 生产文档站 `/components/form/` 的“滚动到指定表单字段” Demo 操作，不以挂载或源码检查代替交互。
- 表单滚动容器高 300px、内容高 1040px。点击“Scroll to the last field”后，平滑滚动结束时 `scrollTop=720`（最大值 740），最后一项 `user19` 出现在容器视口内。
- 点击“Submit”后，空的 `user7` 显示 `Name is required`，自动滚动结束时 `scrollTop=364`，`user7` 输入框顶部与容器顶部相差约 1px；验证了 `scroll-to-error="start"` 的实际定位。
- 填入 `seven` 再提交，必填错误消失，字段值保持 `seven`。点击“Reset”后该字段恢复空字符串，错误提示仍不显示。

## 文档与边界

- Cedar Form 文档修正 `scrollToField` 描述及参数拼写；Maple 中英文 Form 文档明确 `start/end` 选的是页面顺序中的首个/末个错误字段，不是视口对齐方式。菜单与“逻辑已同源”状态不变。
- 本批只证明 Cedar 这一滚动 Demo 的 `start` 路径；Maple `end`、偏移量和其他错误滚动组合尚未实测。未修改组件运行时代码，未运行组件单测、类型、lint 或完整构建；未提交、推送或发布。
