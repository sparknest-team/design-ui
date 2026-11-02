# Cedar / Maple 浏览器兼容性实施与验证

状态：当前工作区两库完整 quality 通过，三引擎共 1,830 项通过；原生最低版本、最新两个稳定版本和移动真机仍待验收。前序冻结快照结果保留为历史。

## 当前工作区复验（2026-10-29）

两库均从当前活动工作区执行完整根入口 `pnpm quality` 并以 0 退出；Cedar 最终日志为 quality-05，Maple 为 quality-07。浏览器服务使用本轮生产文档产物的独立副本，没有用前序冻结源码副本替代当前代码验收。最终再次核对三引擎报告与当前源码、生产输入及文档入口哈希，全部匹配。

| 组件库 | 完整 quality | 组件单测 | Chromium / Firefox / WebKit | 三引擎合计 |
| --- | --- | --- | --- | --- |
| Cedar | 通过 | 3,707 | 217 / 217 / 217 | 651 |
| Maple | 通过 | 4,295 | 393 / 393 / 393 | 1,179 |

三引擎共 1,830 项，0 失败、0 跳过。Cedar 每引擎包含 198 组件场景、14 指南、4 断网导航、1 能力探针；Maple 每引擎包含 372 组件场景、16 指南、4 断网导航、1 能力探针。Maple 同时覆盖文档和独立手机示例的亮暗主题。Firefox 窄屏属于补充回归；WebKit/Firefox 合成触摸事件仍不能替代真机手势。

本轮主要修复：

- 两端 Input 保留默认关闭自动填充的契约，通过私有注入作用域让 VerificationCode 的首个输入框使用 `one-time-code`，修复短信验证码自动填充声明失效的问题。
- Cedar 表格测试恢复原型描述符，Typography 避免恢复已销毁的假时钟；Maple LoadingBar 测试通过服务完成清理，结束时无残留节点和定时器。全量测试不再出现跨文件污染或环境销毁后的未处理回调。
- 同步当前 `payload / done / context`、options、字段控制和确认按钮契约，迁移已合并示例的测试入口，审查后更新可访问触发器和自动填充相关快照；保留实际选择、取消、语言切换、尺寸及内容断言。
- 修复 Vue 格式归一化的对象换行误报，保留对事件和值变化的检测；补齐 NavMenu 长内容分组及阅读方向翻译词典，210 个组件族的双语文档可重复生成。
- 浏览器夹具从 CLI 工作区直接导入 Vite/Vue/JSX 的 ESM 入口；品牌测试文件串行运行。更新当前 Showcase 页面选择器和品牌颜色预期，并保留、补充可读对比度断言。
- 修复 SafeArea 品牌表单真实示例的关闭回调：由旧参数形式迁移到 `beforeClose({ reason }, done, { signal })`。SafeArea 3 项及品牌表单 28 项全部通过，包含七种关闭来源、草稿保留、异常、上传、时区、DST 和端点锁定。

**体积门禁变更需单独审阅**：本轮为 94 个按需入口重新核对基线，新增 NavMenu、PeopleSelect、SafeArea 三项；73 个既有入口至少一项上限提高至当前实测值，18 项沿用原上限。没有使用统一倍率增加余量，但本次通过不表示仍满足全部旧额度。原限值、新实测值、源码模块增量及 HEAD 对照保存在 [逐入口体积审计](maple-component-bundle-baseline-2026-10-29.json)。

最终代码另行通过全库 lint、类型检查及共享 CI 契约 47 项。最后 Maple 浏览器阶段单独运行，组件并发为 1；未增加原 5 秒操作或 30 秒组件用例超时。先前一次 Date 主题控件等待失败保留在历史中，随后独立三次验证全部通过，最终完整入口与三引擎矩阵也全部通过，未以定向结果替代全量结果。

