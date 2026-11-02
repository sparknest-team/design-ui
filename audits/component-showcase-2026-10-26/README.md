# 全量组件与示例整理

Cedar 组件菜单和逐组件对照页以 `design-ui/configs/component-showcase.json` 为分类、顺序和展示重点的维护入口。组件目录生成器读取当前组件文档与本地参考库示例，生成导航数据和延迟加载的对照数据。

- 范围：101 个组件文档入口；子组件与关联接口归入所属组件，搜索时可按子组件名称定位。
- 参考：Element Plus、Naive UI、Arco Design Vue、Vuetify、Quasar、shadcn-vue、MUI、PrimeNG、Varlet、Chakra UI。
- 对照层级：示例主题、组织方式、现有展示点和可追溯源码；不是全部参考库的运行时性能或行为实测。
- 来源：`reference-inventory.json` 保存各参考仓库提交与案例路径，公开链接固定到相应提交。
- 完整性：`docs-integrity.json` 保存首轮整理的文档摘要、普通 demo 数和表格保留结果；脚本在写入前验证普通示例引用和表格没有丢失。

分类按开发任务组织：基础与操作、布局与容器、导航与定位、文本与数值输入、选项与人员选择、日期时间与颜色、表单与文件、数据与内容展示、业务与资源、反馈与浮层、配置与交互基础。

公开文档不再展示功能调试控制台。Cedar 中英文文档、Maple 中英文文档与移动示例入口已清理；内部 API 审查夹具及其独立检查保留，生成器不再把它们写回公开页面。

```sh
pnpm --dir design-ui generate:component-showcase
pnpm --dir design-ui check:component-showcase
node design-ui/bin/demo-design-check.mjs
node design-ui/bin/same-source-demos-check.mjs
```

整理脚本重复运行应无差异；共用组件按 Cedar 顺序同步 Maple 的文档与示例，API 表和普通 demo 引用保持完整。独立日期时间字段与面板分别列入菜单。新增 Hover 文档与基础示例，补齐该公开导出的文档入口。

## 功能点和移动端专栏

功能主题规则由 `component-feature-taxonomy.json` 维护，重要增量由 `component-improvements.json` 维护。示例主题匹配只证明已找到对应示例，API 文档匹配只证明文档有说明；参考库有案例但本库未命中时标记为待核验，不推断功能缺失。

Maple 生成独立目录，使用本库的实际文档与 demo 路径。PC 文档菜单及手机首页均提供专题入口，手机站通过 `mobile.docs` 将指定根文档加入路由。目录、剪贴板示例分别位于两端 Upload 组件的示例目录，专题引用它们，不保存额外副本。

## 核心特点的提炼

`core-strengths.json` 记录跨组件设计、业务流程与工程保障，共 24 个展示点。Cedar 页面使用 21 个，Maple 页面使用 18 个；共享点在两端引用各自的实际示例，平台独有能力不作为另一端已支持项。`build-core-strengths.mjs` 生成两端说明与演示链接，逐组件卡片同时提供回到相应特点的入口。此清单描述已实现设计与演示方法，不将共性能力推断为独有优势。
