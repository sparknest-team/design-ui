# 第九十五批：Radio 加载期间外部设值、清空与事件次数

## 改动

- Cedar 与 Maple 各自维护的 Radio 异步选项 Demo 增加 800ms 本地延迟、加载提示、取消待完成加载的移除操作，以及“设为设备 A”“清空选择”和用户 change 次数。中文 Demo 除组件前缀外一致，Maple 英文 Demo 同步。
- 定时器在再次加载、移除选项、停用和卸载时清理。组件主体和公开 API 无改动。
- Cedar 中文和 Maple 中英文文档说明加载期间使用最新模型反显、外部设值不反向发 change 的语义。保留 Cedar Radio README 先前已有的文字修正。

## 新构建站真实交互

两端分别加载 `?audit=95-built` 的新构建 Radio 文档，执行相同动作并读取原生 input 状态和页面模型/计数：

1. 点击加载，加载提示可见时设为设备 A；完成后模型为 a，只有 A checked，用户变更次数为 0。
2. 点击异步设备，模型变为 remote、次数变为 1；重复点击该项仍为 1。
3. 再次加载，在等待期间清空选择；完成后所有项均未选，次数仍为 1，停用项仍 disabled。
4. 加载中移除选项，超过 800ms 后 radio 数仍为 0、次数仍为 1；重新加载后对 A 按 Enter，模型为 a、只有 A checked，次数为 2。

Maple 右侧移动端 iframe 另行实测：加载期间设为 A，完成后选择异步设备，右侧模型为 remote、次数为 1；中间 Demo 的次数仍为 2，实例状态彼此独立。此操作通过浏览器鼠标和键盘完成，不记作真实触屏验收。

## 验证与边界

- 两端完整 build:doc 通过：Cedar 274 页；Maple 1032 个 Demo SFC 检查无失败，Vite 构建成功（保留大分块提示）。
- 两端 group-contract.spec.js 与 group-options.spec.js 各 31 项通过。Cedar Vitest 报告全部通过且退出码为 0，但进程退出时出现 fsevents 原生清理断言和 close timeout，保留该工具异常记录。
- Maple 全量 pnpm lint:check 通过；Cedar 受影响 Demo ESLint 通过；两仓 git diff --check 通过。菜单/调研生成检查通过：72 族，56 已同源、15 逻辑已同源、1 独立，Radio 状态未变化。
- 停用/卸载的定时器清理仅由代码核对，本批未将其计为浏览器交互通过；真实网络乱序、断线重试、长按失焦和触屏组合仍待覆盖。本批没有发现需要修改 Radio 运行时的故障。未提交、推送或发布。
