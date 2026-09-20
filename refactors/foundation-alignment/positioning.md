# Trigger 定位基础对齐

> 2026-09-20 更新：本文记录 2026-09-08 的阶段性边界。后续 Trigger 完整同源改造已统一为双端独立复制的无依赖定位器，Maple 已移除 Popper 和旧偏移字段；最终状态以 [Trigger 同源改造方案](../trigger-alignment/plan.md) 为准。

两库各自持有 `trigger/geometry.ts` 与 `trigger/resize.ts`，没有跨仓库运行时导入。源码及行为测试纳入 copied-foundations-check。定位引擎仍为 Cedar 自有几何适配器、Maple Popper；本阶段不改变公开字段名。

## 坐标与偏移

- Teleport 目标决定挂载位置；实际 offsetParent 决定 CSS 定位坐标。Cedar 现在使用实际包含块的边框、滚动量和轴向缩放换算，鼠标定位使用 clientX/clientY 后转换到同一坐标系。
- 尺寸以 getBoundingClientRect 的边框盒为准，并消除包含块的缩放。SVG、content-box 的 padding/border、autoFitPopupWidth 使用同一尺寸基准。等宽弹层先确定宽度再计算 end/center 对齐。
- Cedar popupOffset 是朝弹出方向的距离；popupTranslate 是屏幕 X/Y 平移，也可按最终 placement 分别配置。Maple offsetX/offsetY 是屏幕 X/Y 平移，翻转后仍保持其正负方向。
- cover 抵消参考元素在弹出主轴上的尺寸。Maple 使用 Popper 每次计算提供的最终方位和参考矩形，避免翻转后沿用原方向的距离。
- 两端动画原点使用同一方位映射；Maple 读取最终翻转方位。百分比写法与原关键字写法等价，更新 Menu/Tooltip/Popover 消费快照。

## 更新与生命周期

共同尺寸监听器观察当前参考元素、弹层与定位容器，使用 ResizeObserver border-box，合并到下一帧进行测量。窗口 resize 同样触发更新。关闭、卸载及 KeepAlive 停用时释放观察器、窗口监听和待执行帧；重新打开或更换目标后绑定当前元素。Cedar 保留现有 polyfill 回退和 autoFixPosition 开关；Maple 在浏览器没有 ResizeObserver 时仍支持窗口 resize 及公开 resize()。

Cedar updateAtScroll 现在覆盖窗口滚动；scrollToClose 单独开启时也监听滚动祖先。阈值从绑定时记录的位置计算，每个滚动容器独立记录，解绑同时取消已排队的滚动任务。Maple 关闭弹层时停用 Popper 的滚动/窗口事件监听。

## SSR 层级初始化

Hydration 对照发现 Maple 在客户端已有弹层历史时，首帧 z-index 会与服务端不一致。两端 context/useZIndex 改为固定首帧值，挂载后按当前全局层级分配；服务端渲染不再推进计数。Maple Trigger、Popup、Overlay、Message、Card 及 Cedar Card 均通过原 hook 获得修复，并补充配对 SSR/挂载/重开测试。

## 调用方

本轮没有移除或改名公开参数，现有 Tooltip、Popover、Menu、Breadcrumb、Select、Cascader 和其余 Trigger 调用方通过原入口获得修复。继续保留两端包装组件各自已声明的默认值。23 处直接调用清单无需变更，复跑调用门禁与组件回归。

## 后续边界

浏览器夹具覆盖轴向 scale；旋转/倾斜、移动端 visualViewport/软键盘、多文档 Teleport 尚未作为通过项。SSR hydration 夹具覆盖本地渲染且初始关闭、首次点击打开，不等价于所有 Teleport SSR 容器组合。箭头、边界避让策略、渲染层与过渡 API 仍需继续对齐，不能据此标记整个 Trigger 或 Menu 已同源。
