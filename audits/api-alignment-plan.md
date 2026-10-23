# Cedar / Maple API 统一实施方案

当前状态入口：[第五批验收及剩余 API 清单](./priority-batch-5-2026-10-09.md)。以下是 2026-09-07 的决策与历史落地记录，表中“保留差异”不代表现状；后续 Carousel、Upload、日期时间等已按各批审计覆盖更新。

日期：2026-09-07。状态：已获用户批准，逐批实施中；完成情况以 Cedar openspec/changes/align-component-contracts/tasks.md 为准。

本方案按用户本轮选择制定，作为后续逐批实现的验收目标。旧审计的数量仅表示主 Props 名集合差异，不表示完整组件契约差异；必须补充子组件、透传、事件、Slots、Expose 和实际行为验证。

## 1. 总体决策

- 两端共享逻辑 API 默认同名、同义、同签名；端能力差异逐项登记，不能只用“移动特性”笼统豁免。
- 相同组件采用共同 Props/事件/插槽/方法契约，视觉尺寸、触控目标和交互默认值允许明确登记的差异。
- 不要求每个组件都支持全部 size 档位；同一共享组件两端应支持相同公共子集。
- 先完成共同契约及迁移清单，再实施组件；每批同步源码、类型、文档、示例、测试及 Changeset。
- 本方案不宣称已有 contract diff 门禁；门禁需要另行实现。

## 2. 尺寸标准及逐组件决定

公共 `ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'`。每个组件使用它的适用子集，不能声明支持未实现的档位。

公共 `SizeLength = number | string`：number 表示 CSS px；string 可以是数值字符串（按 px）或合法 CSS 长度。非法值、NaN、Infinity 不得进入几何计算。长度对零值、负值的处理按组件明确规定。

支持预设与长度的属性先识别预设，再解析长度；不得把 `md` 直接传给 CSS width。使用 string 联合后 TS 无法校验所有非法字符串，文档和运行时处理必须承担这部分约束。

| 组件 | 目标 | 自定义值含义 | 实施注意事项 |
| --- | --- | --- | --- |
| Progress | `size: ComponentSize \| number \| string` | circle：外径；line：轨道厚度 | 默认 md；档位同时映射直径、线宽、字号。strokeWidth 显式值优先；circle 的 size 决定外径。Cedar 现有 width 迁移为 size，Maple 数字圆环用法保留。两端新增相同的数值线形行为。 |
| Switch | `size: ComponentSize`，只导出已实现子集 | 不接受任意长度 | 建议首批共同支持 sm/md/lg；若保留 xs/xl，必须两端补齐样式、加载图标、焦点环及点击区域。原 Maple number/string 通过迁移说明换成档位或文档化 token，不新造含义模糊的 trackSize。 |
| Card | `size: 'sm' \| 'md'` | 内容密度，非图片宽高 | 两端补齐 sm/md，默认 md；图片几何尺寸仍用 imageWidth/imageHeight。 |
| Rate | `size: number \| string` | 单个评分图标的长宽 | Cedar 补齐，Maple保留；不为凑齐枚举强加 xs~xl。明确 gap、半星命中区域如何跟随尺寸。 |
| Avatar | 现有 `size: number` 可以保留 | 头像外径 px | 若增加 CSS 长度应两端一起做；不是当前必要迁移。 |
| Icon | `size: number \| string` | 图标字体/盒尺寸 | 两端同义，记录数字单位。 |
| Loading | `size: ComponentSize \| number` | 档位或指示器尺寸 px | 当前两端已有此契约；不自动扩成任意 CSS 长度。 |
| Space | 保留现有 SpaceSize | 子项间距，可为双轴元组 | 文档明确元组轴序和各预设值；不能当控件外形尺寸处理。 |
| List / SkeletonShape / Steps | 保留已实现子集 | 组件各自的密度档位 | List、SkeletonShape 为 sm/md/lg，Steps 为 sm/md；分别写明。 |
| Form、Input 等 | 保留各自 ComponentSize 子集 | 控件密度 | 默认解析顺序：显式值 → 支持该能力的父组件 → 全局配置 → md。没有父级/全局能力时直接回退 md。 |

Progress 使用百分比、rem、calc 等长度时，SVG 几何需使用实际渲染尺寸或不依赖绝对 px 的几何模型。需验证 resize、隐藏后显示、SSR 首屏和 strokeWidth 大于半径等边界。文档不得在实现前承诺任意 CSS 长度可参与现有数值计算。

