# Cedar 和 Maple 组件文档层级整理

组件页面向接入组件的开发者，说明当前配置、交互、API、类型和样式定制。本轮检查两库 421 份中英文组件及功能文档，归档涉及 370 页的整理记录；最终层级检查为 0 个待改页面、0 个规则问题。

## Menu 的目录

| 内容 | 整理后的归属 |
| --- | --- |
| 稳定唯一的 value、0 与字符串 0 的区别 | 选项与层级下的选项值 |
| 切换触发元素时关闭原菜单 | 触发与定位下的切换触发元素 |
| placement、自动翻转及配置入口 | 并入弹出方向，保留定位策略示例 |
| Enter、Space、方向键、Escape、Tab | 独立的键盘操作章节 |
| Props、Events、Methods、Slots | API；修正误标为 MenuOptionData 的事件、方法和插槽 |
| 数据结构与类型导入 | Types |
| 选中和悬停颜色、分组行高与留白 | CSS Variables，明确对应变量名称 |

“状态与时长”改为“选项状态颜色”；数据身份和方位说明不再位于 CSS Variables 下。Vue key 生成机制、内部桥接事件和内部实例字段不作为调用指南展示。菜单值与触发规则仍保留，改写为开发者可以直接使用的配置说明。

## 全库整理

- 从样式章节移出 Form 编辑确认、加载守卫、原生事件、日期与时间事件、类型导入、插槽及实例方法，归入用法、API 或 Types。
- 清理旧变量和旧类型删除记录、改名对照、预发布迁移、源码治理和测试验收过程说明。当前 API 的必要限制和取消异步任务等真实行为继续保留。日程的“本次及以后”、数据删除、焦点转移等业务含义不会被当作 API 迁移记录删除。
- 清理空小节、含糊标题和重复定位说明，保留全部可运行示例引用。移出的维护内容保存在 audits/evidence，不进入公开组件页。
- 变量表导语改为样式定制说明；样式变量、声明条件和有效状态仍完整保留。Teleport 说明区分普通 CSS 继承与 StyleProvider 的主题规则。
- 为工作区已存在的 StyleProvider 局部主题示例补充分组登记，避免文档整理或翻译因未分组示例中断。

## 后续生成规则

[public-documentation-policy.mjs](/Users/shuaimeng/github_web/design-ui/bin/public-documentation-policy.mjs) 统一处理语义层级和当前用法文案。组件 CSS 表生成器、API 标题规范化、文档清理和 API 翻译输出复用该规则。翻译期间的变量占位块保留在样式章节，避免变量表被移动或丢失。

从工作区运行：

```sh
node design-ui/bin/public-docs-check.mjs
node design-ui/bin/public-docs-check.mjs --write
pnpm --dir design-ui check:public-docs
```

两库 check:doc-pipeline 在原有检查之前执行新的公共文档门禁。新增标题及本轮改写用语已补充英文词条；没有批量覆盖既有英文正文。

## 验证

| 检查 | 结果 |
| --- | --- |
| 公共文档层级与内容 | 421 页，0 待改，0 问题；再次运行无变更 |
| 文档回归 | 30 项通过 |
| 可运行示例引用 | 每次整理均比较前后引用，保留全部示例 |
| Markdown 与 Menu 预览 | 421 页解析；Cedar/Maple 中英文 Menu 在 1280px、375px 共 8 个预览通过 |
| 浏览器检查范围 | 使用文档预览夹具，检查目录与页面宽度；不代表生产站点构建或交互组件回归 |

截图：[Maple Menu 桌面预览](menu-2-1280.png)、[Maple Menu 窄屏预览](menu-2-375.png)。浏览器详情见 results.json。

## 变量门禁收口与其他检查状态

此前检出的 Cedar Layout 4 项、NavMenu 6 项已完成核对：9 项旧暗色声明已清理，侧栏阴影变量已有实际消费。新增编译样式回归并接入两库 `check:style-vars`；两库变量门禁、393 页 CSS 文档检查、421 页公共文档检查均通过。当前待审消费为 0；原始 10 项保存在 variable-consumer-review.initial.json。完整证据见 [Layout/NavMenu 收口报告](../layout-nav-token-closure-2026-11-09/README.md)。

API 翻译复现仍有 209 条未登记用语、62 页候选差异（210 个文档族）；没有应用会批量替换已有英文正文的写入。新增文档结构检查与此项分开记录，不把全库文档构建或 quality 标为通过。

完整状态见 [validation.json](validation.json)，历史内容归档见 [整理前内容](../evidence/public-doc-structure-2026-11-09.json)。
