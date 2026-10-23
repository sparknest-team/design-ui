# 第一百七十五批：Checkbox 本地Promise乱序与选择上限

## 范围与实现

- 核对当前时间、174批、27批主表及两仓Checkbox变化后，在既有async-options补手动返回模式，默认800ms模拟保留。两库独立实现，Maple英文示例同步，不改变组件内核/公开API。
- 手动模式创建本地Promise；返回最早/最新按钮真实resolve任务。版本保护仅让最新加载更新options和结束loading，旧任务计Ignored；Applied为应用序号，Pending为尚未手动返回数，不等于loading。
- 移除使在途版本失效并保留模型；停用/卸载结清等待和取消计时。Vue技能用于shallowRef等待队列、生命周期清理和带真实焦点的键盘回归。版本保护属于示例业务加载器，不宣称Checkbox自动解决网络竞争，不调用外部服务/凭据。
- 沿用现有Demo和菜单入口，同步Cedar及Maple中英文说明；保留并行脏改动，不接管Token等任务。

## 两端真实浏览器验收

Cedar4185、Maple8080中文源码站，CUA操作可见控件，DOM只读，各自完成：

1. 开启手动返回，加载1/2后先返回最新：Applied2/Pending1、remote选中。实际Space选A，模型remote+a，用户变更1，B达到max=2而禁用。
2. 返回旧任务：Applied2/Ignored1/Pending0，B仍禁用、选择和用户次数不变。
3. 实际Enter取消A，B可选；Space选B，模型remote+b、用户变更3。
4. 加载3后移除，再返回旧任务：选项消失、模型remote+b保留，Applied2/Ignored2/Pending0，迟到结果不恢复列表。
5. 加载4并返回最新：B按模型反显，A因上限禁用，次数仍3。
6. 加载5/6后先返回旧任务：Applied4/Ignored3/Pending1，提示仍加载中，旧结果不结束新加载。再返回最新：Applied6/Ignored3/Pending0，remote+b及上限保持、次数3。
7. 截图evidence/cedar-checkbox-race-batch175.png及maple-checkbox-race-batch175.png已保存并查看；临时页已关闭，原有开发服务保留。

未发现新组件内核缺陷。返回按钮自然获取焦点，不将其点击后的焦点称为分组选项持续保留焦点。没有本批英文/Maple右侧浏览器、物理触屏、真实网络失败重连、按住键后失焦或路由离开实测；生命周期清理来自自动测试。

## 回归、门禁与进度

- 各新增2项Demo回归：新旧两种完成顺序、选择/用户事件/max名额、移除后迟到及新加载恢复；KeepAlive停用结清两个Promise，激活后新请求可应用。既有默认定时重载焦点测试保留通过。
- Cedar11文件93项、Maple13文件117项，共210项Checkbox路径测试通过。初次新增测试缺少真实焦点，Space未选中；补attachTo及focus后通过，未修改内核来迎合测试。
- 受影响Demo/测试ESLint及Maple全量lint:check通过；Maple docs:check1046个SFC、0失败。菜单一致性和三仓git diff --check通过。
- JS Demo/测试和说明变化，无公开类型/内核改动，未重跑完整类型检查。Token文档阻塞hash仍为Cedar4102526468bfddb774382ad75ec9a55d5766bf62、Mapleaaf1ea4f67aaa413c3271ef442a8ac373af5ed27，未重跑相同已知失败或接管Token；本批仅源码站证据。
- 72族分类不变：同源56（77.8%）、逻辑同源15（20.8%）、独立1（1.4%）；双端至少部分交互证据72/72（100%）。本批增加Checkbox组合，不增加族数量；没有完整场景分母，不能给出全库完成/剩余百分比。
- 后续仍有Upload其他准备/读取与迟到组合、Scheduler高级拖拽/拉伸拒绝、Form跨字段/提交、日期时间边界、物理触屏、Carousel动态变化、水印暗色视觉及完整生产构建复验。未创建代理/子任务、未提交/推送/发布。
