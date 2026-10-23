# VerificationCode 主体同源 — 2026-10-09

## 实现与边界

- Cedar TSX 改为 script-setup SFC，补齐 Maple 的 type、variant、maskSymbol、autofocus、gutter/align、allowPaste/pasteTransform 和实例颜色；完成后独立复制两端主体、Props、Emits/Slots/Expose、样式、测试及 Demo。无跨库运行时、platform 配置或兼容 alias。
- 两端保留 separator 函数及插槽、逐字符 formatter。统一 digit 默认；Unicode 码点处理；短信整码单次 input 分发；粘贴从目标格插入；allowPaste=false 阻止浏览器默认写入。
- input → update:modelValue → change 表示有效编辑提议；finish 仅在本轮渲染接受完整提议后触发。异步外部赋值不补发 finish；受控拒绝恢复 DOM。非受控值由组件保存。
- 通过各库独立 form-adapter 隔离子 Input 的 Form 事件，每种整体语义一次，显式 false 覆盖继承；禁用/只读禁止编辑，readonly 允许焦点和复制。
- IME 期间无删除/跳焦；Backspace/Delete 删除后前移字符；每格独立 SSR id、首格 one-time-code；KeepAlive generation 取消停用前未完成的聚焦、DOM恢复及 finish。
- 掩码仅展示，不是安全存储/加密；按码点而非字素簇长度。focus/blur/reset 为公开方法。
- 中文与英文示例独立 Vue 文件，中央卡片/移动集合复用文件；API、键盘、模型及 token 文档更新。旧 Cedar 示例保留在目录中供独立复用，当前文档入口使用新四组配对 Demo。

## Token 映射

两端仅前缀不同：

| 后缀 | 默认值 | CSS 作用 |
| --- | --- | --- |
| verification-code-gutter | var(--{prefix}-sys-space-2) | 单元格间 gap |
| verification-code-cell-height | initial | 可选覆盖，fallback 为 size 对应 FieldDecorator height |
| verification-code-cell-max-width | initial | 可选覆盖，fallback 为 size 对应 FieldDecorator height |
| verification-code-input-font-size | initial | 可选覆盖，fallback 为 size 对应 FieldDecorator font-size |

Cedar 删除旧 column-gap；Maple 四项保留名称但改为尺寸派生。public initial 使用 CSS var fallback 在组件元素处读取私有尺寸，避免在 :root 引用尚未定义的 private 变量。按需样式仅依赖 Input，不重复引入 FieldDecorator/Icon。

## 验证

- Cedar 22 项通过；Maple 27 项通过。原测试保留，仅 Cedar size selector 迁移至实际 FieldDecorator BEM、完成测试改用接受模型的非受控初值（拒绝完整提议另有测试）。
- 配对 18 项：事件顺序、Form每种通知次数、继承/显式覆盖、受控重复拒绝、短信整码、粘贴起点/过滤、Unicode、禁止粘贴、禁用/只读、IME、删除焦点、SSR多实例、全size/variant、KeepAlive停用。
- 两端 src/verification-code 定向 ESLint 均 exit 0。
- verification-code-core-check.mjs 验证11对源码，TypeScript AST保留声明；仅本库Form与install协议明确排除。
- Less 实际编译验证五档 field-size 映射及公开 dimension fallback 表达式。尚未进行浏览器 computed/视觉验收，不能据此宣称全部视觉验收完成。
- 根导出、全局库存、theme-contract、生成文档以及整库类型/构建由主代理集成。

## 主审后补强

修复已填格光标位于末尾时单字符键入误写入下一格的问题：仅真实 input/insertText 的单 Unicode 码点 data 作为当前格替换，保留整码自动填充和 compositionend 整段提交。新增真实 InputEvent 的末尾替换、整码格式化和 emoji 回归；最终 Cedar 21 / Maple 26 通过，两端专项 lint exit 0，11 对源码门禁通过。

IME 追加验收：已有格末尾 compositionend 优先使用非空 data，支持“中”与“中文”本次提交；空/缺失 data 保留原生值 fallback。增加真实 CompositionEvent 回归；最终 Cedar 22 / Maple 27、两端 lint、11 对门禁通过。
