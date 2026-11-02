# Cedar / Maple 本地验证与真机验收交接（2026-10-29）

本次按“先完成本地验证与可交接验收包”推进。完整质量基线为 **2026-10-29 14:12:40（北京时间）** 的发布候选构建。包内发布 JS/CSS 与文档入口均与该质量记录逐字节哈希一致；后续其他任务修改但尚未重建的源码不属于此产物的验收结论。`testInventoryFingerprint` 只标识本轮测试库存，不能充当构建源码证明。

## 已完成

- 共享工具最终 CI：55 项通过，0 失败、0 跳过。
- 原生门禁、固定浏览器版本、交接服务及篡改检测专项：14 项通过。
- Chrome for Testing **156.0.8078.73、155.0.8059.79** 的交接入口、23 个目标链接、Cedar/Maple 独立资源根路径、手机入口、环境 JSON 下载和数据最小化检查均通过。每版入口包含 40 个案例链接；此项只检查链接生成并实际打开代表页面，完整关键交互另见下面记录。
- 待验收的 Cedar/Maple 报告均被真实发布门禁拒绝，未授予原生通过状态。
- 原始质量基线的 Chromium / Firefox / WebKit 共 1,830 项通过记录保留在 `browser-compatibility-current-2026-10-29/`；本次的 Chrome 155/156 与该原始三引擎结果分别记录，不拼成“所有原生浏览器已通过”。

## 完整版本比较与关键交互

本轮完整 Chrome 156 比较发现，冻结构建的 Maple NavMenu 渲染 3 个示例，而后续源码文档库存要求 4 个，亮暗主题均未通过数量契约；另有 Popup 文档源码按钮、手机暗色 Skeleton / SplitButton 导航发生 5 秒超时。组件/指南 388 项中 383 项通过、5 项失败，另 4 项导航与 1 项能力检查通过；此完整轮为 388/393，通过状态为 false。源码与产物不一致不能通过调小覆盖、忽略断言或沿用旧绿灯处理。原始失败日志保留；识别输入不一致后停止其余完整版本任务，已启动但中止的 Chrome 155 任务不计通过。完整版本矩阵不得宣称通过。

另对交接清单中 Cedar 12 个、Maple 17 个关键组件，使用同一固定产物、两个 Chrome 版本和亮暗主题验证实际交互。此项使用原有业务交互断言与六项能力检查，独立报告结果；不包含文档源码一致性认证，也不替代完整矩阵或手机原生验收。

**最终结果：116 / 116 项通过，0 失败。** Chrome 156.0.8078.73 与 155.0.8059.79 各通过 58 项。原始报告位于 `evidence/native-browser-validation-2026-10-29/critical-runtime/summary.json`。

## 验收目标与设备范围

版本目录包含 Cedar 12 项、Maple 11 项，精确版本线、最低补丁、OS、设备约束和官方来源见 [锁定目录](../configs/native-browser-targets.json)。最低边界为候选值，尚未原生通过。

| 范围 | 本次状态 |
| --- | --- |
| Chrome 155 / 156 桌面供应商二进制 | 已运行交接与关键交互检查；完整矩阵结果另记 |
| Cedar Chrome/Edge 111、Firefox 121、Safari 16.4 最低版本 | 待对应真实历史浏览器验收 |
| Cedar Edge / Firefox / Safari 最新两版 | 待目标浏览器验收 |
| Maple iOS Safari 16.4、27.1、27.2 | 待物理设备；27.1 的特定设备约束必须满足 |
| Maple Android Chrome 111、155、156 | 待物理 Android；桌面手机模拟不代替 Android Chrome |
| Maple Android WebView 111、微信双端、自有 App 双端 | 待实际宿主、系统、内核及逐项操作证据 |

本机未发现连接的物理手机、Android SDK 或设备云配置，iOS 模拟器仅 14.5。桌面 Safari 18.4 不属于锁定的最新两版，不用于冒充这些版本。微信开发者工具也不视为手机微信内核认证。

## 交接方式

交接包位于 `design-ui/artifacts/native-handoff-2026-10-29.zip`。解压后使用 Node 20+，先运行 `node verify.mjs` 核对原始文件，再运行 `node serve.mjs --host 0.0.0.0 --port 4173`。手机访问测试机局域网地址；入口、Cedar、Maple 使用 4173/4174/4175 三个独立端口，保留原构建根路径。包内 README 包含目标选择、环境导出、九项移动检查、证据归档、哈希封装、严格复核和报告晋升流程。

所有原生模板保持 pending。探针不默认勾选物理设备，不自动给出 passed；导出仅保留输入长度、文件类型/大小和视口/事件统计，不导出输入文本、文件名或内容。操作员必须保留原始环境 JSON、真实版本页与操作截图/视频；微信/App 另记实际宿主版本及内核来源。报告同时绑定发布产物和版本目录 SHA-256；证据变动、错误版本、旧补丁、Early Stable、模拟器、缺项或超过 30 天均无法通过严格验收。

## 官方依据

- [Chrome 2026 年 10 月发布记录](https://chromereleases.googleblog.com/2026/10/)：正式稳定线与 Early Stable 分开；桌面 CfT 不构成 Android 验收。
- [Edge Stable 发布记录](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-relnote-stable-channel)、[Firefox 159](https://www.firefox.com/en-US/firefox/159.0/releasenotes/)、[Firefox 158.0.1](https://www.firefox.com/en-US/firefox/158.0.1/releasenotes/)：用于锁定桌面发行线。
- [Safari 27.2](https://webkit.org/blog/18515/webkit-features-for-safari-27-2/)、[Safari 27.1](https://webkit.org/blog/18486/webkit-features-for-safari-27-1/)：平台与设备范围分别核对；不将两个补丁或不同设备范围混为两个通用版本。
- [Android WebView DevTools](https://developer.android.com/develop/ui/views/layout/webapps/debug-webview-devtools-app)：检查实际 WebView 提供者与版本。

原始环境、CI、门禁、桌面探针和运行日志归档于 [本轮证据目录](evidence/native-browser-validation-2026-10-29/)；失败记录与通过记录分开，不授予 `nativeDeviceAcceptance` 或 `latestTwoVersionsAccepted`。
