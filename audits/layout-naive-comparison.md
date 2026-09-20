# Layout 与 Naive UI 对比

依据本地 cedar-design-web/packages/cedar-ui/src/layout 与 naive-ui/src/layout 源码（2026-09-08）。Maple 当前没有 Layout 组件，不能标记为已同源。

## 当前问题及修复

- basic/resize 演示仍使用不存在的 --brand-3…6，背景色失效；样式没有 scoped，两个演示的同名 class 会互相影响。已替换为现有主题变量并隔离样式。
- Sider 的宽度使用合并后的 localCollapsed，collapsed 类却使用受控 prop，defaultCollapsed 和内部点击时两者不一致。已统一读取 localCollapsed。
- 侧栏为底部触发器预留 padding，但触发器仍在普通文档流；已定位到侧栏底部。
- 嵌套 flex Layout/Content 缺少 min-width/min-height: 0，长内容可能撑开布局。已补齐收缩约束，滚动策略仍由使用者配置。
- ResizeBox 的字符串引用有本地组件注册支持，本次未将其认定为错误。

- 浏览器暗色主题下还发现 light 侧栏固定白背景与浅色文字冲突；默认侧栏背景改用随主题变化的 surface token，深色侧栏明确设置文字颜色。

## 能力比较与建议

| 能力 | Cedar 当前 | Naive UI | 建议 |
| --- | --- | --- | --- |
| Header/Content/Footer/Sider 组合 | 支持，自动登记 Sider | 支持，要求显式 has-sider | 保留 Cedar 自动检测，同时保留 SSR 显式设置 |
| 折叠状态 | 受控、非受控、断点响应 | 受控、非受控 | 保留现有 collapsed/defaultCollapsed/breakpoint |
| 折叠方式 | 改变宽度 | width / transform | 优先新增 collapseMode，默认 width 保持兼容；transform 防止内容挤压 |
| 内容滚动 | Sider 原生 overflow，Content 无统一接口 | 原生/自定义滚动、scrollTo、scroll 事件 | 优先统一滚动容器和 contentStyle/contentClass，再接现有 Scrollbar |
| 固定头尾 | 使用者自行写 CSS | position=absolute + 嵌套布局 | 优先补真实应用 demo，再决定是否需要 position API |
| 边框与背景 | Sider theme，其他靠 CSS | bordered/inverted/embedded | bordered 优先；保留 theme，避免增加重复的 inverted 开关 |
| 侧栏位置 | 放置顺序 + reverseArrow | siderPlacement | 可以加 placement 统一箭头和边框方向，兼容 reverseArrow |
| 折叠触发器 | 底部 + trigger 插槽 | bar / arrow-circle | 后续按实际场景补；先完善键盘操作、零宽度展开入口 |
| 内容保留 | 始终显示 | showCollapsedContent | 可扩展，明确卸载/隐藏语义以及焦点处理 |
| 拖拽调整 | 已集成 ResizeBox | Layout 无直接对应接口 | 保留 Cedar 优势，补拖拽与折叠组合 demo |

## 尚待处理的兼容问题

SiderProps 声明 width 为 number|string，但运行时和 README 只允许 number；collapsedWidth 文档类型注释声称 0 有特殊 trigger，当前未实现。建议下一轮 API 统一时一起修正，避免本次基础修复悄悄改变公开契约。

## 同源方向

适合将 Layout/Header/Content/Footer/Sider 的 flex、折叠状态、滚动行为作为同一套源码，再用薄适配层区分前缀、图标和主题。移动端窄屏更适合用现有 Drawer 承载导航；不要仅把桌面侧栏压缩为 48px 当成完整移动适配。

建议顺序：基础修复 → 滚动与固定头尾 demo → 折叠模式及可访问性 → 明确 API 后新增 Maple Layout 菜单与源码。新增 API 按 Cedar OpenSpec 流程执行。本轮未增加这些扩展 API。

## 扩展落地（2026-09-08）

本轮已加入 Layout/Content 的 scrollable、三类滚动容器的 scrollTo/scroll 事件、Header/Footer/Sider bordered、Sider placement/collapseMode。补齐字符串宽度、原生键盘按钮、零宽度恢复和 inert 内容，以及两组交互 demo。当前采用原生滚动条，未增加自定义 Scrollbar、inverted 或 position API。六项测试、局部类型检查、Less 编译通过；浏览器验证了右侧 transform 折叠、零宽度按钮和键盘滚动。
