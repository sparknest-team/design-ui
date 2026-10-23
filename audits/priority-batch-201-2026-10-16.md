# 第二百零一批：Watermark原生图片失败回退与恢复

## 范围与真实浏览器

- 起始2026-10-16 04:39 UTC核对时间、27批主表、200批及两仓Watermark变化，补图片失败回退，不重复局部深浅文字组合。Vue技能用于独立computed/ref、原生Image异步错误和真实组件回归。
- 两端图片Demo改为本地合成SVG（蓝色圆角图形及白圆），不使用外部服务或凭据；Maple移除原相对logo示例依赖。新增双语失败开关、恢复按钮和错误source历史。显式回退文字FALLBACK 201及红色字体，未改内核/API或默认主题Token。
- CUA操作Cedar4185、Maple8080中文中间实例，初始Mode image/Errors -。勾失败切换故意无效的data:image/png URL，浏览器原生Image发error；两端各显示Mode failure/Errors image，生成PNG样式相对原图不同。
- 保存并查看截图，真实可见红色重复FALLBACK 201文字，不仅根据DOM有层宣称回退通过。随后聚焦恢复按钮按Enter，两端Mode image、错误历史仍仅image、恢复按钮disabled，只有1层；PNG样式与初始原图完全一致。Maple恢复截图实际可见蓝图白圆。
- evidence/cedar-watermark-fallback-batch201.png、maple-watermark-fallback-batch201.png及maple-watermark-restored-batch201.png已保存并查看；临时226/227页关闭，既有源码服务保留。
- 未发现新内核缺陷。未覆盖外部网络/CORS/超时、Canvas错误、旧图片迟到竞争、默认暗色、全屏失败、英文实例/Maple右侧或物理触屏；图片Demo不保留原Cedar灰阶组合，灰阶仍在组件API中但不计本批验收。源码站不是新生产产物。

## 验证与进度

- 两端各新增1条Demo回归，Image/Canvas替身核对加载、image错误、fallback绘制、恢复不追加错误与单层；不将替身当原生错误/视觉证据。中英组件说明同步，沿用原菜单与移动集合，无新入口。
- Cedar初跑因Vitest0.22不支持vi.unstubAllGlobals在清理阶段失败，不是产品缺陷；改为保存/显式恢复原Image后重跑两端。最终Cedar5文件9项、Maple3文件7项，共16项Watermark回归通过且进程退出0；两端受影响Demo/测试ESLint、Maple1050个Demo SFC（0失败）、菜单一致性及三仓git diff --check通过。
- 仅JS Demo/测试和Markdown，无内核/公开类型改变，未重跑全量类型、全量lint或完整站点构建；完整生产站Token阻塞仍按197/188批记录，不接管并行改动。
- 分类同源56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）；双端至少部分证据72/72（100%）不变，不是全场景完成率；没有完整场景分母不能算剩余百分比。
- 待补Watermark默认主题/防篡改/加载竞争等组合，Form跨字段异步与混合校验、Upload原生读取故障/abort、Scheduler高级交互、日期时间和Carousel边界、物理触屏及新生产产物复验。
- 未创建代理/子任务、未提交/推送/发布，保留脏仓库与其他聊天改动。
