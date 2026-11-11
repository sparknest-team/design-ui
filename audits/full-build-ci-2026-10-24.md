# Cedar / Maple 完整构建与 CI 验收

2026-10-25 追加：导航超时的外部脚本阻塞路径已稳定复现并修复，受控故障防回归已通过。按用户最新决定“其他改造继续，本轮保留未完成验收状态”，最新全库生产验收未签收，已停止过期产物上的测试；详见 [导航超时定位报告](navigation-timeout-2026-10-25.md)。下文通过数字仅对应 2026-10-24 固定快照，不能代替当前代码验收。

日期：2026-10-24。此报告承接 [shared 基础门禁修复](shared-foundation-2026-10-24.md)。**最新生产文档验收完成：Cedar 208/208＋原专项 45/45；Maple 380/380＋原专项 6/6＋模式专项 308/308，另视觉复核 24/24，均零跳过。** 已包含 Search API、字段默认值分组、AutoComplete 样式和最后的平台默认值同源修复。独立核对源码、生产输入和实际 index 指纹全部一致，见 [最终核验收据](evidence/full-build-ci-2026-10-24/final-accepted-r29/common/production-acceptance-final-r29.json)。最新证据在 [final-accepted-r29](evidence/full-build-ci-2026-10-24/final-accepted-r29/)，此前 r22 / grouped 通过快照保留在 final-accepted，不作为当前签收。前期完整库构建/CI 与最新生产文档验收分开陈述，不冒充最新代码再次全量执行 quality；远端 GitHub Actions 未由本任务触发。

## 修复内容

1. **干净 CI 目录错误**：Cedar 原来把 design-ui checkout 到内部 `.design-ui`，但 package.json / lockfile 的 `link:` 依赖要求同级目录。两库现在统一 checkout `cedar-design-web`、`maple-design-mobile`、`design-ui` 三个同级目录，分别 frozen 安装。横向 token / 源码检查不再依赖开发机器上“碰巧存在”的另一库。
2. **CI 步骤漏项**：两库 Actions 改为执行根 `pnpm quality`，不另维护检查子集。Cedar 加入 lint、CLI、resolver 回归，完整库构建加入两个 preset；Maple 显式运行 shared 发布回归。既有运行时依赖、类型、全组件测试、契约、按需体积、源码收集、文档和发布包检查全部保留。
3. **FieldDecorator 构建后丢失注册**：仅修改生成结果无效；Cedar CLI 生成器的安装排除名单错误地包含 field-decorator。已修生成规则，增加连续生成两次仍保留 import / installer 的断言，并用真实全量安装器测试复核。
4. **Node 20 resolver 回归入口错误**：`require.resolve` 选择的是 CommonJS 条件，即使随后 dynamic import 仍会进入 CJS；它再 require ESM-only unimport 时失败。测试现在读取实际安装包 exports 的 `import` 条件，继续验证真实 AutoImport 转换，不 mock 或跳过。
5. **陈旧 demo / 交互测试**：SplitButton 现为四种静态变体目录，测试改为逐一验证两个按钮的中性状态、变体及主操作 / 菜单回调。Cedar 日期测试改用现行 inline 原生面板和 compact 原生编辑器，保留完整范围、倒序选择、高亮、取消恢复、Form、单次提交和 Now 草稿断言；双击测试新增“单击不打开”断言。
6. **时间范围说明冲突**：最近的 Maple 文档、顺序验证与两库运行时均为“端点不交换，未开启次日时拒绝倒序”。Cedar 早期说明和一项文本测试仍写自动排序。按现行协议对齐 Cedar 文档及测试；运行时最终未改。两库补充禁用小时、步长不能被次日开关绕过的断言。规范澄清见 Cedar OpenSpec `reconcile-ci-time-range-contract`。
7. **文档构建资源**：Cedar 一次重跑达到 Node 默认约 4 GiB 堆上限并中止，还发现大量逐样式启动的 Sass 子进程。生产文档命令显式提供 6144 MiB 堆，样式预处理限制 2 个 worker，Sass 使用 modern-compiler 复用编译器；不关闭 sourcemap / 插件 / 页面或错误检查来绕开构建。资源配置纳入 CI 契约回归。
8. **Maple 首次安装的 CLI 入口**：包 bin 原来指向尚未生成的 lib，干净安装无法创建命令链接。改用随源码存在、随 npm 包发布的 `bin/cli.mjs` 转入构建后的 CLI。新增真实临时 workspace 回归：没有 lib 时先 frozen 安装并断言 bin 已存在，随后生成模拟 lib 并通过已安装命令执行；实际 CLI `--version` 也验证通过。
9. **CountTo 结束事件偶发失败**：原测试只睡眠 duration+20ms，在机器负载较大时不保证最后一帧已调度。两库改为可控 performance / RAF 时钟，验证结束前零通知、到达时刻终值正确且恰好通知一次、后续帧不重复通知；没有延长等待或放宽断言。
10. **主、子进程工具链漂移**：仅在入口调用 Corepack 不足以隔离系统 Volta；嵌套 `pnpm` 曾切换为全局 Node 23。本次使用临时工具目录固定 Node 20.18.3 / pnpm 9.6.0，并复查原门禁。两库 CI 新增 `ci-toolchain-check.mjs`，验证主进程 Node 20、pnpm 9.6.0 和 pnpm 子进程的 Node 版本完全一致；4 项正反测试覆盖入口版本、包管理器版本和子进程偷换。临时 PATH 不改用户全局 Volta 设置。
11. **真实发布产物的环境分支**：Maple CLI 原先设置 `NODE_ENV=compile`，与生产构建语义不符；共享构建器还会过早折叠模块中的开发期校验。两库 CLI 统一生产构建，共享 ui-build 在清理输出前拒绝非标准环境；ESM/CJS 保留消费方环境判断，UMD 固定生产模式、不依赖 Node 全局。新增真实构建回归与两库 `check:published-environment`，分别验证开发和生产消费 ESM/CJS，以及真实 Vue + JSDOM 浏览器中的完整 UMD 启动。规范固化于 [build-and-ci.md](../standards/build-and-ci.md)。
12. **Linux 大小写路径隐患**：Cedar 70 个文件磁盘已改名，Git 索引仍保留旧大小写；macOS 可运行，Linux checkout 会产生不同结果。已原子更新这 70 个索引路径，逐个确认原暂存 blob、文件模式和工作文件内容哈希不变；另修复 Form 测试的一处错误大小写导入。**这 70 项纯路径重命名已暂存，文件内容修改仍保持原暂存状态；没有提交或推送。** 新增 Git 路径和相对导入大小写检查及两项回归，两库 CI 均强制执行。
13. **Link 按需体积超标**：新增尺寸功能后，Maple 原门禁超出 52 字节原始 / 23 字节 gzip。保留五种尺寸功能，两库统一只在开发环境保留 size/status/underline 校验器，增加有效值及无效值断言，并通过上述真实发布环境测试验证开发校验没有丢失。原 92 项体积限制全部通过，未修改基线或额度。
14. **Cedar 生产文档缺少浏览器 CI**：补齐与 Maple 同名的根 `check:docs-theme`，在 quality 的文档构建之后执行，Actions 安装 Chromium。使用真实生产产物私有快照、回环 HTTP 服务和 Chromium；覆盖 1280/1440px、默认亮色/暗色、菜单选中状态、已展开源码即时变色、站点及全部案例卡片背景、刷新持久化、页面宽度和本地资源错误。真实 Teleport 弹窗从页面 DOM 查询，不用 stub、强制点击或页面刷新替代交互。
15. **源码资产在生产构建中消失**：追加浏览器验收发现一次构建成功却没有 `__demo-sources` 目录，源码链接因此全部失效。根因是 Markdown core 解析阶段清空了源码及依赖注册表，搜索/摘要等后续仅 parse、不 render 的流程不会将它重新填回。现在只在实际 render 时替换页面注册，渲染 HTML 后还原原始 demo token，保证同一 token 流再次渲染仍可注册。新增三项回归覆盖仅解析不丢资产、重复渲染一致、移除 demo 不误删另一页面；修复前有明确失败日志，修复后文档流水线通过。未关闭搜索、清缓存或忽略资源错误。
16. **Image 错误态示例制造站内 404**：浏览器实际捕获 `/components/image/invalid-image.jpg` 的 404。两库的 authored 错误态、错误 Footer、fallback 示例及对应功能调试样例统一改为 `data:image/png;base64,AA==`；真实图片解码仍失败，但不再请求缺失 HTTP 资源。Cedar 浏览器同时验证正常图片预览开关、默认/自定义错误态和 `/cat2.jpg` 回退成功；没有给 404 加白名单。

