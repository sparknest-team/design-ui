# 阅读方向 B 批实现与验收

本批覆盖 Cedar 的 Split、ResizeBox、Table，以及两端 VirtualList 的横向滚动保持和 Maple 原生 Table。沿用文档导航统一 LTR/RTL 切换，未增加公开方向属性或扩展 Maple 为桌面数据表格。

## 已实现

| 范围 | 行为 |
| --- | --- |
| Split | 第一个面板位于阅读起点，RTL 横向拖动增量反向；比例/px 单位、min/max 与受控状态保持。分隔条支持左右/上下键、Shift、Home/End 和 ARIA 数值 |
| ResizeBox | left/right/top/bottom 手柄保持物理侧；鼠标、触摸指针与键盘按同一物理增量调整，宽高钳制为非负；移除手柄清理残留内边距 |
| 拖动事务 | 共享私有手势逻辑，绑定来源 ownerDocument.defaultView；处理 pointerup/cancel、失焦、方向/朝向变化、禁用、停用和卸载；恢复之前的 body 光标 |
| Table 物理冻结列 | 保持源列及业务索引，RTL 视图按右冻结/普通/左冻结稳定分区；表头、正文、汇总和 colgroup 一致；冻结偏移、操作列和阴影按物理位置计算 |
| 多级分组表头 | 跨冻结区的分组投影为各区的连续表头段，保持 colspan 与叶子列对齐；深层组的末叶边界递归修正 |
| 表格列宽 | 支持方向感知的鼠标/触摸和键盘调整；auto 布局仍不开放调宽，冻结偏移优先实际量宽；布局/可调宽配置变化取消手势 |
| 横向同步 | 以非负阅读起点距离转换原生 scrollLeft，同步表头、正文、汇总和吸底滚动条；程序化回写有确认标记，避免延迟事件覆盖更新的正文位置 |
| 虚拟行 | 修正 Table 虚拟分支的实际视口引用；表头宽度变化按帧测量并同步虚拟行；两端 VirtualList 纵向定位不重置横向距离，动态方向切换保留横向距离 |
| 跨容器 | Teleport 分页和吸底区域保留来源表格方向，吸底滚动条支持方向键及 Home/End；观察器按帧合并，停用/卸载释放绑定 |
| 业务状态 | 列布局重建不再重置非受控排序/筛选，仅声明默认配置实际变化时重置；方向切换保持选择、分页和尺寸 |
| Maple Table | 仍为原生插槽表格；默认 start 对齐，视口可聚焦并支持明确的左右键/Home/End，方向切换保留阅读起点距离 |

显式 left/right 对齐保持物理语义；默认单元格采用阅读起点。ResizeBox 的物理边与 Split 的逻辑面板不能共用一个方向乘数。

## 验证

| 检查 | 结果 |
| --- | --- |
| Cedar 受影响组件 | 22 个文件、62 项通过 |
| 最后坐标与吸底回写专项 | 3 个文件、9 项通过，含 auto/RTL 操作列偏移 |
| Maple Table 与 VirtualList | 6 个文件、27 项通过 |
| 方向门禁 | Cedar 32、Maple 15、共享导航 4，共 51 项通过 |
| 两端 typecheck | 通过 |
| 两端全量 lint 与 API 命名 | 通过；最后变更另做范围检查 |
| 三引擎生产源码夹具 | Chromium / Firefox / WebKit 布局与交互通过，包含最终业务状态检查 |

Cedar 使用 `CHOKIDAR_USEPOLLING=1`，测试断言通过且退出码为 0。完整日志与退出状态保存在 [验证清单](./evidence/reading-direction-batch-b-2026-10-29/validation.json)。

浏览器入口为 [B 批夹具](../../browser/reading-direction-batch-b/check.mjs)，在 design-ui 运行：

```sh
pnpm check:direction:browser:b
```

`pnpm check:direction:browser` 依次运行 A、B 两批。夹具直接以 production 模式构建实际组件源码和 Less，覆盖 LTR → RTL → LTR、局部 LTR、横纵 Split、物理 ResizeBox、比例/px 与边界、鼠标及触摸指针路径、键盘、方向变化中取消拖动、分组/混合多级冻结表头、正文/表头/汇总同步、列宽同步、虚拟行、LTR 容器中的 RTL Teleport 滚动条、排序与选择状态保持。异步滚动同步等待实际对齐条件，不依赖截图判断交互。

结果与截图见 [三引擎结果](./evidence/reading-direction-batch-b-2026-10-29/results.json)、[RTL 布局证据](./evidence/reading-direction-batch-b-2026-10-29/rtl-layout.png)。浏览器触摸覆盖 pointerType=touch 的事件路径，不等同于移动真机验收。

## 后续边界

本批关闭标准布局与核心交互缺口。跨冻结区的业务自定义合并单元格、所有 auto/主题/尺寸/插槽组合仍需全库矩阵扩展；夹具不替代完整文档站构建、发布包消费、整库 quality 或移动真机。此前 A 批继续保留其验收范围。

下一批为 Scheduler 的日期与屏幕坐标层：事件布局、拖动、拉伸、命中检测、缩放和滚动定位共用转换规则。进度见 [实施计划](../refactors/reading-direction-plan.md)。
