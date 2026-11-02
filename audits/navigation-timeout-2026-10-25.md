# Cedar / Maple 生产文档导航超时定位

日期：2026-10-25。承接 [2026-10-24 验收报告](full-build-ci-2026-10-24.md)。状态：导航阻塞路径已定位并修复，受控故障回归已验证；**当前最新全库生产验收未完成、未签收**。用户最新决定为“其他改造继续，本轮保留未完成验收状态”。已停止过期产物上的测试，不再占用冻结窗口。下文通过数字均标明对应固定快照，不代表后续并行改造后的最新代码已通过。

## 原因及修复前证据

不是通过重跑通过签收，也没有把 `load` 改为 `domcontentloaded`。

1. **Cedar：未使用的 Font Awesome 远程脚本。** Hope 主题配置 `iconAssets: 'fontawesome-with-brands'` 在客户端初始化时向文档动态插入三个 jsDelivr 脚本。若插入发生在文档 `load` 前，脚本即使是 async 也会延迟 `load`。本地 logo 与组件挂载的先后顺序不同，就会出现“相同页面有时等待 CDN、有时已先触发 load”的竞态。导航和组件图标实际使用本地 SVG，导航/sidebar/frontmatter 未配置 Font Awesome 图标，不需要这三个远程库。
2. **Maple：解析期间插入可选统计脚本。** PC、mobile 两个 HTML 入口在解析 `<head>` 时插入 `hm.baidu.com` 脚本。PC 页面还嵌入 mobile iframe，因此会出现两个相同 URL 的独立请求。统计服务一直不返回时，正文已就绪但导航等待的 `load` 仍不能完成。只增加 async 不能解决这种 load 依赖。
3. **旧诊断漏掉外部等待。** 原组件门禁只记录站内资源失败，旧 Form 超时保留下来的 DOM 和空 failures 无法反映 CDN 仍在挂起。截图后再读 `document.readyState` 也可能错过当时的时序。本次在 Chrome 网络及生命周期事件侧采集，不依赖超时后的渲染线程。

先在未修改的旧生产产物上采集正常时序，再永久挂起真实外部请求；把真实本地 logo 的响应延迟固定为 1200ms，使初始化脚本确定发生在 load 前。没有插入虚构的外部依赖，也没有增加 5000ms 时限。

| 旧生产产物 | DOMContentLoaded | 原 5000ms 导航结果 | 超时当刻未完成请求 |
| --- | --- | --- | --- |
| Cedar Form | 约 306ms | 约 5003ms 失败，未触发 load | Font Awesome brands / solid / fontawesome 三个 jsDelivr 脚本 |
| Maple Form 文档 | 约 122ms | 约 5013ms 失败，未触发 load | 主文档及手机 iframe 两个独立 hm.baidu.com 请求 |

正常时序也观察到 Cedar 的远程图标请求在不同轮次分别发生于 load 前或后，解释了为什么重跑可能通过。旧 2026-10-24 失败轮没有保留外部网络轨迹，不能追溯证明当次唯一等待对象；本次证据证明的是同一生产产物、同一 load/5000ms 门槛下可稳定复现的实际阻塞机制，以及修复前后相同故障条件的差异。

[修复前原始 Chrome 网络/阶段记录](evidence/navigation-timeout-2026-10-25/before/docs-navigation-all-external-stall-before-20261025.jsonl)、[正常时序记录](evidence/navigation-timeout-2026-10-25/before/docs-navigation-normal-20261025.jsonl) 均保留，包含完整请求而非仅错误列表。

## 同条件修复后对照

同一脚本、同一环境变量、同一外网永久挂起和本地图片延迟条件下，新产物的结果为：

| 生产产物 | load | 外部依赖状态 |
| --- | --- | --- |
| Cedar Form | 约 1467ms | 不再发出任何 Font Awesome CDN 请求；真实 logo 响应仍延迟，未移除图片或绕过加载 |
| Maple Form | 约 231ms | 统计请求约 232ms 才发出，明确晚于 load；请求仍无响应，统计没有被取消或伪造成功 |

[独立因果核验](evidence/navigation-timeout-2026-10-25/after/navigation-causality-verification-20261025.json) 为 passed=true：自动检查修复前两库在原门槛失败且只有 DOMContentLoaded、修复后 load 在 5000ms 内，以及 Maple 保留统计并在 load 后真正挂起。[修复后原始记录](evidence/navigation-timeout-2026-10-25/after/docs-navigation-all-external-stall-after-20261025.jsonl) 与核验脚本一起归档；不是拿正常网络下重跑通过代替故障复验。

## 实现与防回归

- Cedar 删除未使用的远程 Font Awesome 配置，保留所有本地 SVG 图标、组件与功能；不拦截 CDN 伪造成功，不丢弃组件 demo。
- Maple 保留可配置统计和既有 `_hmt` 队列，将脚本启动移到文档 load 后；若入口执行时文档已 complete，则立即启动。脚本显式 async，load 监听 once，未配置时不创建脚本或监听器。PC / mobile 使用相同逻辑。
- 公共 `browser/navigation.mjs` 在原始导航异常发生时冻结诊断：URL、耗时、DOMContentLoaded / load 阶段、所有 HTTP(S) 请求及未完成列表。以请求对象而不是 URL 为键，保留两个相同 URL 的独立请求。保持原异常、调用参数、超时和一次调用，不吞错、不重试、不切换到 DOM-ready。
- 两端完整组件入口新增外网故障专项各 4 项：Cedar Form / Collapse × 亮暗，Maple Form PC / 手机 × 亮暗。全部外部请求始终不返回；Cedar 不得尝试加载 CDN，Maple 声明的统计必须仍能启动并保持挂起，真实 load、主题切换、业务交互和文档源码检查仍需通过。原 208 / 380 完整矩阵及原主题专项保留。
- 新增模板时序、once、未配置、既有统计队列、诊断不重试、同 URL 请求区分的单元测试，接入两库原 quality / CI。原检查未删除，工作流仍执行完整 quality。
- 修正 Maple 生产输入指纹漏项：纳入 CLI `site/` 下模板和客户端、HTML 及 `maple.config.mjs`，正反测试同时验证这些编辑必须改变签名，而测试文件不会改变生产签名。原签名记录保留为历史，不能当作新规则下的签名。

