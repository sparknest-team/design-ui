# Checkbox / Radio 分组状态收口

本文件记录上一批；独立值模型与键盘控制器的后续结果见 [choice-control-progress.md](./choice-control-progress.md)。

## 2026-09-30 本批实施范围

本批不是 Checkbox / Radio 整组件同源。先修复 Group 状态和通知链，外观以及独立使用 API 留在下一阶段。

- 两库独立保存 checkbox/choice-state.ts，Radio 在本库引用该控制器；无跨库运行时引用、共享实例或 platform 配置。
- Group 根据 modelValue !== undefined 判断受控。defaultValue 只初始化非受控值，各实例克隆初始数组。被父级拒绝的提议不保存到本地；外部值和异步选项变化不发事件。
- Maple 移除 Group → 子项 sync → 子项 model emit 的回写链，子项直接计算分组的选中状态。通知顺序统一为 update:modelValue → change(value, event?) → FormItem onChange，子项不重复发送值事件。
- Maple Group 新增 defaultValue / disabled / readonly / error；Cedar Checkbox、Radio 和 Group 补齐 readonly。可继承 Boolean 默认 undefined。Group 可显式 false 覆盖表单，但子项不能绕过 Group 的禁用、只读限制。
- max 只阻止新增；外部超限值不自动裁剪。Maple checkAll / inverseAll 保留已选禁用、只读、未载入值，编辑可用候选并遵守上限；无变化不通知。checkAll 不会为了新增项而丢弃已有选择。
- Maple 分组内 toggle(checked?: boolean) 请求选中/取消；不传取反。禁用或只读时，命令式入口不再绕过限制。
- Maple Radio 从实际子项重新计算已选状态与焦点入口，清空值、禁用选项、移除选项后入口能恢复；完整跨端键盘模型尚未对齐。
- Cedar 的 boolean 选项按实际 value 渲染；Calendar 的 RadioGroup change 回调类型同步允许可选 Event。
- 每组新增 group-state、async-options 两个双端 Demo；Maple 增加独立英文源文件，中间卡片和右侧集合引用同一份文件。
- 清理 Maple 文档末尾重复且过期的 API 表，Token 表按现有 token.less 同步前缀与默认值；原有主题样式未改动。补充两库 major changeset、OpenSpec、API 清单、调研理由及菜单；状态仍为待适配。

## 验证

- choice-group-core-check.mjs 验证 4 对控制器/测试和 4 对 Demo；不覆盖两端组件主体和样式。
- 已通过双端类型检查；Maple docs:check：880 个 SFC，0 失败。
- Cedar 30 项测试通过（含 Calendar 调用方 2 项），Maple 67 项通过，共 97 项。每端包含 1 项 Node 环境源码 SSR；Maple 增加批量操作与焦点恢复回归。
- 两端全库 Lint 与 UI 包 build:lib 均通过；Props 声明包含本批默认值和继承能力。
- 两库样式模块依赖检查通过：Cedar 96 个入口 / 98 个 Less，Maple 91 个入口 / 93 个 Less；无循环、缺失导入或嵌入基础样式。
- Cedar 发布包 Checkbox/Radio ESM 可在裸 Node 导入，继承 Props 与类型声明检查通过。
- Maple 发布包的裸 Node 组件入口导入未通过：旧 Ripple 运行时入口直接 import './style'，触发 ERR_UNKNOWN_FILE_EXTENSION(.css)。该导入已确认存在于 HEAD，本批未修改 Ripple；不能用源码 SSR 通过替代该发布入口检查。Maple 发布 Props 模块和类型声明单独验证通过。
- 未执行浏览器视觉验收及完整文档生产构建。

## 下一阶段

1. 独立 Checkbox/Radio 值模型：defaultChecked/defaultValue、boolean / 数组语义、半选行为、toggle/focus/blur 与原生属性，确定最终契约并同步内部调用方；不引入兼容别名。
2. Group 公共 API：选项映射/类型、Readonly 选项、方法和插槽、Radio button 外观，以及本地表单接入的一致性。
3. 主体统一为原生可访问输入结构，收口键盘焦点、SSR 首屏状态、动态排序与实例隔离，先完成 Cedar 再复制 Maple。
4. 清理 Ripple 运行时样式依赖，复验 Maple 发布包裸 Node SSR 导入；随后将样式/BEM/Token 与主题契约、完整 Demo 和类型导出统一后，才能将 Checkbox / Radio 升级为已同源。

当前数量不变：44 已同源、12 逻辑已同源、11 待适配、3 逻辑待同源、1 独立。
