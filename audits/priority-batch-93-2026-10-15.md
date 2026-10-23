# 第九十三批：两端 Checkbox 异步选项与 max 联动

## 改动

- Cedar 与 Maple 各自的 Checkbox 异步选项 Demo 增加可选“设备 B”；Maple 英文 Demo 同步增加 Device B。组件运行时代码未改动，也未引入跨库共享实例。
- Cedar 中文、Maple 中英文文档明确：已选 remote 占一个名额，选择 A 后达到 `max=2`，B 不可选；取消已选项释放名额。两端菜单已有 Checkbox 入口，状态未改变，故无需改菜单。

## 新构建站真实交互

- Cedar `?audit=93-built` 与 Maple `?audit=93-built` 均由本地新构建文档站加载，操作“异步选项”Demo。初始模型 `['remote']`，加载后 remote 原生 checked，A/B 可选，停用设备原生 disabled。
- 点击 A 后模型为 `['remote','a']`，B 变为原生 disabled。对 A 按空格取消后模型回到 `['remote']`，B 恢复可用；对 B 按 Enter 后模型为 `['remote','b']`，A 变为原生 disabled。
- 在满额状态移除选项，所有输入卸载但模型仍为 `['remote','b']`；再次加载后 remote/B 正确反显，A 仍因达到上限而禁用。两端观察结果一致。

## 验证边界

- Maple 完整 `build:doc` 通过：1032 个 Demo SFC 检查无失败，Vite 构建成功（保留大分块提示）。Cedar 完整 `build:doc` 通过：274 页。两端 `group-contract.spec.js` + `group-options.spec.js` 各 31 项通过；受影响 Demo ESLint 和两仓 `git diff --check` 通过。
- 本 Demo 的 `Promise.resolve` 只覆盖选项异步到达后的状态转换，不提供可挂起的请求，因此本批不把“加载与移除的真正请求竞态”记作已验收；长按/失焦与真实触屏也未验收。未提交、推送或发布。
