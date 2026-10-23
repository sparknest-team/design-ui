# Cedar / Maple 规范化计划收尾报告

日期：2026-09-18  
范围：`design-ui`、`cedar-design-web`、`maple-design-mobile`

## 结论

本轮计划中的基础设施、公共 API、主题体系、样式 Token、同源组件、Demo 与站点主题适配已全部落地。当前 `design-ui` 统一门禁覆盖 Cedar 95 个组件、Maple 88 个组件，规范扫描为 **0 error / 0 warning**；公共主题契约覆盖 54 个系统 Token 和 34 个组件。

计划文档里的 Foundation F0–F8、API 对齐和本阶段 Token 批次均已关闭。没有保留“尚未开始”的计划项；剩余内容属于后续工程治理和非阻断优化，见文末。

## 本轮完成内容

### 1. 统一契约与门禁

- `@ui-foundation/theme-contract` 扩展到 34 个组件。
- Select 纳入 11 个共同语义 Token；Form 纳入 8 个共同语义 Token。
- PC 与移动端独有结构必须登记为 platform extension，未登记的额外公开 Token 会被门禁拒绝。
- Button、Alert、Tag、Badge、Input 已启用严格同名 Token 检查。
- 修正 Token 扫描器的目录边界，Input 不再被 InputNumber / InputTag 污染。
- 更新同源组件、Foundation、Trigger、Demo、Grid export 等检查器，使其适配 PascalCase 文件名、`dropdown-menu` 新目录和 `demo` 引用式文档。
- 同源门禁对 TS/TSX 使用语义格式归一化，避免 Cedar / Maple 不同格式化配置制造假漂移。

### 2. 主题与样式变量

- Cedar 与 Maple 均保留两套品牌：Default 和 Maple；每套均包含 light / dark。
- 站点顶部菜单可同时切换网站外壳与组件主题，主题统一为 default / maple 品牌与 light / dark 模式。
- Maple 文档站 Demo 卡片、页面背景及暗色外壳完成适配。
- Maple Select 的 `scroller-*` / `option-*` 重构为统一的 `select-popup-*` 语义。
- Maple Form 的 label、help、required、spacing 等变量统一为公共 `form-*` 语义。
- Cedar Tag motion 与 Steps layer 改用公共系统 Token。
- 主题快照已按新 Token 更新。

### 3. 组件与行为修复

- Search history-popup：取消和选择历史后不再因恢复焦点重新弹出；弹窗输入框不重复显示历史下拉；聚焦不改变文字颜色。
- Tabs：恢复 `TabPane` 最简写法和自动解析；Cedar / Maple Demo、源码展示、标题与方向/指示器位置示例对齐。
- DropdownMenu：统一新目录、公共 props、键盘、selection、context 注入标识；子菜单缓存策略显式化。
- `usePopupContainer` 两端行为统一，兼顾 HTMLElement 直挂与 SSR selector 延后解析。
- AutoComplete：聚焦时同步刷新菜单，修复菜单仍为 `display:none` 的竞态。
- Rate：补齐 Form readonly 继承，修复只读表单内仍可修改评分的问题。
- Row / Col / FieldDecorator 补齐契约测试；FieldDecorator 补齐中文文档。
- Hover / Ripple 补齐公开 props 契约；RegisteredIcon / Rate compatibility wrapper 使用统一命名空间生成组件名。

### 4. Demo、文档与生成物

- 101 组 Cedar / Maple 配对 Demo 已校验：场景顺序、双语片段、locale、SFC 编译、22 个站点 Markdown transform 和 11 份完整 API 表。
- 修复 Grid / Row / Col API marker、Card 静态资源部署路径、Cedar SplitButton 受控 Demo 测试。
- Maple 377 个图标按 `@ui-foundation/ui-icons` 当前生成器重新生成，图标 stale check 已通过。
- Cedar AI 协作文档移除不可发布的站外相对链接。
- Cedar RRULE 在 VuePress SSR 中设为 `noExternal`，避免 ESM / CommonJS 导出差异。
- Cedar Scheduler business-calendar Demo 改为直接模块引用，消除该处 barrel circular chunk 警告。

