# Checkbox / CheckboxGroup 主体同源

## 2026-10-09 本批实现

- Cedar 先补齐实例颜色、number/string 图标尺寸、波纹、三态图标插槽和 click 事件，再独立复制 Checkbox/CheckboxGroup SFC、类型化 context、props 和 BEM 主体样式至 Maple。
- Maple 从 div 模拟切换改为原生 checkbox + label；两端以 input 作为唯一焦点/键盘入口，提供 disabled、readonly、mixed、error 的原生/ARIA 状态。受控拒绝后恢复 checked/indeterminate。
- 两端新增 name/aria-label，Group 传递原生字段名并暴露 role=group。Maple 补齐完整 checkbox 插槽和 uninject-group-context；全体自定义控件的可见标签不被 aria-hidden 隐藏，装饰图标隐藏。
- 保留同源值模型、选项归一化、max、批量方法、KeepAlive 注册/清理和 Form 继承。删除 Maple 旧 provider、group-props、旧视觉文件及 Cedar TSX/icon-check；没有共享运行时、platform 配置或旧 class alias。
- 样式主体统一为 --checked/--indeterminate/--disabled/--error 与 __input/__control/__icon/__check/__mark/__label。公开 token 集合不变；仅默认密度/字体/动效及本库安装/表单接入保留独立适配。
- 迁移 Cedar Cascader/Select/Transfer 的 Checkbox 内部选择器；修正旧 CheckboxGroup demo 的 column 值和自定义 demo 的未知 a-typography-text。
- 增加 native-control/custom-control 配对 Demo；Maple 中英文文件接入中央和右侧展示；文档补齐公开 API、键盘、图标尺寸语义、插槽和样式表。

## 验证

- Cedar 定向 94 项测试通过（Checkbox 契约包含 Radio 回归，以及 Tree/TreeSelect/Calendar 调用方）；Maple Checkbox 112 项通过。两端各新增 9 项原生主体测试。
- 测试覆盖受控拒绝、mixed 恢复、标签点击单次派发、禁用/只读、三态和完整插槽、max、脱组、SSR、嵌入按钮/链接、实例尺寸及完整自定义标签。
- Maple 旧 20 项交互断言全部保留并通过；因原生 input 的 change 需要文档挂载，测试增加 attachTo，并将键盘目标迁移到 input。快照更新仅对应明确的原生/BEM 主体重构。
- 两端 src/checkbox 定向 ESLint 通过；两端完整 vue-tsc 类型检查通过。最终 Cedar 回归无此前的测试关闭超时提示。
- 本子任务未运行整库构建、发布包导入、主题门禁或浏览器视觉验收；这些由批次集成统一执行。仅凭上述测试不宣称整批验收完成。

## 同源状态建议

主体逻辑、原生结构、props 和样式规则已独立复制，可在批次门禁及视觉验证通过后升级 Checkbox 为已同源。保留差异只包括前缀/文件名、组件安装、表单接入及已登记的密度 token 默认值。此记录不单独修改全局状态元数据。


2026-10-09 批次集成结果与最新分类：[依赖分批并行验收记录](./priority-batch-2026-10-09.md)。上文未完成项为该子阶段快照，以批次记录为准。
