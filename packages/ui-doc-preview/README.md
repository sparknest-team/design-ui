# @ui-foundation/ui-doc-preview

跨 Cedar 与 Maple 文档站复用的 Demo 展示外壳。它只负责预览容器、源码展开、复制、源码标签页和 Playground 入口，不包含任何组件库 Demo。

## 单一来源约束

- 运行预览和“查看源码”必须指向同一个 `.vue` 文件。
- 文档适配器负责解析 Demo 文件并传入 `DocPreview`，组件本身不复制业务示例源码。
- Cedar、Maple 可以保留各自的 VuePress/Markdown 适配器；适配器输出统一的 `DocPreviewSource` 协议。
- 历史文档尚未拆成独立 Demo 文件时，可以把组件的 `example/index.vue` 作为页面级预览，但这只是迁移兼容模式。新增和重构的案例应使用一个场景一个文件。

## 边界

这个包不负责路由、移动端 iframe、主题配置和 Playground URL。上述能力由 Cedar、Maple 各自的文档站适配器注入，以免公共展示层反向依赖任一组件库。

## 人工交付审查

`ReviewPanel` 是独立于组件库的审查面板，不直接导入 Cedar 或 Maple。两端的 `ApiReviewPanel.vue` 适配器通过 `controls` 注入各自真实的 Button、Checkbox、Select、Input、InputNumber、Textarea、Collapse 和 CollapseItem，并引入对应样式。控制面板与 authored demo 都使用所属组件库的组件；禁止用原生交互标签代替。FieldDecorator 通过本库 Input 编辑展示值。每个组件使用一个组合案例承载常用属性，保留原来的数据、事件处理器和专项场景。

- 属性名旁的 checkbox 控制是否覆盖；值控件控制具体取值。取消覆盖恢复 authored fixture 的绑定，而不是强行写回文档默认值，因此可以验证继承和显式 false。
- boolean、枚举、数字、文本、简单 JSON、尺寸预设与数字联合类型均有对应控件。复杂对象提供 JSON 与逐字段覆盖，保留原配置中的函数、组件和 VNode；回调提供符合签名的观察、自定义、允许、拒绝或异步策略。
- 常用内容插槽可与属性组合，已有具名插槽可关闭以验证 fallback；复杂插槽显示真实上下文，并可用本库 Button 调用操作，传入 JSON、上下文对象或按钮事件。
- v-model 更新会同步已开启的覆盖值；事件日志保留最近 30 条，循环引用和原生事件可安全显示。
- 重新挂载保留控制选项，用于验证 default-* 等初始属性；重置同时清除覆盖值、日志、插槽选择和预览内部状态。
- 实例方法列表读取实际 expose() 和文档声明的 Options API 公开函数，支持选择目标实例、输入 JSON 参数数组和查看异步结果。常用参数提供可编辑预设，校验方法可追加结果回调；函数服务另有触发、默认配置及返回句柄入口。

### 维护入口

在 workspace 根目录运行：

```sh
node design-ui/bin/generate-review-demos.mjs
node design-ui/bin/complete-review-demos.mjs
node --test design-ui/bin/generate-review-demos.test.mjs design-ui/bin/complete-review-demos.test.mjs
node design-ui/bin/review-demos-check.mjs
```

生成器读取两端 Props 源码和 API 文档，以现有案例为基线，生成 `api-review.vue`、对应配置和文档入口。Maple 同时接入移动端 `example/index.vue`；生成阶段执行 Maple 的格式与模板规则检查。修改原案例或 API 后重新生成，不直接维护生成文件。脚本需要本 workspace 的两端依赖已安装。

覆盖目录位于 `design-ui/audits/demo-api-review.json`。其中 `controls` 是可操作属性数量，`undocumented` 是源码中存在但未在当前主 Props 表找到的属性；`scenarios` 只是源码字面量定位索引，**不是 API 已经人工通过的证明**。隐式默认插槽、动态属性和间接调用可能不命中字面量索引。

### 全量复查

```sh
node design-ui/bin/review-demos-check.mjs
DEMO_AUDIT_BATCH_SIZE=10 node design-ui/bin/review-demo-runtime-check.mjs
DEMO_AUDIT_BATCH_SIZE=4 node design-ui/bin/review-demo-runtime-check.mjs --services
node design-ui/bin/review-demo-runtime-check.mjs --verify
node design-ui/bin/demo-api-coverage-check.mjs
```

原生控件检查同时覆盖组件 demo、文档 HTML/Vue 代码块、自绘点击按钮和第三方控件前缀。组件矩阵挂载全部组合案例，核对每个字段使用的真实组件控件，并逐组件验证两个属性组合、编辑、取消、重新挂载和重置。动态 v-model 更新通过事件日志确认同步，不强制恢复初始值。

`demo-api-coverage-check.mjs` 输出逐组件表格及逐项 JSON，保留子组件 API 和命令式配置。模板绑定、方法调用、可切换控件、事件订阅及未找到可靠证据的项目分别记录；事件订阅不等于事件行为已验收，静态证据也不等于视觉验收。

补全后的场景清单为 `demo-review-cases.json`，基础清单 `demo-api-review.json` 不能代替最终覆盖表。补全阶段选择现有 fixture，组合入口只挂载当前场景。重跑可用 `--resume`；复杂 Table 场景遇测试进程内存限制时，可设 `DEMO_AUDIT_BATCH_SIZE=1` 重跑未完成项，未完成和进程异常均不计为通过。
