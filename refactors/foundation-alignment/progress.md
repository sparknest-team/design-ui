# 重构进度

更新：2026-09-08。F0–F8 的共同基础迁移与适用项验收已收尾；定位引擎、复杂面板、规则及配置保留端侧适配。完整判定见 closure.md，以下历史批次数据保留，最终结果见文末。

| 批次 | 最终状态              | 结果                                                                                                     |
| ---- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| F0   | 完成                  | 16 组摘要/导入图，23 处直接及描述符 Trigger 引用，复制门禁                                               |
| F1   | 完成                  | 状态/事件/父子顺序/ID/手势生命周期基础独立复制及消费者回归                                               |
| F2   | 完成                  | 受控请求、取消、栈、焦点、SSR 与 KeepAlive 协议                                                          |
| F3   | 完成（引擎适配）      | 共同状态/引用/交互/几何/渲染；视口收缩与边界补齐；保留平台引擎与扩展                                     |
| F4   | 完成（视觉适配）      | Tooltip/Popover 与 Menu 五个主体共同 SFC；Menu props、递归、上下文、选择与键盘共同副本，保留原生视觉组件 |
| F5   | 完成                  | 共同模态焦点、栈、滚动锁、过渡；真实浏览器验证嵌套、取消、KeepAlive 和触屏 containment                   |
| F6   | 完成（规则/数据适配） | 字段/值/过滤、异步标签、表单路径/竞态和 IME 共用基础；保留注册信息与规则引擎                             |
| F7   | 完成（面板适配）      | 树路径/叶子与日期时间共同运算接入；端侧模型/面板保留，单端 TreeSelect 不制造副本                         |
| F8   | 完成（单端能力保留）  | 通用尺寸与断点观察器、包/类型/SSR 检查；Locale/配置/单端虚拟列表审计后保留                               |

## 首批验证证据

- 本轮调用链回归：Cedar 159 / 159（41 文件），Maple 279 / 279（26 文件）。包含 Trigger/Tooltip/Popover/Menu/Breadcrumb、Select/Cascader、Dialog/Overlay、Cedar Drawer/日期时间/表格/NavMenu/Mention/TreeSelect/ColorPicker，以及滚动锁的 Card/Message/FloatingPanel 等调用者。
- 新配对交互用例最初暴露 focus 失焦不关、Escape 恢复焦点重开；修复后两端各 10 / 10。
- 配对基础用例：use 10、Trigger state/reference 9、interaction 10、layers 7、scroll-lock 7；另有调用方路由和包装层默认测试。
- 真浏览器：两端各 12 个方位 + SVG hover/Escape，共 26 / 26。它验证当前基础几何和 SVG 开关，不代替滚动/缩放/触屏/hydration 全覆盖。
- 独立源码门禁：29 对基础源码、已有 copied-components-check 均通过。直接调用门禁覆盖 23 处，要求显式 trigger，并检查重复状态回调及旧 context/lock 残留。
- 两库 use 包 ESM/CJS/DTS 构建通过。Cedar UI build:lib 与 Maple UI compile 通过，包括 UI 声明生成。两库 typecheck:contracts 通过，新增 useVModel 正向与负向事件类型用例。
- 发现并修复 Cedar 构建对子路径 re-export 的裁剪；新增共享构建器回归测试。发布形态下两端 Trigger 的 ESM/CJS 无 DOM 导入、安装入口、公开 props/defaults 均已检查。
- Drawer/TimePicker 的旧快照仅 Button 子结构过时，审阅后更新两份消费方快照。清理部分旧测试遗漏的组件卸载，防止弹层/滚动锁跨用例残留。

维护与复验命令见 migration.md；浏览器测试页面和启动脚本保存在 browser/。

## 历史阶段出口（已由连续收尾处理）

1. 定位基础第二批已完成滚动容器、ResizeObserver、轴向缩放、边界翻转与初始关闭 hydration 对照。继续收敛边界避让策略，并验收移动端 visualViewport/软键盘和其他 SSR 挂载组合。
2. 箭头、内容层、离场卸载、过渡完成事件和主要样式接口已对齐；继续验收平台扩展与避让策略，不能将它们标记为已经全部同源。
3. Menu 的选项树、键盘/焦点与受控选择契约已对齐；Tooltip/Popover 主体已完成，继续收敛 Menu 渲染适配。
4. 接续 Form/选项/选择控制器与各类 picker；避免在底层契约尚未稳定时同步复制大组件。

