# 第三十一批：Scheduler 拒绝/跨资源移动与自定义表单控件

北京时间 2026-10-14 11:04 开始，承接第二十八至三十批。无外部服务、凭据、提交或发布；不接管 Token 审计。已通过的基础流程不重复。

## 实际浏览器基线

- Cedar Scheduler 异步示例：编辑标题后 Escape 取消，关闭动画结束后两张参与资源卡片仍为首页设计评审；取消草稿不写入。
- 开启保存失败，修改标题再保存：显示保存失败，草稿仍为失败草稿应保留，已保存卡片仍为原题；点击取消仍保持原值。证据 `/private/tmp/cedar-scheduler-reject-batch31.jpg`。
- drag-feedback 跨资源拖动：方案制作 a→b，时间保持本地 09:00–10:30（模型序列化为 UTC 01:00–02:30Z）；验收检查保持 11:00–12:00/resource b。指针来源和目标均先通过 elementFromPoint 确认，属于真实原生拖动。证据 `/private/tmp/cedar-scheduler-cross-resource-batch31.jpg`。

## 示例改进

- Cedar async-change 增加父组件接受更新开关、模型明细和活动请求数。仅下一次失败并自动复位，支持保留草稿直接重试；卸载/停用/重置清理本地模拟请求。不修改组件 API 或 runtime。
- Maple CustomFormComponent 原为点击 div，且只读取 Form 状态，漏掉 FormItem。改为原生按钮的 checkbox 语义、Space/Enter 操作，使用公共 Form.useFormItem 的 mergedDisabled/mergedReadonly；省略布尔配置保持 undefined，转交 change/focus/blur。中英文 Demo 增加表单禁用、字段只读、校验/重置和模型明细。

## 自动检查

- Cedar 新 async-change Demo 3 项通过；模型事件模拟不计为真实受控交互。
- Maple Form 8 文件/45 项通过，中英文自定义控件在自动测试中验证状态继承、错误和重置。新测试首次使用错误的错误区选择器失败，改为真实校验文案后通过，没有修改组件以迁就测试。
- Maple 完整文档构建通过（1006 Demo SFC、0 失败，1m52s），全量 lint 通过。
- Cedar 完整 Scheduler 首跑 286 通过、7 失败（51 文件/293 项），均为 setInterval 非函数。定位 now-indicator 测试在 fake timer 上再 spy 的全局计时器污染；调整 cleanup 顺序仍失败，移除 spy 后原先 7 项通过，但计时器计数还混入其他调度，剩下 2 项失败。最终把 fake 范围限定为 Date/setInterval/clearInterval，直接验证活动计时器 1/0、暂停/恢复/卸载/SSR，并保留真实函数断言；51 文件/293 项完整通过（54.35s、退出码 0），未修改 Scheduler 时钟运行时。
- Cedar 最终完整文档构建通过（274 页、379.25s），受影响 lint 通过。完整构建与组件测试并行，耗时不代表运行时性能。
- 菜单/调研元数据检查通过（72 族分类一致），修改范围 diff --check 通过；中英组件文档均已更新。

## 修复后实际浏览器

- Maple 中文中间：Space false→true，Enter true→false 显示请先确认；字段只读后 Space 不改值，表单禁用使原生按钮 disabled，解除后切换和 Reset 恢复 false 并清除错误。
- Maple 英文中间 Space 回写 true；右侧仍为 false，证明两实例独立。右侧 Space/Enter 切换与错误、只读阻止更新、表单禁用、Reset 恢复 false 均实际通过，左侧仍为 true。证据 `/private/tmp/maple-form-custom-keyboard-batch31.jpg`。
- Cedar 最终新受控拒绝：关闭父组件接受更新，编辑标题并保存，600ms 后显示父组件未接受提案/活动请求 0，编辑器关闭，但 5 条已保存模型和原卡片不变。
- 开启一次失败后保存，错误提示出现，标题草稿保留，失败开关自动复位，原模型不变；直接重试后编辑器关闭，父组件已接受/活动请求 0，目标标题更新为失败后直接重试，其余模型不变。证据 `/private/tmp/cedar-scheduler-async-retry-batch31.jpg`。
- 最终新示例中再次改标题为应丢弃的草稿并 Escape，已保存模型仍为失败后直接重试，时间和资源不变。

本轮未做整库类型检查/npm 包构建；完整组件测试不代表全部浏览器组合通过。下批优先基础/自定义状态 InfiniteScroll 示例的计时器清理与 Carousel 实际拖拽/自动播放；继续 Scheduler 其他安全可操作组合。保持两库独立，不共享运行时或实例，不引入 platform 配置。

未覆盖：按住指针时 Escape 与中途虚影（当前 CUA 的一次 drag 不暴露按住阶段）、全部异步竞争排列、触屏长按、品牌/亮色及所有组合。截止仍为北京时间 2026-10-15 00:00，继续后续安全小批次。
