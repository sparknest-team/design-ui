# 第二百一十七批：Maple 英文 Radio 异步 Demo 真实交互

- 2026-10-16 08:23 UTC核对时间、27批、最新216批及两仓Checkbox/Radio变化，两源码仓diff检查退出0，使用Vue技能。174批仅中文浏览器乱序，本批补当时明确未认证的英文入口，不新增组件族、不重复算中文通过。
- CUA255页127.0.0.1:8080中文Radio首次导航等待超时，稍后DOM出现实际页面及Vite connected才继续。通过可见Language选择器切到en-US/radio，读到英文Demo文字后才执行测试，不仅根据URL判断。无服务重启/缓存清理/组件修改。只能确认本次IPv4浏览器页面可用，不能断言此前慢加载根因已解决。

## 真实操作

1. 英文中间实例开启Manual responses，连续Load options两次，Resolve newest load后Applied2/Ignored0/Pending1，业务值remote。
2. 对Device A原生radio按End，模型a、User changes1；Resolve oldest load后Applied2/Ignored1/Pending0，模型与变更次数不受旧结果污染。
3. Load options第3次，Remove options后Resolve oldest load：radio节点0、模型a、User changes1、Applied2/Ignored2/Pending0，不恢复已移除选项。
4. Load options第4次并Resolve newest load：Applied4/Ignored2/Pending0，Device A原生checked=true，模型仍a、变更仍1，重新加载只反显不产生用户变更。
5. 对Device A按Home后模型remote、User changes2。只读DOM核对Remote checked=true、Device A false、Disabled device原生disabled=true；没有强制给禁用项派发事件，属性证据不冒充真实禁用点击阻断。
6. 保存并查看evidence/maple-radio-english-batch217.png，含英文页面、remote、计数2及4/2/0。右侧iframe未操作，不计通过。
7. 收尾首次仍用中文“语言”标签寻找选择器失败，读取英文aria-label=Language后正确恢复中文；核对zh-CN/radio、模型remote、计数和等待均0，关闭255页，原服务保留。不存在未结清本地等待。

## 验证与边界

- 本批没有发现新内核缺陷，没有源码、Demo、测试、API或中英文说明改动，已有说明准确，不制造重复改动。不是物理触屏、网络接口、英文KeepAlive或持按键/失焦全场景验收。
- 菜单72族和Radio独立复制门禁退出0；Maple async-focus-demo与async-race-demo两文件3项既有回归通过、退出0；三仓diff检查通过。无代码变化，不重复类型/lint/完整构建，不认证新生产产物。中文既有测试结果与本批英文浏览器证据分开计数。
- 同源56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）；双端至少部分记录72/72（100%）不变，不是全场景完成率，无完整场景分母。未创建代理/子任务、未提交/推送/发布，保留并行Token、日期面板、FilterForm等改动。
