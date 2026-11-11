# Alps / Firefly 真实样式映射与完整表单验证

日期：2026-10-25。目标：保留 Maple 表单封装，在已登录 HoroUI 文档提供的真实样式上实现两个品牌主题。工作区含其他任务的未提交修改；本报告不等于全库发布验收。

## 已交付

- `Themes.alps.light`、`Themes.firefly.light`。每品牌 182 项可追溯来源映射及少量 Maple 尺寸/状态适配，保持 `StyleProvider.setStyleVars()` 使用方式。主动作、文字、辅助选择色分别映射，不把品牌色表的第 6 档直接当成主按钮。
- 文档站、手机示例、Playground 的两个品牌入口；亮色外壳继承文档站现有亮色配置，避免从暗色切换后留下暗色背景。
- `--mp-field-variant-outline-background`、`--mp-checkbox-control-border-radius` 两个公开样式入口；Cedar 对应 Token、实现及共享契约同步，默认外观保持透明背景和 2px Checkbox 圆角。
- 同一份完整预约表单：文本、手机号、数字、Select、Cascader、日期、时间、Radio、Checkbox、Switch、Textarea、Upload、必填校验、disabled、readonly、readPretty、popup 草稿事务、重置、底部 SafeArea。附件仅本地预览。
- [主题文档](../../maple-design-mobile/packages/ui/src/themes/docs/zh-CN.md) 解释主题覆盖、真实值、字体加载和视觉边界；[App 安全区入口](../../maple-design-mobile/packages/ui/src/safe-area/docs/zh-CN.md) 解释宿主注入、0 覆盖、横屏、嵌套消费和 Teleport。

## 采集方法与边界

HoroUI 浏览器 DOM 接口超时后，使用已登录 Chrome 的原生界面读取页面，并通过“网页，全部”保存页面及 iframe。提取的是示例 iframe 的 `<style id="docs-token-style">`，不是文档外壳的配色。分别确认 `h-root-alps-namespace` / `h-root-fy-namespace`。

随后在本地 Chromium 中仅加载提取的 CSS，禁止所有网络请求，计算 custom properties 的级联和 `var()` 结果。没有执行下载的私有 JS，没有读取或导出 Cookie。原始站点快照留在临时目录，不随组件库发布。

[逐 Token 来源与数值证据](evidence/horo-brand-tokens-2026-10-25.json) 包含源页面 URL、样式 SHA-256、命名空间、来源 Token 和计算值。品牌 `fy` 规范化为公开名称 `firefly`。本次两份 CSS 摘要：

- Alps：`ad3bcf3ba6c48cf67460c2df8d96f6d8c7f457eaf6d67e2a88c6f0aca854629a`
- Firefly：`9b977e0f6d953f2461e4655c2c9cd3cd20ead2345e6768e7d88c27bc3cbc6eb0`

暗色 class 在采集 CSS 中没有完整反转色板；Firefly 根变量甚至没有变化。初次交付仅导出实采 `.light`；后续按用户要求补充了明确标记来源的 Maple 暗色适配版，见 [暗色与安全区模拟](maple-brand-dark-safe-area-2026-10-25.md)。

## 关键差异

| 角色 | Alps | Firefly |
| --- | --- | --- |
| 主按钮 / 文字 | #090C1A / 白 | #EAFF68 / #17224B |
| 主按钮按下 | #393C48 | #CFDF26 |
| 输入框圆角 / 背景 | 0px / transparent | 24px / rgba(23,34,75,.04) |
| 聚焦边框 / 光标 | #090C1A / #DA2C00 | #9A89EB / #CFC7FF |
| Checkbox / Radio 选中色 | #FF3D00 | #CFC7FF |
| Switch 选中色 | #FF3D00 | #B6A8FB |
| Checkbox 圆角 | 999px | 8px |
| 字体族 | ALPSSans-Regular | Pyro QiHei |

## 实际浏览器验收

