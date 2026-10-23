# 第一百零八批：两端 Checkbox 自定义插槽的鼠标与键盘

## 验收环境

本批是源码开发站真实交互：Cedar 4185 `/components/checkbox/?audit=108-source`；Maple 8080 `#/zh-CN/checkbox?audit=108-source` 中间 Demo。第 107 批失败构建后 Cedar 旧静态产物已不可用，尝试静态页得到 404，因此转到开发站；不将此批写为新生产构建通过。加载较慢时等待实际控件出现后才操作。

## 实际动作及状态

均操作“自定义图标”Demo：初始 5 个原生 checkbox 按可见顺序为 true/false/true/true/false。第一项与第三项绑定同一模型；后两项属于独立的非受控组选项，默认选 A。

1. 聚焦第三项，按 Space：第一、第三项一起取消，原生 checked/aria-checked 同步 false；自定义图标由 ✓ 变 ○，组选 A 不变。
2. 第三项按 Enter：第一、第三项一起恢复 true，自定义图标恢复 ✓；不影响独立的第二项或组选项。
3. 组选项 B 按 Space：A/B 两项均选中且均显示 ✓。组选项 A 按 Enter：仅 A 取消、显示 ○，B 保持 ✓；第一、第三项模型仍为 true。最终原生 checked 与 aria-checked 均为 true/false/true/false/true。
4. 直接点击第三项的自定义图标 span，两端第一、第三项同时取消；再次点图标，两项同时选中。组选项仍是仅 B 选中，图标没有吃掉标签点击语义。

[Cedar 自定义图标和组选项证据](./evidence/cedar-checkbox-batch108.png)；[Maple 对照证据](./evidence/maple-checkbox-batch108.png)。图标只是呈现，原生输入和模型绑定仍承担交互。Maple 最初用精确名称“方案 B”定位时没有匹配（自定义图标文本也进入可访问名称）；按实际可见名称包含“方案 B”定位后完成动作，不记作组件失败。

## 验证与同步

- Cedar Checkbox 9 文件 90 项、Maple Checkbox 11 文件 114 项专项回归通过。自动测试含组协议/键盘等，不把它们都算为此批浏览器覆盖。
- 两仓 git diff --check、菜单/调研同步检查通过：72 族，56 已同源、15 逻辑已同源、1 独立。Checkbox 分类保持已同源，不等于全部组合验收完。
- 没有发现新的组件或 Demo 缺陷，无代码/API/CSS 更改。现有两端文档已说明自定义图标保留原生语义，未重复修改中英说明；新增本验收记录并同步主索引。未重跑类型、lint 和完整构建，Token 文档构建阻塞仍以第 107 批记录为准，未覆盖并行任务。
- 本批没有验收真实触屏、长按/失焦竞争、读屏软件发声、异步请求乱序或 Maple 右侧该 Demo 交互，也不声称自定义分组图标的全部无障碍命名已审计。未提交、推送或发布。