## 环境与方法

- 本地 macOS。早期通过 Corepack 指定入口版本，但发现嵌套脚本受 Volta 影响，部分用了 Node 23，不能当作 CI Node 20 的证明。最终以隔离 PATH 固定 Node **20.18.3** / **pnpm 9.6.0**，主、子进程工具链检查均通过。design-ui 按自己的 packageManager 使用 pnpm **10.23.0** 安装。
- 最初 Maple 测试与 CLI 清理构建并发，曾出现 bin 不存在；这是本次运行顺序冲突，不是测试通过结果。最终测试在 CLI 重建完成后执行。
- frozen 安装在新建临时目录中复制 manifests / lockfiles / patches 后执行，保留安装生命周期脚本，不重装现有开发工作区。它验证依赖安装，不宣称在该临时目录完成源码构建。
- 此依赖沙箱未复制全部源码或 `.git`，因此出现源码 bin 缺失、Husky / simple-git-hooks 找不到 Git 的提示；与完整 checkout 不同。这些提示未被隐藏。Maple 自身“bin 指向生成文件”的真实问题由独立 fresh-workspace 回归修复验证。安装日志单独归档。
- 离线安装首次因缓存缺失失败，随后使用正常 registry 安装；没有改锁文件、取消 frozen 或跳过安装钩子。
- 第一轮全组件测试暴露上述实际问题；中间测试源正在修复、构建生成入口也曾覆盖手动修改，不能把中间轮次当作最终结果。
- 较长重跑中出现过测试超时；在原 5000ms 时限下重验，不增加超时。另一次限制 worker 数的 Cedar 重跑无进度后已主动中止，最终改用原 CI 测试命令。
- 本机 16 GiB 内存曾产生约 20 GiB swap；已把文档构建与全组件测试拆开执行。Maple 一次并行轮的日历导航用例 5981ms 超过 5000ms 原时限，最终全组件验证使用 `--maxWorkers=1 --minWorkers=1`；不修改测试时限、排除文件或跳过用例。中止轮次的 3 个孤立 worker 已在核对工作目录、父进程和关闭管道后清理。

## 前期完整库构建与 CI 记录（后续 API 改造前）

完整库构建、全量组件 Vitest 和原门禁保留前轮验收记录；本轮追加文档构建、文档流水线、生产浏览器、Image 定向测试及 lint/CI 契约复核，详情见后文。定向结果不冒充再次执行了整套组件测试。

