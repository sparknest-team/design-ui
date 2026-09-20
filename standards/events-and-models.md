# 事件与 v-model

两端统一采用 Vue 事件模型：

- 状态通知使用 `emits`：`click`、`change`、`open`、`close`、`after-close`、`update:modelValue`。
- 需要返回值决定组件后续行为的控制钩子使用 Props：`beforeClose`、`beforeUpload`、`request`。
- 控制钩子使用 `beforeXxx`，不使用 `onBeforeXxx`。
- 同一通知不得同时通过 `onXxx` Prop 和 `emit` 分发。
- 主值使用 `modelValue`/`update:modelValue`；具名模型使用 `open`/`update:open`、`show`/`update:show`。
- `change` 表示值已提交或完成变化，`input` 仅用于确有逐字符语义的组件。

Button 及组合它的 SplitButton 的 Promise click 自动 loading 属于明确例外：`onClick` 为控制回调 Prop，保留 `@click` 用法，直接消费返回的 Promise，不再同时 emit click。SplitButton 将自身与 `buttonProps.onClick` 的回调交给 Button 执行，每个回调只调用一次。其他新组件优先通过显式 `action` 控制 Prop 或外部 loading 管理。
