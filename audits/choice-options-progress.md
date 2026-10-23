# Checkbox / Radio Group 选项数据收口

后续批量方法已完成，当前进度见 [choice-methods-progress.md](./choice-methods-progress.md)。下文保留本批历史验收范围。

## 2026-09-30 本批完成

- 在 Cedar 实现 choice-options、choice-group-props、choice-label 后独立复制至 Maple；无跨库运行时、共享实例、platform 配置或兼容别名。
- 两端支持原始值和对象选项，fieldNames 映射 label/value/disabled/readonly/indeterminate。归一化保留业务字段、不修改原始对象；缺失标签回退为值的文本。
- 选项值限制为字符串、有限数字和布尔值。非法/缺失值忽略，同类型重复值保留第一项；false、0、空字符串和字符串数字分别保留身份。
- label 插槽统一接收 { data, checked }，优先于 (data, checked) 标签渲染函数；支持 Vue VNodeChild，包括数组与数字。Maple 标签不再额外包装旧 MaybeVNode 的 span，相关快照已更新并检查。
- 两端 options 明确优先于默认插槽；显式 [] 渲染空组，未传 options 使用默认插槽。不再出现一端追加 slot、一端回退 slot 的差异。
- 选项级 readonly、disabled 和 Checkbox.indeterminate 接入两端组件，命令式方法不能绕过只读/禁用；半选不改变模型。
- RadioGroup 与 Radio 一致使用 RadioModel，默认 null；空字符串是合法选项，不再隐式激活。外部更新或异步选项变动不反向 emit。
- CheckboxGroup 值类型从 Maple any[] 收紧为 ChoiceValue[]，max 统一 number（使用 :max）；两端导出 CheckboxOption、RadioOption、ChoiceFieldNames。
- 新增两组 option-data Demo，Maple 维护独立中文/英文文件，中心卡片与右侧集合仍引用同一 Demo 源文件。
- 12 对核心/测试与 8 对 Demo 纳入同源门禁；组件状态仍为待适配。源码主体、样式和主题未整体覆盖。

## 验证

- Cedar 62 项测试、Maple 97 项测试全部通过（含新增选项矩阵及 SSR）。
- 双端 vue-tsc、完整 Lint 与 build:lib 通过，发布声明导出 CheckboxOption / RadioOption / ChoiceFieldNames。
- Maple docs:check：888 个 Demo，0 失败；12 对核心/测试与 8 对 Demo 同源门禁通过，菜单/调研同步检查通过。
- Maple 构建产物的 Group Props 和选项归一化验证通过；源码 SSR 包含字段映射与标签函数。
- 未执行真实浏览器视觉验收或整站文档生产构建。
Maple 发布包裸 Node 组件入口仍有上一批确认的 Ripple CSS 导入限制，本批仅复验源码 SSR 与发布类型，不宣称该问题已解决。

## 下一批

1. 对齐 Group 方法/Expose 与 Radio button 能力。
2. 对齐主体、完整组键盘导航、初始焦点和动态顺序。
3. 对齐样式/BEM/Token，处理 Ripple 运行时样式依赖并重新验收包 SSR。

分类数量不变：44 已同源、12 逻辑已同源、11 待适配、3 逻辑待同源、1 独立。
