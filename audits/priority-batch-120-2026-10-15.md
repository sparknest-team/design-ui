# 第一百二十批：两端 Button 异步、原生表单与组内状态

核对第119批、主表及两仓Button无在途变更。复用源码站Cedar4185、Maple8080，不重复执行第118批已确认阻塞的完整文档构建。

## 浏览器实际交互

- 两端auto-loading的Resolve真实点击后，原生disabled=true、aria-busy=true；页面进入Pending，Promise完成后显示Resolved: loading released且按钮恢复可用。Reject点击后显示Rejected: loading released，同样恢复可用，没有捕获error级日志。
- Maple初次在多次独立读取之间跨过800ms期限，曾读到Pending文本但按钮已恢复；随后重新点击并在一个DOM读操作中核对disabled/busy均true，不能将跨时刻读数当成组件故障。
- 两端Example field填入Changed，Submit按Enter后页面Submissions: 1；点击Reset后原生输入恢复Editable。Reset按Tab后实际焦点到Event target，跳过Skip Tab。
- 两端Group loading开关打开，两个Save按钮均disabled/busy；同组Edit仍可点击并回写Edited。开关关闭后Save恢复可用。[Cedar组内独立loading证据](./evidence/cedar-button-batch120.png)、[Maple反馈证据](./evidence/maple-button-batch120.png)。
- 两端Disabled子按钮isEnabled=false，显式Enabled override为true，核对继承与覆盖结果；未强制点击原生禁用节点。

以上核对真实输入、DOM状态、父级反馈及原生焦点，不读取Vue内部状态。Demo没有输出请求次数，故禁用状态不等于已用浏览器证明重复调用次数为零；不把静态Pending文案的“duplicate clicks are blocked”当作计数证据。Maple右侧未操作，触屏未验收。

## 验证与同步

- Cedar4文件37项、Maple5文件65项Button专项回归通过，共102项。自动测试中的重复点击/异步竞争不冒充浏览器验收。
- 未发现需修复的新缺陷，无源码/API/样式/Demo改动。现有中文及Maple英文文档已有auto-loading、html-type、focusable和按钮组继承说明；保留说明，主验收表补充独立证据。
- 菜单/调研同步检查通过：72族、56已同源、15逻辑已同源、1独立；Button分类不变。两仓及审计仓库git diff --check通过。
- 无源码变化，未重跑类型/lint或完整文档构建；第118批Token文档构建错误及其他组件复制漂移未被本批解除，不接管并行工作。
- 独立部分交互记录48/72（66.7%），双端部分44/72（61.1%），尚无独立族级记录24/72（33.3%）；不是所有Demo/配置完成率。
- 仍待浏览器覆盖：重复调用精确计数、多个监听器Promise竞争、卸载中任务、锚点模式导航阻断、触屏、更多焦点/图标组合及Maple右侧。未提交、推送或发布。
