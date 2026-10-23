# 第二百二十五批：Upload三读取模式与Form跨字段混合竞争

## 范围与去重

- 2026-10-16 12:56:22 UTC开始，核对27批总账、最新224批、剩余清单与两仓脏状态。使用Vue技能核对ref模型、异步续体及清理边界；没有修改组件、Demo、公开API、菜单或Token，保留全部并行改动。
- 184批覆盖file/data-url混排，189批覆盖纯Blob队列；本轮新增三模式共存、双开关优先级及回退。203批覆盖跨字段等待中源变化与单提交重置，207/208及219批覆盖独立字段混合命令；本轮新增跨字段依赖规则与旧submit/新validateField交错、双等待重置。
- 使用既有Cedar4185、Maple8080中文源码开发站，不是生产构建复验。Maple右侧iframe未操作；所有文件/代码均为本地合成数据，没有外部服务、凭据或真实保存。
- 自动化配置实读仍PAUSED，未恢复调度；未创建代理或新任务，未提交、推送或发布。

## Upload：三模式共存与回退，两端独立通过

在既有replacement-validation Demo实际操作单选/复选及按钮，不注入文件、状态或事件：

1. 开启data-url，加入sample-1.svg：114B，Data URLs1、Blob URLs0、Decoded images1。
2. 保持data-url开启，再开启Blob开关并加入sample-2.svg：Data1、Blob1、Decoded2；既有第一项不被改写，双开关下新项采用Blob。
3. 关闭两个开关，加入sample-3.svg：三项均114B，仍Data1/Blob1/Decoded2；第三项不生成展示图片。只读DOM确认第一、二张图分别为data:/blob:，complete=true、16×16。
4. 再开启两个开关加入第四项：max-files拒绝，仍sample-1/2/3，Data1/Blob1/Decoded2，未新增解码。
5. 第二项删除按钮按Enter：只剩1/3，Blob0、Data1、Decoded仍2；随后新增sample-5，Data1/Blob1/Decoded3，拒绝清空。
6. 关闭Blob、保留data-url，最后一项删除按钮按Space，再加入sample-6：队列1/3/6，Data2/Blob0/Decoded4。两张真实图片为sample-1和6，均data:、complete=true、16×16；切换不追溯改写旧项。
7. 满队列下按Enter执行替换为文本：accept拒绝，队列/URL/解码计数不变；此步是校验组合证据，不外推所有校验优先级。
8. 重置：队列空、Pending thumbnails0、Data0/Blob0/Decoded0、拒绝无，之后离开页面。

没有发现新缺陷。本轮证明原生FileReader/Blob图片生成与解码、列表清理，不将DOM移除当成原生revoke调用观测；不包含文件选择器、网络、物理触屏或读取中故障。

## Form：跨字段旧提交与新单字段校验，两端独立通过

在既有cross-field Demo实际输入/点击与Enter、Space操作：

1. 输入source/confirmation均alpha225，开启暂停，Enter提交：等待1、提交0。
2. 等待中将两字段改为beta225，点击只校验确认值：等待2、提交0、快照仍“-”。本地规则以本次确认值比较返回时的当前源值，旧alpha相对beta已不匹配。
3. 返回最早跨字段结果：等待1、提交仍0、模型beta/beta，旧原生提交没有通知或污染新结果。
4. 返回第二个结果：等待0、“确认值通过”、提交仍0、快照仍“-”；命令式校验不冒充原生提交。
5. Space提交新事务，等待1；Enter返回结果：等待0、通过、提交1，快照精确为{"source":"beta225","confirmation":"beta225"}。
6. 再次提交并只校验确认值，等待2；点击原生重置：等待0、字段空、快照“-”、结果已重置、历史提交仍1。随后独立再次读取两端状态仍相同，返回结果按钮均disabled，没有迟到提交通知或结果回流。

没有发现新缺陷。上述是有限跨字段交叉，不穷举任意多请求/循环依赖或真实业务请求取消。

## 验证、清理与进度

- 本轮Upload20对严格一致性通过，3项正反向门禁回归通过；日期42对与字段/面板边界通过；Form control contract两端通过；72族分类检查通过。
- 只新增审计与截图，没有运行时/类型/Demo变动，未重复组件测试、typecheck、lint或完整构建，未将旧批结果记为本轮执行。
- 两端Upload已清空，Form两个等待已清理；临时275/276页关闭，保留既有共享开发服务和并行改动。三仓git diff --check通过。
- 同源56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）；双端至少部分交互记录72/72（100%），新增组件族0，不等于全配置完成率。
- Scheduler持按复合操作及同手势跨卸载、Carousel持按中数据/尺寸变化、Maple物理触屏仍待验。其他组合仍未穷举，不能概括成只剩设备受限项；本轮仅补以上明确去重路径，自动化继续停用。

## 证据

- [Cedar读取模式回退与拒绝](./evidence/cedar-upload-modes-batch225.png)
- [Maple读取模式回退与拒绝](./evidence/maple-upload-modes-batch225.png)
- [Cedar跨字段新提交恢复](./evidence/cedar-form-cross-batch225.png)
- [Maple跨字段新提交恢复](./evidence/maple-form-cross-batch225.png)