| 项目 | Cedar | Maple |
| --- | --- | --- |
| 完整构建 | 前轮 `pnpm build` 通过；本轮再构建生产文档 274 页通过 | 前轮 `pnpm build` 通过；本轮生产文档重建通过 |
| 全组件 Vitest | 隔离 Node 20 全量 488 文件 / 3225 项通过；后续受影响 Link/Form 3 文件 / 27 项通过 | Node 20 单 worker 全量 462 文件 / 3721 项通过；随后新增 Link 开发校验回归，Link 2 文件 / 19 项通过 |
| lint，零 warning 门禁 | 通过 | 全库通过，新增 CLI / 计时测试文件独立 lint 也通过 |
| 全库 typecheck | 通过 | 通过 |
| runtime dependency 门禁 | 通过 | 通过 |
| shared 发布 / 类型 / 体积回归 | 13 项通过 | 13 项通过 |
| spec / 样式变量契约 | 95 组件，零错误警告；token 通过 | 89 组件，零错误警告；token 通过 |
| CLI / resolver | CLI 生成与样式检查通过；resolver 23 项通过 | CLI 7 文件 / 13 项通过，新增干净 bin 回归 1 项通过 |
| 其他 Maple quality 门禁 | 不适用 | dev-boundary、cross-platform、test-collection、doc-pipeline、source-normalization、icon-bundle、92 个按需组件入口均通过 |
| 发布包 | 最新 3787 文件 / 29371.3 KiB / 零 source map；零错误警告 | 最新 3360 文件 / 16975.3 KiB / 零 source map；零错误警告 |
| 实际发布环境消费 | ESM/CJS 开发与生产、浏览器 UMD 无 Node 全局均通过 | 同左，全部通过 |
| Git / 导入大小写 | 后续复核 3958 个源码模块通过 | 后续复核 3962 个源码模块通过 |
| 生产文档浏览器 CI | 新增 45 个测试节点通过：40 个组件交互子用例、4 个主题/宽度矩阵父用例、1 个全量源码清单 | 6 项通过，320/375/390px × 示例/文档；四主题切换、重载持久化、源码高亮和本地资源错误检查 |
| 隔离依赖 frozen 安装（含生命周期） | 通过，patch-package 补丁应用成功 | 通过 |

独立公共检查：68 组基础运行时代码同源检查通过；`design-ui pnpm check:ci` 最终 **13 项**通过，覆盖 CI 配置、工具链、shared 源码契约、大小写路径及真实构建环境。三仓 `git diff --check` 与暂存区检查通过。

Maple 最后一轮 lint 曾因本次新增测试的循环缺少花括号失败，已补齐并重跑 lint 及后续全部门禁通过；原始失败状态与成功重跑均保留在日志中。未增加测试超时、减少用例、放宽体积/同源/类型阈值或忽略失败。为避免本机内存竞争，重型步骤串行执行，并非宣称本地只运行一次未经分段的 `pnpm quality`；最终逐项执行覆盖了两库 quality 全部命令。

全量测试与后续定向测试有重叠，不合并计数。Maple 全量 3721 项之后新增的一项 Link 校验由定向测试覆盖，没有宣称再次全量运行 3722 项。

## Cedar 生产文档浏览器补验

- **实际交互矩阵**：Button、Input、Select、Tabs、Switch、Checkbox、Dialog、Scheduler、Upload、Image，分别在 1280/1440px、亮/暗两种主题执行，共 40 组。验证变体与尺寸的实际几何变化、输入编辑、下拉选择和 Escape 关闭、TabPane 点击/键盘切换、双向绑定开关、复选框标签/键盘、Dialog 取消后再次打开并确认、Scheduler 月/周切换及事件保留、本地合成文件读取，以及 Image 预览/错误/fallback。没有发送真实上传请求。
- **主题及源码**：通过顶部调色盘菜单在两种模式间切换，断言已展开代码和 demo 背景无需 reload 即变色；再专门 reload 验证存储、菜单选中和高亮色持久化。逐页检查代表性 demo 展开源码与实际 SFC 精确一致，仅统一换行和末尾空白，不删除引号等语义字符来制造匹配。
- **全量资产检查**：95 个组件页面、964 处 demo 引用与 1,344 份生产源码资产匹配，并验证每个 JSON 的内容哈希。此项是源码资产覆盖，不冒充 95 页全部交互已遍历。
- **文档流水线门禁**：新增根 `check:doc-pipeline`，文档目录完整 Node/Vitest **11 文件 / 27 项**通过，接入 quality、CI 契约和开发命令文档。覆盖生产源码注册及现有 HMR、延迟高亮、复制源码、临时文件、开发锁和本地化回归。
- **测试编写过程中的适配**：Markdown 链接定义注释内的 `<demo>` 不属于真实案例，引用提取改为真实 block demo；Checkbox 的原生 input 被视觉控件覆盖是正常实现，改用真实标签点击和原生 Space 键断言，不使用 force，也没有修改组件来适配测试。
- **人工视觉复核**：已查看 1280/1440px 的亮暗截图，导航、卡片、选中 Tabs、展开源码及右侧目录布局正常。截图见 [1440 亮色](evidence/full-build-ci-2026-10-24/cedar-browser/cedar-1440-lightTheme.png)、[1440 暗色](evidence/full-build-ci-2026-10-24/cedar-browser/cedar-1440-darkTheme.png)。
- **稳定性**：修复后的源码渲染、注册表、读取及前端源码组件在构建/浏览器验收前后哈希一致；没有覆盖并行任务的其他改动。Image 回归 Cedar **5 文件 / 64 项**、Maple **11 文件 / 116 项**通过；两库 lint 零 warning 门禁通过。新增 Playwright 与 Maple 固定同版 1.62.0，frozen 安装及生命周期通过。

