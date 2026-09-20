# 基础层迁移说明

更新：2026-09-08。两库独立持有源码与运行时实例；design-ui 仅承载规范、验证及构建工具。

## 本轮已落地

- Trigger：共同的 contract、interaction-props、state、reference、interaction；支持 HTML/SVG/Fragment、外部 reference 与动态换节点，公开 open/close/resize/getReference/setReference/allowClose/isTopLayer。
- 弹层：共同的 popup-layer 注册表，按 document 隔离，按层级和嵌套关系确定事件归属；一次事件最多关闭其最顶层接收者。Dialog、Drawer、Overlay、Popup、Trigger 以及自行处理键盘的 Maple Menu/Select/Cascader 已接入。
- 滚动锁：共同的 scroll-lock 负责元素锁计数、原样式及 priority、滚动条占位和 KeepAlive/卸载/换容器清理；旧 useOverflow/usePopupOverflowHidden/useLock 入口转成本地适配，调用方沿用自己的动画结束边界。
- useVModel：默认 emit 事件为 update:key；无 emit 时继续查找 onUpdate:key 回调。事件类型按 key 推导，显式 eventName 推导自定义事件，兼容 use 包现有 TypeScript 5.3 构建。

## Trigger 默认值与调用方

| API | 统一默认 / 行为 |
| --- | --- |
| trigger | hover；接受 hover/click/focus/contextMenu/manual 或数组 |
| mouseEnterDelay / mouseLeaveDelay | 100 ms / 100 ms |
| focusDelay | 0 ms |
| popupHoverStay / blurToClose | true / true |
| closeOnClickReference / clickOutsideToClose | true / true |
| escToClose / restoreFocus | true / true |
| reference | selector 或 HTMLElement/SVGElement；不传时解析默认插槽 |
| setReference(undefined) | 撤销方法设置的目标，恢复 reference prop 或默认插槽 |

Maple 直接使用 mp-trigger 的业务代码，若依赖原 click 默认，请显式设置 trigger="click"；若依赖悬停无延迟，显式设置两项 delay=0；若需要再次点击不关闭，设置 closeOnClickReference=false。

库内 23 处直接调用已逐项检查，详见 trigger-consumers.json：Cedar 17 处、Maple 6 处。Maple Menu、Popover 保留 click/零悬停延迟/再次点击不关闭；Tooltip 保留 hover/零延迟；Select/Cascader 显式 click，菜单子项显式 hover/零延迟。Cedar 既有调用原本显式声明触发方式。包装组件保留平台默认值，底层契约统一。

Cedar Select、ColorPicker、AutoComplete、Mention、表格筛选及双端 BreadcrumbItem 删除重复状态处理函数的绑定。同一函数不应同时绑定 update:open 与 open-change；两个事件仍分别保留，方便调用者接收更新请求和通知。

## 受控状态与关闭

open 是受控状态。用户操作派发 update:open，父级未接受时实际可见性保持不变，且不会提前恢复焦点。defaultOpen 仅初始化非受控状态。外部 prop 更新不派发更新回声；open-change 是请求通知，open/close 跟随实际可见性，opened/closed 跟随过渡完成。

两端外部关闭统一在 document click 处理；Cedar 原来依赖 mousedown 的调用方式需随之调整。Teleport 子弹层属于父触发器内部；点击父面板或遮罩优先关闭子层，下一次事件再由父层处理。Escape 恢复焦点不会重新打开 focus Trigger。不要在业务层另外无条件关闭所有弹层。

Maple Trigger 移除面板的 click.stop，由共同控制器判断内部点击；面板上的业务点击可正常冒泡。需要业务级阻止冒泡时，由业务内容自身处理。

## 滚动锁

关闭任意一个弹层只释放它自己的锁；最后一个持有者离开后恢复原样式。Cedar Dialog/Drawer 保留动画结束再释放的时机。动态容器变化会先释放原目标，停用的 KeepAlive 不继续持锁。Maple Popup、Overlay、Message、Card、FloatingPanel，以及 Cedar Card 通过 useLock 入口接入。

删除仅供旧实现内部使用且无调用方的 addLock/releaseLock/resolveLock、context.locks 和 Cedar triggerInjectionKey。请勿从深层路径依赖这些内部结构。

