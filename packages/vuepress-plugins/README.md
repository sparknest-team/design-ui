# @sparknest/vuepress-plugins-vue

Cedar 和 Maple 的 VuePress 配置使用 `defineDemoSite(config)` 注册示例插件。站点负责提供主题、语言和 Vite 配置。已有 VuePress 项目也可以单独注册 `codeBlockPlugin()`。

滚动锚点通过 `@sparknest/vuepress-plugins-vue/scroll-hash` 导出的 `installScrollHash(router, contentSelector)` 安装，返回值用于卸载监听器。`ui-docs-llms <cedar|maple> <package-root> <public-output>` 生成独立的 Markdown 和文本输出。

示例渲染源自 haiweilian 的 MIT 项目 bfehub/vmi 1.60.3，上游许可和变更历史见 LICENSE 和 UPSTREAM_CHANGELOG.md。
