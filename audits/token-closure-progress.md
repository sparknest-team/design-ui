# 全库 Design Token 收尾记录

### 全量收尾复核（2026-10-20 14:34 起；无新增漂移）

本轮只读重查通过：当前库存 198 文件／418 CSS／184 runtime，文件键差异 0；80 份分类 hash 全部匹配，184/184 提示已分类（100%），待审 0；33/33 既有组件族已分类（100%），剩余 0（0%），分母未变。三页生成目录全量匹配，未发现新的并行重叠。两端受查生产树汇总与上轮收口快照一致；已有未提交业务改造保留，不把 dirty 状态误报为新漂移。

共享 motion 106 项及完整后续编译链、目录 47 项／三页匹配、严格消费扫描 172 文件／4565 声明／70 已分类候选／0 待审／0 错误通过。pnpm 入口因尝试在工作区外准备自身版本而被 EPERM 拦截；改用现有 Node v23.2.0 执行 package.json 中相同的 Node 检查链通过，不声称 pnpm 入口通过，未安装软件或修改权限。

本轮只更新审计文档与证据，未改生产源码、Token 默认值、库存／hash 登记或三页生成表格；未重跑全组件业务测试／类型／根 lint，不把上轮结果改写为本轮新验证。分类／Less 编译检查不是全库业务或原生验收率。Map SDK、144 组原生环境及 Button 白字 on-dark 2.305:1 非 AA 例外保留，新增原生验收 0，自动化核实仍 PAUSED。详见 design-ui/audits/token-closure-recheck-2026-10-20-1434.md 与 audits/evidence/full-closure-recheck-2026-10-20-1434/results.json；环境恢复条件仍见 token-closure-recheck-2026-10-20.md。

### 日期库存／hash／目录授权收口（2026-10-20）

最终补验：Cedar 默认隔离广回归 219 项／41 文件、Maple 244 项／44 文件、两端配置类型和新夹具 lint、Maple 只读根 lint 全部通过。首轮 Cedar 套件错误、隔离关闭超时提示、无线程串行的 SSR／DOM 环境错误及首轮 lint 诊断均保留，不计作产品缺陷或首次通过。最终库存 0 漂移、80 hash 匹配、三仓 diff 检查通过，验证进程已结束。

本批只同步获授权的 3 处库存、2 份分类 hash 和三页共 11 个逻辑行（2 默认值变化＋9 新行，5 个新增唯一声明）。生产源码、样式／Token 默认值、范围确认／提交和并行业务未改；未复现新的产品故障，不为登记漂移制造实现修复。新增审计基线 10 项中 8 个登记／目录匹配失败、2 个真实 Less 消费通过；库存比较夹具另纠正 file 字段包装，实际 3 处位置差异已独立确认。Cedar 新夹具首轮 attrs 透传覆盖 disabledDate 的误设也已纠正，不算产品故障。

真实入口核对：Cedar date/picker/style/index.ts → index.less → token.less，预览边界 outline、悬停范围／边界 fill-2 选择器与真实 Body 类名匹配；Maple date/style/index.ts → index.less → date-picker.less，日／月／年范围底色、禁用底色、预览底色和边界 outline 消费四个新声明。目录属性仅证明编译可达性，不代表所有 DOM／局部覆盖／对比度或原生验收。

Cedar 保留原 100ms 快捷预览任务、原句柄取消和生命周期／代次／一次消费／header continuation 守卫；真实禁用 Body 清除后旧回调重复交付不覆盖新草稿。Maple onSmartMounted 挂载／新激活同步滚动，nextTick 仅做记账；鼠标／触摸范围预览不追加滚动。新 Vue 回归两端各 2 项，按技能恢复方法描述符、卸载组件、恢复模拟计时器；没有新的资源需修复。

共享 motion 106 项及后续完整编译链、目录 47 项与三页全量匹配通过；严格消费报告 172 文件／4565 声明／70 已分类候选／0 待审／0 错误。库存仍 198 文件／418 CSS／184 runtime，80 登记 hash 匹配、184/184 提示已分类（100%），待审 0；33/33 既有组件族分类收口（100%），剩余 0（0%），分母未变。这是分类口径，不是全库业务或原生验收率。

受影响回归／类型／lint 的最终结果与首轮广测、串行隔离诊断分开保留，见 design-ui/audits/evidence/date-drift-closure-2026-10-20/results.json。Map SDK／144 原生组恢复条件沿用 token-closure-recheck-2026-10-20.md；新增原生验收 0，Button 白字 on-dark 2.305:1 非 AA 例外及其他文本阈值不变，自动化仍 PAUSED。下文“3 处／2 hash／三页待交接”是授权前历史快照。

### 全量收尾复核（2026-10-20；发现新的并行漂移）

本轮不能确认“无新增漂移”：库存总量仍为 198 文件／418 CSS／184 runtime，但有 3 处文件键差异（Cedar DateRangePicker、Maple YearPickerPanel 与 date-picker.less）；80 份分类源码中 78 份 hash 匹配，两个日期文件待重验。182/184 提示仍有匹配身份（98.9%），2 条待重验（1.1%），不是新增 2 个缺陷。既有 33 族历史分类不撤销；按当前源码身份，32/33 族匹配（97.0%），Date 1/33 族待重验（3.0%），不是全库业务／原生验收率。

三页均有日期目录漂移：Cedar 2 行默认值变化＋1 行新增，Maple 中英各 4 行新增，共 11 个逻辑行、5 个新增唯一声明；不是 11 个缺陷。当前完整编译报告为 172 文件／4565 声明／70 已分类候选／0 待人工／0 错误（首轮并行快照曾为 4564，不能混成冻结结果）。日期源码／Token 在检查期间继续变化，未覆盖并行业务，未自动刷新库存／hash 或应用生成表格。

motion 首段 92/96 通过、4 失败，未执行后续串行全量编译链；目录专项 37/37 通过，但全量三页匹配失败。已存浏览器证据 202 项与完整性链通过，只验证旧记录，新增原生验收 0。Map SDK 与 144 组原生环境分别需要的输入、明确交接范围和逐项差异见 design-ui/audits/token-closure-recheck-2026-10-20.md；证据见 audits/evidence/full-closure-recheck-2026-10-20/results.json。自动化已核实仍 PAUSED。下方 10-19 通过结论保留为历史快照。

### Maple 展示编辑器 lint 收尾复验（2026-10-19）

此前 3 文件的 8 项 lint 诊断已在本轮开始时消失：EditorPanel.vue 属性换行、presentation-state.vue 的 const 定时器容器及条件块、Form 示例入口导入顺序均已整理。本轮仅核对与验证，未再改这三个源码文件，保留 pending／inert、1200ms、AbortSignal、一次结算和并行业务语义；历史失败记录不改写为通过。

当前 Maple 只读根 lint、三文件专项 lint、配置声明类型均通过；相关 Form／Select／FieldPresentation 回归 300 项／34 文件及三个 SFC 脚本／模板编译通过。配置类型排除示例，示例另以 SFC 编译／lint 核对，不冒称示例完整类型验收。共享 motion 96 项及完整后续编译链、目录 37 项／三页匹配、严格消费扫描 172 文件／4560 声明／70 已分类候选／0 待审／0 错误通过。

库存仍为 198 文件／418 CSS／184 runtime；80 份分类 hash 匹配，184/184 提示已分类，待审 0，分母无新增变化。33/33 组件族已分类（100%），剩余 0（0%）；这是分类进度，不是原生浏览器验收率。无新库存／hash／目录漂移，未刷新登记或重生成相同目录。Map SDK 与 144 原生组阻塞保持，新增原生验收 0，自动化核实仍 PAUSED。详见 design-ui/audits/evidence/field-presentation-lint-closure-2026-10-19/results.json；恢复条件沿用 token-closure-recheck-2026-10-19.md。

### FieldPresentation／Form 授权收口（2026-10-19）

末次身份核对另捕获 Cedar 搜索助手的格式变化：当前完整字节与已登记、已验的 Maple 助手相同（6731260e…），调用行／片段未变，独立重验后只刷新该 hash。全部 80 份登记 hash 当前匹配，未将晚期变化说成源码全程未变。

末轮状态：Maple 根 lint 因新并行 EditorPanel.vue、form/example/demos/presentation-state.vue、form/example/index.vue 共 8 项格式／规则诊断退出 1；首轮通过只代表当时快照，不作为当前全库 lint 结论。本批未格式化这三个文件，需要并行负责人处理或交接这三个具体文件的格式整理边界；不影响已通过的专项、类型、当前库存／分类和目录证据。以下“根 lint 通过”仅为首轮历史。

严格门禁：motion 96 项及后续完整编译检查、目录 37 项／三页匹配、消费扫描 172 文件／4560 声明／70 已分类候选／0 错误通过。移除原始文本导入兜底后另验 AST 正反 8 项、全量三页和严格消费扫描通过。随后观察到 EditorPanel／Select 渲染与控制器等并行修改，均未覆盖；当前相关补验 Cedar 80 项／10 文件、Maple 89 项／13 文件及两端类型通过。完整 186／240 和补验不混成新增用例或全库业务认证。

新授权范围已完成：先复现两端搜索各 9 项（7 失败／2 对照）、焦点各 6 项（4 失败／2 对照），再限域修任务归属。搜索只接受当前激活实例／请求票据，替换、关闭／read／禁用、停用／卸载使旧任务失效；通知前一次消费，delay 读取和取消后旧回调不遗留任务、不覆盖新句柄。关闭后的 nextTick 焦点归还检查当前 reference、开合／形态、生命周期和代次，回调只消费一次；不在重开或跨停用后夺回焦点。失败断言相互交叠，不当成独立缺陷数。

两端真实 Form→Select 新增各 3 项回归，确认匹配字段 reset 退休搜索、无关 reset 保留当前搜索、活动编辑器阻止提交的原语义保持；两端 Form.vue／控制器／提交和并行业务源码未改，只重验并刷新登记 hash。Cedar 完整受影响 186 项／25 文件、Maple 240 项／33 文件通过（各新增 18 项），两端配置类型与受影响 lint、Maple 根只读 lint 通过。Maple Option 的外部变化保留，不以本批覆盖并行业务。

审计器从真实 style/index.ts 静态导入链发现私有 style.ts → style.less → token.less，保留真实声明路径与内部可见性；注释／type-only／孤立文件／越界路径不能伪造消费，旧入口与错误门禁保留。Maple Less 原将 min(var(--mp-field-presentation-min-width), 90vw) 折叠成 90vw，已通过保持原 CSS 表达式的转义修复真实丢失的变量消费；默认值、其他设计和公开 API 不变。

仅同步 6 处已审库存、两端 Form hash 与两个搜索登记；当前库存 198 文件／418 CSS／184 runtime，80 分类源码、184/184 提示（100%），待审 0。33/33 既有组件族已分类（100%），剩余 0（0%）；私有跨组件任务归入已有 Select／Form 消费链，不新建公开组件族。分母 182→184 来自两条新增实现提示，不是额外旧缺陷；两端搜索仍各 1 条提示。三页仅新增 _components/field-presentation 私有节共 12 Token 行（两端共 8 个声明），内部实现名不因列入目录变成公开 API。

最终严格门禁结果及快照见 design-ui/audits/evidence/field-presentation-form-closure-2026-10-19/results.json。Less／受控计时器／JSDOM 与真实浏览器／OS 分层，新增原生验收 0；Map SDK 及 144 组原生环境恢复条件见 token-closure-recheck-2026-10-19.md，Button 白字 on-dark 2.305:1 非 AA 例外保留，自动化仍 PAUSED。下文“6 处／2 hash／目录入口待交接”为授权前历史。


### 全量收尾复核（2026-10-19；当前状态）

本轮发现新变化，不能沿用 10-16 的全量通过结论：当前实际库存 198 文件／418 CSS／184 runtime，6 处文件键漂移；两端 Form 共 2 份登记 hash 过期。原 33 族中 32 族的登记源身份匹配（97.0%），Form 1 族需重验（3.0%）；新私有 FieldPresentation 搜索任务归属待登记，不先扩大族分母。当前 176/184 提示有匹配身份的既有登记（95.7%），8 条需审／重验（4.3%，Form 6＋新增搜索 2）；182→184 是新增实现提示，不是新增缺陷数。

两端新私有 token.less 使用 style.ts → style.less 路径，现审计器按旧 style/index.less 结构产生 2 项入口错误；真实 Less 各自编译通过，但目录完整检查中断，三页当前是否有新增行漂移尚未确认，未自动生成／发布部分目录。motion 首段 76/79、目录 8/11 后失败；后续全量编译链未执行，不声称全局 motion／目录通过。保存的浏览器证据 202 项及完整性链通过，仅校验旧记录，新增原生验收 0。

Map SDK 需正式适配器／版本、监听与销毁／异步取消契约、业务交接及受控可运行网络环境；144 原生组需可用 Chrome 原生 200%（48）、Safari 100%（48）、Firefox 100%（48）的受支持真实入口与逐组证据。历史连接观察未重新包装成本轮探测。具体差异、恢复输入和验收清单见 design-ui/audits/token-closure-recheck-2026-10-19.md；JSON 见 audits/evidence/full-closure-recheck-2026-10-19/results.json。

本轮仅更新审计文档／证据，保留并行业务、库存／hash 登记、三页生成目录和 Token 默认值。新增 FieldPresentation／Form 与审计器需交接边界后再收口；Map／原生阻塞、Button 白字 on-dark 2.305:1 非 AA 例外保留，自动化已核实仍 PAUSED。以下 10-16 全量通过是历史快照。

### Select／菜单表面目录授权收口（2026-10-16）

最终：Cedar 41 项／3 文件、Maple 49 项／6 文件通过（本批仅新增 1＋3 项 DOM 消费回归）；两端作用域／Maple 根只读 lint、三仓 diff 通过，91 个相关生产文件 hash 全部未变，验证进程均结束。保留首轮 Select 祖先选择器和 FloatingPanel 属性转发的夹具误设记录，不计产品缺陷；Vue 技能落实 finally 卸载／宿主移除。自动化仍 PAUSED，原生新增 0。

本批仅同步已核实的 Select 3 处库存／hash 和 Select、Maple DropdownMenu／FloatingPanel 三页共 21 行目录（11 个唯一 Token）。Cedar Select 当前钩子与已登记 Maple 源文件逐字同 hash；6 条调用职责不变，仅格式／行号更新。保留平铺分组标题的首项零上边距、纵向 popup padding、选项水平 padding 别名，以及菜单现有行级选中／悬停背景与 overlay 表面，未修改生产源码、样式、Token 默认值或并行业务。

实际 Less 入口、SelectMenu 平铺 DOM、DropdownMenu 分组／选中／焦点／禁用类及 FloatingPanel Teleport 宿主已核对。FloatingPanel 应在真实 popup 祖先覆写 --mp-floating-panel-background；不要假定传给 Teleport 组件的 style 自动转发到面板。目录属性列表表示编译符号可达性，不是每个 DOM 状态或局部派生别名重新求值的保证。

全量 motion 门禁当前通过（88 项共享测试、196 文件库存、182/182 分类及后续编译检查）；目录 29 项及三页全量匹配、消费检查 170 文件／4552 声明／70 已分类候选／0 错误通过。33/33 运行时组件族已分类（100%），剩余 0/33（0%）；78 源码、182/182 提示（100%），待审 0，分母未变。不是全库业务或原生验收率。

Map SDK 正式清理／异步身份契约、144 组原生环境阻塞和 Button 白字 on-dark 2.305:1 非 AA 设计例外继续保留；自动化保持 PAUSED。回归与最终快照见 design-ui/audits/evidence/select-catalog-closure-2026-10-16/results.json。以下 Select 3 处／目录 21 行未授权阻塞为历史。

### 原 6 处库存／DateRangePicker hash 授权收口（2026-10-16）

最终收尾：Maple 根只读 lint、Cedar 新夹具 lint、三仓 diff 与证据 JSON 均通过。保留首轮新夹具 curly 错误及第二轮并行 DatePanelContent 导入格式失败；本任务只修新夹具，观察到并行导入格式已变化后有界重跑通过。17 个相关生产快照中 16 个未变；RangeContent 并行改为移动端上下文导入，当前 8 项消费回归再次通过，未覆盖该业务文件或声称全族并行稳定。所有验证进程结束，自动化仍 PAUSED。

本批获授权的 6/6 处库存重叠已核实并刷新（100%，剩余 0）；连同上批，原 31 处已审记录全部同步。Cedar DateRangePicker 的时间选择业务分支保留；仅在内存还原该分支即可恢复上次登记的完整 hash 0e223655…，证明 100ms 预览任务只是 639→644 的行号移动。当前 hash 2a47d80d…、调用片段和 interaction-delay 职责已独立重验后登记，不改变 100ms 策略、提交／确认语义或头部任务所有权。

6 处库存基线均失败，新增 5 组真实 Less 消费检查已通过；DateRange／TimeRange 生成目录另有 4 项旧节基线失败。最终局部门禁 51 项通过；Cedar 25 项／3 文件通过（含新增 2 项时间选择与旧回调重复交付），Maple 32 项／5 文件通过（含新增 8 项 Carousel 三种 effect 与范围面板 DOM 消费）。Cedar 首次新增夹具仅错误要求所有计时器为零，已改为核对原预览句柄物理取消；不是已复现产品故障。生产 SFC、样式、Token 默认值和并行业务均未修改。

Carousel 的实际 track／fade／card 消费及 reduce 规则、Less 原样输出 grid-area 均核对；范围背景已有局部 picker／date／time body 别名，支持相应后代背景路径。目录 background-image 仅表示符号依赖可达；Picker 的根级派生 mask 别名不保证随局部背景覆写重新求值，需直接覆写 --mp-picker-mask-background-image 定制遮罩，本批不改其默认策略。Date／Time 还含历史转换选择器，不能以编译存在推断每种模式命中或完整 reduced-motion／原生验收。

授权的 Maple 中英 DateRange／TimeRange 共 4 行生成目录已同步。新增范围外变更独立保留：两端 Select 样式行号、Cedar select/hooks/use-select.ts 运行时行号及 hash；全量库存当前因此仍有 3 行漂移，分类 CLI 因 Select 失败，不再是 DateRangePicker。目录还保留 Select／Maple DropdownMenu／FloatingPanel 共 21 行、3 页的并行漂移，未整页应用。历史运行时登记仍 33/33 族、78 文件、182/182 提示、待分类 0，分母未变；当前 Select hash 待重验与未分类提示是不同统计，不声称全局门禁通过。

Map SDK 清理／异步身份契约、144 组原生环境阻塞、Button 白字 on-dark 2.305:1 非 AA 例外和自动化 PAUSED 保留。本次 Vue 技能用于原资源／回调交付复核及 finally 卸载／计时器恢复；Less、JSDOM 与真实浏览器分层，本批原生新增 0。证据：design-ui/audits/evidence/remaining-six-inventory-closure-2026-10-16/results.json。以下 6 处待授权／DateRangePicker hash 阻塞均为历史。

### 库存漂移分批收口（2026-10-16；自动化保持暂停）

最终收尾：Maple 根级只读 lint 退出 0；25 个已审生产文件 hash、三仓 diff 和证据 JSON 核验通过，验证进程均已结束。全量库存和分类 CLI 的已说明失败仍保留，不以局部通过掩盖。

重新扫描以文件键计为 31 处差异（Cedar 4／Maple 27），历史“26 处”不是当前固定分母；本轮最初“32”计数口误已更正。已核对并仅刷新 25/31 处库存记录（80.6%），保留 6/31 处（19.4%）重叠。25 处包含：5 处前批已审 FieldDecorator／Input／FilterForm 的行号更新、14 处无未提交样式变化的候选行号漂移、6 处已提交的 Checkbox／Radio／Progress／ProgressGroup／Rate／Slider 样式候选扩展。后六项虽部分文档／示例并行，未发现相应样式源码冲突，不能整族视为阻塞。没有把 25 处旧快照当作 25 个产品缺陷。

新增 31 项回归的有效基线为 25 个库存匹配失败／6 个真实编译消费通过；局部刷新后与既有 4 项扫描器回归合计 35 项通过。25 个实际 Less 入口均编译，6 组扩展核对正常 duration／animation 路径与 reduced-motion 对应规则；Maple 受影响真实控件回归 85 项／7 文件通过（不是 85 项新增）。保留 Rate 非法 count 测试的预期 Vue warning。仅建立候选位置／编译可达性证据，不外推 14 个旧样式完整 reduced-motion 覆盖、CSS 动画帧或原生验收；未修改生产源码、Token 默认值或业务。

6 处重叠保留：Cedar date/picker/DateRangePicker.vue；Maple carousel/style/index.less、date-range/style/date-range-picker.less、date/style/date-picker.less、time-range/style/time-range-picker.less、time/style/time-picker.less。日期／时间关联模板和 Token 仍有并行变化，日期范围／时间范围 Less 在审查期间也继续变化；Carousel 有并行 fade 样式及主体改造。本批未接管这些源码或刷新其库存。继续前需要相应源码／关联 Token 可交接的具体边界，或明确限域接管授权。

当前库存快照仅纳入已审变更：196 文件、414 条 CSS 提示；实际源码为 196 文件、416 条 CSS 提示，差额及行号差异仍由 6 处保留造成。实际 CSS 提示由旧 392→416，含已有实现／none 覆盖及两个新增库存文件，不是新增 24 个缺陷。运行时提示仍 182，历史登记 33/33 族、78 源码、182/182 提示、待分类 0，分母不变；但当前分类 CLI 退出 1，Cedar DateRangePicker 为 78 份中唯一 hash 过期，需重验，不能沿用历史 100% 当当前 hash 验收。全量库存 CLI 也退出 1；未称全局 motion-themes 通过。

Map SDK 正式清理／异步身份契约、144 组原生环境阻塞及 Button 白字 on-dark 2.305:1 非 AA 例外保留。本聊天自动化仍 PAUSED，不恢复调度。仅库存／门禁测试／审计文档变更，无新组件 API／发布语义，不为旧快照新建产品修复 Changeset 或 Demo。逐项边界和验证：design-ui/audits/evidence/inventory-drift-review-2026-10-16/results.json。以下“26 处保留”描述为历史。

### FieldDecorator 焦点／caret 目录收口与自动化暂停（2026-10-16）

最终收尾：Maple 根只读 lint 与 Cedar 新测试作用域 lint 通过；Maple 首轮仅新夹具的 28 项格式／导入排序诊断已限文件格式化修正，修正后 9 项专项再次通过。12 个生产文件 hash 不变、三仓 diff 与证据 JSON 核验通过，所有验证进程结束；自动化保持 PAUSED。

用户限域授权后，核对两端实际 FieldDecorator／Input／Textarea／InputNumber、静态样式导入链及 Less 编译：外壳外环移除与原生 caret 改为 currentColor 已由并行实现和当前规范确定，保留变体焦点反馈、按钮 focus-visible、错误／禁用优先级与现有 Token。未复现需修改生产源码的缺陷；本批不回退设计，不改业务、SFC、样式或 Token 默认值。目录中 outline-offset／caret-color 的旧消费行已过期，仅应用三页共 9 行生成差异。focus-color 不承诺控制 caret；错误态焦点可辨识性仍需原生验收。

有效 9 项共享基线 6 通过／3 页目录失败；首轮另有 2 项探针错误要求所有样式直接导入 FieldDecorator，按真实“Textarea／InputNumber → Input → FieldDecorator”链修正，不能计作产品缺陷。最终共享目录 17 项通过，三页全量目录匹配；既有 field-focus 编译检查与 384 项错误／禁用颜色和覆盖检查通过。Cedar 106 项／13 文件、Maple 129 项／15 文件通过，各新增 9 项真实控件 DOM 回归。Vue 技能落实 finally 卸载；Less／JSDOM 与真实浏览器分层，本批原生新增 0，未复跑无变化原生入口。

运行时候选仍 33/33 族（100%），剩余 0 族（0%）；78 登记源码、182/182 提示（100%），待审 0，分母不变。这不是全库业务或原生验收率；26 处其他库存漂移、Map 正式 SDK 清理／异步身份契约、144 组原生 Chrome 200%／Safari／Firefox 环境阻塞及 Button 白字 on-dark 2.305:1 非 AA 例外保留。用户要求停止的本聊天自动化 cedar-maple-14-00-2 已暂停（PAUSED），不再周期启动工作；本次明确授权的手动收尾已执行。

共享规范、两端指南／相关组件说明、Changesets、既定 OpenSpec 和证据同步：design-ui/audits/evidence/field-focus-caret-catalog-2026-10-16/results.json。以下 FieldDecorator 未授权／目录阻塞描述为历史。

### Cedar FilterForm／Form 目录消费收口（2026-10-16）

用户已授权限域审查相关样式／Token。历史“5 处目录差异”不是 5 个缺陷；按当前生成器合并为 2 个上下文差异块，现已只同步 Cedar 的 FilterForm／Form 两节。真实 Less 编译、Form 样式入口和实际 DOM 共同确认 13 个 FilterForm Token 的消费者；Form 的行高／标签下间距通过 action-offset 别名传递至 padding-top。单列 stacked 状态覆盖为 0；Grid colGap 是数字属性，不冒充 CSS Token。组件局部覆盖建议直接设置 --c-filter-form-action-offset，不假定根级派生别名会随局部依赖重新计算。未修改生产样式、Token 默认值、SFC 或并行业务代码。

新增目录回归基线 5 项中 3 通过／2 失败，失败仅为旧目录两节；同步后共享 8 项通过，Cedar FilterForm／Form 合计 75 项／17 文件通过（只新增 2 项 DOM 回归），作用域 lint 与全量消费检查通过。Vue 技能落实夹具卸载／媒体描述符恢复。Less／JSDOM 不等于原生布局或焦点验收，本批原生新增 0。

全量目录门禁仍受新出现的范围外 FieldDecorator 消费漂移阻塞：Cedar 与 Maple 中英共 3 页、9 行涉及 outline-offset／caret-color。未自动应用这部分生成补丁，也未据此认定业务／可访问性缺陷；需要另行审查授权或负责人交接。Map SDK 清理／异步身份契约、144 组原生环境阻塞与 26 处其他库存漂移保留。运行时候选分类仍为 33/33 族（100%），剩余 0 族（0%）；78 源码、182/182 提示（100%），待审 0，分母不变；不是全库验收率。Button 白字 on-dark 2.305:1 非 AA 例外不变。

证据：design-ui/audits/evidence/filter-form-token-catalog-2026-10-16/results.json。以下旧“5 处待交接”描述为历史，不再作为当前授权阻塞。

### Form／Picker运行时候选分类收口（2026-10-16）

最终受影响验证：Cedar Form64项／14文件、Maple合并532项／95文件全部通过（含Form115／19、Picker30／4）；两端相应lint／配置类型、共享29项及分类CLI182／0通过，最终hash／三仓diff／JSON核验通过。Maple中间531／532仅新增夹具错误禁止合法A通知，修正后205.86s最终全通过；NodeList类型适配改为局部Array.from，未改配置。原生新增0，所有验证进程已结束。

用户新授权仅接管 Cedar Form／Maple Picker 的运行时调度和资源清理，保留并行业务改造。Cedar 原11项基线7失败／4对照，Maple Picker有效7项5失败／2对照，Maple Form完成等待5项4失败／1对照；交叠断言不是独立缺陷数量，候选上的重复offset／重复注册／通知重入另行取证后修复。Cedar当前实例／验证／字段与一次消费守卫、原注销身份；Picker原媒体绑定／列／scroller完成票据与通知代次；Maple Form渲染后按当前CSS duration＋delay等待，零／无过渡不固定等300ms。正时长有可取消准备帧，300ms仅不可读样式保底，插值仍保留原300ms。控制器、FormItem、并行submitEpoch／提交、disabled／ARIA／级联及CSS Token不替换。

分类为33/33族100%，剩余0族0%；78登记源码、182/182调用提示100%，待审0条0%。本批只刷新四处已审候选（含新增私有完成助手）；分母181→182净增1条实现提示（新增助手2、移出Form旧timer1），不是额外旧缺陷，亦不把历史178→181重算。**这是本轮运行时候选职责分类，不是整库／所有业务协议／原生验收100%。** 受影响回归、类型、lint和共享门禁最终结果以逐组证据为准，不沿用旧18/33或旧NavMenu快照。

Vue技能落实原资源、停用／卸载、一次消费、重入和finally恢复。JSDOM受控Promise／timer／RAF／媒体／CSS与真实Less编译分层，原生浏览器／OS新增0。FormDetails当前Less编译仍为0.2s；未改CSS／公开Token／API。既有基础、异步、键盘和禁用示例保留并行修改，必要行为说明已同步组件文档；历史RPC、夹具失败、类型／lint诊断均保留，不降测试阈值。

原两族运行时接管授权阻塞已解除；不再要求重复授权。仍保留上次Cedar FilterForm／Form目录5差异块（需样式／Token稳定交接后人工整合，未覆盖生成）、Map正式SDK清理／异步身份契约、144组Chrome原生200%／Safari／Firefox环境条件及26其他库存漂移；不声称全局motion-themes通过。Button白字on-dark2.305:1非AA例外保持。Date／Time并行展示业务未接管，分类及受影响回归不等于整族稳定。新证据：design-ui/audits/evidence/form-picker-runtime-closure-2026-10-16/results.json。

### Maple Form自动滚动资格获授权修复（2026-10-16，阶段三）

用户明确允许仅补Form.vue内验证开始／清除／重置到自动滚动资格接线。基线10项6失败／4对照（exit1，11.80s）后，加入独立滚动资格版本、验证请求／策略快照及原字段成员／名称／目标复核；清除、重置、设置字段和新验证退休自动等待／插值，保留显式手动命令。校验回调重入后旧自动滚动不再覆盖新命令；停用前验证结果不能跨激活排滚动。校验Promise／回调、并行submitEpoch和提交语义保持，form-controller.ts／FormItem.vue、CedarForm／MaplePicker未改。

首修31项通过；补9项命令／物理取消／回调替换／字段身份对照后，最终Form106项18文件通过（exit0，60.18s），含本阶段19项＋前批87项，不记106个新增用例或六个独立缺陷。根只读lint、配置类型、共享29项和分类CLI165/16通过。首轮新增声明排版lint失败已手工修正，不以当时类型通过掩盖lint失败。Vue技能落实原资源、KeepAlive及finally恢复；均为JSDOM受控Promise／timer／RAF／几何层，真实浏览器／OS新增0，无Less／构建或无变化环境复跑。

分类仍31/33族93.9%，剩Form／Picker2族6.1%；74登记源码、165/181提示91.2%，16待审8.8%（Form7／Picker9），本批分母不变。只手动刷新Maple Form五行提示100／103／114／131／165，不刷新26其他漂移。固定300ms完成等待与FormDetails0.2s／reduce关系仍待审，Form不提前归档。CedarForm／MaplePicker仍需具体source＋test交接／冻结或限域授权；Date／Time候选已分类不等于并行面板全族稳定。目录5差异块、Map正式SDK契约、144原生环境组及Button白字2.305:1非AA例外保留。证据：design-ui/audits/evidence/form-scroll-validation-baseline-2026-10-16/results.json。

### 历史：Maple Form异步滚动资格授权前基线（2026-10-16，阶段三）

本批仅新增独立scroll-validation-eligibility探针，产品Form仍为324148a9…，阶段一／二滚动实现及并行submitEpoch均未改。有效10项基线6失败／4对照（exit1，11.80s）：验证旧结果跨停用／激活排自动滚动、原字段注销但节点仍连接仍排、清除错误／关闭自动滚动未取消等待、字段目标替换后旧等待仍排RAF、校验回调清除错误后仍排。组合／交叠不计六个独立缺陷。当前错误结果及Promise返回、成功无滚动、显式手动滚动不受自动策略变化影响、新激活后新验证四类对照通过。

按Vue技能核对了异步归属／KeepAlive和原timer／descriptor finally清理。真实Form/provider注册字段、受控Promise／300ms队列与RAF探针是JSDOM层，不是原生输入／布局／OS／adopt验收，真实新增0。新测试保持失败基线，不跳过／不称当前整套Form通过；前批87/17通过是前批测试集历史。作用域lint通过；最终只读根lint及hash/diff记录见证据。

需要明确扩展到Form.vue内“验证开始、清除、重置到自动滚动资格”的局部接线；只抑制失效自动滚动，不改校验返回、回调、submitEpoch、提交语义或form-controller.ts／FormItem.vue。已请求用户决定，未先行修改该接线。成员／目标检查可与该请求归属一起审查，固定300ms等待策略保持待审；FormDetails源样式0.2s只作源级依据，不当Less／原生测量。

分类不变：31/33族93.9%，剩Form／Picker2族6.1%；74登记源码、165/181提示91.2%，16待审8.8%（Form7／Picker9），分母无变化，无库存／分类刷新。保留26其他漂移、目录5差异块、Map正式SDK、144原生环境组、Button白字2.305:1非AA例外及CedarForm／MaplePicker并行边界。证据：design-ui/audits/evidence/form-scroll-validation-baseline-2026-10-16/results.json。

### Maple Form已启动插值的生命周期（2026-10-16，阶段二）

最终本批：Form87项17文件全部通过、exit0、275.40s，含本阶段11新插值专项＋前批10等待项＋既有／并行66项，不把21项都算本批新写。共享29项、分类CLI165/16、类型及根／最终作用域lint通过，三仓diff及最终hash／JSON检查通过；验证进程已结束。中间偏移夹具失败与前批默认RPC历史保留，无原生新增验收。

延续用户仅接管Maple Form.vue滚动段的授权。原5c3bf495…与真实共享scrollTo组合，6项有效基线4失败／2对照（3.05s）：新等待替换、停用、跨激活与卸载后旧帧仍写入。正常300ms线性／重复帧拒绝原本通过，不算新缺陷。仅Form内部私有插值接管原scroller窗口的RAF及取消器，逐帧一次消费、原请求／生命周期资格、读媒体／初始位置与写入后复核；取消物理释放原帧且逻辑拒绝晚交付，保留已发生偏移，不回滚或污染新请求。共享utils/elements.ts与HEAD同hash cdb1c340…，API未改，其他消费者不外推认证；并行submitEpoch保持。

原6插值项首修全通过；再补5项初始／动态reduce、原生写入卸载、激活新请求及位置读取卸载。前批10等待探针改为观察真实RAF／窗口写入，保留原职责；中间15/16及86/87仅偏移对照NaN，未明确初始窗口坐标的夹具补零并finally恢复后21专项通过（5.67s），不计产品缺陷。最终受影响Form／共享／类型及lint见逐组证据。Vue技能用于原窗口资源、KeepAlive、重入与descriptor恢复。保留原等待300ms＋插值300ms线性、初始reduce不排帧／动态reduce下一帧到位；固定等待与FormDetails0.2s／reduce关系、异步校验资格及字段成员仍未认证，本族不提前归档。

