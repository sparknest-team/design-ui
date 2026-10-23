# 第四十八批：日期字段拒绝关闭后的新选择事务

北京时间 2026-10-14 15:00–15:46 验收 Cedar / Maple Date 与 DateRange。沿用第二十七批未覆盖清单和第四十七批进度；仅改两库各自源码、测试、Demo/中英文文档与右侧菜单，不共享组件实例或运行时，不提交、推送或发布。

## 实际问题与修复

- 两端日期选择内核在确认后收到父级回写的相同模型，会把 `settled` 误重置。若 `open=false` 请求被父级拒绝，重复确认可再次触发关闭请求。现在相同模型回写保持已确认事务，真正的新选择仍开启新事务；不同的外部模型会重置草稿。
- Maple 日历范围以新数组引用透传相同受控值；第一次点起点后的重新渲染会将临时范围重置，下一次点击又成新起点。展示层改用日期数组内容观察模型，等值新数组不再重置第一次点击；保留移动端独立展示代码。
- 两库新增 Date / DateRange 可观察 Demo（模型、提交数、拒绝关闭数），Maple 另有中英文源文件与右侧 `example/index.vue` 分组。两端文档写清确认事务及范围两次点击协议。

## 真实浏览器验收（不是仅挂载）

- Cedar Date：选择 2026-09-23 → 确认后 `提交=1/拒绝关闭=1/open=true`；重复确认计数不变；再选 09-24 → `提交=2/拒绝关闭=2/open=true`。
- Cedar DateRange：选择 09-25～09-26 → `1/1/open=true`；重复确认不变；再选 09-27～09-28 → `2/2/open=true`。
- Maple 中间 Date：选择 09-23 → `1/1/open=true`；重复确认不变；再选 09-24 → `2/2/open=true`。
- Maple 中间 DateRange：第一次点击 09-10 后草稿保持 `09-10～09-10`，第二次点击 09-12 后成为 `09-10～09-12`，提交后 `1/1/open=true`；重复确认不变；再选 09-14～09-16 后 `2/2/open=true`。
- Maple 右侧移动 DateRange：同样完成 09-10～09-12 → 重复确认去重 → 09-14～09-16；右侧 `2/2`，中间仍为初始 `0/0`，实例隔离成立。
- 过程截图：`/private/tmp/cedar-date-range-transaction-batch48.png`、`/private/tmp/maple-date-transaction-batch48.png`、`/private/tmp/maple-date-range-transaction-batch48.png`、`/private/tmp/maple-right-date-range-transaction-batch48.png`。模型/计数以逐步 DOM 输出为准，截图只是静态视觉证据。

## 自动检查与文档菜单

- Cedar 日期所有者与契约 32 项通过；Maple 同 32 项 + 范围日历外观/受控两次点击 3 项通过。新增回归覆盖父级拒绝关闭、相同模型回写、重复确认、新选择及等值受控数组重渲染。
- 两端受影响 ESLint 通过；两端类型检查通过。Cedar VuePress 274 页完整构建通过，Maple Vite 文档构建通过（1017 个 Demo SFC 检查无错误）。Maple 日期家族复制门禁 42 对通过；跨端菜单/调研门禁 72 族通过。
- Cedar Date / DateRange 中文文档和自动侧栏、Maple Date / DateRange 中英文文档及右侧分组同步。没有改变其他组件的状态标记。

未扩大到真实触屏手势、所有展示模式或复杂 Form 联动；仍按第二十七批未覆盖清单后续验收，不标记整库完成。
