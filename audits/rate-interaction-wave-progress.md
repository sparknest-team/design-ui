# Rate 本批收口

## 实现范围

- 先完善 Cedar rate-core，再复制为 Maple 独立文件；props、主体、样式规则保持规范化一致。不共享运行时组件实例。
- 补齐 aria-label、focus/blur、RateExpose/RateEmits/RateCharacterSlotProps 导出；size/gap 保留 number|string CSS 长度，不接受尺寸档位。
- 修复 readonly 表单继承与可聚焦语义、受控拒绝不更新内部值、外部更新静默、非法/越界数值、clearable 键盘边界误清空、hover 状态回收。
- 修复两端样式仍引用旧 left/right DOM 导致的选中色失效；默认半选/选中、禁用、错误、focus-visible、reduced-motion 规则对齐。
- Maple 删除 Rate.vue 兼容薄壳，测试直接使用正式实现。
- Cedar 补齐 icon/ripple 显式样式依赖，移除无关 tooltip 样式依赖；Maple 移除无关 hover 样式依赖。
- 两端新增键盘/状态与尺寸/符号 Demo；Maple 对应独立英文 Demo；Props、Events、Slots、Methods、类型与 Token 文档完整更新。

## 明确保留的差异

- use-rate-form.ts：仅连接各库现有 FormItem/Form 注入协议。
- style/token.less 与 appearance.less：独立平台主题默认值映射。Cedar 金色、紧凑间距；Maple 主色、4px 触控内边距。未迁移或重命名公共 Token，私有映射使用 internal 命名空间。
- 图标包导入路径、命名空间工具、安装入口保留本库协议。

因此建议标记为 **逻辑同源 logicSame**，不宣称公共 Token 或整目录完全同源。

## 验证

- node design-ui/bin/rate-core-check.mjs：通过，检查 3 组主体/Props/测试、3 组样式规则/入口、2 组 Demo 规范化一致性；实际编译两端 Less 验证关键状态选择器、焦点与低动态效果规则。
- Cedar Rate 22 项测试通过；Maple Rate 39 项测试通过。新增 18 项/端覆盖受控/非受控、Form 继承与显式覆盖、键盘、只读/禁用、触屏半分坐标、实例隔离、SSR、非法输入及尺寸。
- 两端 src/rate 定向 ESLint 通过；git diff --check 通过。
- Cedar pnpm typecheck 通过；Maple typecheck、文档编译与构建由主批次集成复核。默认 tsconfig 的直接 vue-tsc 命令不适用于 Cedar 发布声明，使用 pnpm typecheck。
- 本批未完成真实浏览器视觉验收；单测/编译结果不替代视觉验收。

2026-10-09 批次集成结果与最新分类：[依赖分批并行验收记录](./priority-batch-2026-10-09.md)。上文未完成项为该子阶段快照，以批次记录为准。

## 第二批公开样式契约收口（2026-10-09）

上文“公共 Token 未对齐”为第一批历史状态，本批已统一 15 个公开后缀和私有映射：几何、选中/空值/错误/禁用颜色、焦点、动效均可同名定制。平台默认值登记 theme-contract，Maple 重复暗色覆盖移除。仅本地 Form/安装、前缀/图标路径及已登记默认值保留差异，可按现有同源定义升级 same。

门禁增加保留公开 TypeScript 的 AST 对照、完整公开 Token 消费检查及组件根私有映射检查。另一 Token 验收任务完成真实 Chromium 四主题实例覆盖验证，证据见 [局部覆盖验收](./token-responsive-followup-2026-10-09.md)。本批其它组件不借用该视觉结论。
