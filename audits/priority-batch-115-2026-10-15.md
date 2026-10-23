# 第一百一十五批：两端 Overlay 背景关闭与滚动锁

先核对第114批、主表与两仓 Overlay 无在途变更。复用 Cedar 4185、Maple 8080 源码开发站；不是新的生产构建验收。

## 浏览器实际交互

- Maple `#/zh-CN/overlay?audit=115-source` 中间“嵌入内容”打开后，正文可见、body computed overflow 从 visible 变 hidden。实际点击正文仍保持打开；根据截图选择内容外背景位置真实点击，正文隐藏、overflow 恢复 visible。再次从入口打开成功，Escape 关闭后也恢复 visible。
- Maple “点击背景层”打开后点击真实背景区域，出现“点击了背景层”Message 反馈。[Maple 遮罩证据](./evidence/maple-overlay-batch115.png)。
- Cedar `/components/overlay/?audit=115-source` 打开后 body overflow=hidden，点击“背景层内容”不关闭。遮罩打开时实际在背景区域向下滚动一屏，window.scrollY 仍为169；点击遮罩后内容隐藏、overflow=visible，再滚动一屏后 scrollY=889，证明页面滚动实际恢复。重新打开、Escape 关闭，overflow 再次恢复 visible。[Cedar 内容隔离证据](./evidence/cedar-overlay-batch115.png)。

读取的是可见DOM、computed样式和滚动位置，不读取Vue内部状态。Maple只验证body锁样式恢复，没有把它算作网站内部滚动容器/触屏滚动穿透验收。正文div不可聚焦，首次尝试其locator.press(Escape)超时；改用当前页面真实Escape输入成功，不将动作定位限制算作组件缺陷。关闭时waitFor(hidden)不等于已证明所有节点立即卸载，未据短暂DOM数量推导卸载时机。两端本批均无捕获到的error级日志。

## 验证与同步

- Cedar Overlay 1文件5项、Maple 1文件8项专项回归通过，共13项。
- 未发现需修复的新缺陷，无源码/API/样式/Demo变更。现有中文及Maple英文文档已描述overlay-closable、esc-to-close及lock-scroll；不重复修改说明，主表新增本批证据。
- 菜单/调研同步检查通过：72族、56已同源、15逻辑已同源、1独立；Overlay仍为已同源，不改为所有交互完成。两仓及审计仓库git diff --check通过。
- 无源码变化，未重跑类型、lint或完整文档构建；第107批生产构建阻塞没有本批新结论。
- 独立部分交互记录44/72（61.1%），双端部分记录40/72（55.6%），尚无独立族级记录28/72（38.9%）。不是全部Demo/配置完成率。
- 仍待：受控拒绝、遮罩按下与释放跨区域、嵌套层级、多个锁所有者、KeepAlive、其他容器和卸载清理、Maple右侧/内部滚动容器及触屏。未提交、推送或发布。
