# 第一百七十二批：补齐 Maple Alert 关闭事务记录

## 范围和示例完善

- 先核对时间、171批、主表、两仓Alert变化及Token构建阻塞hash；主表Alert此前只有Cedar关闭记录，本轮优先补Maple。
- 沿用allow-to-close：旧示例在close内v-if卸载，不能观察该实例退出后的closed。本轮保留实例到自然关闭，分别统计close/closed；增加重新打开按钮，以新key重建该示例实例。按钮仅在当前关闭完成后可用，不改Alert内核/API。
- Maple中英说明和Cedar中文同步两事件区别，Maple英文事件表补已有公开closed事件（不是新增API）。现有移动集合和菜单仍引用原Demo，不新增分类。遵循Vue技能用真实Transition补回归，不用transition stub冒充动画结束。

## 真实浏览器验收

Maple8080中文源码站中间Demo，CUA实际输入/点击，不读取组件内部状态：

1. 初始Close0/Closed0，重新打开按钮原生disabled。
2. 关闭按钮Enter，退出后Alert节点0，Close1/Closed1，重新打开按钮可用。
3. 用Space激活重新打开，Alert节点恰好1，计数保持1/1，重开按钮再次disabled。关闭按钮Space后节点0、2/2。
4. 鼠标重开并鼠标关闭，最终节点0、Close3/Closed3。三种激活各完成一轮，没有重复计数；自定义关闭图标等其他示例仍保留。
5. evidence/maple-alert-close-batch172.png已保存并查看，显示3/3及可用重开入口。临时页已关闭，原开发服务保留。

未发现Alert组件内核缺陷。本轮补的是示例对事件完成的观察能力。未测试Maple右侧/英文浏览器、受控外部卸载、长按竞争、触屏、关闭后焦点恢复矩阵；Cedar本轮仅复跑现有测试，不将历史基本关闭夸大为同一完整矩阵两端通过。

## 验证与进度

- 新增Maple Demo真实Transition回归1条，使用测试计时器等待退出，覆盖Enter/Space/鼠标路径的三轮计数、重开禁用及单实例；自动测试不替代上面的原生浏览器动作。
- Cedar2文件13项、Maple4文件15项，共28项Alert测试通过；Maple受影响Demo/测试ESLint及全量lint:check通过；docs:check 1046个SFC、0失败；两库及审计仓git diff --check通过。
- 仅JS Demo和测试、说明变化，无组件内核/公开类型变动，未重跑完整typecheck；完整文档构建仍受未变Token文件阻塞，未重跑同一失败、不接管并行Token工作。仅源码站证据，不冒充新生产构建验收。
- 菜单component-reuse-sync --check通过：72族同源56（77.8%）、逻辑同源15（20.8%）、独立1（1.4%）不变。Alert新增Maple独立记录，双端部分从70族增至71/72（98.6%），至少一端部分72/72（100%）。
- 还剩Table族缺少Maple独立浏览器记录；此计数不是全部交互/视觉完成率。其他各族仍有明确未覆盖组合，第171批水印暗色视觉限制也仍保留。
- 未创建代理/子任务，未提交/推送/发布，保留脏仓库和其他聊天变更。
