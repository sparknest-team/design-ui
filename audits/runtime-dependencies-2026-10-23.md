# Cedar / Maple 全库运行时依赖与原生 HMR 复查

时间：2026-10-23，最终门禁复跑 23:53（Asia/Shanghai）。承接 [Image / Upload 原生 HMR 修复](./image-upload-native-hmr-2026-10-23.md)。

## 2026-10-24 后续闭环：shared 差异已修复

shared 的旧同源失败现已关闭，且门禁已加强到完整文件清单和类型声明。68 组运行时 foundation 文件、两端 shared 发布回归、629 项消费者测试、原 92 入口体积上限及类型 / lint 复验通过。具体改动、旧浏览器观察边界和证据见 [Shared 同源收敛报告](./shared-foundation-2026-10-24.md)。下文 2026-10-23 的失败记录保留为历史，不代表当前待处理状态。

## 结论

本轮发现并修复两端 Menu 的递归模块环，以及 Cedar Scheduler 的 core 入口回流。没有新增整页刷新兜底，也没有通过动态导入、延迟读绑定、忽略报错或循环白名单绕过检查。Scheduler 基础函数仅搬移，已与 HEAD 原实现逐字比较确认逻辑未改；两库公共 API 不变。

最终全量扫描结果：

| 库 | 源码运行时模块 | 站点 / CLI 工具模块 | 运行时环路 | 根入口回流 | 被禁止的 HMR 兜底 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Cedar | 1,174 | 68 | 0 | 0 | 0 |
| Maple | 930 | 44 | 0 | 0 | 0 |

运行时模块数是扫描到的源码文件数，不是生产 bundle 模块数：包括公开入口、私有 / 未被公开入口引用的文件、样式 JS 入口、主题、工具及 shared / use 源码。第三方依赖与独立图标包作为外部边界列入检查结果，不递归审计其实现；Less / CSS / 图片只作为资源，不解析其内部依赖。Demo 与测试不纳入生产模块图，站点编译边界另行验证。

## 修复明细

### Menu：两端一致的递归组合

原依赖：`options.ts → MenuBranch.vue → options.ts`。

修改后：`options.ts → MenuBranch.vue`，递归仍由同一 MenuOptions 组件通过默认插槽提供。分支组件只负责浮层、定位、键盘与层级状态，不再导入渲染器；递归组件在正确的父子上下文内创建。同步删除分支内部未再使用的 options prop。

两端新增同一行为回归：自定义 label/value/children 字段映射，连续进入三级菜单，激活叶节点只通知一次，Escape 每次返回一级并恢复正确焦点。原来的禁用、选中、动态选项、分组与定位测试保留。

### Scheduler：拆清基础计算与公开聚合

原 core/index.ts 同时定义基础函数并聚合导出；availability、transaction、recurrence、business-calendar、capacity、duplicate、now-indicator、visible-days、interaction、dependencies 等模块反向导入它，扫描发现 12 条回流链。

基础日期、区间、克隆、校验、变更与布局函数原样移到 `core/base.ts`；`core/index.ts` 只做原有公开导出。12 个内部模块改为依赖 base 或 types，SchedulerError 直接从 types 引入。Maple 没有 Scheduler，不为形式对齐新增组件；两库执行同一依赖原则。

### 原生文档 HMR 保留

全量搜索未发现其他强制整页刷新代码。Maple Markdown 和 Cedar VuePress 的现有 handleHotUpdate 用于重新编译文档与同步展示源码，不发送 full-reload，予以保留。Image 示例中的 reload 是图片重试，Scheduler 工作台的 reload 是业务数据加载，不是 location.reload。

## 防回归门禁

统一命令：两库仓库根目录运行 `pnpm check:runtime-dependencies`。已加入两库 `quality` 命令与 GitHub Actions；公共契约位于 [component-anatomy](../standards/component-anatomy.md)。远端 CI 尚未实际运行，本机已执行同一命令通过。

- `bin/runtime-dependency-graph.mjs`：编译 Vue script，再由 TypeScript 擦除类型；解析静态 import/export 与字面量动态 import。遍历全部实现文件而不只遍历公开入口；递归解析 shared / use 源码；未解析的本地代码依赖直接失败。
- `bin/runtime-dependency-check.mjs`：检查环路、裸包名 / 相对路径的根入口回流，并用 AST 检查 full-reload、location.reload、手写 hot.accept/invalidate 与关闭 HMR。
- `bin/runtime-dependency-check.test.mjs`：真实 TS / SFC 正反夹具覆盖类型擦除、动态导入、未公开模块环路和刷新兜底检测。两库本地 / CI 命令都会先运行这些检查器自身的测试，再检查目标库。
- 两库站点自动导入测试扩展到每个实现文件：普通路径、`/@fs` 路径、SFC script 查询路径均排除自动导入；Demo 仍可正常解析。禁止恢复特定组件的 handleHotUpdate 拦截。
- Image / Upload 的 95 / 91 模块专项闭包检查继续保留。

