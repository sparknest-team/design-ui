# 包目录与框架边界

更新日期：2026-11-10。scope 保持 `@cedar-design`、`@maple-design`、`@sparknest`。

## 命名规则

- 仓库彼此独立，`packages/` 下的目录使用职责名，例如 `ui`、`use`、`shared`、`cli`、`icons`，不添加品牌前缀。
- 所有 package.json 的包名（包括 workspace 根包、私有包和模板）标明 `-vue` 或 `-react`。
- scope 表示品牌；目录表示职责；包名末尾表示框架。
- 公开入口分别是 `@cedar-design/ui-vue`、`@cedar-design/ui-react`、`@maple-design/ui-vue`、`@maple-design/ui-react`。
- CLI 的现有执行命令 `cedar-cli`、`maple-cli` 保持兼容；它们是可执行命令，不是 npm 包名。

## 独立性

Vue 和 React 独立维护源码、CSS、token、hooks、工具函数、构建工具、preset 与文档站。禁止跨框架工作区依赖、相对路径导入或 CSS 复用。历史复制来源只作为 provenance 记录，不参加跨仓库构建或逐文件一致性约束。

`design-ui` 当前仅服务 Vue：其中的工具包均使用 `-vue` 后缀。Cedar Vue 和 Maple Vue 可以使用这些 Vue 工具；React 不依赖这个仓库。React 对应工具由独立仓库 `design-ui-react` 提供，包名分别为 `@sparknest/ui-build-react`、`@sparknest/ui-doc-preview-react`、`@sparknest/ui-icons-react`、`@sparknest/theme-contract-react`。两个 React 库已接入 React 构建与预览工具；未来的 React preset 也只在 React 产品线内独立实现。

每个仓库的 `pnpm check:packages` 检查包名、目录、直接依赖和源码导入边界，并已接入 quality/check。

## 全量清单

| 仓库                      | 相对目录                      | 包名                                   | 私有 |
| ------------------------- | ----------------------------- | -------------------------------------- | ---- |
| cedar-design-web          | `.`                           | `@cedar-design/workspace-vue`          | 是   |
| cedar-design-web          | `tests/vue-compat/minimum`    | `@cedar-design/vue-compat-minimum-vue` | 是   |
| cedar-design-web          | `tests/vue-compat/3-3`        | `@cedar-design/vue-compat-3-3-vue`     | 是   |
| cedar-design-web          | `tests/vue-compat/3-4`        | `@cedar-design/vue-compat-3-4-vue`     | 是   |
| cedar-design-web          | `tests/vue-compat/current`    | `@cedar-design/vue-compat-current-vue` | 是   |
| cedar-design-web          | `packages/cli`                | `@cedar-design/cli-vue`                | 否   |
| cedar-design-web          | `packages/icons`              | `@cedar-design/icons-vue`              | 否   |
| cedar-design-web          | `packages/preset-tailwindcss` | `@cedar-design/preset-tailwindcss-vue` | 否   |
| cedar-design-web          | `packages/preset-unocss`      | `@cedar-design/preset-unocss-vue`      | 否   |
| cedar-design-web          | `packages/resolver`           | `@cedar-design/resolver-vue`           | 否   |
| cedar-design-web          | `packages/shared`             | `@cedar-design/shared-vue`             | 否   |
| cedar-design-web          | `packages/ui`                 | `@cedar-design/ui-vue`                 | 否   |
| cedar-design-web          | `packages/use`                | `@cedar-design/use-vue`                | 否   |
| maple-design-mobile       | `.`                           | `@maple-design/workspace-vue`          | 是   |
| maple-design-mobile       | `tests/vue-compat/minimum`    | `@maple-design/vue-compat-minimum-vue` | 是   |
| maple-design-mobile       | `tests/vue-compat/3-3`        | `@maple-design/vue-compat-3-3-vue`     | 是   |
| maple-design-mobile       | `tests/vue-compat/3-4`        | `@maple-design/vue-compat-3-4-vue`     | 是   |
| maple-design-mobile       | `tests/vue-compat/current`    | `@maple-design/vue-compat-current-vue` | 是   |
| maple-design-mobile       | `packages/cli`                | `@maple-design/cli-vue`                | 否   |
| maple-design-mobile       | `packages/icons`              | `@maple-design/icons-vue`              | 否   |
| maple-design-mobile       | `packages/preset-tailwindcss` | `@maple-design/preset-tailwindcss-vue` | 否   |
| maple-design-mobile       | `packages/preset-unocss`      | `@maple-design/preset-unocss-vue`      | 否   |
| maple-design-mobile       | `packages/resolver`           | `@maple-design/resolver-vue`           | 否   |
| maple-design-mobile       | `packages/shared`             | `@maple-design/shared-vue`             | 否   |
| maple-design-mobile       | `packages/touch-emulator`     | `@maple-design/touch-emulator-vue`     | 否   |
| maple-design-mobile       | `packages/ui`                 | `@maple-design/ui-vue`                 | 否   |
| maple-design-mobile       | `packages/ui-playground`      | `@maple-design/ui-playground-vue`      | 是   |
| maple-design-mobile       | `packages/use`                | `@maple-design/use-vue`                | 否   |
| maple-design-mobile       | `packages/vite-plugins`       | `@maple-design/vite-plugins-vue`       | 否   |
| maple-design-mobile       | `packages/vscode-extension`   | `maple-vscode-extension-vue`           | 是   |
| cedar-design-web-react    | `.`                           | `@cedar-design/workspace-react`        | 是   |
| cedar-design-web-react    | `packages/cli`                | `@cedar-design/cli-react`              | 是   |
| cedar-design-web-react    | `packages/shared`             | `@cedar-design/shared-react`           | 是   |
| cedar-design-web-react    | `packages/ui`                 | `@cedar-design/ui-react`               | 否   |
| cedar-design-web-react    | `packages/use`                | `@cedar-design/use-react`              | 是   |
| maple-design-mobile-react | `.`                           | `@maple-design/workspace-react`        | 是   |
| maple-design-mobile-react | `packages/cli`                | `@maple-design/cli-react`              | 是   |
| maple-design-mobile-react | `packages/shared`             | `@maple-design/shared-react`           | 是   |
| maple-design-mobile-react | `packages/ui`                 | `@maple-design/ui-react`               | 否   |
| maple-design-mobile-react | `packages/use`                | `@maple-design/use-react`              | 是   |
| design-ui                 | `.`                           | `@sparknest/design-system-vue`         | 是   |
| design-ui                 | `packages/theme-contract`     | `@sparknest/theme-contract-vue`        | 否   |
| design-ui                 | `packages/ui-build`           | `@sparknest/ui-build-vue`              | 否   |
| design-ui                 | `packages/ui-doc-preview`     | `@sparknest/ui-doc-preview-vue`        | 否   |
| design-ui                 | `packages/ui-icons`           | `@sparknest/ui-icons-vue`              | 否   |
| design-ui                 | `packages/vuepress-plugins`   | `@sparknest/vuepress-plugins-vue`     | 否   |
| design-ui-react           | `.`                           | `@sparknest/design-system-react`       | 是   |
| design-ui-react           | `packages/theme-contract`     | `@sparknest/theme-contract-react`      | 否   |
| design-ui-react           | `packages/ui-build`           | `@sparknest/ui-build-react`            | 否   |
| design-ui-react           | `packages/ui-doc-preview`     | `@sparknest/ui-doc-preview-react`      | 否   |
| design-ui-react           | `packages/ui-icons`           | `@sparknest/ui-icons-react`            | 否   |