公共 `XxxProps` 描述调用方输入；默认值不能使调用方必须传 size。内部 resolved props 与 public props 分开：优先 Vue `ExtractPublicPropTypes` 或项目等价工具，不把全部字段粗暴 Partial，也不导出 `typeof xxxProps` 作为属性值类型。

## 3. 挂载及浮层标准

统一 `PopupContainer = string | HTMLElement | false`。可选属性自然包含 undefined；undefined 表示按默认策略挂载到 body。暂不增加 null、true、函数返回容器；只有确实存在 SSR/延迟解析需求时再统一增加签名及执行时机。

- string 是 CSS selector；HTMLElement 是现存 DOM 元素；false 表示原地渲染。
- 挂载到不存在的 selector 时两端采用相同的开发提示与 body 回退策略；SSR 不访问 document/HTMLElement，不丢失 hydration 行为。
- 高层 AutoComplete、Select、Cascader、Date、DateRange、Time、TimeRange 直接提供 popupContainer；优先级：显式顶层值（含 false）→ 嵌套浮层配置 → body。必须在处理默认值之前确定是否显式传入。
- BackTop 将 boolean 改成实际目标类型，并将 Teleport.to 接到目标，不能只重命名 Prop。
- Cedar Trigger/Drawer 等用 popupContainer=false 统一替代公开 renderToBody 开关；核查自动创建容器、滚动锁及定位坐标的关系。
- popupClass/popupStyle 对应定位容器，contentClass/contentStyle 对应内容面板，arrowClass/arrowStyle 对应箭头；按 DOM 解剖映射，不按英文近义词直接替换。
- sameWidth 与 autoFitPopupWidth 统一使用 autoFitPopupWidth；宽度和最小宽度是两个不同能力。
- clickToClose / closeOnClickReference 统一为 closeOnClickReference。偏移先确认 viewport x/y 与主轴/交叉轴的区别，再统一 API，不能机械把 popupOffset 改成 offsetY。

placement 统一 12 个 `top/bottom/left/right` 加 `-start/-end` 值；Cedar 旧缩写在破坏性迁移中替换。Maple cover-* 必须作为明确的覆盖模式处理，不能直接改为非覆盖 placement 而改变行为。

## 4. 事件及控制模型

- 普通多词通知在 emits 中用 kebab-case：page-size-change、click-outside 等。
- 模型保持 Vue 契约：update:modelValue、update:open、update:pageSize 等，不能机械全部 kebab-case。
- 生命周期统一 open（开始打开）、opened（打开动画结束）、close（开始关闭）、closed（关闭动画结束）。外部 Prop 驱动与内部交互驱动都遵守同一事件顺序。
- update:open 是请求父级更新状态；不能替代所有实际状态变化通知。若 open-change 有调用需求，两端保留同名通知、参数及触发语义；仅确认完全冗余后才删除，不在本方案中预先删掉。
- VerificationCode 的普通 onXxx Props 改为 emits。Button 的 Promise click 自动 loading 作为已存在的两端共同例外暂保留。
- 拦截钩子统一 beforeXxx；统一返回值、拒绝 Promise、done 回调的语义，名称相同不代表签名已一致。
- Slider 的 start/end 与 startChange/endChange 应按拖拽开始、连续变化、提交结束核对并统一，不能把内部子组件事件算作公开事件。

更正旧审计：camelCase/kebab-case 声明差异本身不意味着 Vue 模板监听失败；这是源码契约、类型与测试一致性问题，需依据具体消费方式验证影响。

## 5. status、variant 与其他枚举

语义状态统一属性名 status；普通输入类型、日期选择类型、加载动画类型仍可使用 type。过程状态如 wait/process/finish/error 不机械变成主题色；业务错误、校验错误与 danger 主题色分开。

描边视觉变体建议全库选 `outline`。用户明确提出的 Card `default/outlined/tonal`，本方案将其中的描边项随全库词汇规范统一为 `default/outline/tonal`；视觉能力保留。实施时所有文档、主题变体键和示例同步迁移，不留下 outline/outlined 双公开枚举。

