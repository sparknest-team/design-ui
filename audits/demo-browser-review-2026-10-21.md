# Cedar / Maple 浏览器逐项复查（进行中）

本记录只计入真实浏览器里操作过并核对可见结果的场景，不把静态 API 覆盖或 JSDOM 通过等同于人工交互通过。

当前 550 个场景中，79 个已完成有记录的实际交互核对，471 个待验，下载问题已完成 Chrome 复验。逐场景操作记录与问题状态见 `evidence/demo-browser-review-2026-10-21/progress.json`。通过只表示记录中的分支，不表示该组件所有 API 组合已验收。

## 前轮完成范围（历史记录）

- Cedar TableColumn：真实数据行、排序、普通筛选；复杂 filter-content 插槽调用 setFilterValue / handleFilterConfirm / handleFilterReset，核对 Ada、Lin 与恢复全部数据。
- Cedar Tabs 7 个场景：全部子组件、三个导航插槽组合、增删标签、受控 active 回退、resize 实例方法、懒挂载与隐藏销毁、自定义类名与样式、隐藏内容与动画组合。
- Maple Tabs 8 个场景：上述对应交互，以及横向溢出滚动与 End 键定位。
- Cedar Cascader 3 个场景：子面板选择、只读/禁用/清空、多选路径、异步加载回调、异步选项加载、完整场景重置。
- Cedar Form 5 个场景：四类 useFormItem 回调、自定义异步 validator 允许/拒绝、真实失败/成功提交、两字段乱序异步聚合、服务端错误写入与清空、FormItem 的 label/help/extra 三插槽、全局禁用与只读继承、标签样式组合。
- Maple Form 5 个场景：异步聚合失败与修正后原生提交、服务端错误写入/清空、三插槽与只读/必填、全局禁用和标签布局、字段事务异步成功/拒绝及等待中重置，核对草稿与已保存模型。
- Cedar Upload 4 个场景：真实选择本地文件、选择回调允许/拒绝、本地 custom-request 成功/失败/重试、异步删除拒绝与允许、同 UID 替换和停用后旧删除失效、beforeRead 文件类型判断、数量限制、只读与禁用的预览/删除行为。

Cedar Upload 根场景的下载按钮组合尚未完成，仍为待验。Maple Upload 的 before-add、before-read、before-remove、click-action、queue-request 五个场景已通过：实际选择 SVG+PNG 仅保留 PNG；超过 1MB 文件拒绝、小文件接受；选择回调允许/拦截；异步删除与同 UID/停用保护；请求失败、取消和重试成功，活动请求归零。

Maple 根 Upload 已验证只读/禁用与预览、删除、下载链接的组合，但实际点击 blob 下载后未收到浏览器下载完成事件，记为需定位，不算通过。文件选择与下载工具曾长时间未返回，继续前需要重新读取页面状态。

## 本轮发现并修复

1. Cedar Table 按未注册的 TableColumn 名称收集子列，导致整表为空；父表与嵌套列改用实际命名空间名称。
2. 筛选图标错误地带 disabled，真实点击被 pointer-events 阻挡。
3. 列筛选样例谓词把选中值数组当作单值处理。
4. 通用 cell 插槽错误地优先显示 record.name；现显示当前列实际值。
5. 回调参数类型被误当作可编辑子配置；阻止遍历函数参数及函数中间路径。
6. 递归 schema 深层字段抢占浅层字段；改为当前层优先。
7. Tabs 共享插槽表的组件名被误读为根插槽名；纠正归属并补充子组件场景与 resize。
8. 动态标签删除当前 active 后留下空内容；受控示例回退到有效相邻项。
9. 重置未重建持有 v-model 的父案例，保留旧选值/加载数据；ReviewSuite 接收 review-reset 后重建整个案例。
10. CascaderPanel 同时存在 loadMore 时，静态叶子缺少 isLeaf，误展开为异步节点；补足叶子标记。
11. UploadRequestChoose 的 inline import 类型被解析成路径枚举；改为回调控制，可允许或阻止传入的真实 chooser。两端均已浏览器复验。

控制区继续使用各自组件库的 Checkbox、Button、Select、Input 等控件。

## 前轮支持检查（历史记录）

- Cedar Table 子列/筛选回归：2 项通过。
- 共享审查面板：20 项通过，包含完整父案例重置和 chooser 回调两分支。
- completion 生成器：7 项通过。
- Cedar 类型检查通过；Maple lint 与类型检查通过（新增 navs-review 格式修正后）。
- 共享审查代码严格类型检查通过。
- 此结果不代替其余 505 个场景的真实浏览器验收，也不外推本轮未检查的 API 组合。

