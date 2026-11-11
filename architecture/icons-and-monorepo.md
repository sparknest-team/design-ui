# Cedar monorepo 与统一 Icon 方案

Cedar 已经是 pnpm monorepo：根目录包含 `pnpm-workspace.yaml`，UI、presets、shared/use 包都位于 `packages/*`。它不需要再做一次“改造成 monorepo”，需要做的是重新划分包职责。

当前 icon 路径不同：Cedar 在 UI 包内通过 `scripts/generate/icongen` 从 `icon/icons.json` 生成 Vue 图标；Maple 有独立 `@maple-design/icons`，以 SVG 为源并生成字体、PNG、CSS 等多种产物。直接合并生成代码会把两套运行时和命名耦合起来。

推荐两端分别发布独立图标包，生成器保留在各自仓库内部，不强行共享图标源：

```text
cedar-design-web/packages/icons   # @cedar-design/icons-vue
maple-design-mobile/packages/icons # @maple-design/icons-vue
```

Cedar 当前的 Vue SVG component 路线作为技术方向，但不直接搬迁现有实现：它支持单图标 Tree Shaking、currentColor、多色 SVG、按图标设置 `aria-hidden`/accessible title，也不依赖字体加载和私有区字符映射。Maple 的 icon font、PNG 和旧 class API 直接移除，不建立兼容包。

Cedar 消费 `@cedar-design/icons-vue`，Maple 消费 `@maple-design/icons-vue`。两边只共享生成规范、包结构、无障碍要求和质量门禁，SVG、名称、分类和版本互不绑定。`icon-source` 没必要成为可安装包，`icon-builder` 也只是各仓库内部构建实现。

现有 Cedar 方案与 Arco 高度同源：287/291 个 Cedar 图标名称与 Arco 一致，生成器和 Vue template 也基本相同。新包不能只复制这份代码，需要补齐：稳定的 `exports`、独立于 UI 库的基础组件、`title`/`aria-label` 规则、SVG schema 校验、重复 path 检查、确定性生成、失败退出、按图标入口测试和 bundle-size 门禁。

迁移顺序：

1. 对 Cedar `icons.json` 与 Maple `svg/` 生成差异清单，确定 canonical 名和 alias。
2. 抽取 source 与内部 builder，不改变现有 UI 导出。
3. 两端生成器改为消费同一 manifest，并增加产物快照和重复 SVG 检查。
4. 分别发布 `@cedar-design/icons-vue`、`@maple-design/icons-vue`，验证单图标导入不会打入全集。
5. Cedar/Maple 包装层切换；Maple 内部约 71 个文件中的字符串图标引用一次性迁移为 SVG component/typed name。
6. 删除 Maple font、PNG、namespace 字体 class 与相关构建任务，不提供历史兼容。

不建议此时把 Cedar 和 Maple UI 源码放进同一 monorepo。共享 icon、contracts、tokens 的收益高，而合并两套发布节奏、文档站和历史构建链的迁移成本也很高。
