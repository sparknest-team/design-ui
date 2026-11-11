# Vue / React 包与目录迁移

## 结果

六个独立仓库，共 42 个第一方工作区 package.json，加上 Maple CLI 项目模板。scope 保持 @cedar-design、@maple-design、@sparknest；包目录使用职责名，包名使用 -vue / -react 后缀，私有包同样区分。

完整包名清单见 [包目录与框架边界](../standards/package-layout.md)。

- Cedar Vue、Maple Vue 使用 design-ui 的 -vue 工具。
- Cedar React、Maple React 使用新独立私有仓库 [design-ui-react](https://github.com/loca-spirit/design-ui-react) 的 -react 工具。
- React 构建与文档预览已实际接入新工具；React 图标生成与主题契约提供独立实现，未复制 Vue 的运行时依赖。
- 组件、CSS、token、preset、工具与文档站不建立 Vue / React 跨框架依赖。各仓库加入命名与依赖边界门禁。

## 排查范围与补漏

同步源码 import/export、工作区依赖和本地 link、tsconfig、resolver、构建清单、CLI 入口及模板、发布脚本、GitHub Actions、锁文件、测试、文档和工作区外的源码引用链接。

进一步修复了通用 ui/shared 目录导致的品牌识别误判、动态拼接旧目录、CLI 扫描器静默漏扫、CLI 可执行链接断言、LLM 文档生成器的动态包名与英文句尾引用、Vue 发布工作流的同级检出路径。Cedar resolver 组件清单中的 ThemeProvider 排序也已修正。

目录变化保留了迁移前已有的未提交工作。现有五个仓库没有进行批量暂存或提交；新仓库只提交本次新建的 React 工具。

## 验证

| 检查 | 结果 |
| --- | --- |
| 六仓库命名与框架边界（42 个 manifest） | 通过，含 18 个边界回归用例 |
| design-ui-react 构建、类型、4 个功能回归 | 通过；GitHub Actions 也通过 |
| Cedar React / Maple React 完整 quality | 均通过，包含独立消费者 ESM/CJS/CSS 打包 |
| 两个 Vue 库 build:lib、package:check、原生入口 | 通过；包内容检查均 0 错误、0 警告 |
| 两个 Vue 库 typecheck | 通过 |
| Cedar lint | 通过 |
| Maple lint | 全量发现 79 个格式问题，已对 12 个报错文件执行 ESLint --fix，定向检查通过 |
| Cedar CLI / resolver | 通过，resolver 24 个用例通过 |
| Maple CLI / shared 工具 | 通过，shared 17 个用例通过 |
| design-ui 运行时依赖、LLM 文档及迁移相关回归 | 通过 |
| Maple 表单示例收集错误的独立复验 | 10 个用例通过 |
| Maple Vue 文档站 build:doc | 通过，1469 个 demo SFC 也通过 |
| design-ui check:ci | 52/55 通过；3 个已有 ThemeProvider 重定向页清单失败，见下文 |
| Vue 全量组件测试 | 未完成；全量并行运行已停止，没有宣称全部通过 |
| Cedar Vue 文档站完整构建 | 长时间未完成后停止本轮复验，不作为通过项 |

新私有仓库初始提交 `a7676a8` 已通过 SSH 上传，云端 [Quality 检查](https://github.com/loca-spirit/design-ui-react/actions/runs/42801979570) 已成功；不需要补充本机 OAuth workflow 权限。

## 保留与发布前事项

- 历史 CHANGELOG、已封存 release 结果与原始浏览器证据保留原名，不能代表新包已发布或已通过新验收。
- 内嵌第三方 @bfehub/vuepress-plugin-code-block 保留上游元数据；VS Code Marketplace 链接保留原扩展并标明新扩展名尚未发布。
- 本次没有发布 npm 包。先发布对应框架支持工具，再发布组件库依赖和 UI；不能假设新名字已有 registry 版本。
- 两个 React 仓库目前没有 DESIGN_UI_TOKEN secret。CI 需要配置可读取私有 design-ui-react 仓库的凭据；未复制用户的本机 GitHub 凭据作为云端 secret。
- design-ui check:ci 的三个浏览器清单失败来自已有 ThemeProvider 重定向页没有 runnable demo。已核对两个重定向页与迁移前 HEAD 一致，没有放宽验收条件。

## 2026-11-11 模板与内嵌插件补查

CLI 模板原本与正式 UI 包同名，而且 gen 只更新依赖版本，没有回填用户输入的项目包名。这是上次排查遗漏的实际缺陷。现已将模板占位名改为 maple-library-template-vue，生成时回填项目名称，并保留对正式 @maple-design/ui-vue 的版本依赖。编译后的真实生成命令已在临时目录验证：生成包名 my-ui-vue，内部依赖为 ^1.1.0，无 workspace 协议残留。

Cedar 的 plugin-code-block 原本已经由 VuePress 配置直接导入本地 TS 源码。本次移除了独立 package.json 与未使用的 tsconfig.build.json，运行时插件标识改为 cedar:code-block-vue；依赖由 UI 包统一声明。新增内部源码 README，并保留上游 MIT LICENSE、作者和历史 CHANGELOG。

验证：模板 3 个回归用例、插件 22 个回归用例、文档配置实际导入 6 个用例、CLI Node 构建均通过。全量 Maple lint 仍有非本次修改的 card/scheduler-lifecycle.spec.js 格式错误；本次修改文件的 lint 单独验证。正式工作区仍为 42 个包，另有 2 个项目模板，不再有内嵌第三方 package.json。
