# @ui-foundation/ui-doc-preview

跨 Cedar 与 Maple 文档站复用的 Demo 展示外壳。它只负责预览容器、源码展开、复制、源码标签页和 Playground 入口，不包含任何组件库 Demo。

## 单一来源约束

- 运行预览和“查看源码”必须指向同一个 `.vue` 文件。
- 文档适配器负责解析 Demo 文件并传入 `DocPreview`，组件本身不复制业务示例源码。
- Cedar、Maple 可以保留各自的 VuePress/Markdown 适配器；适配器输出统一的 `DocPreviewSource` 协议。
- 历史文档尚未拆成独立 Demo 文件时，可以把组件的 `example/index.vue` 作为页面级预览，但这只是迁移兼容模式。新增和重构的案例应使用一个场景一个文件。

## 边界

这个包不负责路由、移动端 iframe、主题配置和 Playground URL。上述能力由 Cedar、Maple 各自的文档站适配器注入，以免公共展示层反向依赖任一组件库。
