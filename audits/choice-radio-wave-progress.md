# Radio 交互与按钮模式同源

## 2026-09-30 本批实现

- 两库独立复制 use-radio-navigation：局部箭头/Home/End，禁用跳过，只读可聚焦不选中；仅处理当前注册焦点节点，不再监听 window。
- Tab 入口优先已选项，其次首个可用项。SSR 保留后续已选项的入口；挂载后校正缺失/禁用选值，动态 DOM 排序、移除、KeepAlive 停用/恢复均清理注册。
- Maple 补齐 Radio / RadioGroup variant=radio|button，Group 优先；五档 size 只控制按钮高度，普通圆形图标不缩放。尺寸继承表单/全局，默认 md。
- 独立复制按钮 BEM 规则和私有 Token；选中背景不被 hover 覆盖，禁用优先于错误/选中颜色，提供可见焦点。没有抽取共同运行时或 platform 配置。
- Maple Ripple 增加卸载/禁用时的定时器清理，移除卸载后的键盘监听，键盘状态改为实例独立，避免延迟回调访问已销毁环境。删除运行时强制 style 导入；组件依赖在各自 style 入口显式引入，直接使用指令需 resolver 或显式 ripple/style。
- 补齐双端键盘/尺寸 Demo，Maple 中英文文件自动用于中央卡片和右侧集合。按 Vue 生命周期规范实现独立注册和清理。

## 验证

- Cedar 87 项（含 Tree/Calendar 调用方），Maple 132 项（含 Ripple），共 219 项测试通过。包括双端 13 项导航测试、后置已选项的 SSR Tab 入口和 Ripple 卸载/禁用/实例隔离回归。
- 两端完整 Lint、类型检查、build:lib 通过；Maple Ripple 后续修改额外运行定向 Lint，并确认发布产物包含清理逻辑。
- 两端发布包 RadioGroup button/xl SSR 通过；Maple Checkbox、Radio、Ripple 均可在无 CSS loader 的 Node 中导入。
- Maple docs:check：895 个 Demo、0 失败；19 对核心/样式/测试与 11 对 Demo 规范化一致性检查通过；菜单/调研元数据同步。
- 主题检查 960 状态、704 对比度组合，最低 4.681:1；源码样式图无循环、缺失导入或内嵌 foundation。
- 发布样式检查通过：ESM/CJS 依赖完整，双端 src/es 消费者中 foundation 与 Loading 均只出现一次。修正检查脚本过期的 menu 路径为 dropdown-menu，并纳入 Radio。
- Resolver 发布包实际解析 Ripple，结果包含 ripple/style。其旧测试脚本使用 node --test，但测试文件实际依赖 Vitest；首次直接调用失败；随后从 UI 测试根目录调用也未发现包外测试，均未计作通过。未修改该包的既有测试配置。
- 未做浏览器视觉验收（本地预览导航超时），未执行整站文档生产构建。

## 状态与下一优先级

调研仍为 71 组：44 已同源、12 逻辑已同源、11 待适配、3 逻辑待同源、1 独立。
计划中仍有 14 组（11 待适配 + 3 逻辑待同源），其中多数组已完成部分核心，不能理解为尚未开始。
本批收口 Radio 导航和按钮外观，不虚报 Checkbox/Radio 整体已同源。下一优先级为两者主体结构、圆形控件样式/BEM 与端侧视觉，再处理 Rate/Slider。

2026-10-09 批次集成结果与最新分类：[依赖分批并行验收记录](./priority-batch-2026-10-09.md)。上文未完成项为该子阶段快照，以批次记录为准。
