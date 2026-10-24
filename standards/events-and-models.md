# 事件与 v-model

两端统一采用 Vue 事件模型：

- 状态通知使用 `emits`：`click`、`change`、`open`、`close`、`after-close`、`update:modelValue`。
- 需要返回值决定组件后续行为的控制钩子使用 Props：`beforeClose`、`beforeUpload`、`request`。
- 控制钩子使用 `beforeXxx`，不使用 `onBeforeXxx`。
- 同一通知不得同时通过 `onXxx` Prop 和 `emit` 分发。
- 主值使用 `modelValue`/`update:modelValue`；具名模型使用 `open`/`update:open`、`show`/`update:show`。
- `change` 表示值已提交或完成变化，`input` 仅用于确有逐字符语义的组件。

Button 及组合它的 SplitButton 的 Promise click 自动 loading 属于明确例外：`onClick` 为控制回调 Prop，保留 `@click` 用法，直接消费返回的 Promise，不再同时 emit click。SplitButton 将自身与 `buttonProps.onClick` 的回调交给 Button 执行，每个回调只调用一次。其他新组件优先通过显式 `action` 控制 Prop 或外部 loading 管理。

主值与默认值统一采用 `modelValue` / `defaultValue`，支持普通 `v-model`。Tabs 主值为标签 name，Collapse 为展开项 name 数组，Pagination 为当前页码，Steps 为当前步骤（后二者从 1 开始）。`defaultValue` 仅在创建时初始化非受控状态，不监听后续变化、不在初始化时发更新事件、不回写父级；显式受控值优先。Pagination 的 `pageSize/defaultPageSize`、选择器的 `inputValue/defaultInputValue` 与 `open/defaultOpen` 仍为独立状态。选项对象的 `value/label` 表示身份/展示内容，与组件主值无冲突。

动作菜单、弹层或可打开面板优先使用 open/update:open/defaultOpen，不为统一主值而改成 modelValue。FAB 的 open 表示动作菜单，visible 表示整体显示，openIcon/closedIcon 表示展开/收起图标。Tabs 的 TabPane/TabNav/TabItem 使用必填且同组唯一的 name；Vue key 只用于节点复用，不作为业务标识的后备来源。

主值审查补充：Carousel 与 ImagePreviewGroup 的模型是从 1 开始的序号，TabBar 使用子项 name 或位置索引，FloatingPanel 使用modelValue/defaultValue 表示 px 停靠高度；这些数值不改成 open。Image 的单一内嵌预览面板也使用 open/defaultOpen。Switch.defaultValue 是实际选项值，不能继续把它当成 boolean 的 defaultChecked。声明式子项业务标识使用 name；数据选项 value/label、行键和文件 uid 保持各自语义。完整范围及具名状态保留理由见 audits/primary-model-naming.md。

### 数据字段、序号与尺寸状态

Tree / TreeSelect 业务节点使用 value/label/children，状态集合使用 selectedValues/checkedValues/halfCheckedValues/expandedValues；声明式子项使用 name，Vue key 与 Table rowKey 保持原有含义。Carousel / ImagePreviewGroup 对外序号从 1 开始，包括模型、方法与事件；渲染参数使用 slideNumber/imageNumber，内部数组下标仍从 0 开始。FloatingPanel 使用 modelValue/defaultValue/update:modelValue 表示 px 高度，FAB.visible/open 分别控制整体显示和动作菜单展开。
