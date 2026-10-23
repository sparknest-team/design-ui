# 第一百一十九批：两端 Breadcrumb 子项菜单与点击反馈

核对第118批、主表及两仓Breadcrumb目录无在途变更后，复用源码站Cedar4185、Maple8080。构建阻塞沿用第118批实测结论，不重复重跑无变化的Token文档。

## 浏览器实际交互

- Maple `#/zh-CN/breadcrumb?audit=119-source` 下拉示例routes组点击“频道”，出现商品/钱包菜单；点击商品后菜单关闭，页面仍为当前组件示例，不跳到业务路径（示例@click.prevent）。
- Maple同一频道链接按Enter打开菜单，Escape关闭。Space未打开，这是原生锚点的行为，本批不据此宣称Space支持或判定缺陷。
- Maple点击事件示例中“一级”链接真实点击，Message显示一级，组件页面没有跳转。[Maple点击反馈证据](./evidence/maple-breadcrumb-batch119.png)。
- Cedar `/components/breadcrumb/?audit=119-source` 参数化下拉示例Channel链接按Enter打开Goods/Wallet菜单；点击Wallet后收起，仍在Breadcrumb文档路径（文档站自动增加段落hash，不是业务导航）。再点击Channel可以重新展开，Escape后收起。[Cedar下拉菜单证据](./evidence/cedar-breadcrumb-batch119.png)。
以上核对真实动作后的可见菜单/消息和URL，不读取Vue内部状态。两端没有捕获到error级日志。Maple右侧实例未操作。max-count只观察到保留首尾与省略位置的结构，不计为折叠项展开交互；没有将源码阅读当作验证。

## 验证与同步

- Cedar2文件13项、Maple3文件21项专项回归通过，共34项。事件参数、更多图标等自动测试不冒充浏览器验收。
- 未发现需修复的新缺陷，无源码/API/样式/Demo改动。现有中文及Maple英文文档已说明droplist、click和max-count约定，无需重复写入；主验收表新增本批记录。
- 菜单/调研检查通过：72族，56已同源、15逻辑已同源、1独立；Breadcrumb分类不变。两仓和审计仓库git diff --check通过。
- 无源码变化，未重跑类型/lint/完整构建。第118批两端Token文档构建失败与整库InfiniteScroll复制漂移仍单独保留，不接管相关并行工作。
- 独立部分交互记录47/72（65.3%），双端部分记录43/72（59.7%），尚无独立族级记录25/72（34.7%）；不是所有Demo/配置完成率。
- 仍待：折叠更多Tooltip、菜单方向键/事件参数、纯插槽droplist、sticky滚动、路由真实跳转、触屏与Maple右侧。未提交、推送或发布。
