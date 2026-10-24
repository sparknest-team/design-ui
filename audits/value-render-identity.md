# 业务值与渲染身份审查

| 范围 | 业务 API | 内部渲染 / 缓存身份 | 本轮处理 |
| --- | --- | --- | --- |
| Cedar Tree / TreeSelect | value/label；fieldNames 可映射后端 key/title | Node.key = value；Vue key、节点 Map、虚拟列表 itemKey 使用该 key | 保留内部映射；过滤文案不参与 key；增加普通 / 虚拟列表重排与数值 0 回归 |
| Cedar / Maple Menu | option.value，fieldNames.value | 显式业务值转稳定、区分类型的 Vue key；对象值按原始对象身份，无 value 项按原始选项身份 | 修复原先 index key 导致的重排实例错用 |
| Cedar / Maple Select | option.value | getKeyFromValue 生成 key；选中 tag、列表和虚拟列表用该 key | 已有稳定映射，不新增业务 key 别名 |
| Cedar / Maple AutoComplete | option.value | 复用 Select 的 option.key，列表项按 key 渲染 | 已有稳定映射 |
| Cedar / Maple CheckboxGroup / RadioGroup | option.value | 按 typeof value + value 生成 key | 已有类型区分的稳定映射 |
| Cedar Transfer | item.value | 列表 :key=item.value，虚拟列表 itemKey=value | 已有稳定映射 |
| Cedar / Maple Cascader | option.value | 内部生成 option.key，列内条目和虚拟列表用它 | 现有映射保留；列容器 index 表示固定层级，不是选项身份 |
| Tabs / Collapse / Maple TabBar | 子项 name | Vue 渲染身份仍由调用方 :key 决定；动态列表应绑定稳定 name/id | name 和 Vue key 是两个契约；不自动把业务标识和渲染 key 强制绑定 |
| Carousel / 图片预览组 | 对外从 1 开始的序号 | 内部数组下标、VNode key / 图片轨道位置保持各自语义 | 序号不是稳定业务 ID，不把它作为额外 key 字段 |
| Cedar NavMenu | 现有数据节点 key / 声明式子项 name | 递归节点按 node.key 渲染 | 已有稳定身份，未改接口 |
| Table | rowKey 等 | 原有行缓存身份 | 不改 |

## FloatingPanel

按最新决定，Maple FloatingPanel 使用普通 v-model：modelValue/defaultValue/update:modelValue 表示 px 停靠高度；height-change 仍是停靠完成通知。初始化不回写父级，defaultValue 后续变化不重置当前高度。

## Menu 公开选中状态

MenuRenderContext.active 只表示当前项自身匹配选中值；后代选中留在内部。MenuOption.active 已移除，视觉强调使用 highlight；直接 label 渲染函数及 default/icon/suffix 插槽也使用 { option, active, level }。根选中模型仍为 modelValue/defaultValue，展开模型仍为 open/defaultOpen。

后端仍返回 key/title 时，可显式设置 Tree 的 `fieldNames: { value: "key", label: "title" }`。这是字段映射，不是新增两个可独立修改的业务身份字段；内部归一化后仍保持 key=value。
