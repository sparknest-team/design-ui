# 构建与 CI 公共契约

Cedar / Maple 的库构建都使用 `@sparknest/ui-build`。源码同源、单测通过和源码打包体积通过，不能替代真实发布产物的行为验证。

## 构建环境

- 两端发布 CLI 进入库编译时设置 `NODE_ENV=production`。不得用 `compile` 等自定义值冒充发布模式，避免 Vite 把 Vue 的开发分支编入发布代码。
- buildLibrary 接受 production 或未设置的环境；显式给出其他值时，必须在清理旧产物前失败，不能在共享进程中悄悄改写调用方环境。
- ESM / CJS 模块及全量包保留 `process.env.NODE_ENV` 的消费端判断，使开发消费有诊断、生产消费可删除诊断。构建期 `import.meta.env.PROD` 必须为 true，两者不能混淆。
- UMD 为独立生产包，必须在没有 Node `process` 全局变量的浏览器上下文中执行，不把开发校验和编译机环境带入浏览器。
- `packages/ui-build/test/environment.test.mjs` 必须构建真实产物并验证上述分支、ESM/CJS 消费行为、UMD 独立执行以及错误环境不删除旧产物。不能只比较源码字符串。
- 两端 quality 在最新构建完成后执行 `check:published-environment`，复核实际发布的 Link props 在 ESM/CJS 两种消费模式的正反校验，并在有真实 Vue、无 Node globals 的浏览器 DOM 中加载完整 UMD。该启动检查不冒充全部 UMD 交互覆盖。

## CI 工具链与检查入口

- 当前两端 Quality job 统一 Node 20 / pnpm 9.6.0。`ci-toolchain-check.mjs` 检查主 Node、pnpm 版本和 pnpm 子进程 Node；不能只在入口指定 Corepack，却让 Volta 或全局 pnpm 接管嵌套命令。
- design-ui 自己按其 packageManager 安装；这不改变 Cedar / Maple job 的包管理器契约。
- 工作区为同级的 cedar-design-web、maple-design-mobile、design-ui；link 依赖、横向契约与 CI checkout 布局必须一致，三仓均 frozen 安装。
- 路径必须同时匹配 Git 索引、磁盘实际大小写及相对 import 的拼写。Mac 上成功不能代替 Linux 检查；case-paths-check 检查全部已跟踪路径和可解析的源码相对导入（含类型、测试、Demo），保留既有缺失模块检查。记录仅大小写重命名时不得把用户尚未暂存的内容一并暂存。
- 两端 CI 执行根 quality 入口，不另维护步骤子集。完整保留类型、lint、全部用例、源码契约、运行时依赖、发布构建、体积与包内容检查，以及两库生产文档浏览器回归。
- 可以限制 worker 并发以控制资源，不得扩大超时、剔除用例、放宽体积上限、修改原基线或忽略失败。报告必须区分本机验证与真实远端 Actions，以及 Node 混用轮次与声明工具链轮次。

## 生产文档浏览器门禁

