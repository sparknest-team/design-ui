# 当前项、展开与视觉强调命名检查（2026-10-24）

本记录以最终决定为准：Menu、NavMenu、TabBar、Steps 的当前项使用 active；Collapse 展开使用 expanded。modelValue/defaultValue 仍为主值；open/defaultOpen 仍为弹出面板开关。未保留被替代的公开参数或 prop 别名。

## 已同步清单

| 范围 / 公开入口 | 调整 | 最终含义 |
| --- | --- | --- |
| 双端 Menu 的 label/icon/extra 数据渲染函数、option-label/icon/extra 插槽 | selected → active | 当前普通项自身匹配主值；子项激活时父项 false |
| 双端 MenuOption label 函数、default/icon/suffix 插槽 | selected → active | 共用 { option, active, level }；label 仍为单对象参数 |
| 双端 MenuOption 视觉覆盖 | 保留 highlight，不恢复 active prop | 不改变主值、公开 active 或提交更新 |
| 双端 Menu 祖先路径状态 | 内部 hasSelectedDescendant | 保留父分支路径样式，不公开后代状态 |
| Cedar NavMenuRenderContext，影响 options label/icon/extra、同名插槽和 nodeProps | selected → active；原祖先 active 从公开上下文移除 | { option, active, expanded, level }；active 只对应当前普通节点 |
| Cedar NavMenuItem 视觉覆盖 prop | active → highlight | true/false 覆盖视觉强调，省略时跟随业务 active；具名和独立入口均适用 |
| Cedar NavMenuItem default/label/icon/content 插槽 active | 保留名字，拆掉视觉覆盖影响 | 具名入口由根 activeItem===name 决定；独立入口由主值匹配普通选项决定 |
| Cedar NavMenuItem label 渲染函数 | 移除 selected，active 只对应上下文 option | 与入口插槽的主体不同：渲染函数针对匹配选项，入口插槽针对入口自身；没有匹配选项时函数 active=false |
| Cedar NavMenu activeItem/defaultActiveItem、update:activeItem、setActiveItem | 保留 | 当前具名入口 name；独立于面板内部 modelValue |
| 双端 Collapse / CollapseItem expand-icon 插槽 | active → expanded | { expanded, disabled, position }；新增公开 CollapseExpandIconSlotProps、CollapseSlots、CollapseItemSlots |
| Maple TabBarItem default/icon 插槽 | 保留 active | 子项 name 匹配主值；activeColor/inactiveColor 保留 |
| 双端 Step default/title/node/icon/description 插槽 | 保留 active，不改为 current | 步骤序号对应主值；与 wait/process/finish/error 状态分开 |

NavMenuItem 的独立主值即使非 null，若不匹配普通选项（未知值、group、divider），业务 active 也为 false。0 和空字符串在匹配选项存在时合法。自定义面板可继续提交 options 外的值；需要额外强调时显式 highlight。打开面板、hover、focus 和视觉覆盖不会更新主值。

NavMenu 的 selectedOption 是选项对象，autoExpandSelected 是现有自动展开策略，不属于本次布尔状态重命名范围。CollapseActiveNames 仍是已有主值数组类型。CSS selected/active 类、token、DOM activeElement 以及内部选中算法保留，不做文本清洗。Table、Tree 等数据字段未调整。

## Demo 与文档

双端 Menu active-rendering demo 比较数据渲染函数、作用域插槽和自定义 MenuOption，默认账户 active=true、父分支 false，highlight 不改变 active。Collapse 根和子项 expand-icon demo 同步 expanded。NavMenu 自定义渲染使用 active，视觉覆盖 demo 使用 highlight，普通具名入口用 activeItem/name。TabBar、Steps 文档明确保留 active 的准确含义。

## 验证范围

验证包含精确当前项与祖先样式分离、受控主值拒绝更新、0/空字符串/未知值、highlight 与 open 独立、所有 Step 插槽及 error 状态；两端回归、公开正反类型用例、lint、同源与全量 demo 规范检查。最终受影响回归：Cedar 25 个文件、220 项通过；Maple 19 个文件、165 项通过。双端源码类型检查及公开正反类型用例通过，Cedar 受影响范围 lint、Maple 全库 lint:check 通过；同源基础检查 68 对通过，组件规范检查两端零错误、零警告。全量 demo 检查通过：550 review SFC、2861 demo SFC、1873 文档片段；Maple 1474 demo SFC 零失败。这些结果不等同于生产浏览器全组件验收。

## 源码入口

- [Cedar Menu 上下文](../../cedar-design-web/packages/cedar-ui/src/menu/types.ts)、[Maple Menu 上下文](../../maple-design-mobile/packages/maple-ui/src/menu/types.ts)
- [Cedar NavMenu 数据上下文](../../cedar-design-web/packages/cedar-ui/src/nav-menu/types.ts)、[NavMenuItem](../../cedar-design-web/packages/cedar-ui/src/nav-menu/item.tsx)
- [Cedar Collapse 插槽类型](../../cedar-design-web/packages/cedar-ui/src/collapse/props.ts)、[Maple Collapse 插槽类型](../../maple-design-mobile/packages/maple-ui/src/collapse/props.ts)
- [Maple TabBarItem](../../maple-design-mobile/packages/maple-ui/src/tab-bar/TabBarItem.vue)、[Cedar Step](../../cedar-design-web/packages/cedar-ui/src/steps/Step.vue)、[Maple Step](../../maple-design-mobile/packages/maple-ui/src/steps/Step.vue)
