# Cedar 和 Maple Vue CSS Variables 修复结果

本次扫描指出的组件变量文档、消费识别、Less 编译和契约登记问题已修复。Cedar 与 Maple 共 393 个组件及功能文档页均有 CSS Variables 章节；两库全部 4496 个公共组件变量在中英文对应组件族中均有完整名称记录，遗漏为 0。28 份原子样式、色板等指南页不作为组件章节补齐的分母。

## 修复内容

| 项目 | 结果 |
| --- | --- |
| 双语组件页 | Cedar 204 页、Maple 189 页；完整变量表或无独立公共变量说明 |
| 完整变量名称 | Cedar 2623 个、Maple 1873 个；中英文遗漏均为 0 |
| 全局变量总表 | Cedar 中文、Maple 中英文三页均与当前编译结果一致 |
| 变量消费 | 177 个 token.less 文件、4681 项按文件去重声明；编译错误 0、待审消费 0 |
| 覆盖规则 | 实际根节点、弹层宿主、状态、行内属性优先级、根别名继承边界均已说明 |
| 无独立外观组件 | 说明公开配置及组合组件变量，不制造空 Token |

公共表只列公开变量，保留默认表达式、条件选择器及实际消费 CSS 属性；原有职责说明、例子和 API 内容保留。生成表支持自身横向滚动。

## 实现与契约

- Maple Time 的 min-width 改为 Less 转义表达式，产物保留 min(100%, var(--mp-time-picker-min-width))，覆盖入口恢复生效。
- Cedar Switch、NavMenu 的真实行内样式消费及私有 FieldPresentation 的动态测量消费进入已审检查，修复检查器对已有消费者的漏报。
- Maple 时间面板 15 项共用默认值集中到私有 picker-field 的 token.less，并使用 internal 命名；所有真实源码引用同步迁移。Firefly 中与默认值相同的私有主题覆盖已移除。私有目录变量统一判为内部契约。
- 19 个旧日期、时间和表单变量没有 CSS、运行时、主题或示例消费，删除声明及死赋值，组件文档不再承诺这些无效入口。
- 共享契约登记 Collapse 的 focus-color、focus-offset、focus-width 及实际默认值。初次报告将此项误记为 Steps，已更正。
- 主题检查忽略测试夹具，避免把 --mp-example 等测试键误判成真实主题。
- Typography 的旧 API 展开器只负责旧表引导，已展开的组件 API 保留作者维护的事件、插槽和行为说明。Image 的泛型类型使用代码格式，避免被 Markdown 解析为未闭合 Vue 标签。

修改前后编译结果对比：Date、DateRange、TimeRange、Form 的非自定义属性完全一致（共 810 项）；Time 的 88 项属性中仅 min-width 从错误折叠的 100% 恢复为变量表达式。比较时仅归一化私有变量的改名。主题冗余键删除不改变默认视觉值。

## 持续检查

组件文档生成器为 [component-css-docs.mjs](/Users/shuaimeng/github_web/design-ui/bin/component-css-docs.mjs)。从工作区运行：

```sh
node design-ui/bin/component-css-docs.mjs --write
node design-ui/bin/component-css-docs.mjs --check
```

两库的 check:style-vars、共享 check:token-reference 已接入文档漂移门禁。生成器拒绝编译错误和未审消费，重复生成无变更。API 翻译器保留由该生成器负责的英文变量块，不尝试重新翻译变量表。浏览器专项入口为 design-ui 的 check:component-css-docs:browser。

## 验证结果

| 验证 | 结果 |
| --- | --- |
| 两库 check:style-vars | 通过，50 个组件契约、1050 个受管组件默认值，393 页无漂移 |
| 三份全局变量目录 | 通过 |
| Token 放置及全量消费 | 通过 |
| 聚焦 Node 回归 | 21 项通过；最终格式化后的新增专项 7 项再次通过 |
| 文档结构与生成专项 | 29 项通过 |
| Cedar 受影响组件 | 25 文件、219 项通过 |
| Maple 受影响组件 | 177 文件、1453 项通过 |
| Cedar lint 与 Maple lint:check | 通过，两端 API 命名门禁通过 |
| 生成 Markdown | 393 页表格结构与单一章节检查通过 |
| Chromium 专项 | Time 120px/240px 覆盖、DateRange 选中颜色覆盖通过；1280px/375px 表格预览不撑宽页面，窄屏表格自身滚动 |

浏览器专项使用真实编译 CSS 夹具和生成 Markdown，不代表两套生产文档站或全部组件状态、Safari、Firefox、原生真机已验收。本次没有修改公开 TypeScript API，也未把此次验证等同于全库 quality 通过。

## 更广检查的剩余漂移

本次相关门禁通过，但更广检查仍有以下失败，保留为未解决项，不以更新旧证据或回退业务源码掩盖：

- 历史目录回归 48 项中 37 通过、11 失败：旧日期库存和分类 hash、年份范围选择器、已新增的 caret-color/focus 消费、Select 分类与分组选择器断言不再匹配当前源码。原始失败见 catalog-regressions.log。当前 Less 非自定义属性对比和旧扫描快照支持区分此次样式整理与这些历史断言。
- 文档结构/分组专项 33 项中 32 通过，Maple NoticeBar 的 pausable 示例缺少手机集合页登记；本次未改该集合页。
- 现有 API 翻译检查仍有 219 条未登记译文、40 页候选差异，涉及 Carousel、Form、Typography、Watermark 等已有行为说明。生成 CSS 块已独立保护，此数不包含本次新生成的变量表。未应用会覆盖现有英文内容的批量翻译。

因此，全库文档管线和更广历史验收门禁尚未全部通过；这些不是本次 393 页 CSS 变量生成门禁的豁免。

## 删除的无效声明

- `--mp-date-picker-datetime-popover-width`
- `--mp-date-picker-time-panel-min-width`
- `--mp-date-range-picker-time-group-gap`
- `--mp-date-range-picker-time-group-radius`
- `--mp-date-range-picker-time-selection-background`
- `--mp-date-range-picker-value-arrow-color`
- `--mp-date-range-picker-value-arrow-size`
- `--mp-date-range-picker-value-color`
- `--mp-date-range-picker-value-time-font-size`
- `--mp-date-range-picker-values-font-size`
- `--mp-date-range-picker-values-height`
- `--mp-form-label-padding-top`
- `--mp-time-range-picker-value-active-color`
- `--mp-time-range-picker-value-arrow-color`
- `--mp-time-range-picker-value-arrow-size`
- `--mp-time-range-picker-value-color`
- `--mp-time-range-picker-values-font-size`
- `--mp-time-range-picker-values-font-weight`
- `--mp-time-range-picker-values-height`

## 完整证据

- [逐族和逐页清单](audit.json)
- [当前编译库存](inventory.json)
- [验证汇总](validation.json)
- [实现编译对比](implementation-comparison.json)
- [浏览器结果](browser-verification.json)
- [初次扫描快照](initial-report.md)
