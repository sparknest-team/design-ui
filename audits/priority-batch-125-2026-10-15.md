# 第一百二十五批：两端 Card 浮起、受控关闭与清理

核对当前时间、124批与主表。两端Card已有其他工作留下的未提交生命周期实现、Demo和中英文档，本批只做浏览器操作和只读回归，不覆盖或接管这些文件。继续使用Cedar4185、Maple8080源码开发站，不是生产构建站。

## 真实浏览器交互

- 两端“全屏展开与关闭”实际点击Expand，关闭按钮可见，floater均为fixed，边界0,0,1280,720，body overflow为hidden。[Cedar展开证据](./evidence/cedar-card-batch125.png)、[Maple展开证据](./evidence/maple-card-batch125.png)。
- Maple点击自定义Close、Cedar在该按钮按Enter关闭。关闭后均恢复static、内联position为空，扩展内容高度0，body内联overflow恢复空字符串。交换输入方式重新展开/关闭仍正常。
- 生命周期Demo实际点击Float等待默认涟漪阶段完成，两端默认Close出现。Maple在默认Close按Enter、Cedar点击默认Close，均解除锁滚动；再次点击Float能重新开启，间接核对子组件关闭事件使父级floating回写为false，而不只是视觉隐藏。不读取Vue内部状态。
- 展开后两端实际点击内部Deactivate：卡片与默认Close移除，body解锁；点击外部Activate恢复后，Close重新可见、floater为fixed且高度720、body重新锁定。
- 两端点击内部Unmount，body解锁。没有将卸载前后没有日志等同于所有旧任务都被取消，快速竞争仍须单独验收。
- 本批两端error级日志为空。默认等待阶段一次状态读取尚无Close，后续出现后才操作，未误判为故障。

## 验证与同步

- 两端现有完整Card回归：Cedar3文件21项，Maple3文件44项，共65项通过。包含各15项调度生命周期测试，测试覆盖不冒充相同浏览器时序验收。
- 无本批组件源码、CSS、API或Demo变更，没有制造额外修复；不重跑类型/lint/构建。前批完整构建Token阻塞记录仍保留。
- 已核对两端现有中英Card文档中floating、floating-duration、floating-content、close-button与生命周期说明，和本批动作不冲突；为避免覆盖并行文档，保持原文，验收证据与进度只追加主表和本批审计。
- 菜单/调研同步检查通过：72族，56已同源、15逻辑已同源、1独立；Card分类不变。两仓及审计仓diff --check通过。
- 独立部分交互记录52/72（72.2%），双端部分48/72（66.7%），尚无独立记录20/72（27.8%）；不是所有Demo/配置场景完成率。
- 未验收：500ms等待内的快速反转与跨阶段竞争、零时长、减少动效、横向布局切换、body已有overflow值的恢复、焦点管理、触屏、Maple右侧iframe和其他变体视觉矩阵。不将这些推定为通过。
- 未提交、推送或发布。