## 已完成验证（固定快照，非最新全库签收）

- 公共 CI 契约及单元：30/30，通过（包含后述 hover 前置回归）。
- Cedar 文档流水线：18 文件、42 项，通过；Maple：23 项，通过。
- 首批修复后生产构建通过：Cedar 274 页；Maple 1474 demo SFC、零失败后构建成功。该批构建前后输入收据一致；后续发生的新修改不在这份收据范围内。
- Cedar / Maple 永久外网故障专项各 4/4，通过；真实交互和主题切换正常，Maple 统计仍保持 pending，Cedar 零远程图标请求。
- Maple 在 AutoComplete 后续样式改造前的完整入口 384/384（原 380 项＋新增 4 项），零失败/跳过/取消；原主题专项 6/6。Cedar 固定快照原主题专项 45/45。证据分别保留于 [Maple 历史通过快照](evidence/navigation-timeout-2026-10-25/maple-pre-auto-style/previous-final-files/) 和 [Cedar 历史专项](evidence/navigation-timeout-2026-10-25/cedar-pre-people-api/previous-final-files/)。
- Cedar 完整入口首轮 211/212，Menu 暗色交互失败；导航已完成，并非 CDN 导航超时。修正下述驱动前置条件后的下一轮为 210/212：Menu 亮暗均通过，但 PeopleSelect 两种主题的源码一致性断言失败，原因是另一任务在构建后修改了该 demo，并非编译缓存问题。这两轮均未签收，也没有忽略失败项。

### 两项验收驱动诊断，不混作产品修复

1. 新手机故障专项最初只设窄视口和触摸，却使用桌面 UA，被站点正确导向 PC 文档，缺少手机主题按钮。已对齐原矩阵的 iPhone 13 仿真，未改断言；该轮中止并保留于 [设备诊断](evidence/navigation-timeout-2026-10-25/harness-device-diagnostic/)，随后完整 384 项重新执行通过。
2. Cedar Menu 的真实鼠标轨迹显示：自动平滑滚动将文档从约 1704px 向下移动，鼠标进入“产品”约 98ms 后，目标移动到鼠标之外并触发 mouseout，早于原 100ms hover 延迟，故组件正常取消展开。已通过滚动、命中元素及 focus/路由调用轨迹复现，不是再跑一次后忽略失败。驱动先调用 scroll-into-view，轮询真实文档及目标几何稳定，再只发一次 hover；不禁用动画、不强制点击、不改子菜单延迟、结果断言或 5秒/30秒时限。增加单元测试验证移动期间不能输入，稳定后仅 hover 一次；8 轮真实页面事件轨迹验证通过，完整 Cedar 矩阵仍需完成签收。[诊断证据](evidence/navigation-timeout-2026-10-25/menu-scroll-diagnostic/) 保留原失败、调用轨迹和修正后记录。

## 为什么保留未完成验收

先发生 PeopleSelect Fetch API 示例修改，随后 Maple AutoComplete 样式及文档修改，使上述产物过期。再次构建 Cedar（274 页）及 Maple（1474 demo SFC）成功后，其他任务继续批量修改两库类型、组件和文档；生产输入指纹再次与验收基线不一致。签名检查没有放宽，源码逐字检查也实际阻断了陈旧产物。

最近一次 Cedar 基线源码指纹为 `ca4632d5cc95ba7f3ec61718b060cddfc651aa57dbfc771cbba1008ab9e64bad`，后续检查已变为 `80f7d83d13d799cea214f15baf7770762e64df406d44bbd9fc62bae8f9e24c12`；这只是当时观测值，后续仍可变化。构建后守卫因此失败，没有生成成功收据。该次守卫失败后的两库浏览器进程仍被启动，是本次执行流程的顺序失误；已停止这组失效测试，不采纳其通过项，也不将空的收据文件当作证明。

按用户决定继续其他改造，本轮不再构建或重跑。最近日志与基线保留于 [源码漂移记录](evidence/navigation-timeout-2026-10-25/source-drift/)，原拟用于最终验收的目录已改名为 [pending-final](evidence/navigation-timeout-2026-10-25/pending-final/)，明确未签收，无最终 passed 收据。

下一轮签收前置条件：并行生产输入修改结束，重新采集两库指纹并构建，确认输入未变化，再完整执行 Cedar 212 项、Maple 384 项和原主题专项 45 / 6 项，最后重新比较源码与生产输入指纹。保留全部亮暗主题、真实交互、源码逐字一致性及永久外网故障检查；不以重跑成功、加超时或减少用例替代根因处理。

远端 GitHub Actions 未触发；物理 iPhone / Safari 未覆盖。本报告的因果复现、历史生产快照验证与并行任务的组件 API / 类型检查分别记录，不混称全库最新 quality 已执行。CI 接线已补齐，不等于远端 CI 已通过。