| 范围 | 目标及范围 |
| --- | --- |
| Button、Tag、Badge | 保留现有 outline；保留各自有实际渲染效果的 variant 子集。 |
| Alert、输入控件、Card | outlined → outline；filled、standard、default、tonal 不一概互相替换，先按视觉语义映射。输入控件 standard 可以表示下划线形式，不能假定等于普通按钮 default。 |
| Alert / Message / Tooltip | 表示主题意图的 type → status；Message 的 loading/normal 先定义为消息状态或独立能力，不能直接套全量主题色联合。函数式 Message.error 可暂作为便捷方法名，配置里的错误主题统一 danger，需一起验证状态图标映射。 |
| Progress.status | 两端采用相同支持集合；现有 Cedar 的 secondary/tertiary 只有补齐 Maple token 和渲染后才能宣布支持。 |
| Result.status | 建议两端都支持 info/success/warning/danger/question/empty/403/404/500；补齐对应图形及缺省文案，默认 info。业务/HTTP 状态是 Result 专用联合，不放入 SemanticStatus。 |
| Input.type | 两端共同支持 text/password/number/tel/email；number 的输入值仍明确为字符串，数值校验及精度由 InputNumber 负责。 |
| Date.type | date/month/year 为共同基础；week/quarter 是待实现能力，不通过扩大 TS 联合制造支持。登记 Cedar 扩展，后续决定补齐移动端交互。 |
| Date.disabledDate / Time.disabledTime | 名称和极性保留；日期参数 string 与 Date 需要单独迁移，不在改名时静默改变回调参数。统一模型与格式后再收口签名。 |
| elevation | 推荐统一 `boolean \| number`，数字等级 0~24；字符串数字必须有明确迁移说明。允许端侧默认阴影不同。 |

## 6. orientation 与 direction

按用户定义：orientation 管组件整体朝向，direction 管内部排列或运动方向。

- Divider、ProgressGroup 保留 orientation。
- Steps、Tabs、Slider、Timeline、Split 的整体横/竖排列按 orientation 统一；Tabs.vertical 等旧入口随迁移删除。
- Space 与各 Group 的 direction 控制内部排列，保留该名称。
- Card 内部封面和内容的排列使用 direction: row/column/row-reverse；两端 layout → direction。
- Carousel 滑动方向、Drag 的 x/y/xy 约束可以保留 direction，各自明确类型。
- ButtonGroup/AvatarGroup/CheckboxGroup/RadioGroup 的 vertical/direction 逐个按其控制对象归类；禁用“所有 direction 批量替换”的做法。
- Form.layout 可表示 inline 等结构，不等同于单纯整体朝向；保留并说明与 orientation 的边界。

## 7. Form 错误定位

两端统一 `scrollToError?: 'start' | 'end'`，默认 undefined 不自动滚动。start 选第一个错误，end 选最后一个错误；不是 scrollIntoView 的 block 对齐参数。

按当前渲染的表单项顺序选择错误项，不能以异步校验结束先后或对象 key 顺序决定；排除已卸载/不可定位项。两端支持 scrollToErrorOffsetY: number | string，单位与转换统一。Cedar scrollToFirstError=true 迁移为 start。

## 8. Card、Affix、Badge 的共同实现

用户最终约束：Card、Affix、Badge 必须先修改一端，再复制同样代码到另一端，只适配前缀、必要的包内导入和配置读取。两端独立实现、独立实例；不建立共享运行时、不共享状态，也不用外部源码模板生成。增加只读源码一致性检查，防止复制后漂移。

Card：共同提供 size、variant、direction、title/subtitle/description、cover/header/default/footer 等解剖约定。迁移前逐个核对现有插槽。移动 src 图片便捷接口可保留为两端复制源码的可选能力，明确 cover 插槽优先。loading、分隔线、hover、ripple、floating 按效果逐项实现或登记扩展。首批不靠选一个现有文件直接覆盖另一端丢失功能。

Affix：统一主名 Affix，Maple Sticky 迁移；统一 offsetTop/offsetBottom、target、zIndex、disabled、cssMode 的确定契约。先核对 Cedar target/targetContainer 的边界作用，确认分别表示滚动目标还是约束容器，不能按别名删除。相同代码覆盖占位、局部滚动容器、边界限制、resize、SSR、卸载清理及程序定位。复制到各包，发布产物不依赖本机兄弟仓库路径。

Badge 原始复核：两端核心逻辑相近，但存在 TSX/SFC、RTL 和方位差异。用户已确定两端必须使用相同代码，默认红底白字；采用 status=danger，显式 default 保持灰色。同步六个物理 position、偏移和 outline 自定义颜色，组件与主体样式只做前缀/导入适配。

## 9. 其他需要纠正或继续核验的项目

- AutoComplete.getShow 只控制展开条件，filterOption 控制逐项过滤，两者不是同义词。建议前者改为 shouldOpen，后者单独补齐共同契约；与受控 open 的优先级必须明示。
- Upload/Uploader 主名统一 Upload；核对 showFileList/hideList（反向）、showRemoveButton/removable、preview/previewed、resolveType 及 beforeRead/beforeAdd 的参数。网络上传能力可列为端扩展，不假造空实现。
- Table 移动简单容器与桌面数据表是组件能力/职责差异，不按 Props 集合并集一次性补齐。
- Props/事件清单必须覆盖子组件及最终导出；名称不同不必然是组件对应关系，普通工具目录不计作组件。
- 公共 XxxProps 导出补齐：从实际入口跟踪最终 export；排除工具与纯指令；同批处理必选项、默认值、internal 字段泄漏和运行时定义误当值类型。不能只正则搜 type 名统计缺失。

