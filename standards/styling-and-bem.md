# 样式与 BEM

- Cedar 类名前缀 `c-`，Maple 类名前缀 `mp-`。
- Block、Element、Modifier 分别为 `<block>`、`<block>__<element>`、`<block>--<modifier>`。
- BEM modifier 不是 CSS 自定义属性，禁止加入 token 前缀。
- 组件样式只消费组件 Token 或语义 Token；新增颜色、字号、间距、圆角、阴影、动效时长常量必须先定义 Token。
- 不把 DOM 层级、内部 class 或生成器细节视为稳定公共 API；需要定制时提供公开 Token、part/class API。

## 按需样式与去重

- 采用 Arco / Element Plus 的静态模块入口模式：`style/index.ts` 按公共基础、依赖组件、自身样式的顺序声明副作用 import，不包含运行时逻辑。
- 会输出 CSS 的跨组件依赖只能通过 TS 样式入口引入，不能再通过 Less 将同一依赖内嵌进组件 CSS。
- Less 仅聚合自身 Token、主体规则及纯变量 / mixin；复用 mixin 应拆为不直接输出 CSS 的文件，不能为调用 mixin 导入整份组件样式。
- 基础主题、工具类保持统一模块路径；Resolver 和显式函数导入插件只补组件样式入口，模块去重由构建工具完成，不自行扫描或删除浏览器 style 标签。
- 发布编译保留完整入口依赖图，将 Less 引用转换为 CSS，目录入口转换为 ESM/CJS 对应的明确文件路径。禁止把入口重写为仅 `import './index.css'`。
- `package.json#sideEffects` 必须覆盖源码样式入口、发布样式入口及 CSS / Less，避免源码文档构建或下游构建误删样式。全量 CSS 同样遵循依赖先于自身的顺序。
- Cedar / Maple 独立维护各自样式；构建工具的复用不引入跨端运行时依赖。
- 验证：在工作区根执行 `node design-ui/bin/style-modules-check.mjs`；构建两端后追加 `--built` 检查发布依赖。构建器测试：`node --test design-ui/packages/ui-build/test/style-dependencies.test.mjs`。

参考：[Arco 样式入口](https://github.com/arco-design/arco-design-vue/blob/main/packages/web-vue/components/button/style/index.ts)、[Element Plus 样式入口](https://github.com/element-plus/element-plus/blob/dev/packages/components/message/style/css.ts)。
