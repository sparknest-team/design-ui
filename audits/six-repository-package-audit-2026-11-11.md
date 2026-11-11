# 六仓库包、模板与引用排查

日期：2026-11-11。本轮基于六仓库的实际工作树检查，没有重置或批量暂存已有修改，也没有发布 npm 包、推送代码或修改 GitHub secret。

## 结论与范围

当前源码树共 42 个工作区包、2 个独立项目模板；没有发现需要继续删除的多余 package.json。Cedar 的 VuePress 代码示例插件保持内部源码形式，无独立包清单。原始证据、封存 release 记录、node_modules 和已生成产物单列，不作为工作区包。

| 仓库 | 工作区包 | 项目模板 | 当前 JS/TS/Vue 模块 |
| --- | ---: | ---: | ---: |
| cedar-design-web | 9 | 0 | 3679 |
| maple-design-mobile | 13 | 2 | 3739 |
| cedar-design-web-react | 5 | 0 | 35 |
| maple-design-mobile-react | 5 | 0 | 37 |
| design-ui | 5 | 0 | 250 |
| design-ui-react | 5 | 0 | 5 |
| 合计 | 42 | 2 | 7745 |

完整包名见 [包目录与框架边界](../standards/package-layout.md)。机器可读清单见同目录的 six-repository-package-audit-2026-11-11.json。

## 已修复

1. 删除 Cedar、Maple UI 包对自身的 workspace 开发依赖，锁文件同步。保留已有第三方解析版本；两库 frozen lock 校验通过。
2. 修复 Cedar 全局组件类型中的无效 ui-vue/web-vue 子路径，统一指向正式 UI 根入口。清理 Map 源码中已经停用、未声明的旧 map-core 导入注释。
3. 修复 Cedar 的 dist/index.css、Maple 的 es/style 和旧 utilities CSS 等不可用文档引用，改用真实公开入口；清理旧 @cedar preset scope，补齐 utilitySpec 中的跨库 preset 引用，并重新生成两库 LLM 文档及 Maple docs/public 的旧副本。
4. 为 Maple UI 增加 json/*、highlight/* 显式导出。区域数据、编辑器 web-types 和下载模板样式入口均通过实际包解析验证。
5. Maple CLI 的 --locale 参数原先与 gen 读取的 i18n 字段不一致，现已统一。项目名在复制模板前校验，拒绝非法名称和与模板依赖冲突的名称，防止再次生成自依赖项目。
6. Playground 下载模板标记 private 和 type: module。生成包保留所选 UI、Vue、TypeScript 版本；preview 回退至工作区实际版本，不泄漏本地 workspace/catalog 协议。补充 TypeScript 开发依赖，正确使用 UI 的公开样式入口。
7. Playground 远程 UI 模块改用能重写依赖的 ESM 入口，Vue 留给原有 import map；JS、CSS、touch-emulator 使用相同的所选版本。本地 preview 保留独立打包文件。该入口规则依据 [esm.sh 的 import map/external 文档](https://esm.sh/#using-import-maps)；本轮没有把线上包或 CDN 可用性计作已验证项。
8. 修复 Playground 的 Dialog 旧函数调用，改用现有 Dialog.confirm；补齐 REPL 必需的 TypeScript 版本状态。使用 vue-tsc 验证真实 Vue 应用，并把 typecheck:playground 接入 quality。
9. Maple 10 个包的 repository/bugs 占位链接改为实际 GitHub 仓库，repository.directory 使用当前职责目录。Cedar 发布工作流的 access restricted 与各包 publishConfig.access: public 冲突，已按现有包声明统一为 public；未执行发布。
10. 修复 shared-scroll-native-evidence-check.mjs 中目录简化遗留的 source.'ui' 语法错误。恢复 menu-naming-catalog 测试里被错误合并为 ui 的 Cedar/Maple 品牌标签，没有修改验证规则。
11. 在没有生产 VuePress 构建占用时，备份并移走含旧绝对路径的忽略缓存 .temp-build。clean-cache 命令覆盖开发和生产缓存。原始浏览器证据与 LICENSE/CHANGELOG 的来源名称保留。
12. 补齐 CLI 组件库模板的 ui-build.config.mjs、tsconfig.declaration.json、vue-tsc 与编译入口；types-generated 纳入发布文件，运行时 shared-vue 移入 dependencies，所有依赖字段统一替换本地协议。修复入口生成器无条件导出官方 UI 专有模块的问题，并统一示例 va 命名空间。SFC/TSX × 国际化开关四种组合均实测编译、按公开入口导入和打包，原有官方 UI 的额外公开导出保留。
13. 六仓库包门禁升级为递归清单检查与真实语法树扫描，覆盖自依赖、重复名称、未分类的嵌套清单、模板本地协议泄漏与缺失编译配置、工作区/override 目标、别名和跨框架引用、脚本语法。design-ui 增加固定的 TypeScript 5.6.3 开发解析器；Vue/React 工具仍各仓库独立维护，没有引入跨框架工具依赖。

## 验证结果

- 六仓库递归门禁通过，42 个工作区包、2 个模板、7745 个当前模块完成检查。
- 新包边界回归共 75 项通过；覆盖内部源码误加清单、重复包名、自依赖、隐藏别名、跨框架动态/类型/SFC 导入、脚本语法损坏，以及历史快照排除规则。
- CLI 清单生成 8 项回归通过；项目模板链路 9 项回归通过，包括真实 --locale 生成、下载依赖版本、浏览器入口、包导出解析、四种模板编译与 tarball 内容检查、官方 UI 专有导出兼容检查。
- 四种模板编译测试复用本机已安装依赖，生成和打包在临时目录执行；未将其视为从 npm 全新安装验证。
- Maple check:cli 整体通过：Node 回归 16 项、CLI/Vue 相关 Vitest 回归 44 项。
- Cedar、Maple UI 类型检查通过，Playground 的 vue-tsc 检查通过；CLI Node 构建通过。
- Cedar 全量 lint 通过；本次修改的 Maple 文件 lint 通过。
- CI 契约与大小写路径回归 4 项通过；菜单目录名称回归 4 项通过。
- 两库 LLM 文档已重新生成；有效源码、配置、维护文档中的旧包名/目录和失效公开子路径没有再发现遗漏。负向测试和历史记录中的旧字符串不作为有效引用。

## 尚未通过或未执行

- Maple 全量 lint 仍有 Card 的 scheduler-lifecycle.spec.js 三处既有格式错误。该文件不属于本次包排查修改，未覆盖其他工作。
- shared-scroll-native-evidence 检查恢复可运行后发现历史夹具哈希漂移：当前 86d4c1d6…，记录 2bb1b17f…。没有更新哈希、截图或接受计数来制造通过；需要按真实浏览器流程重新生成证据。该项不计作本轮原生浏览器验收。
- 安装校验仍显示既有第三方 peer 版本范围警告，例如 VuePress 预发布版本、Vitest/UI 和 UnoCSS/Vite。此次没有进行第三方版本升级迁移。
- 没有执行 npm 发布、完整生产浏览器矩阵或全部组件测试，也没有验证线上新包/CDN 安装。React CI 跨私有仓库检出仍使用工作流声明的 DESIGN_UI_TOKEN，本轮未检查或修改其云端配置。

本轮修改前快照、定向日志和旧缓存备份保存在本机 /private/tmp/six-repo-package-audit-20261111；原有工作树修改保持未提交状态。
