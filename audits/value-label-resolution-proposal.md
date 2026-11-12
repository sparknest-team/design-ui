# 值与展示信息解析标准草案

状态：提案，尚未改变组件 API 或现有行为。适用目标：Cedar / Maple 具有独立业务身份和展示信息的组件。用户指定：统一使用 `fallback-option`，数据获取、缓存和异步状态由业务负责。

## 问题和目标

数据库只保存 `value`；页面初始化、异步数据到达、选项列表切换或表单重置时，组件仍需显示对应 `label`。标题和姓名是展示数据，不因为反显而写回主模型。以 URL 显示页面标题、用户 ID 显示姓名为典型场景。

## 对比依据

| 实现 | 值与展示 | 未匹配 / 异步边界 |
| --- | --- | --- |
| Cedar Select | 主值按选项解析；`format-label` 格式化已选内容 | `fallback-option` 同步返回完整选项；可读取业务响应式缓存 |
| Cedar TreeSelect / Cascader | 通过节点或路径展示 | 都有 `fallback-option`，但 TreeSelect 返回节点对象，Cascader 回调返回字符串；需统一契约 |
| Cedar / Maple PeopleSelect | ID 与人员信息分离 | 同步 `fallback-option` 可读业务缓存；查询加载另有生命周期 |
| Cedar InputTag | 支持原始值或对象；`format-tag` 只用于渲染 | 无独立的值解析入口；字符串默认显示自身 |
| Cedar Mention | 主值为整段字符串；选择时插入候选 value | 当前无法在纯文本中独立保留提及 ID 并显示其他名称 |
| Arco Vue / Naive UI Select | 选项映射与同步 fallback | Naive 远程模式还使用已选选项缓存；fallback 不等于异步查询 |
| Quasar Select | `emit-value` 保存值，`map-options` 从选项映射标签 | 当前文档描述缺少选项时触发首次 options 查询；[官方文档](https://quasar.dev/vue-components/select/) |
| MUI Autocomplete | 通过选项取 label、定义选项与 value 的匹配 | `getOptionLabel` 是同步显示映射；模型类型取决于配置；[官方 API](https://mui.com/material-ui/api/autocomplete/) |
| PrimeVue Select | `optionValue` 和 `optionLabel` 分别指定身份与展示字段 | 展示依赖可匹配选项；[官方文档](https://v4.primevue.org/select) |
| Mantine Mentions | 标记文本区分 ID 与显示文本，提及可作为原子项 | 自定义 serializer、displayTransform；默认标记包含 display 和 ID；[官方文档](https://mantine.dev/core/mentions/) |
| Tiptap Mention | 提及是结构化编辑器节点 | 节点属性保留身份、渲染独立；[官方文档](https://tiptap.dev/docs/editor/core-concepts/schema) |

这是针对相关能力的代表性比较，非所有组件库的穷尽调查。仓库中其他库也需在具体组件实施前审查其实际版本与行为。

## 建议统一契约

1. **主值是身份。** 展示信息到达、名称变化、失败和重试不得触发 `update:modelValue` 或 `change`；只有用户真实修改值或父级修改受控值会改变模型。
2. **统一同步回退。** 所有适用组件使用 `fallback-option`；建议函数接收原始 value，同步返回含 `value`、`label` 的对象，返回空结果时显示原始值。`format-label` / `format-tag` 和插槽负责最终外观。具体可用值类型、`false` 行为和返回空值等细节须在 OpenSpec 中确定，并评估现有 API 迁移。
3. **业务管理数据。** 业务从数据库或其他来源加载并维护响应式映射；fallback 同步读取该映射，不返回 Promise，不在回调内请求。组件不管理请求、并发、缓存、重试或失效。业务数据更新后，当前值应自动重新反显，包括初始化、父级更新和表单重置。
4. **解析顺序。** 建议匹配当前选项时使用选项；缺少匹配时使用 fallback；回退也不可用时显示原始值。组件如保留已选项缓存，须在 OpenSpec 明确其与更新后的 fallback 优先级，不能让旧缓存掩盖业务更新。格式化及插槽属于后续显示层。InputTag 的纯 value 没有独立 options，其展示须能够使用 fallback。多级路径须定义完整路径 value 和返回的展示数据，不能仅依赖叶子 label。
5. **身份与可访问性。** 区分数字和字符串身份；同 label 不合并不同 value。解析失败不丢失主值，不因加载强制禁止删除。展示结果变化应同步到只读态和无障碍名称，不影响主值或光标。
6. **一致覆盖。** 编辑态、只读态、禁用态、表单重置与延迟编辑遵守相同的身份和展示解析；SSR 使用业务预置数据并保证水合一致。名称为纯文本；富内容由插槽控制。
7. **分层演进。** 统一适用组件 API、类型、两端文档和测试；现有 Select、TreeSelect、Cascader、PeopleSelect 已有不同 fallback 签名，须在 OpenSpec 明确统一与迁移。此草案不代表组件已支持统一契约。

## Mention 的序列化约束

`请联系 @shuai.meng` 不能在一般情况下无歧义区分“普通文本”和提及实体。要可靠支持初始化反显、删除与编辑，持久化格式必须保留实体边界和 ID：例如 `请联系 @[shuai.meng]`（正式方案需定义转义、版本和多触发符），或采用由 text/mention 节点组成的结构化内容。仅存 `shuai.meng` 作为完整单值时不存在边界问题；存含有多个提及及普通文字的段落时则必须规定编码。

Mention 中选中的人员应作为不可拆分的内联原子项：内部身份为 `shuai.meng`，展示为 `@孟帅`；Backspace / Delete 删除整个提及，普通文本仍可正常编辑。初始化时通过同一 `fallback-option` 同步取得展示信息，业务数据变化只更新显示，提交仍保留编码后的 ID，不把 label 写入主值。视觉效果可类似 Tag，但实现须支持原子项与普通文本混排，不能假定普通 input 可嵌入 Tag。

用户选择候选、移动光标、删除、复制粘贴、输入法组合及撤销重做不能破坏实体与文本之间的映射。部分选区覆盖实体时按整体处理；外部粘贴普通文本不得凭外观冒充可信实体。历史 `@id` 纯文本只能在明确语法、无歧义的前提下迁移，否则不能保证可逆。序列化格式、文本选区语义、只读渲染及历史兼容须在实施前单独定稿；不能声称现有 Mention 已具备这些能力。

## 验收矩阵

- 各适用组件：初始和后到 value、静态/远程选项、空与无效值、部分命中、重复与不同类型 ID；解析不触发模型事件，提交只保留身份。
- 搜索选项变化、业务响应式缓存更新、名称更新、只读/禁用、重置及删除后重加；本地/远程、单选/多选、树路径；组件不隐式发出解析请求。
- Mention：多提及、相邻标记、转义字符和多前缀、同名不同 ID、光标及选区、输入法、原子删除、复制粘贴、撤销重做、SSR/水合和历史数据迁移。
- 性能：批量解析去重、限制重复请求、长列表与大量提及；验证辅助技术能够读出名称与加载/错误状态。
