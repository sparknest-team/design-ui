# Input / Textarea 主体同源

## 2026-10-09 本批实现

- Input 主体沿用两端已独立复制的 Cedar 基准，统一原生值恢复、事件顺序、IME 和受控拒绝契约；没有共享运行时或 platform 配置。
- Textarea 以 Cedar 功能为基准补齐 Maple hint、line、实例颜色及 Form 反馈，改为相同的原生 textarea + FieldDecorator + InputFeedback 主体。保留 rows、autoSize、字数算法、InputGroup/Form 继承、原生属性和方法。
- 普通输入按 input → update:modelValue；清空按 clear → input → update:modelValue → change，各类 Form 通知一次。受控拒绝后 blur 不重复提交，编辑返回焦点初值不产生伪 change；禁用、只读、组合输入不被清空或 trim。消费者 preventDefault 的 Enter 不再额外提交旧查询。
- 自动高度独立复制为 composable，支持 ResizeObserver、KeepAlive 停用/恢复和卸载清理；SSR 不访问浏览器对象。无 selection API 的 input 类型也恢复受控值。
- Textarea 计数器统一外置，删除 Cedar 旧的 counter-inset-inline-end、counter-inset-block-end、scrollbar-offset，增加 counter-margin-top。公共样式 token 默认值及原生 resize 默认值允许独立：Cedar resize=true，Maple=false。
- PC 与移动端清空可见性继续由各端 FieldDecorator 样式负责；本批不覆盖这些端侧交互差异。
- 两端公开 Emits、Slots、Expose 类型；增加事件顺序和多行组合能力配对 Demo，Maple 使用独立中英文 Vue 源文件并接入右侧集合；同步 API、方法和 token 文档。新增 OpenSpec 和两端 major changeset。

## 验证

- Cedar 定向 11 个文件、101 项通过；Maple 定向 11 个文件、106 项通过（包含 InputNumber 等名称匹配的关联回归）。
- 两端分别新增 pipeline 16 项及 Textarea body-contract 3 项，覆盖通知次数、受控拒绝、IME、只读/禁用、焦点基线、SSR、原生属性、原生方法和 KeepAlive 观察器清理。旧事件断言与快照只按明确的新契约调整。
- 两端 src/input、src/textarea 定向 ESLint 通过。
- `node design-ui/bin/input-textarea-body-check.mjs` 验证 24 对主体、API、样式、测试和 Demo 独立副本通过。明确排除本库安装/Form 适配及登记的 Textarea 默认值。
- 主代理已报告两端首轮全库类型检查通过；最终构建、公共 token 门禁、消费者批次回归和视觉验收以批次集成记录为准。本子任务未单独执行整库构建或浏览器视觉验收。

## 同源状态建议

Input 与 Textarea 主体、原生事件逻辑和 API 已独立同源，可在批次集成验收后更新全局状态。差异仅保留前缀/安装/Form 接口及明示的端侧默认样式、原生 resize 策略；不通过跨库导入实现复用。

最新批次集成与剩余清单以[第二批记录](./priority-batch-2-2026-10-09.md)为准。组件级“待集成”或“建议逻辑同源”为交付时快照，公共 Token 与适配边界复核后，按现有定义将本批组件登记为同源，不表示整目录逐字节一致。
