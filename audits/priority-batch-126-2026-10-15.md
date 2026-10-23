# 第一百二十六批：Space 动态方向、间距、换行和子项

核对当前时间、125批、主表和两仓Space状态，没有在途Space改动。使用Vue最佳实践技能补真实Demo回归。Cedar原有尺寸/对齐控件，Maple原有静态示例不足以验收动态切换，本批新增两端独立同源interactive-layout.vue；不改组件运行时、API或Token。

## 实际浏览器交互

- 源码站Cedar4185、Maple8080，读取初始row、rowGap8px、columnGap8px、nowrap，三个72px子项同一行，横向步长80px。
- 两端实际点击Toggle gap到24，再点击Toggle wrap：计算样式columnGap24px、rowGap8px、wrap，第一行两个子项，第三项换下一行。横向步长96px；Maple行高37px、纵向步长45px，Cedar行高34.09375px、步长42.09375px，实际行间距均8px。
- 两端在Toggle direction按Enter，输出更新column，子项纵向排列、交叉轴包装容器拉伸，rowGap仍8px、columnGap仍24px。没有把几何轴gap解释为随方向互换。
- 两端点击Add item，输出items4、真实子项容器4；Remove回3，再两次Remove到1，真实子项1且Remove原生disabled。两次Add恢复3。没有向Vue内部注入状态。
- Maple右侧iframe实际切换gap到24再回8，中间仍column/24px/三项，右侧row/8px/三项，两个Demo实例独立。
- [Cedar证据](./evidence/cedar-space-batch126.png)、[Maple证据](./evidence/maple-space-batch126.png)；两端error级日志为空。不是新生产构建验收。

## 实现与验证

- 两端Demo同逻辑、仅组件前缀不同；窄预览外层overflow:auto约束未换行时的溢出，不增加组件本体样式。控制按钮与状态输出在同一卡片，右侧集合引用同一文件。
- Cedar中文、Maple中英文文档新增动态案例与轴向说明，Maple右侧集合同步接入。不引入locale适配函数或共享运行时。
- 每端新增1项真实Demo控件回归；全Space Cedar4文件15项、Maple4文件22项通过，共37项，包含原有同源与token消费者测试。
- Cedar受影响Demo/测试lint通过；Maple受影响文件formatter后全量lint通过。未涉及类型/API，不重跑类型检查；完整文档构建未重跑，前批Token阻塞不被本轮源码站覆盖。Maple docs:check通过（exit 0），仅是示例语法检查。
- 菜单/调研一致性检查通过：72族，56已同源、15逻辑已同源、1独立。Space分类不变；两仓和审计仓diff --check通过。
- 部分交互记录53/72（73.6%），双端部分49/72（68.1%），尚无独立记录19/72（26.4%）；不是全库场景完成率。
- 仍待：动态split/Fragment过滤、RTL、CSS长度/元组更多组合、所有size、交叉轴align/主轴justify矩阵、最大六项禁用和触屏操作。本批不据静态展示计这些通过。
- 未提交、推送或发布。
