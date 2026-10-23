# 第一百三十批：Empty Demo 动作反馈、显隐与图片路径

核对时间、129批和主表，两端Empty没有重叠在途改动。使用Vue最佳实践技能补Demo回归，沿用Cedar4185、Maple8080源码开发站，不是生产构建验收。

## 修复

- Cedar额外操作只有console.log，Maple按钮没有处理逻辑，页面无法观察点击结果。两端Demo统一为独立ref计数，Reload更新可见次数与描述；明确是本地演示，不请求服务，不给Empty添加加载/请求API。
- 两端显隐Demo从静态示例改为同逻辑的两个按钮，分别控制showIcon/showDescription，并可恢复。
- Cedar show、size、user-define三处Space旧direction=vertical及无效fill移除，统一column。Maple原先已是column，不机械改其他组件的合法vertical。
- 浏览器实际发现Cedar自定义图片src=cat.jpg、complete=true但naturalWidth=0；两端示例统一为/cat.jpg。Cedar和Maple最终实际加载naturalWidth均1440。
- 不改Empty组件运行时、API、CSS/Token。未提交、推送或发布。

## 真实浏览器动作

- 两端点击Reload，可见本地刷新次数1、描述“No data. Local refresh completed.”；在按钮按Enter后次数2，核对父级响应式数据已反馈到Empty描述和extra插槽。
- 两端点击Toggle icon后图标节点0、描述节点1；在Toggle description按Enter后，动态Empty子元素0、文字空。随后按Enter恢复图标、点击恢复描述，最终子元素2、描述恢复Dynamic empty state。
- 图片修复后Cedar直接更新/cat.jpg并成功加载；Maple中间预览一度保留旧cat.jpg，明确重载后才显示/cat.jpg，记录为开发站热更新现象，不声称无需重载自动同步已通过。重载后再次点击Reload得到次数1。
- [Cedar证据](./evidence/cedar-empty-batch130.png)、[Maple证据](./evidence/maple-empty-batch130.png)为恢复后本地刷新反馈。Maple冷重载截图最初右侧仍白屏加载，等待iframe中Reload实际可见后重新取证；没有把加载中白屏计作已验收或永久故障。
- 本批主要动作阶段两端error级日志为空；没有读取Vue内部状态、注入DOM事件或使用外部接口。

## 验证与同步

- 每端新增2项Demo回归，检查图标/描述独立控制和刷新可见反馈；Cedar3文件12项、Maple3文件11项，共23项通过。
- Cedar受影响Demo/测试lint通过；Maple受影响文件格式化、全量lint及图片路径最后修改的定向lint通过。Maple docs:check检查1037个Demo SFC、0失败（在最终纯路径字符串调整前执行）。
- 未涉及组件类型/API，不重跑类型或完整文档构建，前批Token文档构建阻塞记录不被本批源码站覆盖。
- 两端中文与Maple英文文档同步本地刷新边界、显隐及extra插槽语义。菜单/调研一致性检查通过：72族、56已同源、15逻辑已同源、1独立，Empty分类不变。两仓和审计仓diff --check通过。
- 独立部分交互记录57/72（79.2%），双端部分53/72（73.6%），尚无独立记录15/72（20.8%）；不是全部Demo/配置完成率。
- 仍待：ConfigProvider empty覆盖、语言动态切换、图片失败/切换、整组件click冒泡组合、异步请求/恢复、触屏和更多视觉矩阵。Maple预览热更新的旧路径现象需后续单独诊断。
