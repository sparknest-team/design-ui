# 第一百六十二批：TimeRangePicker 草稿中切只读与立即提交

## 范围

- 核对161批、主表及40/71批，避免重复默认排序、已提交后只读等基础场景；本批补未提交草稿中途切换多个选项的组合。
- 使用Cedar4185独立time-range-picker页和Maple8080 time-range聚合页的既有panel-behavior示例。保留Maple在途TimePanelContent.vue变化，没有运行时/API/Token/Demo修改。

## 两端真实操作

1. 初始模型09:30/18:00，确认0。Cedar开始小时列表点击10；Maple开始小时滚轮按ArrowDown，草稿10:30，模型仍09:30/18:00、确认0。
2. 勾选只读：Cedar候选仍10/30/18/00、确定禁用；Maple候选10/30、确认禁用、滚轮aria-disabled=true，草稿没有清除，模型未提交。
3. 只读期间勾选隐藏00–07小时及立即提交。00小时DOM候选数0，两端仍确认0、旧模型09:30/18:00；开关没有隐式确认旧草稿。
4. 解除只读，两端仍旧模型/确认0。Cedar点击11小时、Maple滚轮按ArrowDown到11，立即回写11:30/18:00，确认只增至1，没有额外点击确认。
5. Maple只读期间尝试向滚轮发ArrowDown，工具拒绝在该禁用目标发送，读取状态仍10/30。该次失败动作不记为只读键盘阻断的真实输入验收；其阻断行为由下面自动测试覆盖，实际浏览器只认证只读语义、禁用确认和保留草稿。
6. 保存证据evidence/cedar-time-range-draft-batch162.png、evidence/maple-time-range-draft-batch162.png，页面包含确认1和已提交11:30/18:00；未单独操作Maple右侧或英文页，不将中间结果外推。临时页面已关闭，原开发服务保留。

全部浏览器动作使用CUA可见控件，DOM仅用于只读选中状态、文本和候选计数；无事件注入或Vue状态访问。真实触屏/惯性中禁用、时钟展示切换、其他步长/十二小时组合不在本批范围。

## 验证和同步

- 两端time-panel.test.ts各新增2项：未确认范围草稿中打开readonly或disabled，切disableConfirm不派发change/confirm、被阻止的新选择不改草稿，解除后仍不提交，下一合法选择恰好change/confirm各一次。独立复制相同测试逻辑，无共享测试运行时。
- Cedar控制器9项+面板确认4项=13项；Maple控制器9项+面板确认13项=22项，共35项通过。不是全库测试。
- Cedar受影响测试ESLint、Maple全量lint:check通过（exit0）；两仓及审计仓diff --check通过。无公开类型或生产代码变更，不重跑全库typecheck/完整文档构建；开发站不代替生产产物验收，Token构建阻塞保留。
- Cedar面板PICKER.md、Maple中英文TimeRange文档同步开关不自动提交旧草稿的说明。既有Demo引用无变化，无新菜单项；component-reuse-sync --check通过。
- 分类仍72族：同源56（77.8%）、逻辑同源15（20.8%）、独立1（1.4%）；至少一端部分72/72（100%）、双端部分68/72（94.4%），非全部场景完成率。
- 未提交、推送、发布。
