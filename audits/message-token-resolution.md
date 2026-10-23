# Message token 收尾决策

## 已实现

- 两端 `MessageVariant = 'neutral' | 'tonal' | 'solid'`，组件、命令式调用、全局默认及相同 id 更新均支持。Cedar 默认 neutral，Maple 默认 solid。
- neutral：中性 overlay 面板 + primary 正文 + 状态图标 + secondary 关闭按钮。
- tonal：低强调状态色底 + primary 正文 + 状态图标；普通状态使用 muted。info 使用蓝色 6 阶 12% 透明填充，其余使用现有状态 light-1，loading 使用 primary-light-1。
- solid：强状态底 + on-bright 前景；default/loading 保留 #333 + on-dark。不能将 Maple 原有实色误称 tonal。
- 每端新增 90 个同义同值颜色变量：`message-{neutral|tonal|solid}-{default|info|success|warning|danger|loading}-{bg|content-color|icon-color|border-color|close-color}`。颜色值只差 c/mp 前缀。neutral 保留边线语义，其余 border-color 为 transparent；Maple 原先没有边宽，颜色角色不强制新增边框。
- 两端保留现有密度、位置、圆角、阴影和动效差异。Maple 原样式中的常量提取为组件变量；修复 `icon-margin: 0 8px` 被错误送入 `margin-left`（无效双值），改由 `margin` 消费。

## 迁移（无旧名 alias）

| 旧变量 | 新变量 |
| --- | --- |
| Cedar `message-{status}-{bg|content-color|icon-color|border-color}` | `message-neutral-{status}-{同后缀}`；若切换外观，选对应 variant |
| Cedar `message-close-icon-color` | 对应 `message-{variant}-{status}-close-color` |
| Cedar `message-close-icon-top/right` | 删除；布局一直是 flex，这两个无效变量不应作为定位承诺。使用现有 close-btn-margin-left / 面板 padding |
| Maple `message-background/color` | `message-solid-{default|loading}-{bg|content-color}`；图标/关闭有独立颜色角色 |
| Maple `message-{info|success|warning|danger}-{background|color}` | `message-solid-{status}-{bg|content-color}` |

## 验证

- Cedar Message：7 项测试通过。
- Maple Message：15 项测试通过。
- feedback-theme-check：172 个状态组合，3780 对前景/表面配色，最低 4.681:1；Message 覆盖三变体 × 六状态 × 两品牌 × 明暗 × 两端，逐一验证五类颜色变量消费与覆盖，并额外检查 Cedar 关闭按钮 hover 前景叠加后的对比度。
- 所有 Message 变量额外进行递归解析，避免引入未定义依赖。
- 编译审计不等于真实浏览器布局、焦点、运动验收；全局浏览器验收由主线汇总。

## 集成提示

中央 shared contract 应以 token.less 的三变体前缀收录这 90 个颜色默认值，替换旧的端侧隐式颜色。几何默认值可有明确端侧密度差异，不应混入同值颜色矩阵。主菜单设计指南应说明三视觉强调层级和迁移，不再描述 Message 颜色模型尚未统一。
