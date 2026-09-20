# 基础层收尾记录

> 2026-09-20 更新：下表保留 2026-09-08 收尾时的历史判断。Trigger 后续已完成主体、定位器、Props、样式与契约测试同源，Maple 不再保留 Popper 定位适配；最终状态以 [Trigger 同源改造方案](../trigger-alignment/plan.md) 为准。

2026-09-08。两库仍独立发布、独立运行；共同源码保存在各库，并由只读门禁比较。以下将共同核心与端侧适配分开，不能把“已完成基础契约迁移”理解为所有组件 SFC 或所有 API 已经相同。

## 收敛结果与适配边界

| 范围 | 共同实现及真实消费者 | 保留的适配与原因 |
| --- | --- | --- |
| Menu | 五个 SFC 主体、props/types/context/level/options/render/selection/keyboard 独立同源副本 | platform 仅原生组件、外观、Trigger 参数与默认值；两端公开 Submenu，options/插槽使用同一控制器 |
| 模态 | modal-focus、popup-transition、popup-layer、scroll-lock；Dialog/Drawer/Popup/Overlay | Dialog/Drawer 的按钮、拖动、业务 beforeClose 与布局保留；Popup 的 safe-area 和位置动画保留 |
| Trigger | 共同状态、交互、引用、渲染、几何、尺寸观察；补齐 visualViewport 事件及视口避让 | Cedar 定位计算与 Maple Popper 适配保留；偏移、cover、strategy 等原有扩展不机械改名或删除 |
| 选项 | option-data 字段/身份/搜索；Menu、Select、AutoComplete、Cascader 接入 | Cedar 注册信息含 render/tagProps/分组，Maple 注册信息来自原生 Option/provider。两端数据适配器继续存在，不宣称整个 Select 控制器逐行相同 |
| 树选择 | tree-data 的节点路径查找、叶子遍历；Cascader 接入，禁用子树不参与级联 | Cedar 的懒加载/selectionDisabled 与 Maple 的 list/picker 草稿面板独立适配；Cedar TreeSelect 无 Maple 同职责组件，不创建空壳副本 |
| Form/Input | async-request、field-path、input-composition；真实 FormItem、useValidation、Input/useInput 接入 | b-validate 与函数/Zod 的规则表达、各端表单上下文继续适配。未改显式 disabled 覆盖/继承的原有端侧 API |
| Date/Time/Range | picker-data 的闰年/月天数、时钟秒数、12 小时换算、跨夜、有限步长；日期/时间/范围面板接入；Maple 范围复用 datetime 列与拼接 | Cedar Dayjs 格式/周/季度及输入面板，Maple 字符串、时钟/滚轮、草稿确认保留。这些 UI 和模型不是同一个公开接口 |
| 生命周期工具 | useChildren/useParent/useTouch/useId 独立复制；组件顺序、KeepAlive、卸载清理修复；原包入口不变 | Vue 3.5 使用原生 SSR ID；较老 Vue 延迟到 mounted 分配 ID，避免把进程 uid 渲染进服务端 HTML。useClientId 仍用于仅客户端 ID |
| 观察器 | resize-observer、responsive-observe 独立复制；Trigger、Carousel、ResizeObserver 包装器与响应式布局接入 | 原生 ResizeObserver/polyfill 为平台依赖；Cedar 两套虚拟列表及其消费者保留单端实现，Maple 没有对应虚拟列表 API |
| 配置/Locale/主题 | 两端继续使用独立 provide/inject 与主题入口；Maple StyleProvider 补齐无 DOM 调用保护 | 前缀、语言字典结构、主题注入范围不同，不合并全局单例。响应式断点和监听清理已共同化 |

## 修复的行为

- Menu 继承 attrs、class/style 与监听器正常透传；Trigger 描述符纳入引用检查，未因模板改成 h() 而丢掉检查覆盖。
- Modal Tab 从容器进入首项，跳过隐藏/disabled/inert 元素；嵌套层遵循统一栈，关闭恢复原焦点，KeepAlive 释放并恢复锁和监听。
- 模态单指滑动允许内部可滚动区域消费，边界及背景阻止滚动，双指缩放不拦截。Popup/Overlay 离场中维持锁，过期完成事件不派发。
- 异步校验只让最新请求更新提示，所有请求仍正常结束；clear/reset/unmount 使旧请求失效。
- Select 对同数量异步选项替换、标签编辑和原对象/proxy 值同步更新；多选未传数组时不再异常。
- 输入组合期间不提交中间字符，compositionend 后紧随的重复 input 不重复提交。
- 修复 12 AM → 00、无效时钟输入、步长 0/负值循环、滚轮 0 日、Cascader 正则路径前缀误判。
- 动画回归使用受控时钟验证 KeepAlive，而不依赖构建负载下固定 200ms 的机器调度。

## 验证边界

浏览器用真实 Vue/样式/布局验证，不以 jsdom 快照代替布局。触屏滚动与软键盘视口检查通过合成 Touch/visualViewport 事件驱动；不等同于所有实体 iOS/Android 键盘、旋转变换或全部 Teleport hydration 组合的硬件兼容认证。现有关闭 SSR hydration/首次打开、SVG、十二方位、包含块缩放/滚动与边界场景继续复验。

最终全库测试、构建、公开类型、SSR 与门禁通过；数量及最后追加回归见 progress.md。静态引用见 inventory.json（16 组）和 trigger-consumers.json；静态引用不是动态调用图的完整证明，真实消费组件由全库回归覆盖。
