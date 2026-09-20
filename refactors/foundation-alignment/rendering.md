# Trigger 渲染基础第三批

两库独立复制 `trigger/popup.ts`、`render.ts`、`render-props.ts`、`arrow.ts`，以及 `render-contract.spec.js`。运行时互不引用；源码比较仅由 design-ui 工具执行。

## 共同结构与生命周期

定位层持有引擎坐标和弹层交互，内部动画层负责 transform/opacity 与 v-show，内容层负责业务外观。装饰箭头与内容层并列。定位测量不再直接测量正在缩放的动画元素。

`open/close` 跟随实际可见状态，`opened/closed` 跟随对应过渡完成。取消入场/离场不派发完成事件；重复完成回调不会重复通知。默认打开执行 appear。`duration` 支持毫秒数或分别指定 enter/leave。

`unmountOnClose=true` 时初始不渲染，关闭保留到离场完成再卸载。false 时隐藏定位层、保留同一个内容节点及输入状态。离场中重开取消卸载。卸载/KeepAlive 停用会清理过渡阶段。

## 调用迁移

- Maple 直接使用 Trigger：默认现在与 Cedar 一致，为 unmountOnClose=true。依赖隐藏内容常驻时显式传 false。
- Maple Menu/MenuChildren/Select/Cascader 显式 false；Tooltip/Popover 默认 false 并透传可配置开关，保留现有包装层行为。
- 两端 popupClass/popupStyle 作用于定位层，contentClass/contentStyle 作用于内容层，arrowClass/arrowStyle 作用于装饰箭头。
- Maple Popover 的内置背景、阴影和 popoverClass 移到内容层，以便与内容一起动画。用户 popupClass 继续控制定位层。
- Maple 新增 Trigger 样式入口；五个上层组件样式入口显式包含它。直接使用 Trigger 箭头时引入 trigger/style。
- Breadcrumb Tooltip 用例通过 trigger-placement 定位外层，不再假定 role=tooltip 的直接父节点就是弹层。Menu/Select 的 Transition stub 用例检查动画层 v-show；真实离场后隐藏/卸载由独立契约与浏览器验证。

## 箭头

两端使用同一最终 placement 和矩形算法。坐标保留正负方向后再限制在安全边距内，修复旧绝对值导致的反向偏移；极小弹层的边距不超过半个尺寸。箭头使用 aria-hidden=true。

主题 token 保持平台前缀和原默认值；本批不改变两端整套视觉主题。定位引擎、避让策略以及部分平台扩展仍通过适配器实现。Menu 主体尚未同源，后续可在稳定的共同 Trigger 渲染基础上迁移。