## 最终适配边界

共同核心已接入实际消费者。Menu 使用共同 render/selection/keyboard，Tooltip/Popover 使用共同 SFC；Modal、选项/树、表单/输入、日期时间和观察器使用独立复制的基础模块。端侧定位引擎、复杂面板、规则引擎、Locale 与单端虚拟列表保留适配，具体判定见 [closure.md](./closure.md)。Maple Menu 已移除 Select provider 依赖。

## 验证与构建

- `node design-ui/bin/copied-foundations-check.mjs`：63 对基础独立副本。
- `node design-ui/bin/trigger-references-check.mjs`：检查调用点、显式默认和旧入口残留。变更后审阅并加 --write 更新清单。
- `node design-ui/bin/foundation-inventory.mjs`：更新基础层摘要及静态相对导入图；--check 只检查。
- `node --test design-ui/packages/ui-build/test/module-entries.test.mjs`：确保模块子路径保留公开 re-export。
- 构建两端后运行 `node design-ui/bin/trigger-runtime-check.mjs`：验证 ESM/CJS 子路径可在 Node 无 DOM 环境导入，并保留公开 props/defaults。
- 浏览器复验：工作区根目录运行 `node design-ui/refactors/foundation-alignment/browser/serve.mjs`，打开其打印地址；测试结果直接显示在页面中。

两端 use 包需要先 build；Cedar UI 用 build:lib，Maple UI 用 compile。共享构建器现在把公开 index 作为模块入口，防止 Rollup 只保留根入口而裁掉组件子路径的 re-export。

## 定位基础第二批

坐标、尺寸监听与翻转偏移修复见 [positioning.md](./positioning.md)。公开偏移字段保留原语义，所有现有包装组件继续通过原入口使用。

## 渲染基础第三批

见 [rendering.md](./rendering.md)。直接 Maple Trigger 默认改为离场完成后卸载，需常驻内容时传 unmountOnClose=false；库内包装层已显式保留原缓存行为。

## Menu 核心第四批

详细迁移见 [menu.md](./menu.md)。Maple update:modelValue 现在先于 select；多选行/复选框不再提前改变本地状态。Cedar 增加 options/fieldNames/multiple。两端保留 select 的单个点击 value 和原始 Event；消费方无需更换事件名。Trigger 新增 focusReference()，用于关闭后恢复焦点而不重开 focus trigger。

新增发布检查：`node design-ui/bin/menu-runtime-check.mjs`。浏览器 Menu 页面：`/design-ui/refactors/foundation-alignment/browser/menu.html`。

## Tooltip/Popover 主体第五批

两端 SFC 已独立复制，完整控制字段和方法转交 Trigger；旧组件名、插槽和平台默认保持。Maple Tooltip 新增明确的 open-change 转发，Popover 增加 title/content。Cedar Tooltip 实际内容元素承接 contentClass/contentStyle；Maple Popover 新增 title/body 子层。自定义直接子元素 CSS 请按内容层调整。详细记录见 [bubbles.md](./bubbles.md)。

发布检查：`node design-ui/bin/bubbles-runtime-check.mjs`；浏览器页面：`/design-ui/refactors/foundation-alignment/browser/bubbles.html`。

## 连续收尾迁移

- 所有原 Menu 组件改用本地 MenuView；外部 attrs/监听、原偏移字段和 imperative methods 继续有效。无需消费方改组件名。
- 模态关闭完成后才释放滚动锁。依赖过渡完成的测试需启用真实 Transition，不能用不会派发 after-leave 的 stub 验证锁释放。
- Input 组合输入只提交一次；Form 过期校验不再覆盖最新提示。异步选项相同数量替换也会刷新标签。
- useId 在 Vue 3.5 使用原生 ID；旧版 Vue 仅挂载后生成，不再将全局 uid 写入 SSR HTML。
- native ResizeObserver/polyfill、Popper、Dayjs 继续作为第三方依赖；未引入跨库运行时 import。
- 新增 `node design-ui/bin/modal-runtime-check.mjs`；浏览器追加 `modal.html` 与 `viewport.html`。触屏/软键盘为浏览器合成事件和视口验证，非全部实体设备认证。
