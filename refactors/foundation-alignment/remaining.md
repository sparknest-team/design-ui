# 收尾结果与保留差异

更新：2026-09-08。原六项基础层迁移已完成实施与验收，详细源码归属、真实消费者及适配判断见 [closure.md](./closure.md)，验证结果见 [progress.md](./progress.md)。两库保持独立运行时。

| 原待办             | 收尾结果                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Menu 主体          | 五个 SFC、props/types/context/level/options/render/selection/keyboard 均已同源；剩余差异仅为原生视觉、Trigger 参数和兼容默认值 |
| 模态容器           | 共同焦点/栈/滚动锁/过渡；Dialog、Drawer、Popup、Overlay 已迁移并验证嵌套、KeepAlive 与取消离场                                 |
| Trigger 边界       | 2026-09-20 已完成 Trigger、Tooltip、Popover 主体、Props、样式与契约测试同源；包装组件只保留各自语义和外观，不复制定位算法      |
| 选项与 Form/Input  | 字段/值身份/过滤、异步选项标签、表单路径、校验竞态、IME 已接入消费者；规则表达与上下文保留适配                                 |
| 选择及 Picker 家族 | Cascader 共用树遍历，日期/时间/范围共用计算基础；端侧输入/日历/时钟/滚轮及草稿确认保留                                         |
| hooks/utils        | 父子注册顺序、KeepAlive、ID、手势 RAF、ResizeObserver 与断点监听完成审计和迁移；StyleProvider SSR 调用修复                     |

保留而非强行复制：复杂面板和规则引擎、Locale/主题上下文；Trigger 定位引擎已在 2026-09-20 统一，不再属于保留差异。Cedar 单端 TreeSelect/虚拟列表等没有 Maple 同职责 API，不生成无消费者副本。完整 Select/Cascader/Picker SFC 不是逐行同源，共同计算与行为基础由复制门禁保护。

验证边界：已运行浏览器合成触摸与 visualViewport 检查；未宣称覆盖所有实体移动设备、任意 CSS 旋转或所有 Teleport hydration 组合。这些属于兼容性覆盖范围，不以普通组件快照冒充硬件验收。