## 10. 实施批次与验收

| 顺序 | 交付 | 验收 |
| --- | --- | --- |
| 0 | 本决策表、精确组件映射和平台差异记录，解决标准文件冲突 | 每个例外注明语义、原因、支持端和是否计划补齐 |
| 1 | 公共类型导出和 contract 清单工具 | 两包调用方类型样例：必选仍必选、有默认值可省略、internal 不可传；从发布入口编译 |
| 2 | Progress/Switch/Card/Rate 的尺寸实现与双端文档 | 预设、数字、CSS 长度、非法值、组合优先级、SSR 和视觉尺寸验证 |
| 3 | popupContainer 与基础 Trigger 的共同契约，逐层更新消费方 | body/selector/DOM/false、嵌套配置覆盖、局部定位、SSR/hydration、滚动锁 |
| 4 | 事件、status、outline、枚举及方向命名 | 两端共同交互用例验证事件参数/次数/时序；迁移表完整 |
| 5 | Card/Affix/Badge 独立复制实现 | 保留现有能力，平台适配列表受控，只读源码一致性检查与两端行为测试通过 |
| 6 | Form、Upload、日期、其余组件家族逐批迁移 | 每家族完整 Props/Emits/Slots/Expose diff 和明确剩余扩展 |

每批先走 Cedar OpenSpec 变更流程。既有共享规范要求直接移除旧名，而 design-ui 发布规范默认有弃用周期：实施前按实际已发布版本明确记录策略；已发布 API 走 major/弃用策略，未发布改动可以同批直接替换。不能因历史文件写“未稳定发布”就推断当前仍未发布。

完成标准是本批两端运行时、类型、文档与消费者验证一致；本计划没有把尚未检查的 slot、方法或平台差异标成已对齐。

## 11. 实际落地记录（2026-09-07，续作）

此前“待实施”记录已由下面的交付替代，不再以 Badge 首批结果代表当前状态。

- 公共类型：补齐组件入口、子组件及根入口 XxxProps；使用调用方可省略默认值的类型，保持 required 必选。两端生成声明并编译发布入口消费样例。Maple 构建从源码生成 types-generated，修复入口生成覆盖导出、过时手写声明及全局组件注册类型。
- 尺寸：Progress 支持预设、number/string、自定义 CSS 长度、实际圆环测量及清理；Switch 为 sm/md/lg；Card 为 sm/md；Rate 为 number/string。双端文档标明范围、默认值、非法值和优先级，不宣称所有组件实现全部尺寸。
- 浮层：popupContainer 支持 selector/HTMLElement/false，默认 body；高层组件与 picker 链路优先级统一，SSR 安全解析。十二方位与 cover 分离；autoFitPopupWidth/closeOnClickReference 统一。两端实际挂载、清理、受控状态及 SSR 有配对测试。
- 事件及枚举：普通多词通知 kebab-case，保留 Vue 模型事件；区分实际生命周期与状态请求。Drawer/Trigger/Alert 完成生命周期迁移，Slider 增加公共 start/end。status、outline、orientation 依语义迁移；Result 九种状态、Progress 共同状态、Input 输入类型、elevation boolean/number 落地。
- Card/Affix/Badge：同样源码独立复制，只有前缀、本地导入、平台配置桥接不同；不共享运行时/实例/状态。Card 保留浮动、封面优先级等能力（2026-09-08 移除 loading 属性，改用 Loading 指令组合），修复卸载定时器清理；Maple Sticky 改为 Affix，updatePosition 重新定位；Badge 默认 danger 红底白字。只读一致性检查覆盖 20 组组件/公共契约源码及测试。
- AutoComplete：shouldOpen 控制展开、filterOption 控制过滤，两者均有明确默认值和控制优先级。
- Form：start/end 按 DOM 顺序定位首/尾错误，统一 scrollToErrorOffsetY；Maple 延迟定位在卸载后取消。
- Upload：Maple 统一主名和公开 Props，文件模型 uid/status/percent/thumbnailUrl，与两端 resolveType/beforeAdd/beforeRead/beforeRemove 对齐；本地 Blob URL 所有权与异步卸载清理有回归测试。
- 文档与发布：双端 API-MIGRATION.md、组件文档、major changeset 已更新；没有提交、升级版本或发布。