主要日志在 [证据目录](evidence/full-build-ci-2026-10-24/)。失败轮与修复后通过轮分开保留，不能把失败轮当作最终成功证据。

## 未能验证的边界

**远端 GitHub Actions 尚未运行或读取。** 本机 `gh auth status` 返回未登录；工作区还有用户和其他任务的未提交改动，本次未提交、推送、创建 PR 或触发远端工作流。本地通过不能替代 GitHub Ubuntu 环境执行的结论。三仓配套变更需一起发布到对应分支后，再由有权限的操作者触发并观察 Actions。

保留 Vite CJS API / 第三方安装脚本等既有提示；不会删除日志或降低检查规则来制造“零错误”。Maple CLI 与 UI 的 workspace peer/dev 依赖会产生安装环提示，它不等于源码运行时环，运行时 DAG 门禁仍严格通过。

早期混合工具链的 Cedar 测试出现过 `close timed out after 1000ms`；最终固定 Node 20 的 3225 项全量测试正常退出，未再出现该提示。没有扩大 teardownTimeout 或屏蔽日志。仍不能据一次本地成功宣称所有运行器资源清理风险已被穷尽验证。

浏览器覆盖边界：Cedar 原来缺失的生产浏览器步骤现已补齐并本地执行；Maple 同步重建后复跑现有主题门禁。覆盖 Chromium、上述断点和代表性交互，不代表所有组件的全部功能、所有浏览器或第三方服务都已验收。UMD 检查验证真实产物启动和环境契约，不代表所有 UMD 组件交互均已遍历。源码资产覆盖与交互覆盖必须分别理解。

## 全组件生产浏览器补验（本轮）

本节承接上面的十组件补验，旧轮次结果不改写为全组件通过。**实现、防回归、CI 接线及最新稳定生产文档验收均已完成。** 用户授权统一协调后，相关任务完成当前修改并冻结；追加的默认值分组、Search API、AutoComplete 弹层改造及平台默认值同源修复全部纳入 r29 新构建。最终采用 Cedar 第 30 轮、Maple 第 29 轮完整矩阵，双指纹稳定；此前受并行修改或导航超时影响的轮次保留为失败或历史快照，不用于签收。

### 完整清单与检查方式

| 范围 | 页面 | 明确业务交互 / 展示组件 | 浏览器矩阵 |
| --- | --- | --- | --- |
| Cedar 组件 | 97 | 72 / 25 | 桌面 1280px × 默认亮、暗，共 194 项 |
| Cedar 样式规范 | 7 | 独立说明与展示检查 | 亮、暗，共 14 项 |
| Maple 组件文档 | 91 | 65 / 26 | 桌面 1280px、手机 375px × 默认亮、暗，共 364 项 |
| Maple 样式规范 | 8 | 独立说明检查 | 亮、暗，共 16 项 |

- 按真实文档递归扫描，包含 Cedar `date/picker`、`time/picker` 与嵌套样式说明，不再只扫描 src 的第一层。Maple 的 Locale 文档复用 LocaleProvider 示例，手机验收映射到真实的 LocaleProvider 路由，不虚构 `/locale` 手机页。
- 首轮亮色桌面逐个打开所有源码面板：当前清单 Cedar 990 处组件 demo 引用、26 处规范 demo 引用，Maple 883 处组件 demo 引用、8 处规范页自动挂载示例（popup 迁移后将重新读取清单）。逐字核对对应 SFC，仅统一 CRLF 与末尾空白；不删除引号、属性或中间空格来制造匹配。暗色矩阵再次核对首个与交互示例源码。
- 交互逐组件登记，断言实际状态、值、弹层、确认回调或几何变化；图片解码、Canvas 笔迹、拖拽和触摸滑动均由真实 Chromium 执行。纯展示组件检查实际内容与尺寸，不包装成业务交互。
- 检查整页宽度、主题背景、空示例、未解析的 `c-*` / `mp-*` 标签、脚本异常和失败站内资源。源码展开、收起及语法 token 样式也在检查范围。
- 每个用例使用独立浏览器上下文，最多两个上下文并发；不使用 Vue stub、force 点击、整页刷新、删减用例或错误白名单。旧主题专项门禁保留，继续覆盖额外断点、四主题及刷新持久化。

### 本轮修复