分类31/33族93.9%，剩Form／Picker2族6.1%；74登记源码、165/181提示91.2%，16待审8.8%（Form7／Picker9）。分母178→181只因本次私有实现新增3条提示，非新增3个旧缺陷、也非已分类倒退。只手动更新Maple Form为89／92／103／120／146及本端81→84、local query=true；26其他漂移不刷新，不称全局motion-themes通过。JSDOM真实组件／原helper基线及受控RAF／媒体／几何不是原生布局／OS／adopt验收，真实新增0。目录5差异块、Map SDK、144原生环境组、Button白字2.305:1非AA例外、CedarForm／MaplePicker并行边界与前批默认RPC失败历史保持。证据：design-ui/audits/evidence/form-scroll-animation-lifecycle-2026-10-16/results.json。

### Maple Form等待任务获授权修复（2026-10-16）

最终三仓diff检查及两份本批证据／库存JSON解析均通过；源码与专项测试hash仍为5c3bf495…／932a140f…。所有本批验证进程已结束。下一批可在既有Maple Form滚动段授权内继续对已启动插值／固定完成等待取证，不动共享助手API或CedarForm／MaplePicker重叠源码；不重跑无变化浏览器入口。

验证收尾：默认Form执行60项断言／14文件通过，但form-controller.spec.ts在resolveId setup、index.spec.js在fetch ListPresentation阶段超时，另1个onQueued未处理错误；exit1、295.53s。一次不改阈值的单worker／无文件并行补验最终**76项16文件全部通过、exit0、792.07s**，未报未处理错误；含本批10项＋既有／并行66项，两原加载失败文件分别12／4项通过，不记16项新增测试。默认失败历史保留，不认定原因仅为负载或运行器已永久修复。最终Maple只读根lint未报错、配置类型通过（组合命令exit0），源码／测试hash未变，Cedar／Maple diff检查通过；共享最终检查见后续记录。无原生环境入口复跑。

用户明确允许仅接管Maple Form.vue滚动任务段；保留原submitEpoch及所有并行提交改造，CedarForm／MaplePicker未接管。有效原6项基线3失败／3对照；补几何读取卸载后原源码7项4失败／3对照（4.60s），不记四个独立缺陷。授权后等待任务加入代次、一次消费、mounted／active／disposed资格；停用／卸载取消，激活只接受新请求，几何读取后复核，不退休重入创建的新请求。

首修7项通过（14.99s），补inactive／fresh activation、几何重入替换与offset／linear正对照后10项专项通过；受影响Form整套、类型和lint最终结果见逐组证据。Vue技能用于原timer／KeepAlive／finally descriptor清理。仅控制委托前的等待，不宣称下游已启动RAF可取消；共享scrollTo仍只返回Promise，无取消器。本次保留原300ms等待／global timer、默认线性helper、API及Token。FormDetails样式当前0.2s，固定300ms等待的完成策略／reduce与共享插值接线仍待单独取证，不偷改为business-delay或宣称全motion通过。

分类仍31/33族93.9%，剩Form／Picker2族6.1%；74登记文件、165/178提示92.7%，13待审7.3%，分母不变。Maple Form两条未提前登记，仅手动刷新已改库存42／52→70／84，26其他漂移保持；JSDOM受控timer／几何、mock下游不是原生插值／OS／跨document验收，真实新增0。待审仍包括共享helper取消、验证完成后的滚动资格、字段成员和当前配置等，不能用本批10项冒充Form整族收口。证据：design-ui/audits/evidence/form-scroll-wait-task-2026-10-16/results.json。

### Form滚动任务只读基线／待授权修复（2026-10-16，16:39上海起）

未接管两端Form或MaplePicker并行源码。Maple Form仍为94c525ac…快照，仅新增独立scroll-task-ownership探针：6项基线3通过／3失败（exit1，6.98s）。正常300ms调度、普通卸载取消及未知字段通过；手工交付已取消旧回调／重复当前回调／跨KeepAlive激活旧回调仍调用scroll助手。属于受控队列归属缺口，不计三个独立缺陷，不宣称原生timer实际重复或已修复。原300ms是否为视觉完成等待及滚动helper取消接线仍需进一步审查，不提前分类。

Vue技能用于原timer清理／KeepAlive核对和finally恢复全局descriptor；实际Form＋注册字段，mock下游scrollTo仅观察派发，非真实插值／布局／原生／OS验收。源码未改、未归档新文件／提示；仍31/33族93.9%，剩Form／Picker2族6.1%，165/178提示92.7%，13待审7.3%（Form4／Picker9），分母不变。基线测试故意保留失败，不能称整套Form通过。新增夹具import顺序lint已修正，最终只读lint结果见证据。

需要用户／负责人明确允许仅接管Maple Form.vue滚动任务段，保留现有submitEpoch等并行提交改造；未把“继续”扩大为覆盖并行源码。CedarForm／MaplePicker仍各自保留；26漂移、目录5差异块、Map SDK、144环境组及Button白字2.305:1非AA例外不变。证据：design-ui/audits/evidence/form-scroll-ownership-baseline-2026-10-16/results.json。

### Maple 年面板原生对齐／Date候选分类收口（2026-10-16）

本批专项7项通过（90.47s），受影响Maple Date／DateRange **202项36文件通过、exit0、107.67s**，含本批7项及既有／并行195项，不记202个新增用例。共享29项／分类CLI165/13通过，三仓diff与最终hash／JSON检查通过。新增夹具最初3处curly lint错误，补显式大括号后受影响lint通过；初次根lint读取修正前文件仍失败，**最终Maple只读根lint:check通过、exit0**，保留失败历史，不记产品缺陷。源码未改，无配置类型／Less／构建／浏览器／OS重跑。其余安全范围已收口，后续等待Form／Picker具体交接或原有外部阻塞条件变化，不制造重复测试／修改。

YearPickerPanel源码保持9a51ffd…不变：挂载及后续激活同步查询当前选中Button，优先primary、其次outline，无标记不滚动。实际onSmartMounted源码与解析构建一致，首次KeepAlive激活不重复；nextTick只更新挂载标记，没有延迟滚动、私有RAF／timer／监听需取消。7项实际YearPanel／Button＋KeepAlive受控对照通过（含空列表、立即卸载、停用后当前节点重激活），未复现产品缺陷，不制造修复；Vue技能用于核对资源归属及夹具descriptor恢复。

**31/33族分类收口93.9%，剩Form／Picker两族6.1%；74文件、165/178提示92.7%，13待审7.3%，分母不变。** Form4／Picker9；Date／Time候选归档不等于并行展示层稳定或整组件验收。仅登记原有年面板236行native-scroll，无库存行变化／API／Token／默认值修改，保留block:center及浏览器滚动策略。JSDOM方法探针不是原生布局／smooth／reduce／OS／adopt验收，真实新增0。受影响回归与门禁实际结果见design-ui/audits/evidence/date-year-native-scroll-2026-10-16/results.json。

Form两端及MaplePicker源码hash与上批相同，但仍有并行source／test修改且无明确交接，不能用mtime安静认定稳定；需具体文件可审／冻结边界或明确接管授权。保留26其他漂移、Cedar FilterForm／Form目录5差异块、Map正式SDK契约、144原生环境组及Button白字2.305:1非AA例外，不自动生成覆盖或重试无变化入口。Cedar上批175项断言通过但close-timeout告警仍保留，本批不机械复跑。

## Cedar Date范围快捷预览／所属表头续体（2026-10-16，07:51 UTC起，阶段二）

范围Picker与私有range-header helper起点clean，按真实Git路径确认，原hash0a7c6dc…／4340d070…。stub并行RangePickerPanel，不接管其展示层、header／calendar、Form／Picker／关联Time。有效13项旧基线10失败／3对照，复现旧／重复timer、配置模型失效、停用／跨激活以及已排表头清理在停用后通知。正常100ms不提交模型、普通卸载与宽限中表头结算原本通过；不称十独立缺陷。

timer代次与preview代次分开：leave仅替换timer，保留100ms宽限内有效表头结算；preview写入统一退休旧timer／表头相位，所有入口上下文／生命周期失效。timer／nextTick一次消费，preview／input setter后复核，私有resetHeaderValue可接原请求资格。取消仅逻辑失效Vue续体，不删除队列。保留100ms交互宽限／global timer、公开API／CSS Token，不因reduce跳过业务等待；其他默认表头调用方与所有select／confirm／input协议仍独立，不以本批覆盖冒充完整Date验收。Vue技能用于原资源、停用卸载与descriptor清理。

首修13通过、exit0、27.35s但close-timeout告警单列；追加7项后中间174项32文件通过（82.32s），不是最终版本。另在首修候选有效单项复现“新单元格选择未使旧清理失效”，1失败／20未选、exit1、4.19s，不加入原13基线；改为在preview写入边界退休旧任务。**最终21范围专项，受影响175项32文件断言全通过、exit0、183.14s，仍有close timed out after1000ms**，不得称无告警／机械复跑去消失。新增21本批测试，其余154既有／并行回归不重复归功。最终配置类型及受影响lint通过；最终共享29测试／分类CLI164/14、Maple只读lint、末尾hash与三仓diff检查均通过；此前排队运行状态保留在操作记录，不冒充提前通过。受控JSDOM／KeepAlive／stub／timer／TS hook nextTick不是原生hover／OS／adopt，真实新增0。无独立Less／构建／浏览器复跑。

**登记30/33族90.9%，剩Date／Form／Picker三族9.1%；73文件、164/178提示92.1%，剩14条7.9%，分母不变**。Date剩Maple年面板1，Form4／Picker9；仅范围Picker库存605→639，supporting helper无扫描hint，独立记hash不虚增分类文件。Date仍部分，不能把并行整族说成稳定。共享规范、Cedar指南、Maple中英指南、DateRangePicker／MapleDateRange文档、既有Changesets／OpenSpec与[逐组、两阶段基线、hash及验证状态](./evidence/date-range-shortcut-preview-2026-10-16/results.json)同步。

26其他漂移、Cedar FilterForm／Form目录5差异块、Map正式SDK、144原生200%／Safari／Firefox环境组及Button白字2.305:1非AA例外保持，不自动刷新／生成覆盖或重复无变化超时入口。仍需原已说明的具体owner交接、SDK契约与可响应控制环境；无新权限需求／聊天／子代理、提交／推送／发布、软件／权限／自动化改动。收尾门禁已结束；下一批仅按原边界推进Maple年面板，不把关闭告警隐藏或机械复跑。


## Cedar Date单值快捷预览／交互宽限（2026-10-16，07:40 UTC起，阶段一）

最终Maple只读lint:check及三仓diff检查均通过。补充Git大小写核验：实际跟踪date/picker/picker.vue，扫描／文件系统为Picker.vue；按真实小写路径取HEAD，其hash与本批未改前f649d8a…完全一致，最终diff只有本批36增7删，因此未接管原有修改。不得仅凭大写git pathspec无输出断定clean。一次父workspace numstat无仓库错误已纠正，首次组合文档补丁上下文失败后按原文重放，均非产品／测试失败。

三候选核对：单值Picker、范围Picker、MapleYearPickerPanel均无重叠工作树改动，仍在真实Date展示链使用，不误删旧内部实现。本批只处理单值Picker；stub PickerPanel隔离并行面板／header／calendar。有效11项旧基线9失败／2对照：取消／已消费旧回调清新预览，disabled／readonly／previewShortcut／open／modelValue变化仍留timer，停用与跨激活旧清理。正常100ms不提交模型及普通卸载取消原本通过；组合断言不等于九个独立缺陷。

100ms为interaction-delay悬停宽限，不是CSS完成时长，不因reduce跳过。私有代次＋一次消费守卫timer，当前可见／启用／只读／previewShortcut／模型同步失效并清预览；停用／卸载取消，激活不续旧等待。保留hover需当前mounted／active／可用；预览setter重入后复核，不清新输入草稿。保留100ms／global timer归属、公开选择确认API／CSS Token；其他select／confirm／input保留命令、范围预览和Maple年面板尚未认证。

补4资格入口＋1重入后**16专项通过，exit0、11.25s；日期／范围受影响154项31文件通过，exit0、93.81s**。首修专项进程在补测试之后才collect，实际已跑16，不编造单独11通过中间结果；16以外138为当前既有／并行回归，不记本批新写。Cedar配置声明类型与两次受影响--no-ignore无修改lint通过。共享29项全通过，分类CLI163/15通过；Maple只读lint:check结果见证据。实际Picker／KeepAlive＋stub面板／受控100ms队列和descriptor恢复为JSDOM层，不是原生hover／OS／跨document或全Date集成，真实新增0。Vue技能用于原timer、停用卸载和夹具清理。无独立Less／构建／浏览器复跑。

**分类保持30/33族90.9%，剩Date／Form／Picker三族9.1%；72文件、163/178提示91.6%，剩15条8.4%，分母不变**。Date剩范围预览1＋Maple年面板1，Form4／Picker9；只更新单值Picker库存427→453，26其他漂移不刷新。范围Picker／Maple年面板hash保持既有clean快照，不把未交接并行面板当已稳定。下一批可按文件边界继续范围预览，然后独立年面板。

上批Cedar FilterForm／Form目录5差异块继续保留，Maple两页匹配只属上批实测，本批无相关样式变化不机械重复检查／生成覆盖。Map正式SDK、144原生200%／Safari／Firefox环境组及Button白字2.305:1非AA设计例外保持，仍需原已说明的owner交接／SDK契约／可响应环境，未新增权限需求。共享规范、Cedar指南、Maple中英指南、DatePicker／MapleDate文档、Changesets／独立OpenSpec和[逐组／hash证据](./evidence/date-shortcut-preview-2026-10-16/results.json)同步。无新聊天／子代理、提交／推送／发布、软件／权限／自动化修改。


## Cedar TimeColumn生命周期／Time运行时候选分类收口（2026-10-16，07:28 UTC起）

起点TimeColumn无工作树修改，hash仍2d11fee…；继续私有helper阶段，不重复旧NavMenu。有效11项基线9失败／2对照：隐藏／停用／卸载仍滚动、旧visibility续体盖新value任务、重复续体、inactive／移除／现禁用item保留点击和几何卸载后写入。正常100ms线性及当前选择、Vue已阻止卸载实例通知原本通过；组合探针不称九个独立缺陷。

组件接管私有取消器：mounted／active／disposed资格与同步value／visible／list失效，post-render排visibility等待且按原代次一次消费；offsetTop后复核原root／value／元素。激活对齐当前值不重放旧动画，保留点击核对可见性及原item成员／禁用；原item注销不删除不同item的同值替换，卸载释放缓存。Vue技能用于停用／卸载、原资源和descriptor清理。保留100ms线性／0ms对齐、公开API／CSS Token，逻辑取消不删除Vue队列，也不回滚已写偏移；同item引用回调任意乱序仍未认证。

首修组件11＋工具14＝25项通过（2文件，5.12s）。补新激活／旧续体跨激活／键盘与隐藏点击／移除引用／同值替换5项后，**组件16专项、工具14专项；受影响Time149项30文件通过，exit0、73.95s**。相对上批131项新增16本批组件＋2并行step-demo用例，不记18新写测试或缺陷；并行step文件未改。Cedar配置类型与受影响--no-ignore lint通过，最终两源码／测试hash吻合受测版本。Maple仅Markdown，本轮不机械重跑根lint／类型；前批通过不冒充本轮。共享29项全部通过、分类CLI162/16通过；无独立Less／构建／Scheduler或真实浏览器／OS复跑，真实新增0。实际组件／KeepAlive＋受控Vue nextTick／RAF／几何不是原生键盘／滚轮／OS／adopt或全族并行面板验收。

**当前30/33族分类收口90.9%，剩Date／Form／Picker三族9.1%；71文件、162/178提示91.0%，剩16条9.0%，分母不变**。Date3／Form4／Picker9；只刷新已审TimeColumn库存76→89。Time源候选归档不代表并行Time面板／Maple滚轮已稳定或整组件所有协议通过；两端Form与MaplePicker源码hash保持原快照，未接管。干净Date根级消费者仍可按依赖边界继续，重叠区域仍需具体source＋test交接／冻结或明确授权。

保留上批实际token-catalog失败：Cedar FilterForm声明／Form消费路径5差异块，Maple两页匹配；本轮无该样式变化，不机械重跑／生成覆盖。26其他库存漂移、Map正式SDK清理／异步契约、144 Chrome原生200%／Safari／Firefox环境组不变，不重复无变化超时入口；Button白字2.305:1仍非AA例外。共享规范、Cedar指南、Maple中英指南、TimePicker／MapleTime文档、既有Changesets／OpenSpec同步。[基线、最终hash、分层验证及边界](./evidence/time-column-lifecycle-2026-10-16/results.json)。无新聊天／子代理、提交／推送／发布、权限／软件／自动化修改。


## Cedar Time私有滚动任务／四族并行稳定性复核（2026-10-16，07:14 UTC起）

当前正式分类**29/33族87.9%，剩Date／Form／Time／Picker四族12.1%**。本批只登记此前clean的Cedar私有Time滚动工具2提示；**70文件、161/178提示90.4%，剩17条9.6%，分母不变**。剩余Date3／Form4／Time1／Picker9。TimeColumn仍待watch／nextTick、保留命令及停用卸载取消器接线，不因工具通过提前归档整族；分类进度不是全库或原生验收率。

有效旧实现基线10项9失败／1正常100ms线性对照，使用实际已安装b-tween0.3.3而非mock；失败覆盖零／无效时长、旧tween覆盖新任务、重复帧、iframe owner及初始／动态reduce，断言重叠不称九个独立缺陷。私有WeakMap任务／逐帧一次消费与取消器隔离替换、保留交付及读写重入；owner-window调度，零／负／非有限时长及初始reduce不排帧，动态reduce下一帧收束。取消保持当前偏移，不提交选择；正时长线性／调用方100ms、公开API／CSS Token保持，其他格式／时间规则导出与HEAD字节一致。

首修10专项通过，补取消幂等／旧取消器／getter与setter重入后14专项；最终**Cedar Time 131项28文件通过、exit0、28.41s**，含并行现有用例不当本批新写。配置类型、受影响--no-ignore lint和Maple根lint通过；共享29项全通过、分类CLI161/17通过。一次额外lint从workspace根误发，因无package退出1，后在正确Cedar包根复核；不是产品失败。JSDOM受控RAF／iframe／媒体和descriptor恢复独立记录，真实浏览器／OS新增0，无独立Less／构建／Scheduler整套重跑。Vue技能落实任务和夹具原资源清理，未声称组件停用接线已完成。

**四族尚无稳定交接依据**：Form两端主文件最后写入06:42:47UTC（上海14:42）；Maple Time边界示例07:10:08UTC（15:10）仍变，面板／日期panel、header／calendar与Picker核心／props／键盘测试／文档有并行修改。Cedar Form真实跟踪路径为小写form.vue，不能用大写pathspec漏看。干净TimeColumn及Date根级消费者可按文件独立推进；不以全族dirty无限阻塞，也不把mtime未变当交接。需要并行负责人／用户明确具体source＋test可审／冻结边界，或授权具体重叠文件接管；本批未改这些产品文件。

**新共享门禁阻塞**：当前token-catalog --check退出1；只读实际编译／render比较定位Cedar FilterForm声明与Form消费路径共5差异块，Maple中英两页匹配。相关FilterForm源码／style／token处于并行修改，本批未改也不自动生成覆盖；先待负责人稳定并人工核对，再应用生成补丁。上一批3页匹配保留历史，不沿用为当前通过。26处其他CSS／日期库存漂移不刷新，不声称全局motion-themes通过；Map正式SDK仍需provider／清理与异步身份契约；144组仍需可响应Chrome原生200%入口、Safari受支持控制、Firefox真实安装路径及控制环境，不装软件／改权限。Button白字2.305:1非AA设计例外保持。

共享规范、Cedar指南、Maple中英指南、CedarTimePicker及MapleTime边界文档、Changesets／独立OpenSpec同步。[有效基线、hash、分层验证与具体所需条件](./evidence/time-scroll-task-2026-10-16/results.json)。未新建聊天／子代理、提交／推送／发布或改权限／自动化。后续安全工作：clean TimeColumn，再按依赖边界审clean Date入口。


## 四处分类hash人工重验收口（2026-10-16，05:38 UTC起）

此前四份Ripple／VirtualList并行源码已完成差异阅读，但其当前版本的mouse／measurement与旧生命周期组合尚未实际重跑；这仍是可安全推进的证据工作，不需接管产品实现。逐份完整重读四源码及两端use-size／item，测试前后四主源码hash均与之前漂移快照一致。只运行现有专项／消费者，不新增或修改产品／测试源码，不将并行修改记成本批修复。

Cedar **83项11文件通过、exit0、6.85s**：Ripple31、VirtualList／List45、Tree组合7。Maple **74项9文件通过、exit0、20.98s**：Ripple36、VirtualList／List38。两端各含既有11调度／12动效、3鼠标、15生命周期及2测量；新增List demo测试也来自并行工作，不记本批新写或新缺陷。旧变更前基线保留；本批没有新产品失败基线或产品修复。

Ripple新增800ms是Date.now触摸兼容门槛，不是新timer／CSS duration，统一入口仍task-dispatch；VirtualList实测行高、commandedScroll自身scroll校正和响应式padding仍为nextTick state-settlement。现手动更新四份已审hash／说明与四行库存（Ripple65→66两份，VirtualList Cedar192→200／Maple218→232），不自动刷新26处其他漂移。既有15项证明取消／替换／停用／卸载／旧交付及保留命令的受测路径；两项测量仅证明正常bounds／visible-auto和晚padding，不认证任意破坏性几何重入、每种原生self-scroll顺序、可信输入、adopt／OS或Ripple KeepAlive停用。Vue技能用于核对原资源及夹具清理边界。

共享最终**29项全部通过、exit0**，分类CLI当前159已分类／19未分类通过，3生成页匹配；69份登记源码的当前hash门禁恢复，四份旧hash不再是当前阻塞。中间首选测试路径漏Message四项且元数据仍引用65行为24/25；补正确文件后28/29仍因65→66失败；按原行核对修正后最终29/29，不当产品缺陷或掩盖失败历史。Maple根lint结果见本批证据。无API／Token／产品修改，不重跑类型／Less／构建或已通过Scheduler全套。

**分类不变：29/33族87.9%，剩Date／Form／Time／Picker四族12.1%；69文件、159/178提示89.3%，剩19条10.7%，分母未变。** 本批解除的是四份登记hash门禁，不是新增四族分类／全库或原生验收。26库存漂移、仍在变化的Form／日期／Time／Picker、Map正式SDK、144环境组及Button白字2.305:1设计例外保留，不声称全局motion-themes通过。真实浏览器／OS新增0。共享规范、Cedar指南、Maple中英指南、List／Ripple文档、Changesets及既定OpenSpec同步。[逐份hash／测试／门禁与未认证边界](./evidence/classification-revalidation-2026-10-16/results.json)。无新聊天／子代理、未提交／推送／发布或改权限／其他自动化。

## Scheduler 测试夹具计时器恢复／两模式整套复验（2026-10-16，04:00 UTC起）

只读当前安装Vitest0.22.1确认：mockRestore重置spy行为但不恢复global属性；fake-clock uninstall根据当前函数hadOwnProperty标记恢复或删除属性。隔离1项有效基线失败，原clearAllTimers／restoreAllMocks／useRealTimers之后setTimeout描述符为undefined；失败探针finally恢复原描述符，不污染进程。它是本聊天新增测试夹具问题，不是workbench五个产品缺陷，不据此改产品业务等待或运行器／依赖。

四份本聊天计时测试（Event managed／drag、TimeGrid range、now）在fake clock前捕获四个全局timer描述符，卸载owner后清fake timer／mock，并以finally恢复；owner清理抛错也继续恢复，TimeGrid几何descriptor仍独立恢复。新增3项（全部／timeout-only／interval-only）恢复专项；受影响63项6文件通过，实际先执行drag再执行workbench，补足上一批23项顺序不足。受影响--no-ignore lint通过、源码／测试hash检查通过。

修复后有依据复验两种原执行模式：**串行401项63文件通过、exit0、58.87s；默认线程401项63文件通过、exit0、65.43s**，均无close告警。不相加为802个用例；原371→401含随后native13、TimeGrid14及本批cleanup3，不是30个新缺陷。旧正常370/371超时／串行365/371及旧探针结果保留为历史；最新整套复验不再失败，但未证明旧超时只由负载或该清理问题造成，不提高原5000ms阈值、不机械继续重跑。Maple根lint最终结果见本批证据。

产品源码／API／Token／默认策略未改；类型／Less／构建未重跑，配置声明类型不覆盖这些测试。共享套件不机械重跑：逐份当前hash仍只有两端Ripple／VirtualList四份并行漂移，不自动刷新；另26处库存漂移、Date／Form／关联Time／Picker、Map正式SDK及144环境组保持，Button白字2.305:1例外不变。真实浏览器／OS新增0。Vue技能直接影响夹具finally与原资源恢复，没有覆盖并行产品源码。

**分类仍29/33族87.9%，剩4族12.1%；69文件、159/178提示89.3%，剩19条10.7%，分母未变。** 四族Date／Form／Time／Picker仍保留，不与四份hash漂移相加。共享规范、Cedar指南、Maple中英指南、Scheduler README、Changesets及既定TimeGrid OpenSpec后续项同步。[基线／六测试源码hash／两执行模式证据](./evidence/scheduler-timer-fixture-2026-10-16/results.json)。未建聊天／子代理、未提交／推送／发布、未改权限／其他自动化。

## 分类漂移只读复核／Scheduler 有界诊断（2026-10-16，03:52 UTC起）

逐份核对69份登记源码，仍只有两端Ripple与两份VirtualList共4个hash漂移，当前hash与上一批所记一致。对照工作树与HEAD的差异（不是已审快照的逐字差异）：Ripple包含鼠标入口、800ms触摸兼容去重、document mouseup／window blur绑定；VirtualList包含实际行几何、commandedScroll校正、响应式sizeMap与行index标记。两端各3项mouse和2项measurement新测试定义已只读，但本批未运行这些并行测试，不能给当前hash授予通过或自动刷新分类。Vue技能用于核对新增资源／停用卸载边界，未覆盖并行源码。

Scheduler旧串行错误的消费点在workbench-model.ts:506的prepare等待；为何setTimeout变成非函数仍未确定。仅运行独立拖动14项＋workbench9项，--threads false共**23项2文件通过、exit0、2.86s**。运行器实际先执行workbench、后执行event-drag；所以本次不证明event-drag清理后workbench仍正常，不排除顺序污染，更不能抵销历史完整370/371超时及串行365/371失败。不改产品／测试／超时阈值，不机械复跑全套。

分类仍**29/33族87.9%，剩Date／Form／Time／Picker四族12.1%；69文件、159/178提示89.3%，19未分类10.7%，分母未变**。4份hash待重验不与4族相加。26处库存漂移、Map正式SDK、144原生环境组及Button白字2.305:1例外保持；真实浏览器／OS新增0。仅同步审计／指南证据，无API／Token／组件协议变化，不新建示例、Changeset或OpenSpec来重复发布既有批次。[当前hash、阅读边界及诊断顺序](./evidence/classification-drift-review-2026-10-16/results.json)。

## SchedulerTimeGrid 范围会话／候选分类收口（2026-10-16）

TimeGrid源码起点clean，资源核心／日期／Form／Time／Picker等并行修改保留。有效10项基线8失败／2对照：旧move/up重建已取消范围、旧cancel清新选择、其他pointerId误取消、inactive旧提交、step改变旧范围、几何卸载后晚注册、旧0ms解锁及已取消350ms武装。正常mouse吸附／resource范围与原有单次up对照本来通过，不当新增缺陷。

live／rangeVersion、原root／columns和step／snap／startHour／endHour／资格隔离范围会话；本地cancel清原绑定、原hold与自己的注册位，不清替换请求。pointercancel核对pointerId；hit-test／几何读取后复核，配置sync失效包含disabled、步长、吸附和小时边界。停用／卸载取消并清点击抑制，激活只接受新手势；0ms解锁按原请求，旧回调不能解除新选择抑制。350ms／8px／5px、snap和结束小时截断、global document/window／API／CSS Token保持。

首修10专项＋既有15交互＝25通过、exit0但有close-timeout，单列历史。补当前touch／激活／正常点击解锁／目标几何取消后，**14专项，最终受影响29项3文件通过且exit0、无close告警**。Cedar配置类型和--no-ignore受影响lint通过；Maple根lint结果见本批证据。共享29项为28通过／1原有分类hash失败，3生成页匹配，TimeGrid两行独立分类通过。上一批完整370/371超时、串行365/371／timer异常不变，本批不机械重跑或增加5000ms阈值，不以局部通过称全套通过。无CSS／Maple运行时改动，不重跑Less／Maple类型，真实浏览器／OS新增0。

**按最新实际库存重算：33族中29已登记收口87.9%，剩4族12.1%；69文件、159/178提示89.3%，19未分类10.7%，分母不变。** Scheduler所有扫描runtime文件现分类；剩Date3／Form4／Time3／Picker9合计19，均保留既定并行边界。TimeGrid新增interaction-delay1／state-settlement1。只更新本行库存506／527→524／549，193文件／392CSS／178runtime不变，26处其他漂移不刷新。分类收口不是全组件／所有保留命令、完整测试或原生验收；TimeGrid全天格／重叠菜单／焦点／非range入口、可信Pointer、原生click顺序及跨document仍独立待验。

4个已分类Ripple／VirtualList源码hash漂移仍阻塞全局分类门禁，不与剩4族相加，不自动刷新、不称全局motion-themes通过。Map SDK、144环境组、Button白字2.305:1设计例外和其他并行区域保留。共享规范、Cedar指南、Maple中英指南、Scheduler README、双端Changeset／Cedar OpenSpec及[逐组／hash证据](./evidence/scheduler-time-grid-range-2026-10-16/results.json)同步。Vue技能用于原监听／timer、停用卸载及fake timer／descriptor夹具恢复。下一批可只读审查已分类4文件的实际漂移／证据与未解决测试等待点，不覆盖并行源码或机械跑完整套件；没有新增聊天／子代理、提交／推送／发布或权限／其他自动化修改。

## SchedulerEvent 入口协议／职责登记（2026-10-16，阶段三）

源码与阶段二hash一致，无新增重叠。有效10项基线7失败／3对照：inactive原生dragstart仍写transfer／通知、重复或无归属dragend、transfer.setData回调readonly重入仍start、已移除resizable／milestone句柄仍启动、停用未结束已启动协议。正常start/end、readonly可选择、inactive普通按钮点击已被实际Button阻止三对照原本通过；没有制造父级重复click修复。合成协议与数据传输spy不是可信浏览器原生拖放。

当前native请求按代次建立，结束先消费归属再通知；新native／pointer请求、配置／事件变化、停用／卸载取消旧协议。transfer effectAllowed／setData后复核资格，resize与模板共用当前resizable／非milestone条件。追加旧native end、重新激活和start-edge对照后，中间55项54通过／1失败：模板@dragend="onNativeEnd"包装在调用时读取最新ref，旧包装结束新请求。改v-on对象直接绑定当前函数后最终 **55项5文件通过且exit0**（native13／standalone14／managed13／既有pointer12／timeline-pointer3），无末尾close告警。首修49通过但有close-timeout，单列历史，不冒充最终干净运行。

Cedar最终配置类型、--no-ignore受影响lint通过；Maple根lint本轮通过且exit0。原并行date-range endpoint-lock-demo测试已变更为新的button helper，原三处格式错误随并行修改消除，本批未改该文件、不记本批修复。共享29项28通过／1旧分类hash失败，3生成页匹配；Event四行独立分类检查通过。上一批整套370/371超时、串行365/371及其timer异常继续保留，本轮只跑受影响55项，不机械复跑全库／提高5000ms阈值，也不以本轮timeline-pointer3通过抵销上批整套失败。

Event三阶段源码职责现登记：350ms两条interaction-delay、0ms两条state-settlement；**68文件、157/178提示88.2%，21未分类11.8%，分母不变**。**28/33族84.8%，剩5族15.2%**不变，Scheduler仍部分（TimeGrid2）；Date3／Form4／Scheduler2／Time3／Picker9合计21。分类登记不代表所有当前hash门禁／全套测试／全库或原生验收通过。4个已分类Ripple／VirtualList并行hash仍待重验，不与5族相加。只更新Event库存223／236／361／381→246／259／384／404；193文件／392CSS／178runtime不变，26处其他漂移保留，不声称全局motion-themes通过。

共享规范、Cedar指南、Maple中英指南、Scheduler README、双端Changeset／Cedar OpenSpec及[逐组／源码hash证据](./evidence/scheduler-event-native-2026-10-16/results.json)同步，阶段一／二待办链回阶段三。Vue技能用于原资源／停用卸载、消费归属及测试清理。350ms／8px／5px／拖影策略、global window／document、API／CSS Token默认值保持。JSDOM合成drag／Pointer、transfer spy和保留回调不是可信OS拖放、原生事件时间戳、跨文档或OS偏好；真实浏览器／OS新增0。Map SDK、144环境组、并行保留区与Button白字2.305:1例外保持。下一批TimeGrid两个非重叠消费者；未创建聊天／子代理、未提交／推送／发布或改权限／其他自动化。

## SchedulerEvent 独立拖动会话（2026-10-16，阶段二）

源码起点与阶段一hash一致，无新增重叠。初始10探针9失败／1正常对照；其中“start回调只改父级disabled ref，要求当前同步move立即停止”无效，新prop实际要等父级render才交付。该项不计产品缺陷；有效原始子集为9项8失败／1对照，未在旧源码另跑九项。其余复现取消旧move重启、旧up清替换监听、重复cancel通知、其他pointerId误取消、旧hold武装旧move、event替换旧落点、旧解锁及跨激活旧move。首修35项中34通过／1上述探针失败不称产品仍失败；改为同步修改当前event.readonly的补充探针后通过，没有为未交付父prop造同步读取API。

本地live、共享请求代次、原event／root和资格隔离会话；move／up／key／restart／blur／hold／点击解锁只消费原请求，pointercancel匹配pointerId。清理原监听和自己的闭包后再结算dragging／ghost与通知，重入新手势不会被旧up／cancel外层覆盖。几何／样式、响应式写入、start／drop之后复核。350ms／8px触摸、5px启动、160–240px拖影宽度及位置策略、global document/window和公开API／CSS Token保持。

新增独立拖动最终14专项通过（有效9＋同步readonly／touch正向／几何卸载／drop替换／激活5补充）；受管13保持通过。Cedar配置类型及--no-ignore受影响lint通过。**完整Scheduler正常线程运行370通过／1失败，共371项60文件，exit1**：既有源行回收用例5000ms超时。保持原阈值与断言，有界--threads false完整诊断365通过／6失败：同一超时另有workbench-model五项setTimeout-is-not-a-function，不能当五个已确定产品缺陷。随后原用例单独运行1通过／2未选，约2611ms、exit0；单例通过不抵销整套失败，不归因“纯负载”或声称全套通过，后续若需继续应定位等待点／执行模式而非机械复跑或提高超时。

Maple根lint本轮exit1，新增并行date-range/__tests__/endpoint-lock-demo.spec.js三处prettier错误；不修改该日期文件，不称根lint通过。共享29项仍28通过／1既有分类hash门禁失败，3生成页匹配；逐份重验仍仅两端Ripple／两份VirtualList四源码hash漂移。三仓diff检查与source／test hash通过，live本行223／236／361／381及总提示178核对一致；26处其他CSS／日期库存漂移不刷新。无CSS／Maple运行时改动，不重跑Less或Maple类型。