## 环境记录

Maple 长驻 8082 预览在导航时出现 Image 初始化错误；使用当前文档解析配置的隔离 8083 预览后，Form 全部五个场景完成真实交互。工作区其他修改引起多次全页刷新，当前隔离预览关闭 HMR，后续必须等服务就绪再检查。

## 截图

- `evidence/demo-browser-review-2026-10-21/cedar-table-column.png`
- `evidence/demo-browser-review-2026-10-21/maple-tabs-navs.png`
- `evidence/demo-browser-review-2026-10-21/cedar-cascader-callback.png`
- `evidence/demo-browser-review-2026-10-21/cedar-tabs-combination.png`
- `evidence/demo-browser-review-2026-10-21/cedar-form-submit.png`
- `evidence/demo-browser-review-2026-10-21/cedar-upload-retry.png`

## 2026-10-22 续查（上一批历史记录）

### 下载已定位并复验

- Cedar basic 的 PDF/TXT 链接资源原先不存在。改为真实文本附件并补齐 public 资源。Chrome 普通点击下载 release-notes.txt（100 字节），与仓库附件逐字节一致。
- Maple 手动队列样例原先只有 File，没有下载 URL。中英文示例创建并持有 blob URL，卸载时释放；Chrome 普通点击下载 example-1.txt（30 字节），内容符合预期。
- 浏览器下载完成事件未回传不等于下载失败。实际文件及 SHA256 见 `evidence/demo-browser-review-2026-10-21/download-verification.json`。原先 Maple Upload needs-investigation 已解除。Chrome 扩展缺少 file URL 读取权限，复验使用示例自身的本地文件按钮，无需改变设置。

### 新增 API 与修复

- Select 两端补齐 Option、Optgroup 子组件 API 表，以及根组件 15 个插槽、14 个事件和 focus/blur 方法索引。新增两端 options-review、slots-review，用各自 Checkbox/Button/Select/Tag 组合展示。
- Option tagProps.size 原被 SelectionField 固定 sm 覆盖，两端已修正；浏览器均验证 lg 类名与禁用删除保护。
- Select read 插槽原未传 text，已补齐；文本采用纯选项标签/formatLabel，避免 label 插槽的 VNode 变成对象字符串。两端浏览器均显示“阅读：研发”。
- Maple 新插槽示例的多语句点击表达式经格式化后不能编译，改为明确处理函数并重新生成、加载和点击复验。
- Cascader 完整路径摘要原重复父级，两端改为沿当前分支逐段解析；单路径、重复叶 ID、多路径与异步标签回显有回归测试，两端浏览器也已复验单/多路径文本。
- Maple Cascader async-devices 去掉重复 popup 选项；实际验证 readonly、异步 load-more、多选路径及 beforeCommit 拒绝/异步允许分支，核对候选值、previousValue、signal 与提交后模型。
- Maple CascaderPanel 原只有文字描述，补上 API 表与子面板组合案例；已真实验证单选、多选完整路径、懒加载回调、严格父节点选择、空插槽开关与清空，change 参数与可见模型一致。
- Cedar 文档冷启动曾因入口循环导入触发 previewImage 初始化错误。文档按公共组件入口解析导入后页面可正常交互；解析器覆盖 registry 别名的两项测试通过。

### 本轮验证

- Maple Upload：11 文件、101 项测试通过。
- SelectionField size：两端各 7 项通过；路径摘要：两端各 4 项通过；Select read/formatLabel：Cedar 4 项、Maple 5 项通过；Cedar 文档 resolver：2 项通过。
- completion 生成器 7 项通过；550 个审查 SFC/API 配置校验通过；Maple 1414 个 Demo SFC 语法检查通过；本轮最后 lint 通过，Maple 类型检查通过。
- 首次 Cedar 全量类型检查在本轮未修改的 TreeSelect 文件失败；最新工作区全量复跑已通过。
- 源码扫描两端案例中原生 button/input/select/textarea 控制标签无命中；组件内部渲染的原生元素不属于遗漏。
- 仍有 485 个待验场景，包含 Maple Select thumb-lifecycle 剩余指针分支及其余清单条目。静态覆盖、编译与单测不能替代这些浏览器交互。

