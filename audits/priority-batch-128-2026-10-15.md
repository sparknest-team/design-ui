# 第一百二十八批：Skeleton 加载、动画开关与全屏清理

核对时间、127批及主表，两端Skeleton没有在途重叠改动。使用Vue最佳实践技能检查响应式加载内容切换；沿用Cedar4185、Maple8080源码站，不是生产构建产物验收。

## 实际交互

- 两端基础示例实际点击首个Switch关闭loading，可见“加载的数据”，该Skeleton aria-busy=false且骨架行0。随后在Switch按Space开启，aria-busy=true、默认文字消失、骨架行恢复3。不是只读取初始挂载。
- 两端动画示例点击第二个Switch关闭，骨架仍3行、根animation修饰类移除、shimmer计算animation-name为none；按Space重新开启后分别恢复mp-skeleton-animation / c-skeleton-animation。
- 两端点击“切换全屏模式”，占位层fixed、top/left均0、高720，Maple宽1265、Cedar1269（站点内容视口保留各自滚动条区域），aria-busy=true。保存[Cedar截图](./evidence/cedar-skeleton-batch128.png)、[Maple截图](./evidence/maple-skeleton-batch128.png)。
- 约两秒后全屏节点数量均0。再次在该按钮按Enter，立即读取两端全屏节点均1，等待对应节点detached后均0，确认可重复操作并自动清理；没有人工修改组件状态或触发DOM事件。
- 两端error级日志为空。本批不判断动画逐帧观感/帧率，也不将animation-name视作系统减少动效适配通过。

## 验证与同步

- 两端完整Skeleton回归：Cedar2文件7项、Maple2文件18项，共25项通过，含原有同源检查。
- 未发现需修复的新缺陷，无组件运行时、样式、API或Demo改动。两端中文/Maple英文文档补充：两秒结束由Demo计时器管理，组件不请求数据也不会自行结束loading，实际业务由请求结果控制。
- 只改描述性Markdown，不重跑类型/lint/完整构建；源码站结果不覆盖前批Token完整文档构建阻塞。菜单/调研一致性检查通过，72族：56已同源、15逻辑已同源、1独立，Skeleton分类不变。
- 两仓及审计仓diff --check通过。未提交、推送或发布。
- 部分交互记录55/72（76.4%），双端部分51/72（70.8%），尚无独立记录17/72（23.6%）；不是全部Demo/配置完成率。
- 尚待：真实异步请求竞争/失败、加载期间卸载和旧Demo计时器、template动态内容、rows/title/card/avatar变化、不同fullscreenZIndex层叠、Maple右侧独立操作、触屏与减少动效。未据挂载/单测计为浏览器通过。