Maple 另有 `maple-library-template-vue`（CLI 生成模板）和 `maple-playground-demo-vue`（Playground 下载模板），不属于 workspace 包。CLI 生成项目时会把模板名称替换为用户输入的项目包名，不再沿用正式 UI 包名。

## 迁移与发布

源码 import、workspace/link 依赖、tsconfig、构建/发布脚本、测试与当前文档均使用新名称。历史 CHANGELOG、已封存的 release 结果和原始浏览器证据保留原名称；不能把它们当作新包名的发布或验收记录。

这些新包名尚未由本次迁移发布到 npm。两个 Vue 仓库通过 pnpm overrides 链接同级 design-ui 的 Vue 工具，发布包仍保留 semver 依赖。发布时需要先发布 design-ui 工具，再发布 shared/use/icons/preset/resolver/cli，最后发布 UI；不能依赖旧名字在 registry 上的版本。VS Code 扩展的新标识也需要单独发布。

Cedar、Maple 和新生成的 Maple 项目从 `@sparknest/vuepress-plugins-vue` 加载 VuePress 示例插件。源码、测试和上游许可集中在 `design-ui/packages/vuepress-plugins`。

React 本地安装顺序：先在同级 design-ui-react 运行 pnpm install，再在两个 React 组件库运行 pnpm install。公开包发布顺序为 React 支持工具先于 React UI。CI 跨私有仓库读取使用 DESIGN_UI_TOKEN，需要包含 design-ui-react 的 contents:read 权限。

## 递归包检查（2026-11-11）

check:packages 按各仓库 pnpm-workspace.yaml 的 packages glob（含排除模式）递归识别根包、工作区包和两个明确登记的 Maple 项目模板。内部源码目录不允许额外 package.json；新增模板必须显式登记用途和名称。下载应用模板必须 private，不能泄漏 workspace/catalog 本地依赖。

门禁同时检查重复包名、自依赖、缺失工作区依赖、npm alias 框架边界、本地 link/override 目标、CLI 入口及占位仓库链接；使用各仓库自己的 TypeScript 解析器读取真实导入、类型导入和动态导入，并拒绝脚本语法错误。注释、普通字符串和原始历史证据不作为运行时依赖。

组件库模板必须同时提供 ui-build.config.mjs 和 tsconfig.declaration.json，生成项目的所有依赖字段都不能保留本地协议；运行时依赖与 types-generated 必须进入最终发布清单。

Maple 的 check:cli 包含真实模板生成、SFC/TSX 与国际化开关四种组合的编译打包、公开入口解析回归，typecheck:playground 使用 Golar 的 tsc 模式 检查编辑器应用，两个入口都已接入 quality。固定工具类通过 @maple-design/ui-vue/utilities/style 导入；区域 JSON 与编辑器元数据分别使用公开的 json/_、highlight/_ 子路径。

Cedar / Maple 的 `tests/vue-compat/{minimum,3-3,3-4,current}` 是显式声明的私有工作区，用于不同 Vue 版本的真实消费验证。它们参加包名、重复名称、依赖与源码边界检查，必须 private；未声明或被排除的 fixture package.json 仍会失败。
