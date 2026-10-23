# 第一百四十九批：Radio 异步重载期间的键盘焦点

## 实际故障与修复

- 在 Cedar 4185、Maple 8080 源码开发站使用既有异步选项 Demo。第86批已覆盖普通方向键循环，本批不重复计为新组件覆盖。
- 首次加载后 End 选择设备 A；再次加载的 800ms 等待中按 Home/方向键选择 remote。两端等待中模型为 remote、计数2、焦点为原生 input；加载提示消失后焦点落到 BODY。加载提示使用 v-if 改变 Space 子项位置，使后续分组重新挂载。
- 两端中文及 Maple 英文 Demo 改为稳定的 aria-live 提示节点，仅切换文字。没有修改 Radio/Space 运行时或公开 API，也未建立共享运行时。

## 修复后真实浏览器交互

- 两端重新执行 End → 重载 → 等待中 Home。完成后原生 input 保持焦点、remote 已选、设备 A 未选、禁用项仍禁用，用户变更次数为2。
- 对当前 remote 按 Space、Enter 不增加计数；End 选择设备 A 后计数3。
- Maple 右侧独立实例同样重载/Home 后保留 remote 焦点、计数2，中间仍是设备 A、计数3。鼠标/键盘操作不冒充真实触屏。
- Cedar 文档热更新会重置 Demo，已在最后一次文档修改后重新执行重载/Home，确认焦点与计数2。Maple 初次旧模块未热替换，刷新后确认稳定提示已生效，再重新完整验收；不将旧模块的失败计为修复通过。
- Maple 英文 Demo 已同步源码，本批未另做英文真实浏览器交互。选项移除/重新加载基本反显已有第95批记录，本批前半段也操作核对，但不冒充新增高级网络乱序覆盖。

## 验证与同步

- Cedar Radio 11项、Maple Radio 28项；两端分组契约/选项/导航各44项，共127项通过，新增焦点回归各1项。测试断言原生 input 节点同一性、activeElement、checked 与事件计数。
- Cedar 使用旧 Vitest，不支持 advanceTimersByTimeAsync；测试改用两端均支持的同步推进计时器加 nextTick 后通过，未修改测试环境。
- Cedar 受影响 Demo/测试 lint、Maple 全量 lint:check 通过；Maple docs:check：1040个 Demo SFC、0失败；两仓 diff --check 通过。
- Cedar 中文、Maple 中英文组件说明已补充稳定提示/焦点语义。菜单/调研生成检查通过：72族（完整同源56、逻辑同源15、独立1），Radio菜单状态不变，无需伪造状态变更。
- 本批无类型/API改动，未重跑全库类型和完整文档构建；生产构建阻塞及其他并行修改沿用既有边界，不接管Token工作。
- 部分浏览器证据仍为至少一端72/72（100%）、两端68/72（94.4%）。不是所有Demo/场景完成率；真实触屏、复杂异步/生命周期组合仍待。
- 证据：evidence/cedar-radio-focus-batch149.png、evidence/maple-radio-focus-batch149.png。未提交、推送或发布。
