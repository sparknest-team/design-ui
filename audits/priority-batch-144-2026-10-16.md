# 第一百四十四批：Row / Col 布局控制与部分响应式验收

2026-10-16北京时间。沿143批核对两仓Row/Col路径，无在途修改后验收。使用Vue最佳实践技能；Cedar4185、Maple8080均为源码开发站，不代表最新生产文档构建。两库源码独立，本批不改运行时、Demo、Token或测试。

## 实际操作与结果

- Row两端关闭Wrap后computed flex-wrap为nowrap，3个span12列处于同一y坐标（Cedar379.78125、Maple380）。开启Plain div后容器display为block，Row和3个Col的style属性均移除，未残留负间距或padding。
- 两端选择24px间距，Row margin为-12px，Col padding为12px；Vertical gutter按Space关闭后只保留水平方向margin-left/right和padding-left/right，纵向间距移除。不是只检查控件选中值。
- Col两端Reverse order按Space开启，3列computed order依次2/1/0，实际x坐标倒序；再次Space后3列均恢复0。Cedar开启时x为929.484375/659.4921875/389.5；Maple为231.65625/143.328125/55。
- Maple实际视口390px：第一列100%，第二列display:none，第三列83.3333%、offset对应margin44.1641px、order2。切至800px后3列均display:block、33.3333%、margin0、order0，隐藏列实际恢复。
- Cedar只验证1280px基线（3列33.3333%、margin0、order0）及排序操作。浏览器viewport能力此次只改变Maple活动页，重新绑定Cedar也未改变innerWidth；不把该操作记为Cedar跨断点通过。中途评论曾推测iframe原因，DOM实查无iframe，已更正为视口工具目标限制。
- 截图已保存并检查：[Cedar Row](./evidence/cedar-row-batch144.png)、[Maple Row](./evidence/maple-row-batch144.png)、[Cedar Col](./evidence/cedar-col-batch144.png)、[Maple Col](./evidence/maple-col-batch144.png)。未注入状态或合成事件；临时视口覆盖已reset，临时页收尾关闭。

## 文档、验证与剩余项

- 两端Row/Col中英文文档（8份）说明普通模式、Flex、间距方向、排序归零及浏览器视口断点。不因没有发现运行时问题而制造源码修改。
- Cedar测试命令路径子串额外选中Collapse/Color，5文件14项通过；其中Row/Col合同测试各1项。Maple同样额外选中Collapse，5文件36项通过；其中Row/Col合同各1项、grid/row-col交互10项。不能把额外套件计为本批新增测试或浏览器场景。
- 仅Markdown变更，不重跑lint/types；两仓和审计仓diff --check通过。菜单/调研校验72族通过，56已同源、15逻辑已同源、1独立，分类无需改写。完整文档构建仍沿132/140批记录的未变Token解析阻塞，本批不接管并行Token任务。
- 已有独立部分证据70/72（97.2%）；双端部分66/72（91.7%）；无独立记录2/72（2.8%），剩Divider/Paper。以上是部分证据覆盖，不是整库验收完成率或通过率，Ripple鼠标缺陷仍存在。
- 待验：Cedar真实跨断点、Maple更多断点/右侧独立交互、响应式gutter/align、父容器变化、SSR恢复、Col click事件、动态内容及真实触屏。既有其他组件高级场景仍按历史清单继续。
- 未提交、推送或发布。
