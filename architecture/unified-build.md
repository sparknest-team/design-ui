# Cedar / Maple 统一构建方案

统一采用 Maple 的“CLI + 项目配置文件”使用形态。把与品牌无关的构建内核放到 `design-ui` 的 `@loca/ui-build`；保留 `@maplejs/maple-cli` 作为 Maple 的产品层，并新增很薄的 `@cedarjs/cli` 产品层。Cedar 与 Maple 源码、图标和文档配置仍在各自仓库。

## Maple CLI 保留边界

继续保留在 Maple CLI：

- PC/Mobile 文档站、demo iframe、主题与语言联动。
- `maple.config.mjs` 中 Maple 特有的主题、导航、SEO 和站点配置。
- component create/gen 模板及 Maple namespace 默认值。
- VSCode extension 开发构建。
- Maple release/changelog/checklist 命令入口及 Maple 包清单、scope、registry 配置。
- `client` 中依赖 Maple `StyleProvider`、Themes 和站点 config 的运行时代码。

下沉到 `@loca/ui-build`：

- compile modules/bundle/style/types/metadata。
- Vite/Rollup/Vitest 的基础配置。
- dev/build/preview/test 的通用执行器。
- package exports、SSR、Tree Shaking、包体积检查。
- Changesets 校验、版本计划、发布前检查、provenance 等两端完全相同的 release 流程函数。
- 组件脚手架引擎；品牌模板仍由 Cedar/Maple CLI 提供。

删除或替换：icon font/PNG 构建、正则 import compiler、Babel+esbuild 双重 TSX 转译、吞掉构建异常的 `runTask`。

原则是“机制公共、配置归产品”：`cedar-cli release` 与 `maple-cli release` 是独立入口，但都调用 `design-ui` 的公共 release core；包名、scope、发布顺序、registry 和站点动作仍放在各自仓库。若某个 release 动作只服务一端，则不下沉。

## 标准产物（以 Maple 为准）

- `es/`：保留模块结构的 ESM，支撑按需加载和 Tree Shaking。
- `lib/`：保留模块结构的 CJS，仅在仍有消费方需要时生成。
- `umd/`：完整 UMD 和合并 CSS，仅供 CDN/浏览器直引。
- `types/`：由 `vue-tsc` 从源码生成声明。
- `highlight/`、`json/`：与 Maple 相同的 IDE/组件元数据产物。
- `package.json#exports`：声明 root、组件子路径、style 和 resolver；入口必须通过 package check。

## 标准工具链

- Vite/Rollup 负责 bundle 与模块构建。
- `vue-tsc` 负责类型检查和声明生成。
- Less 只编译样式，不通过正则改写 JavaScript import。
- 构建错误必须向上抛出并以非零状态退出。
- 默认 externalize `vue` 和 peer dependencies。
- 每次构建后执行 exports、SSR import、Tree Shaking 和包体积检查。

## 不直接沿用的历史实现

- Cedar 的 Gulp、`@esbuild-kit/cjs-loader` 和手写 Rollup task。
- Cedar 同一路径并发写 ESM/UMD 的 full build。
- Maple 使用正则解析和改写 import 的 compiler。
- Maple Babel + esbuild 双重转译 TSX。
- Maple 手写汇总类型代替真实源码声明。
- Maple `runTask` 捕获错误但不重新抛出的行为。

## Resolver

Cedar 新增与 Maple 完全同构的独立 `@cedarjs/resolver` 包：相同的 `autoImport`、`importStyle`、`directives` 选项，相同的 ESM/CJS/types exports，并解析到 `@cedarjs/ui/es/<component>/style/index.mjs`。Cedar UI 包内的 `resolver.ts` 删除，resolver 不再混入 UI 构建产物。

迁移先在 Cedar 落地并以 Maple 产物结构作为验收基线：`es/lib/umd/highlight/types/json`、文件扩展名、style entry、resolver 和 package exports 均一致。实现可先复用 Maple CLI，但应同步修复错误吞掉、正则改写 import 和类型生成问题；不能长期让 Cedar 对外暴露名为 `maple-cli` 的构建依赖。