## 验证结果

| 检查 | 结果 |
| --- | --- |
| `design-ui pnpm check` | 通过；Cedar 95 / Maple 88，0 error / 0 warning |
| Theme contract | 通过；54 system tokens / 34 components |
| 严格 Token | Button 71、Alert 81、Tag 145、Badge 78、Input 7，全部零差异 |
| Paired demos | 101 组通过 |
| Foundation copies | 66 组通过 |
| Trigger consumers | 24 个通过 |
| Cedar typecheck | 通过 |
| Maple typecheck | 通过 |
| Maple tests | 165 files / 1443 tests 全部通过 |
| Cedar tests | 首轮 204 files / 1077 tests 通过；3 个失败点已修复并定向回归 3/3 通过 |
| Maple full build | 通过；774 个 Demo SFC 零失败，生产站构建成功 |
| Cedar library build | 通过 |
| Cedar docs build | 通过；263 页完成 SSR 渲染，清理后的构建无上述链接、RRULE 与 Scheduler circular warning |

## 遇到的问题与处理

1. **代码已迁移，门禁仍引用旧路径。** `menu/*.vue`、小写组件文件名和旧内联 Demo 规则造成误报。门禁已迁移到 `dropdown-menu`、PascalCase 与引用式 Demo。
2. **两仓格式化配置不同。** 文本逐字比较会把注释、换行、import 顺序误判为实现漂移。改为 TS/TSX 编译归一化，并由行为测试覆盖 Vue SFC。
3. **公共 Token 与平台结构不可能完全一一对应。** 采用“共同语义强制一致 + 平台扩展显式登记”，避免为了数字一致制造无效变量。
4. **测试快照仍引用旧 Token 与旧浮层挂载行为。** 对确认属于本次设计变更的快照进行了更新，并对 AutoComplete / Rate 的真实行为回归进行了代码修复。
5. **Maple 图标生成物整体过期。** 构建时由 stale check 发现，已重新生成 377 个图标；因此本次 diff 中图标文件数量较多，但属于机械生成结果。
6. **RRULE 同时面对浏览器 ESM 与 VuePress SSR 的 CommonJS。** 使用 named import，并在文档 Vite SSR 配置中将 `rrule` 内联转换。

## 最终状态与后续事项

### 已完成，可进入人工验收

- 计划内改造已完成，三仓代码与公共契约已落地。
- Maple 全量测试、类型检查、组件库构建和文档站构建均通过。
- Cedar 类型检查、组件库构建及本轮失败点回归通过。
- 所有统一规范扫描已清零。

### 后续非阻断事项

- Maple 文档构建仍会输出较多 barrel re-export / manualChunks 警告和大 chunk 提示；产物成功，但建议下一阶段做文档站拆包与直接导入治理。
- Cedar 测试存在 TableColumnManager 用例未注册部分全局组件产生的 Vue warning；测试本身通过，建议单独清理测试夹具。
- Cedar 仍使用较旧的 Vitest / Vite CJS Node API，会输出弃用提示；适合后续依赖升级阶段处理。
- 当前工作区包含本系列任务的全部未提交修改；本轮未执行 commit、发布或版本号变更。

## 周日建议验收顺序

1. 打开 Cedar / Maple 文档站，切换 Default / Maple 与 light / dark，重点看页面背景、Demo 卡片、Tabs、Select、Form、Search。
2. 检查 Maple 图标 diff 是否全部为生成器机械变化。
3. 运行 `cd design-ui && pnpm check` 复验公共门禁。
4. 确认无产品设计调整后，再按三个仓库分别提交，避免把生成物、契约与组件实现混成一个无法审阅的提交。
