# CheckboxGroup 批量方法同源

## 2026-09-30 本批完成

- Cedar 新增 checkAll / inverseAll，两端独立复制 use-checkbox-group-methods，公开导出 CheckboxGroupMethods 并关联实例类型。两库不引用同一运行时，不共享实例。
- 只处理当前挂载且可编辑的子项；读取实时值、禁用/只读状态和 DOM 顺序，不使用初始化时的缓存。重复值只要存在锁定子项就整体锁定。
- 保留已选的禁用、只读及未加载值；全选保留原模型顺序并追加未选值，反选先移除可编辑的已选值再补选，新增选择遵守 max。
- 修复达到 max 时 Cedar 将候选误视为永久禁用的问题；修复全选因重排既有值而触发无意义通知的问题。Maple 旧顺序断言同步迁移，无兼容分支。
- 返回独立数组副本；受控值拒绝提议不会本地保存；禁用/只读阻止批量改值。实际变化仅按 update:modelValue → change(value, undefined) → FormItem 通知一次。
- 注册在卸载和 KeepAlive 停用时清理，激活时恢复；保留已销毁实例的方法引用也不会再发事件。注册表按 Group 实例隔离，嵌套分组各自处理。
- 新增双端分组方法 Demo，Maple 同时提供中英文文件并复用于中央卡片/右侧集合；文档、changeset、OpenSpec、菜单说明同步。
- 按 Vue 生命周期规范补齐注册清理与显式 Expose 类型；14 对核心/测试与 9 对 Demo 纳入一致性门禁。

## 验证

- Cedar 69 项组件测试 + 4 项相关调用方测试、Maple 108 项测试全部通过，共 181 项（含新增双端 11 项批量方法测试）。
- 双端 vue-tsc、完整 Lint、build:lib 通过；发布声明导出 CheckboxGroupMethods，实例类型包含 checkAll/inverseAll。
- Maple docs:check：890 个 Demo、0 失败；14 对核心/测试与 9 对 Demo 同源门禁通过；菜单/调研元数据同步检查通过。
- 两端发布产物的批量模型验证通过；Cedar Checkbox 包入口裸 Node 导入通过。
- 未做浏览器视觉验收和整站文档生产构建。
Maple 发布组件裸 Node 导入仍受既有 Ripple CSS 依赖限制，本批不宣称已修复。

## 剩余范围

当前调研 71 组：44 已同源、12 逻辑已同源、11 待适配、3 逻辑待同源、1 独立。
当前计划仍待完成的是 14 组（11 待适配 + 3 逻辑待同源），不是 14 组都未开始；另外 12 组已完成逻辑同源，并非整组件完全同源。
Checkbox/Radio 本批仍不升级整组件状态。下一批对齐 Radio button、主体和完整组键盘/初始焦点/动态顺序，再处理样式/BEM/Token 和 Ripple 包 SSR。

后续进度：[Radio 交互与按钮模式](./choice-radio-wave-progress.md)。上面的剩余范围为当批快照，以最新记录为准。