`pnpm check:brand-form` 在 390×844 运行两份相同数据的完整表单，额外切换至 844×390 检查溢出。验证：

- 主按钮前景/背景、原生光标、Field 圆角及背景、Checkbox 圆角、Switch 轨道与采集证据逐项一致。
- 必填校验失败与修正后成功；表单禁用和只读继承；readPretty 不保留编辑输入。
- 本地附件状态变成 success，不发送请求。
- popup 关闭丢弃草稿、确认才回写模型；body 弹层继承主题。
- 提交区消费 34px 模拟 App 安全区；字段面板自身有 8px 留白 + 34px 安全区，没有在 Popup 外层再加一遍。
- 切换到 Maple dark 会清除品牌圆角覆盖；切回品牌会移除 dark 属性。

效果截图：[Alps 完整表单](evidence/alps-form-2026-10-25.png)、[Firefly 完整表单](evidence/firefly-form-2026-10-25.png)、[Alps 编辑弹层](evidence/alps-popup-2026-10-25.png)、[Firefly 编辑弹层](evidence/firefly-popup-2026-10-25.png)。

这些是本地 Chromium 与模拟宿主 inset 的结果，不是 iOS/Android 真机或 App SDK 验收。Maple 的字段高度、标签、帮助文案、弹层结构、图标和阴影保留现有实现，不宣称 Horo 像素级一致。品牌字体族已映射，字体二进制未分发，需宿主在有授权的情况下加载。

## 验证记录

- 品牌完整表单 Chromium：2/2 通过。
- 主题、FieldDecorator、Checkbox 控件契约定向单测：7 文件，64/64 通过。
- 类型检查通过；库全量构建通过；包检查 3388 文件，0 errors / 0 warnings。
- 共享主题契约通过（65 system，1036 component values，49 components）；三页生成 Token 参考检查通过；spec check 90 components，0 errors / 0 warnings。
- 首次生产文档构建通过（1478 示例检查，4940 模块）。后续更新文档外壳后再次验证，结果追加在下方。
- 本次文件定向 ESLint 通过。全库 ESLint 运行时出现其他正在修改的 `src/_hooks/__tests__/async-data.spec.ts`、`packages/use/src/useAsyncData.ts` 等格式问题；未覆盖其他任务的代码。
- 扩大到全部 Checkbox 示例时，`demo-language.spec.js` 的两项测试期望 dialog 入口，但当前示例输出 inline 控件。这两项与本次颜色/圆角映射无关，未将其计为通过。

文档构建期间，新增 Select 示例的相对路径写成 `./example/...`，解析到不存在的 `select/docs/example`。仅将该引用修正为 `../example/demos/async-source.vue` 以解除构建阻塞，未修改该示例行为。

## 最终补充验证

- 文档站背景回退修复后，320 / 375 / 390px 的 example 与 documentation 六项生产回归全部通过；每项遍历六种主题并检查刷新持久化。
- CLI：7 文件，13 项测试通过。
- 最终 `pnpm build:doc` 通过，1479 个示例 SFC 检查、4942 模块构建成功。
- Themes 手机示例补上与其他示例一致的 `onThemeChange()` 初始化，确保从已保存的品牌主题首次进入即应用样式。

- 最终生产手机文档完整表单：Alps / Firefly 2/2 通过。使用 iPhone 浏览器上下文，验证首次应用保存的品牌、实际点击按钮双向切换、必填校验、Date / Upload 解析及窄屏布局；[Alps 生产页面](evidence/alps-production-2026-10-25.png)、[Firefly 生产页面](evidence/firefly-production-2026-10-25.png)。
- 合计：77 项定向组件/CLI 测试、10 项浏览器回归通过；本次文件定向 ESLint 通过。全库校验的其他任务问题按上文单独记录，未声称整条 quality 通过。
- `pnpm check:brand-form` 包含源表单和生产文档两组检查；需先构建文档。已接入 quality 的文档构建后步骤。
