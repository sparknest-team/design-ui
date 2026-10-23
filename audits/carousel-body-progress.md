# Carousel / CarouselItem 同源收口

两端独立源码：Carousel 主体、CarouselItem、Props、类型、Context、布局数学、样式、交互测试一致；仅命名空间、本地安装工具、方向类型来源、图标入口和全局 Locale 接入不同。没有共享运行时、platform.ts 或旧 API alias。

- Cedar 基线补齐 fade/card、centeredSlides、多可视页/auto 实测尺寸、touchable 与 draggable 并存。
- current 为零基索引，受控拒绝不移动；延迟接受不重复 change；event:false 仅抑制 change，不抑制模型更新。
- Pointer 释放坐标、慢拖距离、轴向取消、capture 丢失、KeepAlive/卸载清理已覆盖。输入控件键盘事件不劫持。
- 自动播放服从 hover/focus/页面隐藏/祖先隐藏/KeepAlive；ResizeObserver 与祖先显隐恢复尺寸。
- 可见及部分可见项均可访问；不可见项 inert；注释/非 Item 不制造空白页。
- 不复制子组件实例。循环普通步进保留过渡联合可视区；需同项双位置的跨页/居中跳转明确无动画定位。
- 26 个同后缀公开 token，均有消费者；系统角色值一致，由两端系统主题决定密度。具体声明以 style/token.less 为准。
- 公开方法 next / prev / to / resize；Emits、Slots、ItemSlots、Expose、Props 和 Instance 均从组件入口导出。
- 全局 Locale 文案通过独立职责适配文件接入，不创建组件私有词典。

验证：Cedar 25 项、Maple 26 项专项测试通过。源码门禁 carousel-core-check.mjs 比较 12 对源码/样式/测试并编译 Less 检查 token 消费，已通过。过渡中间态为确定性几何单测，未声称真实浏览器截图验收。

分类：Carousel + CarouselItem 主体同源。Maple Swipe / SwipeItem 是独立轻量手势组件族，不作为此组件别名或运行时依赖。
