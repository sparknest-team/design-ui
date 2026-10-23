# 第一百五十六批：Maple 英文移动预览与全局语言往返

## 检查动机与真实结果

155批英文路由截图里右侧曾出现原生控件外观，该截图只记录了英文中间Demo交互，没有将右侧英文验收为通过。本批单独复核，不擅自归因于缺CSS或重复加载。

- Maple8080源码开发站英文Upload稳定加载后，分别读取中间和右侧Add local file按钮的实际计算样式：两处均14px字体、36px高、0px none边框、白色背景，右侧含33个style节点。没有复现持续样式缺失；这些只证明稳定状态，不证明瞬时现象的确切成因或所有组件样式都正常。
- 在右侧英文late-request Demo实际Add/Start/Cancel/Start，待句柄2、请求2；Enter返回所有句柄、Space返回所有成功回调后，待0、Requests2、Aborts1、Accepted successes1，模型success。中间保持空队列、全部计数0，实例隔离。
- 通过主站顶部原生Language选择框切换中文，主URL变为zh-CN/upload；等待移动预览路由完成后，两处均中文Demo、初始空模型，右侧语言值zh-CN，按钮仍36px/14px/无原生边框。这是路由重建，不将空模型称为切换语言保留业务状态。
- 再通过顶部语言选择框切回英文，URL为en-US/upload；右侧稳定后样式仍正确。右侧Add/Start/Return handles/Return success新事务正常结束为Requests1、Aborts0、Accepted successes1、模型success，中间仍初始状态。
- 第一次切中文后立即读取右侧语言框曾因iframe仍在导航而超时；随后观察页面完成，再读取文案、控件与样式，未将中间状态计为失败或通过。没有注入事件、改DOM或模拟Vue状态。

## 验证与同步

- Maple CLI站点route-state、mobile route-sync、AppMobile三个文件3项自动回归通过，和上述浏览器证据分别记录。
- 本批没有发现需修复的持续故障，不修改组件、Demo、CSS、站点运行时或API，不强行新增加载遮罩。既有中英文说明与菜单内容正确，仅补验收审计和主索引。
- 菜单/调研生成检查通过：72族（完整同源56、逻辑同源15、独立1）。本批为Maple专属移动预览，不虚构Cedar移动iframe验收。
- 两端Token阻塞文档SHA1仍为Cedar4102526468bfddb774382ad75ec9a55d5766bf62、Mapleaaf1ea4f67aaa413c3271ef442a8ac373af5ed27，没有实质变化，不重复完整构建。本批无源码变更，未重跑全库lint/typecheck。
- 部分证据仍至少一端72/72（100%）、双端68/72（94.4%），非全Demo/全场景完成率。真实触屏、默认XHR异步元数据等仍待。
- 证据：evidence/maple-upload-english-right-batch156.png、evidence/maple-upload-language-roundtrip-batch156.png。未提交、推送、发布。
