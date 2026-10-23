# 第一百四十三批：Grid 动态排序与折叠后缀

2026-10-16北京时间。先核对时间、142批和两仓Grid/Row/Col状态，路径无在途修改。本轮优先Grid独立交互，Row/Col后续单独记录。使用Vue最佳实践技能核对父级响应式数组、派生布局和既有测试。复用Cedar4185、Maple8080源码站，非生产构建认证。

## 真实操作

- 两端动态示例初始折叠3列。实际点击Insert first，DOM可见6、1、后缀…，2~5保持隐藏；Reverse按钮Enter后可见5、4、…，对应整个数组倒序，不只是文本替换。
- 两端各实际点击Remove first六次，每次观察刷新后继续，最终只剩后缀End，Remove first实际禁用。Insert first按Space后显示7和End，删除控制恢复可用，没有重用错误序号或残留旧项。
- More按Enter，父级collapsed变false：实际可见10个网格位置（9项+后缀Less）；computed gap两端均12px。Less按Space恢复一行，可见4个位置（3项+More），Switch保持checked。
- 实际勾选2 rows，两个页面可见8个位置（7项+More）。Cedar第一行1~4的y372.09375，第二行5~7/More的y424.1875；Maple对应y378与433，实际分为两行，不是只读collapsedRows属性。
- Maple右侧iframe独立点击More，可见10个位置和Less，不改变中间已选2行折叠状态。
- 文档更新后两端重新选择2 rows，最终可见均8。截图检查折叠行及后缀：[Cedar证据](./evidence/cedar-grid-batch143.png)、[Maple证据](./evidence/maple-grid-batch143.png)。两端error日志为空，无脚本注入状态或事件。

## 文档与验证

- 两端中英文文档补父级控制、后缀占一个位置、清空后禁用和Grid没有新增/删除业务事件的边界。不改组件、Props、样式、Token、Demo或测试代码，不制造无需的API。
- 当前Grid回归Cedar3文件23项、Maple3文件32项，总55项通过。Maple套件包含10项Row/Col自动测试，不据此认定Row/Col浏览器交互通过或增加其独立记录。
- 仅Markdown变更，不重跑lint/typecheck/Demo语法检查。菜单/调研72族校验通过，56已同源、15逻辑已同源、1独立，分类不变。两仓及审计仓diff --check通过；完整文档构建沿132批未变Token解析阻塞，不将源码截图当新生产产物。
- 已有独立部分记录68/72（94.4%），双端部分64/72（88.9%），无独立记录4/72（5.6%）。是部分证据覆盖而非全部场景/通过率；Ripple原生鼠标等缺陷仍未修。
- 待验：实际视口断点切换、响应span/offset/gap、容器缩放、动态大跨列/后缀跨度、SSR后挂载、复杂表单/异步内容、真实触屏。Row、Col、Divider、Paper尚无本轮独立浏览器记录。
- 未提交/推送/发布，不共享运行时；临时浏览器页收尾关闭。
