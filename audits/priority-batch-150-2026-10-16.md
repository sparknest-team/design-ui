# 第一百五十批：Checkbox 异步重载、焦点与选择上限

## 故障与改动

- 对照第93/94批，不重复登记基本加载/取消。本批检查已有选项重载等待中键盘操作，以及加载完成后的焦点和 max 限制。
- 两端源码开发站（Cedar4185、Maple8080）均复现：先加载remote，再次加载等待中对设备A按Space，模型变为remote+a、B被禁用，提示消失后activeElement变为BODY。
- 与149批Radio相同，Demo条件提示改变Space子项位置，导致后续分组重挂载。两端中文与Maple英文Demo保持稳定aria-live节点，仅替换提示文本。没有修改Checkbox/Space组件运行时、API或并行Space改动。

## 修复后真实交互

- 两端更新后的Demo重载期间用Space选择/取消设备A。等待文字可见时读到最新模型；完成后设备A仍是activeElement、原生checked和最新模型一致。Cedar另一次等待中取消A，完成后A仍聚焦且未选；Maple等待中选中A，完成后A仍聚焦且选中、B禁用。
- 两端随后均达到remote+a上限，用Enter取消A，B由disabled变为可用；再用Space选择B，模型变为remote+b、A不可再选、停用项仍disabled。
- Maple右侧独立实例实测重载中Space选择A，完成后A保持焦点/checked、Bdisabled；中间仍为remote+b，右侧为remote+a，实例互不影响。实际鼠标键盘不等同真实触屏。
- 未对禁用项强制派发事件。Maple英文Demo源码同步，但本批未单独验收英文浏览器或KeepAlive清理；本地800ms模拟不等同真实网络乱序。

## 验证、文档与进度

- Cedar Checkbox目录91项、Maple115项，共206项回归通过，新增Demo焦点回归各1项，断言input节点同一性、activeElement、checked和上限释放。
- Cedar测试报告通过且退出码0；进程清理仍打印close timeout/fsevents断言，作为现有工具异常记录，不宣称无警告。
- Cedar受影响Demo/测试ESLint、Maple全量lint:check通过；Maple docs:check为1040 Demo SFC、0失败；两仓diff --check通过。
- Cedar中文及Maple中英文组件文档补充加载中键盘与稳定提示语义。菜单/调研生成检查通过：完整同源56、逻辑同源15、独立1，共72族，Checkbox原有菜单状态无需改变。
- 无类型/API改动，未跑全库类型。两端Token文档SHA1仍与147批一致（Cedar4102526468bfddb774382ad75ec9a55d5766bf62、Mapleaaf1ea4f67aaa413c3271ef442a8ac373af5ed27），不重复完整构建、不接管并行Token改动。本批证据来自源码开发站，非新生产构建。
- 至少一端部分浏览器证据72/72（100%）、双端68/72（94.4%），未新增组件族，不代表全Demo/全场景完成率。复杂异步、生命周期与真实触屏仍待覆盖。
- 证据：evidence/cedar-checkbox-focus-batch150.png、evidence/maple-checkbox-focus-batch150.png。未提交、推送、发布。