[当前证据及哈希清单](evidence/browser-compatibility-current-2026-10-29/manifest.json)、[Cedar 完整日志](evidence/browser-compatibility-current-2026-10-29/logs/cedar-quality-final.log)、[Maple 完整日志](evidence/browser-compatibility-current-2026-10-29/logs/maple-quality-final.log)、[Cedar 当前矩阵](evidence/browser-compatibility-current-2026-10-29/cedar/compatibility-matrix.json)、[Maple 当前矩阵](evidence/browser-compatibility-current-2026-10-29/maple/compatibility-matrix.json)。归档含失败历史和诊断记录，共 195 个文件已逐项复核 SHA-256。Maple 顶层指南和展示页另记录完整输入摘要，并确认在本轮 quality 启动前已稳定。

原生设备、候选最低版本及厂商最新两个稳定版本仍未验收，相关标志保持 false；不能将 Playwright 引擎通过扩大为 iOS/Android、微信或 App WebView 真机承诺。发布验收门禁仍要求有效的当前产物真机证据。Cedar 构建存在仓库外规范链接的非阻断告警，完整入口退出状态仍为 0。

## 前序兼容性实施

- 共享 JS/CSS 编译目标：Chrome/Edge 111、Firefox 121、Safari 16.4；是编译下界和候选验证边界，不是已认证的支持承诺。
- 保留原 Chromium 门禁，追加 Chromium / Firefox / WebKit 完整生产组件与导航矩阵；实际 Chrome / Edge channel 可额外运行。
- Maple 按手机设备模拟路由，报告分别记录真实引擎版本与 UA 模拟，Firefox 明确为窄屏补充回归。WebKit/Firefox 的滑动为处理器合成事件回归，不能替代真机手势。
- 兼容矩阵检查预期与完成数、全部结果、导航、CSS 能力、实际引擎版本、产物 SHA-256、源码和生产输入指纹；允许同一产物的完整单引擎重跑后重新汇总，拒绝混用旧证据。
- 发布前原生证据检查：准确设备/系统/浏览器/宿主/内核版本、时间、截图或视频、完整检查项；绑定 ESM/CJS/UMD 发布 JS/CSS 哈希。待验收、过期、缺失或最低边界未测均失败。

## 前序配套修复（历史）

- Maple Markdown 编译器只将默认 .vue 导入的旧式示例转为活组件；普通 Vue/TypeScript 代码保持静态展示，代码块统一 v-pre，修复 ref 被误注册的构建失败。
- Cedar 入口生成器改为导出现有 Orientation 类型，避免再次生成已不存在的 Direction 导出。
- Cedar TreeSelect 面板显式接收解析后的 options，避免模板继续读取未经解析的 data prop 而显示空列表；覆盖选项优先级、真实点击选择和关闭，相关 6 文件 16 项测试通过。
- Cedar 旧 ResizeObserver 包装器将可能修改布局的回调合并到下一帧，并在重新绑定或卸载时取消旧通知，避免 WebKit 的同周期布局反馈。新增调度、最后通知合并和卸载回归；相关表格测试等待实际帧后继续断言原宽度。
- 更新已合并的 Alert、Paper、FieldDecorator、Hover 案例契约，保留关闭、状态和布局断言；日期使用当前公开的打开触发器。Provider 示例补充本地配置切换，以验证子输出实际更新。
- 滑动前核对实际命中目标；PullRefresh 将示例滚动容器还原到顶部再操作第一行；Ripple 和拖动先等待目标可操作，再读取坐标，避免固定页头遮挡。没有取消交互断言、缩减组件范围或放宽原有超时。
- Scheduler 视图选择前将工具栏滚动到无遮挡的视口中部，等待菜单入场动画结束，继续通过真实下拉选择检查月视图与事件内容。

## 冻结快照阶段的环境与边界（历史）

以下记录前序阶段当时的范围与未完成项；本轮当前工作区结果以上文为准。

Node 20.18.3、pnpm 9.6.0、Playwright 1.62.0；实际探针引擎 Chromium 151.0.7922.34、Firefox 153.0、WebKit 26.5。这些是安装的测试引擎，不声称对应各厂商当前/上一稳定版。

