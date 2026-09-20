# Cedar / Maple 基础层重构计划

日期：2026-09-08。范围来自当前工作区源码，包含未提交改动。实施采用两库独立复制；不引入跨库运行时核心或源码生成工厂。阶段完成与整个项目完成分开记录。

## 目标与边界

把跨端组件从逐个手工补齐，转为依赖可验证的基础契约。保持现有安装入口、主题命名空间及必要的平台行为。第三方 Vue、Popper、rattail 不复制。尺寸、触控、safe-area、手势可由本地平台适配。API 删除或改默认值必须同步全部调用者和迁移文档，不能仅修改底层 Props。

不把所有同名函数强行合并；先按职责识别重复，再决定独立复制、契约适配或平台保留。已有源码一致项也需行为验证。不得以快照通过替代交互、SSR、清理验证。

## 实施批次与依赖

| 批次 | 内容与交付物 | 前置依赖 | 出口检查 |
| --- | --- | --- | --- |
| F0 | 文件/调用者清单、原测试与类型基线、差异登记、只读检查工具 | 无 | 可重复生成清单，不能覆盖未知工作区改动 |
| F1 | useVModel、事件监听生命周期、外部点击、节点/ref 解析、父子通信契约 | F0 | 双端配对测试；事件名/次数、动态目标、KeepAlive、SSR、独立实例 |
| F2 | 弹层开关状态、挂载容器、层级/嵌套、焦点和 Escape 协议 | F1 | 受控拒绝更新、延迟取消、嵌套只关应关闭层、卸载无残留 |
| F3 | Trigger API 对齐与共同交互实现；定位算法通过平台适配迁移 | F2 | 双端 Trigger/Tooltip/Popover/Menu/Breadcrumb 回归，12 方位、滚动/尺寸/容器、SVG、SSR/hydration |
| F4 | Tooltip、Popover、Menu 主体与子菜单独立同源复制 | F3 | 单/多选、禁用、键盘、焦点恢复、事件顺序、递归子菜单、配对源码检查 |
| F5 | 遮罩、滚动锁、Dialog/Drawer/Popup 与过渡生命周期 | F2、F3 | 多层锁计数、恢复原样式、KeepAlive、触屏滚动、关闭竞态 |
| F6 | 选项归一化、字段映射、选择控制器、Form/Input 控制层 | F1、F4 | 对象值、单多选、父子关联、受控状态、异步校验竞态、IME |
| F7 | Select/Cascader/AutoComplete、日期与时间选取逻辑迁移 | F6 | 保留端侧面板，逻辑与数据契约同步，相关组件和 Demo 回归 |
| F8 | ResizeObserver、滚动/虚拟列表、配置/语言/主题与通用计算工具收尾 | 按依赖与 F1–F7 交错 | 各项单独判定同源/适配/独立，全量类型/构建/SSR/导出检查 |

## 第一阶段决策

1. useVModel：有 emit 时默认 update:key；无 emit 时兼容既有 onUpdate:key 回调。passive 行为先保留，不能全局换成严格受控而破坏输入组件。
2. Trigger 的 open 单独定义严格受控契约，不能直接依赖 passive useVModel 的本地镜像。外部状态更新不再派发 update 请求；生命周期跟随实际可见状态。
3. 节点能力支持 HTML、SVG、Fragment 和组件根节点；与弹层容器类型分开，popupContainer 仍保持 HTMLElement/selector/false。
4. 事件监听保存实际绑定的目标，支持 getter/ref 切换、停用恢复、幂等清理和 SSR 返回可调用清理函数。
5. 定位引擎不凭代码行数决定。Cedar 已有箭头、延迟、滚动关闭、容器/尺寸与样式能力；Maple 已有 reference/strategy、Popper 和命令式方法。补齐共同契约与回归证据后选择引擎，迁移前允许定位适配层并存。

## Trigger 契约与迁移清单

| 契约 | 迁移前差异 | 迁移要求 |
| --- | --- | --- |
| open/defaultOpen | Maple Trigger 缺 defaultOpen，使用 passive 镜像；Cedar 有严格受控模式 | 两端区分状态请求与实际变化；同步包装组件 |
| trigger | Cedar 默认 hover、支持数组/focus；Maple 默认 click、支持 manual | 最终统一枚举和默认；在 Menu/Tooltip 等调用者显式写原行为后切换默认 |
| 关闭 | Cedar 外部 mousedown、多个开关；Maple click、Escape | 定义统一事件阶段、嵌套关系、禁用、关闭原因，避免一击全关 |
| 延迟 | Cedar enter/leave/focus 延迟；Maple doubleRaf | 统一计时取消与过期事件处理 |
| 定位 | popupOffset/popupTranslate 与 offsetX/offsetY/strategy | 明确几何语义；迁移所有调用者，不能机械 alias 不同语义 |
| 渲染 | Cedar 箭头/内容层/懒卸载；Maple 常驻隐藏面板 | 明确 DOM、样式和生命周期；主题/动画同步 |
| 生命周期 | 两端 opened/closed 由动画驱动 | 动画与可见状态一致，切换中断不产生过期事件 |
| Ref/Expose | Cedar resize；Maple open/close/resize/setReference/getReference | 统一公开方法类型；原入口可继续导入 |
| SSR | 两端挂载策略不同 | 无 document/window 运行；真实 hydration 检查 |

## 每批工作规则

- 变更前保留工作区文件摘要和测试结果；只改当前批次归属文件，不 reset/clean/覆盖他人改动。
- 先写会暴露当前差异的行为测试，再修改一端，验证后复制另一端。
- 单库内部可以复用工具；两库只读比较允许规范化包名与命名空间，不忽略逻辑。
- 新基础工具必须接入实际调用者，不能以未使用的抽象作为完成依据。
- 每批修改相应 OpenSpec、API/迁移文档和状态表；只有通过双端验证才升级同源标记。
- 回滚按批次文件/提交边界进行，不回滚其他工作区修改；旧入口仅在兼容需要时保留本地转发。

## 验证策略

单元层：状态、事件、DOM/节点、时间控制、清理、对象值和类型。组件层：Trigger → Tooltip/Popover/Menu/Breadcrumb，随后覆盖 Select、Dialog 等实际消费者。浏览器层：真实尺寸/滚动、定位翻转、键盘、触屏与 hydration。构建层：两库 use/shared 构建、类型、UI 构建、包导出/SSR import。已有失败单独记录，不通过删除测试或全局放宽 TS 配置掩盖。

## 状态与交付

各批状态见 progress.md。整体重构只有 F0–F8 各适用项验收后才标记完成；阶段交付不等于全部组件已同源。

本轮已完成共同交互、弹层、滚动锁、23 处直接调用迁移及公开包入口修复。各条最终状态以 progress.md 为准；上表保留迁移前差异作为设计依据。

## 收尾判定

F0–F8 已按“共同核心 + 端侧适配 + 单端能力保留”完成实施与验收，逐项决策见 closure.md。选择保留 Cedar/Popper 定位适配、复杂选择和日期面板、规则引擎、Locale/主题上下文及无同端对应的 TreeSelect/虚拟列表；这些不标记为逐行同源。最终验证见 progress.md 与 verification.json。