静态门禁不是对任意运行时动态路径或第三方插件行为的形式化证明；构建插件升级及新增命令式服务，仍须验证真实浏览器 HMR。正常的站点配置修改 / 服务重启导致的刷新不属于组件兜底。

## 实际验证

本轮去重共 478 项专项测试通过：

| 范围 | 通过 |
| --- | ---: |
| Cedar Scheduler（63 个测试文件） | 401 |
| Cedar Menu（含新增三级回归） | 26 |
| Maple Menu（含新增三级回归） | 27 |
| 公共全库依赖 / Image-Upload 闭包测试 | 8 |
| Maple 站点解析 / 聚合入口测试 | 12 |
| Cedar 站点解析测试 | 4 |

Cedar 首轮 Menu + Scheduler 为 426 项；增加新的 Menu 回归后又单独运行 Menu 26 项，不能把重跑重复相加。两库全库 typecheck 通过；Maple 全库 lint:check 通过；三个仓库 diff --check 通过。未执行完整 npm 包 / 文档发布构建，也未声称全库行为测试全部执行。

验证清单：[validation.json](./evidence/runtime-dependencies-2026-10-23/validation.json)。浏览器证据：[native-hmr.json](./evidence/runtime-dependencies-2026-10-23/native-hmr.json)。

- 两端 MenuOption 模板与脚本更新：真实 DOM 探针生效，三级菜单保持，外层输入 HMR-ALL-KEEP 保留，无错误。
- 两端 MenuOptions TS 更新：Vue 重新挂载 Menu，浮层正常关闭；外层输入保留，重新展开后三级递归及探针生效，无初始化错误。
- Cedar Scheduler 模板更新：43 个实例更新，外层输入保留。
- Scheduler 核心导出会让引用它的 Demo 重新挂载，Demo 内的筛选输入不是可靠的整页重载哨兵。因此脚本与 base.ts 更新改用站点顶部主题菜单展开状态 + Vite 连接日志交叉确认：43 个实例更新，顶部菜单始终展开，期间没有重新连接，无错误。
- 源码恢复后：两端三级菜单正常，Escape 返回导出项且最终仅保留前两级；Scheduler 暗色导航从 9 月 7–13 日切换到 14–20 日，新建抽屉可打开、取消后关闭并恢复按钮焦点。三页最终控制台错误均为空，DOM / 源码探针均为零。

截图：

- [Cedar 三级菜单](./evidence/runtime-dependencies-2026-10-23/cedar-menu-three-level.png)
- [Maple 三级菜单](./evidence/runtime-dependencies-2026-10-23/maple-menu-three-level.png)
- [Cedar 暗色新建日程](./evidence/runtime-dependencies-2026-10-23/cedar-scheduler-dark-editor.png)

## 遇到的问题与未完成边界

1. 依照用户决定，其他任务继续工作。Cedar 顶部 theme-config 的并行修改在 23:42:30、23:47:00 触发配置刷新；连接日志保留，未将这些刷新计作组件热更新成功。成功窗口已单独记录，不需要暂停其他任务。
2. Cedar 使用旧版 Vitest，线程参数通过 VITEST_MAX_THREADS / VITEST_MIN_THREADS 设置；站点独立测试配置显式使用 127.0.0.1，解决本机 localhost 解析失败。站点测试将 resolver / shared 映射到源码，避免干净 CI 在 build 前读取不存在或过期的 lib。未关闭测试、放宽断言或关闭 HMR。
3. 当时额外运行 `node bin/copied-foundations-check.mjs`：Menu 的 9 个共享逻辑文件和 use 的 15 个文件通过，但在 shared/index.ts 失败。该项已于 2026-10-24 在并行 shared 修改稳定后统一修复，保留并加强原门禁，见本文顶部后续报告。完整发布构建 / 远端 CI 仍不属于本报告的全绿声明。
4. 本轮完成的是全库源码依赖 / HMR 兜底检查，以及本次修改组件的测试和浏览器验证；没有逐个编辑所有组件验证 HMR，也没有重新执行全部页面 / 全部品牌配色的视觉验收。前次 Image / Upload 16 组 HMR 验证见前述报告，本轮未重复计算。
