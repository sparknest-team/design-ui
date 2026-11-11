# Layout / NavMenu 变量消费收口

此前 10 项待审消费现已全部收口，全库扫描待审为 0、错误为 0。本次开始检查时，源码中已完成以下调整；本轮补充编译样式、浏览器回归、文档和门禁，确认调整真实生效。

| 原待审项 | 当前消费契约 |
| --- | --- |
| Layout 的 font-color-dark、sider-background、trigger-dark-color | 3 个无消费声明已移除；文字、背景和触发按钮使用随主题变化的公共变量 |
| Layout 的 sider-light-box-shadow | 直接用于 Sider 的 box-shadow；自定义阴影和 none 均生效 |
| NavMenu 的 6 个 dark-* 变量 | 无消费声明已移除；根菜单和子菜单通过同一组公共变量及内部别名控制背景、悬停、选中、普通和禁用文字 |

Layout 与 NavMenu 的中英文 CSS Variables 说明已同步当前用法，解释名称含 light 的变量在明暗主题中均可覆盖、阴影与边框独立控制，以及局部菜单主题的配置入口。迁移和验收记录只保存在审计目录。

新增消费测试编译真实 Less 入口，检查最终 CSS 属性、别名链和旧声明回流，并接入 Cedar、Maple 的 `check:style-vars`。同时修正变量文档生成器，保留说明变量职责的语义表，避免把它误判为重复默认值表。

| 验证 | 结果 |
| --- | --- |
| Cedar / Maple check:style-vars | 均通过，共享变量契约、消费回归与文档一致性均通过 |
| check:component-css-docs | 12 项测试通过，393 页无漂移 |
| check:public-docs | 5 项测试通过，421 页无问题 |
| 全局变量目录 | 3 页与当前声明一致 |
| Layout / NavMenu / 局部主题 Vue 测试 | 16 个文件、150 项通过 |
| 浏览器编译样式 | 5 组通过：全局明暗、嵌套明暗边界、3 个作用域的公开覆盖及交互状态 |

浏览器使用生产 Less 编译结果与匹配组件的 DOM 类名，验证计算样式；组件挂载、交互与 Teleport 由 Vue 测试另行覆盖。本报告不代表整个仓库 quality、生产文档站构建或 API 翻译流水线通过。

结果见 [validation.json](validation.json)、[浏览器结果](results.json)、[覆盖截图](overrides.png)。全量扫描保存在 inventory.json，原始 10 项保存在 [初始待审记录](../public-doc-structure-2026-11-09/variable-consumer-review.initial.json)。

复查命令：

```sh
pnpm --dir cedar-design-web check:style-vars
pnpm --dir maple-design-mobile check:style-vars
pnpm --dir design-ui check:component-css-docs
pnpm --dir design-ui check:public-docs
pnpm --dir design-ui check:layout-nav-tokens:browser
```