**登记保持28/33族84.8%，剩5族15.2%；67文件、153/178提示86.0%，25未分类14.0%，分母不变。** Scheduler尚余Event4／TimeGrid2；Date3／Form4／Scheduler6／Time3／Picker9合计25。native drag／保留click与resize/native资格仍待独立阶段，因此不提前登记Event整文件或Scheduler族，也不将已完成分支重新说成未做。数字是分类登记，不是完整测试／全库／浏览器通过率。

共享规范、Cedar指南、Maple中英指南、Scheduler README、双端Changeset／Cedar OpenSpec及[逐组hash与失败诊断证据](./evidence/scheduler-event-drag-2026-10-16/results.json)同步。Vue技能用于停用／卸载、原监听／timer、重入和夹具资源清理。JSDOM合成Pointer相关事件／几何／假时钟不是可信输入、原生拖放／跨document／OS；真实浏览器／OS新增0。Map正式SDK、144环境组、其他并行保留区、Button白字2.305:1设计例外保留。下一阶段可继续非重叠native drag／保留click审查，但不得把未解决整套超时、串行timer或日期lint隐藏；无新聊天／子代理／服务、未提交／推送／发布或改权限／其他自动化。

## SchedulerEvent 受管指针等待／finished（2026-10-16，阶段一）

Event源码起点clean。有效9项基线8失败／1正常350ms触摸等待：抬手取消后旧hold仍启动、重复hold两次通知、停用／禁用后旧hold、旧finished抑制新手势click、卸载后finished排0ms任务、Escape及blur未取消等待。首轮点击断言直接对undefined作toHaveLength只给出泛化错误，改为缺事件按空数组检查后在未改产品源码重跑，同样8失败／1对照，不据首轮错误另算缺陷。

受管等待有waiting消费位，start及finished各一次；请求代次／mounted／active／disposed与当前event／managedPointer／资格约束旧回调。新按下、配置／event替换、停用／卸载失效旧finished／解锁；Escape／blur清原document／window等待监听。sync配置失效阻止禁用后同轮重启复活旧请求。公共生命周期同时释放已有cancelGesture／detach／resetClick，但本批只认证受管分支，不将共享cleanup接线当独立拖动、native drag、样式几何或跨文档全部通过。

350ms长按为interaction-delay、0ms点击抑制结算为state-settlement；保留8px触摸移动取消阈值、global document/window归属、公开协议及CSS Token／默认值。首修9专项＋既有pointer12／timeline-pointer3共24通过；补当前finish正向结算、finished消费一次、旧unlock及新激活后，13专项和完整Scheduler **357项59文件通过且exit0**。Cedar最终配置类型、--no-ignore受影响lint通过；共享29测试28通过／1既有hash门禁失败，3生成页匹配。Maple根lint实际结果见逐组证据；无CSS／Maple运行时改动，不重跑Less或Maple类型。

**登记保持28/33族84.8%，剩5族15.2%；67文件、153/178提示86.0%，25未分类14.0%，分母不变。** Event四提示仍待整文件分类，不因受管13项通过提前登记；Scheduler共6条（Event4／TimeGrid2）。Date3／Form4／Scheduler6／Time3／Picker9合计25。只审阅更新Event库存209／220／313／323→223／236／336／346，193文件／392CSS／178runtime不变；26处其他CSS／日期漂移保留。4个已分类Ripple／VirtualList hash阻塞不自动刷新，不称全局motion-themes或分类全链通过。

共享规范、Cedar指南、Maple中英指南、Scheduler README、双端Changeset／Cedar OpenSpec及[逐组／源码hash证据](./evidence/scheduler-event-managed-2026-10-16/results.json)同步。Vue技能用于停用／卸载、一次消费及夹具fake timer／spy清理。真实组件／KeepAlive、合成事件和模拟计时不是可信Pointer／触控／原生click顺序或OS；新增真实浏览器／OS0。144环境组、Map正式SDK、其他并行保留区及Button白字2.305:1设计例外保持。下一批独立Event拖动／native drag与保留事件，再审TimeGrid；未创建聊天／子代理、未提交／推送／发布或改其他自动化／权限。

## Scheduler 时间线指针帧／会话生命周期（2026-10-16）

use-timeline-pointer.ts起点clean（原hash见证据），没有覆盖资源核心、日期／Form／Time／Picker或两份VirtualList／Ripple并行改动。有效8项基线7失败／1正常边缘滚动对照：重复帧再滚动并分叉、取消旧帧结束新手势、停用仍有帧／旧交付、inactive及disposed保留begin、几何读取中取消仍滚动、start回调取消仍发布ghost。重叠用例不等于7个独立缺陷。

统一RAF调度入口、每帧交付前消费身份；会话generation及mounted／suspended／disposed隔离旧帧、旧move／blur／nextTick。几何、资格回调、start／drop及响应式ghost写入后复核；清理先摘旧闭包，再通知finished，重入替换不能被旧cleanup覆盖或旧end清掉。停用释放帧／原监听，激活不补播旧手势，仅接受新begin。40px边缘／12px每帧、5px阈值、现有拖动公开协议与CSS Token不变；保留原global document/window/RAF归属，不把本批称iframe／跨文档修复或原生reduce策略验收。

首轮修复后8专项＋既有3集成通过。补激活新手势、取消后的nextTick、旧move监听和finished重入后12专项通过，完整Scheduler **344项58文件通过且exit0**。Cedar配置类型、受影响lint及Maple根lint通过且exit0；共享29项仍28通过／1失败，新指针行独立检查通过，3生成页匹配。逐份hash核对仍仅两端Ripple／两份VirtualList共4文件待重验，不自动刷新，不因随后目录命令exit0声称全链通过。三仓diff检查及证据JSON／剩余提示合计核对通过；无CSS／Maple运行时修改，不重跑Less或Maple类型。

**登记28/33族84.8%，剩5族15.2%；67文件、153/178提示86.0%，25未分类14.0%。** 两处RAF合并为一处，分母179→178，分类新增1提示；未分类27→25包含结构变化，不是额外两个缺陷／组件验收。Scheduler仍部分，剩6条（SchedulerEvent4／TimeGrid2）；Date3／Form4／Scheduler6／Time3／Picker9合计25。其他26处CSS／日期库存漂移不刷新，仅本文件75／131→56与平台runtime98→97，193文件／392CSS不变。登记比例不是当前全局门禁、全库或原生验收率。

共享规范、Cedar指南、Maple中英指南、Scheduler README、双端Changeset／Cedar OpenSpec和[逐组／hash证据](./evidence/scheduler-pointer-lifecycle-2026-10-16/results.json)同步。Vue技能用于停用／卸载清理、回调归属和夹具恢复。实际helper／KeepAlive＋受控RAF／几何／合成MouseEvent不是可信Pointer输入、帧级像素、owner iframe或OS；真实浏览器／OS新增0。Map SDK、144环境组、并行保留区和Button白字2.305:1设计例外保持。下一批按文件重叠核对Event／TimeGrid，不接管资源core。无新聊天／子代理／服务、未提交／推送／发布或改权限／其他自动化。

## Scheduler 虚拟行双阶段恢复生命周期（2026-10-16）

TimelineRows起点clean，按文件边界推进，没有接管Scheduler资源核心／并行测试、Form／Date／Time／Picker。有效7项基线4失败／3对照：停用发生于子scrollTo时旧第二阶段覆盖视口、inactive旧scroll写heading、旧handler跨重新激活、第二阶段行几何内卸载后继续读取viewport。不是4个独立缺陷。初始未正确stub CVirtualList，以及在首阶段Vue渲染flush内同步卸载产生的Dep.nextDep夹具错误均不计有效产品基线；改用受控子列表、第二阶段异步几何探针。

增加mounted／active／disposed与恢复代次、数据／options／layout身份、具体列表／viewport身份复核；两次nextTick及几何读取后只允许当前请求写入。scroll回调每次激活独立绑定，并核对事件来源是当前列表；中断恢复标dirty，激活新建当前数据恢复，不补播旧offset。原anchor／索引回退、横向位置、公开API／CSS Token／默认几何保持。136行scrollTo登记state-settlement，不是可因reduce省略的动效。受控VirtualList隔离当前下游并行修改，不能当下游新验收；父夹具inactive props延迟到激活才交付，直接向缓存子组件交付props仍单列待验。

追加激活一次新恢复、新scroll有效和替换列表旧事件无效后，专项10项通过；完整Scheduler **332项57文件通过且exit0**。Cedar配置类型、明确--no-ignore的受影响lint、Maple根lint通过。共享29项为28通过／1失败，仍是两端Ripple／两份VirtualList共4个已登记源码hash漂移阻塞；不自动更新。新TimelineRows单行分类检查通过，3生成页匹配。没有CSS改动，不重跑Less或Maple类型；真实浏览器／OS新增0，JSDOM／KeepAlive／受控几何与子列表不能替代原生验收。

**登记28/33族84.8%，剩5族15.2%；66文件、152/179提示84.9%，27未分类15.1%，分母不变。** 剩余Date3／Form4／Scheduler8／Time3／Picker9合计27。登记不是当前全局hash门禁、全库或浏览器验收率。四个已登记文件待重验不与剩5族相加。只更新本行库存116→136，不刷新26处其他CSS／日期漂移，不声称全局motion-themes通过。

共享规范、Cedar指南、Maple中英指南、Scheduler README、双端Changeset／Cedar OpenSpec及[逐组证据](./evidence/scheduler-timeline-restore-2026-10-16/results.json)同步。Vue技能用于生命周期失效与夹具卸载／spy恢复。Map正式SDK、144组原生200%／Safari／Firefox环境阻塞、Button白字2.305:1设计例外继续保留。下一批按实际重叠边界审查SchedulerEvent、TimeGrid或指针消费者，其他安全工作不因全局门禁停止。未创建聊天／子代理，未提交／推送／发布或改权限／其他自动化。

## Scheduler 依赖连线测量生命周期（2026-10-16）

SchedulerDependencies源码起点clean，无并行重叠；资源core／README原并行内容、容量示例测试及Form／日期／Time／Picker改造保留。有效9项基线8失败／1正常连线与scroll合并对照：旧帧在卸载／消费／换host后继续读几何、停用未释放、旧observer／scroll跨绑定、host清空留连线、iframe宿主仍用全局RAF。重叠用例不是8个独立缺陷。

原host.ownerDocument.defaultView申请／取消RAF并创建ResizeObserver；scroll处理器与observer由原绑定释放。binding、frame、render代次隔离旧监听／已消费帧／nextTick；帧消费后读取，几何后复核，换host／数据及停用／卸载使旧任务失效，缺host清空路径，激活新绑定重新测量。保留路径坐标／裁剪、ARIA和API／CSS Token，无默认视觉值变化；必要measurement-scheduling不因reduce跳过。

首轮修复后的7个夹具错误是探针只绑定运行器全局window、未拦真正document.defaultView的RAF／observer；改为同时拦实际owner并恢复两处原descriptor后9项通过。没有把这7项夹具错误记产品缺陷或退回全局窗口实现。追加宿主几何读取中卸载、inactive observer／fresh activation和依赖替换后，12项专项通过；完整Scheduler322项56文件通过且exit0。较上一批309增加13，包含本批12项和并行容量示例增加1项，不能全部算本批新增。Cedar配置类型通过；组件被默认eslint ignore，明确--no-ignore后组件与测试lint通过，不把忽略warning称源码已检查。

共享29项仍28通过／1失败：两端Ripple／两份VirtualList的4个既有hash漂移仍阻塞全局分类门禁，不自动刷新。新连线行独立分类检查通过；3生成页匹配、三仓diff检查通过。Maple根lint通过且exit0，无CSS改动不重跑Less／Maple类型。共享规范、Cedar菜单、Maple中英菜单、Scheduler README独立说明、双端Changeset／Cedar OpenSpec和[逐组／前后hash证据](./evidence/scheduler-dependency-lifecycle-2026-10-16/results.json)同步。

**登记28/33组件族84.8%，剩5族15.2%**；65文件，151/179提示84.4%，28未分类15.6%，分母不变，Scheduler仅部分分类、剩9条。Date3／Form4／Scheduler9／Time3／Picker9合计28；登记比例不是当前全局门禁或全库／生命周期／浏览器通过率。只更新本次库存55→144，193文件／392CSS／179runtime不变，26处其他漂移不刷新。4个已登记文件重验不与5族混加。

Vue技能用于原监听／observer／owner RAF清理、停用／卸载和探针恢复。实际Vue／KeepAlive、受控几何／observer／RAF及JSDOM iframe不是原生浏览器／OS、字体布局或同节点跨document adopt；新增真实浏览器／OS0。144环境组、Map正式SDK、并行保留区及Button白字2.305:1例外继续保留。下一批核对无重叠SchedulerEvent交互计时和TimeGrid／TimelineRows测量，再按文件边界推进；不因旧hash门禁阻塞停止其他安全工作。无新聊天／子代理／服务、未提交／推送／发布或改权限／其他自动化。

## 当前进度与 Scheduler 时钟生命周期（2026-10-16）

本轮重新按实际文件边界核对：此前Map批把Scheduler整族归为并行保留过宽，并非所有剩余工作都真正阻塞。资源core／交叉资源测试和既有README修改保留；use-now.ts及新增专项没有并行重叠，可以安全审查。本批不接管Form／日期／关联Time／Picker，不改Scheduler资源核心，不刷新其他26处库存漂移。

**分类登记28/33组件族84.8%，剩5族15.2%**；64登记源码文件，150/179调用提示83.8%，29条未分类16.2%，分母未变。本批新增1条business-clock（累计8），Scheduler仍部分分类，不提前归档整族。收尾发现4个既有分类源码文件因并行修改待重验，登记比例不代表所有记录仍满足当前hash门禁，更不是全库／生命周期／真实浏览器通过率。

| 剩余组件族 | 待分类提示 | 当前处理边界 |
| --- | ---: | --- |
| Date | 3 | 日期并行开发与库存漂移保留 |
| Form | 4 | 异步校验／示例等并行改造保留 |
| Scheduler | 10 | use-now已完成；其余测量／指针文件先检查重叠，可安全的继续，资源核心不接管 |
| Time | 3 | 关联日期／时间面板并行改造保留 |
| Picker | 9 | Maple键盘／禁用等并行改造保留 |

另有不计入“剩5族”的待验边界：已分类Map正式SDK运行时仍缺失，活跃SDK取消／监听／异步结果待适配器契约；144组Chrome原生200%／Safari／Firefox因支持控制／安装环境阻塞，不重复超时入口；26处其他CSS／日期库存漂移不自动接管。Button on-dark2.305:1仍是用户接受的设计例外，不宣称AA或降低其他文本阈值。

新增分类门禁阻塞：Cedar／Maple的ripple/index.ts及两份_components/virtual-list-v2/VirtualList.vue共4个已登记文件hash改变，需逐份重读并核对并行归属；本批不直接刷新哈希或覆盖其产品改动。这4文件的重验与5个未完成族是两种统计，不能相加当9个组件，也不与原26处CSS／日期漂移混加。后续可先记录并行归属，安全时重验；Scheduler无重叠消费者不因此停工。

useSchedulerNow的30000ms是当前墙钟业务刷新，不是CSS动效Token。有效基线7项6失败／1节奏对照：停用仍计时、inactive配置重启、disposed／disabled／跨激活旧interval写入、旧visibility绑定替换新时钟。修复mounted／active／disposed及interval代次，按原document移除独立visibility绑定；激活读取当前时间、不补播遗漏tick。interval合法周期交付不按timeout一次消费；响应式写入重入卸载后不再排interval。没有公开API／Token／30秒默认节奏改变。

追加重入卸载、原监听移除／新身份与隐藏页旧交付后，10项专项通过；Scheduler完整309项55文件通过且exit0（包括既有4项now-indicator／SSR）。不把既有核心／并行测试通过当本批修复，也不把6个重叠失败用例算6个独立缺陷。Cedar配置类型、受影响lint及Maple根lint通过；共享29项为28通过／1失败，失败是上述外部分类hash门禁，不能因后续目录命令exit0称全链通过。Scheduler新行独立分类检查通过，3生成页匹配，三仓diff检查通过。无CSS变更，不重跑Less矩阵；Maple只同步指南，不运行Maple类型、不造Scheduler运行时。

共享规范、Cedar菜单、Maple中英菜单、Scheduler README的独立当前时间段、双端Changeset／Cedar OpenSpec及[逐组／前后hash证据](./evidence/scheduler-now-lifecycle-2026-10-16/results.json)同步；README原有并行内容保留。只刷新本次use-now库存21→34，193文件／392CSS／179runtime总数保持，不声称全局motion-themes通过。Vue技能用于停用／卸载、监听／interval、重入与夹具恢复。实际Vue／KeepAlive、受控Date／interval／visibility为JSDOM，不认证原生时钟／OS或跨document；真实浏览器／OS新增0。

下一批先核对SchedulerDependencies连线测量RAF及其取消／卸载／旧帧，或其他无重叠Scheduler消费者；以实际文件／依赖边界推进，不因整族有并行修改就停止全部工作。未创建聊天／子代理、未提交／推送／发布、未改其他自动化或权限。

## Cedar Map SDK 边界与抑制窗口分类（2026-10-15）

Map源码起点clean，本批保持hash／产品实现不变。276行300ms（model中心变化）及454行500ms（选中地点）释放isUpdating、抑制程序化moveend反向解析，归interaction-delay，不是CSS完成等待；不新增Token，不因视觉reduce改变业务窗口。map-core运行时导入因迁移被注释，MapService／SearchService／LngLat只是环境声明，缺任一依赖时initMap先返回，未创建SDK／model watcher／moveend／两个timer。不虚构off／destroy契约，不恢复或替换SDK，不调用服务。

新增5项降级验证（分别缺三个依赖、model替换／卸载、KeepAlive）和1项300／500ms探针正向对照，连同既有render共7项2文件通过且exit0。第一轮5项因统计全部fake timer混入运行器／依赖任务而失败，只收窄到本次两种窗口并加正向对照；不记5个产品缺陷。用例只有缺依赖分支，已有依赖只是未被调用的spy，不是模拟活跃SDK通过。Vue技能用于夹具卸载、timer／spy和原global descriptor恢复。

Cedar配置类型、受影响lint格式化、分类门禁／共享29测试及3生成页通过；三仓diff检查通过。Maple根lint通过且exit0。没有CSS／Maple运行时改动，不重跑Less或Maple类型。共享规范、Cedar菜单、Maple中英菜单、Map README、双端Changeset／Cedar OpenSpec及[源码／测试hash证据](./evidence/map-sdk-boundary-2026-10-15/results.json)同步。

**28/33族职责分类84.8%，剩5族15.2%**；63分类文件，149/179提示83.2%，30待审16.8%，分母未变，原库存193文件／392CSS／179runtime不动。这不是全库／生命周期／浏览器通过率；已分类Map的实际SDK timer取消、旧回调／异步结果、监听、停用／卸载，以及MapSelect异步地址回填／定位仍单独待验。真实浏览器／OS新增0，26处并行漂移不刷新，不声称全局motion-themes通过。

剩余分类：Date3、Form4、Scheduler11、Time3、Picker9提示，合计30；均位于用户要求保留的并行区域，最新状态确有相关修改，不接管或为持续执行制造改动。需正式SDK适配器契约后再验Map活跃分支；其余等待相关状态变化或用户调整重叠范围，不机械重复无变化检查。144环境阻塞和Button白字2.305:1例外保持。未启动浏览器／服务／子任务／子代理，未改自动化、提交／推送／发布。

## Cedar Tree 滚动消费者分类（2026-10-15）

Tree源码起点clean，实际VirtualList源码与既有已审hash一致。Tree.scrollIntoView仅同步向当前子组件scrollTo转发原options，自己不排RAF／timer或CSS等待；701是声明、702是delegated-scroll，不当成两次原生滚动。实际下游已有availability／request守卫处理停用／卸载及旧校正，本批没有新产品失败复现，未制造父级重复调度器或修改两份产品源码。

新增7项真实Tree＋真实VirtualList组合验证均在原源码通过：index/top600、key/bottom390、同轮替换命令90、inactive保留命令维持37、激活新命令120、卸载后旧校正／保留命令维持37、非虚拟无操作。Tree原契约1＋过滤包含TreeSelect既有1，执行共9项3文件通过且exit0（CHOKIDAR_USEPOLLING=true）；不将TreeSelect单契约算其生命周期验收。固定30px尺寸／模拟90px viewport、stub TreeNode，未stub VirtualList。Cedar配置类型与新测试lint格式化通过；共享29测试／分类门禁及3生成页通过。Maple最终根lint通过且exit0。

共享规范、Cedar菜单、Maple中英菜单、Tree README、双端文档Changeset／Cedar OpenSpec及[源码／测试hash与逐组证据](./evidence/tree-scroll-consumer-2026-10-15/results.json)同步。Maple未发现Tree运行时，不造组件；没有API／CSS Token／默认值变更，不重跑Less矩阵或Maple类型。Vue技能用于核对已有停用／卸载清理和夹具卸载。JSDOM scrollTop属性写入／模拟视口不是原生布局、滚动／smooth／真实reduce／OS；新真实浏览器／OS0。Tree其他保留方法、loadMore和任意行高仍独立待验。

新增1候选文件／2提示（declaration-only16、delegated-scroll5），**27/33族分类收口81.8%，剩6族18.2%**；62分类文件，147/179提示82.1%，32待审17.9%，分母未变。产品hash／701／702原行和库存193文件／392CSS／179runtime不动；其他26处并行漂移保留，不称全局motion-themes或全库／浏览器验收完成。

剩6族：Date、Form、Map、Scheduler、Time、Picker。下一批优先Map两个非重叠计时消费者，先核对服务／SDK边界；Form／日期／关联Time、Picker／Scheduler和其他并行修改、144环境阻塞、Button白字2.305:1例外保持。无浏览器／服务／自动化修改／子任务／提交／推送／发布。

## Maple PullRefresh 手势、绑定与锁租约（2026-10-15，阶段二）

起点hash与阶段一一致，保留其timer／Promise修复及其他并行工作。10项有效基线6失败／4对照：touchcancel误刷新、一个实例释放误解另一个持有者的锁、target切换残留锁／旧手势、旧move／end跨激活、几何getter卸载后仍读旧event.target。普通active锁／释放、释放后move无效、外部预存class保持及inactive保留start不测量本已通过，不记新增缺陷。

touching／手势generation及原root/control/scroller身份约束输入、几何和滚动读取；取消只回到默认不刷新，新target／根节点、disabled、model替代、停用／卸载停止当前手势并释放资源。每次绑定保存原root／独立回调与epoch，旧move／end不能跨激活。根ref同步绑定，避免初始post回调取消第一段同步手势；target同步变更取消旧请求并建立新目标。测量／滚动／event.target读取后复核可用性与原身份。

私有scroll-lock helper按原HTMLElement／class计数，重复同实例加锁不重复持有，release幂等；最后持有者才移除库新增class，外部预存class不移除，Window分支选其document.body。仅协调同一模块PullRefresh租约，不把它升级为全库锁；外部中途更改同名class、重复运行时副本、默认iframe scroller发现／adopt仍另待验。辅助文件无timer／scroll扫描命中，只列hash，不虚增分类文件。

中间完整32项出现30通过／2既有立即操作失败，是本批post-watch造成第一手势取消，不归因旧测试／并行工作；改同步根绑定后原断言不动32项恢复。追加5对照（激活当前绑定、disabled单租约、外部loading释放、无start释放、重复释放不清他人锁）后，最终15手势＋17计时专项、完整37项3文件通过且exit0；Maple配置类型、受影响lint格式化及根lint通过。共享29测试、分类门禁与3生成页通过，未重跑Cedar类型／Less矩阵，未修改CSS。

共享规范、Cedar菜单、Maple中英菜单、PullRefresh双语文档、双端Changeset／Cedar OpenSpec和[逐组与两个源码hash](./evidence/pull-refresh-gesture-lifecycle-2026-10-15/results.json)同步。无公开API／Token／默认计时或下拉几何阈值变化。Vue技能用于停用／卸载、原监听全组／锁租约／假时钟／mock清理。实际组件／KeepAlive、stub图标、synthetic touch／几何与timer为JSDOM证据，真实浏览器／OS新增0；初始true model显示、动态时长／实际CSS减少动效、共享useTouch RAF和跨文档默认发现继续独立待验。

新增1候选文件／1条task-dispatch（4），**26/33族分类收口78.8%，剩7族21.2%**；61分类文件，145/179提示81.0%，34待审19.0%，分母未变。仅更新已审PullRefresh库存81→96及hash，193文件／392CSS／179runtime保持；26处其他并行CSS／日期漂移不刷新，不称全局motion-themes或全库／浏览器验收完成。

剩7族：Date、Form、Map、Scheduler、Time、Tree、Picker。下一批优先Tree／Map非重叠消费者，先核对归属；Form／日期／关联Time、Picker／Scheduler和其他并行修改、144环境阻塞及Button白字2.305:1例外保持。无浏览器／服务／自动化修改／子任务／提交／推送／发布。

## Maple PullRefresh 计时与刷新续体（2026-10-15，阶段一）

源码起点clean，未接管Form／日期／关联Time、Picker／Scheduler及并行样式。10项有效基线8失败／2对照：旧成功计时进入新加载、重复交付多排复位、卸载／停用／disabled未取消timer、跨激活旧成功、旧动画复位清新loading，以及图标等待卸载后继续写loading。正常2000ms展示＋300ms复位与正常释放一次refresh原本通过；重叠用例不当8独立缺陷。

四timer统一归属入口，pending集合及原generation一次消费，取消清timer并resolve图标等待false。modelValue／新手势、disabled、停用／卸载失效，图标await及nextTick通知核对当前身份。当前本地update:true受控回填是同请求ack，仍恰好一次refresh；外部新loading替代旧成功／复位，激活按当前model结算、不重播成功时钟，不取消用户网络请求。Vue技能用于停用／卸载、timer／Promise和夹具清理。

保留successDuration2000ms业务展示、animationDuration300ms回弹／复位、ICON_TRANSITION150ms图标参数／等待的分工，不新增CSS Token／公开API／默认值变化，不把业务等待改为CSS duration。新统一入口可描述为task-dispatch，但本族暂不登记分类；完整手势／touchcancel、滚动锁引用计数、旧监听与测量仍下一阶段。

追加7项后最终17专项／完整22项2文件通过且exit0；Maple配置类型及受影响lint格式化通过。根lint一度被本批未改的Image并行preview-rendering.spec.js两处import顺序prettier错误阻塞；只读复查确认该未跟踪文件已被并行调整后，有界复跑最终根lint通过（UTC11:36:12前完成），本批未修改该Image文件，不把其修正记为本批工作。追加外部锁探针在中间候选上1失败／16通过，修正清理仅移除本实例在原节点新增的class，保留外部已有锁；这不是原始基线额外缺陷，不宣称多实例计数完成。最终组件collect耗时较长但正常exit0，无超时失败。共享29测试／3生成页和分类门禁通过；无CSS变化，不声称重跑Less矩阵或Cedar类型。

共享规范、Cedar菜单、Maple中英菜单、PullRefresh双语文档、双端Changeset／Cedar OpenSpec和[逐组hash证据](./evidence/pull-refresh-timer-lifecycle-2026-10-15/results.json)同步。实际组件／KeepAlive、stub图标、模拟touch／几何及timer为JSDOM；不是可信触摸、完整CSS override／减少动效、共享useTouch RAF或OS，真实浏览器／OS新增0。

**族分类保持25/33族75.8%，剩8族24.2%**；60分类文件／144分类提示不变。合并四setTimeout为一处使总提示182→179（Maple84→81），当前144/179提示80.4%，35待审19.6%；分母减3是调度集中，不是额外三组件／缺陷或验收完成。仅审阅更新PullRefresh四行65／84／163／177→81，193文件／392CSS不变；其他26处并行漂移保留，不称全局motion-themes通过。

剩8族：Date、Form、Map、Scheduler、Time、Tree、Picker、PullRefresh。下一批继续PullRefresh完整手势／touchcancel、锁归属及旧监听／测量，之后选择非重叠Map或Tree；Form／日期／关联Time、Picker／Scheduler、其他并行样式、144环境阻塞和Button白字2.305:1例外保持。无浏览器／服务／自动化修改／子任务／提交／推送／发布。

## Maple SwipeCell 拖动与点击解锁（2026-10-15，阶段二）

起点hash与阶段一结束一致，保留其业务确认修复和其他并行变更。14项有效基线12失败／2对照：新手势未取消解锁、取消／重复旧解锁放行新拖动、disabled／停用／卸载未取消timer、touchcancel被结算为打开、停用保留半段拖动、inactive click、旧move／outside跨激活和无start的move。正常当前0ms解锁与当前outside关闭原本通过；重叠用例不算12独立缺陷。

解锁归state-settlement事件顺序，不是CSS动效时长；独立generation消费一次，新手势／禁用／停用／卸载取消原timer并失效旧交付。手势有独立代次与hasTouch，取消恢复开始前offset、不打开，激活不续接；响应式drag标记保证夹到相同offset后释放也还原CSS过渡。回调／几何后复核，不让open回调中的新拖动被旧unlock授权。click回调重开或卸载后旧关闭续体停止。绑定独立代次／原root与document，全组touch监听按原注册解绑，旧move／outside不能跨激活；不修改共享useTouch／监听helper。

最终21拖动专项＋18确认专项，完整48项4文件通过且exit0；Maple配置类型、最终受影响lint格式化与根lint通过。补监听清理探针初轮误取VTU通用eventListener，已过滤包装并验证实际move／outside；初轮timer ReturnType被Node重载推为Timeout，改明确DOM number，未修改配置。首轮根lint和格式化并发读到两处旧格式错误，最终格式化后完整root lint独立重跑通过，不算产品基线失败。

分类／共享29测试、3生成页通过。共享规范、Cedar菜单与Maple中英菜单、SwipeCell双语文档、双端Changeset／Cedar OpenSpec和[逐组hash证据](./evidence/swipe-cell-drag-lifecycle-2026-10-15/results.json)同步。没有新增公开API／CSS Token／视觉默认值或改变30%阈值；Cedar无对应运行时，不造副本。无CSS改动，不声称跑过Cedar类型或Less矩阵。

Vue技能用于停用／卸载、timer与原监听全组清理和夹具恢复。实际组件／KeepAlive、synthetic DOM touch及受控timer为JSDOM层，不是可信原生触摸／合成click顺序／OS；真实浏览器／OS新增0。完整测量续体、共享useTouch RAF、同节点跨document adopt、事件触发hook拒绝策略仍独立待验，分类收口不自动认证这些边界。

新增1文件／1条state-settlement（15），**25/33族收口75.8%，剩8族24.2%**；60分类文件，144/182提示79.1%，38待审20.9%，分母未变。仅审阅更新SwipeCell库存248→351及hash；193文件／392CSS／182runtime保持，其他26处并行CSS／日期漂移不刷新，不称全局motion-themes通过。

剩8族：Date、Form、Map、Scheduler、Time、Tree、Picker、PullRefresh。下一批优先非重叠PullRefresh；Form／日期／关联Time、Picker／Scheduler和其他并行样式、144环境阻塞及Button白字2.305:1例外保持。未启动浏览器／服务／自动化修改／子任务，未提交／推送／发布。

## Maple SwipeCell 关闭确认生命周期（2026-10-15，阶段一）

源码起点clean，保留Form／日期／关联Time、Picker／Scheduler与其他并行修改。初始12项夹具取错exposed入口，全部TypeError不计产品基线；纠正为实际组件公开exposed方法后，有效12项为10失败／2正常对照。复现旧确认关闭重开同侧／另一侧、旧确认越过新veto、钩子同步重入open、卸载／跨激活后提交、inactive保留open／close与disposed open、hook替换仍提交。重叠用例不等于10个独立缺陷。

每个close保存原命令代次；新open／close／touchstart、name／beforeClose／disabled变化及停用／卸载失效。不可用保留open／close不改状态或调用钩子，激活只允许新命令；几何读取后open复核可用性／原代次。禁用触发的当前close仍尊重false，显式close拒绝仍传递调用方。beforeClose为业务确认，不是CSS视觉时长，无新API／Token／滑动阈值或视觉默认值变化。

补新激活、disposed close、name替换、新touch、禁用veto与显式拒绝6对照后，18专项／完整27项3文件通过且exit0；Maple配置类型、受影响lint作用域格式化和根lint通过。共享29测试、分类门禁及3生成页通过。共享规范、Cedar菜单、Maple中英菜单、SwipeCell双语文档、双端Changeset／Cedar OpenSpec及[逐组与hash证据](./evidence/swipe-cell-close-lifecycle-2026-10-15/results.json)同步。Cedar无对应运行时，不造副本；无CSS变更，不声称重跑Cedar类型或Less矩阵。

Vue技能用于停用／卸载的确认失效与夹具资源释放。实际SwipeCell／KeepAlive及受控Promise是JSDOM证据，不是原生触摸／布局／OS；真实浏览器／OS新增0。0ms点击解锁、完整drag／touchcancel资源及旧监听交付留阶段二，不提前归档SwipeCell，不把辅助测量守卫等同完整测量验收。

**分类保持24/33族收口72.7%，剩9族27.3%**；59文件、143/182提示78.6%，39待审21.4%，分母未变。只更新已读SwipeCell库存205→248，193文件／392CSS／182runtime保持，其他26处并行CSS／日期漂移不刷新，不称全局motion-themes通过。这是分类进度，不是全库或浏览器验收率。

剩9族：Date、Form、Map、Scheduler、Time、Tree、Picker、PullRefresh、SwipeCell。下一批继续SwipeCell点击解锁／拖动资源，再看PullRefresh；Form／日期／关联Time、Picker／Scheduler、其他并行样式、144环境阻塞和Button白字2.305:1例外保持。未启动浏览器／服务／自动化修改／子任务，未提交／推送／发布。

## Maple Counter 长按重复生命周期（2026-10-15）

Counter源码起点clean，不接管Form／日期。两方向各12项有效基线10失败／2对照，共24项20失败／4对照：释放／新按／停用／卸载后旧交付、delay／repeat重复、禁用保留press及步进回调内release仍续排。两方向重复覆盖不算20个独立缺陷；正常首步700ms与lazyChange禁用长按原本通过。

每方向独立generation与消费位，释放／替换取消两计时并清句柄，旧回调不清新任务；停用／卸载取消，激活只接受新手势。hold eligibility同步观察press／lazyChange、disabled／readonly（含Form继承）、controls／方向按钮／方向禁用及数值边界；不可用立即失效。步进返回后核对代次／可用性才续排，停用保留press／直接步进无通知，增减通知中卸载不继续提交。600ms等待＋100ms重复（首步700ms）为interaction-repeat，不消费CSS duration、不改InputNumber800／150ms，不新增API／Token或数值格式协议；异步beforeChange请求身份另待独立审计。

补两方向各4对照后32专项／完整Counter55项2文件通过且exit0；Maple配置类型、受影响lint作用域格式化和最终根lint通过。共享29测试、3生成页通过。共享规范、Cedar菜单／Maple中英菜单、Counter双语文档、双端Changeset／Cedar OpenSpec和[逐组／hash证据](./evidence/counter-press-lifecycle-2026-10-15/results.json)同步。Cedar仅规范，不改对应InputNumber或伪造组件。无CSS变化，不重复声称Cedar类型／动效编译已跑。

