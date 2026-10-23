# Checkbox / Radio 独立值模型收口

后续 Group 选项批次已完成，当前进度见 [choice-options-progress.md](./choice-options-progress.md)。下文保留本批历史验收范围。

## 2026-09-30 本批范围

本批完成独立值模型、命令式方法和局部键盘控制器；不是整组件同源，Group 视图与两端样式尚待收口。

- 先实现 Cedar 的 choice-value-props.ts、use-choice-control.ts、use-choice-keyboard.ts，再复制至 Maple；两库各自维护，无跨库依赖、共享实例或 platform 配置。
- 受控判断使用 modelValue !== undefined；defaultValue 只初始化一次，不保存被父级拒绝的提议。数组克隆，父级输入数组不被修改。
- Checkbox 为 boolean 或 ChoiceValue[]，value 为数组/分组的选项标识（默认 true）；布尔模型不再因 value 而变成自定义标量。
- Radio 为 ChoiceValue | null，null 表示未选中，重复选择不取消；业务方写 null 清空。false、0、空字符串保留实际身份。
- 移除 defaultChecked，统一 defaultValue；移除 Maple Radio.toggle，使用两端 select()；Checkbox.toggle(checked?)、focus(options?)、blur() 两端同义。新增 Methods/Model 类型导出。
- indeterminate 仅为展示属性；移除 Maple update:indeterminate 自动回写。示例改为根据子项集合计算全选/半选。
- 通知顺序为 update:modelValue → change(value, event?) → FormItem。命令式调用没有原生 Event；Cedar Tree 的回调类型同步迁移。
- 两端 Enter/空格处理绑定在当前可聚焦节点，不再由 Maple 每个子项监听 window。Enter 不处理重复 keydown；空格只在完整按下/释放后激活，失焦、KeepAlive 停用和销毁会清理待处理状态。
- 禁用禁止选择和 focus；只读允许 focus，不允许选择或命令式改值。Group 限制仍不能被子项方法绕过。
- 新增 2 组双端 control-value Demo，Maple 提供独立英文文件；旧默认值、值模型、半选 Demo 与测试均同步迁移。文档、major changeset、OpenSpec 与菜单说明同步。
- 没有覆盖两端原有主题样式，没有升级整组件状态。

## 验证

- 同源门禁：8 对核心/测试文件、6 对 Demo，规范化源码与 SFC 编译检查通过。
- 双端类型检查通过；Maple docs:check：884 个 Demo，0 失败。
- 最终回归：Cedar 46 项、Maple 81 项通过（含独立模型、Group、键盘、SSR 和相关调用方）。
- 双端 Lint、build:lib 通过；两端发布类型均导出 Model / Methods，Maple 构建产物的值 Props 验证通过。
- Cedar 发布组件裸 Node 导入通过；Maple 裸 Node 限制见下条，不能以 Props 导入或源码 SSR 代替整组件入口验收。
- 未执行真实浏览器视觉验收或整站文档生产构建。
- Maple 发布包裸 Node 组件导入仍有上一批确认的 Ripple 运行时 CSS 导入限制，本批不宣称该入口已通过；源码级 SSR 与发布类型分开验收。

## 剩余工作（状态仍为待适配）

1. 统一 Group 选项映射/类型、readonly 选项、方法/插槽及 Radio button 外观。
2. 原生控件主体、完整组键盘导航、初始焦点和动态重排统一；独立模型/局部键盘逻辑已具备复制基础，但当前主体还不是相同文件。
3. 样式/BEM/Token 和主题契约对齐，随后移除旧视图实现。
4. 清理 Ripple 运行时样式依赖，复验 Maple 发布包裸 Node SSR 导入；完成整组件验收后再升级菜单。

数量不变：44 已同源、12 逻辑已同源、11 待适配、3 逻辑待同源、1 独立。
