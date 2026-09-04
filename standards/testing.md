# 测试

快照只能作为辅助，不得作为交互组件唯一测试。

最低测试矩阵：

1. 默认渲染和关键 Props。
2. Emits 名称、次数和参数。
3. v-model 的受控更新。
4. disabled/loading 不触发重复操作。
5. 键盘操作与焦点行为。
6. 关键 ARIA 状态。
7. Provide/inject 或组合组件继承。
8. 异步控制钩子的 resolve/reject。
9. Teleport 组件挂载、卸载和焦点恢复。
10. 公共 Props/Emits/Slots 的类型测试。

纯展示组件可豁免交互项，但必须在组件元数据中声明 `nonInteractive: true`。更新快照必须在 PR 中说明预期变化。

覆盖率作为趋势门禁，不以单一总百分比代替场景覆盖；新增代码行覆盖率不得低于 80%，核心交互分支必须显式测试。
