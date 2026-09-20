# Menu 核心第四批

2026-09-08。本批对齐选择、选项树及面板键盘控制器。两库各自持有 selection.ts、keyboard.ts 和配对测试，没有跨库运行时引用。菜单视觉组件、平台弹出位置与子菜单默认触发方式仍各自适配，尚未将完整 Menu SFC 标记为同源。

## 选择契约

- options 与 content 插槽使用同一控制器；Maple 移除 Menu 对 Select controller/provider 的依赖以及无消费者的 provide.ts、option-provide.ts。
- Cedar 新增 options、fieldNames、multiple。两库从 Menu 子路径公开 MenuOptionData/MenuFieldNames，Cedar MenuProps 从实际 props 推导。
- modelValue 严格受控。单选、多选行与复选框均读取外部值；拒绝更新不会残留本地选中态。multiple 缺省 modelValue 按空数组处理。
- 分支联动按完整 options 树计算，不依赖子菜单是否展开或子项是否挂载。禁用分支及其后代不参与联动；部分选中分支点击后取消其启用后代；向上计算父节点状态。
- 多选结果按选项树/插槽注册顺序返回，并保留当前异步 options 暂缺的已选值。对象键按原始对象身份比较；false/0 等值不被错误回退到 label。
- update:modelValue 先于 select；更新事件在多选时返回完整数组，select 仍返回本次点击的单个 value、原始 option 与 Event。Maple 旧的事件先后顺序发生变化，公开文档已说明。
- 单选且 hideOnSelect=true 才请求关闭。父组件接受关闭后恢复焦点；受控关闭被拒绝时保留当前焦点。

## 键盘与焦点

- 根菜单与各级子菜单分别拥有 panel；上下键和 Home/End 跳过禁用项，在当前层循环。
- 关闭时在触发元素按上下键打开菜单并定位首尾项；右键进入子菜单、左键返回。Escape 每个事件只关闭最上层，恢复该层引用元素焦点。
- Trigger 增加 focusReference()，复用原有“焦点恢复时不打开 focus trigger”的抑制逻辑。Menu 的 Escape 与选择关闭均使用此方法。
- 保留输入框的 Home/End/Enter/空格原生行为，Menu-backed Search/AutoComplete 不被菜单的全局监听吞掉文本操作。
- 控制器动态跟随参考元素绑定 owner window；卸载、KeepAlive 停用时解绑，激活时恢复。

## 调用方和兼容入口

| 库 | 引用 | 本批处理 |
| --- | --- | --- |
| Cedar | BreadcrumbItem、Search、SplitButton | 保持 select(value, option, event) 和 open 更新请求；调用链回归通过 |
| Cedar | TableColumnManager 及 Table 列操作 | 保留 MenuOption click 事件、无显式 value 时的标签回退及旧菜单 context 兼容 |
| Cedar | MenuSubmenu、MenuPanel、MenuOption | 接入共同选择与每层键盘控制器；菜单样式入口增加 Checkbox 依赖 |
| Maple | BreadcrumbItem、Search、SplitButton | 保留组件、插槽、事件参数和菜单公开方法；setReference 支持可选参数以恢复默认引用 |
| Maple | AutoComplete | 使用同一选择与键盘控制器；可见性测试迁移到真实动画包装层，26 项通过 |
| Maple | MenuChildren、MenuOption | 移除本地选中状态和旧 provider；复选框点击保留原生 Event；保留 hover/ripple/视觉组件 |

Maple 的快照变化经审阅仅为 menu/item 标记、子菜单 role 及多选 aria-checked/menuitemcheckbox。未用快照更新替代行为断言。

## 验收

- 配对测试：每端新增 8 项选择树、10 项组件适配契约。
- 完整本批调用链：Cedar 198/198（49 文件），Maple 350/350（35 文件）。
- 真浏览器：Menu 10/10（两端各 5 场景，加载实际样式），Trigger 原有定位/渲染/SSR/focus 回归 54/54。
- 两端 UI 完整构建及声明生成、发布子路径类型契约、ESM/CJS Menu/Trigger 的无 DOM 导入及公开 props 检查（Menu 的 Ripple CSS 按 SSR 构建工具方式交由样式加载器处理）。
- 同源门禁 44 对；直接 Trigger 门禁 23 处；基础静态导入清单扩展到 12 组并增加 Menu。

浏览器入口为 browser/menu.html；使用 browser/serve.mjs 启动。发布形态检查为 bin/menu-runtime-check.mjs、bin/trigger-runtime-check.mjs。范围不包含完整 Menu 视觉 SFC 同源、类型搜索、完整模态焦点约束或真实移动设备触屏验收。

## 连续收尾结果

根、Option、Group、Submenu 与面板已接入共同 menu/render.ts，原生视觉与输入数据为适配参数；attrs 和监听器通过 mergeProps 合并。Cedar 保留 Scrollbar/Empty/slot options，Maple 保留 Ripple/HoverOverlay/MaybeVNode。公开 Menu 方法与外部消费方不变。禁止重新连接 Select provider。全库、构建、浏览器与门禁结果见 progress.md；上述第四批数字为历史证据。


## Menu 主体同源（2026-09-08）

根组件、Option、Group、Submenu、Panel 的 SFC 主体，以及 props、类型、context、level、options 递归、selection、keyboard、render 均为两端独立副本。只读门禁归一化包名、工具路径与原生文件名，检查真实主体内容；未引入共享运行时或代码生成。

`platform.ts` 仅承载原生 Trigger 参数映射、默认值与外观：Cedar Scrollbar/Empty/Checkbox/IconRight，Maple Ripple/HoverOverlay/MaybeVNode/Checkbox。选择、开关、焦点、键盘与兄弟分支管理不放在平台适配器中。递归组件直接导入，避免发布分包中的中转导出循环。

- 两端公开 `Menu.Submenu` / `MenuSubmenu`，支持 `default/content/icon/suffix/footer` 插槽及 `open/defaultOpen/trigger/placement/disabled`；Option/Group/Submenu props 和实例类型均导出。
- 根组件共同提供 `open/close/resize/setReference`、状态更新请求和生命周期事件。保留 Cedar 旧 context；Search、AutoComplete、Breadcrumb、表格与 SplitButton 原调用 API 无需替换。
- `unmountOnClose` 作为共同属性，保留 Cedar 默认 true、Maple 默认 false；子菜单触发方式保留 Cedar click、Maple hover；closeOnClickReference 保留 Cedar true、Maple false。Maple 定位 strategy 仍由其原生 Popper 适配器提供。
- 每层上下文同时管理 options 和插槽创建的子菜单，统一兄弟关闭、父级关闭、ArrowRight/ArrowLeft 与 Escape 焦点恢复。
- 函数标签接收原始选项与选中态；无 label/value 的插槽项回退到文本；Boolean label 显式保留 undefined 默认值；空格键在 keyup 选择一次。
- 新增四对组件契约与四项真实浏览器场景；SplitButton 方法测试改为观察 script-setup 的实际 exposed API。Cedar 原 Menu 单测补卸载清理，NavMenu 单测独立设置和恢复 matchMedia mock，避免全库测试依赖执行顺序。

最终验证数字见 progress.md 的本轮记录。