1. **嵌套 demo 未渲染**：两端自动导入排除规则只允许一层 `example / __demos__ / docs`，Cedar 独立日期、时间面板和样式页中的标签变成未解析自定义标签。改为支持多层文档目录；运行时文件仍逐模块验证全部排除。两端新增 `/@fs`、SFC query、嵌套 demo 和嵌套实现文件的正反回归，先复现红灯后修复，未放开运行时自动导入。
2. **Cedar 空白或不可操作示例**：ConfigProvider 增加真实 Input、Button 和 sm/lg 尺寸继承切换；TreeSelect 基础示例补充本地部门数据、选择模型及结果反馈。同步对应生成的功能调试示例。
3. **Avatar 回退示例 404**：两端 authored / 功能调试示例统一使用确定性无效 data URL 保留真实解码失败，不再请求 `/missing-avatar.jpg`，没有忽略 404。
4. **InputNumber standard 越界**：standard 字段没有水平 padding，步进器却沿用抵消 padding 的负 margin。两端对 standard 的内嵌及左右步进按钮归零相应 margin，保留其他变体的边界对齐；手机零溢出断言直接覆盖此问题。
5. **ButtonGroup 窄屏撑宽页面**：两端继承/覆盖示例增加有界局部横向滚动，保留连续按钮组及完整标签，不隐藏整页溢出。
6. **Ripple 指令示例冲突**：宿主 Button 的内置 ripple 与同根独立指令互相覆盖禁用状态。Cedar 指令基础例、Maple 动画 token 示例使用独立的可聚焦指令宿主，保留 `role="button"`、既有主题样式与指令本身的键盘能力。最初使用原生 button，后续 demo 规范整改同步为当前宿主写法；不再将两份指令绑定到同一 Button 根节点。
7. **Maple Code 陈旧结果**：没有着色器或移除着色器时显示转义后的可读源码；旧异步请求、停用监听后的结果不得覆盖当前内容；可选着色器失败时保留安全纯文本。新增无着色器、移除提供者后的迟到响应、拒绝响应三项回归。Cedar 没有对应 Code 组件，不新增虚假的双端 API。
8. **Maple 演示反馈**：Search 基础例增加真实搜索结果；PullRefresh 使用有界本地滚动容器，解决文档页滚动位置影响下拉刷新的问题，并同步功能调试示例。
9. **契约一致性**：同步 Cedar 数字输入公开实例测试的本地绑定；Input/Textarea 同源检查增加明确的 popup-container 平台路径映射。保留 API 类型、业务实现和字符串内容检查，没有扩大忽略范围；数字输入 14 组实现/样式/测试和 7 组 demo、输入/文本域 24 组同源检查通过。
10. **Cedar 列管理器的隐式全局依赖**：完整浏览器检查在 Table / TableColumnManager 的组合示例发现未解析的 `c-dialog / c-checkbox / c-input`。组件现显式导入 Dialog、Checkbox / CheckboxGroup、Input；新增无全局注册的真实 Teleport 回归，验证插入选项与编辑字段确实更新模型。Maple 没有对应的桌面列管理组件，未虚构同名实现。
11. **Trigger 点定位矩形形状不一致**：Maple 的点矩形补齐 `bottom / right`，与 Cedar 的同源实现保持相同形状；定位几何 4 项回归及完整复制组件同源门禁通过。Badge 平台适配检查精确核对现有三项暗色变量，未扩大忽略块或改变默认颜色。
12. **Ripple 单端监听优化漂移**：冻结窗口中的完整跨端检查发现 Cedar 新增的“禁用宿主不绑定监听、按 ownerDocument 共享释放监听”未同步 Maple。已同步实现及两项回归，覆盖同步重新启用、最后实例卸载释放、不同 document 隔离；卸载测试核对真实注册的共享回调被移除，未删掉清理断言。Maple 5 文件 / 38 项、Cedar Ripple / Trigger 19 文件 / 105 项通过；两端修改文件 lint、Maple 类型检查通过。
13. **Trigger 新代码排版漂移**：Cedar / Maple 的 peer-reference 交互逻辑相同，但新代码的逗号、括号和分支写法不同，原 time-rules 严格同源检查失败。统一代码写法并给 Ripple 循环补齐花括号后，完整 `check:cross-platform` 通过。未修改检查器、白名单或断言。
14. **Menu 同级入口残留弹层回归**：协作任务修复两端共享 Trigger 交互后，生产检查增加连续两轮“打开多级菜单 → 展开子菜单 → 切换另一个入口 → 旧菜单全部关闭 → 选择新菜单项”的断言。遵守各端文档默认手势：Cedar hover，Maple click；触屏遮挡时使用真实 Enter 激活，不使用 force。
15. **Cascader 样式空行漂移**：严格跨端检查发现两端相同规则之间相差两行空白，已统一 Cedar 排版并重跑完整检查通过；没有修改 CSS 规则、token 或检查器。
16. **Cedar NavMenu 手机示例宽度**：协作任务发现 Space 子包装中的具名导航入口撑出 375px 容器，已在该 demo 局部设置 width:100% / min-width:0，使导航已有内部滚动生效。第 14 轮产物尚未包含此修正，不作为最新验收；第 15 轮构建纳入修正。
17. **Cedar 手机文档 API 表溢出**：Menu / NavMenu 的 Markdown 宽表格撑出整页，文档站现仅在手机断点对正文直接 table 使用局部横向滚动，不隐藏整页溢出，也不改变组件示例 table。生产门禁增加两页亮暗 375px 的实际 overflow-x 和整页宽度断言；协作任务在第 17 轮产物独立验证页面宽度等于 clientWidth，表内可滚动。
18. **默认 popup 迁移后的测试与文案漂移**：同步 Cedar AutoComplete / Form 配对测试的显式 inline 设置、Search 示例的类型化回调，严格完整跨端及 Search 检查通过；修改的 Cedar 测试 60 项通过。Maple Steps 引言主值修为 modelValue，TabBar 自定义标签插槽参数修为 active，中英文同步，未机械替换合法事件参数 current。
19. **生产快照准备性能与超时清理**：一轮 Cedar 在原 120 秒准备预算内仅复制部分产物，208 项被取消，未计通过。快照改为有界并行复制，优先独立写时复制、不可用时普通复制，绝不使用硬链接；取消后不得继续启动服务或浏览器。新增回归确认原构建改写、删除文件均不影响快照，公共 CI 增至 19 项通过。原有准备、导航及单项测试超时不变。
20. **Cedar 残余 grid 最小宽度**：item-label 标题策略示例使用 grid 默认最小轨道，375px 下撑到 300px 并越出内容区。改为 minmax(0,1fr) / min-width:0，辅助 Space 开启 wrap。第 19 轮独立亮暗手机验证整页 scrollWidth=clientWidth=364，正文表格仍内部滚动；未屏蔽页面溢出断言。
21. **Cedar 站点占位 logo 外部依赖**：随机导航超时排查捕获 https://xxx.com/pe-fe-statics/cedar/logo.png 返回 net::ERR_CERT_AUTHORITY_INVALID。替换为随站点发布的本地雪松 SVG 标识，保留品牌文字与导航布局；每页增加 logo 同源与真实图片解码断言，并将该资源纳入生产指纹回归。未增加导航超时，也未把 goto 改成更宽松的等待条件。
22. **两端公共字段弹层 CSS 被 tree-shaking 丢弃**：私有 style.ts 不在发布包已有 sideEffects 样式目录契约中，生产包缺少字段入口与操作栏样式。两端统一移到 style/index.ts，调整本地相对导入，不扩大 sideEffects 白名单。公共 token 图支持新标准目录，同时禁止私有目录成为自动根节点；只有公开组件可达且存在真实终端 CSS 消费者才通过，9 项正反回归通过。Cedar 真实 Form click 编辑器已验证入口 flex、compact 操作区 flex、取消不提交；Maple 全字段专项验证真实 popup 样式，正式矩阵继续包含相关断言。

