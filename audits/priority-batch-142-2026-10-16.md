# 第一百四十二批：Trigger 受控开关与预览入口

2026-10-16北京时间。检查时钟、141批和两库Trigger/Maple配置状态，无在途重叠修改。使用Vue最佳实践技能核对控制请求及清理。源码站Cedar4185、Maple8080，未把旧夹具合成mouseenter记录当本轮原生hover证据。

## 真实交互

- 两端点击“点击打开”，实际面板各1个。Cedar基础按钮底部377.8359、面板顶部387.8359，主轴间隔10px。
- 接着在独立受控触发元素按Enter，旧基础面板detached，受控面板显示父级open=true；证明独立浮层互斥与v-model回写，不是仅挂载。
- Maple受控浮层根实际父节点BODY，面板left565减按钮left549=16，顶部388减按钮底部378=10，符合popup-translate与offset。
- 两端外部关闭Space，受控面板detached、数量0；外部打开点击后再次open=true；按Escape两端均detached、0。
- 基础按钮Space重开，各1；实际点击页外Trigger标题，面板均detached、0。没有脚本注入事件/组件状态。
- 最后Cedar受控打开实际方位top-start，横向16px，面板bottom332.03125距按钮top342.03125为10px；如实记录实际翻转结果，不拿top与按钮bottom差值误报offset。未认证整个auto-fit矩阵或翻转决策原因。
- 两端error级日志为空。[Cedar证据](./evidence/cedar-trigger-batch142.png)、[Maple证据](./evidence/maple-trigger-batch142.png)。

## Maple 右侧落首页修复

- 中间实际Trigger Demo正常，但右侧找不到受控按钮。读取实际iframe src为/mobile.html#/home?language=zh-CN&platform=pc&replace=trigger，右侧DOM确为首页组件集合，不是加载较慢的Trigger。
- pc route-state按组件菜单匹配doc/type2，maple.config.mjs缺trigger入口，导致componentName回退home。只在Tooltip/Popover相邻处补中英Trigger组件菜单，复用现有markReuse自动标记[已同源]，不改路由内核。
- 配置watch自动重启后重载，iframe实际src变/mobile.html#/trigger?...；新菜单可见Trigger浮层定位[已同源]。
- 右侧iframe独立受控按钮Enter，面板显示open=true；外部关闭Space后detached、0。没有把此前失败尝试计为通过。
- 中英文Trigger文档及Cedar文档说明Demo父级接受请求的边界；未把此Demo推定为受控拒绝支持矩阵通过。

## 验证与进度

- 当前Trigger组件回归Cedar11文件63项、Maple12文件76项，共139项通过。站点route-state/AppMobile各1项，共2项通过；总141项，无新增测试。
- 站点测试首次从monorepo根执行因根无vitest命令失败；改在实际maple-cli包运行后通过，不归咎组件。Maple全量lint退出0，两库和审计仓diff --check通过；未改组件类型/API，不重跑typecheck，无Demo源码变化不重跑SFC语法检查。
- 菜单/调研只读校验72族，56已同源、15逻辑已同源、1独立，分类不变。完整文档构建仍沿132批Token解析阻塞边界，不将源码重载当生产构建通过。
- 已有部分记录67/72（93.1%），双端部分63/72（87.5%），无独立记录5/72（6.9%）。含Ripple等未修缺陷，是部分证据覆盖率，不是整库通过率或全部场景完成率。
- 仍待：受控拒绝/异步、真正原生hover/focus/contextMenu、禁用、滚动/尺寸变化重定位、popup-container多种宿主、嵌套层级、触屏、KeepAlive/跨窗口。没有将旧合成夹具或单测覆盖视为这些场景通过。
- 未提交/推送/发布，未增加共享运行时或platform配置；收尾关闭面板及临时页面。