## 定位基础第二批（2026-09-08）

- 新增共同 geometry/resize 与配对回归，Cedar 移除 Trigger 内旧 ResizeObserver 包装和旧测量函数，Maple 接入同一尺寸监听基础。
- 修复包含块边框/滚动/缩放、静态 Teleport 目标、参考与内容尺寸变化、border-box/content-box 等宽定位、翻转后的屏幕偏移和动画原点、窗口滚动与连续右键定位。
- 浏览器新增 hydration 用例暴露 Maple 历史 z-index 与服务端首帧不一致；共同 context/zIndex 改为挂载后分配，SSR 不推进计数。覆盖其 Popup/Overlay/Message/Card 等现有引用。
- 真浏览器 50 / 50：两端各 12 方位 + 11 几何场景 + 初始关闭 SSR hydration/首次打开 + SVG hover/Escape。不是移动端键盘、旋转变换或所有 Teleport SSR 组合的全覆盖。
- 本批完整调用链回归：Cedar 167 / 167（44 文件）、Maple 287 / 287（29 文件）；新增配对 geometry 3、resize 生命周期 4、z-index SSR 1，两端各 8 项。
- 同源门禁扩展到 35 对，直接 Trigger 调用门禁仍为 23 处。公开偏移字段保持原语义，未要求调用者改名。
- 两端 UI 构建及声明生成通过；最终发布形态 Trigger ESM/CJS 无 DOM 导入与公开 props/defaults 检查通过。
- 详细约定、调用方及后续边界见 [positioning.md](./positioning.md)。

## 渲染基础第三批（2026-09-08）

- 共同 popup/render/render-props/arrow 与配对契约接入两端；移除原渲染主体和重复完成事件处理。
- Maple 六处直接调用迁移内容缓存；Popover 外观移入动画内容层，五个包装组件补齐 Trigger 样式依赖。源码检查扩展到 40 对。
- 真浏览器 54 / 54，十二方位增加箭头检查，新增双端默认打开、离场中重开、完成事件及保留/卸载内容验证。原滚动/缩放/动态尺寸/SSR/SVG 用例仍通过。
- 本批完整调用链回归：Cedar 173 / 173（45 文件）、Maple 293 / 293（30 文件）；新增双端各 6 项渲染契约。
- 两端完整 UI 构建、声明生成及公开子路径类型契约通过；发布形态 ESM/CJS 的新渲染 props/defaults 检查通过。Maple 独立 Trigger 样式入口已生成。
- 详细 API、DOM 与调用迁移见 [rendering.md](./rendering.md)。

## Menu 核心第四批（2026-09-08）

- 独立复制 selection/keyboard 与每端 18 项新契约。Cedar 新增 options/fieldNames/multiple；Maple 移除旧 Select controller/provider 与每项可变选中态。
- 修复未展开分支的多选级联、缺省 multiple modelValue、受控拒绝后的选中态及 focus 菜单关闭后重开；键盘导航由当前面板拥有，Escape 每次只关一层。
- 调用链回归 Cedar 198/198（49 文件）、Maple 350/350（35 文件）；含 Breadcrumb/Search/SplitButton/AutoComplete/TableColumnManager 等消费者。Maple AutoComplete 可见性断言迁移到真实动画包装层。
- 真浏览器新增 Menu 10/10，原 Trigger 54/54 复验通过。Menu 外观组件仍分端适配，未将完整 SFC 标记同源。
- 两端完整 UI 构建、声明、公开类型契约及 Menu/Trigger ESM/CJS 检查通过。同源门禁 44 对，直接 Trigger 23 处，导入清单 12 组。
- API、调用迁移、验证边界与后续见 [menu.md](./menu.md)。

## Tooltip/Popover 主体第五批（2026-09-08）

