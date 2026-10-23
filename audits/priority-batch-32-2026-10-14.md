# 第三十二批：轮播真实拖动与示例请求清理

北京时间 2026-10-14 11:28 开始，承接第三十一批。保留其他工作区变化，不修改 Token 文件、公共 API 或组件核心，不引入共享实例/运行时。

## 改进

- 两端 InfiniteScroll 基础和自定义状态示例补齐计时器清理，与错误重试示例一致。卸载/KeepAlive 停用取消模拟请求，恢复 idle 后可重新加载。
- 两端 Carousel 自动播放示例增加开关、当前页和切换计数，2000ms 间隔；保留本地图片，显示页码 1-based，API 仍 0-based。Maple 文案随站点全局语言切换，无局部 t/use。

## 实际浏览器

- 两端受控轮播 ArrowRight：Current 0→1、Proposal 0→1；关闭接受更新后再次 ArrowRight：Current 保持 1、Proposal 2。
- 关闭接受时实际鼠标拖动，两端仍保持第 2 页；重新开启后实际拖动，两端 Current/Proposal 均为 2、可访问活动页为 Slide 3。每次先读取新几何，未复用开关操作前改变的坐标。证据：`/private/tmp/cedar-carousel-drag-batch32.jpg`、`/private/tmp/maple-carousel-drag-batch32.jpg`。
- 两端交互内容示例：输入 local-input 后按 ArrowRight 不切页；在轮播根切页再返回，输入值仍为 local-input。
- Maple 最终自动播放：中间实例关闭后计数保持 3，右侧继续；重新开启后计数增长到 45，关闭后停止。右侧单独关闭后计数长时间保持 55，不影响中间实例。两处三张图片均实际加载。证据 `/private/tmp/maple-carousel-autoplay-batch32.jpg`。
- Cedar 最终自动播放：计数到 6 后关闭保持 6；重新开启后增长，最终关闭在 26，后续保持不变；三张图片加载正常。证据 `/private/tmp/cedar-carousel-autoplay-batch32.jpg`。
- 最终修复后基础滚动：Maple 实际 12→24→36→48→60，显示 No more；Cedar 实际 8→16→24→32→40，显示没有更多了。结束后继续滚动数量不增；Cedar 滚动动画结束 scrollTop=max=1740，截图中末条及结束提示可见。证据 `/private/tmp/cedar-infinite-scroll-finished-batch32.jpg`、`/private/tmp/maple-infinite-scroll-finished-batch32.jpg`。不把 loader 桩当浏览器验收。

## 自动检查

- InfiniteScroll Cedar 3 文件/25 项、Maple 3 文件/24 项通过。新增测试覆盖 3 个实际 Demo 的卸载和 KeepAlive 停用/恢复；loader 桩隔离请求清理，不冒充真实滚动。
- Carousel Cedar 4 文件/26 项、Maple 4 文件/27 项通过；包含实际自动播放 Demo 模型回写、开关停止/继续、卸载计时器清理。Cedar 工具链 close timeout 警告但退出码 0。
- Cedar 受影响文件 lint 和 Maple 全量 lint 通过；修改范围 diff --check 通过。
- Maple 最终完整文档构建通过（1007 Demo SFC、0 失败、53.80s）；当前工作区比上一批多 1 个 SFC，不归因于本批新增测试，不覆盖其他聊天内容。Cedar 最终完整构建通过（274 页、261.33s）。
- 菜单/调研元数据检查通过，72 族分类一致；中英组件文档同步说明开关/清理行为，没有凭局部交互升级同源标记。

未覆盖：触屏长按/复杂多视图拖动、全部 fade/card/mousewheel、品牌/亮色主题、真实 KeepAlive 路由停用；部分由自动测试覆盖但不是浏览器验收。截止仍为北京时间 2026-10-15 00:00。

本批已完成小范围收尾，受影响两组件双端共 102 项测试通过。未执行整库类型检查或 npm 包构建，未宣称组件全部 Demo/配置已通过。后续继续 Carousel 的其他配置与分组/范围/异步组合，保持明确未覆盖清单。
