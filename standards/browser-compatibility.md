# 浏览器兼容性与验收

## 支持目标

Cedar：参考 [Naive UI 的平台支持约定](https://www.naiveui.com/zh-CN/docs/supported-platforms)，重点保障 Chrome、Edge、Firefox、Safari 最新两个稳定版本；不支持 IE。当前版本和上一稳定版本由验收当日的官方发行记录确认，不能用版本号减一推算，也不能用 Chromium 代替 Chrome/Edge 或 WebKit 代替 Safari。

Maple：移动端优先，iOS Safari、Android Chrome 最新两个稳定版本；Android System WebView、微信 iOS/Android、App WKWebView/Android WebView 分别验收。宿主 App 版本、OS、设备、内核版本必须记录。Android OS 版本不能代替 WebView 内核版本。桌面 touch-emulator 仅是辅助使用方案。

兼容目标不等于已经认证。候选最低基线为 iOS Safari 16.4、Android Chrome / System WebView Chromium 111，先按这两个边界补验收，不代表已通过。Android 系统版本不作为内核版本的替代。最低移动 OS/内核承诺最终由业务设备分布与真实验收结果确定；在证据完成前不承诺“所有 Android”“两年内所有浏览器”或所有微信/X5/App WebView。

## 构建与降级

唯一编译目标：`packages/ui-build/src/browser-targets.mjs`，Chrome/Edge 111、Firefox 121、Safari 16.4。它是显式语法编译下界，不是这些历史版本的支持或通过声明，也不是 Maple 最低 OS 承诺。组件库全部 JS 格式、Cedar 文档站、Maple 双入口文档站使用同一目标；浏览器运行时 Vue 及外部依赖还需在真实消费者中验证。

当前 CSS 使用 `color-mix()`、`:has()`、`dvh`；发布 Less/CSS 不能仅靠降低 JS target 或加 autoprefixer 兼容旧内核。若业务要求低于此能力基线，先给具体失败用例补基础颜色、显式状态类、vh/viewport 测量等回退，再验收。运行时 API 使用能力检测与必要的局部 polyfill，避免组件库无条件修改全局。

## 自动回归

先在仓库根目录执行 `pnpm build:lib`、`pnpm build:doc`，首次安装 `pnpm exec playwright install chromium firefox webkit`（Linux CI 加 `--with-deps`）。

- `pnpm check:docs-components`：保留原完整 Chromium 门禁。
- `pnpm check:compatibility`：依次运行 Chromium、Firefox、WebKit 的原完整组件与导航契约，并检查 CSS 能力及触摸事件交付；任何引擎失败，最终命令失败，不跳过缺失浏览器。
- `pnpm check:compatibility -- chrome,msedge`：额外运行已安装的真实 Chrome/Edge channel；它仍只代表当前已安装版本。
- `DOCS_BROWSER=webkit pnpm check:docs-components`：单引擎排查，不能代替完整矩阵。

Maple 手机上下文：Chromium 使用 Android 尺寸/触摸配置，WebKit 使用 iPhone 配置；设备 UA 用于手机路由模拟，其中浏览器版本替换为实际引擎版本；OS/设备字段仍是预设，不能证明对应真机或历史 OS 已通过。Firefox 为窄屏补充回归，不假装 iOS/Android 真机。桌面文档和手机示例均保留亮暗主题、交互和源码契约。

Chromium 的滑动通过 CDP 注入；Firefox/WebKit 的滑动通过合成事件验证处理逻辑，报告明确记录输入方式。后者不能证明原生手势竞争、滚动惯性、系统键盘或相机能力。各引擎 `engine-capabilities.json` 只是能力夹具结果，组件验证结果在 `coverage.json`；不能互相替代。

报告位于 `artifacts/docs-components/<library>/<browser>/`，记录实际引擎版本、OS、架构、时间、生产输入与产物指纹、失败截图。汇总为 `compatibility-matrix.json`。模拟结果始终标记 `nativeDeviceAcceptance: false` 和 `latestTwoVersionsAccepted: false`。

## 原生浏览器与真机发布验收

1. 构建最终发布库，在仓库根运行 `pnpm compatibility:native:init`，生成 `artifacts/compatibility/native-acceptance.json`（已有文件拒绝覆盖）。其中 SHA-256 绑定ESM、CJS、UMD 全部 JS/CSS 发布文件。
2. Cedar 在真实 Chrome/Edge/Firefox/Safari 当前和上一稳定版本验收。Maple 使用 iOS Safari 与 Android Chrome 当前/上一版本设备，并覆盖候选最低 iOS Safari 16.4、Android Chrome 111、Android WebView 111、微信双端、App 双端。业务最低版本尚待确定时保留 pending，不填造版本。
3. 按模板逐项验收，记录准确版本、设备、测试人、时间、官方版本来源以及相对报告目录的截图/视频/报告文件。Maple 包括触摸/长按、IME/自动填充、原生软键盘、弹层定位/锁滚、嵌套滚动、横竖屏/地址栏、四边安全区/Teleport、上传/相机及主题。Cedar 包括输入、键盘焦点、弹层、日期、上传和主题布局。
4. 执行 `pnpm check:compatibility:release`。缺失、失败、pending、重复版本、超过 30 天或产物哈希不匹配均失败。`pnpm release` 在构建完成后、发布前调用此检查；重建改变 JS/CSS 后必须重新验收。普通开发 CI 不伪造真机结果，也不因尚无真机结果而阻断开发。

自动化通过、真实最新两个版本通过、业务 WebView 通过是三个独立结论。只有对应证据完整才可以对外声明该范围已支持。

## 移动组件库对照（2026-10-29 核对）

| 组件库 / 来源 | 官方声明或配置 | 对 Maple 的含义 |
| --- | --- | --- |
| [Vant 3/4 官方 README](https://github.com/youzan/vant/blob/main/README.zh-CN.md#浏览器支持) | Chrome >= 51、iOS >= 10 | 移动库通常给最低版本；不等于 Maple 现有功能能运行在同一下限 |
| [Varlet dev 的 browserslist](https://github.com/varletjs/varlet/blob/dev/.browserslistrc) | Chrome >= 54、iOS >= 10 | 这是构建配置，不应扩写成全部组件真机认证；本地 varlet 配置与其一致 |
| [Ant Design Mobile 快速上手源码](https://github.com/ant-design/ant-design-mobile/blob/master/docs/guide/quick-start.zh.md) | 建议 Babel 覆盖 iOS Safari >= 10、Chrome >= 49，并编译 node_modules | 使用方构建也是兼容条件，不能只配置库自身 JS target |
| [NutUI v4 当前 README](https://github.com/jd-opensource/nutui/blob/v4/README.md) | 当前阅读页未列数值浏览器下限 | 不采用第三方文章或旧版 NutUI 的数值冒充当前官方要求 |

结论：Maple 同时维护“候选最低版本 + 最新两个稳定版本重点保障 + 宿主 WebView 独立验收”。现阶段不直接承诺 iOS 10 / Chrome 51；源码依赖的 color-mix、:has、dvh 和原生 API 都需要另外降级与测试。最低版本原生验收项强制核对实际版本，不能拿更新浏览器的结果代替最低边界。

### 同一产物的失败重跑

可以用 `pnpm check:compatibility -- chromium` 重跑单引擎全部用例。全部引擎结束后，用 `node ../design-ui/browser/matrix.mjs cedar --summarize`（Maple 改为 maple）重新核对三个报告：组件/指南完成数、全部通过、导航、CSS 能力、引擎版本、产物哈希及当前源码/生产输入指纹必须一致。任何缺失或过期输入均失败，不能合并不同产物的绿灯。`completeEngineMatrix` 只有三个引擎全部有效才为 true；单引擎通过始终不代表完整矩阵。