- 两库统一提供根 `pnpm check:docs-theme`，放在 quality 的生产文档构建之后；CI 必须在 quality 前安装 Chromium 及系统依赖。
- 两库还必须执行 `pnpm check:docs-components`：从真实文档扫描组件页，公共清单 `browser/contracts.mjs` 显式登记每个组件的交互或展示契约，不允许未知组件自动降级为展示检查。`browser/inventory.test.mjs` 接入两端 CI 与公共 `check:ci`，验证所有页面、demo 路径和 Maple 手机 SFC 映射。
- Cedar 的所有组件页执行桌面亮暗矩阵；Maple 的所有组件页执行桌面文档与 375px 手机示例亮暗矩阵。桌面亮色逐个展开全部 demo 源码并精确核对 SFC 文本，其他矩阵单元核对首个与交互示例源码；纯说明页单独计数。每页执行对应的业务状态断言，不能以无报错的点击代替行为结果。
- 浏览器输出 `artifacts/docs-components/<library>/coverage.json`，明确预期、实际完成、失败、分类、源码数量与交互结果；失败保留截图和 DOM 诊断。CI 无论成功失败都归档证据，不得用带筛选条件的诊断轮次冒充完整通过。
- 验收前后核对组件实现、样式、文档和 demo 的内容指纹；并行修改造成指纹变化必须重建重跑。测试文件的纯格式修改不影响生产内容指纹，仍由其所属单测门禁负责。
- 另核对文档编译配置、主题客户端、共享预览运行时、依赖清单和锁文件的生产输入指纹，不能仅凭组件源码未变化接受编译器或依赖迁移中的产物。coverage 同时记录 `sourcesStable` 与 `productionInputsStable`，任一为 false 均失败；生成缓存及测试文件不混入生产指纹。
- 使用已构建的站点私有快照和临时回环 HTTP 服务，不连接开发服务器，不通过整页刷新掩盖交互错误。刷新只用于验证用户所选主题的持久化。
- 必须通过真实主题菜单切换并验证站点、demo 卡片和展开源码的配色；验证本地存储与重载后的高亮状态，不能只断言 data 属性。
- 展开源码应与对应 demo 文件一致。Cedar 还逐项核对所有 README demo 引用的生产源码资产及内容哈希，防止页面显示旧源码。
- 文档源码/依赖注册表只能在真正渲染页面时更新。搜索、摘要等只调用 Markdown parse 的步骤不能清空它；重复渲染同一 token 流须保持源码链接和资产一致，移除 demo 时也不能保留旧依赖或误删另一语言页面。Cedar 的这组回归通过 `check:doc-pipeline` 接入 quality，禁止用清理构建缓存代替修复。
- Cedar 覆盖桌面 1280/1440px 的亮暗模式，以及 Button、Input、Select、Tabs、Switch、Checkbox、Dialog、Scheduler、Upload、Image 的代表性交互。Maple 保留手机 320/375/390px 的示例/文档四主题检查。平台主题数量和断点各自保留，不制造无效选项。
- 浏览器脚本异常、失败的本地资源和页面级水平溢出必须失败；外部统计脚本可在测试中隔离，不能屏蔽站内错误。真实 Teleport 内容从页面级 DOM 查询，不用 stub 代替浏览器交互。
- 站点启动所需的图标、脚本与样式不得隐式依赖远程 CDN；优先使用随产物发布的 SVG / 模块。可选统计脚本必须在文档 `load` 后启动，显式 async，不得依靠 CDN 正常或立即失败才能完成首次导航。不得以 `domcontentloaded` 代替原 `load` 条件、延长超时或自动重试消除失败。
- `check:docs-components` 同时执行 `browser/navigation-gate.mjs`：永久挂起全部外部 HTTP(S) 请求，在同一 5000ms 导航门槛下验证真实产物的亮暗主题、交互和源码；Cedar 为 Form / Collapse，Maple 为 Form 桌面 / 手机。用 1200ms 本地 logo 响应延迟控制“初始化脚本先于 load 插入”的竞态，不给第三方请求伪造成功响应；允许配置的可选统计在 load 后继续挂起，但不能引入未声明的外部资源。原全组件矩阵不得减少。
- 所有生产导航入口使用共同诊断器 `browser/navigation.mjs`，在超时当刻保存加载阶段及完整的未完成请求（含外部脚本、重复 URL 的独立请求），之后再收集 DOM / 截图；不能只记录站内请求，或等截图后才判断当时在等待什么。诊断器不得修改调用方时限、吞错或重试。
- Maple 的生产输入指纹必须包含 CLI 的 `site/` 模板与客户端、HTML 入口以及 `maple.config.mjs`；只比较 `src/` 无法发现此次统计脚本初始化时序变化。对应正反测试与统计启动时序测试必须进入两端公共 CI 检查。
- 清理浏览器、上下文、HTTP 连接及本轮临时快照。代表性交互不等于所有组件的全部功能已被浏览器穷尽覆盖。
- 资源受限时可设置 `DOCS_BROWSER_CONCURRENCY=1` 串行运行完整组件矩阵；默认及最大为 2。coverage 记录实际并发度，不能借此减少用例、修改 5 秒操作/导航时限或 30 秒单项时限。

## 面向 LLM 的文档产物

Cedar 与 Maple 的文档菜单都提供「LLM 文档」入口（中英文）。两端包内 `pnpm docs:llms` 调用共享生成器 `design-ui/bin/llms-docs.mjs`，输出 `llms.txt`、`llms-full.txt` 与 `llms/<locale>/**/*.md` 到各自静态资源目录；两端 `build:doc` 都先重新生成。Cedar 的 `dev` 不自动生成，本地预览最新文本文件时在 UI 包内手动运行 `pnpm docs:llms`；Maple 的 `dev` 仍先重新生成。生成文件不提交，随站点构建发布，适用于站点子路径部署。

索引按语言列出当前公共文档，不伪造英文翻译；全文保留 API 表格并展开真实 Demo 源码，代码围栏中的演示语法保持字面值。组件和指南的本地文档链接转换为对应 Markdown 链接；示例代码中的模块导入仍以标注的源码路径为基准。缺失或越界的 Demo 引用必须使生成失败，删除文档后不得残留旧单页文件。全文较大，使用说明应优先引导索引和单页读取。

`node --test design-ui/bin/llms-docs.test.mjs`（工作区根目录）覆盖语言、引用、代码围栏、链接、确定性输出和旧产物清理；两端 `check:doc-pipeline` 都执行这组测试。部署时同时发布整个静态目录，不单独更新入口页面或文本文件。

## 浏览器兼容性

两端 `quality` 追加完整三引擎 `check:compatibility`，CI 安装 Chromium、Firefox、WebKit 并归档独立证据。原有 Chromium 门禁不减少。构建目标、Maple 移动端及原生发布证据遵循 [浏览器兼容性与验收](./browser-compatibility.md)。
