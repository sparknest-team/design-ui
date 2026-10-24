# 主值、面板与子项标识审查

## 本轮调整

| 范围 | 原 API | 最终 API / 含义 |
| --- | --- | --- |
| Cedar / Maple Carousel | current / defaultCurrent / update:current | modelValue / defaultValue / update:modelValue；从 1 开始的页序号 |
| Maple TabBar | active / defaultActive / update:active | modelValue / defaultValue / update:modelValue；子项 name 或未命名时的位置索引 |
| Cedar / Maple Switch | defaultChecked | defaultValue；实际值，与 checkedValue / uncheckedValue 同类型，省略时取 uncheckedValue |
| Cedar / Maple 可选 Tag | checked / defaultChecked / update:checked | modelValue / defaultValue / update:modelValue；布尔选中状态 |
| Cedar / Maple Image | previewOpen / defaultPreviewOpen / update:previewOpen | open / defaultOpen / update:open；内嵌预览面板，通知事件 open-change |
| Cedar / Maple ImagePreviewGroup 与函数配置 | current / defaultCurrent / onUpdate:current | modelValue / defaultValue / onUpdate:modelValue；从 1 开始的图片序号，开关另用 open |
| Maple FloatingPanel | anchor / update:anchor | modelValue / defaultValue / update:modelValue；停靠高度 px，使用普通 v-model |
| Cedar / Maple Menu | 缺少 defaultValue | 补充非受控初始选中值，内部选中状态跟随用户操作 |
| Cedar PeopleSelect / FilterForm | 缺少 defaultValue | 补充人员标识 / 表单对象的非受控初始值 |
| Maple Picker / NumberKeyboard / PullRefresh | 缺少 defaultValue | 补充列值数组 / 输入文字 / 初始刷新状态；异步刷新结束仍由父级绑定值设 false |
| Maple ActionSheet / NumberKeyboard / Picker popup | 缺少 defaultOpen | 补充非受控初始面板开关 |
| Maple FAB | visible 隐藏会卸载自定义 trigger，并影响菜单过渡事件 | 宿主内容统一隐藏，保留 trigger / action 实例与 open 状态；隐藏时忽略外部点击 |

所有默认值只在创建时读取，初始化不发出模型更新；显式受控值优先。源码、类型、调用方、demo 与文档同时迁移，不保留旧别名。

## 子项标识边界

Tabs 的 TabPane / TabNav / TabItem、CollapseItem、NavMenuItem 使用 name。TabBarItem 也已使用 name；未声明 name 时沿用位置模式，不读取 Vue key 作为业务名称。Carousel 与 Steps 是位置/进度组件，没有新增一个无行为的业务标识属性；Carousel 的 Vue key 仅跟踪节点身份，公开主值是从 1 开始的页序号。

Checkbox / Radio / Select / Cascader / Menu 选项数据的 value 是选项值，label 是展示内容，不改成 name。Checkbox / Radio 的 name 还具有原生表单分组含义。Tree / TreeSelect 节点默认使用 value/label/children；fieldNames.value/label 支持映射业务字段。Table 行键、Upload 文件 uid 不变。

## 保留的独立状态

- Tree 的 selectedValues、checkedValues、halfCheckedValues、expandedValues 描述不同集合；Table / Scheduler 原有 Keys 集合不变，均，不能合并成一个主值；Calendar / Date 的视口 pickerValue / view 与选中值同样独立。
- InputTag / Select / Cascader 的 inputValue 与 open 独立于选中主值。
- Layout Sider / NavMenu / FilterForm 的 collapsed 控制布局折叠，Ellipsis 的 expand 控制文字截断，InputPassword 的 visibility 控制密码显隐；均不是弹出面板开关。
- Tag 的 show/defaultShow、Badge.show 和 FAB.visible 表示整体或内容显示，不改成 open。
- Select.defaultActiveFirstOption 控制键盘候选项，不是初始选中值。
- Form.model 是表单数据上下文配置，Search.model/modelField 是结构化查询上下文；已有 modelValue 才是字段主绑定，不把多个独立对象混为一个主值。
- Message 的 open 属于通知实例生命周期，由服务管理，不新增一个不能独立使用的默认面板状态。

## FAB 的生命周期选择

不需要保留实例时直接 v-if，无需传 visible。v-if=false 销毁组件及拖拽状态，重新显示读取 defaultOpen；visible=false 保留实例和子组件，只隐藏实际 Teleport 内容，不改变动作菜单开关。v-show 依赖组件可用的元素根节点，而 FAB 经 Drag/Teleport 渲染，因此不把外部 v-show 当成 visible 的可靠替代。

## 序号与下标

Carousel 与 ImagePreviewGroup 的公开主值、默认值、to/open 方法参数及事件序号从 1 开始；指示器插槽使用 slideNumber / imageNumber。内部数组与布局保持 0 基下标。Tree 的 scrollIntoView({ value }) 使用业务值；其显式 index 参数仍是虚拟列表的 0 基下标。TabBar 推荐 name，未命名的位置下标保持原约定。