Vue技能用于停用／卸载清理与假时钟／探针恢复；实际Counter／KeepAlive＋受控modelValue、stub按钮／icons、fake timers不等于原生触摸／click去重／跨文档／OS；真实浏览器／OS新增0。hold分类不认证所有input解析／beforeChange异步消费者。

分类新增1文件／4条interaction-repeat（8），**24/33族收口72.7%，剩9族27.3%**；59文件，143/182提示78.6%，39待审21.4%，分母不变。仅审阅更新Counter四行库存302／314／330／337→373／390／427／445及hash；193文件／392CSS／182runtime保持，其他26处并行漂移保留，不称全局motion-themes通过。

剩9族：Date、Form、Map、Scheduler、Time、Tree、Picker、PullRefresh、SwipeCell。下一批优先PullRefresh／SwipeCell等非重叠消费者，先核对归属；Form／日期／关联Time、并行样式／Picker／Scheduler、144环境阻塞和Button白字例外保持。未启动浏览器／服务／自动化修改／子任务，未提交／推送／发布。

## Maple LoadingBar 统一任务与render交付（2026-10-15）

Maple源码起点clean，Cedar无对应运行时。有效7项基线5失败／2对照：progress重复推进5%→10%、width／opacity两段render重复排队、读取对应computed style重入start后旧hide／cleanup借新generation调度；正常完成和重启拒绝旧show原本通过。

timer先核对原generation再以待执行Set.delete一次消费，拒绝旧／重复回调。afterRender按原generation与消费位逻辑失效，两段等待仍是state-settlement，不删除Vue队列。schedule允许调用方显式携带原generation，读取样式中已重启则拒绝旧阶段排队，不用最新代次替旧操作授权。维持公开API／CSS Token／默认250ms过渡、200ms显示／进度、finishDelay归一化、error300ms及300／250ms清理下限，原global window timer归属保持。

补三项重启对照后10专项，完整LoadingBar22项4文件通过且exit0；Maple配置类型、受影响lint（作用域格式化）、最终根lint通过。共享29测试与3生成页通过。共享规范、Cedar菜单、Maple中英菜单、LoadingBar双语组件文档、双端Changeset／Cedar OpenSpec及[逐组与hash证据](./evidence/loading-bar-scheduler-delivery-2026-10-15/results.json)同步；Cedar仅规范，不造组件。未重新跑Cedar类型或Less动效矩阵，因为无对应运行时／样式变更。

Vue技能落实任务取消／复用及服务节点、mock／假时钟清理；实际服务DOM＋受控nextTick／fake timers不是原生时序／OS，计算样式重入为注入探针。新真实浏览器／OS0，旧IAB6组不重复计；清理hook内重入start及任意中途CSS变化仍需独立证据。

分类新增1文件／1条task-dispatch（3），**23/33族收口69.7%，剩10族30.3%**；58分类文件，139/182提示76.4%，43待审23.6%，分母不变。只更新已审LoadingBar库存77→79，193文件／392CSS／182runtime保持，其他26处并行CSS／日期漂移不刷新，不称全局motion-themes通过；分类不是全库／所有生命周期或浏览器验收率。

剩10族：Date、Form、Map、Scheduler、Time、Tree、Counter、Picker、PullRefresh、SwipeCell。下一批可选Counter／PullRefresh等非重叠消费者，先核对归属；Form／日期／关联Time、并行样式／Picker／Scheduler修改、144环境阻塞和Button白字例外继续保留。未启动浏览器／服务／自动化修改／子任务，未提交／推送／发布。

## Ripple 统一调度交付与重入卸载（2026-10-15）

两端源码起点clean。各7项基线5失败／2对照后，追加初始wave样式读取卸载探针，在未改源码上完整各8项6失败／2对照。复现取消后创建仍执行／重新启用污染新tasker、创建／激活重复交付，以及几何／初始样式读取中卸载残留波纹；正常创建／激活和普通卸载拒绝旧创建原本通过。

schedule先核对原state，再由待执行Set.delete一次消费；禁用／卸载清集合后，旧回调不能在复用state中复活或消费新请求。创建读取几何／宿主样式后复核；wave在自身样式读取前登记，保证读取中卸载能清刚插入节点；激活样式读取后核对实例与wave，不补写已清理的opacity。保留原global window timer归属、document监听、30ms创建／20ms激活、250ms展示／删除下限和computed视觉等待，无API／CSS Token／默认值变化。Vue技能用于取消／卸载及夹具恢复，不把directive unmounted自动等同KeepAlive停用。

最终各11专项（追加淡出取消／重复、激活读取卸载），完整Cedar28／Maple33项通过且exit0；两端配置类型、最终Cedar受影响lint、Maple根lint通过。Maple新增测试首轮22格式lint错误，作用域格式化后全lint及33项完整重跑通过，不计产品缺陷。两端check:ripple独立实现／视觉规则配对和实际基础Less编译通过；共享29测试（新增task-dispatch接受但不授予原生验收）、3生成页通过。共享规范、Cedar菜单、Maple中英菜单、组件文档、双端Changeset／Cedar OpenSpec及[本批逐组与前后hash](./evidence/ripple-scheduler-delivery-2026-10-15/results.json)同步。

新增内部分类task-dispatch：统一timer入口拥有资格／消费，调用方分别拥有交互等待、状态结算与视觉完成时序，不能全算CSS duration。新增2文件／2提示，**22/33族收口66.7%，剩11族33.3%**；57分类文件，138/182提示75.8%，44待审24.2%，分母不变。两hint仍65行，库存193文件／392CSS／182runtime不刷新，其他26处并行漂移保留，不称全局motion-themes通过。分类收口不是全库／所有生命周期或原生验收率。

实际directive＋受控timer、扩展探针模拟performance、JSDOM几何／样式不等于原生触摸／OS／KeepAlive停用／同节点跨文档adopt；本批真实浏览器／OS新增0，旧IAB6组不重复计。任意中途样式变化等继续独立待验。剩11族：Date、Form、Map、Scheduler、Time、Tree、Counter、LoadingBar、Picker、PullRefresh、SwipeCell。下一批优先Maple LoadingBar统一调度取消／重复交付，先取有效基线；Form／日期／关联Time、并行样式／Picker、144环境阻塞与Button白字例外保持。未启动浏览器／服务／自动化修改／子任务，未提交／推送／发布。

## Message／Notification 反馈时钟分类补录（2026-10-15）

依据阶段六最新进度，不重复NavMenu。读取两端Message计时、Cedar Notification及服务接线，三份计时源码起点clean、hash与2026-10-13原审计完全一致。duration为business-clock展示期限：仅有限正值调度，0常驻；Message hover保留剩余期限，KeepAlive重新激活从完整当前期限开始。清理／旧回调代次、服务真实Transition完成链保持，不重复修改已完成代码；没有新增产品修复、API或CSS Token。

当前复跑Cedar Message31＋Notification17＝48项／11文件，Maple Message39项／8文件，全部通过且exit0；Maple根lint、共享28测试及3生成页通过。产品源码／类型／样式未变，本批未重新跑类型或Less动效编译，不能用旧结果冒充本轮。Vue技能用于核对已有停用／卸载清理职责。既有Message8／Notification6真实IAB仍各自独立，不再计入本批；真实浏览器／OS新增0。

新增3文件／3条business-clock（4→7），Message与Notification两族补录分类；**21/33族收口63.6%，剩12族36.4%**。55分类文件、136/182提示74.7%，46待审25.3%，分母不变；这是分类进度，不是全库或真实浏览器验收率。共享规范、Cedar菜单、Maple中英菜单、Message／Notification组件文档、两端文档Changeset／Cedar OpenSpec及[当前hash／复跑与边界证据](./evidence/feedback-clock-classification-2026-10-15/results.json)同步。

本轮同时只读Ripple／LoadingBar，发现统一调度入口仍需独立验证取消后旧回调和重复交付：当前仅源级候选、尚无有效新复现，不制造修复，也不将两族提前归档。Message服务nextTick更新身份、跨文档adopt／OS也独立于本次计时文件分类，不因整族统计自动认证。

剩12族：Date、Form、Map、Ripple、Scheduler、Time、Tree、Counter、LoadingBar、Picker、PullRefresh、SwipeCell。下一批优先两端Ripple统一schedule的取消／重复交付，或Maple LoadingBar对应入口，先建立有效基线再修复。Form／日期／关联Time、其他并行样式／Picker、26处库存漂移、144环境阻塞及Button白字2.305:1例外保持；库存193文件／392CSS／182runtime不刷新，不称全局motion-themes通过。未启动浏览器／服务／自动化修改／子任务，未提交／推送／发布。

## NavMenu 根级命令／注册收口（2026-10-15，阶段六）

menu起点hash与阶段五一致，保留前五阶段和其他并行修改。最初六项停用探针在移出后findComponent为空，修正为预存wrapper再取有效10项基线8失败／2对照；追加关闭回调卸载两项后，原源码有效12项10失败／2对照。涵盖六类inactive保留命令、disposed命令组合、旧节点注销误删替换，以及回调中卸载后继续closer／selection／expand。组合及重叠用例不当作10个独立缺陷。

公开／交互入口守卫availability，内部停用关闭cleanup不受阻；激活允许新命令。互斥关闭用快照与activation代次，新注册不在旧轮次消费、重入新轮次替代旧迭代，卸载后不继续剩余回调／写入。selection在通知之间核对生命周期／焦点请求，新selection不补发旧select。元素注销按原NavMenuNode身份保护同key替换；卸载清空四注册表并拒绝晚注册。Vue技能落实停用／卸载与注册释放，无公开API／CSS Token或视觉默认值变化；Maple无NavMenu运行时，不造副本。

最终17专项（补键盘、新注册快照、嵌套activation、selection重入、晚注册）、完整NavMenu103项7文件通过且exit0（CHOKIDAR_USEPOLLING=true）；Cedar配置类型、最终受影响lint、Maple根lint、共享28测试与3生成页通过。共享规范、两端菜单中英指南、README、Changeset／OpenSpec和[逐组证据及hash](./evidence/nav-menu-root-commands-2026-10-15/results.json)同步。实际根组件／KeepAlive＋stub子节点／observer及JSDOM／受控续体不是原生布局／键盘／跨文档／OS证明；真实浏览器／OS新增0。

**固定分类进度**：19/33族收口57.6%，剩14族42.4%，本批减少1族；52文件、133/182提示分类73.1%，49待审26.9%，分母未变。NavMenu types与menu两候选文件现均分类。新增1条declaration-only是scrollTo函数声明，optional native调用另有行为证据，不伪造扫描命中；Node／Item无命中仍单列历史hash。仅menu库存133→147及本行分类更新，不刷新其他26处并行CSS／日期漂移，不称全局motion-themes通过。

剩14族：Date、Form、Map、Message、Notification、Ripple、Scheduler、Time、Tree、Counter、LoadingBar、Picker、PullRefresh、SwipeCell。有已验未分类反馈组件，不等于14族全没做或缺陷数。Form／日期／关联Time、其他并行样式及Picker改动、144环境阻塞和Button白字2.305:1例外保留。下一批可审其他非重叠消费者或核对已验反馈族的当前源码后归档；先核对并行归属。不改自动化、不启动浏览器／服务／子任务、不提交／推送／发布。

## NavMenu 根级外部焦点接管（2026-10-15，阶段五）

本次已收到真实heartbeat，继续代码审查；只能确认本次调度已触发，不据此声称后续定时执行稳定。menu／node／item起点hash与前四阶段记录一致，保留并行工作。新增3项有效基线2失败／1正常折叠对照；根级16项原14通过／2失败。复现selection返回与响应式折叠归位抢占已聚焦的外部控件，正常移除行后归位到overflow原本通过。

排队时捕获原root／document及焦点，归位前当前外部连接控件已接管则放弃；原焦点／body未接管场景继续正常结算。折叠查询后重检代次／availability和焦点。显式context.focus仍为主动命令；沿用Vue技能既有停用／卸载失效，不新增API／CSS Token，不回滚已执行focus。Maple无对应组件，仅同步规范，不造运行时副本。

最终根级16专项／完整NavMenu86项6文件通过且exit0（CHOKIDAR_USEPOLLING=true）；Cedar配置类型、受影响lint、Maple根lint、共享28测试及3生成页通过。共享规范、Cedar菜单、Maple中英菜单、README、Changeset／OpenSpec与[本批证据及hash](./evidence/nav-menu-root-focus-2026-10-15/results.json)同步。实际根组件／KeepAlive＋stub NavNode／observer、受控nextTick和JSDOM焦点不等于原生布局／键盘／跨文档验收；真实浏览器／OS新增0。

**固定进度保持**：18/33族已收口54.5%，剩15族45.5%；51分类文件，132/182提示已分类72.5%，50待审27.5%，分母未变。NavMenu仍部分分类，根级保留命令与注册身份下一批独立审查。仅审阅更新menu库存129→133，不刷新其他26处并行CSS／日期漂移，不称全局motion-themes通过。Form／日期／关联Time、并行样式、144环境阻塞、Button白字2.305:1例外保留。无浏览器／服务／自动化修改／子任务／提交／推送／发布。

## NavMenu.Item 监听／测量／焦点（2026-10-15，阶段四）

item源码起点clean，保留menu／node三阶段修改。有效9项基线7失败／2对照，复现受控open拒绝关闭时停用仍监听、跨激活旧resize、几何getter卸载后仍注册、inactive保留close/select序列及三类焦点问题；正常测量top40px和普通卸载解绑原本通过。组合命令用例不当作两个独立缺陷。

原reference.ownerDocument.defaultView拥有resize／捕获scroll及清理闭包，每绑定独立handler／generation；正常关闭／目标变化post-watch解绑，停用／卸载直接清理，激活重绑仍打开的当前面板。测量以operation／reference／open／availability在rect和属性读取后复核，拒绝重入卸载继续提交／注册。焦点按open/close方向、task／代次／配置／reference消费一次，当前外部控件接管则不抢回。停用仍请求关闭，但保留close／select／setOpen与键盘／点击无效；公开签名、受控接受／拒绝和布局公式保持，无新API／Token，不改共享ResizeObserver。

中间79项为78通过／1关闭焦点对照失败：夹具每次重建options触发真实配置取消，改稳定options后补4对照。原实现无此配置watch，保留有效原基线7失败／2对照，不把夹具调整算新产品缺陷。最终13专项／完整NavMenu83项6文件通过、exit0（CHOKIDAR_USEPOLLING=true）；配置类型、最终受影响lint、Maple根lint、共享28测试与3生成页通过。共享规范、Cedar菜单／Maple中英菜单、README、Changeset／OpenSpec同步。[逐组、源码hash与边界](./evidence/nav-menu-item-lifecycle-2026-10-15/results.json)。Vue技能用于停用／卸载解绑和焦点任务清理。实际Item／KeepAlive＋stub Trigger／observer、受控nextTick、JSDOM几何与原owner EventTarget不是原生布局／键盘／跨文档adopt验收；真实浏览器／OS新增0。

**固定进度不变**：18/33族收口54.5%，剩15族45.5%；51文件、132/182提示分类72.5%，50待审27.5%，分母未变。Item无扫描命中，仅单列hash，不虚增分类文件／提示。根级其他保留命令、注册身份与外部焦点接管尚待审，NavMenu仍部分分类。

剩余15族：Date、Form、Map、Message、NavMenu、Notification、Ripple、Scheduler、Time、Tree、Counter、LoadingBar、Picker、PullRefresh、SwipeCell。库存不刷新，menu仍129；26处并行CSS／日期漂移、Form／关联Time、其他并行样式、144环境阻塞和Button白字例外保持，不称全局motion-themes通过。无浏览器／服务／自动化／子任务／提交／推送／发布。下一批收口根级其余命令／注册，再依据证据归档分类。

## NavMenu 节点enter／Escape焦点续体（2026-10-15，阶段三）

node源码起点clean，保留前两阶段menu修改及并行样式。原8项有效基线5失败／3对照：关闭重开复活旧enter、跨激活enter、重复enter焦点、Escape旧返回及inactive保留键盘；正常enter、禁用、卸载原本通过。先做节点代次／生命周期修复；另两项外部焦点接管在无ownsFocus的中间实现均失败，单列追加候选基线，不混成原始10项。增加当前reference.ownerDocument焦点检查，外部连接控件已接管则不抢回。

enter／Escape按节点焦点代次／active／disposed／配置与reference／Trigger身份核对；关闭／新请求／停用／卸载失效，激活只允许新命令。enter在expand回调返回、等待渲染及query目标后复核；Escape消费一次。停用键盘／点击／浮层旧入口无效，旧键盘不preventDefault。nextTick只逻辑失效，不回滚已执行focus；保留Trigger hover延迟，不新建Token／API或Maple不存在的组件。

最终12专项，完整NavMenu70项／5文件通过且退出0（CHOKIDAR_USEPOLLING=true）；配置类型、最终受影响lint、Maple根lint、共享28分类／扫描／Message／目录测试及3生成页通过。共享规范、Cedar菜单与Maple中英菜单、README、Changeset／OpenSpec同步。[源码hash、两阶段基线与边界](./evidence/nav-menu-node-focus-2026-10-15/results.json)。Vue技能落实停用／卸载与续体归属；实际NavNode／KeepAlive＋stub Trigger持久面板、受控nextTick与JSDOM焦点不是原生键盘／完整浮层／布局证明，真实浏览器／OS新增0。

**固定进度不变**：18/33族收口（54.5%），剩15（45.5%）；51分类文件、132/182提示（72.5%），50待审（27.5%），分母未变。node无扫描命中，仅单列hash，不虚增分类文件／提示。独立Item的测量／监听／焦点、根级其他保留命令／注册身份与外部焦点接管尚待审，NavMenu仍部分分类。

剩余15族：Date、Form、Map、Message、NavMenu、Notification、Ripple、Scheduler、Time、Tree、Counter、LoadingBar、Picker、PullRefresh、SwipeCell。库存未刷新，menu仍129；26处并行CSS／日期漂移、Form／关联Time、其他并行样式、144环境阻塞及Button白字例外保持，不称全局motion-themes通过。无浏览器／服务／自动化／子任务／提交／推送／发布操作。下一批独立Item，先检查并行归属。

## NavMenu 根级测量与焦点续体（2026-10-15，阶段二）

保留阶段一源码变更、未见新增重叠。最初测量选择器漏BEM双下划线，8项均未到产品逻辑，不当缺陷；纠正后有效8项基线6失败／2对照。复现inactive resize读几何、旧配置测量跨激活、clientWidth getter卸载后继续访问、inactive context.focus、旧selection焦点跨激活和未被新selection替代。正常折叠及卸载后空refs原本通过。

根级afterRender核对配置／生命周期epoch并消费一次；停用／卸载失效，激活排当前测量和roving状态。resize按operation及原root／measure身份，在clientWidth与每个rect读取后重检；不能继续旧外层测量。根级focus拒绝不可用实例，最新selection／显式focus替代旧selection返回焦点。nextTick仅逻辑失效，不撤回已执行焦点／滚动；不改共享ResizeObserver、不新增API／Token。

最终13专项，完整NavMenu58项／4文件通过。首58项断言通过、exit0但有close timeout告警；一次有界CHOKIDAR_USEPOLLING=true复跑58项通过、exit0且无该告警。配置类型、受影响lint（新增测试再次检查）、Maple根lint、分类门禁及共享28测试、3生成目录页通过。共享规范、Cedar菜单、Maple中英菜单、README、Changeset／OpenSpec同步。[逐组、源码hash及边界](./evidence/nav-menu-root-scheduling-2026-10-15/results.json)。Vue技能用于KeepAlive与卸载清理。受控nextTick、stub NavNode／observer和JSDOM几何不是原生布局／焦点证明；既有真实Node／Item单测另回归，真实浏览器／OS新增0。

**固定进度不变**：18/33族收口（54.5%），剩15（45.5%）；51文件、132/182提示分类（72.5%），50待审（27.5%），分母未变。节点enter／Escape、独立Item的测量／监听／焦点、其他保留命令及用户外部焦点接管尚待审，NavMenu仍部分分类，不提前减1族。

剩余15族：Date、Form、Map、Message、NavMenu、Notification、Ripple、Scheduler、Time、Tree、Counter、LoadingBar、Picker、PullRefresh、SwipeCell。仅更新menu库存104→129；26处并行CSS／日期漂移不刷新，不称全局motion-themes通过。Form／日期／关联Time、其他并行样式和144环境阻塞保留；无新浏览器／服务／自动化／子任务／提交／推送／发布。下一批继续NavNode与Item，先核对源码归属。

## NavMenu 原生滚动续体（2026-10-15，阶段一）

源码起点clean；Maple无NavMenu运行时。有效6项基线4失败／2对照，修复请求替代、禁用、停用与激活旧续体；正常nearest对齐与卸载后空注册表原本通过，不计新缺陷。scrollGeneration控制请求归属，配置sync失效、KeepAlive停用／卸载失效，激活只接受新请求；showOption通知后再核对，保留Promise<void>与现有对齐，不新增Token／API。nextTick仅逻辑失效，不物理取消／回滚已发生滚动。

最终8专项及NavMenu45项／3文件通过；配置类型与受影响lint、Maple根lint、28分类／扫描／Message／目录测试、3目录生成页通过且退出0。共享规范、Cedar菜单、Maple中英菜单、NavMenu README、Changeset与OpenSpec同步。Vue技能用于停用／卸载与激活隔离。JSDOM真实组件／KeepAlive与native方法探针不代表浏览器布局／paint／原生动画；真实浏览器／OS新增0。[逐组证据](./evidence/nav-menu-scroll-2026-10-15/results.json)。

**固定进度保持**：18/33族收口（54.5%），剩15（45.5%）；51分类文件、132/182提示分类（72.5%），50待审（27.5%），分母未变。NavMenu焦点恢复、node enter／Escape续体、响应式测量及其他保留命令尚待下一阶段，因此不提前归档，不能把本批局部修复说成减少1族。

剩余15族：Date、Form、Map、Message、NavMenu、Notification、Ripple、Scheduler、Time、Tree、Counter、LoadingBar、Picker、PullRefresh、SwipeCell。Form／日期／关联Time、26处并行CSS／日期库存漂移和144环境阻塞保留。仅更新NavMenu一行库存96→104，不称全局motion-themes通过；没有浏览器／服务／自动化／子任务／提交／推送／发布操作。下一批继续NavMenu非滚动续体，先核对并行变更。

## Anchor 滚动消费者、私有帧与链接注册（2026-10-15）

Anchor、私有utils、AnchorLink和context起点clean；Maple无对应运行时。原消费者15项13失败／2对照，原slide7项6失败／1对照，原Link注销／href替换2项均失败，总有效基线24项21失败／3对照。正常点击、几何getter卸载通知边界及300ms/quartOut原本通过。新owner RAF路径初次未被test-global spies控制，增加实际document.defaultView探针后重跑，不把那轮缺少callback算新产品缺陷。私有b-tween包装原来无取消句柄且不可阻止旧tick分叉，现改原目标窗口自有可取消RAF，其他b-tween／共用节流消费者未动。

保留300ms/quartOut视觉滚动策略；每帧读取当前owner减少动效偏好，直接／下一帧结束，不新增duration Token或公共API。消费者operation、binding/frame序列、change代次隔离旧finish／帧／nextTick，几何和原生写入后再核对。替换、停用、卸载、容器／boundary变化取消当前私有滚动和原owner测量帧、移除原监听；取消停在当前位置，不跳转／finish。nextTick只逻辑失效，不物理撤销／回滚已执行scroll。激活重新绑定／测量不恢复旧动画。中间同hash过度取消吞通知已复现并修正，保留一次有效pending change。

AnchorLink watch cleanup覆盖href／卸载，用原节点identity防旧注销误删同hash新节点；移除当前链接取消旧任务并重测。Vue技能落实KeepAlive、原owner取消及descriptor／原型恢复。最终Anchor31（消费者18／slide9／注册2／实际组件1／契约1），加Affix／BackTop64项11文件通过且退出0；配置类型／受影响lint、Maple根lint、demo脚本模板1份编译通过；分类／扫描／Message／目录28测试及3生成页通过。共享规范、Cedar菜单及Maple中英菜单、Anchor文档/demo/Changeset/OpenSpec同步。[逐组、四源码hash与边界](./evidence/anchor-scroll-2026-10-15/results.json)。

**固定进度**：33组件族中18已分类收口（54.5%），15剩余（45.5%），本批减少1族；51已分类源码文件。原Anchor2条待审关闭，同时新实现显式增加3条提示（测量RAF1，私有slide RAF／偏好2），分母179→182、已分类127→132（72.5%）、待审52→50（27.5%）。不能把新增提示当额外旧缺陷，也不是全组件库／浏览器验收率。NavMenu仍部分已分类，有以前验过尚未归档的反馈组件。

剩余15族：Date、Form、Map、Message、NavMenu、Notification、Ripple、Scheduler、Time、Tree、Counter、LoadingBar、Picker、PullRefresh、SwipeCell。Form／Date／关联Time保留；下一批可选NavMenu滚动／焦点测量，先核对并行归属。

仅更新Anchor审查源码行／hash及新私有helper候选；保存候选193文件／392 CSS／182 runtime，live C103/202/98、M92/214/84。其他26处并行CSS／日期行漂移保留，不称全局motion-themes通过。AnchorLink／context无扫描命中，另列hash不虚增分类文件。

真实浏览器／OS新增0。实际组件接线仍在JSDOM控制compute几何、RAF／媒体偏好，只证明立即完成后恢复测量，不能代替真实字体／布局／paint、OS偏好、跨文档adopt或原生滚动认证。144原生200%／Safari／Firefox环境阻塞未重试；未接管Form／日期／并行样式，无服务／浏览器／自动化／子任务／提交／推送／发布操作。

## Mention 镜像重定位消费者（2026-10-15）

Cedar Mention源码起点clean，Maple无对应运行时；未修改Form、日期或并行样式。有效13项基线10失败／3对照，初次exposed方法探针修正后重新取基线。正常40px定位、卸载refs清空及scrollTop getter内卸载原本通过，不计新缺陷。复现重复callback、跨关闭／禁用／停用／激活旧任务、打开后的文本变化与零原点、保留inactive输入／focus／blur及旧观察器读取。

镜像为post-render state-settlement，不是CSS动效，无duration Token。sync失效代次，post渲染捕获input实例／textarea／mirror，nextTick交付前消费一次、scrollTop读取后再核对；关闭、禁用、模式／候选／文本变化、停用和卸载失效，激活新排当前任务。nextTick不能物理取消，只撤销旧续体提交权限；已执行native scroll不回滚。样式改为当前textarea owner view读取并在声明／属性读取后重检，lifecycleEpoch隔离旧resize并保证激活新绑定正常。focus／blur搬入setup但公开签名保持；不可用保留命令无效，disabled focus/input无效而active blur仍允许。Vue技能指导停用／卸载及descriptor／原型恢复。

最终21专项＋1项实际Mention/Textarea/useSelect/Trigger组合＋2既有Mention契约；完整Cedar消费者129项／12文件通过且退出0。组合测试仅在JSDOM记录原生scrollTo调用，验证24px和0px接线，不证明真实字体／换行／IME／paint。追加样式探针曾误spy全局window，改为实际owner view后21及129全部重跑；这不是新产品缺陷。配置类型／受影响lint、Maple根lint、1份demo脚本和模板编译通过；分类／扫描／Message／目录28测试及3生成页通过。共享规范、Cedar菜单及Maple中英菜单、Mention文档/demo/Changeset/OpenSpec同步。[逐组、源码hash和进度证据](./evidence/mention-mirror-2026-10-15/results.json)。

**每批固定进度标记**：按运行时候选顶级公开目录归族、两端同名合并、排除下划线内部目录及utils，33族中17已分类收口（51.5%）、16剩余（48.5%）；上批为16／17，本批减少1族。49已分类源码文件，127/179提示已分类（70.9%），52待审（29.1%）。这是候选分类，不是全库验收率；已验未归档的反馈组件仍可能在待审中，NavMenu部分已分类，均不等于缺陷数。以后每批同时记录数量／百分比／实际验证层级。

剩余16族：Anchor、Date、Form、Map、Message、NavMenu、Notification、Ripple、Scheduler、Time、Tree、Counter、LoadingBar、Picker、PullRefresh、SwipeCell。Form／Date／关联Time保留，下一批可选Anchor，先核对并行归属；已验反馈组件也可在源码稳定后归档分类。

仅刷新Mention一行runtime库存和hash；保存192文件／392 CSS／179 runtime保持。live C102/202/95、M92/214/84，其他26处并行CSS／日期行漂移保留，不称全局motion-themes通过。本批真实浏览器／OS新增0，144环境阻塞保持未重试，无服务／浏览器／自动化／子任务／提交／推送／发布操作。

## Typography 复制反馈与省略测量（2026-10-15）

Cedar Typography源码起点clean，Maple只有工具指南无对应运行时；未接管Form、日期或并行样式。有效14项基线11失败／3对照；最初stub组件名及vnode监听读取错误的探针不计产品基线。修复重复复制多timer、旧completion清新反馈、停用／卸载保留copy、copy事件重入卸载仍排timer、禁用复制、旧／重复RAF、停用RAF及旧激活回调、inactive resize、关闭省略仍测量。正常3000ms反馈、禁用态布局测量和卸载后Vue抑制通知原本通过，不当新缺陷。

copy-delay是交互反馈等待，默认3000ms不改，不当CSS完成时长。copyGeneration与measurementGeneration消费／重入检查，停用／卸载取消timer/RAF；copyable／disabled／delay变化清反馈，ellipsis／展开／编辑变化取消测量。观察器lifecycleEpoch隔离旧绑定，并触发激活后的新handler渲染；禁用文字仍可测量，交互入口无效。原global raf/caf归属保持，无新增API／Token／样式，无跨文档或原生剪贴板承诺。Vue技能指导KeepAlive及测试资源清理。

追加copy配置、展开、重入、新旧观察器、CSS高度分支等，22专项＋3既有断言通过。中间修复一次局部ellipsis遮蔽TDZ后重跑。一次25项断言通过的运行在退出时出现旧Vitest0.22.1 fsevents原生清理断言与close timeout；独立最终复跑25项通过且退出0、无该清理错误，不把工具退出失败当作产品失败或静默通过。最终配置类型／受影响lint、Maple根lint已通过；demo脚本与模板1份编译通过；分类／扫描／Message／目录28测试与3生成页通过。共享规范、Cedar菜单和Maple中英菜单、Cedar组件文档/demo/Changeset/OpenSpec同步。[逐组与hash证据](./evidence/typography-scheduler-2026-10-15/results.json)。

**范围内覆盖率（不是全组件库验收率）**：按运行时候选顶级公开组件目录归族，两端同名合并，排除下划线内部目录／utils，共33族。本批前15已分类／18未收口（45.5%／54.5%），本批后16已分类／17未收口（48.5%／51.5%），NavMenu其中一份已分类但族尚未收口。剩余：Anchor、Date、Form、Map、Mention、Message、NavMenu、Notification、Ripple、Scheduler、Time、Tree、Counter、LoadingBar、Picker、PullRefresh、SwipeCell。有已验但尚未归档分类的反馈组件，不可说17个全没做，更不能当缺陷数。Form／Date保留，Time关联日期工作也先避开。

调用提示由125/179（69.8%）变126/179（70.4%），剩53（29.6%），累计48已分类文件。aliased raf/caf不被现有扫描命中，仅列本批额外证明、不虚增提示。仅刷新Typography一行runtime库存／hash；保存192文件／392 CSS／179 runtime保持。live仍C102/202/95、M92/214/84，其他26处并行CSS／日期行漂移保留，不称全局motion-themes通过。

本批真实浏览器／OS新增0；受控测量、模拟timer/RAF不证明可信剪贴板、真实字体布局、paint／OS。144原生200%／Safari／Firefox环境阻塞保留，未重试入口；未启动浏览器／服务／自动化，未创建子任务或提交／推送／发布。下一批优先Mention文本镜像重定位，或Anchor滚动消费者，先检查并行归属。

## 三份 Thumb 拖动会话与监听资源（2026-10-15）

承接上一批stub Thumb边界，选Cedar公共／旧目录与Maple selection-scrollbar三源码，起点clean；不接管Form／日期／样式。各18有效基线15失败／3对照（总54／45失败／9对照）：mouseup漏contextmenu、卸载／停用不清监听和dragging、inactive保留按下／track／setOffset、旧move跨结束／新手势／激活、旧end结束新手势、context取消自身未解绑、blur未取消、方向变化未取消、几何getter卸载后仍绑定、iframe误用global window、非左键启动。正常move＋普通up、active setOffset夹取与track一步本来通过，不计新缺陷。

首轮iframe方法描述符spy不兼容／Window对象比较触发Cedar旧Vitest报告器错误，不能用该轮当有效基线；加自有可恢复方法包装、布尔identity断言后重新跑Cedar36（30失败／6对照）、Maple18（15失败／3对照），再修产品。四处Maple测试清理curly规范修正后lint通过，不关闭规则、不算产品缺陷。

每手势独立代次／原track与thumb／不可变轴与起点／owner window；move/end绑定和原owner清理隔离。正常抬起、contextmenu、window blur、有效几何／方向改变、停用／卸载解除mousemove/up/contextmenu/blur全组并清dragging／mouseOffset；旧move不能驱动新会话、旧end不能清新会话。几何读取和响应式写入后再核对，防重入卸载后绑定／通知；inactive保留入口不preventDefault，非左键无操作；激活只接受新按下。等值data对象替换不终止连续拖动，max/thumbSize/ratio/方向变化会终止；偏移仍由父级新测量/setOffset结算。鼠标协议／公开API／CSS变量／颜色布局保持，无新增timer/RAF/Token。

最终各21（补等值data／几何、track重入、实际Parent＋Thumb组合），Cedar42专项、Maple21，含Scrollbar父级／Select／AutoComplete／Cedar Mention共Cedar168／Maple133全部通过。两端配置类型、Cedar受影响lint／Maple全库lint通过；Maple1032示例SFC0失败。共享规范、Cedar菜单／Maple中英菜单、Scrollbar／Select三文档、拖动生命周期demo、Changesets／CedarOpenSpec同步。[三源码前后hash、逐组有效基线与边界](./evidence/thumb-drag-2026-10-15/results.json)。Vue技能用于停用／卸载、原owner解绑及descriptor／iframe／残余监听清理。

三Thumb前后均无现有timer／scrollTo扫描runtime命中，单列受控hash证据，不虚增候选或把54待审减成51。分类仍47候选文件／125提示、54待审（不是缺陷数）；保存库存192文件／392 CSS／179 runtime不变。分类／扫描／Message契约25测试、目录3测试／3页通过；live C102／202／95、M92／214／84的其他26处并行CSS／日期漂移不刷新，不称全局motion-themes通过。

