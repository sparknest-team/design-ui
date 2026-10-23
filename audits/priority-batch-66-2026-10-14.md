# 第六十六批：Cedar Form 嵌套路径真实交互

## 浏览器实测

- 在 Cedar 生产文档站 `/components/form/` 的“嵌套数据” Demo 实际输入与勾选，观察 Demo 自带的模型输出。
- `together.firstname/lastname` 分别输入 `Ada`、`Lovelace`，仅对应 `together` 对象回写；`separate.firstname/lastname` 分别输入 `Grace`、`Hopper`，未覆盖前一组。
- `posts.post1/post2` 分别输入 `one`、`two`，两个键各自保持；勾选“I have read the manual”后 `isRead=true`，取消后恢复 `false`。
- 清空 `together.firstname`，只出现该项的 `firstname is required`，其他路径和值不变；恢复 `Ada` 后此错误消失。清空 `separate.lastname` 后仅该项出现 `lastname is required`，恢复 `Hopper` 后无错误。

## 同步与边界

- Cedar 组件文档已有“嵌套数据”说明和该实时 Demo，菜单仍为 Form“逻辑已同源”，本批无需改动两端组件文档或菜单状态。
- Maple 当前 Form 页面没有对等的嵌套路径交互 Demo，不能把本批计成双端通过。此用例无提交/重置按钮，也未在本批宣称这两项通过。未改运行时代码，未重跑单测、lint、类型或完整构建；未提交、推送或发布。