协作任务的必要修复单独记录：Cedar 启动优化任务复现了提前初始化主题被 Hope 默认亮色覆盖的问题，已恢复原 onMounted 初始化。该任务报告了隔离完整客户端的暗色选择后 reload、Scheduler 编辑及 HMR 复验通过；这些是协作任务的定向结果，与本报告最终完整生产验收分开记录，不重复计数。

测试适配也与产品缺陷分开处理：Maple 无显式 demo 的规范页会由编译器自动挂载 `example/index.vue`，清单已按实际编译行为纳入这 8 个源文件；没有将 1 个真实示例放宽成 0 个。手机主题切换严格等到最终 token 对应的不透明颜色，而不是在动画中间读取 `rgba(..., 0.99)`，没有接受半透明背景。

Cedar 并行启动优化已将生产源码高亮由 Shiki 改为 Prism；旧专项门禁同步检查真实 `cedar-demo-code` 包装和语法 token，内容哈希、逐字源码以及实际多色高亮断言保留。源码面板检查先等待 Vue 完成 SSR 接管，并按面板本身判断展开状态，不把“面板已展开但源码仍在请求”误判为需要再次点击收起；原有超时没有增加。

### CI 与证据

- 两库新增根 `check:docs-components`，接在 quality 的生产文档构建之后；旧 `check:docs-theme` 保留。
- 公共实现及显式行为清单在 `design-ui/browser/`。未知组件、缺失实际 demo、错误手机映射均阻断 CI，`inventory.test.mjs` 与两端 CI / 公共 `check:ci` 联动。
- Actions 始终归档 `artifacts/docs-components/<library>/coverage.json`、失败截图及诊断；清单区分交互、展示、规范页和实际完成数量。验收结束重新读取 demo 源码，若并行修改导致内容变化则失败并要求重建重跑，不默默接受陈旧源码。
- 本次补强生产输入门禁：除原有 `sourcesStable` 外，coverage 还记录 `productionFingerprint / productionInputsStable`，检测文档编译器、主题客户端、共享预览代码、依赖清单和锁文件；任一指纹漂移均失败。新增正反回归覆盖主题/编译器编辑、锁文件编辑、生成缓存与测试文件排除，公共 CI 检查已增加至 18 项并全部通过。
- 诊断过程中发现并行任务修改了模型命名和部分示例格式，因此旧构建的严格源码检查出现过失败；未放宽文本比较。待修改稳定后重新构建，旧诊断或带 name-pattern 筛选的轮次不作为完整通过证明。
- 本轮未提交、推送或触发远端 Actions；保留原有未提交改动及先前的纯大小写暂存重命名。

### 最终结果与验证边界

| 项目 | 已有实际结果 | 最新源码是否最终验收 |
| --- | --- | --- |
| Maple 完整新增矩阵 | **380 / 380，0 skip / 0 cancel**；996 份展开源码逐字匹配；sourcesStable / productionInputsStable 均 true | 最新分组默认值、Search API 和 AutoComplete 样式已纳入；通过 |
| Cedar 完整新增矩阵 | 第 30 轮 **208 / 208，0 skip / 0 cancel**；1146 份展开源码逐字匹配；两项稳定性标志均 true | 最新 Search API、字段样式入口、本地 logo、手机导航、宽表及平台默认值同源修复均已纳入；通过 |
| 原有主题专项 | Cedar 最新 **45 / 45**；Maple 最新 **6 / 6** | 同一最终产物通过；保留额外断点、Maple 四主题及刷新持久化检查 |
| Maple 模式专项 | **308 / 308**；另 Select / AutoComplete 视觉复核 24 / 24 | 272 项为当前源码独立 Vite 生产辅助页，36 项为真实 Form/Search 文档 demo，未混称为 308 项文档站用例 |
| 文档构建 | Cedar 最新 **274 页**；Maple 最新 **1474 demo SFC / 0 failures** 后生产构建通过 | 构建前后与验收结束指纹一致；通过 |
| 文档流水线 | Cedar **18 文件 / 42 项**；Maple 最新 **23 项**通过 | 本轮相关实现通过，不替代完整全库 quality |
| 公共 CI 契约 | 最新 **19 项**全部通过；私有样式/token 入口 **9 项**通过 | 接线与正反回归通过；不代表远端 Actions 已运行 |
| 运行时依赖 | 两端门禁通过；Cedar 最新 1183 运行时 / 73 工具模块；Maple 930 / 44 模块扫描 | 未放宽循环、根回流、HMR 兜底检查；后续新增修改仍须继续执行 |
| 定向产品回归 | Cedar InputNumber 45、TableColumnManager 22、Ripple / Trigger 105；Maple InputNumber / Code 59、Trigger 定位 4、Ripple 38 项通过 | 定向范围通过，不冒充再次运行全库 Vitest |
| 同源 / 跨端 | 完整复制组件、基础同源、Input/Textarea、数字输入通过；最新平台默认值隔离后完整 Maple cross-platform 通过 | 未修改检查豁免；随后两端生产文档完整重验通过 |