本批使用实际Thumb/EventTarget和实际父级组合，但在JSDOM控制鼠标／几何、stub父级ResizeObserver／native scrollTo，不能认证可信鼠标、实际OS blur、跨iframe拖出、同节点adopt、原生smooth／paint。保存browser证据202测试及既有证据链通过仅校验一致性，新真实浏览器／OS0。Form、日期库存漂移、其他并行样式和144环境阻塞保留，未启动浏览器／服务／自动化，未提交／推送／发布。旧章节“Thumb未验”为历史边界；当前仅新增本批受控证明。

## Scrollbar 三份同步测量与原生滚动消费者（2026-10-15）

选取Cedar公共入口、旧目录副本与Maple Select内部selection-scrollbar，三源码起点clean，不接管并行样式。各13有效基线11失败／2对照（总39项33失败／6对照）：零原点遗漏、inactive保留公共／thumb命令、inactive测量、激活后旧resize／scroll入口、禁用轴旧thumb、零viewport仍显示轴、归零不更新thumb、几何getter重入卸载仍提交／旧外层覆盖新测量。正常原生重载与卸载后refs清空本来通过，不记新缺陷。

availability、绑定epoch和同步operation／原容器归属共同约束测量、事件、原生方法；停用／卸载失效，激活读当前几何并只接受新绑定。几何getter、响应式提交／子thumb回调后再核对，旧测量不能覆盖新操作。方法搬至setup闭包保持原公开签名，无新取消API。scrollTo(0,0)与单轴0合法；测量回零也更新thumb；水平改用自身ratio（旧代码错用vertical），零／无效视口使用有限非负数据。保留20px最小thumb／15px轨道策略和原生对象透传；禁用条不等于禁止公开原生滚动。

没有新增RAF／timer／CSS Token／样式改动。同步native滚动已交付后无法由逻辑失效回滚，不声称取消原生smooth。观察器与Thumb底层被stub，本批只证明消费者边界，不认证真实observer绑定、Thumb拖动监听、paint或OS；这些可独立下一批。Vue技能用于停用／卸载、绑定和重入清理。

最终各16（补激活新命令、原生options、水平比例），Cedar两副本32专项＋公共契约，含Select／AutoComplete／Mention总126；Maple16专项＋Select／AutoComplete总112全部通过。两端配置类型、Cedar受影响lint／Maple全库lint通过；Maple1030示例SFC0失败。共享规范、两端菜单、Cedar Scrollbar及Maple中英Select文档、生命周期demo、Changesets／CedarOpenSpec同步。新增测试loop curly／动态describe标题规范修正后重跑，不算产品失败。[逐组、三源码hash与限制](./evidence/scrollbar-consumer-2026-10-15/results.json)。

仅刷新三Scrollbar运行时库存／hash；各7提示=6 native-scroll＋1函数声明declaration-only，不虚增geometry调用；累计47文件／125提示、54待审（不是缺陷数）。分类／扫描／Message契约25测试、目录3测试／3页通过。保存库存192文件／392 CSS／179 runtime保持；live C102／202／95、M92／214／84，其他26个并行CSS行／声明漂移含日期继续保留，不刷新未审快照、不称全局motion-themes通过。

保存browser证据202测试与既有证据链通过只检查一致性；真实浏览器／OS新增0。Form、日期库存漂移、其他并行样式及144环境阻塞保留，未启动浏览器／服务／自动化，未提交／推送／发布。下一批可独立审查Thumb拖动资源及其他测量／交互消费者。

## Carousel 自动播放与循环结算调度（2026-10-15）

选两端clean Carousel源码，样式和其他并行变更不接管。各14有效基线12失败／2对照：hover／停用／卸载后旧自动播放翻页、播放重复消费、inactive保留导航、旧observer激活后排队、旧settle覆盖新阶段／停用排帧／重复消费、卸载旧首帧／重复首帧分叉／旧次帧释放新noMotion。正常播放等待及当前双帧释放本来通过，不计新增缺陷。Cedar初次夹具错误导入不存在的carousel-item.vue导致0测试，纠正实际CarouselItem.vue后才取有效基线。

自动播放独立代次并在导航前消费；绑定代次隔离已解绑observer及visibility/resize/wheel事件迟交付。动效请求、轨道节点／窗口身份和每阶段消费位保护nextTick、settle timer及两帧；取消当前timer和原frameOwner RAF，即使已出队也无权覆盖新阶段。内容／配置渲染测量任务按render／binding代次失效；停用／卸载保留next/prev/to、键盘、滚轮及focus入口无效，激活建立新绑定、不重放旧任务。Vue技能落实停用／卸载、解绑与测试资源清理。

自动播放归business-clock播放节奏：默认关闭，启用true仍3000ms；数字／配置间隔及hover/focus/隐藏暂停契约保持，不当CSS时长。settle计时为visual-completion，两RAF为state-settlement；move-speed／既有CSS Token／减少动效规则不变。保留既有computed transitionDuration读取与样式不可读180ms fallback，不认证duration/delay列表、运行中时长变化、OS或跨文档。没有新公开API／变量。

最终专项各18（补render重复、停用pending render、已消费次帧、inactive键盘／滚轮不拦截），完整Carousel Cedar44／Maple45通过。两端配置类型、Cedar受影响lint／Maple全库lint通过；Maple1028示例SFC0失败。共享规范、两端菜单（Maple中英）、Carousel三份文档、生命周期demo、Changesets／CedarOpenSpec同步。[逐组、hash、夹具与保留漂移](./evidence/carousel-scheduler-2026-10-15/results.json)。

仅更新两Carousel运行时库存及源码分类；新增两文件／8提示（business-clock2、visual-completion2、state-settlement4），累计44文件／104提示、75待审（不是缺陷数）。分类／扫描／Message契约25测试、目录3测试／3生成页通过。保存库存192文件／392 CSS／179 runtime保持；live观察C102／202／95、M92／214／84，并有26个其他并行CSS行／声明漂移（含日期），不刷新未审快照、不称全局motion-themes通过。

保存browser证据202测试及既有证据链通过只检查一致性；本批新真实浏览器／OS0，受控timer／RAF／observer不是native认证。Form、日期库存漂移、其他并行CSS及144环境阻塞保留，未启动浏览器／服务／自动化，未提交／推送／发布。下一批继续测量／交互消费者；实际绘制、同节点跨文档及完整CSS时间解析另待验证。

## Card 浮起测量与回落调度（2026-10-14）

选取两端 clean Card，未改Form／日期及其他并行实现。各12有效基线9失败／3对照：过期floating／direction render、重复render、激活后旧render、重复几何测量、旧dropdown覆盖新浮起、停用／卸载后dropdown写入、inactive保留close/click仍通知。正常500ms等待与双帧结算、关闭后旧双帧不能展开、卸载取消等待本来通过，不算新增缺陷。

源变化同步失效请求；render和两计时均消费一次。回调核对active/disposed、代次、当前floating／direction及原节点，几何读取返回后再核对，拒绝测量钩子内同步卸载继续排双帧。停用／卸载取消两计时、保留close/click无效；激活按当前props发起新阶段，不恢复旧任务，初始KeepAlive激活不重复等待。既有doubleRaf Promise无法物理取消底层RAF，本批只失效旧续体写布局权限，不能称“已取消双帧”。

500ms是ripple=true交互等待，false仍0ms；公开floating-duration默认250ms同时消费于布局transition／回落恢复，opacity仍两倍。无新CSS Token／公共API／默认值／颜色语义变化；现有global timer/helper归属保持，跨文档／原生绘制／OS偏好与运行中时长改动独立待验。Vue技能用于停用／卸载、消费归属与夹具资源清理。

最终各15专项（追加初始激活、几何重入卸载、停用双帧），完整Card Cedar21／Maple44通过；两端配置类型、Cedar受影响lint／Maple全库lint通过。Maple1025示例SFC0失败。共享规范、Cedar菜单、Maple中英菜单、Card四份组件文档、浮起调度demo／Changesets／CedarOpenSpec同步。[逐组基线、源码hash与库存漂移](./evidence/card-scheduler-2026-10-14/results.json)。

仅刷新Card两行库存／hash；新增两文件／4提示（interaction-delay2、visual-completion2），累计42文件／96已分类提示、83待审（非缺陷数）。保存库存192文件／392 CSS／179运行时保留；live扫描当前C102文件／202 CSS／95 runtime，M92文件／214 CSS／84 runtime，出现25个其他并行CSS候选行／声明漂移（包含日期、carousel、checkbox、slider等），详见证据；不刷新未审快照、不称全局motion-themes通过。分类／扫描／Message契约25测试和目录3测试／3生成页通过。

保存browser证据202测试及既有证据链通过只验证一致性；本批真实浏览器／OS新增0，受控nextTick／doubleRaf Promise／fake timers／几何spies不认证native frames。Form、日期库存漂移、144环境阻塞保持，未启动浏览器／服务／自动化，未提交／推送／发布。下一批继续剩余测量／交互消费者；新增并行库存漂移等待相应归属稳定后收口，不机械刷新。

## PreviewGroup 轨道重定位与双帧释放（2026-10-14）

选取两端 clean Group 源码，保留已有 Image／样式／文档并行变更。各21项有效基线17失败／4正常对照：nextTick／首帧／次帧旧交付、消费重放、停用保留导航、关闭／停用计时未取消、激活旧计时、loop／等长图片变化、400ms误作时长上限、已知零时长、reentrant卸载及iframe owner。正常双帧、disposed open已抑制通知、自身transform完成取消、冒泡忽略本来通过，不计新增缺陷。

请求代次、active/disposed、节点／owner身份与消费状态共同隔离；取消两帧和计时使用原track owner窗口。关闭／换图（含原位编辑）／loop变化／新导航／停用／卸载失效，激活只规范化当前坐标。循环三份图片、公共方法／事件／slots保持；双帧是state-settlement，零时长仍保留。渲染后按实际computed transform/all时长＋delay重定位，列表与负delay可解析；400ms仅样式未知保底，不是上限或新Token。transitionend限定自身transform并拒绝早于新命令时间戳；未认证无时间戳旧事件及所有原生跨文档情形。

Maple轨道固定280ms／自定义曲线改消费两端既有system slow240ms／standard easing，instant／moving／reduce关闭CSS transition。编译32组、16组duration/easing成对覆写、32组instant/moving通过。最终专项各27（补原位编辑、列表delay、未知样式、旧事件、回调中新导航及重复render调度），完整Image Cedar62／Maple114通过。实现sync deep内容监听曾让Maple子图片注册递归，全量回归发现后改post结算修复；不归因并行工作。索引parse、-0、reentrant合法计时断言、编译主题路径／pointer条件与一次Maple根目录调用等探针问题单列证据，不计额外产品缺陷。

两端配置类型、Cedar受影响lint／Maple完整lint、Maple1023示例SFC（0失败）通过。共享规范、Cedar菜单、Maple中英菜单、Image三文档与轨道生命周期demo、Changesets／CedarOpenSpec同步。[逐组基线、hash、修复及验证限制](./evidence/preview-group-track-2026-10-14/results.json)。Vue技能落实停用／卸载、资源owner和测试descriptor／假时钟清理。

仅刷新两Group库存行号／hash，新增两文件／6提示（4 state-settlement、2 visual-completion），累计40文件／92提示、87未分类（不是缺陷数）；库存192文件／392 CSS／179运行时不变。扫描／分类／Message契约25测试、目录3测试／3生成页与独立编译动效链通过。全局库存仍仅Maple date-range50／90→61／105、time-range37→42漂移，未刷新日期快照，不称motion-themes全链通过。

保存browser证据202测试和既有证据链通过仅校验一致性；真实新增0，受控nextTick／RAF／fake timers／iframe owner及Less级联不是原生浏览器／OS。Form、日期库存漂移、144环境阻塞保留；未启动浏览器／服务／自动化，未提交／推送／发布。下一批继续剩余测量／交互调度消费者，先核对并行归属。

## ImagePreview 控制器交互生命周期（2026-10-14）

选取两端未分类usePreviewController，以及依赖的useInteraction输入模式helper。四源码起点clean，保留已有dirty preview API／样式／文档和私有preview-lifecycle测试；Controller原hash b2652e3de82ca81700b16860b4a1a045f47ef6b88f7d81bbd047c37a4cbcdbf1，helper原hash bf32419e7152673c4621dcd87de6bea3ffc112ba4498d70a716c5362725081fc。各17基线15失败／2对照：抬手／移动／关闭／src改变／停用／卸载后长按旧交付、inactive键盘／保留Pointer入口、旧tap清新句柄、重复长按、capture／moving未释放、激活旧计时、MQL未解绑／激活未重读／卸载旧交付。500ms正常通知与320ms内正常双击本来通过，不算新缺陷。

独立longPress／tap代次核对状态并消费一次；取消／替换不能让旧交付通知或清掉新句柄。关闭／src变化同步清输入，停用／卸载解绑键盘、取消计时、释放capture并清moving；保留输入无效，激活只接受新手势。coarse-pointer MQL在停用解绑、激活重新读，绑定代次隔离旧监听交付，mounted＋activated不重复绑定。私有tapCloseTimer更名tapTimer，320ms只清双击识别，不是延迟关闭；500ms长按、8px移动、48px滑动、24px双击距离及公开缩放／拖动API保持，不新增CSS Token。Vue技能用于停用／卸载与descriptor／假时钟清理。

专项两端17全部通过，完整Image Cedar35／Maple87通过，两端配置声明类型、受影响lint、Maple根全库lint通过；Maple1021示例SFC编译0失败。共享规范、Cedar菜单、Maple中英菜单、Image三份文档、两端预览生命周期demo、Changeset／CedarOpenSpec同步。[17组基线、四源码hash、验证与限制](./evidence/image-controller-scheduler-2026-10-14/results.json)。

分类新增2个Controller候选文件／4条interaction-delay；累计38文件／86提示、93未分类（非缺陷数），库存192文件／392 CSS／179运行时提示保持。两输入模式helper无本扫描runtime命中，纳入专项hash但不虚增候选分类数字。扫描／分类／Message契约25项、独立动效编译链、目录3测试／3生成页通过。live全局库存仍仅Maple date-range50／90→61／105、time-range37→42漂移，不刷新未审快照、不称motion-themes全链通过。

既有browser-evidence202测试和保存证据链通过只校验一致性；真实浏览器／OS新增0，fake timers／MQL／pointer对象／capture spies不是原生触控／OS认证。document／window归属保持原实现，实际跨文档另待验；PreviewGroup轨道重定位／双帧释放仍留下一批独立审查，不因本批完整组件单测通过就认证其生命周期。Form、日期库存漂移及144环境阻塞保持，未启动浏览器／服务／自动化，未提交／推送／发布。

## Select 共享hook交互调度（2026-10-14）

保留两端既有dirty hook／controller／menu／options／样式与文档变更，原始同hash7cba54df3d62b771d082a3f88b08d1a808ccc00625b134e300fc1a5faedf36d5。有效基线各12项10失败／2对照：关闭／重开后旧滚动、重复交付、卸载／停用后的待滚动与保留命令、inactive Enter／disposed Escape仍通知、Arrow新导航被旧打开回调重复滚动、虚拟回调同步关闭仍写DOM、激活恢复旧任务。正常打开后双路滚动及活动Arrow即时滚动本已通过，不记新增缺陷。

open关闭／重开同步失效请求；nextTick是渲染／选项登记等待，纠正旧注释“弹层动画完成”的错误归因。回调核对生命周期、open、活动键和既有ref归属并消费一次（空列表也消费）；初始不存在的下拉节点仍允许正常晚登记。键盘／活动键／滚动新命令取消旧打开任务，停用／卸载保留交互入口无效；激活只允许新命令，不重放。虚拟调用返回后再验open／请求／ref，防止同步关闭后写DOM。逻辑取消不删除Vue队列、不撤销已经完成的同步滚动；无CSS Token／公开取消API或身份／键盘协议变化。Vue技能落实停用／卸载与资源清理。

最终专项各14（补晚登记、空列表消费两对照），含共享消费者回归Cedar Select／AutoComplete／Mention共93项、Maple Select／AutoComplete共96项通过。Cedar旧Vitest TSX与.ts hook转换模式导致nextTick mock未接入，初轮11失败属无效探针；新专项采用.test.ts匹配hook后才取12项有效基线。初始definite assignment对象简写语法纠正不算产品错误；Cedar关闭时close timeout／fsevents诊断另列，测试93通过、exit0。两端配置声明类型／受影响lint通过，Maple1019示例SFC编译0失败。

本轮Maple根lint:check已通过，未改日期文件；此前23项日期示例lint错误作为并行历史保留，不宣称本批修复它们。日期库存仍仅date-range50／90→61／105、time-range37→42漂移，未刷新未审快照，不称motion-themes全链通过。Form与144环境阻塞保持。

新增interaction-dispatch职责：本地键盘同步派发没有计时器，不等同interaction-delay，也不应自动形成CSS时长Token。虚拟调用delegated-scroll、DOM调用native-scroll、nextTick调用state-settlement分开标注。更新两端Select库存6行／hash，累计36文件／82提示已分类、97未分类（非缺陷数），库存192文件／392 CSS／179运行时不变。分类／扫描／Message契约25测试、独立动效编译链、目录3测试／3生成页通过。既有browser-evidence202测试与保存证据链通过，只校验一致性；真实浏览器／OS新增0，受控nextTick／DOM几何／虚拟spies不认证完整下游组件。

共享规范、Cedar菜单、Maple中英菜单、Select三份文档、两端示例、changeset／CedarOpenSpec同步。[逐组基线、源hash、验证与探针说明](./evidence/select-scheduler-2026-10-14/results.json)。未启动浏览器／服务／自动化，未提交／推送／发布；其他共享布局／原生键盘／窗口需独立证据。下一批可继续剩余测量／交互候选，先核对并行归属。

## BackTop 测量与滚动调度（2026-10-14）

保留两端已有dirty源码／文档／契约变更，初始同hash652cbc8431220c4d80304aa23ddb0d35dac5adda63d63a27bbcc895f666cd29b。各14项初测10失败／4对照：旧测量检查新目标／清新句柄、回放测量、停用旧监听排帧与激活复活、动画帧重复交付回退／完成后重放、easing内卸载后继续写入、iframe RAF／clock来源及取消owner错误。测量回放探针需等待初始mounted watch稳定，单列夹具修正，不据初测数字宣称10个独立产品缺陷；其他9项独立复现。已取消动画对换目标的隔离、停用／卸载保留命令及正常测量／reduce本来通过，不算新增缺陷。

绑定代次隔离旧监听；测量与动画各自管理owner／代次，已消费帧不可再执行，不能清新句柄或复活。自定义easing返回后再核对请求，避免同步卸载／取消后写入／排帧。实际target.ownerDocument.defaultView申请／取消RAF、提供performance起点；模拟iframe10000起点＋10100帧得到400→360且横向37保持，卸载取消动画19／测量20两owner句柄。duration默认200ms／easing保持，减少动效只跳JS插值，显示测量不跳。无新CSS Token／取消API，不修改公共契约。Vue技能落实停用／卸载及descriptor恢复。

最终专项14＋契约13＋SSR2＋基础1，两端各30全部通过，声明配置类型通过。Cedar旧契约仅mock全局RAF，改实际owner RAF／clock并恢复descriptor，修复后初轮5个探针失败不记新产品错误；测量探针初轮1失败亦单列。Cedar受影响lint与Maple受影响lint通过；Maple全库lint新增并行date／date-range示例23项curly／格式错误阻塞，按用户要求不改日期，不能宣称全库lint通过。Maple1017示例SFC编译0失败（包含本批与并行新增示例，数量增加不代表新增浏览器验收）。

仅刷新BackTop两行库存及源码分类；统一动画排帧入口后每端候选4→3，不是删除功能。当前192文件／392 CSS／179运行时提示（C102／202／95，M90／190／84）；分类34文件／70提示，109未分类（非缺陷数）。measurement-scheduling12、visual-scroll16；扫描／分类／Message契约24项通过，独立动效编译链、目录3测试／3页通过。live全局库存仍仅Maple日期样式行漂移，保留date-range50／90→61／105、time-range37→42未审快照，不宣称motion-themes全链通过。

共享规范、Cedar菜单、Maple中英菜单、BackTop四份文档、两端生命周期demo、changeset／CedarOpenSpec同步。[逐组基线、源码哈希、夹具调整与验证](./evidence/back-top-scheduler-2026-10-14/results.json)。既有browser-evidence202项和保存证据链通过，只校验一致性，真实浏览器／OS新增0；模拟iframe不等于真实跨文档／原生clock认证。同节点adopt仍独立待验。Form、日期库存漂移、144环境阻塞保持；未启动浏览器／服务／自动化，未提交／推送／发布。下一批可继续Select等交互调度，先核对并行归属。

## InfiniteScroll 测量与交互入口生命周期（2026-10-14）

选取两端未分类InfiniteScroll消费者；源码开始时clean，保留既有文档／样式／业务示例并行变更。RAF／零延迟setTimeout只合并触底几何检查，归入measurement-scheduling，不是CSS动效时长，不新增Token／API／减少动效绕过。各端10项受控基线7失败／3对照：取消旧任务在新target或重新激活后触发load、清掉新句柄、已消费任务重放、解绑ResizeObserver／MutationObserver重新排队、fallback定时器旧交付。现有取消待帧、卸载／停用保留check无效及正常合并本已通过，不误记新缺陷。

绑定代次拒绝断开后的观察器交付；任务代次在取消和消费时失效，旧回调先检查归属／mounted／active再清句柄和check。绑定替换、停用、卸载都使任务失效，激活只用新绑定／新检查；保留immediate初始通知、状态循环锁、check／retry及事件顺序、阈值和调用方业务请求职责。Vue技能用于停用／卸载与监听解绑及夹具恢复。

最终专项各10通过，全组件／示例Cedar35／Maple34通过。Cedar初轮旧Vitest无unstubAllGlobals属夹具兼容问题，改为恢复descriptor再取基线；两示例精确timer-count另被Vue3000ms Devtools待注入定时污染，隔离测试钩子并恢复descriptor后通过，不降低计数断言，不修改业务示例。源码依赖中的setDevtoolsHook路径核对记录于证据。Maplelint误在包内调用、CedarESLint目录未选tsx，均改为根脚本／显式文件重跑。两端配置声明类型、受影响lint／Maple完整lint、Maple1011示例SFC（0失败）通过。

仅更新两端InfiniteScroll库存行号／源码分类；新增2文件／4提示，累计32文件／64分类提示，117未分类（非缺陷数），192文件／392 CSS／181运行时库存保持。分类／扫描／Message契约24测试、独立动效编译链、Token目录3测试／3生成页通过。live库存差异仍仅Mapledate-range CSS50／90→61／105、time-range37→42；保留未审并行快照，不宣称check:motion-themes全链通过。

共享规范、Cedar菜单、Maple中英菜单、InfiniteScroll三份组件文档与两端生命周期示例、Changeset／CedarOpenSpec已同步。[逐组基线、源码哈希、验证与夹具说明](./evidence/infinite-scroll-scheduler-2026-10-14/results.json)。既有browser-evidence202测试及保存证据链通过只是校验一致性；新真实浏览器／OS0，受控JSDOM／RAF队列不是原生观察器／手势／跨文档验收。Form、日期库存漂移、144环境阻塞保持；未启动浏览器／服务／自动化，未提交／推送／发布。下一批可继续BackTop测量或Select交互调度，先核对并行源码归属，不把117提示当作117产品错误。

## VirtualList 消费者生命周期（2026-10-14）

两端实际调度是Vue nextTick，不直接使用RAF；保留既有List对齐变更。各端14项受控基线10失败／4对照，修复旧事件补偿覆盖新命令、重复交付、停用补偿／保留命令／事件、激活复活旧任务、卸载事件、数据缩减及真实List inactive转发。请求代次与原容器归属、mounted／active／disposed guards、数据键／虚拟模式变化失效，渲染后对象补偿只消费一次。取消不会删除Vue队列或回滚已完成同步写入；不新增RAF、CSS Token或API，保留key／index／align／threshold／测量契约。

专项最终各15项通过（补充对象回调重复交付对照），完整List Cedar41／Maple34通过；配置声明类型、Cedar受影响文件lint、Maple完整lint及新demo检查通过。Maple1010示例SFC检查0失败。Vue技能落实停用／卸载均失效与资源清理。实现过程中helper current遮蔽局部数值导致TDZ／类型错误，改为isCurrent后重跑通过，不计基线产品缺陷。Cedar旧运行器末尾close timeout／fsevents shutdown断言另记，41测试通过、exit0。

新增两文件／两条state-settlement提示，累计30文件／60提示分类、121未分类（不是缺陷数）；库存192文件／392 CSS／181提示。仅更新本批VirtualList行号／源码哈希，分类／扫描／Message契约24项通过。独立动效编译链通过，Token目录3测试／3页匹配。全局库存仍因Maple并行date-range CSS50／90→61／105、time-range37→42漂移，不刷新未审快照，不宣称check:motion-themes全链通过。

既有browser-evidence202项及证据一致性链通过；新增真实浏览器／OS0，nextTick受控队列／JSDOM不是原生RAF／手势／OS验收。共享规范、Cedar菜单、Maple中英菜单、List三份文档、生命周期示例、changeset及Cedar OpenSpec同步。[逐组证据](./evidence/virtual-list-lifecycle-2026-10-14/results.json)。Form、日期及144环境阻塞保持；未启动服务／浏览器／自动化，未提交／推送／发布。下一批继续未分类测量／交互调度消费者；任意行几何、跨文档及原生环境仍独立待验。

## 运行时候选第三批：Icon／List（2026-10-14）

新增两端Icon及List四文件／8提示分类，累计28文件／58提示，剩余123提示；库存192文件／392 CSS／181运行时提示不变。新增visual-completion区分跟随公开transition的名称替换等待，delegated-scroll区分向另一组件转发滚动与直接原生DOM操作。两端List.scrollIntoView仅在虚拟模式向VirtualList.scrollTo转发options，本轮不改实现／API；原有List Cedar26／Maple19项通过，不能据此认证下游VirtualList RAF、保留命令或减少动效。

Icon两端各9项受控计时／MQL／iframe测试，基线均6失败／3正常对照：旧名称计时回滚、已消费回调清掉新动画、停用更新仍排计时、停用监听未解绑及旧交付影响激活、transition改0后仍等旧期限、iframe读取宿主偏好。修复后各9通过，完整Icon Cedar20／Maple21项通过。正常119ms保持旧名称／120ms提交、动态reduce即时显示、卸载当前计时／监听清理作为原通过对照。

CSS transition-duration和JS名称等待共用归一化transition值（默认0，负值／非有限按0）；运行中改时长取消旧阶段并提交当前名称。名称被替换、偏好变化、停用／卸载时计时代次失效，当前回调消费一次；旧计时不能清除后续状态。停用不排动画、解绑监听，激活显示最新名称不重放旧动画；实际span.ownerDocument.defaultView拥有偏好监听，绑定代次隔离已解绑回调。注册／slot优先／spin／公开API及CSS变量不变，无新Token／固定时长。

Cedar旧reduce测试仅patch运行器window而非实际document.defaultView，修复后两项失败属探针差异，两端探针统一绑实际owner后完整回归通过，不记额外产品失败。最初类型命令误用宽tsconfig.json，根目录歧义及rootDir诊断包含其他demo／测试／工具错误；未改配置规避，最终仓库配置的declaration typecheck通过，Maple类型通过。Cedar受影响lint、Maple完整lint、受影响tracked空白通过，两端生命周期示例同步，Maple1008 Demo SFC检查0失败。Vue技能用于同时处理停用／卸载、取消旧任务与监听，测试释放挂载owner、恢复假时钟／descriptor并移除iframe。

[基线逐项、源码前后哈希、验证和保留漂移](./evidence/runtime-motion-wave3-2026-10-14/results.json)。共享规范、Cedar菜单、Maple中英菜单、Icon／List组件文档、两端Icon示例／patch Changesets、Cedar OpenSpec同步。修正Icon文档中借用Ripple历史250ms上限的过时说明，Ripple策略转引其自身文档，不将它套用到Icon。

分类／库存扫描测试／Message契约24项通过，当前58提示完整源码／原行匹配；动效编译链独立通过（不算浏览器），目录3测试／3生成页匹配。既有browser-evidence202项及保存证据全链通过，只检查既有一致性，不增加本批浏览器通过数。全局motion inventory --check仍因Maple并行date-range CSS行50／90→61／105、time-range37→42漂移失败；不覆盖日期源码、不刷新这两快照来掩盖未审阅变化，不能称check:motion-themes全链通过。待并行稳定后由相应归属收口。

本批真实浏览器／OS新增0，模拟窗口／偏好不算真实验收；未开启标签／服务、不恢复临时自动化、不提交／推送／发布。Form并行改造与144环境阻塞原样保留，同节点不停用跨document adopt、自定义animationClass和其他Icon消费者仍需独立证据。下一批可审查List下游VirtualList RAF／保留命令或其他未分类测量候选。

## IndexBar 消费者生命周期（2026-10-14，新请求续做）

Maple运行时IndexBar源码此前clean；保留现有样式／文档及Form／日期／色板并行变更。纠正模拟几何探针后，初始10项消费者基线7失败／3对照通过：入口帧卸载未取消、卸载保留方法仍排帧、替换命令都通知、插值卸载仍排帧、旧doubleRaf解锁新任务、停用保留命令／旧帧仍有效、change回调卸载后仍写滚动。正常零时长与两项激活监听为通过对照；onSmartMounted本已有监听恢复，未将它误记成产品缺陷。

组件私有任务统一管理入口、插值、列表／clickedName两帧等待，实际owner窗口申请／取消；取消等待返回false、不跳旧目标，帧消费一次且微任务再验当前归属，旧完成不能清空新任务状态。停用／卸载保留方法无效。真实IAB又复现激活查找早于子锚点nextTick登记，新增第11项并改为可取消入口帧后恢复active/event:false。保持公开void scrollTo、duration默认0、正值cubic easing及事件；不新增公开取消API／CSS变量，不修改两端共享工具或并行Form。Cedar无IndexBar对应组件，不虚构双端修改。

最终消费者11＋私有任务4＋既有9共24测试通过，Maple类型与完整lint通过。Vue技能影响：停用与卸载同时使任务失效，取消时释放待帧并结束等待；受控队列／窗口descriptor／时钟与夹具pagehide资源恢复。减少动效只跳插值，不取消必要稳定帧，新增state-settlement职责区分状态顺序与CSS动效时长。

真实IAB四组最终4/4：replacement、settlement、unmount、keepalive，default/light父文档元素滚动。入口按钮原生点击，内部命令／scroll事件脚本发出，不认证原生手势／触控、组件跨文档、其他主题或OS。600ms插值约120ms后卸载，后续约701ms写入保持7次；停用约220ms保持7次，激活恢复到C（top481）且不重复change，监听再变A。旧两帧任务被替换时第一稳定帧仍锁B，完成后允许C。各组组件节点最终0、无warn/error；写入次数是夹具原样转发原生scrollTo的计数，不是全帧像素trace。

[逐组阶段、基线范围、源码／夹具／原图哈希](./evidence/index-bar-lifecycle-2026-10-14/results.json)，[保留的失败阶段](./evidence/index-bar-lifecycle-2026-10-14/before.json)。最初固定0／480与实际锚点1／481不符属夹具问题，初轮Transition几何及read-only matchMedia探针也单列；纠正后冻结重启／重载、四组完整重跑，初测通过不重复计。原始JPEG44880字节已查看，sha256486f06dc0014c48379e4966079ae17ff08066fa5cbf32b2fae162ff62a5bb9ac。

新增17项正反证据门禁，全browser-evidence202项及保存证据全链通过；扫描／分类／Message契约22项与动效编译全链、目录3测试／3生成页通过。Maple1007个Demo SFC检查0失败，脚本语法与受影响tracked空白通过。只审阅刷新IndexBar／新私有任务库存，当前192文件／392 CSS／181运行时提示；分类24文件／50提示，未分类131（不是131缺陷）。共享规范、Cedar菜单、Maple中英菜单、IndexBar双语文档及生命周期示例同步，Maplepatch Changeset补齐。

自建tab10及各轮冻结服务已关闭，144原生200%／Safari／Firefox阻塞保持，没有重新尝试无变化超时入口。临时自动化仍暂停，本次由用户新请求启动，不恢复自动运行；未提交／推送／发布。后续优先其他未分类消费者；Form需等并行改造稳定后审查，真实OS／原生手势及组件跨文档保持独立待验。

## 午夜截止收尾（2026-10-14）

本轮首次实际时钟为UTC 2026-10-13 16:08:11（上海00:08:11），已过约定午夜截止；没有启动新的产品修改、测试批次、浏览器或服务。临时自动化`cedar-maple-14-00-2`通过应用工具设为PAUSED，并读取配置确认；保留名称、提示、截止规则和本聊天归属，不调整其他聊天自动化。

截止前最后三批真实IAB分别为Trigger4/4、InputNumber／Countdown4/4、共享滚动8/8；测试范围和脚本派发／公开方法／原生RAF转发边界见各批证据，不外推跨窗口、原生手势或OS设置。最后证据全链185项测试通过，属于证据门禁而非185组浏览器验收；共享滚动两端各10项受控测试、InputNumber45／48及Countdown18／20等专项结果保持原记录，不重新执行或累加为本轮通过数。自建标签与冻结服务已在各批结束关闭。

仍待处理：Chrome原生200%／Safari／Firefox三套共144组环境阻塞；运行时候选已分类44／177提示，尚余133提示需按职责审查（不是133个缺陷）；Maple IndexBar的保留命令、取消／卸载与doubleRaf状态需独立验证，Form存在并行改造，不接管。实际OS减少动效变化、其他主题及原生手势等未获对应证据的边界继续保留，不宣称全局完成。

共享规范、Cedar菜单、Maple中英菜单及相应组件文档已按各批同步。主色Button白字保留，历史明亮主色2.305:1为明确设计例外，不能称AA；允许手动色阶／前景覆写，其他文字阈值不放宽。未提交、推送或发布，日期、色板、Form及其他并行工作保持。

## 共享滚动真实IAB八组（2026-10-13 晚间）

两端各主document默认300ms／0ms与真实同源srcdoc iframe HTMLElement／Window，8/8通过。默认实际完成Cedar312.7／313.1／313.9ms，Maple302.5／309.7／312.8ms；均19次owner原生RAF、含原生中间坐标。0ms为0.1／0.6ms，无RAF且调用后已到目标。iframe四组宿主RAF0，终点left80／top220，50ms后稳定；目标节点全部清零、控制台无warn/error。

原生入口点击，夹具自己临时计数包装原样转发原生RAF；不模拟时钟／帧，不改viewport或OS偏好。native callback首／中／末相对performance.now摘要（0.1ms）不是全帧像素trace。当前reduce查询观察false，不认证OS偏好变化；工具直接调用也不认证Form／IndexBar取消／保留命令／doubleRaf状态。没有新增产品修复／API／Token，144原生200%／Safari／Firefox阻塞保持。

[八组坐标／请求计数与原图哈希](./evidence/shared-scroll-native-2026-10-13/results.json)，原始JPEG93739字节已查看，sha2560babb698a1a31f77d320011c0b4e68635f13a167741e1cdac4736317f64effcc。新增18项正反门禁绑定实际helper源码、夹具及原图hash，并检查zero／插值／iframe归属／稳定终点／残留／越界声明；完整browser-evidence185测试与保存证据检查通过。目录3测试／3生成页、脚本语法及受影响tracked空白通过；共享规范、Cedar菜单、Maple中英菜单、IndexBar中英文档、夹具README与OpenSpec同步。