初次在共享工作区运行时，两端 sourcesStable / productionInputsStable 为 false，报告不得接受。后续在临时冻结副本中重建组件库和文档站；副本不替代真实 Safari、Chrome/Edge 两版本、iOS/Android 真机或业务 WebView 验收。

已通过的阶段检查：两库组件库和文档生产构建、两库 typecheck；三引擎 CSS/视口/触摸事件能力探针；共享构建环境与入口回归 9 项；配置/覆盖/发布证据契约 15 项；Maple CLI 34 项；Markdown 编译 11 项；Cedar CLI 2 项；Cedar lint；本次 Cedar TreeSelect 与 Maple 修改文件的 scoped lint。各批次有重叠，不合计为唯一用例数。Maple 全量 lint 初次失败 90 项，其中本次文件格式已修正，其余涉及工作区其他改动；不声明全库 lint 或完整 quality 通过。

ResizeObserver 修复后，5 文件 11 项尺寸/表格回归通过，新增与修改文件 lint 通过，重建后的 Cedar typecheck 通过。扩大到 NavMenu/InputTag/Typography 的单进程批次为 162/164；失败为 NavMenu `getBoundingClientRect` 只读赋值及 Typography `setTimeout is not a function`，两项单独进程复跑分别 1/1、3/3 通过。批次环境问题未在本次最终定性或修复，不将单独通过扩写成全量测试通过。

## 冻结快照阶段的自动化结果（历史）

| 组件库 | Chromium | Firefox | WebKit | 合计 |
| --- | --- | --- | --- | --- |
| Cedar | 217 通过 | 217 通过 | 217 通过 | 651 |
| Maple | 393 通过 | 393 通过 | 393 通过 | 1,179 |

Cedar 每引擎为 198 组件、14 指南、4 导航、1 能力探针；Maple 为 372 组件、16 指南、4 导航、1 能力探针。六组最终运行均未过滤用例，0 失败、0 跳过，源码及生产输入在运行期间稳定，汇总指纹检查通过。保留原有 5 秒操作/导航与 30 秒组件用例预算；限制同时运行两个浏览器任务，每个任务内部组件并发为 1。

[Cedar 汇总](evidence/browser-compatibility-2026-10-29/cedar/compatibility-matrix.json)、[Maple 汇总](evidence/browser-compatibility-2026-10-29/maple/compatibility-matrix.json)、[证据及产物指纹清单](evidence/browser-compatibility-2026-10-29/manifest.json)。清单记录冻结工作区位置、发布 JS/CSS SHA-256、源码/生产输入指纹、活动工作区与快照是否一致，以及报告/截图/日志校验和。活动工作区仍有其他修改，冻结快照结果不能替代指纹不匹配的当前版本验收；没有将这些报告复制到当前库的活动验收目录。

首次 Maple Firefox 有主题控件等待和 Ripple 定位两项失败，修正后完整重跑 393 项通过。旧 Cedar WebKit 出现 ResizeObserver 循环通知，相关组件和指南失败；修复并重建 Cedar 后，三个引擎全部完整重跑通过。Scheduler 的菜单入场等待也经过亮暗定向及完整回归。初次资源争用及定向诊断结果不计入最终通过数；原失败历史和后续完整运行日志均保存，见证据目录的 history/、logs/。

## 仍需完成的验收

- Cedar 原生 Chrome、Edge、Firefox、Safari 当前和上一稳定版本。
- Maple iOS Safari、Android Chrome 当前和上一稳定版本，候选最低 Safari 16.4 / Chromium 111，以及微信、Android System WebView 和自有 App WebView 真机检查。
- 当前报告的 nativeDeviceAcceptance、latestTwoVersionsAccepted 均为 false。原生证据缺失、pending 或产物不匹配时，发布验收检查会失败；本次未发布。

## 规范与对照

[统一兼容性政策](../standards/browser-compatibility.md) 包含 Vant、Varlet、Ant Design Mobile、NutUI 官方来源对照，以及最低版本、最新两个版本、WebView 独立验收的分工。
