# 文档

公开组件文档至少包含：用途、何时不使用、示例、Props、Emits、Slots、Expose、Token、键盘操作和可访问性说明。公共类型和默认值应从源码生成，避免手工表格漂移。

API 变更必须同步中英文文档；暂未提供英文时应在组件元数据中显式登记，而不是静默缺失。

生成的长 Token/API 表格应在自身容器内横向滚动，不能撑宽整个文档页面；至少在常规桌面和窄桌面窗口验收。源码一致性、Markdown 编译与生产页面布局是不同检查，不能互相替代。

文档站断点属于站点布局，不作为组件公开 Token。Maple 在 1200px 以下将预览排到正文下方，768px 以下使用非模态的可展开目录；语言切换始终可用。目录按钮需提供 aria-expanded / aria-controls，Escape 返回按钮，选页后焦点进入正文；长表横向滚动不能依赖整页裁剪。桌面浏览器的小窗口测试不能记为触屏真机验收。

## 站点与示例多语言

- 统一语言标识为 `zh-CN`、`en-US`。URL 是当前语言的依据；切换保留当前组件，刷新和浏览器前进后退应保持 URL 对应语言。
- Cedar 使用 VuePress 原生 `locales`：中文 `/`、英文 `/en/`；英文组件文档放在同目录 `README.en-US.md`，显式声明英文 permalink 和 lang。两份文档引用同一份 `__demos__/*.vue`。
- Maple 保留 CLI 的 `/#/<language>/<component>` 路由。站点入口根据路由统一更新全局 Locale。需要按语言选择文案或示例的手机入口和子示例，从 `@maple-design/cli-vue/demo-language` 导入只读的 `demoEnglish`。禁止在示例中复制语言到 ref、调用 watchLang、解析路由或逐级传递 english prop。组件内可复用 `example/messages.ts`，参考 Section。组件的英文/中文正文仍分别放在 `docs/en-US.md`、`docs/zh-CN.md`。
- 示例 SFC 默认保持可独立复制，简单控件使用固定、易理解的文案；演示本身需要本地化时，才使用局部消息目录。既有复杂示例逐步迁移，不用运行时 DOM 替换或自动翻译源码。
- 平铺双语示例允许 `name.vue` 搭配 `name.en-US.vue`（或显式 `name.zh-CN.vue`）。文档检查按当前语言优先选择对应后缀，再回退无后缀文件；不能要求同一语言正文同时引用两份翻译。既有 `zh-CN/`、`en-US/` 目录形式保持原有优先级。
- 组件内置语言包与站点文案分离，由站点入口根据路由统一切换；iframe 使用显式 language 参数，单独打开也保持语言。
- 无译文时必须明确说明回退语言。Cedar 构建时为缺失英文正文提供同路径回退页；已有英文页面优先。回退页不能宣称正文已翻译。
- 运行 `node design-ui/bin/site-i18n-check.mjs` 与 `node design-ui/bin/same-source-demos-check.mjs` 验证语言回退、标题目录、原生英文页面和示例一致性。

## Demo 单一来源

- 中间预览、移动端预览和“查看源码”必须引用同一份组件目录内 `.vue` 文件，不允许把可执行示例再复制进 Markdown。
- Cedar、Maple 的站点适配器应共同使用 `@sparknest/ui-doc-preview-vue` 的展示外壳，但分别解析本端的 VuePress/Markdown 语法。Maple 已接入；Cedar 现有展示行为保持不变，后续只替换展示外壳，不迁移 Demo 文件。
- Maple 使用 `demo` 文件引用块作为正式格式。尚未拆分的历史页面由适配器读取 `example/index.vue` 生成页面级预览；这是迁移兼容状态，不能等同于逐案例已经单一来源。
- Maple 右侧集合页按 `section[data-demo]` 排列场景，并导入 `example/demos/*.vue`；中间文档按同一顺序渲染一个场景一张卡片。集合页、消息目录和子 Demo 文件都必须加入 Vite watch graph。
- 修改 Demo 文件后，开发服务器必须同时刷新运行预览和源码面板；生产构建必须把引用文件纳入依赖图。

依据：[VuePress I18n](https://vuepress.vuejs.org/guide/i18n.html)、[Hope 主题语言配置](https://theme-hope.vuejs.press/config/theme/i18n.html)。

## 完整的组件英文 API

组件英文页必须直接包含与中文对应的属性、事件、插槽、方法、类型和配置边界，不用中文 API 链接代替译文。中英文成员名、类型、真实默认值、示例集合及配置对照项必须一致；真实的平台差异保留，不给 Maple 补空的 Cedar-only API。示例中的业务数据及真实默认字符串可以保留原值。

公共译文维护在 `configs/api-documentation.en-US.json`，运行 `node bin/localize-api-documentation.mjs --write` 同步组件英文 API、补充配置章节和配置对照；缺少译文时先报错，不写入半成品。运行 `node --test bin/api-documentation-locales.test.mjs` 检查全部已登记组件族，结合现有示例分组和手机入口门禁；不得把非组件指南的语言回退用于替代组件 API。

## 组件 CSS Variables 参考

公共组件与功能文档均保留一个 CSS Variables 章节。公共变量表从编译后的声明生成，包含完整名称、默认表达式、选择器条件及消费属性；原有状态职责说明继续维护。无独立外观变量时说明配置入口与组合组件的定制边界，不创建无消费者变量。

在工作区运行 `node design-ui/bin/component-css-docs.mjs --write` 更新中英文组件表，运行同一命令的 `--check` 检查漂移。生成过程拒绝编译错误和未审消费；私有目录与 internal 变量不列入公共契约。两库的 check:style-vars 以及共享 check:token-reference 均执行该门禁。总目录继续由 `node design-ui/bin/token-catalog.mjs --patch` 生成。

覆盖示例应交代实际 DOM 作用域、浮层挂载位置、状态、行内属性优先级及根别名的局部继承边界。新增或删除公共变量时同步消费、双语文档和共享契约。

## 面向组件使用者的内容与层级

组件页面向接入和使用组件的开发者，描述当前配置、交互、API、类型及样式定制。版本变更、旧 API 迁移表、源码治理过程、测试验收记录和内部桥接机制保存在维护文档或 audits 中，不出现在组件页。取消过期异步请求等会影响调用方的行为仍应说明，不因包含“旧请求”“删除数据”等词而删掉有效用法。

CSS Variables 仅包含变量表、覆盖方式及相关颜色、尺寸、动效说明；定位配置、值身份、守卫、事件、插槽和类型定义必须属于相应的用法、API 或 Types 章节。示例分组与主题层级按语义组织，不把文档尾部的新增说明默认归入最后一个章节。

运行 `node design-ui/bin/public-docs-check.mjs --write` 整理文档，移出的内容保存在 audits/evidence。`--check`（默认只读）检查完整文档层级和历史内容残留；组件变量生成与 API 标题规范化均复用相同规则，两库 check:doc-pipeline 在文档编译前执行此门禁。