自己的tab9／冻结服务已关闭，逐组恢复原生RAFdescriptor并移除目标，无其他聊天自动化／日期／色板／Form并行工作变更，未提交／推送／发布。下一批距截止不足一小时，优先有界且无需改API的证据门禁／候选职责收尾；消费者取消若需新参数或并行协调，明确留待后续，不仓促扩大范围。

## 共享JS滚动执行边界（2026-10-13 晚间）

两端各10项基线9失败／1默认300ms对照通过：0／负值／NaN／Infinity排帧、iframe HTMLElement／Window借宿主RAF、已消费／已完成回调再写入、初始／动态owner减少动效未消费。非正值／非有限时长改直接到目标；正值默认300ms和调用方easing保留；实际ownerDocument.defaultView／目标Window拥有RAF与当前偏好查询，动态偏好在下一帧完成；每帧校验并消费代次，无额外监听资源。

Cedar修复后两项探针仍拦截runner全局／window包装对象，没拦实际document.defaultView；改绑实际owner后最终10项通过。该运行器差异及失败探针清理后回调报错不记额外产品缺陷。Maple工具10＋既有IndexBar9项通过；两端类型、Cedar受影响lint、Maple完整lint通过，自己的新测试curly做机械修正并重跑。动效扫描／分类／Message契约21项及编译全链、目录3测试／3生成页和受影响tracked空白检查通过。

[逐项范围、源码哈希及待验边界](./evidence/shared-scroll-execution-2026-10-13/results.json)。共享规范、Cedar菜单、Maple中英菜单、IndexBar中英文档、Cedar OpenSpec与两端patch Changesets同步；分类历史“减少动效待验”限定为消费者／真实行为。只刷新实际审阅两工具的行号／query-presence／哈希，191／392／177和44已分类／133未分类保持。

duration是JS参数，不新增CSS变量／取消API，不自动替换不同调用。IndexBar默认0保持，自身首帧／doubleRaf仍异步；既有9项不认证clickedName／保留命令／卸载取消。Form在并行改造，本轮不接管源码／测试／文档；Cedar未找到具名生产消费者，不等于产物不可达。Vue技能清理探针原始descriptor／RAF／Date.now与iframe元素；模拟偏好／iframe不算真实浏览器／OS，新增两者均0，144环境阻塞保持。未启动浏览器／服务、未接管日期／色板、未提交／推送／发布。下一批优先IndexBar安全的运行时状态边界或工具真实滚动证据，Form overlap留待协调。

## InputNumber／Countdown真实IAB四组（2026-10-13 晚间）

两端各InputNumber长按取消／卸载与Countdown暂停／KeepAlive，default/light、父document，最终4/4通过，组件节点均0、无warn/error。原生入口点击；内部pointerdown／pointercancel脚本派发、Countdown公开方法，不能称原生长按／触控、已出队竞态、跨窗口或OS通过。

长按实际首次重复Cedar803.1ms／Maple802.3ms，后续152.8／153.1ms；取消后约220ms无更新，重新按下后约100ms卸载，超过800ms期限仍保持4次更新。Countdown暂停回调13保持，停用Cedar25／Maple26保持，停用time重置900ms时增加一次到26／27后保持，激活实际继续到703／700ms，卸载后40／41保持，无end。记录真实performance.now相对阶段／公开回调摘要，不把事件计数外推为每帧视觉正确。

初测父级直接跳过inactive Clock vnode，新time只在激活传入；这是夹具覆盖问题，不记产品缺陷。稳定缓存容器保留其render effect，inactive更新实际传入；冻结服务重启／tab重载后最终四组全跑，初测2项通过不重复计。[阶段／回调及原图哈希](./evidence/business-native-lifecycle-2026-10-13/results.json)，原始JPEG58457字节已查看，sha2566045c2a64a9c11934669017915412c826b34d4bfd32d368503f850bcb62ef157。

新增19项正反证据门禁接入check:browser-evidence，完整167测试／保存证据全链通过；目录3测试／3生成页、脚本语法与受影响tracked空白通过。共享规范、Cedar菜单、Maple中英菜单、两端组件文档与夹具说明同步。本批无产品源码／Token/API修复；此前InputNumber45／48与Countdown18／20为独立模拟／SSR专项，不重新计为本批测试。Vue技能用于夹具timer/pagehide清理，自己的tab8及两轮冻结服务均关闭。

OS新增0，144环境阻塞和Button白字例外保持；未修改视口／系统偏好、未接管日期／色板、未提交／推送／发布。下一批按实际消费者审查共享滚动取消／零时长／减少动效，其他原生手势／跨窗口／主题仍独立待验。

## Countdown业务时钟帧归属（2026-10-13 晚间）

两端各8项受控performance.now／RAF／KeepAlive测试基线6失败／2通过：暂停前旧帧消费重启句柄、已消费帧再次通知、停用更新time启动后台帧、停用保留start启动、卸载后reset仍通知、change/reset重入产生多余旧帧。正常停用冻结／恢复和每轮一次end为通过对照。

帧在清句柄／计算／通知前验证并消费代次，change返回后再验，旧任务不能覆盖新deadline／后继RAF。停用更新time／reset保留数据及change通知，但不调度；auto-start延至激活。停用直接start忽略，手动pause取消待恢复，卸载后的start／reset不通知。保持performance.now业务deadline、冻结剩余值续跑、格式和每轮end/reset语义；不新增CSS变量／公开API，不通过减少视觉动效缩短业务时长。

完整Countdown Cedar18／Maple20项通过，专项各8项；Maple补全guard花括号后专项8项重跑通过。两端类型、Cedar受影响lint、Maple完整lint、动效扫描／分类／Message契约21项及编译全链、目录3测试／3生成页、受影响tracked空白检查通过。[逐项基线／修复、业务语义及前后源码哈希](./evidence/countdown-clock-ownership-2026-10-13/results.json)。共享规范、Cedar菜单、Maple中英菜单、两端Countdown文档、Cedar OpenSpec及两端patch Changesets同步，分类旧“尚未复现”描述补后续修复引用，原历史证据不覆盖。只更新审阅Countdown的候选行／哈希，191／392／177与44已分类／133未分类不变。

Vue技能用于校验停用／卸载及旧帧同时失效，夹具卸载并恢复RAF／cancel／performance探针。真实浏览器／OS新增0，跨窗口RAF与原生证据不据此外推；144环境阻塞及Button白字设计例外保持。未启动浏览器／服务、未接管日期／色板、未提交／推送／发布。下一批先补这两个组件的真实IAB普通生命周期证据，再按消费者审查共享滚动的取消／零时长／减少动效；不将源级候选直接视为缺陷。

## InputNumber长按计时回调归属（2026-10-13 晚间）

纠正两项探针边界后，两端各8项最终基线为7失败／1正常节奏通过。初版捕获所有setTimeout导致Cedar首项混入无关计时器，改为只捕获800／150ms并转发其他；重入用例只验新回调一次会误通过，补后续步进才暴露新任务被旧false返回停止。初轮不对称数字不作为最终产品失败证据。

复现取消、替换、卸载、重复消费、重入、KeepAlive及pointercancel后的旧回调问题。每个计时回调有独立代次，步进前验证并消费；step返回后若重入已换owner则不停止／覆盖新任务。停用期间拒绝新start，激活后允许新手势，不自动恢复旧长按。保留首次800ms／重复150ms和现有owner窗口释放清理；这是交互节奏，未新增动效Token/API。

修复后完整InputNumber Cedar45／Maple48项通过，新增专项各8项；两端类型、Cedar受影响lint、Maple完整lint通过。Maple新测试一处curly先失败，修正后全仓lint及专项8项重跑通过。动效扫描／分类／Message契约21项及编译全链、目录3测试／3生成页、受影响tracked空白通过。仅本批已审阅InputNumber分类行号／哈希更新，原始191／392／177及44已分类／133未分类不变。

[逐项失败／通过、探针修正与源码哈希](./evidence/input-number-repeat-ownership-2026-10-13/results.json)。共享规范、Cedar菜单、Maple中英菜单、两端组件文档、Cedar OpenSpec及两端patch Changesets同步；分类批次的旧“尚未复现”正文补历史限定，原证据不覆盖。Vue技能用于同时处理停用／卸载及已出队任务，测试卸载owner、恢复spy、清理模拟计时器并恢复真实时钟。

真实浏览器／OS新增0，不把受控旧回调当真实手势／跨窗口证据；144环境阻塞、Button白字例外和并行色板／日期工作保持。未启动浏览器／服务、未提交／推送／发布。下一批Countdown业务时钟暂停／重启／停用更新专项；共享滚动按实际消费者独立审计。

## 运行时候选职责第二批（2026-10-13 晚间）

两端各检查test辅助、Countdown、InputNumber长按及共享elements滚动工具，共8文件／26源码提示。新增test-support10、business-clock2、interaction-repeat4、visual-scroll8、declaration-only2；累计22文件／44提示已分类，133提示尚未分类。原始候选191文件／392 CSS／177运行时不变，不删模拟方法声明来压低数量，也不把未分类当剩余缺陷数或否定既有专项。

业务deadline不消费CSS动效时长；800／150ms长按属于交互节奏；JS滚动插值与native-scroll直接转发分开。具名实际消费者确认Maple Form默认时长／linear和IndexBar公开duration／easeInOutCubic；Picker局部同名方法不归此工具。Cedar未找到具名生产调用、src排除__tests__后未找到test辅助路径导入，均不外推打包不可达。长按先step后验代次、Countdown暂停重启／停用更新、滚动取消与减少动效仅登记源级候选，尚未复现、不作产品修复。

[第二批职责、源码哈希、实际消费者与待验边界](./evidence/runtime-motion-classification-wave2-2026-10-13/results.json)。分类专项13项／合并扫描与Message契约21项通过，动效编译全链、目录3测试／3生成页、脚本语法及受影响tracked空白检查通过。共享规范、Cedar菜单、Maple中英菜单同步；Vue技能的资源清理边界用于分开“应验清理”和“本批已验”，没有把源码审查当生命周期通过。

本轮无产品源码／API／CSS变量变化，新生命周期测试／真实浏览器／OS均0，144环境阻塞和Button白字设计例外保持。未启动浏览器／服务，未接管日期／并行色板工作，未提交／推送／发布。下一批优先以受控旧回调复现InputNumber长按取消与替换，再核对Countdown业务时钟；共享滚动须按消费者逐项验，不直接全局改API或动效Token。

## Trigger真实IAB生命周期四组（2026-10-13 晚间）

实际独立Trigger／CSS，default/light，两端延迟取消与KeepAlive实际ResizeObserver各一组，共4/4，最后面板节点0，页面无warn/error。入口原生按钮点击、内部mouseenter脚本派发，不声称原生hover、已出队竞态、跨窗口视觉或OS通过。初测仅负向无打开不足以证明计时路径，补重新挂载正向对照后冻结重载、最终四组完整重跑；初测不重复计数。

300ms待打开约101ms卸载，约553ms观察仍无打开；重挂载后正向实际update:open距after-deadline Cedar305.5ms／Maple303.4ms，正向面板1、最终0。KeepAlive真实公开resize计数两端均1→2、停用保持2、恢复3，开合更新true／false／true。真实browser／OS与模拟旧回调分别留证，不用本轮常规时序替代模拟竞态结论。[四组关键阶段／公开回调与原生JPEG](./evidence/trigger-native-lifecycle-2026-10-13/results.json)采用相对performance.now小数一位摘要，原图已查看／登记hash。

新增12项正反证据门禁并接入check:browser-evidence，检查取消窗口、正向实际期限、活动／停用／恢复测量、开合、清零、原图、OS／native-hover越界。证据全链通过，目录3测试／3生成页一致，脚本语法与受影响tracked空白检查通过。共享规范、Cedar菜单、Maple中英菜单、Trigger文档及夹具说明同步。本批无产品源码／Token/API修复；真实OS新增0，144环境阻塞与Button白字例外保持。跨窗口、其他主题／位置、原生hover及其他运行时候选继续待验；下一批继续按职责分类其他候选。不重复计既有63／76模拟测试为本轮通过。收尾自建标签／冻结服务已关闭，无视口／系统偏好变更，未提交／推送／发布。

## ResizeObserver绑定／测量帧代次（2026-10-13 晚间）

两端resize专项各新增3项，基线3失败／5通过：已取消旧RAF消费新entries，断开observer注入旧entries，停用前旧帧在重新激活后消费新批次。分别加入binding/frame代次，clear使两者失效，schedule在合并entries前拒绝旧绑定／非活动owner；帧执行校验并消费一次。不能用单一代次在每帧完成时使仍活动observer失效。正常几何合并、owner窗口取消和CSS／交互默认值保持，不新增Token/API。

完整Trigger Cedar63／Maple76项通过，resize各8项；同工具Avatar邻接Cedar10／Maple11项通过，不据此外推其他消费者。两端类型、Cedar受影响lint、Maple完整lint、动效源码／分类17项和编译全链、目录3测试／3生成页、分类hash及受影响tracked空白检查通过。[失败／通过及源码哈希](./evidence/resize-measurement-generation-2026-10-13/results.json)。共享规范、Cedar菜单、Maple中英菜单、Trigger组件文档、OpenSpec与patch Changesets同步，当前候选191／392／177不变，仅测量调用行号更新。

新增真实浏览器／OS0，144环境阻塞与Button白字例外不变。下一批补Trigger真实IAB生命周期证据；同节点跨document adopt、不经watcher刷新就换目标及其他工具消费者仍分开待验，不制造无证据修复。没有接管日期／命名变更，未启动浏览器或服务，未提交／推送／发布。

## Trigger原绑定窗口监听清理（2026-10-13 晚间）

初轮Window spy两版运行器不一致，改为仅测试iframe转发探针；初始化unbind的remove记录会让后续断言误通过，已在变更前清空。最终探针两端各新增3失败／既有4 RAF通过：换文档popup ref、清空ref、watcher刷新前卸载都未从原绑定窗口删除原scroll处理器。没有把初轮探针或宿主RAF记录差异当产品缺陷。

保存实际scrollView，在其上移除原处理器并清空；不依赖当前已变化／消失的popup ref反查。两端独立修复，完整Trigger Cedar60／Maple73项通过，RAF与监听各7项；两端类型、Cedar受影响lint、Maple完整lint通过。[本批数字／源码哈希](./evidence/trigger-listener-window-2026-10-13/results.json)。共享规范、Cedar菜单、Maple中英菜单、组件文档、OpenSpec和patch Changesets同步；分类hash重新复核，原行和候选191／392／177不变。

无新API／Token或视觉／交互延迟默认值变化。新增真实浏览器／OS0，144组环境阻塞与Button白字例外不变。下一批继续其他运行时候选及ResizeObserver已出队测量调度归属，尚未复现不提前记缺陷；同DOM节点不换ref直接跨document adopt与真实浏览器视觉仍独立待验。未接管日期／命名工作，未启动浏览器或服务，未提交／推送／发布。收尾动效源码／分类17项与编译全链、目录3测试／3生成页、分类源码hash与受影响tracked空白检查通过，菜单旧待办描述已同步为后续模拟通过而非全跨窗口验收。

## Trigger RAF窗口归属与旧帧隔离（2026-10-13 晚间）

初轮夹具静态ref没有触发绑定watcher，无RAF捕获，属于夹具失败；改成关闭→打开绑定后，两端各3失败／1通过：iframe元素RAF在宿主取消、iframe窗口滚动在宿主调度、已取消旧帧消费替换后的滚动任务。消费后重复调用的既有行为通过，不虚增缺陷数。

保存申请窗口、在该窗口取消；元素事件使用节点ownerDocument，窗口事件回退当前浮层窗口；代次使取消／已消费帧失效，业务处理前取出并清空本次事件。RAF归属是必要测量调度，不新增时长Token、不因减少动效取消几何读写，CSS视觉／交互延迟默认值不变。

完整Trigger Cedar57／Maple70项通过（新增各4），格式化后新增各4项复跑通过；两端类型、Cedar受影响lint、动效源码／分类17项和编译全链、目录3测试／3生成页、受影响tracked空白检查通过。Maple首次lint一处测试for-of缺括号已修正，最终完整lint与4项再次复跑通过。[本批证据](./evidence/trigger-raf-ownership-2026-10-13/results.json)。共享规范、Cedar菜单、Maple中英菜单、组件文档、OpenSpec及patch Changesets同步，分类原行／哈希重新复核；191文件／392CSS／177runtime不变。

新增真实浏览器／OS0，144环境阻塞与Button白字例外保持。下一批验证浮层更换窗口后的旧scroll监听解绑，当前仅源码候选、未制造修复；本轮不能称全跨窗口清理已通过。未接管日期／命名工作，未启动浏览器或服务，未提交／推送／发布。

## Trigger 延迟commit归属（2026-10-13 晚间）

两端模拟已出队回调各新增6项、基线各6失败：cancel、替换旧任务、卸载、卸载后保留方法、KeepAlive停用／重新激活、消费过的旧回调在后续close后重开。按Vue资源清理规范增加内部代次及suspended/disposed守卫，cancel使旧任务失效，commit校验并消费一次；旧任务不清理新任务。停用保留原有关闭请求，然后拒绝保留方法，重新激活只接受新请求、不重放旧延迟。没有将交互延迟改成CSS视觉时长。

完整Trigger Cedar53／Maple66项通过（新增各6），两端类型和Cedar受影响lint通过。Maple首次完整lint发现新增3处curly格式规则，已修正；这是格式问题，不算产品失败。最终Maple完整66项复跑／lint通过，动效源码／分类契约17项及编译全链通过、目录3测试／3生成页一致、受影响tracked空白检查通过。共享规范、Cedar菜单、Maple中英菜单及组件文档、OpenSpec、两端patch Changesets同步；分类原行／哈希经最终源码复核更新，不改首批历史证据。源码候选191／392／177不变。

[本批失败／通过数字及源码哈希](./evidence/trigger-state-ownership-2026-10-13/results.json)。新增真实浏览器／OS0，144组环境阻塞与Button白字例外不变；没有接管日期／命名并行修改，未启动浏览器或服务，未提交／推送／发布。Trigger RAF窗口取消仍待下一批独立复现，不把本轮延迟回归称为全组件动效关闭。

## 运行时候选职责分类首批（2026-10-13 晚间）

逐个读取两端 debounce、ResizeObserver、FieldGeometry、Trigger positioner/state、List接口及Cedar Layout/NavMenu声明，记录14文件／18线索：声明6、测量调度6、交互延迟4、原生滚动2。源码候选仍191文件／392CSS／177runtime，不修改扫描器来隐藏声明。剩余159是尚未录入本分类表的线索，包含既有专项审计，不是未修缺陷数。

[分类原行／源码哈希与职责说明](./runtime-motion-classification.json) 与 check:motion-themes 关联；新增9项门禁通过，拒绝未知候选、重复归属、源码／原行漂移、缺行及伪造通过分类。变更需要重读源码而非自动刷新哈希。分类不是生命周期验证，Trigger owner-window取消和已出队回调、延迟commit仍列为下一批优先候选；Layout保留调用者options，smooth／减少动效尚未在此批验收。没有据此制造产品修复或接管并行日期／源码命名。

共享规范、Cedar菜单、Maple中英菜单补充调度与动效Token职责边界。无公开API、产品源码／样式／Token默认值变化；新增真实浏览器／OS0，144组环境阻塞与Button白字设计例外保持。未启动浏览器或服务、未提交／推送／发布。收尾动效源码／契约17项与既有编译全链通过、目录3测试／3生成页一致、脚本语法和受影响tracked差异空白检查通过，[本批结果](./evidence/runtime-classification-2026-10-13/results.json)。后续继续生命周期候选，不以分类数量冒充全库关闭。

## Message 局部减少动效／实际CSS消费（2026-10-13 晚间）

分端隔离Less先各复现失败：Cedar root仍为正常all过渡，Maple enter-active仍为正常opacity/transform过渡。不能靠全局极短时长兜底。本轮补局部reduce：Cedar取消root/enter/appear/leave与装饰icon淡入；Maple取消进出过渡和动画位移，保留独立提示静态水平/居中transform。不能全量transform:none导致布局偏移。

实际编译28项正常消费者／成对时长曲线覆写、68项减少动效选择器/定位组合通过；正常默认变量先解析，再检查覆写。Cedar根/进入/appear/退出时长与icon独立duration/easing均实际消费，Mapleopacity和transform共享既有过渡入口；不新增Token，不改正常默认值、颜色或业务展示计时。子Icon自身spin仍独立归属，不把Message wrapper淡入清理当Icon完整验收。

check:motion-themes全链含8项源码/扫描回归及新增Message检查通过；目录3测试／3生成页一致，Maple完整lint通过。仅Less/检查/文档改动，未重跑类型或Vue运行时，既有31/39项和真实IAB8组保持独立历史证据，不重新计数。[本批编译证据与源码哈希](./evidence/message-reduced-motion-2026-10-13/results.json)。

共享规范、Cedar菜单、Maple中英菜单、组件文档、OpenSpec及patch Changesets同步，限定!important规则范围补入Message，普通主题覆盖规则不放宽。当前候选191文件／392CSS／177runtime；新增偏好声明不是新增已验收动画。真实浏览器／OS新增0，144组阻塞和Button白字例外不变。未启动浏览器或服务，未接管日期/命名工作，未提交／推送／发布。下一批继续按职责分类其他组件运行时候选，真实OS和其他Message矩阵仍留待环境/专项验收。

## Message 真实 IAB 八组（2026-10-13 晚间）

两端实际独立服务／CSS，default/light、top：原生点击夹具按钮跑默认、600ms/linear、显式零、离场100ms后同ID重开，共 **8/8**。夹具明确安排800ms公开handle关闭；重开后从新add计1200ms展示期限再自动关闭。最终节点全0、closed各一次，重开组close为两次有效阶段通知，不误标为重复。

默认leave-to→移除 **Cedar104.4ms／Maple153.8ms**，长离场 **603.8ms／604.8ms**；重开最终 **604.7ms／612.6ms**。新add到自动close **1204.9ms／1203.6ms**。显式零计算样式0s，业务展示仍未被零CSS缩短。重开会取消旧根DOM并创建新根，不把旧节点移除当作完成600ms离场，也不声称根DOM身份保持。

[规范化实际DOM／公开回调摘要及原生JPEG](./evidence/message-native-2026-10-13/results.json) 保留完整关键阶段，去掉重复class mutation；图片已查看、登记哈希，页面无warn/error。Maple重开末次原生opacity/transform end均elapsedTime0.6s，其余退出用实际DOM完成链，不要求全部捕获end，不称帧级认证。2ms仅为固定观测容差。

新增14项证据正／反向门禁，验证八组、真实计算CSS、长离场、旧期限不关闭重开内容、回调顺序／DOM归属、最后原生end时长、最终归零与原图哈希，接入check:browser-evidence。本批仅夹具／证据／文档，无新产品修复。共享规范、两端菜单及组件文档、OpenSpec和夹具说明同步。真实OS新增0，hover／KeepAlive及其他主题／位置尚未浏览器验收，144组原生200%／Safari／Firefox继续阻塞；Button白字例外保持。

下一批先补Message实际Less消费者／reduce隔离检查，再按生命周期职责推进其他候选；本轮八组不冒充全库关闭验收。收尾已关闭自建服务和测试标签，不改视口或系统偏好；未提交／推送／发布。证据全链第一轮135项通过，补最后原生end反例后最终136项；目录3测试／3生成页一致，夹具与脚本语法及受影响差异空白检查通过。

## Message 服务退出与视觉完成链（2026-10-13 晚间）

两端完成协议测试各先1失败／1通过：组件仍未报告closed，服务已在200ms提前卸载并调用onClosed；源码另确认Transition固定150ms绕过公开CSS时长。取消两层固定等待，由after-leave→closed→finishClose收尾，不改Token默认值或业务duration。

候选取消兜底后，两端创建tick立即close/clear各2项复现泄漏，已补未挂载条目直接清理；clear按快照遍历，三条同步删除不跳项。此边界失败属于本轮候选实现，不冒充旧代码基线缺陷。未挂载不存在离场，服务onClosed报告清理完成，不伪造组件open/opened/close视觉事件；同ID处于open时旧完成仍忽略。

Cedar既有VTU默认Transition stub不报告真实closed，显式用真实Transition并卸载wrapper后全组恢复；协议mock限定动态加载和清理，初始诊断与测试字符串格式问题不作产品证据。最终Message **Cedar31／Maple39项**通过，新增服务各5项。两端类型、Cedar受影响lint、Maple完整lint通过；新增4项源码契约加扫描4项、动效全链通过。当前候选**190文件／389CSS／177runtime**，移除2份service固定timer候选，不代表额外浏览器通过。

共享规范、两端菜单指南、组件文档、Cedar OpenSpec及patch Changesets同步。[本批证据](./evidence/message-transition-completion-2026-10-13/results.json) 保存失败分类、最终数字和源码哈希。Vue规范用于组件完成链与未挂载清理边界。新增真实浏览器／OS **0**，144组阻塞及Button白字例外不变；下一批做Message双端默认／长／零／重开真实IAB及CSS消费，不把协议或源码检查冒充原生时序。未提交／推送／发布。

## Message KeepAlive／hover 耗尽边界（2026-10-13 晚间）

Maple新增8项先6失败／2通过；Cedar初轮也6失败，但KeepAlive初始global timer计数混入旧Vitest异步测试超时，不作产品失败证据。独立的停用期间update/open重新调度、卸载后暴露restart调度、hover正期限耗尽后变常驻、NaN／Infinity进入timer在两端复现。既有暂停重置为0和-Infinity保持不调度。

按Vue资源清理规范增加活动owner：mounted/activated去重启动、deactivated/beforeUnmount取消并使旧代次失效；停用watch/update和卸载后保留方法不启动。KeepAlive重新激活从当前配置完整duration重启，与Notification一致；hover保留剩余时间，正期限耗尽在resume请求关闭一次，暂停期间显式reset为0仍常驻。仅有限正duration自动关闭；不改CSS动效时长／Token默认值，不新增公开API。

初次timer全局spy与fake timer叠加在旧Vitest恢复时污染后续service测试，已移除该探针，以公开关闭行为／恢复期限验收；没有因夹具问题改服务。最终完整Message **Cedar26／Maple34项**通过，新增边界各8项。两端类型、Cedar受影响ESLint、Maple完整lint、目录3测试／3生成页通过，动效门禁收尾结果见[本批证据](./evidence/message-timer-boundary-2026-10-13/results.json)。

共享规范、两端菜单指南、组件文档、Cedar OpenSpec及两端patch Changesets同步。当前候选总数不增，仅Cedar timer行33→44、Maple33→37更新。新增真实浏览器／OS **0**，144组环境阻塞不变，白字Button例外不变；下一批做Message真实IAB／CSS消费和服务关闭完成职责，不接管日期及命名并行工作。未提交／推送／发布。

## Message 双端已出队回调归属（2026-10-13 晚间）

两端独立计时器先新增竞态回归，各5项失败：hover暂停、clear、卸载及open已关闭但watcher未刷新仍请求关闭；重启用例 Cedar 首轮在重复执行断言失败、Maple 在旧回调断言失败。最终探针仅捕获1000ms业务任务并无论断言成功与否都卸载，避免混入框架任务或测试残留。

clear递增私有代次，执行回调核对代次与当前open，再消费本次代次；旧任务不能清理新timer或请求关闭，重复执行无效。不改变0ms常驻、hover剩余时间、resetOnUpdate及CSS时长，不新增API／Token、不覆盖服务／日期并行改造。Vue清理规范用于明确计时器归属和测试卸载。

完整Message Cedar **18项**／Maple **26项**通过；格式化后Cedar计时9项干净复跑、Maple完整26项通过。两端类型、Cedar受影响ESLint、独立副本门禁、动效全链、目录3测试／3生成页通过；Maple首次lint发现新增测试格式／curly问题已修正，完整复跑通过。一轮Cedar9项通过后出现fsevents退出告警，独立有界复跑退出0且无告警，不算产品缺陷。

源码候选仍192文件／389CSS／179runtime，仅两处timer行号30→33更新，历史证据不改。[本批结构化记录](./evidence/message-timer-ownership-2026-10-13/results.json)。共享规范、Cedar菜单、Maple中英菜单、两端组件文档及patch Changesets同步。本批新增真实浏览器／OS **0**，144组阻塞保持；下一批依次查KeepAlive、hover耗尽／非法期限边界及真实IAB，不把模拟回调当浏览器验收。未提交／推送／发布。

## Notification 真实 IAB 六组（2026-10-13 晚间）

真实 Cedar 服务／CSS、default/light：原生夹具按钮触发默认、600ms 离场、显式零、clear→同 ID 重加、活动 ID 更新五组，另原生点击真实通知关闭按钮一组，共 **6/6**；最终节点全部0、每组公开关闭回调恰好一次。重加组两个独立 DOM 条目、旧条目不回调；新条目从重加起约606.3ms后回调。更新组 DOM 身份保持，从更新起约609.9ms后回调。手动关闭在约497.7ms发生，早于1200ms自动期限，后续无第二次回调。

实际 CSS 进入400ms、默认离场300ms、长离场600ms/linear、零时长0s；业务展示期限未被视觉零时长改变。默认 leave-to 到移除302.1ms，长离场603.8ms。进入中断的旧条目 class 墙钟跨度不足300ms，但捕获阶段原生 transitionend 的 elapsedTime=0.3s、随后才移除；手动关闭也捕获 opacity 0.3s 完成事件。不能将 class／compositor 时钟混用，也不要求所有退出均产生可见的原生 end 事件；其余退出用真实 DOM 完成链留证，不称帧级认证。固定2ms用于DOM观测容差，没有放宽业务计时下限或CSS事件时长。

初次夹具包含 TransitionGroup 的空测量克隆，已按本夹具明确的内容身份过滤；仅冒泡监听会因Vue在目标处理时移除节点而漏事件，改为公开事件捕获阶段。相关初始探针轮次被最终六组取代、不计通过；没有因夹具观测问题制造产品修复。[六组完整时序／原生事件／原图](./evidence/notification-native-2026-10-13/results.json) 保存原始JPEG及哈希，图已查看，页面无error/warn。

证据门禁新增16项正／反向回归，check:browser-evidence 全链 **122项通过**，校验重加身份、旧回调、活动更新、手动关闭早于自动期限、长离场、CSS事件／DOM完成链及原图哈希。共享规范、两端菜单指南与夹具说明同步。本批无产品源码改动；新增真实IAB6组，真实OS0，未外推其他主题／位置、原生200%或Safari／Firefox，144组阻塞保持。下一轮继续Message双端计时审计。

收尾：本轮自建5198服务和测试标签已关闭，未调整视口／系统偏好。夹具和证据校验器语法、数据校验及受影响空白检查通过；未提交／推送／发布。Vue技能用于分离业务展示计时与真实过渡完成、保留资源归属，不把框架测量克隆或初始不完整探针记作产品通过。

## Notification 服务 clear／重加与减少动效（2026-10-13 晚间）

服务回归先复现 **3/3 失败**：clear 后同 ID 立即重加丢失、全位置 clear 后重加丢失、新条目无独立展示期限。先修 ID 集合清理后 **2 通过／1 失败**，进一步确认同一更新周期 Vue 复用旧 ID 实例、旧计时器提前关闭新通知。最终使用条目对象的内部 WeakMap 实例键，新条目独立、仍活动 ID 原位更新，clear 同步清理 ID 集合且不增加业务 onClose。无公开 key／Token／API。

最终完整 Notification **17 项通过**（6 服务＋9 生命周期＋既有关闭控制＋组件 SSR）；补验活动 ID 身份保持、定向 clear 不影响另一位置、重复 clear 静默。测试模拟 DOM／计时器，不是实际离场动效或真实 OS 证明。

减少动效先用隔离组件 Less 复现失败：root opacity transition 未取消，不能依赖全局极短时长兜底。新增局部 reduce 规则取消 root opacity、左右 enter/appear/leave 过渡和起始 transform，保留静态布局／色彩与业务 duration。编译门禁正常 **20 消费者／20 成对覆写**、减少动效 **44 选择器**通过，沿用六项动效 Token 默认值。当前候选 **192 文件／389 CSS／179 runtime**，历史快照保留；新声明是偏好规则，不等于新动画。[本批证据](./evidence/notification-service-motion-2026-10-13/results.json)。

源码中另有文件名规范化的并行变更，未回退或接管。本轮仅在已复现的 Notification 服务／局部样式上修改，保持两端独立源码与平台边界；Maple 没有对应 Notification。共享规范、两端菜单指南、组件文档、OpenSpec 和 patch Changeset 同步。新增真实浏览器／OS **0**，下一步可补 Notification 真实 IAB 服务矩阵，再审计 Message；144 组原生缩放／Safari／Firefox 阻塞不变，Button 白字例外不变。

收尾：格式化后完整17项再次通过，Cedar 类型、受影响 ESLint、95组件规范检查、check:motion-themes 全链、目录3测试／3生成页及受影响差异空白检查通过。减少动效的限定 !important 范围同步到规范，未放宽普通主题覆盖；源码哈希随本批证据保存。未启动浏览器或服务，未提交／推送／发布。

## Cedar Notification 展示计时／正常动效消费（2026-10-13 晚间）

确认 duration 默认 3000ms／0 持续显示是 **业务展示计时**，不是 CSS 进出动效。先复现 3 项失败／4 项通过：手动关闭后自动回调再发 close；重复关闭及关闭后更新再启动计时器；KeepAlive 停用期间仍自动关闭。初次测试夹具的 hook 返回值／旧 Vitest 不支持 async timer API 已修正，不算产品失败证据。

修复关闭去重、关闭时清理、活动／关闭状态与代次守卫，失效的已出队回调不再关闭实例；停用取消，激活从完整配置时长重新计时，卸载清理。reset-on-update 仅对活动且未关闭实例生效。按 Vue 清理技能补齐资源归属，同时按仓库规范将受改 SFC 转为 script setup，保留模板行为和图标导入。完整 Notification **11 项通过**（9 生命周期＋既有关闭可访问性＋SSR）。

现有六项 transition-* Token 未新增或改默认值。实际 Less 编译校验品牌×明暗的 opacity 与左右 enter/leave，共 **20 消费者／20 成对时长曲线覆写**通过，接入 check:motion-themes。列表仍由真实 TransitionGroup 离场完成决定卸载，duration 不变成动画等待。Cedar 类型、受影响 ESLint、规范检查通过；源码候选当前 192 文件／388 CSS／179 runtime，减少 1 行来自计时器调度收口，不等于额外验收一个组件。[本批证据](./evidence/notification-runtime-2026-10-13/results.json) 保存失败前后数字与源码哈希。

Maple 没有对应 Notification，不伪造 API／Token；两端菜单指南仍同步此平台边界。Message 两端源码及已有回归有其他工作变更，本轮只读、未接管，留下一轮独立复核。共享规范、组件文档、OpenSpec、patch Changeset 同步。新增真实浏览器／OS **0**；Notification 减少动效选择器与原生生命周期仍待验收，144 组原生缩放／Safari／Firefox 阻塞保持。Button 白字例外不变。

