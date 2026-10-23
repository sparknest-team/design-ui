# 第一百二十二批：两端 Badge 动态计数与显隐

核对第121批、主表及两仓Badge无在途变更，复用Cedar4185、Maple8080源码站。不重复执行已有Token阻塞的完整构建。

## 浏览器实际交互

- 两端动态显示示例初始1Messages，点击Add后2Messages；两次Subtract降到0时只剩Messages描述，计数节点不再显示。同一示例show-zero true仍显示0，show-zero false只有描述。
- 两端Add按Enter后恢复1；点击Show badge开关关闭时只剩Messages描述，重新开启后显示1Messages，计数没有因隐藏被重置。[Cedar恢复证据](./evidence/cedar-badge-batch122.png)、[Maple恢复证据](./evidence/maple-badge-batch122.png)。
- Maple右侧iframe另行实际点击Add，右侧为2Messages，中间仍1Messages，说明本次两个实例的计数没有共享。
- 两端本批未捕获error级日志。首次Messages文字定位匹配到多个其他示例，读取Add按钮祖先后限定动态Demo卡片，未将定位失败当作组件错误。

核对真实按钮/键盘与开关动作后的可见DOM、描述和计数，不读取Vue内部状态；Badge本身不是主值表单，Add/Subtract验证的是父级响应式content传入。静态max、变体、颜色等不据挂载计为动态交互验收。本批没有记录dot各阶段的节点变化，不将其列为已通过。

## 验证与同步

- Cedar2文件12项、Maple2文件27项Badge专项测试通过，共39项。自动测试对max等的覆盖不冒充浏览器实测。
- 未发现需修复的新缺陷，无源码/API/样式/Demo改动。两端中英文档已有show、show-zero、content与独立实例说明；保留说明，主表新增本批独立证据。
- 菜单/调研同步检查通过：72族，56已同源、15逻辑已同源、1独立；Badge分类不变。两仓及审计仓库git diff --check通过。
- 无源码变化，未重跑类型/lint或完整构建。第118批Token文档完整构建失败与非本批复制漂移仍保留，不接管并行工作。
- 独立部分交互记录50/72（69.4%），双端部分46/72（63.9%），尚无独立族级记录22/72（30.6%）；不是全部Demo/配置完成率。
- 仍待：动态max阈值、dot、inline与插槽变化、RTL/offset、不同主题静态视觉矩阵和更多触屏组合。未提交、推送或发布。
