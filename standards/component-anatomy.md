# 组件结构

公开组件必须具有入口、运行时 Props、Props 类型、实例类型、文档、示例和行为测试。子组件可复用父组件文档，但必须在父组件测试中覆盖。内部组件必须显式登记为 `internal`，不要求公共文档。

组件分类：`public`、`subcomponent`、`internal`、`utility`。规范检查器根据分类应用不同规则，禁止仅因目录中存在 `index.ts` 就把工具目录当作公开组件。

公开入口至少导出：默认组件、`XxxProps`、`xxxProps`、`XxxInstance` 和 resolver 所需内部别名。新增组件必须通过生成器创建，减少结构漂移。

组件实现、内部控件和命令式服务不得反向依赖自己的公共聚合入口或组件库根入口。类型从独立类型模块使用 `import type` 引入，服务直接引用所需的内部组件；公共入口负责安装和导出，服务模块不兼任组件导出入口。双端遵守同样的依赖方向。

文档站的组件／函数自动导入只服务于示例和站点，内部 Vue／TS 实现必须使用显式依赖，防止编译时注入公共入口形成运行时环路。不可用特定组件的强制整页刷新、忽略错误或延迟读取未初始化绑定代替修复。热更新验收应同时确认模板／脚本修改生效和页面外层状态保留。

两库统一执行 `pnpm check:runtime-dependencies`（已接入各自 quality／CI），检查全部组件实现、私有／孤立模块、shared／use 源码，排除类型依赖后检查环路及根入口回流，并禁止组件和站点工具通过强制刷新、关闭 HMR 或手写 accept/invalidate 隐藏错误。门禁实现由 `design-ui/bin/runtime-dependency-check.mjs` 唯一维护；不允许新增循环白名单。文档源码同步所需的模块失效与页面重新编译不是整页刷新，不应删掉。Image／Upload 额外保留专项闭包检查。

递归组件通过自身递归或插槽组合实现，避免“渲染器 → 分支组件 → 渲染器”的模块环；公共聚合入口仅负责导出，基础函数放独立模块，内部计算模块只依赖具体模块，不回流聚合入口。Cedar 独有组件遵守相同原则，不为对齐而在 Maple 增加无对应需求的组件。

shared 的显式导出、细粒度实现、类型与同源门禁遵守 [Shared 工具公共契约](./shared-foundation.md)。

## 同源检查与本地配置

同源检查按语法规范化处理格式差异，包括换行、导入分组与可选控制流花括号；必须保留类型、运算符、字面值、事件和有覆盖含义的绑定顺序。字符串中的空格不可删除。规范化回归必须同时覆盖等价格式和确实改变行为的反例，不能通过扩大忽略清单隐藏实现差异。

平台的语言和尺寸配置放在组件已有的本地配置入口，业务实现继续独立维护并接受同源检查。例如 Tabs 的语言读取与尺寸继承由各自的 use-tabs-configuration 负责；不另建 platform 模块包装业务实现。

## API 文档标题

Cedar 和 Maple 的中英文组件页面使用相同的技术标题。API 入口为 `## API`；分类统一使用三级标题，包含 PascalCase 组件名，不加尖括号、反引号或平台前缀：

```markdown
## API

### Button Props

### Button Events

### Button Slots

### Button Methods

### ButtonGroup Props

## Types

## CSS Variables
```

每页只有一个 `## API`。主组件、子组件及独立面板的 Props / Events / Slots / Methods 使用平级三级标题；不再保留 `## ButtonGroup`、`## FormItem API` 等 API 分组标题。组件介绍和可运行示例的功能分组继续保留，不与 API 章节混用。

仅展示实际提供的分类，不增加空章节。命令式服务配置使用 `Xxx Options`，实例方法统一使用 `Methods`，实例属性使用 `Instance Properties`。同一表格同时描述多类成员时可使用 `Xxx Events / Methods`；正文、表头和行为说明继续使用页面语言，已有版本标记保留在标题末尾。

共享成员在每个实际组件的表格中完整展示，不使用 `Common Props / Events / Slots` 作为用户页面的分类。Typography 的共享表格维护于 `design-ui/configs/typography-api.json`，由 `typography-api.mjs` 为 Text、Title、Paragraph 生成完整表格，避免手工维护重复内容。运行时未实现对应组件的平台不添加虚构 API。

`EllipsisConfig`、`TreeNodeData` 等配置和数据结构定义归入唯一的 `## Types`，各类型使用三级标题；`Xxx Options` 若本身是命令式服务入口则保留在 API。样式变量在中英文页面均只使用一个 `## CSS Variables` 入口，与 API、Types 平级，不加组件名前缀。子组件按 `### BreadcrumbItem` 等组件名分组；动效、颜色等分类使用其下的简短标题，不重复添加 CSS Variables / 变量后缀。变量表不得混入 API 或 Types，重复入口合并，示例标题和主题使用步骤保留原有语义。合并重复表格时，只有正式表格覆盖旧片段的全部成员才能替换；有冲突或独有成员时必须核对后处理。围栏内的标题和示例中的 Vue Options API 不参与统一。

执行 `node design-ui/bin/normalize-api-headings.mjs` 检查，使用 `--write` 修复；回归检查为 `node --test design-ui/bin/normalize-api-headings.test.mjs design-ui/bin/api-document-structure.test.mjs`。标题变更应同步检查文档解析、提示生成与中英文生成结果。