收尾：check:motion-themes 含新增正常 Notification 消费者全链通过；目录 3 测试／3 生成页一致。一次格式化后测试在11项通过后出现 close timeout/fsevents 清理告警，已做一次有界独立复跑，11项及退出0正常，未冒充产品失败。下一轮还需核查 Notification 服务 clear→相同 ID 重新添加的 ID 集合归属，当前只是源码候选，不提前记为已复现缺陷。

## LoadingBar 真实 IAB 六组（2026-10-13 晚间）

本轮使用真实 Maple 服务／CSS，原生点击夹具按钮触发 start/finish/error 及明确的延迟业务序列。默认 250ms、600ms/linear（width delay 100ms／opacity delay 200ms）、显式 0ms、重复 finish、关闭途中 start、error，共 **6/6**。MutationObserver 读取实际 DOM width／opacity／error 类及计算后 duration/delay/easing；不读取私有计时器状态。每组最终节点为 0。

长时长组 width 完成至隐藏 **700.9ms**，隐藏至卸载 **802.9ms**；重启组分别 **702.7ms／802.9ms**，旧完成没有提前隐藏新加载。默认 **301.7ms／251.6ms**；零时长仍保留清理下限 **303.3ms／251.6ms**；重复完成 **303.3ms／251.3ms**，只有一次隐藏；error 类可见，清理正常。固定 2ms 为 DOM 观测容差，不是缩短实现下限或帧级保证。

[六组时序及原生 JPEG](./evidence/loading-bar-native-2026-10-13/results.json) 已保留，截图已查看并登记 SHA-256。证据门禁新增 10 项正／反向测试并接入 check:browser-evidence，验证 CSS、完整组数、时序、节点归零与原图哈希。最初 sandbox 监听 EPERM 经仅本机 loopback 审批后恢复；启动前连接失败标签不计验收。没有复查长期超时的 Chrome／Safari 控制，144 组原生缩放／其他浏览器阻塞不变。

本批只新增夹具、证据与门禁，无新产品问题复现／无产品修复。两端菜单和共享规范同步六组边界；真实 OS 减少动效、Safari／Firefox、设备触摸仍未验证。下一轮继续 Message／Notification 的计时与关闭职责审计，不改 Button 白字例外、不接管日期并行工作。

收尾：check:browser-evidence 全链 **106 项测试及各历史／新增数据校验通过**；夹具 JS 与证据校验脚本语法、受影响差异空白检查通过。本轮自建 5198 服务及成功验收标签已关闭，未变更视口或系统偏好。首次连接失败标签按工具临时标签规则回收，不作为证据。

## Button 配色决定已确认（2026-10-13 晚间）

用户明确选择 **保留白字，记录对比度设计例外**。两端 primary-text-color 保留 content-on-dark，主色背景及色阶不改，不继续套用候选 on-bright 修复。default/light 实心主色当前 2.305:1 为已接受的设计例外，不是 AA 通过；其他普通文字门禁仍按 4.5，不借此全局降阈值。允许业务手动选择 7 阶色和配套前景，需自行复核最终状态／背景。

该决定解除配色选择阻塞。此前 6.277:1 留作未采用候选方案的历史证据；全量 Button 对比度检查当前预期报告白字例外失败，不能声称全量可访问性门禁通过。午夜续跑指令已同步该决定，继续 LoadingBar 真实 IAB 及其他组件动效审计，不再等待或重复询问颜色方案。

## 午夜续跑安排（2026-10-13 18:02，上海时间）

用户要求继续至今晚 24:00（2026-10-14 00:00／UTC 2026-10-13 16:00）。已复用本聊天临时 heartbeat cedar-maple-14-00-2，改为每 10 分钟续跑，截止前收尾；没有修改另一个日期聊天的自动化。

当前安全推进顺序：①补 Maple LoadingBar 的真实 IAB 默认／长时长／零时长、重复完成、失败与重启验收及原图证据；②审查 Message／Notification 的关闭与计时职责，再推进其他运行时候选，修复已复现问题；③同步规范、两端菜单指南与证据门禁。Button 的白字／深色前景选择已通过异步问题请求用户确认，确认前不覆盖两端重叠区域或降低文字门禁。

当前清单内 Cedar 45、Maple 32 个文件有 runtime 线索，合计 180 行；这是待分类候选，不是 77 个缺陷或 77 个未完成组件。既有 Ripple、BackTop、LoadingBar 分阶段结果保留；日期／调度器其他开发不接管。原生 200%／Safari／Firefox 无环境变化时不重复超时入口，阻塞数仍 144。

本轮只完成续跑配置和工作顺序登记，新增产品修复、测试及真实浏览器通过数均为 0。后续轮次先读取最新源码与进度，保留并行修改，按证据报告；无变化保持安静。

## 主色 Button 前景修复／Maple LoadingBar（2026-10-13）

**收尾冲突更正**：以下 Button 6.277:1 与图标 3.207:1 为中间修正版本结果。最终复查发现两端 primary-text-color 与共享契约被并行写入恢复 on-dark，当前实心主色再次 2.305:1，因此 Button 修复未交付，不能标当前通过。已停止覆盖此重叠区域，菜单／组件表改回反映当前实现，并记录待用户选择：保留白字并作为明确设计例外，或协调停止并行覆盖后采用已验证的 on-bright 方案。LoadingBar 修改、测试与门禁独立有效。

保留主色背景与 primary-7 色板，只将两端主色普通实心 Button 默认文字从 content-on-dark 改为 content-on-bright；Maple 品牌浅色深背景仍使用 on-dark。两端 system 黑／白前景角色定义及颜色值未变，不引入特殊按钮 system 色。主色实心独立编译验收 **192 组合／640 前景背景对，最低 6.277:1**（此前失败 2.305:1）；Cedar 37／Maple 65 项 Button 回归通过。完整 check:button-themes 仍失败于 default/light primary 图标容器按文字门禁 3.207:1 <4.5，没有跳过该失败或降低默认文字阈值。

7 阶是调色板索引，不是 7:1。业务可手动覆写颜色与文字色，库不自动纠正或禁止；覆写需复核实际主题、底色及 hover/active。规范区分普通文字、大字、纯图标、禁用文字与背景边界，icon 容器有文字插槽时不能因 icon=true 放宽。低对比度设计选择可记录为明确例外，但不声称该组合 AA 通过。共享规范、Cedar 菜单与 Maple 中英菜单，以及两端组件变量表同步说明。

Maple 独有 LoadingBar 新增公开 transition-duration **250ms** 与 transition-timing-function **ease**，只作用 width／opacity／background-color。运行时读取实际节点计算后的 duration/delay，完成停留 max(300ms, width 时序)，淡出清理 max(250ms, opacity 时序)，完成后卸载并可重新挂载；200ms 显示／tick 与清理下限是调度策略，不是 Token。重复 finish 的延迟及关闭阶段去重，start/error 取消过时任务并校验代次；默认选项替换／重置不残留。SSR 无 DOM 时不挂载或创建计时器。

LoadingBar **12 项测试通过**（8 生命周期、3 原有方法、1 SSR），实际 Less 编译 **8 主题／偏好组、4 duration/easing 成对覆写**通过。减少动效关闭视觉过渡，不改变进度／清理；零时长与模拟样式不冒充 OS 验收。两端类型、受影响 lint 与规范检查结果另存 [本批证据](./evidence/button-loading-bar-2026-10-13/results.json)。候选当前 192 文件／388 CSS／180 runtime：超时调用集中到调度器会减少线索数，不等于完成六个额外组件审计。历史快照不重写；无日期改造、提交、推送或发布。

下一步：全 Button 图标／文字容器及其他语义色前景分项核对，再按候选职责推进其他运行时组件；真实 Chrome 200%／Safari／Firefox 144 组阻塞保持。本批新增真实浏览器／OS **0**。

## Button 稳定复查／候选门禁收口／BackTop 运行时（2026-10-13）

Button 两端样式经多次 SHA-256／mtime 观察保持一致，保留其他任务的修改。Cedar 37 项与 Maple 65 项组件回归通过；Maple 示例测试隔离需要 @config 的文档启动外壳，仍挂载真实组件。禁用态编译检查 4096 组合通过。**完整 Button 配色检查仍失败**：default/light primary 普通实心按钮正文对比度 2.305:1 < 4.5；尚未修复系统主色／前景决策，未放宽阈值或声称 Button 完全收口。

候选门禁改用 [当前基线](./motion-source-inventory.json)，不重写历史证据。Cedar Button 多行化后新增的声明识别是统计漂移，不是新增动画证明；扫描补入 setTimeout 以覆盖生命周期调度。目前 Cedar 103 文件／199 CSS／98 runtime，Maple 89／188／88，合计 **192／387／186**。逐行线索含非动效计时器和工具代码，不等于缺陷、已验收数或全部剩余工作量。4 项扫描回归与 check:motion-themes 全链通过：96 主题偏好组合、88 primitive 时长覆写、176 模态 active 消费、96 成对时长曲线覆写。

两端 BackTop 修复三类已复现问题：动画中开启减少动效后下一帧回顶、目标切换后已出队帧不得改旧目标、跨 iframe 目标使用所属文档偏好。取消递增代次，重复点击／停用／卸载使旧帧失效。每端完整测试 **16 项**，其中新增 3 项修复前失败、修复后通过；两端类型、受影响 ESLint、12 对独立源码／样式／测试检查通过。保留 duration 200ms／easing quartOut 的 JS API，不新增 CSS Token，横向滚动不变。共享规范、两端菜单中英指南、组件文档、OpenSpec 与 patch Changesets 同步；目录 3 测试／3 生成页一致。记录见 [本批证据](./evidence/runtime-motion-2026-10-13/results.json)。

本批新增真实浏览器／OS 验收 **0**；使用模拟 RAF、jsdom iframe 文档、SSR 与实际 Less 编译。Chrome 原生 200%／Safari／Firefox 144 组仍阻塞。下一批优先 Button 系统前景对比度决策与 Maple 独有 LoadingBar 生命周期／动效消费审计，后者不伪造 Cedar 对应组件。全局候选其余项仍需按职责分类，不能把 192 文件直接换算成未验收组数。Vue 清理规范用于取消与卸载边界；未接管日期工作、提交、推送或发布。

## Ripple：250ms 生命周期与动效消费审计（2026-10-13）

两端四项既有 Token 均核对：color=currentColor（指令 color 优先）、cubic-bezier=cubic-bezier(0.68,0.01,0.62,0.6)（仅 transform 曲线）、expand-duration=200ms、fade-duration=140ms（opacity 显现／消退，线性）。默认值、实际消费者及两份独立指令一致；本批不新增 Token／Props。250ms 分别是创建后最小展示和淡出后最小删除等待，不是 CSS 动效时长或总生命周期；30ms 创建、20ms 激活仍是内部调度。

新增回归在修复前复现 **五项失败**：长计算时长被固定等待截断、重复释放重复排队、父层禁用误删嵌套波纹、全局 document 误接管 iframe 波纹、无关 keyup 结束按住的 Enter。两端同步修复：从波纹 ownerDocument 读取真实 computed transition duration/delay（s/ms、列表重复、all／末项匹配），以实际激活后的扩散截止与创建+250ms 较晚者决定淡出，删除等待 max(250ms, opacity timing)。每波释放去重，只清理所属直接节点，文档监听注册／清理绑定挂载文档；本宿主按键与对应释放配对。按 Vue 技能的资源清理路线补齐取消定时器与监听验证，不把模拟时钟当浏览器动画证明。

生命周期永久回归新增 **每端 12 项**，完整 Ripple 测试 Cedar 17、Maple 22，共 **39 项通过**：默认精确下限、长时长与 delay、快速按放、0ms／none、列表重复／负 delay、重复释放、显现／消退阶段禁用、可见波纹卸载、嵌套归属、实际 iframe 文档及按键匹配。旧 Cedar 模拟时钟测试补齐 performance.now 时钟同步，避免假时钟推进而单调时钟不推进造成误判；不是放宽时间断言。两端 check:ripple、完整类型、Maple 完整 lint:check、Cedar 受影响 ESLint、两端规范及 Maple 样式契约通过；1006 个 demo SFC 语法检查通过。

真实 IAB Enter（Cedar）／Space（Maple）× 默认、600ms 扩散／800ms 消退、显式 0ms：**6/6 组通过**。实读 CSS duration 分别 0.2s/0.14s、0.6s/0.8s、0s/0s；长扩散实际约 601ms 后淡出、消退约 801ms 后删除，最终 DOM 波纹数为零。MutationObserver 时间允许固定 2ms 观测误差，不是缩短实现下限、帧级认证或完整设备矩阵。[六组记录与原生 JPEG](./evidence/ripple-motion-2026-10-13/results.json) 已独立保存、原图查看并校验 SHA-256。一次读取非 DOM 私有状态的诊断被浏览器只读范围拒绝，明确不计入原生 timer 证据；相关清理由单测证明。浏览器页面无 error/warn 日志。

编译消费者独立检查通过：motion-theme-check 的 96 主题／偏好组合、88 primitive 覆写、176 模态 active 消费及 96 duration/easing 成对覆写；foundation-theme-check 的 448 项通过。证据门禁扩为 **96 项正／反向测试**并校验 Ripple 六组／原图；历史 Popup／iframe／嵌套证据不改写。Token 目录三项测试及三份生成页一致，生成目录补充 CSS → computed transition → 生命周期间接消费说明，不将其冒充字面 var() 引用。共享规范、Cedar 菜单指南、Maple 中英菜单指南、两端组件文档／示例、OpenSpec 与 patch Changesets 同步。

**保留的全局门禁问题**：check:motion-themes 的源码候选清单因本批之外的 Cedar Button 并行 CSS 变更漂移（观测 Cedar 声明 199 vs 基线 198，总量 387 vs 386）；因此该聚合命令本轮不通过，以上通过数字来自独立消费者检查，不能声称全量门禁已通过。未修改 Button、接管日期开发或重写历史候选基线；应在相关工作稳定并审查后更新清单。主题契约／Maple 样式契约当前 1063 项受管组件值包含其他任务变化，不记为本批新增 Ripple API。

范围收尾：自建服务及测试标签已关闭，未改视口／系统偏好，未提交／推送／发布或运行全库生产构建。跨文档搬迁后的监听重绑、任意中途 CSS 改动、自定义 animation、真机触摸、真实 OS reduced-motion、屏幕阅读器不在本次通过范围；原生 200%／Safari／Firefox 仍有 144 组未通过。下一步可继续按真实职责分流其他组件运行时动效候选，或在并行工作稳定后收口全局候选清单。

## Popup 动效 Token 与生命周期收口（2026-10-13）

Maple Popup 新增平台组件 API：--mp-popup-transition-duration=250ms、--mp-popup-transition-timing-function=ease，替换八处内置过渡硬编码。与 Cedar Drawer 对齐职责和命名，不统一成另一个默认时长、不借用 Dialog Token、不新增虚假的 Cedar Popup 变量。主题契约新增两项 Maple-only 默认值；reduce 仍优先。共享规范、Cedar 菜单指南、Maple 中英菜单指南、Popup 中英文档、实际挂载宿主覆写示例及三份生成目录同步。两端 OpenSpec 及 Changesets 已补齐，Maple minor（新 CSS API）、Cedar patch（生命周期修复）。

永久回归先复现三项失败：关闭完成前 shouldRender 已为 false、完成事件可重复、快速重开完成事件重复。修复两份独立 popup-transition：关闭过程中保留内容，按当前 opening/closing 阶段去重，销毁后不补发。保留初始打开的既有 mounted 通知行为，不声称完整 appear 计时。Overlay 旧测试的关闭即卸载假定改为真实 Transition／实际 closed 事件等待，不用固定 250ms JS 时钟。

实际 Maple 源码 Popup、真实 Teleport 与共同宿主的 IAB **9/9 组通过**：默认 250ms/ease、五方向 600ms/linear、显式 0ms、60ms 快速关开、销毁清理。实读 active 选择器 duration/easing、事件时间戳、插槽挂载／卸载计数、宿主滚动锁、触发器焦点；快速重开保留输入且不误发 closed。关闭完成后插槽实例卸载，嵌套 Transition 的隐藏 DOM 可短暂保留，最终稳定态为空；不把稳定态根的 0s 误判为 active fade 无动效。七张原生 JPEG 均已查看并登记哈希。[逐组证据](./evidence/popup-motion-2026-10-13/results.json) 由 popup-motion-evidence-check.mjs 校验，已接入 check:browser-evidence；不是旧证据重写。

验证：两端 portal／生命周期回归 **106 项（每端 53）**；额外受影响组件测试 Cedar 26、Maple 25 项；76 份独立 foundation 一致。编译 CSS：96 主题／偏好组合、88 primitive 时长覆写、176 模态 active 消费、96 成对 duration/easing 覆写。既有证据门禁 88 项及新增九组／七张哈希检查通过。两端完整类型、规范检查、Maple 完整 Lint／样式契约／1005 个 demo SFC 检查、Cedar 受影响文件 ESLint 通过；目录三项测试和三份生成页一致。未运行全库生产构建，未提交／推送／发布，未接管日期开发。

收尾：本批自建冻结服务与测试标签已关闭，未改视口或系统偏好。显式 0ms **不等于真实 OS reduced-motion**；Chrome 原生 200%／Safari／Firefox 仍有 144 组阻塞，真机、真实 OS 切换、屏幕阅读器及任意自定义转场继续未验收。下一步可按候选的真实职责推进其他组件动效消费者／运行时计时审计，特别是 Ripple 的 250ms 生命周期边界；165 文件候选清单不是已通过矩阵，也不意味着全部还有缺陷。

## 动效与配色准备：模态缺口修复及证据分层（2026-10-13）

本批是实际 Less 编译／源码盘点，**新增真实浏览器或 OS 验收 0 组**。动效候选盘点覆盖两端 165 个文件、386 处 CSS 声明、118 处运行时调用，保存为 [源码候选清单](./evidence/motion-contrast-2026-10-13/source-inventory.json)。这些不是 504 个缺陷，也不是全部消费者已验证：局部 media 存在不代表每个选择器覆盖；计时器可能用于非动效职责。check:motion-themes 增加清单漂移门禁。

真实模态 CSS 检查复现 Cedar Drawer 独立样式缺少 reduce 分支：fade-drawer/enter-active 的 transition 仍为正常 duration/easing。Maple Popup 源码同样缺少内置 pop/fade 的偏好分支，不能依靠 Dialog 内容颜色过渡的规则替代。补齐两端组件规则：reduce 下关闭内置过渡和起始位移／缩放，Popup 基础内容／遮罩过渡也关闭；不改变正常时长、不新增 API／Token、不修改另一日期任务。检查扩至 **96 个主题／偏好组合、88 项时长覆写、176 项实际模态 active 选择器消费**，另检查起始 transform 与基础过渡。真实 OS 动态偏好、动画中间帧及关闭计时仍需环境验收。

配色新增直接组件变量成对覆写及透明合成检查：**16 个平台／主题组合，72 组默认 + 80 组显式配色，最低显示值 5.102:1**。比较使用未舍入比值；低对比度示例、未知半透明底层、非法颜色均拒绝，10 项正／反向测试通过。文字以 4.5 为本检查阈值，不冒充完整 WCAG 认证、非文字对比度或任意业务插槽保证。根 system 别名的局部重算边界仍保持既定规范。check:modal-themes 已接入这组测试。

验证：check:motion-themes、check:modal-themes、两端 96 项 portal 永久回归、Maple 全库 lint:check 通过。只有 Less／门禁／文档改动，没有 Vue API 或类型改动；未重新声称全量类型／生产构建已跑。共享规范、Cedar 菜单指南、Maple 中英指南及相关组件文档同步。

收尾：Token 目录 3 项测试及 3 份生成页面检查通过；两端 patch Changesets 同步。没有启动浏览器服务、修改系统偏好或恢复自动化，没有提交／推送／发布。结构化结果见 [本批结果](./evidence/motion-contrast-2026-10-13/results.json)。

明确后续：Maple Popup 既有 250ms 还没有独立 duration/easing Token，本批保留既有默认值，未借用别的组件变量或静默变为 system standard。下一阶段先完成这项动效参数化规范和生命周期回归，再对源码候选按真实职责逐批分流。Chrome 原生 200%／Safari／Firefox 144 组、真机、真实 OS reduced-motion、屏幕阅读器仍未通过。

## 嵌套浮层：8 组真实验收完成（2026-10-13）

独立 IAB 夹具 nested.html 使用两端源码与实际 body Teleport，Cedar Drawer／Maple Popup × default/light、default/dark、maple/light、maple/dark，最终 **8/8 组通过**。每组执行子层先关、父层先关、父层单独重开，记录 18 个分步状态：Tab／Shift+Tab 栈顶约束、隐藏／禁用控件排除、Escape 仅关闭一层与关闭后不重复响应、子层／页面触发器恢复、实际层级与遮罩命中、稳定态配色／边界、引用计数锁及滚动条补偿。背景抑制只证明真实键盘与指针行为，不外推屏幕阅读器隔离。

两端均复现父层先关后，子层关闭焦点落到 BODY 而非页面触发器。保存两张原生失败图；新增真实 Teleport 单测修复前失败。两份 modal-focus 打开时保存祖先 opener 链，关闭时跳过隐藏、禁用、inert 或断开的候选；父层退出不抢占仍打开的子层，新外部焦点也不被抢占。无 API／Token 变更，遵循 Vue Best Practices 的真实 DOM 测试路线。两种关闭顺序最终均恢复原始页面按钮；锁保留至最后一层关闭。

[分步记录及 18 张原图清单](./evidence/nested-2026-10-13/results.json) 已纳入证据门禁，八张打开视图逐一查看；两张失败图不改写为通过。96 项相关回归通过（每端 48），88 项证据门禁通过，75 份独立 foundation 一致；两端完整 typecheck、Maple 完整 lint:check 与 Cedar 受影响文件 ESLint 通过。共享规范、Cedar 菜单指南、Maple 中英菜单指南、夹具 README 与两端 Changesets 已同步；最终 Token 目录检查另在收尾补记。

本批范围为同库、同文档 body 目标、默认保留挂载。跨库协调、父层 unmountOnClose 移除、跨文档嵌套、三层以上组合是独立边界，未计入八组。Chrome 原生 200%／Safari／Firefox 的 144 组继续阻塞；真机、真实 OS reduced-motion、屏幕阅读器未验收。下一步可做 reduced-motion 规则及默认／显式覆盖配色审计，静态检查不能记作 OS／设备通过。

收尾：Token 目录三项测试通过，三份生成页面与当前声明匹配。用户追问状态时运行时会话已结束，旧 REPL 标签绑定与服务进程句柄不再存在；只读复查本机 5198 已无服务响应，IAB 当前标签清单为空，不据此声称执行过主动停止命令。未设置视口／缩放覆盖，未提交、推送、发布或恢复自动化。

## 真实同源 iframe：8 组验收完成（2026-10-13）

IAB 使用真实 iframe／frameLocator 与两端源码组件，Cedar Drawer／Maple Popup × iframe 开关、父文档 → iframe、iframe → 父文档、迁移后关闭重开，最终 **8/8 组通过**。父文档独立 default/light，iframe 独立导入真实 CSS 并应用 maple/dark；两份 document 实读主色元组分别为 0,190,190／251,146,60，两端 scheme 分别 light／dark，没有复制父文档样式节点或调用处变量。逐组记录目标 ownerDocument、配色、稳定态几何、两文档焦点链／宿主锁、Tab／Shift+Tab、Escape／Enter 关闭及原始触发器恢复。额外两组原生检查确认 Escape 的目标文档归属，关闭后不再重复响应。

发现并修复两端 modal-focus 的跨文档初始 opener 捕获错误：父页面触发 iframe 模态时原来捕获 iframe BODY，关闭后父页面焦点停在 IFRAME。保留两端修复前原图；新增真实 iframe 回归在修复前失败。现在沿可访问同源祖先焦点链捕获 opener，迁移不重新捕获，用户已转到外部祖先控件时不抢焦点。没有新增 API／Token，Vue Best Practices 技能要求的真实 DOM 路线未使用 Teleport stub。

首轮诊断还发现夹具宿主缺少定位滚动边界，导致 Drawer 在文档滚动后裁剪；这是夹具条件错误，未据此修改产品 CSS。已修正为有界定位宿主、重启冻结服务并在新测试标签重新采集最终八组。诊断数据／八张 probe 原图保留为非通过证据，重启中的连接失败与旧句柄调用不计入通过。[最终 JSON、原图与清单](./evidence/iframe-2026-10-13/results.json) 永久保存，最终八张原图逐一查看。

验证：两端 portal／焦点／层级／锁永久回归各 47 项，共 **94 项通过**；75 份独立 foundation 一致；证据门禁扩至 **62 项通过**。两端类型检查使用既定项目命令；Cedar 最初直接检查 tsconfig.json 遇到 rootDir 配置错误，改用仓库既定 declaration typecheck 后通过，没有修改编译配置。Maple Lint 首次指出新增条件缺花括号，已修正。最终 Lint 结果在本节收尾补记；没有进行生产文档构建。规范、两端菜单指南、夹具说明及两端 Changesets 同步。

本批覆盖同源跨文档，不等于跨源、宿主脱离／iframe 移除、真机或辅助技术。Chrome 原生 200%／Safari／Firefox 的 144 组继续保留阻塞，未计入本批。下一步为既定的 8 组嵌套弹层键盘生命周期。

收尾：两端完整类型通过，Maple 完整 lint:check 与 Cedar 完整源码 ESLint 通过；Token 目录三项测试及三份生成页面检查通过。冻结服务和本批正常测试标签已关闭；旧连接错误标签的关闭被支持入口的 URL 策略阻止，未绕过策略，可手动关闭。未设置临时视口／原生缩放，未提交、推送或恢复自动化。原生八组采集后仅补齐了等价花括号格式，不改变行为；最终永久回归重新跑完 94 项。

## 非阻塞批次：证据防误判与后续验收分流（2026-10-13）

Chrome 原生 200%／Safari／Firefox 阻塞继续保留，本批不重试挂起入口。已完成两项可验证改进：为修复前后 12 张焦点原图新增独立 SHA-256／编码尺寸清单并纳入门禁；将 14:12 阻塞复查纳入门禁，拒绝伪称通过、少报剩余组、遗漏套件或恢复条件。新增反向用例还防止修复前 native 失败被改写。`pnpm check:browser-evidence` 从 33 项扩至 **46 项全部通过**。没有改变截图字节、产品源码、Token 或 API，也没有新增浏览器验收通过。