- 独立复制完整 Tooltip/Popover SFC、trigger/wrapper 和每端 16 项配对契约。状态/生命周期由 Trigger 唯一管理，完整转发控制字段与公开方法。
- 保留平台默认和外观；Maple 补齐 title/content 与 Tooltip 背景/小尺寸，修复 open-change 转发缺口。文档同步说明内容层 DOM 迁移。
- 扩大调用回归 Cedar 253/253（57 文件）、Maple 390/390（39 文件）；浏览器 14/14，包括实际 More SVG 触发原始使用方式和箭头连接。
- 两端完整构建、声明、公开类型契约及 8 个 ESM/CJS 入口检查通过。复制门禁 48 对，直接 Trigger 23 处，基础清单 14 组。
- 详细证据见 [bubbles.md](./bubbles.md)；下一阶段按 [remaining.md](./remaining.md) 执行，先收敛 Menu 渲染，再处理模态与表单/选项基础。

## 连续收尾（2026-09-08）

- Menu 共同渲染已接入所有原组件；attrs 合并、原生样式和命令式 API 保留。23 处 Trigger 引用检查包括共同渲染的描述符。
- 完成模态焦点、触屏 containment、过渡生命周期、KeepAlive 锁恢复；Overlay/Popup 共用 popup-transition，Dialog/Drawer 共用 modal-focus。
- 选项字段/身份/过滤、树遍历、表单路径、异步校验保护、输入组合与日期时间运算接入实际调用者；不是未使用的工具集合。
- 父子注册、手势 RAF、SSR ID、尺寸/断点观察器完成审计与修复；配置、虚拟列表和复杂面板的保留边界见 closure.md。
- 全库回归发现并更新调用方旧快照；修复测试路径错误及依赖实时等待的动画回归。最终回归/构建结果见下节。

### 最终验收

- 全库：Cedar **683/683，145 文件**；Maple **1420/1420，154 文件**。最后追加的卸载完成事件保护及相关消费者复验：Cedar **64/64**、Maple **103/103**（与全库范围重叠，不相加）。
- 浏览器 **94/94**：Trigger 54、Menu 10、Tooltip/Popover 14、Modal 12、visualViewport/横向边界 4；均使用源码与真实样式。原始 More SVG Tooltip 用法通过。
- 两端 use 包构建、UI 完整构建、vue-tsc、发布子路径类型契约均通过；构建后 ESM/CJS 的 Trigger/Menu/Tooltip/Popover/模态入口导入与 SSR 检查通过，Maple StyleProvider 无 DOM 函数调用通过。
- 源码：**63 对基础副本**、组件复制门禁、**23 处直接/描述符 Trigger 消费者**、**16 组基础引用摘要**及模块 re-export 构建器回归通过。
- 本轮不发布或提交，变更保留工作区。整体基础迁移按共同核心与端侧适配收尾；原待办结果见 remaining.md，不能据此宣称所有组件 SFC、规则或定位引擎逐行相同。

## Menu 主体全面同源验收（2026-09-08）

- 五个组件 SFC、props/types/context/level/options 与原 selection/keyboard/render 纳入独立副本门禁，共 **76 对**；平台层只保留原生组件、外观、Trigger 参数和兼容默认值。两端均公开 Menu.Submenu。
- Cedar 最终全库 **690/690，146 文件**；Maple 全库 **1426/1426，155 文件**。最终调用链复验 Cedar **62/62，12 文件**、Maple **121/121，11 文件**；调用链与全库数字重叠，不能相加。计数反映当前工作区（含并行任务新增测试）。
- 真浏览器 Menu **14/14**，新增两端的空格单次选择及公开插槽子菜单场景；Tooltip/Popover **14/14** 复验通过，包含原始 More SVG 用法。
- 两端最终 UI 构建（含声明）及发布子路径 tsc 契约通过。ESM/CJS 无 DOM 导入、安装/子组件别名、公开 props、根与子组件 SSR 均通过；SSR 保留原生 Trigger 的挂载前内容策略。
- 直接 Trigger 引用 **23** 处、基础清单 **16** 组、其他组件副本门禁通过。未改写无关组件的生产实现；测试环境清理修复已通过 Cedar 全库验证。
- 具体范围与兼容默认值见 menu.md；机器记录见 verification.json 的 menu_full_source。
