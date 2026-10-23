# Cedar / Maple Demo 人工审查入口

最新复查见 [2026-10-21 逐组件记录](./demo-recheck-2026-10-21.md)。

每个组件以一个组合案例承载可切换的 API，多个属性及常用内容插槽可以同时启用。复杂数据、回调、异步竞态、父子继承等场景仍保留原案例。此次接入不等于已经完成人工验收。

| 平台 | 组合审查入口 | 可选择场景 |
| --- | ---: | ---: |
| cedar | 98 | 291 |
| maple | 90 | 247 |

控制面板与已有案例使用各自组件库的真实控件：Cedar 使用 `c-*`，Maple 使用 `mp-*`。Checkbox、Button、Select、Input、InputNumber、Textarea、Collapse 等均不再由原生标签代替。FieldDecorator 也使用本库 Input 编辑展示值。

## 使用方式

1. 打开组件文档中的“组合审查 / API review”；Maple 的手机预览中也有同一入口。
2. 勾选属性名开启覆盖，再设置取值；可同时开启多个属性和插槽。取消勾选恢复原案例绑定。
3. default-* 等初始配置修改后使用“重新挂载”；“重置”会同时清除覆盖和预览内部状态。
4. 展开事件日志和实例方法，检查操作反馈。方法参数使用 JSON 数组；函数和 DOM 参数继续使用专项案例。
5. 根据专项 API 索引回到原案例检查复杂行为；字面量命中只用于定位，不计作验收通过。

## 参考文档入口

以下目录没有生成组件组合面板，保留现有全局配置、工具类或实践示例。它们不计入上表的已接入数量。

- cedar: themes
- maple: atomic-css, atomic-usage, color, palette, style, themes, typography, utilities

## 维护与验证

- 生成：`node design-ui/bin/generate-review-demos.mjs && node design-ui/bin/complete-review-demos.mjs`
- 配置与 SFC 编译：`node --test design-ui/bin/generate-review-demos.test.mjs && node design-ui/bin/review-demos-check.mjs`
- 面板交互：`cedar-design-web/node_modules/.bin/vitest run --root design-ui/packages/ui-doc-preview --config design-ui/packages/ui-doc-preview/vitest.config.mjs --threads false`（workspace 根目录）。
- Maple：`pnpm docs:check`、`pnpm lint:check`、`pnpm typecheck`。

详细配置及未进入当前 Props 表的源码属性见相邻 `demo-api-review.json`；生成规则和操作语义见 `../packages/ui-doc-preview/README.md`。

## 2026-10-20 历史验证结果（最新结果见上方复查记录）

- 187 个组合案例的 SFC 和配置编译检查通过；生成器 2 项、面板交互 5 项测试通过。
- 扫描 2173 个 demo SFC 及共享面板，禁止原生交互控件回退；Cedar 32 个受影响测试文件共 61 项、Maple 13 个文件共 39 项测试通过。
- Maple `docs:check` 检查 1153 个 demo SFC，0 失败；共享审查包独立类型检查、修改范围内的 Maple ESLint 均通过。
- 已在 Cedar、Maple 页面验证按钮变体、加载、图标插槽组合及事件反馈。
- 此前全仓 Maple `lint:check` 记录了 55 个错误、2 个警告，位于 SelectedOptions、Select、Cascader 的非 demo 文件；当时全仓 `typecheck` 有 selected-options 的 manager 测试中 4 处类型错误。2026-10-21 复查时 Maple 全仓 lint 与 typecheck 均已通过；历史错误日志只代表此前快照。
- 结果与错误日志见 [验证记录](./evidence/demo-api-review-2026-10-20/results.json)，页面效果见 [Cedar 截图](./evidence/demo-api-review-2026-10-20/cedar-component-controls.png) 和 [Maple 截图](./evidence/demo-api-review-2026-10-20/maple-component-controls.png)。

配对 demo 门禁也已运行，目前在 Card 首先失败：Cedar 原有的 `scheduler-lifecycle` 案例未进入 Maple/配对场景清单。新增 `api-review` 已纳入配对清单及双语元数据；此次没有删除该原案例来规避差异。完整日志见验证目录中的 `same-source.txt`。