后续顺序已写入 [夹具验收说明](../refactors/token-validation/browser/README.md#next-executable-acceptance-batches)：① IAB 真实同源 iframe，先确认支持的 frame 控制，再做两端 × 四场景共 8 组，区分目标文档样式／焦点链／滚动锁；② 两端 × 四主题的 8 组嵌套模态键盘生命周期；③ reduced-motion 规则和默认／显式覆盖配色审计。前两批属于可继续推进的计划，**尚未执行／通过**；规则或编译检查不能代替真实 OS 动作减少。真机、屏幕阅读器、系统设置及外部浏览器仍按独立环境待办，不要求在入口无变化时机械重复检查。

共享规范与两端菜单指南同步证据清单要求及下一步范围；原生缩放／Safari／Firefox 仍为 144 组待测。既有 48 桌面／12 窄屏／10 修复后迁移结果保留，不合并成全浏览器覆盖数字。

## 下一阶段：浏览器入口有界复查（2026-10-13，14:12）

按用户新请求复查三套入口。新清单仍为 Chrome extension／MCP Apps／IAB，Chrome 已按实际类型及当前 id 1 绑定，读取有效支持接口后尝试 nameSession → tabs.list；20 秒内未完成，执行超时并重置，无法确认超时落在哪一步。未创建／导航测试标签，更未设置或验证原生 200%。Safari／Firefox 仍无支持会话；Safari 先前原生入口长时间挂起，未机械重试。Firefox 四个标准／Developer Edition 路径再次确认不存在，自定义位置未排除。

本阶段新增真实验收通过仍为 **0**，原生 200%／Safari／Firefox 各 48 组、共 144 组继续阻塞。独立保存 [14:12 复查证据](./evidence/browser-environment-2026-10-13/recheck-1412.json)，历史环境快照、旧失败及 IAB 通过记录不改写。没有修改产品源码／Token、安装软件、更改权限或恢复临时自动化。下一步需要用户恢复 Chrome 支持连接、提供可响应的 Safari 支持控制入口，或给出 Firefox 实际安装位置及支持入口；连接未变化前不重复超时调用，也不以既有 IAB 结果冒充这三套验收。

可完成的静态核对：现有证据门禁 33 项通过，Token 目录 3 项测试通过且三份生成页面匹配当前声明。共享规范、两端菜单指南及夹具 README 已同步本轮阻塞与范围。门禁验证不是新浏览器通过；本轮没有产品修复，也没有运行完整源码测试／类型／Lint，因为未改产品源码。

## 14:00 截止前收尾（2026-10-13，13:57）

午间继续工作已完成可安全推进的修复与证据收口：发现并修复两端同文档迁移丢失焦点，修复后 IAB 十次迁移、两端键盘循环和关闭焦点恢复实测通过；原始八次失败保留。62 张历史原图按实际 JPEG 改名，字节哈希不变；新增历史证据及独立修复后证据门禁，截止前重跑 33 项全部通过。共享标准、两端菜单 Token 指南和验收说明已同步。未新增 Token／API，未接管日期开发，未提交／推送／发布。

真实数量分开统计：既有 Chromium 普通开关矩阵 48/48、窄屏长文本 12/12；午间新增修复后迁移焦点 10/10，不能合并宣传为 70 组全浏览器矩阵。原生 200%／Safari／Firefox 新增通过为 0，仍各有 48 组待测，共 144 组。Chrome 操作连续超时、Safari 支持原生控制超时、Firefox 标准安装路径及支持会话缺失；后续需要恢复对应支持入口，不能用 IAB 窄屏或其他引擎代替。

本阶段自建服务／标签已关闭，临时视口已恢复。环境无实质变化期间没有反复执行已完成验收或重复挂起入口。截止后不启动新工作；临时自动化达到截止时暂停。后续真机、OS reduced-motion／屏幕阅读器、真实 iframe 和业务插槽配色仍属于未覆盖范围，不因本次收尾视为通过。

## 午间续跑：原生焦点复验完成（2026-10-13，11:44 起）

修复后 IAB 原生复验 **10/10** 通过：Cedar Drawer／Maple Popup 在 default/dark、长文本、320×640 CSS viewport 下，打开中 host → inline → body → host → body 各五次，动效稳定后实际 activeElement 始终在面板内；目标祖先、背景和 body 锁随挂载变化。两端分别通过 Tab／Shift+Tab 首尾循环、Enter 关闭、最初触发器焦点恢复和 body 锁释放。十张新 JPEG 原图及 [独立逐次结果](./evidence/portal-focus-2026-10-13/after.json) 已保存并查看最终截图。该记录的 color 是面板根 computed color，不能拿它替代 Cedar 内容节点的前景色验收。

环境诊断更正：runtime reset 后浏览器编号发生重排，旧 id 2 已指向 MCP Apps，其 get/list 限制被误判为 IAB API 退化；按新清单重新绑定实际 IAB（id 3）后完整支持入口可用。上一节描述的是当时的阻塞及错误诊断，不再是当前 IAB 状态。原始八次焦点失败保持不变，修复后证据另存；92 项永久回归结果保持不变。本批不增加原生 200%／Safari／Firefox 通过数，三个独立 48 组仍待验收；没有接管日期工作或新增 Token／API。

证据门禁已扩展至独立修复后记录，防止缺失组、焦点逃逸、旧宿主残留、关闭未恢复及窄屏伪称原生缩放；33 项正／反向测试通过。共享规范及 Cedar／Maple 三份菜单指南同步加入本次实测范围与会话重新绑定要求。临时视口已恢复，测试自建标签已关闭，服务已停止；不再重复连续超时的 Chrome／Safari 原生入口，等待支持入口变化。

## 午间续跑：证据门禁与同文档迁移焦点修复（2026-10-13，11:23 起）

环境会话清单复查仍只有 Chrome／MCP Apps／IAB，没有 Safari／Firefox。没有重复调用之前可能挂起很久的 Chrome 或原生控制接口；原生 200%／Safari／Firefox 新增通过仍为 0。

在可完成的证据一致性检查中发现两项遗漏并处理：

- 62 张浏览器原图的实际格式是 JPEG，但文件名曾为 .png。已改为 .jpg，逐文件 SHA-256 校验确认字节不变，没有转码、重采或重绘；四张 PNG 总览未改。新增 [截图目录／真实尺寸／SHA-256](./evidence/portal-2026-10-13/screenshots.json)。图像导出尺寸与 CSS viewport 不一定一一相同，例如 host 普通组为 1265×712、DOM viewport 为 1280×720；分别记录，不据此推断原生缩放。
- 旧的十次打开中切换只检查了目标、颜色与锁，没有把记录中的 focusInside=false 判为失败：两端各四次，共八次。保留旧 JSON 原值，增加 knownIssues 标记，不改写成通过。IAB 修复前原生复验 host → inline，等待 400ms 后两端焦点仍为 BODY，截图与 [复验状态](./evidence/portal-focus-2026-10-13/status.json) 已保存。这不撤销 48 组普通开关矩阵的初始／关闭焦点结果，但十次迁移不能再统称为完整键盘验收通过。

修复两端 modal-surface：监听实际 Teleport 目标及 inline 状态，DOM 迁移完成后让当前顶层活动模态恢复焦点；不重新捕获最初触发器，不抢占更高弹层。真实 Teleport 用例在 host → host、host → inline、inline → body 后检查面板实际包含 activeElement。修复前 Cedar Dialog／Drawer 两项均失败；修复后两端永久门禁各 46 项，共 92 项通过。没有新增 API／CSS Token，也未修改其他日期开发工作。

修复后的原生浏览器复验尚未完成：重载期间 runtime reset 清理了自建标签页；恢复后的 IAB 支持 API 只暴露 get/list，不再有 new/reload/goto，应用打开请求返回 queued，未出现可绑定标签页。这个新环境阻塞单独记录；不能用单测代替修复后原生焦点结果。恢复后优先复验这十次迁移，再继续缩放／其他浏览器。

新增 `pnpm check:browser-evidence`：校验历史 48 组及 12 组窄屏唯一性、真实 owner／主题／配色、锁、稳定态、PNG/JPEG 实际头部与尺寸、66 份字节哈希、邻居隔离、旧迁移焦点失败的如实披露以及三套待验收环境不能被静默标为通过。这只是证据完整性门禁，不执行浏览器，不增加通过数量。旧焦点失败必须保留，修复后结果另存，不能为了门禁绿灯篡改旧值。

最终核对：证据门禁 27 项正／反向测试通过，75 份独立 foundation 副本一致，三份 Token 目录匹配；两端完整类型通过，Maple 完整 lint:check 和 Cedar 完整源码 Lint 通过。修复前两端原生失败截图为真实 JPEG。本批启动的本机服务已停止，自动续跑仍按 14:00 截止执行；当前未对原生 200%／Safari／Firefox 或修复后原生焦点新增通过项。

## 后续批次：原生 200% 缩放与 Safari／Firefox 环境检查（2026-10-13）

本批 **新增实测通过数为 0**；没有把环境连接失败判为组件失败，也没有沿用上一批 Chromium 结果作为 Safari／Firefox 或原生缩放结果。

| 项目 | 实际检查结果 | 当前阻塞／恢复条件 |
| --- | --- | --- |
| 原生 200% 页面缩放 | Chrome 154.0.8037.98 已安装且出现在支持的会话清单；创建／导航标签页超时，后续读取标签列表也超时，运行环境重置 | 恢复 Chrome 会话或原生应用控制后，先确认浏览器自身的 200% 页面缩放显示，再执行 48 组；IAB 的 viewport 能力不能替代原生缩放 |
| Safari | 已安装 18.4；浏览器会话清单无 Safari。原生控制 getState 超时；直接 getApp('Safari') 最终返回 timeoutReached，未得到可用 UI 状态 | 恢复支持的 Safari 原生控制或浏览器连接；已安装不等于可操作，更不等于已验收 |
| Firefox | 会话清单无 Firefox；/Applications 与用户 Applications 的标准／Developer Edition 应用路径均未找到 | 提供已安装 Firefox 和支持的控制入口；此检查不排除其他自定义安装位置 |

可完成的工作已推进：确认本机应用版本和可用入口、启动并停止无热更新的本机夹具服务、保存 [环境证据与待测矩阵](./evidence/browser-environment-2026-10-13/status.json)，以及在 [浏览器验收说明](../refactors/token-validation/browser/README.md#native-zoom-and-safarifirefox-resume-protocol--2026-10-13) 补齐原生缩放确认、跨浏览器判定、配色／挂载／键盘／滚动和结果记录清单。三套待测任务各沿用既有 48 组，不新增组件 API、CSS Token 或未经复现的产品修复。

没有安装浏览器、改权限／系统设置、使用原始 CDP／AppleScript 绕开支持入口，也没有把 CSS zoom、缩窄 viewport、WebKit 自动化或静态编译检查记作 Safari／原生缩放。Chrome 创建标签页的最终状态未能核实，因此没有盲目操作用户标签页；本批启动的本机服务已停止。

下一次恢复时，先解决 Chrome 控制并完成 200% 验收，再推进 Safari 和 Firefox。已完成的上一批 48 组 Chromium、12 组窄屏等证据保持不变；本批阻塞不撤销它们，也不补足其他引擎覆盖。若安装版本不满足既定最近两个主版本基线，还需补齐目标版本后再对外声明该基线的兼容性。

## 后续批次：48 组真实浏览器视觉验收（2026-10-13）

使用支持的 Codex In-app Browser（Chromium）加载真实源码组件。完整矩阵为 Cedar Drawer／Maple Popup × default/light、default/dark、maple/light、maple/dark × body、host、inline × 普通／长文本，共 **48/48 组通过**。截图在动效稳定后采集；同时读取实际主题、挂载祖先、computed 前景／背景、面板与页面尺寸、焦点和关闭清理，不只检查下拉框标签。四份截图总览已人工逐组查看。

本批发现并修复两处产品问题：

- 两端 popup-container 的 host → inline → body 会残留在旧宿主。根因是 disabled Teleport 同时改变目标时保留旧目标；改为 inline 时保持上一个启用目标，重新启用时解析当前目标。inline 的滚动锁仍按实际面板文档 body 归属。加强真实 Teleport 单测，明确排除两个旧宿主，并覆盖关闭／重新打开；修复前 Cedar 的 Trigger、Dialog、Drawer 三项均复现失败。
- Cedar Drawer 在 320px 自定义宿主保留页面滚动条时，`100vw` 宽度超出实际包含块 15px，左边界为 -15px。增加结构性的 `max-width: 100%`，修复后 left=0、width=305px；编译后的模态样式门禁新增此断言。没有新增 Token 或改动 system 色角色。

附加实测：320/390px × 两端 × 三种挂载的 12 组长文本均不撑宽页面；长连续标识符保留面板内部水平滚动，不强制改变业务插槽的断词。两端打开中各完成 host → inline → body → host → body 五次目标检查，颜色与滚动锁正确迁移。320px 下 Tab 可将 Cedar 底部关闭按钮滚入视野（scrollTop=47），两端 Enter 关闭成功。两端邻居实例和 root 变量在局部宿主覆盖前／中／后保持不变。

证据永久保存在本仓库 [portal-2026-10-13](./evidence/portal-2026-10-13/results.json)：48 张桌面原图、12 张窄屏原图、2 张键盘原图、4 张主题总览以及逐组 JSON。总览分别为 [default/light](./evidence/portal-2026-10-13/contact-default-light.png)、[default/dark](./evidence/portal-2026-10-13/contact-default-dark.png)、[maple/light](./evidence/portal-2026-10-13/contact-maple-light.png)、[maple/dark](./evidence/portal-2026-10-13/contact-maple-dark.png)。旧的临时截图不是最终通过证据。

验证：两端 portal-scope 永久门禁各 46 项，共 92 项通过；另有 Cedar Dialog／Drawer／Trigger 30 项、Maple Dialog／Popup／Trigger 60 项通过；75 份独立 foundation 副本一致；模态主题 16 组合／72 前景配对通过；两端完整类型和 Lint 通过；三份 Token 生成目录匹配。共享标准、Cedar 菜单指南、Maple 中英文菜单指南、浏览器夹具说明与 Changesets 同步更新。没有运行完整生产文档构建。

页面曾被其他日期开发的热更新中断；稳定服务以 `TOKEN_ACCEPTANCE_FROZEN=1` 关闭监听，重载后重新采集最终 48 组，未把中断记录计入通过。此开关只冻结页面热更新，不冻结仓库其他工作，也不应在修复后不重载就继续采集。

剩余验收：200% **原生浏览器缩放**（当前 IAB 无专用缩放能力，不以 CSS zoom 或窄屏替代）、Safari／Firefox、iOS／Android 真机、真实 OS reduced-motion 与屏幕阅读器、真实 iframe 焦点／样式，以及任意业务插槽的自定义配色。48 组 fixture 配色通过不等于全组件、全业务或全浏览器完成。后续先做可支持的原生缩放和其他桌面浏览器，再做真机／辅助技术。

## 后续批次：日期集成复验已收口（2026-10-12）

上一轮的 3 项 DatePanel 类型错误及 21 项日期 Lint 错误已不再存在。当前代码已经补齐 showNow / nowDisabled / selectNow，本批没有重复实现这些成员，也没有接管或重写日期选择协议。

本次集成工作：

- 修正 Cedar DatePanel 的导入顺序与花括号，并对齐当前动作栏、范围重排及相关用例的格式。保留已有实现和行为，不减弱源码配对断言。
- 两端 date-family 检查从 29 对扩至 33 对，新增 date-current、normalize-date-range、DatePanelActions 及 date-current-range 测试，继续保持独立源码副本。
- Maple 初次回归的 5 个失败全部是快照缺少规范要求的“此刻”动作栏及 disabled 状态。核对 align-date-current-range 现有规范与当前动作行为用例后，仅更新该 Picker 测试文件的 7 份快照；没有全库批量刷新快照。最终全套回归不带 -u。
- 复查期间新日期 Demo 曾出现 10 项格式错误；最终完整 lint:check 零错误零警告。保留已有示例内容，未增加 CSS 定制 API。

| 验证范围 | 最终结果 | /private/tmp 日志 |
| --- | --- | --- |
| Cedar 日期 / 范围日期 | 14 文件、78 项通过，含 SSR 与真实组件交互 | date-integration-cedar-tests.log |
| Maple 日期 / 范围日期 | 15 文件、110 项通过，含 SSR 与真实组件交互；不带快照更新参数 | date-integration-maple-tests-final.log |
| 完整类型 | Cedar 声明范围、Maple 全 src（含示例）通过 | date-integration-cedar-types.log、date-integration-maple-types-final.log |
| 完整 Lint | Cedar 全组件源码、Maple 全库通过；Cedar 最终改动文件另有局部复验 | date-integration-cedar-lint.log、date-integration-maple-lint-final.log、date-integration-cedar-scoped-lint.log |
| 日期同源 | 33 对及 field/panel 边界通过 | date-integration-parity-verified.log |
| 示例语法 | Maple 990 个 Demo SFC，0 失败 | date-integration-maple-demo-check.log |
| Token 目录 | 三份生成目录匹配当前声明 | date-integration-token-catalog.log |

本批没有新增、删除或修改 CSS Token 的名称、默认值及 system 颜色语义，因此不向菜单指南追加新的 Token 设计规则；已有规范和参考目录继续有效。未重新执行完整文档／库生产构建，不将示例解析或单测记为生产页面、真实浏览器或真机验收。

当前不再保留“日期集成复验”这一阻塞项。剩下 4 类环境验收：48 组挂载／长文本视觉矩阵及窄屏／缩放／业务配色、Safari／Firefox、iOS／Android 真机、真实 reduced-motion 与屏幕阅读器。下一批优先执行已准备的 48 组浏览器矩阵。下方旧批次的失败数字为当时快照，已由本节最新结果覆盖，不重复列为当前待办。

## 后续批次：打开状态跨文档迁移（2026-10-12）

本批继续完成上一批的动态文档归属边界，不新增 CSS Token 或公开 API。

- 修复两端打开中的模态面板跨文档迁移：焦点事件与弹层注册跟踪响应式目标文档，不能只等元素引用变化。回迁验证原始 DOM 与输入草稿保留；旧文档不再接收面板事件，也不再被迁出面板阻挡较低弹层。
- 补齐 iframe 内 inline 挂载的文档归属：Escape、Tab 与 body 滚动锁使用实际面板文档；切回 body 时释放旧锁并清理旧文档监听。
- 每端 portal-scope 增至 21 项；永久门禁同时执行 modal-focus、layers、scroll-lock 与 Trigger container-contract，共每端 46 项。测试使用真实 Teleport，不将 JSDOM 事件验证当作原生浏览器焦点或 CSS 求值证明。
- 修正测试夹具：先挂载两个测试应用再切状态，避免 VTU 中途替换全局 VNode transformer 导致插槽探针重挂载；没有通过删除实例保留断言来过门禁。原始 Tab 失败在第二应用挂载前已复现，仍是独立产品缺陷证据。
- Maple 日期中英文 panel-tools 示例的 unknown 导航值增加字符串收窄。未接管仍在变化的日期组件实现或批量覆盖其样式。
- 规范、两端菜单指南与 Changesets 更新动态迁移契约。无新增变量名、默认值或 system 颜色角色，三份生成目录仍匹配源码。

最新 Token 盘点：169 个 token.less、4525 个声明名称、73 个已分类候选（43 跨组件 CSS / 10 已审运行时 / 20 有限动态），待审消费与编译错误均为 0。公共声明归属门禁通过；这些数字不是全浏览器视觉完成率。

验证证据位于本机 /private/tmp：

- closure-next-cedar-repro.log：迁移后目标文档 Tab 约束失效的原始复现。
- closure-next-portal-gate-final.log：两端最新相关行为回归；最终使用 CHOKIDAR_USEPOLLING=true 避免旧 Vitest 的 macOS 原生 fsevents 退出期异常，没有关闭行为断言。早期 closure-next-portal-gate.log 保留原生退出提示，不当作最终干净运行。
- closure-next-copies-latest.log：75 份独立 foundation 副本通过。
- closure-next-inventory.log、closure-next-placement.log、closure-next-catalog.log：盘点、归属与目录通过。
- closure-next-{cedar,maple}-scoped-lint-final.log：本批源码／测试及两处示例的 Lint。
- closure-next-cedar-scoped-types-final.log、closure-next-maple-scoped-types-final-project.log：受影响内部 helper 的严格类型检查；独立检查使用正确项目的类型环境，不替代全库。
- closure-next-fixture-build-final.log：两端实际源码与验收页最新 Vite 生产编译通过；没有新增浏览器实测结果。此前文档生产构建保留上一批证据，本次仅同步指南源码。

### 当前还剩什么

Token 静态审计待办为 0；未完成的是 4 类环境验收：已准备的 48 组 Teleport／长文本矩阵及窄屏／缩放／业务配色、Safari／Firefox、iOS／Android 真机、真实系统 reduced-motion 与屏幕阅读器。没有用新增 DOM 单测冲抵这 48 组。

另有 1 项全库集成复验未收口：Maple 日期组件仍有在途修改。最新完整类型检查快照为 DatePanel.vue 的 showNow / nowDisabled / selectNow 三项缺失；完整 Lint 快照为日期相关 21 项错误。本批受影响文件的检查与上述全库失败分开记录，不覆盖未稳定的日期实现，不宣称所有全库检查已通过。见 closure-next-maple-types-latest.log 与 closure-next-maple-lint-final.log。Cedar 完整类型与源码 Lint 当次快照通过，最终新增内部代码另有 Scoped 验证。

下一步先收口日期改造并重新跑全库集成；随后执行 48 组浏览器验收，再逐项推进其余环境矩阵。不要重复迁移已完成的 Token，也不要把已确认消费的 73 项候选列为剩余缺陷。

## 后续批次：Teleport 与局部变量作用域（2026-10-12）

本批处理此前环境清单中能独立推进的宿主／继承契约，不重新迁移已归档 Token。

- 两端 popup-container 校验接受另一文档的真实 HTMLElement，包括被 adopt 到调用方文档但保留原型来源的节点；仍拒绝 SVG 和伪造的普通对象。保留 SSR 无 DOM 保护、选择器 fallback 和既有公开类型，不新增 API 或变量。
- 新增每端 17 项真实 Teleport 用例，覆盖 Trigger、Dialog、Cedar Drawer / Maple Popup 的 body、选择器、元素和 inline 挂载；同一面板跨宿主迁移时内容实例与输入草稿保留，旧宿主锁释放，卸载清理。初始跨文档挂载验证事件只由目标文档处理，不锁调用方 body。没有把 Teleport stub 当作继承／挂载证据。
- 相关回归 Cedar 42 项、Maple 43 项通过；其中新作用域用例共 34 项。`check:portal-scope` 每端跑新用例和现有 container-contract 共 25 项，并接入 check:foundations。popup-container 加入两端独立源码门禁，现为 75 份副本；没有改成共享运行时实例。
- 规范与两端菜单指南、StyleProvider 中英文文档说明 root 别名在继承前求值、直接 component 覆盖、局部映射重声明、真实挂载祖先、面板／遮罩兄弟关系和 iframe 自行加载 CSS。没有宣称局部 StyleProvider 会自动重建完整 palette → system → component 链，也没有自动复制触发器 computed style。
- 验收页新增两端挂载方式的面板内切换和长文本／多语言案例。计划实测矩阵：两端 × 四主题 × body/host/inline × 普通/长文本，共 48 组，另检查 320/390px、200% 浏览器缩放、焦点与横向溢出；本批仅通过源码解析和生产编译，不记为浏览器视觉通过。

验证日志（本机 /private/tmp）：

| 范围 | 结果／日志 |
| --- | --- |
| 原始复现 | 两端 iframe 校验失败；adopted 元素再次复现。portal-scope-{cedar,maple}-repro.log、portal-adopted-repro.log |
| 相关行为回归 | 42 / 43 项通过。portal-scope-{cedar,maple}-final-tests.log |
| 最新作用域门禁／副本 | 50 项通过、75 份副本通过。portal-scope-gate-final.log、portal-foundation-parity-final.log |
| 本批文件 Lint / 严格类型 | 两端通过。portal-{cedar,maple}-scoped-{lint,types}.log |
| Token / 目录 | 声明归属通过；三份目录仍与源码一致，本批未改 Token 名或值。portal-token-gates.log |
| 文档构建 | Cedar 270 页、Maple 生产构建通过。portal-{cedar,maple}-docs.log |
| 验收页 | 独立 Vite 生产编译通过。portal-fixture-build-final.log；临时产物不是发布文件 |

### 本次检查边界与下一步

当前回合没有可调用的浏览器控制工具，未实测上述 48 组、窄屏、缩放或跨文档焦点。JSDOM 不替代浏览器的 CSS 变量求值或布局。关于别名求值的说明依据 [CSS Variables 规范](https://www.w3.org/TR/css-variables-1/#cycles)，不是本次浏览器结果。

Cedar 完整类型与源码 Lint 当次通过；Maple 全库检查当次受在途 Date 修改影响：DatePanelContent.vue 的 pickerValue 含 undefined 成员而声明要求 string[]，另有 60 项 Date 相关格式／花括号错误。本批未改这些不重叠的日期文件；相关 Scoped 校验通过不等于 Maple 当前全库检查通过。见 portal-maple-types.log 与 portal-maple-lint.log，以下上一批通过结果保留为历史快照。

下一步：待日期改造稳定后复跑全库检查；恢复浏览器能力后执行已准备的 48 组继承／长文本矩阵，再扩大到缩放和跨浏览器／真机。其余环境验收仍按之前四类清单追踪，不把本批完成算作全矩阵清零。

## 本次一口气收口（2026-10-12）

下方“前一阶段记录”的浏览器、Form 和 Input 限制已解除，不再作为当前待办。当前扫描范围内没有待审消费项或错放在实现样式中的公共根声明；这不等于所有浏览器、设备及任意业务覆盖都已验收。

本批完成内容：

1. 34 个实现 Less 文件中的 375 处公共声明归档到所属 `style/token.less`。27 个样式组经迁移前后 Less 编译比对，有效根变量值及非根 CSS 规则一致；新增 placement 门禁防止回退。
2. 扩大盘点到 `style/index.ts` 的直接 Less 导入。额外 10 项候选中，7 项有真实共享样式／运行时消费；其余分别为 Counter 无效 disabled-color（删除）、ImagePreview 箭头 hover 缺消费者（仅 hover 设备且非禁用时接通）、TabBar 默认 z-index 属性压住 CSS（未传时回退变量）。TabBar 视觉默认仍为 1，属性默认改为 undefined，显式属性优先。
3. Maple Time 开面板前提交草稿而不提前 blur，关闭后恢复触发输入；Picker 增加 listbox/option、稳定列焦点、上下方向键及 Home/End、禁用项点击保护，以及初始／动态 reduced-motion 下不依赖 transitionend 的提交。
4. 嵌套实测定位并补齐 Maple Popup 实际面板的内部焦点根标记。两端父子浮层实测打开聚焦、Tab/Shift+Tab 循环、隐藏／禁用控件跳过、子关闭回到父触发器、父关闭回到页面触发器。
5. Input 18 对、Date 21 对、Time 34 对及 74 份 foundation 独立副本门禁通过。修正旧检查器的 Form label / Textarea counter / Checkbox / Radio 类名、ProgressGroup 字重 Token 及 FieldDecorator 动效归属；没有降低断言要求。DateRange 撤去手写的可选 install 类型，保留 withInstall 推导的完整插件类型，不改运行时行为。
6. 设计规范、Cedar 菜单指南、Maple 中英文指南、三份自动生成变量目录、相关组件文档和 Changesets 同步。Maple 特有弹层焦点测试独立放置，保留两端共享 Time 文本输入测试同源。

### 当前目录与门禁快照

| 指标 | 结果 |
| --- | ---: |
| Token 文件 | 169 |
| 声明名称 | 4525 |
| 单组件 CSS 未直接消费的候选 | 73 |
| 跨组件 CSS / 已审运行时 / 有限动态展开 | 43 / 10 / 20 |
| 待审消费 / 样式编译错误 / 实现样式公共根声明错放 | 0 / 0 / 0 |

73 项均有消费证据，不是剩余缺陷。目录计数包括组件内部声明，不包含全部 foundation/system 和实例通道。共享契约检查通过：64 个 system 名称、57 项 system 标准值、1057 项组件标准值、14 项平台 system 值、267 项平台组件值、49 个组件。数字仅表示此快照；后续以重新执行结果为准。

`pnpm check:theme-contract` 整条门禁通过，包含颜色／状态／覆盖／非颜色／motion、消费链、自动目录漂移、媒体指针分支、声明归属和字段焦点检查。新 ImagePreview 检查覆盖 fine/coarse × enabled/disabled；新 FieldDecorator 动效检查验证实际 0s 变量，而不假设所有组件都写 transition:none。

实际 Chromium：四主题 × 两端 × Input/Textarea/Date/Time 共 32 组错误字段焦点／说明关联通过；日期／时间展开目标为命名 dialog，Escape 关闭关联；只读不打开，禁用原生控件保持禁用；Picker End 选择和焦点可见性、Time 返回输入及两端嵌套浮层通过。详见[浏览器记录](../refactors/token-validation/browser/README.md#full-closure-follow-up--2026-10-12)。

最终验证通过：

| 检查 | 结果 / 最新日志 |
| --- | --- |
| Cedar 相关回归 | 63 文件、334 项；另含 foundation 焦点 3 项。`closure-cedar-suite-final.log`、`closure-cedar-modal-focus.log` |
| Maple 相关完整回归 | 78 文件、541 项；随后独立 Time 弹层焦点 2 项通过，重复执行不累加。`closure-maple-suite-complete.log`、`closure-focus-final-tests.log` |
| 类型 | 两端通过。`closure-{cedar,maple}-types-complete.log` |
| Lint | Cedar 完整组件源码、Maple 全库零错误零警告。`closure-{cedar,maple}-lint-complete.log` |
| 库构建 | 两端 entry / module / 声明产物通过。`closure-cedar-lib.log`、`closure-maple-lib-complete.log` |
| 文档构建 | Cedar 270 页；Maple 生产构建通过。`closure-{cedar,maple}-doc-final.log`。Maple 仍有产物体积提示，不是构建错误 |
| 主题／目录／归档 | 整条 theme-contract 链通过；placement 紧凑格式／注释误报回归 2 项追加通过。`closure-global-gates.log`、`closure-placement-final.log`、`closure-inventory-summary-final.log` |

日志根目录为 `/private/tmp/`，属于本机临时证据，不是提交产物；早期失败日志保留用于诊断，不冒充最终成功结果。Cedar 生产指南已包含“声明归档与真实消费路径”和焦点根说明，Maple 中英文规范／参考均产出对应资源。所有测试为本批相关范围，不宣称全库所有未受测组件均已视觉验收。

### 仍需外部环境的四类验收

- Safari / Firefox 代表性交互矩阵（当前仅 Chromium 实测）。
- iOS / Android 真机触摸、移动 Safari、输入法与安全区。
- 真实系统 reduced-motion 动态切换及屏幕阅读器；当前浏览器没有偏好模拟能力，单测 matchMedia 与静态规则分开计证据。
- 全组件长文本、多语言、大字号／缩放、Teleport 宿主及业务自定义配色的视觉／对比度矩阵。

以上是环境验收边界，不再重复列已解决的源码问题为“下一批”。

## 前一阶段记录（2026-10-12；以下限制已在本次收口解除）

1. **已完成本轮**：VerificationCode 五档尺寸 × 三变体 × 四主题、公开尺寸/字号/间距覆盖与邻居隔离；List 原生滚动到末尾、回到开头及中间窗口。见[实测记录](../refactors/token-validation/browser/README.md#follow-up-verificationcode-and-native-list-scrolling--2026-10-09)。未发现需要修改组件实现的新缺陷；修正了验收页无效的 itemHeight 参数。
2. **已执行生产页面抽查**：第四批集成已完成两端 build:doc、类型和 Lint（Cedar 270 页；Maple 966 个 Demo SFC，见第四批记录），上轮 Upload 迁移中的 238 项 Lint 错误不再作为当前阻塞。本轮直接使用生产产物，未重复构建。两端 Search 受控接收/拒绝、Maple 全屏历史选择回填、两端 Tabs 键盘跳过禁用项、Maple 纵向和受控面板切换正常；Token 新增说明在 Cedar、Maple 中英文页面均可见。Maple Tabs 文档 390px 无整页横向溢出。
3. **Radio 修复已完成**：两端允许的原生点击不再取消默认激活，click/change 去重，并恢复受控拒绝时同一组所有成员的原生状态。Cedar 100 项、Maple 139 项相关测试、两端类型检查、本轮组件 Lint 与 choice-body 同源检查通过。真实 Chromium 验证接受/拒绝、标签、Enter/Space、组内方向键、只读/禁用正常；Checkbox 同类路径正常，无需修改实现。两端完整生产文档重新构建通过（Cedar 270 页；Maple 968 个 Demo SFC 检查及生产构建）；Cedar Tabs Card、Maple Tabs iframe vertical 复验均为原生 checked=true、aria-checked=true、选中样式一致。见[验收记录](../refactors/token-validation/browser/README.md#radio-native-state-repair--2026-10-12)。
4. **Time Lint 收尾已完成**：上轮 Time 组件的 5 个格式错误和 1 个属性顺序警告已在当前代码消除；本轮另发现并同步修正两端 checks/time-rules-same-source.mjs 的 4 处格式错误，未改变检查逻辑。Cedar 完整组件源码 Lint、Maple 全库 lint:check 均以零错误、零警告通过；两端 Time 34 组独立源码/测试配对检查通过。
5. **字段焦点/ARIA 源码修复完成，浏览器验收待完成**：两端 FieldDecorator 增加独立焦点环，保留错误背景/边框；Date/Time 展开时关联稳定的命名弹层，关闭后同步移除 aria-controls，Maple 可编辑 Time 的打开按钮也关联相同弹层。Cedar 302 项、Maple 394 项相关测试通过；两端 Less 焦点编译检查、本轮文件 Lint、Cedar 完整源码 Lint 与类型检查通过。验收页已补齐四种字段的说明关联与日期/时间状态矩阵；本轮实际浏览器没有成功进入验收页，不记为视觉通过。
6. **当前集成检查限制**：Maple 的在途 Form layout-contract.spec.ts 存在 this 的类型注解和格式问题，阻止当次完整类型/Lint 检查；本轮文件的局部检查通过，未修改该 Form 测试。Input 同源门禁还存在本轮未修改的 Input SFC 类型 import 顺序/单行 if 花括号格式差异；Time 34 组、Date 21 组同源检查及两端 Less 焦点检查分别通过，不以局部检查代替整个 Input 门禁。
7. **下一步**：先恢复浏览器验收页，实测四种字段的焦点环、说明关联、只读/禁用、开关及关闭后的焦点恢复；再收口在途 Form 与 Input 门禁格式差异。随后检查嵌套浮层和 reduced-motion；Safari/Firefox、真机及屏幕阅读器仍需单独验收。

本次浏览器限制：初次打开时服务尚未就绪，浏览器生成连接失败的 data: 错误页；之后 Browser Use 的 URL 策略拒绝从该错误页恢复导航。终端已确认本地服务器 HTTP 200，但未用其他控制机制绕过策略，因此不能声称真实浏览器验证完成。

2026-10-12 字段验收日志：`/private/tmp/field-a11y-cedar-tests-1012.log`（302 通过）、`/private/tmp/field-a11y-maple-tests-final-1012.log`（394 通过）、`field-a11y-{cedar,maple}-{types,lint}-1012.log`。新增 `node bin/field-focus-check.mjs` 覆盖两端 Less 输出、独立焦点环及禁用排除；不是实际浏览器视觉测试。

本轮规范同步：补充表单控件契约中原生 checked / ARIA / 模型一致性、组内受控拒绝恢复及 click/change 单次更新规则；Radio 两端中文与 Maple 英文文档、回归用例和 Changesets 已更新。此次没有新增或调整 CSS token 的名称、值或语义，因此 design-tokens 指南无需修改。

2026-10-12 Radio 验证日志位于 `/private/tmp/choice-native-{cedar,maple}-{tests,types,docs}-1012.log` 和 `choice-native-maple-lint-1012.log`。后续 Time 收尾最新日志为 `/private/tmp/time-lint-closure-cedar-1012.log`、`/private/tmp/time-lint-closure-maple-1012.log`、`/private/tmp/time-lint-closure-contract-1012.log`；最新两端 Lint 已通过，Radio 阶段的 Lint 失败保留为历史记录。Lint 通过不替代尚未执行的跨浏览器、真机和无障碍验收。

规范同步：`design-tokens` 新增“可选覆盖与按实例尺寸回退”，明确 VerificationCode 的 initial、消费处 fallback、gutter 属性和窄屏宽度收缩；Cedar 与 Maple 中英文指南同步。以下旧构建阻塞和统计保留为历史快照，以本节及后续执行记录为准。

2026-10-09 后续：[Rate 局部覆盖与 Maple 文档响应式](./token-responsive-followup-2026-10-09.md)已验证。原 Rate 两项候选和 Maple 文档壳窄屏溢出已处理；中英文参考页在 320–1280px 抽样通过。并行组件改造带来的 14 项消费候选、目录漂移和全库 lint 失败仍由集成批次收口，不将本批完成视为全库通过。

2026-10-09 追加：[生产文档与桌面交互验收](./token-desktop-validation-2026-10-09.md)。两端完整文档构建、四主题 Input／Date／菜单代表性交互已验证；修复长表溢出与多语言示例检查。下方 2026-09-30 数字保留为历史快照，不代替后续源码检查。Maple 文档站 1200px 最小宽度、跨浏览器与真机仍需单独验收。

更新：2026-09-30。原“91 项消费候选／Message 待决／逐批默认值治理”源码清单已收敛，本文现在区分自动闭环、实际浏览器抽查与后续环境验收。零消费候选不等于对任意业务页面作出“没有 CSS 问题”的保证。

## 已完成的收尾范围

- [x] Cedar InputTag：五档内容密度、system 颜色角色、父级禁用／只读约束、键盘删除与自定义标签色保留。
- [x] 两端 Tag 预设色：彩色前景第 9 阶、灰色 content-secondary；默认配色的透明背景经过宿主表面合成后检查。
- [x] 两端 FieldDecorator：filled 状态递进及错误／禁用公开变量真实消费，禁用优先级不被 hover/focus 覆盖；无效内部声明清理。
- [x] 原 91 项候选全部审查：非 Message 89 项中接通 17 项、删除 72 项；Message 2 项无效定位变量随变体迁移删除。额外识别 FilterForm 的注释假消费者及迁移后 Radio 无效内部动效变量。
- [x] Message：两端统一 neutral / tonal / solid 及状态颜色职责，保留 Cedar 默认 neutral、Maple 默认 solid；组件、命令式调用及相同 id 更新均支持，没有旧变量空壳别名。
- [x] 非颜色职责：共享值与触控密度／结构差异分别登记；Form／Tree xl、Card 动效、PageHeader 指针反馈及各相关组件 reduced-motion 补齐。
- [x] 契约外组件也进入全量盘点与消费门禁；同源能力按真实职责扩大共享契约，平台专属能力保留显式差异，不创建另一端空壳。
- [x] 四层规范、两端菜单指南、完整变量参考、组件迁移说明、OpenSpec 与 Changesets 同步；生成目录有漂移检查，不手工维护第二套声明事实。

## 本次全量目录快照

执行：`node bin/token-inventory.mjs --check-consumers --summary`，通过。

| 指标 | 本次结果 | 含义 |
| --- | ---: | --- |
| files | 138 | src/**/token.less 文件数 |
| declarations | 4033 | 上述组件 token 文件中的声明名称统计 |
| candidates | 79 | 单组件 CSS 未直接消费，继续沿全库／运行时核验的声明 |
| crossComponentCss | 54 | 由其他组件编译 CSS 消费 |
| literalRuntime | 5 | 已人工检查并登记精确可执行路径的绑定 |
| dynamicRuntime | 20 | 已登记的两端 Space 有限动态名称展开 |
| needsManualReview | 0 | 没有尚未归类的消费候选 |
| errors | 0 | 组件样式入口编译错误 |

79 项不是剩余问题：54 + 5 + 20 均已有消费依据。任意注释、文档、主题赋值或字面名称匹配不能绕过门禁；新运行时路径必须审查登记。扫描编译包括没有 token.less 的组件在内的全部 style/index.less，但以上声明计数仍不是 foundation/system、行内实例通道等全部 CSS 变量总数。后续代码变化以重新运行结果为准。

契约规模会随共享能力扩展而变化，当前共享／平台默认值及组件族数量以 theme-contract 检查输出为准；不再把早期 555 项或 38 组数字写作现状。

## 证据与职责分工

| 证据 | 能证明什么 | 不能替代什么 |
| --- | --- | --- |
| 名称／值与平台契约 | 同义后缀、默认值来源、明确平台差异 | 任意业务覆盖的对比度 |
| 全量消费门禁 | 编译 CSS 与已审核运行时消费可追踪 | 所有 DOM 状态一定命中且视觉正确 |
| 主题／状态／覆盖测试 | 受测选择器级联、状态优先级、默认配色、reduced-motion 规则 | 真实动画帧、系统偏好动态变化与浏览器实现差异 |
| 单测、类型、lint、构建 | 对应运行范围内的行为和产物检查 | 真机可用性或全库视觉回归 |
| 实际 Chrome 抽查 | 记录中实际操作和画面的结果 | Safari、Firefox、触屏真机与未抽查组件 |

详细记录：

- [最终集成验证](./token-final-integration.md)：中央契约、产物构建、生成文档及回归结果。
- [消费候选逐项处置](./token-consumer-resolution.md)：89 项、额外假消费者、尺寸与动效说明。
- [Message 变体及迁移](./message-token-resolution.md)：强调层级、默认外观和旧变量替代。
- [非颜色 Token 处置](./non-color-token-resolution.md)：system 角色、组件几何及平台差异依据。
- [实际浏览器验收](./token-browser-validation.md)：两端三变体 Message、四主题组合、局部覆盖、关闭、InputTag 五档编辑／禁用，以及输入与常用反馈组件抽查。

最终集成的类型、构建和发布产物结果应记录实际命令及日志，不以此文档的勾选代替执行；也不把后续新增组件或独立工作树改动自动算入本次验收。

## 后续环境验收（不是旧源码待办）

2026-10-09 新组件重构后补验：见[可重复运行的浏览器验收页及实测边界](../refactors/token-validation/browser/README.md#latest-bounded-verification--2026-10-09)。两端 Input/Textarea 四主题聚焦叠加 hover、Textarea 行数限制和局部覆盖、Slider 键盘步长/只读/尺寸覆盖、虚拟列表初始窗口与 320/390px 页面宽度已抽查。Cedar 267 页生产构建通过；Maple 928 个 Demo SFC 检查通过，生产构建暂受另一任务进行中的 VerificationCode 导出迁移影响，需冻结后重跑。未将这些抽查计作完整环境验收；本轮未新增 Token 或更改设计语义，因此不改写已有设计规范。

- [ ] Safari／Firefox／Chromium 的代表性交互矩阵：hover × focus × error、selected × pressed、disabled、键盘顺序与嵌套浮层。
- [ ] iOS／Android 真机触摸、移动 Safari、窄屏、输入法、安全区域和粗指针悬停限制。
- [ ] 浏览器 reduced-motion 偏好及动态切换、动画生命周期、屏幕阅读器与焦点可见性。
- [ ] 长文本、多语言、大字号／缩放、Teleport 宿主继承和业务局部覆盖；自定义颜色单独计算对比度。

这些项目按浏览器、设备、组件和状态记录实测结果，不再用“全局扫过一次”代替完整环境矩阵。发现问题时继续同步规范、实现、契约、文档和回归测试。