协调记录：上一轮按用户“不通知第三个任务，保留未完成验收状态”的选择停止并释放冻结。本轮用户明确授权后，已通知 API 整改、Cedar 启动优化、首页、Maple 默认 popup 四个任务；冻结范围同时包含生产源码、依赖和 dist/site 产物覆盖，最终均已确认。命名空间本地迁移已完成，其后远端 npm 清理由另一个任务处理，不属于本次验收操作。

追加协调：四任务后来均已确认冻结，实际执行了多轮稳定快照检查。用户随后在 Maple 任务提出新要求：选择/日期时间类默认 popup、其他字段默认 inline；Search 改为 inline/popup 模式 API，并调整 AutoComplete 标准弹层样式。该任务确认 Search 要同步 Cedar，已停止把上一版全 popup 的结果当作最终结论。已再次通知完成这轮必要改造后冻结；本任务也向用户明确了“先完成新改造再验收 / 先暂停改造验收”的优先级选择，未擅自中断另一个任务的用户新需求。

Cedar 第 21 轮结果已封存于 [Search API 改造前快照证据](evidence/full-build-ci-2026-10-24/cedar-r21-pre-search-api/)：构建 274 页、原专项 45/45、新矩阵 208 个单项全部通过；完整 suite 因改造期间指纹变化而失败，原始失败日志及 coverage 的两个 false 均完整保留。index hash 为 1ef98ecbd61efdf4767ce93d6c15d6b0b521f57c971772f88347a672cd6d50f4；不能将该目录解释为最新稳定源码验收通过。

恢复验收过程记录：第 12 轮 Maple 完整 **380/380**、sourcesStable 和 productionInputsStable 均通过，随后默认 popup 迁移开始，因此该通过仅证明迁移前快照；证据保留在 final-production-acceptance/maple。Cedar 第 12 轮 **207/208**，唯一失败为暗色 Collapse 页面 5 秒导航超时，未忽略该失败。生产指纹还捕获到首页任务修改 theme.ts 作者配置，以及 popup 任务同步 Cedar 内嵌调用，故未签收这些陈旧构建。生产输入检测随后纳入 Cedar 首页及其他 docs 文档，并有首页编辑正反回归。第 17 / 18 轮属于中间诊断；Cedar r22 / Maple grouped 通过后又发现平台默认值同源差异，故再次重建，最终采用 Cedar r30 / Maple r29。弹层用例实际打开入口、编辑草稿、确认并核对外部主值；取消路径验证不提交，不将默认弹层强制切成 inline 规避行为。

最终收尾已完成：协调冻结 → 捕获源指纹 → 两库重建 → 208 / 380 完整矩阵及 45 / 6 原专项 → 比较结束指纹 → 归档最终 coverage / 日志 / 截图。期间指纹变化的轮次均被拒绝签收；最终通过轮没有增加超时、减少用例或关闭检查。

覆盖边界：手机使用 Chromium 的 iPhone 设备仿真与浏览器可信触摸输入，不等于物理 iPhone / Safari 验收；每个组件有明确代表性行为，不代表每个组件全部 API 的穷尽验证。新增全组件矩阵覆盖默认亮暗主题，既有专项门禁保留其他品牌主题与断点。

### 最终固定输入及证据

| 库 | sourceFingerprint | productionFingerprint | 生产 index SHA-256 |
| --- | --- | --- | --- |
| Cedar | 00a5bce9126acac366ce46f6bed0a3cbab0285a3ffd997984414630bb54e0c3d | 4a464410cabe6009ef9b8cb67f786f4a3cc6d27af2010566986fdde4cbefa635 | ff045162ea9fddad14c381042304c2c990fbdd64a5e25df8161b399032dad1f0 |
| Maple | 5217800b9dc1bb34dbb2934577d6265373526e389b7fd1f3a253036fd8be5a01 | e72172ce78cd8387f28179d1163968b7abfd331d13e8259a62f4247fd7372b00 | cffd8de1331e27b8c4748d5e00a9b29c598d62804453e71d3a6261a49bf07f13 |

- [Cedar 最终 coverage](evidence/full-build-ci-2026-10-24/final-accepted-r29/cedar/components/coverage.json)、[完整 208 项日志](evidence/full-build-ci-2026-10-24/final-accepted-r29/cedar/cedar-components-final-r30.log)、[原 45 项日志](evidence/full-build-ci-2026-10-24/final-accepted-r29/cedar/cedar-theme-final-r29.log)。
- [Maple 最终 coverage](evidence/full-build-ci-2026-10-24/final-accepted-r29/maple/components/coverage.json)、[完整 380 项日志](evidence/full-build-ci-2026-10-24/final-accepted-r29/maple/maple-components-final-r29.log)、[原 6 项日志](evidence/full-build-ci-2026-10-24/final-accepted-r29/maple/maple-theme-final-r29.log)、[模式专项 coverage](evidence/full-build-ci-2026-10-24/final-accepted-r29/maple/presentation/presentation-coverage.json)。
- 此前独立状态复查覆盖两库 Menu / 导航与步骤等 **32 组亮暗×桌面/手机组合**，控制台零错误/警告；[原始记录](evidence/production-state-browser-2026-10-24/final-focused-results.json) 中 Cedar 取 cedar-r22-*，Maple 取 maple-refrozen-*。这些是平台默认值修复前的历史快照，不冒充最新指纹下重跑的 32 组；最新签收使用上述完整矩阵。手机正文宽度、本地 logo、标题策略的历史证据见 [Cedar 布局记录](evidence/production-state-browser-2026-10-24/cedar-r22-layout-logo.json)。