新增截图：`maple-cascader-panel.png`、`maple-select-read.png`、`maple-select-children.png`、`cedar-select-children.png`、`cedar-download-fixed.png`，均位于同名 evidence 目录。

### Table 续查与工具复核

- Maple Select outline 的14个字段已逐项交互；数值关联、只读/禁用、自定义清空图标、选项/字段映射、多选、sm样式均正常；显式disabled=false可覆盖案例绑定，取消覆盖恢复禁用；readonly+error同时传到14个输入。
- Maple Table两个场景：width900/height120/elevation12/footer，真实水平滚动；分页Name11..20、每页5条Name11..15，纵向滚动后thead与容器top同为315，页脚开关与重置正常。
- Cedar Table根：排序实际行顺序、pageSize1翻页、empty/footer组合及恢复，核对sorter-change/page-change/change参数。
- 切换Cedar summary时发现工具locator还指向已卸载节点（isConnected=false），而domSnapshot/evaluateAll显示当前页面。重新绑定tab，后续改用原生可访问性树点击并读取当前节点；没有据此修改组件切换逻辑。summary重新实际验证：平均22800/9.4/-0.6，合计114000/47/-3，正负数红绿样式、合并单元格和展开行。
- 自定义tr/td：移除console-only回调，页面使用Cedar Tag显示右键计数；真实右键0→1，关闭并恢复两个插槽后再次右键1→2，默认/自定义DOM与数据保留正确。截图`cedar-table-custom-elements.png`。
- form-attribute：选一行→半选，全选→5行；隐藏全选入口保留选值；取消行选择、隐藏表头、空数据、loading叠加和恢复正常；select/selection-change/select-all参数均核对。
- Table补充后550份审查SFC及API配置再次校验通过。

### 本批最终补验

Cedar Table 11 个场景均有真实交互记录，覆盖千行虚拟滚动、键0/999选择、selectAll/select、合并单元格、四个排序筛选重置方法、子列重建、默认和组件Tag手柄双向拖拽及change回调。

修复Table百分比高度：Loading新增包装层未传递约束，220px表格的表体原有327px且不能滚动；补齐flex高度传递后表体177px，定高与百分比高度均已用虚拟和浏览器滚动条复验。修复树形展开双按钮语义，真实按钮现支持Enter/Space和aria-expanded，等待中不重复加载。原2秒函数、拒绝不插子行、允许后重试、缓存收起重开均已实测。

通用load-more回调原给Table插入空白行、键固定且忽略字段映射；现读取当前目标props，生成可见名称、父级相关键并支持自定义字段。两端Cascader保留id/name/nodes，均实际提交[lazy,lazy-review-child]。英文Cascader也已在浏览器验证仅inline/popup、异步标签和确认提交。

Maple Select thumb-lifecycle已验证真实拖动、释放、拖动中停用、重新激活、卸载/挂载及新实例草稿确认。活动拖动中的右键取消、窗口失焦尚未独立复验，该场景继续保留pending。

最新Cedar Table 17测试、共享面板24测试通过；Cedar/Maple/共享严格类型检查均通过。550份审查SFC/API配置、1414个Maple Demo语法、2739个Demo SFC及1676段文档示例的组件控件检查通过。最终Maple全量lint已通过。

当前65/550通过，485待验。新增证据：maple-cascader-field-mapping.png、cedar-table-drag-custom.png、maple-select-thumb-lifecycle.jpg。

### 筛选回调与模式控制器复验

共享自定义筛选回调原把多选数组拼成一个字符串；改为按多个候选值分别匹配，空数组不过滤。Cedar TableColumn 真实勾选 Ada 与 Lin 后仅显示两行，Grace 被排除，回调逐行返回 true/true/false；新增两项测试，共享面板现为 24 项通过。证据：`cedar-table-multiple-filter.jpg`。

Maple Select 中英文 async-devices 原用另一个 Select 控制展示方式，导致组合审查同时绑定控制器和目标。现改为自身 RadioGroup/Radio，仅保留 inline/popup。中文页面实际验证 disabled 与模式切换组合、加载 200 项、搜索设备 199、确认前模型仍为 [2]、确认后为 [2,199]；事件没有混入模式字符串。英文页面实际切换 popup/inline、加载后回显 Device 2。预览中仅有一个目标 Select，两项针对性测试通过。证据：`maple-select-mode-controller.jpg`。

