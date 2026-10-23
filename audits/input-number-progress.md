# InputNumber 同源改造进度

## 2026-09-30 完整主体收口

本批完成 InputNumber；Checkbox / Radio 尚未实施，不随本批升级。

- Cedar 先重构为 FieldDecorator + 原生 input，再复制至 Maple。两端独立持有源码与状态，仅保留前缀、本地导入、安装入口及既有表单/全局多语言接入差异，没有跨库核心依赖或共享实例。
- 对齐 19 项 Props，包括五档 size、variant、hint、readonly、inputAttrs；支持 InputGroup 与 Form/FormItem 继承及显式覆盖。
- 编辑文本与业务数值分离，parser 每次编辑仅执行一次；受控拒绝回写会恢复权威值，外部同步不触发用户事件。输入法、尾随小数点、失焦/回车去重纳入回归。
- 清空顺序统一为 input → update:modelValue → change → clear，空值为 undefined，表单每个语义事件仅通知一次。
- 两端使用独立 Decimal.clone 配置，统一精度、步进、负数和非对齐边界处理，不受应用全局 Decimal 配置影响；公开业务值仍为 JavaScript number。
- Pointer Events 覆盖触控/鼠标步进；长按在取消、失焦、只读/禁用/布局变化、停用和卸载时清理，各实例隔离。
- 三种布局、三种字段外观、五档尺寸的 BEM 样式与 19 项组件 Token 同源；按需样式入口保留 InputFeedback/FieldDecorator 所需依赖。
- 移除旧 Cedar TSX、无引用旧 Demo，以及 Form 中旧 InputNumber DOM 专用偏移选择器/Token；不保留兼容别名，可从 Git 历史恢复。
- 两端 7 组中文 Demo 一一对应；Maple 同步英文 Demo，中间卡片与右侧集合引用相同文件。补齐 API、事件、插槽、方法、Token 和 major changeset。
- 调研及菜单将 InputNumber 从待适配升级为已同源。

## 验证结果

- Cedar 37 项、Maple 40 项测试通过，共 77 项，包含 Node SSR、表单继承、受控/非受控、事件顺序、IME、触控和实例隔离。
- 两端 typecheck、InputNumber 范围 ESLint、build:lib 通过。发布包 ESM 可在 Node 导入，公开 Props、类型导出和样式依赖检查通过。
- input-number-core-check.mjs：14 对独立核心/视图/样式/测试文件及 7 对 Demo 通过规范化比较与 SFC 编译检查。
- Maple docs:check：872 个 Demo SFC，0 失败。
- style-modules-check.mjs：Cedar 96 个入口 / 98 个 Less，Maple 91 个入口 / 93 个 Less，通过依赖与基础样式检查。
- API 清单：127 个 Cedar、119 个 Maple 运行时 Props 导出，95 个同名可比较；InputNumber 两端均为 19 项 Props。
- Cedar 全库 Lint 通过。Maple 全库 Lint 首轮报告本批外 playground/Header.vue、themes.ts 的格式问题；最终复验因并行改动中的 playground/src/themes.spec.ts 在扫描后不存在而以 ENOENT 中断。未改动这些文件，全库 Lint 未验收通过；InputNumber 范围 ESLint 已通过。
- 最终主题契约复验通过：64 项系统 Token、29 项受控系统值、422 项受控组件值、38 个组件；此前 Switch 清单排序漂移已在并行改动中消失，本批未覆盖其实现。
- 未运行文档生产构建或真实浏览器视觉验收，本地文档服务未启动。

## 后续

1. Checkbox / Radio：独立值与 group 值、默认值、禁用/只读继承、选项映射、最大选择数、键盘焦点、事件载荷及方法。
2. 其余待适配/逻辑待同源组件按调研逐项推进，不能仅凭 Props 名称一致升级状态。
3. 当前 71 组对应关系：44 已同源、12 逻辑已同源、11 待适配、3 逻辑待同源、1 独立。