本轮额外定向验证：Cedar 配对测试 60 项、最新 Search / AutoComplete 75 项；Maple 最新字段 / Form / Search / AutoComplete 428 项及公共字段样式保留回归 12 项通过，部分用例有重叠，不相加。两端类型检查通过。全库 Vitest、完整库构建与发布包检查的旧轮次证据仍在前文，不宣称本轮新增 API 后又完整重跑了一遍 quality；最新生产文档验收与远端 GitHub Actions 的验证范围分开理解。

### 最新追加：平台默认值同源隔离

用户选择先完成 Search、字段默认值与 AutoComplete 改造后统一冻结。本任务最后执行未修改的全量 `check:cross-platform`，实际拦截了两类差异：Cedar 私有包装器尚未接受 adapter 默认值；AutoComplete 适配器及 Select 控制器直接混入 Maple 的 `popup` 默认值。未扩大归一化规则、删除文件对或豁免默认值。

修复后公共包装器支持同一套可选默认值；AutoComplete / Select 引用各自私有 context 的 `defaultSelectionPresentation`，Cedar 保持 `inline`、Maple 保持 `popup`。未配置的 Form 不抢先覆盖字段默认值，嵌套编辑器边界仍回落 `inline`，明确设置的字段 / FormItem / Form 优先级不变。没有增加公共 API 或兼容分支。

- 最新完整跨库同源门禁通过；两端运行时依赖门禁通过（Cedar 1183 / 73、Maple 930 / 44 运行时 / 工具模块），无循环、根回流或 HMR 整页刷新兜底。
- Cedar 受影响测试 120 项、Maple 102 项通过，含两端新增的默认值优先级及嵌套编辑器回归。新增测试格式被 Maple 默认 lint 拦截后已修正，两端重新检查通过；未改 lint 规则。两端类型检查通过。
- 公共 CI 契约 19 项、私有样式/token 目录入口 9 项正反回归通过。新测试进入各自原有完整 Vitest 收集范围，生产浏览器矩阵仍由两端 quality / CI 原入口执行。
- 两端重新构建：Cedar 274 页；Maple 1474 demo SFC 零失败后生产构建通过。构建前后双指纹一致；本轮证据位于 [新输入验收目录](evidence/full-build-ci-2026-10-24/final-accepted-r29/)。
- Maple 新产物模式专项 308/308、视觉复核 24/24 通过；[专项原报告](../../maple-design-mobile/artifacts/presentation-acceptance-2026-10-24/presentation-parity-final/report.md) 区分 272 项生产辅助页与 36 项真实文档 demo，不能合称 308 项文档页面。

Cedar r29 完整矩阵 207/208，唯一失败是 Form 亮色页面 `goto` 超过原定 5000ms，尚未执行交互断言；相同产物暗色 Form 的交互与源码检查通过。此轮指纹稳定，但 suite 失败，未签收。随后六个独立浏览器上下文导航均在 197–1067ms 完成，无未完成请求或运行时错误；未复现原超时，根因不能据此断言已消除。[失败轮、截图和六次诊断](evidence/full-build-ci-2026-10-24/cedar-r29-navigation-failure/) 完整保留。随后相同产物在原时限下完整重跑 208/208，通过 Form 两种主题的交互与源码检查；没有延长超时、修改页面或单独补过。

最终独立核验同时检查 208 / 380 全部结果为 true、TAP 零失败/跳过/取消、1146 / 996 源码检查数、构建前后收据、当前两仓实时指纹、实际生产 index 和 308 / 24 专项输入一致；[收据](evidence/full-build-ci-2026-10-24/final-accepted-r29/common/production-acceptance-final-r29.json) 为 passed=true。人工补看最新 Cedar / Maple 真实生产文档亮暗截图，卡片、导航高亮及 Tabs 内容正常；AutoComplete 辅助页截图与真实文档矩阵分开归档，未混计。

### 尚未覆盖与后续观察

1. 本次完成的是最新生产文档验收及受影响门禁。完整全库 Vitest、发布包构建和整条 quality 的前期通过记录不能替代新 API 后再次全量执行；正式发布前仍应对固定提交运行完整 quality / 远端 Actions。本任务未提交、推送或触发远端流水线。
2. 手机覆盖使用 Chromium 设备仿真，不等于物理 iPhone / Safari；交互按显式组件契约覆盖代表性流程，不声称全部 API / 浏览器组合已穷尽。
3. 当时 Form 的一次 5 秒导航超时未复现，原时限完整重验通过，但当时没有确定根因。2026-10-25 已补充真实外部请求永久挂起的稳定复现、修复前后对照及 CI 防回归，见 [导航超时定位报告](navigation-timeout-2026-10-25.md)；旧失败轮缺少外网轨迹，不能倒推其唯一等待请求。最新全库验收仍未签收，不能以历史重跑通过替代。
