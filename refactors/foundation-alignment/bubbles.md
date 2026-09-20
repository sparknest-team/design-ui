# Tooltip/Popover 主体第五批

2026-09-08。两库各自复制 Tooltip、Popover 的完整 SFC 和 trigger/wrapper.ts；只有本库 props 默认值与 platform.ts 外观适配不同，没有跨库运行时依赖。

## 改动

- 删除 Cedar Tooltip/Popover 的本地开关镜像、Popover 的生命周期 watch 和无意义 placement 映射。Trigger 独立管理受控请求、延迟、卸载和过渡事件。
- 统一转发 update:open → open-change、open/opened/close/closed/click-outside。补齐 Maple Tooltip 的 open-change；Cedar 默认打开也转发首次 open。
- 两端明确声明并转发底层 Trigger 交互/渲染属性，避免不透明的 attrs 或遗漏某些参数。公共方法统一为 open/close/resize/allowClose/getReference/setReference/focusReference。
- Maple Popover 增加 title/content 属性及 title 插槽，原 content 插槽保留；Tooltip 补齐 backgroundColor/color/textColor/xs，保留旧命名。
- 原生默认保持：Cedar 两者 hover/top/100 ms/箭头/关闭卸载；Maple Tooltip hover、Popover click，二者 bottom/零延迟/无箭头/缓存内容。
- Tooltip 的 role 位于实际内容元素。Cedar contentClass/contentStyle 随样式移到内层内容；Maple Popover 新增 title/body 子层。两端文档说明了直接子元素 CSS 的迁移。
- Maple 新箭头跟随其既有内容偏移，使用独立 translate 保留几何层的旋转；背景颜色与内容一致。平台标题/小尺寸 token 和样式补齐。
- 明确声明包装层与外观返回类型，避免 CSS 类型和完整 Trigger 实例推导传播到 Form/Image/Slider 的声明，保持可移植 DTS。

## 引用与验证

| 库 | 调用方 | 处理 |
| --- | --- | --- |
| Cedar | Breadcrumb、AvatarGroup、Ellipsis、FormItemLabel、SliderButton、ImagePreviewAction、Typography、NavMenu、Transfer、Table/AutoTooltip | 保留原组件/插槽/事件，纳入扩大调用链回归；Popover 内部 trigger 断言改为验证直接转发值 |
| Maple | Breadcrumb、AvatarGroup、Ellipsis | 保留调用方式；Ellipsis 旧 Trigger DOM 快照迁移至共同定位/动画/内容层 |
| 两端 | Tooltip/Popover 公共子路径与安装入口 | 运行时 props、DTS、方法、事件、默认值和 ESM/CJS 无 DOM 导入检查 |

配对 wrapper-contract 每端 16 项，覆盖受控拒绝与事件顺序、首次打开及方法幂等、参数转发、缓存/卸载、引用替换和重置、SVG、样式与插槽覆盖、Popover title/content 与 Tooltip role。

本批扩大回归：Cedar 253/253（57 文件）；Maple 390/390（39 文件）。Maple Ellipsis 快照差异经审阅是此前 Trigger 渲染层迁移，Tooltip 快照是属性顺序变化，Popover 快照是新增 title/body 子层。

真浏览器 14/14：两端各四个主方位的箭头连接和颜色、实际 More 图标直接 hover 与 Escape、Popover 受控 title/content 生命周期、缓存草稿。用实际图标复验了最初“省略项 content + More 图标 Tooltip 不显示”的使用方式。不是视觉主题/全部移动设备的穷举验收。

两端 UI 完整构建、声明与公开类型契约通过；bubbles-runtime-check 验证 Tooltip/Popover 的 ESM/CJS 安装、无 DOM 导入、公开 controls 和保留默认。同源检查扩展到 48 对，直接 Trigger 23 处，静态基础清单 14 组。

复验入口：browser/bubbles.html、bin/bubbles-runtime-check.mjs。下一步及完整未完成项见 [remaining.md](./remaining.md)。