## 12. 明确保留的平台能力及后续 Props 集合规划

以下是保留或另需设计的契约，不计作已实现同能力；不以空实现扩大枚举或类型。

| 范围 | 当前事实 | 后续边界 |
| --- | --- | --- |
| Progress.percent | 后续确认：两端统一 0～100，number/string 数字输入 | 已实施并迁移示例，不再保留尺度差异 |
| Switch.variant | 后续确认：circle/round/line/tonal，默认 circle | 已独立复制相同实现，不再保留造型差异 |
| Date | Cedar week/quarter 扩展；共同 date/month/year | 补齐移动端交互后才扩大公开联合 |
| Date/Time 回调 | 日期值及格式签名仍有端差异 | 先设计模型/格式迁移，再统一 disabledDate/disabledTime 参数 |
| Trigger | Cedar 触发数组/focus/延迟等；Maple Popper strategy/reference | 偏移主轴与屏幕轴不是同义 API，保留并解释 |
| Upload | Cedar 内置网络上传；Maple 应用管理请求与状态 | 公共文件模型与读取钩子已统一，网络能力不假造 |
| Table | PC 数据表与移动轻量容器职责不同 | 按能力设计，不取 Props 并集 |
| 插槽与公开方法全集 | 本次已改家族逐项迁移；未证明整库全部相同 | 单独按家族审计 Slots/Expose，不以名称清单替代行为验收 |

全库 Props 名称集合见 [api-props-inventory.md](./api-props-inventory.md)：覆盖根入口运行时 Props 和子组件，并明确标注这只是名称集合，不是语义完全一致的证明。

后续 Props 集合按“基础输入及选择 → 日期时间模型 → 数据展示/表格 → 平台交互扩展”分组。每组先给同名不同义、单端能力、默认值/必选项、Slots/Expose 的对照表，再决定是否补能力或保留端扩展；不得机械把差集全部补成 Props。

## 13. 最终验收

- Cedar 全量：105 个测试文件、377 项通过。
- Maple 全量：113 个测试文件、1120 项通过。Fab 合成点击使用 Test Utils 的监听器时间戳处理，修复同毫秒触发导致的偶发漏发；未跳过断言或测试。
- 两端全量 vue-tsc 类型检查、实际库打包及发布入口调用方类型样例通过。Cedar 入口生成器增加 PopupContainer 持久导出及回归断言，避免构建覆盖手工导出。
- Cedar CLI 的 2 项测试通过；Maple CLI 编译通过。
- 公共 Props/根类型检查两端 missingExports、missingContracts 均为空；普通多词通知 camelCase 扫描无剩余项（模型事件及控制钩子不改名）。
- 独立复制源码 20 组全部通过，三仓库 git diff --check 通过。
- 已增加 typecheck:contracts 脚本：先在各 UI 包运行 build:lib（Cedar）/compile（Maple），再运行 typecheck:contracts，确保验证的是生成的发布声明，而非源码路径别名。
- 只读复核：在工作区运行 node design-ui/bin/copied-components-check.mjs，以及 node design-ui/bin/api-exports-audit.mjs <组件包/src> --check。

以上验证覆盖已实施契约，不等于第 12 节平台扩展、日期模型及整库 Slots/Expose 已全部统一。没有提交、发布或升级版本。

## 14. Progress / Switch 后续确认

用户批准 percent 统一 0～100，以及 Switch 全面统一。Switch 在两包保留相同源码、Props、样式、27 项配对用例；平台桥接仅处理尺寸配置/表单上下文。
Progress 数字字符串与小数、无效值、边界、圆环几何、文案插槽及可访问性同步迁移；不采用自动猜测比例的兼容逻辑。
Maple Affix 导航遗漏的 sticky 已更正为 affix，生成站点配置验证通过。
本节替代此前 Progress.percent 与 Switch.variant 的“保留差异”结论；其他平台差异仍按第 12 节处理。

### 后续确认验收结果

- Cedar：107 个测试文件、424 项全量测试通过。
- Maple：114 个测试文件、1153 项全量测试通过；Form 测试改为语义角色定位，主题快照按新 Switch token 更新。
- 两端实际库构建、源码类型检查、生成发布声明的 typecheck:contracts 通过；公共导出检查无缺失。
- 独立复制检查增至 27 组，Switch 四变体与尺寸 Less 编译通过；三仓库 diff --check 通过。
- 双端组件文档、示例、主题、调用方类型样例及 major changeset 已更新。未提交或发布。
