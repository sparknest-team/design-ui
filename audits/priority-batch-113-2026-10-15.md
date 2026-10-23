# 第一百一十三批：两端 Message 关闭、计时和实例更新

核对第112批、主验收表及两仓 Message 变更后，复用 Cedar 4185、Maple 8080 源码开发站。两端 Message 文档已有并行计时/Token审计补充，本批不覆盖其变更，不宣称新的完整生产构建通过。

## 浏览器实际交互

- Maple `#/zh-CN/message?audit=113-source` 函数式“可关闭”打开常驻消息，`role=alert` 显示正文，原生 Close message 按钮按 Enter 后消息卸载。
- Maple 声明式“可关闭”打开后点击关闭按钮，再点击同一个入口可重新打开，验证关闭请求回写父级模型，而不是仅隐藏 DOM；再次关闭无残留。
- Cedar `/components/message/?audit=113-source` 声明式 Open Message 展示 Declarative message；Close message 按 Enter 关闭，入口再次打开成功，随后 action 插槽的 Close 按钮也可关闭。
- 两端分别点击一秒显示时长入口，先观察到消息，再等待其实际变为不可见/卸载。此处只证明自动消失，不宣称精确测量一秒、hover暂停或动画耗时。
- Maple “更新内容”实际经历“更新中...”→“更新完成”，更新后只有一个 alert，随后自动关闭。[Maple 更新证据](./evidence/maple-message-batch113.png)。
- Cedar Update Info Message 连续两次点击，正文由 This is an info message 0 变为 1，仍只有一个 alert；之后正常消失。[Cedar 同ID更新证据](./evidence/cedar-message-batch113.png)。
- 两端“多实例”分别显示 Message 1、2、3；第一条的 close 定时动作执行后只剩 Message 2、3，没有一起提前关闭。消息最终清理由默认期限执行，本批不统计完整生命周期回调次数。

所有结果来自真实按钮/键盘动作后的可见 DOM，不读取 Vue 内部状态。Maple 本批只操作中间示例，右侧实例不计入覆盖。两端本批未捕获 error 级日志。

## 验证与文档/菜单同步

- Cedar Message 7文件31项、Maple 8文件39项专项回归通过，共70项；包含计时边界、服务完成和所有权等自动测试，不冒充对应浏览器验收。
- 未发现需要修复的新缺陷，无源码、API、样式或Demo改动。现有中文及Maple英文文档已说明duration=0、同ID更新、resetOnUpdate和关闭协议；保留并行文档补充，主验收表新增本批证据。
- 菜单/调研一致性检查通过：72族、56已同源、15逻辑已同源、1独立；Message仍为逻辑已同源，不改成完整同源或全部交互通过。两仓及审计仓库git diff --check通过。
- 无源码变化，未重跑类型、lint或完整文档构建；不宣称第107批构建阻塞已解除。
- 独立部分交互证据42/72（58.3%），其中双端部分记录38/72（52.8%），尚无独立族级记录30/72（41.7%）。这不是全部Demo/配置完成率。
- 仍待浏览器覆盖：hover暂停/剩余期限、KeepAlive、跨容器/位置隔离、立即close/clear、同ID复杂异步竞争、关闭回调次数、触屏与Maple右侧实例。未提交、推送或发布。
