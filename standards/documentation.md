# 文档

公开组件文档至少包含：用途、何时不使用、示例、Props、Emits、Slots、Expose、Token、键盘操作和可访问性说明。公共类型和默认值应从源码生成，避免手工表格漂移。

API 变更必须同步中英文文档；暂未提供英文时应在组件元数据中显式登记，而不是静默缺失。

生成的长 Token/API 表格应在自身容器内横向滚动，不能撑宽整个文档页面；至少在常规桌面和窄桌面窗口验收。源码一致性、Markdown 编译与生产页面布局是不同检查，不能互相替代。

文档站断点属于站点布局，不作为组件公开 Token。Maple 在 1200px 以下将预览排到正文下方，768px 以下使用非模态的可展开目录；语言切换始终可用。目录按钮需提供 aria-expanded / aria-controls，Escape 返回按钮，选页后焦点进入正文；长表横向滚动不能依赖整页裁剪。桌面浏览器的小窗口测试不能记为触屏真机验收。

## 站点与示例多语言

- 统一语言标识为 `zh-CN`、`en-US`。URL 是当前语言的依据；切换保留当前组件，刷新和浏览器前进后退应保持 URL 对应语言。
- Cedar 使用 VuePress 原生 `locales`：中文 `/`、英文 `/en/`；英文组件文档放在同目录 `README.en-US.md`，显式声明英文 permalink 和 lang。两份文档引用同一份 `__demos__/*.vue`。
- Maple 保留 CLI 的 `/#/<language>/<component>` 路由。标题类 demo 文案使用组件级 `example/messages.json`，通过站点 `createDemoMessages` 读取；无需每个 demo 创建语言 TS 模块。组件的英文/中文正文仍分别放在 `docs/en-US.md`、`docs/zh-CN.md`。
- 示例 SFC 默认保持可独立复制，简单控件使用固定、易理解的文案；演示本身需要本地化时，才使用局部消息目录。既有复杂示例逐步迁移，不用运行时 DOM 替换或自动翻译源码。
- 平铺双语示例允许 `name.vue` 搭配 `name.en-US.vue`（或显式 `name.zh-CN.vue`）。文档检查按当前语言优先选择对应后缀，再回退无后缀文件；不能要求同一语言正文同时引用两份翻译。既有 `zh-CN/`、`en-US/` 目录形式保持原有优先级。
- 组件内置语言包与站点文案分离，由站点入口根据路由统一切换；iframe 使用显式 language 参数，单独打开也保持语言。
- 无译文时必须明确说明回退语言。Cedar 构建时为缺失英文正文提供同路径回退页；已有英文页面优先。回退页不能宣称正文已翻译。
- 运行 `node design-ui/bin/site-i18n-check.mjs` 与 `node design-ui/bin/same-source-demos-check.mjs` 验证语言回退、标题目录、原生英文页面和示例一致性。

## Demo 单一来源

- 中间预览、移动端预览和“查看源码”必须引用同一份组件目录内 `.vue` 文件，不允许把可执行示例再复制进 Markdown。
- Cedar、Maple 的站点适配器应共同使用 `@ui-foundation/ui-doc-preview` 的展示外壳，但分别解析本端的 VuePress/Markdown 语法。Maple 已接入；Cedar 现有展示行为保持不变，后续只替换展示外壳，不迁移 Demo 文件。
- Maple 使用 `demo` 文件引用块作为正式格式。尚未拆分的历史页面由适配器读取 `example/index.vue` 生成页面级预览；这是迁移兼容状态，不能等同于逐案例已经单一来源。
- Maple 右侧集合页按 `section[data-demo]` 排列场景，并导入 `example/demos/*.vue`；中间文档按同一顺序渲染一个场景一张卡片。集合页、消息目录和子 Demo 文件都必须加入 Vite watch graph。
- 修改 Demo 文件后，开发服务器必须同时刷新运行预览和源码面板；生产构建必须把引用文件纳入依赖图。

依据：[VuePress I18n](https://vuepress.vuejs.org/guide/i18n.html)、[Hope 主题语言配置](https://theme-hope.vuejs.press/config/theme/i18n.html)。