本次最终 Maple 全量 lint、类型检查、1414 个 Demo 语法检查、550 份审查配置及组件控件检查均通过。浏览器通过数仍为 65/550；这两处为已验场景的补充复验，不重复增加计数。

## 2026-10-22 本批续查：Tree 与 Collapse

本批新增 14 个真实交互通过场景：Cedar Tree 8 个，以及 Cedar / Maple Collapse 各 3 个。累计 **79/550 通过，471 待验**。通过范围限于 progress.json 中逐项记录的分支。

### Maple Select 优先补验的工具限制

先按要求尝试活动拖动中的右键取消和失焦。原生按住能在 702ms 观察到 dragging，但输入队列把后续右键排在左键释放之后：左键 8075ms 释放，右键 8166ms 完成。切焦点操作同样不能证明发生在按住期间。因此两项仍为 pending，没有使用合成事件代替实际交互，也没有计为通过。时序证据见 `evidence/demo-browser-review-2026-10-21/maple-select-thumb-native-input-order.json`。

### 浏览器发现并修复

- Tree extra 仅有可点击图标：改用 Cedar Button，Enter/Space 可添加子节点且不误选父节点。新增 Cedar Checkbox / Tag，组合展示 checkable 函数、selectable 函数和严格勾选；父子联动、叶子限制及插槽恢复均实际验证。
- Tree 字段映射案例默认选中值不存在：改为真实叶子，验证了不可选分支、value/label 回调与 customIcon 覆盖。
- Tree 图标案例错误解构 isLeaf：根插槽实际接收 TreeNodeData，改按静态 children 区分分支和叶子并补充文档参数。冷加载确认星形、箭头与逐节点图标，避免把旧热更新模板算成验证结果。
- 通用加载回调仅适配 done(children)：补齐 Tree 的修改节点并完成 Promise 契约，以及映射 title/children/key。拒绝不改节点，事件区显示错误；允许后真实插入子节点，缓存收起重开不重复加载。
- API 控制重算时重新创建 loader，导致数据变化把当前加载当旧任务退休：缓存相同目标、模式和原函数的回调引用。使用完整 Tree 审查配置的集成用例，去掉修复会失败，恢复修复后通过；浏览器也复验拒绝、重试及自定义映射加载。
- 两端 Collapse：多面板展开后切手风琴仍全部展开、已隐藏内容不响应 destroy-on-hide、extra 按钮键盘误展开外层，以及不同实例使用重复 ARIA ID，均已修复并在两端浏览器复验。

### 实际交互范围

- Tree：多选 / xl / 整行 / 禁用 / selectable 组合；checkable 与 selectable 叶子函数及严格勾选；动态子节点及 extra 开关；自定义字段加载；图标优先级和复杂 title；搜索、无匹配、大小写与高亮开关；1110 节点虚拟列表仅挂载 30 行，真实滚到最后一叶、跨滚动勾选、组件按钮 scrollIntoView、200/120 高度切换及恢复。
- 两端 Collapse：三项展开切手风琴即只留一项；销毁内容数量 1→0→3；Enter/Space 标题交互；边框 / 分割线 / 间距组合；实例面板 toggleAll 两次反选；extra 按钮键盘隔离、禁用与插槽开关；嵌套图标参数面板独立操作、父级图标回退和 active 参数变化。两端整页标题 ID 各 49/49 唯一。
- 所有新增或调整的 Demo 控制项均使用各自组件库控件。

### 检查与证据

共享面板 27 项、Cedar Tree 相关 9 项、Collapse Cedar 15 项 / Maple 29 项通过；两端仓库规定的 typecheck、共享严格类型检查、Maple 全量 lint 和 1414 个 Demo 语法检查通过。Cedar 直接检查基础 tsconfig 曾报 rootDir 歧义，改用仓库规定的 `pnpm typecheck`（tsconfig.declaration.json）通过，没有为本批修改类型配置。

截图位于同名 evidence 目录：`cedar-tree-extra-combinations.jpg`、`cedar-tree-mapped-loading.jpg`、`cedar-tree-loading-retry.jpg`、`cedar-tree-virtual-selection.jpg`、`cedar-collapse-combinations.jpg`、`cedar-collapse-slot-scope.jpg`、`maple-collapse-combinations.jpg`、`maple-collapse-extra-keyboard.jpg`、`maple-collapse-slot-scope.jpg`。

本批最终复核：550 份审查 SFC/API 配置编译通过；2739 个 Demo SFC、1676 段文档示例及共享面板的组件控件检查通过。
