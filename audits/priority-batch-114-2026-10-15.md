# 第一百一十四批：两端 Dialog 关闭事务与焦点

检查第113批、主验收表及两仓 Dialog 无在途改动后，复用 Cedar 4185、Maple 8080 源码站。未做新的完整生产构建。

## 浏览器实际交互

- Maple `#/zh-CN/dialog?audit=114-source` 第一组“组件调用”打开基础弹窗，标题兰亭序、正文和取消/确认按钮可见。点击取消后弹窗消失，观察到 cancel/closed 消息，焦点返回“组件调用”；重新打开后点击确认，观察到 confirm/closed 消息并关闭。两次重开证明关闭请求回写模型，不仅是移除外观。
- Cedar `/components/dialog/?audit=114-source` 基础 Open Dialog 同样取消关闭、Cancelled 提示和焦点返回入口；重开确认后显示 Confirmed 并关闭。
- 两端再次打开基础弹窗，Escape 均关闭。随后测试关闭图标首尾焦点循环：Close dialog 上 Shift+Tab 到末尾确认按钮，确认按钮上 Tab 回 Close dialog；最后点击关闭图标关闭。未发现焦点跳到背景。
- Maple“按钮 Loading”和 Cedar Button Loading 分别点击确认，异步任务未结束时弹窗保持可见、确认按钮原生 disabled=true、aria-busy=true；等待实际完成后弹窗隐藏。[Maple 等待证据](./evidence/maple-dialog-batch114.png)、[Cedar 等待证据](./evidence/cedar-dialog-batch114.png)。

全部来自实际点击/键盘及 DOM/ARIA 读回，不读取 Vue 内部状态。取消与确认消息可能短时叠加，是之前动作的消息尚未过期，不当作重复触发。两个站点多组 Demo 入口同名，首次严格匹配失败后限定到已观察到的基础首组，未将定位错误算作组件缺陷。Maple 右侧实例本批未操作。两端本批没有捕获 error 级日志。

## 验证与同步

- Cedar Dialog 1文件19项、Maple 3文件34项专项测试通过，共53项；自动测试不替代未操作的浏览器分支。
- 未发现需修复的新缺陷，无源码/API/样式/Demo改动。现有中文及Maple英文文档已经描述 beforeClose/done 与按钮 loading 协议；保留文档，新增本批审计和主表记录。
- 菜单/调研一致性检查通过：72族、56已同源、15逻辑已同源、1独立。Dialog分类仍为逻辑已同源，不改为所有交互通过。两仓与审计仓库 git diff --check 通过。
- 无源码变化，未重跑类型、lint或完整文档构建，不宣称第107批生产构建阻塞已解除。
- 独立部分交互证据43/72（59.7%），其中双端部分记录39/72（54.2%），尚无独立族级记录29/72（40.3%）。不是所有Demo/配置完成率。
- 仍待：异步拒绝/重复确认竞争、表单校验、多个弹窗堆叠、服务返回Promise与update、拖拽、遮罩与锁滚动清理、触屏、Maple右侧及完整生命周期次数。未提交、推送或发布。
