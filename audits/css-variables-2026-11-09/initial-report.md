# Cedar 和 Maple Vue CSS Variables 覆盖审计

截至 2026-11-09，两库尚未做到每个组件页都有完整的 CSS Variables 说明。优先补齐已经存在的公共变量文档，再按外观定制需求补公共变量；无独立外观的 Provider、布局组件、组合组件应说明定制入口，不必为了统一格式创建空变量。

## 扫描范围与口径

仅包含 Cedar 与 Maple 的 Vue 源码，不含 React 和第三方参考库。枚举全部 src 中组件及功能文档（含子页和工具指南），并复用现有 Less 编译、运行时引用与消费链库存。中英文页分别核对；子组件可能与父组件共用文档和变量，统计采用顶层组件族，不将它们假装成各自独立 Token 契约。

| 检查项 | Cedar | Maple |
| --- | ---: | ---: |
| src 文档页，含工具指南 | 218 | 203 |
| 有标准 CSS Variables 章节 | 110 | 153 |
| 缺标准章节 | 108 | 50 |
| 有公共 Token 的顶层族 | 84 | 82 |
| 上述族的公共变量名 | 2623 | 1892 |

章节缺失不等于完全没有说明，例如 Cedar Ripple 在“样式”章节列出变量。公共变量计数沿用现有库存的公开性判定；私有目录及 internal 前缀不计入公共 API。

## 已存在变量但缺标准章节

### Cedar

`anchor`、`breadcrumb`、`calendar`、`color-picker`、`date`、`descriptions`、`form`、`hover`、`input`、`layout`、`loading`、`map`、`people-select`、`popconfirm`、`radio`、`resize-box`、`result`、`ripple`、`scrollbar`、`search`、`segmented`、`split`、`steps`、`table`、`time`、`timeline`、`transfer`、`tree`、`tree-select`、`typography`。

### Maple

`form-details`、`notice-bar`、`number-keyboard`、`people-select`、`search`、`swipe-cell`。

## 文档与源码漂移

三份独立比较的变量总表均与本次编译结果不一致。下表中的新增和移除只比较完整变量名；相同名称的值、条件或消费说明也可能变化。

| 总表 | 当前源码有而表中没有 | 表中有而当前库存没有 |
| --- | ---: | ---: |
| [cedar-design-web/packages/ui/docs/guide/design-token-reference.md](/Users/shuaimeng/github_web/cedar-design-web/packages/ui/docs/guide/design-token-reference.md) | 11 | 0 |
| [maple-design-mobile/packages/ui/docs/designTokenReference.zh-CN.md](/Users/shuaimeng/github_web/maple-design-mobile/packages/ui/docs/designTokenReference.zh-CN.md) | 28 | 1 |
| [maple-design-mobile/packages/ui/docs/designTokenReference.en-US.md](/Users/shuaimeng/github_web/maple-design-mobile/packages/ui/docs/designTokenReference.en-US.md) | 28 | 1 |

组件页还存在部分列举：例如 Maple Link 的章节没有列全声明；Switch 使用缩写和后缀表，不能将字面缺名数直接当成缺陷数。逐族完整变量名及候选缺口保存在 audit.json。建议表格生成完整名称、默认值、职责及状态边界，组件页提供针对本组件的覆盖示例。

## 公开覆盖边界

| 情况 | 建议处理 |
| --- | --- |
| 已有公开变量、页面没有列出 | 补文档，不重复新增另一套变量 |
| 颜色、字号、圆角、间距、尺寸、阴影、动效有合理的独立定制需求 | 在实际消费处提供组件级变量，默认复用 system，并验证覆盖与显式 props 的优先级 |
| Mention 等复用 Input 或 Textarea 外观 | 列明被复用的公开变量和影响范围；测量镜像应继续跟随输入控件 |
| OverflowList、TableColumnManager 等以结构布局为主 | 说明 class/style、props 或子组件定制入口；定位与算法中间量保留实现细节 |
| Provider、指令、主题工具及无独立 DOM 的功能 | 声明“无独立外观变量”及实际配置入口，不创建无消费者 Token |
| 私有子结构和内部计算变量 | 不因存在 CSS 自定义属性就承诺为公共 API |

Maple 的 `_components/picker-field/style/temporal-panel.less` 在 token.less 以外声明 15 个无 internal 前缀的根变量，现有放置门禁失败。应先按职责分类：日期与时间面板稳定的外观能力通过公开 Date/Time 组件契约提供；纯私有结构变量采用内部约定，避免直接把整个私有面板实现公开。这 15 项不在下述 4685 项 token.less 声明库存内。

公开变量覆盖放在实际组件根或浮层真实挂载祖先；Teleport 到 body 后不会继承调用位置的局部变量。每个组件页应交代宿主、相关状态、props 优先级及共享子组件的作用域。

## 当前检查结果

- token.less 库存：177 个文件，4685 项按文件去重声明，Less 编译错误 0。
- 消费扫描：23 项待人工确认，其中公开 22 项、内部 1 项；不能直接当成无效或可删除变量。
- 三份公共总表检查：均存在漂移。
- Token 放置门禁：失败，见 temporal-panel 的 15 项声明。
- 两库共享变量契约：失败，首先报告 Collapse 新增 focus-color、focus-offset、focus-width 与登记不一致。

这些结果属于源码及编译检查，不代表全部视觉状态已通过浏览器覆盖验收。本轮仅增加审计文件，没有修改组件实现或既有文档。

## 逐族完整清单

“中文完整名称未出现”是检索候选数，已合并该族全部中文子页；后缀表、简写和复用文档需人工解释，不能直接视为待补变量数量。无公共变量的族包含指南和非视觉功能。

| 平台 | 顶层族 | 公共变量数 | 中文页数 | 缺标准章节页数 | 中文完整名称未出现 |
| --- | --- | ---: | ---: | ---: | ---: |
| Cedar | affix | 0 | 1 | 1 | 0 |
| Cedar | alert | 82 | 1 | 0 | 0 |
| Cedar | anchor | 16 | 1 | 1 | 16 |
| Cedar | auto-complete | 18 | 1 | 0 | 0 |
| Cedar | avatar | 32 | 1 | 0 | 0 |
| Cedar | back-top | 13 | 1 | 0 | 0 |
| Cedar | badge | 78 | 1 | 0 | 0 |
| Cedar | breadcrumb | 20 | 1 | 1 | 20 |
| Cedar | button | 58 | 1 | 0 | 0 |
| Cedar | calendar | 84 | 1 | 1 | 84 |
| Cedar | card | 48 | 1 | 0 | 0 |
| Cedar | carousel | 26 | 1 | 0 | 0 |
| Cedar | cascader | 29 | 1 | 0 | 27 |
| Cedar | checkbox | 14 | 1 | 0 | 1 |
| Cedar | col | 0 | 1 | 1 | 0 |
| Cedar | collapse | 34 | 1 | 0 | 23 |
| Cedar | color | 0 | 1 | 1 | 0 |
| Cedar | color-picker | 50 | 1 | 1 | 50 |
| Cedar | config-provider | 0 | 1 | 1 | 0 |
| Cedar | count-to | 2 | 1 | 0 | 0 |
| Cedar | countdown | 2 | 1 | 0 | 0 |
| Cedar | date | 99 | 2 | 2 | 98 |
| Cedar | date-range | 0 | 2 | 2 | 0 |
| Cedar | descriptions | 41 | 1 | 1 | 41 |
| Cedar | dialog | 38 | 1 | 0 | 0 |
| Cedar | divider | 25 | 1 | 0 | 0 |
| Cedar | drawer | 19 | 1 | 0 | 0 |
| Cedar | ellipsis | 3 | 1 | 0 | 0 |
| Cedar | empty | 12 | 1 | 0 | 4 |
| Cedar | field-decorator | 56 | 1 | 0 | 51 |
| Cedar | filter-form | 13 | 1 | 0 | 0 |
| Cedar | form | 77 | 1 | 1 | 74 |
| Cedar | grid | 0 | 1 | 1 | 0 |
| Cedar | hover | 3 | 1 | 1 | 3 |
| Cedar | icon | 2 | 1 | 0 | 1 |
| Cedar | image | 64 | 1 | 0 | 63 |
| Cedar | infinite-scroll | 6 | 1 | 0 | 0 |
| Cedar | input | 12 | 1 | 1 | 11 |
| Cedar | input-number | 20 | 1 | 0 | 0 |
| Cedar | input-tag | 27 | 1 | 0 | 0 |
| Cedar | layout | 10 | 1 | 1 | 10 |
| Cedar | link | 45 | 1 | 0 | 35 |
| Cedar | list | 34 | 1 | 0 | 0 |
| Cedar | loading | 8 | 1 | 1 | 6 |
| Cedar | map | 35 | 1 | 1 | 35 |
| Cedar | mention | 0 | 1 | 1 | 0 |
| Cedar | menu | 26 | 1 | 0 | 24 |
| Cedar | message | 114 | 1 | 0 | 0 |
| Cedar | nav-menu | 32 | 1 | 0 | 0 |
| Cedar | notification | 58 | 1 | 0 | 0 |
| Cedar | overflow-list | 0 | 1 | 1 | 0 |
| Cedar | overlay | 3 | 1 | 0 | 0 |
| Cedar | page-header | 13 | 1 | 0 | 0 |
| Cedar | pagination | 25 | 1 | 0 | 0 |
| Cedar | paper | 5 | 1 | 0 | 0 |
| Cedar | people-select | 3 | 1 | 1 | 3 |
| Cedar | popconfirm | 20 | 1 | 1 | 20 |
| Cedar | popover | 16 | 1 | 0 | 0 |
| Cedar | progress | 16 | 1 | 0 | 0 |
| Cedar | progress-group | 24 | 1 | 0 | 0 |
| Cedar | radio | 12 | 1 | 1 | 12 |
| Cedar | rate | 15 | 1 | 0 | 0 |
| Cedar | resize-box | 3 | 1 | 1 | 3 |
| Cedar | result | 26 | 1 | 1 | 26 |
| Cedar | ripple | 4 | 1 | 1 | 0 |
| Cedar | row | 0 | 1 | 1 | 0 |
| Cedar | scheduler | 59 | 1 | 0 | 40 |
| Cedar | scrollbar | 8 | 1 | 1 | 7 |
| Cedar | search | 25 | 1 | 1 | 25 |
| Cedar | segmented | 28 | 1 | 1 | 28 |
| Cedar | select | 29 | 1 | 0 | 26 |
| Cedar | skeleton | 22 | 1 | 0 | 0 |
| Cedar | slider | 17 | 1 | 0 | 0 |
| Cedar | space | 10 | 1 | 0 | 0 |
| Cedar | split | 4 | 1 | 1 | 3 |
| Cedar | split-button | 0 | 1 | 1 | 0 |
| Cedar | statistic | 16 | 1 | 0 | 0 |
| Cedar | steps | 115 | 1 | 1 | 115 |
| Cedar | style | 0 | 7 | 7 | 0 |
| Cedar | style-provider | 0 | 1 | 1 | 0 |
| Cedar | switch | 34 | 1 | 0 | 24 |
| Cedar | table | 127 | 1 | 1 | 126 |
| Cedar | table-column-manager | 0 | 1 | 1 | 0 |
| Cedar | tabs | 40 | 1 | 0 | 0 |
| Cedar | tag | 130 | 1 | 0 | 0 |
| Cedar | textarea | 11 | 1 | 0 | 0 |
| Cedar | themes | 0 | 1 | 0 | 0 |
| Cedar | time | 27 | 2 | 2 | 27 |
| Cedar | time-range | 0 | 2 | 2 | 0 |
| Cedar | timeline | 24 | 1 | 1 | 24 |
| Cedar | tooltip | 23 | 1 | 0 | 0 |
| Cedar | transfer | 58 | 1 | 1 | 58 |
| Cedar | tree | 53 | 1 | 1 | 48 |
| Cedar | tree-select | 6 | 1 | 1 | 6 |
| Cedar | trigger | 5 | 1 | 0 | 0 |
| Cedar | typography | 52 | 1 | 1 | 50 |
| Cedar | upload | 25 | 1 | 0 | 0 |
| Cedar | verification-code | 4 | 1 | 0 | 0 |
| Cedar | watermark | 1 | 1 | 0 | 0 |
| Maple | action-sheet | 12 | 1 | 0 | 0 |
| Maple | affix | 0 | 1 | 1 | 0 |
| Maple | alert | 82 | 1 | 0 | 0 |
| Maple | atomic-css | 0 | 1 | 1 | 0 |
| Maple | atomic-usage | 0 | 1 | 1 | 0 |
| Maple | auto-complete | 18 | 1 | 0 | 0 |
| Maple | avatar | 32 | 1 | 0 | 0 |
| Maple | back-top | 13 | 1 | 0 | 0 |
| Maple | badge | 78 | 1 | 0 | 0 |
| Maple | breadcrumb | 24 | 1 | 0 | 19 |
| Maple | button | 58 | 1 | 0 | 0 |
| Maple | card | 48 | 1 | 0 | 0 |
| Maple | carousel | 26 | 1 | 0 | 0 |
| Maple | cascader | 29 | 1 | 0 | 0 |
| Maple | cell | 12 | 1 | 0 | 0 |
| Maple | checkbox | 14 | 1 | 0 | 1 |
| Maple | code | 2 | 1 | 0 | 0 |
| Maple | col | 0 | 1 | 1 | 0 |
| Maple | collapse | 34 | 1 | 0 | 23 |
| Maple | color | 0 | 1 | 1 | 0 |
| Maple | count-to | 2 | 1 | 0 | 0 |
| Maple | countdown | 2 | 1 | 0 | 0 |
| Maple | date | 76 | 1 | 0 | 23 |
| Maple | date-range | 25 | 1 | 0 | 4 |
| Maple | dialog | 38 | 1 | 0 | 0 |
| Maple | divider | 25 | 1 | 0 | 0 |
| Maple | drag | 0 | 1 | 1 | 0 |
| Maple | ellipsis | 3 | 1 | 0 | 0 |
| Maple | empty | 12 | 1 | 0 | 0 |
| Maple | fab | 13 | 1 | 0 | 0 |
| Maple | field-decorator | 54 | 2 | 0 | 49 |
| Maple | floating-panel | 10 | 1 | 0 | 0 |
| Maple | form | 17 | 1 | 0 | 11 |
| Maple | form-details | 5 | 1 | 1 | 5 |
| Maple | grid | 0 | 1 | 1 | 0 |
| Maple | highlighter-provider | 0 | 1 | 1 | 0 |
| Maple | hover | 3 | 1 | 0 | 0 |
| Maple | icon | 2 | 1 | 0 | 0 |
| Maple | image | 8 | 1 | 0 | 8 |
| Maple | index-bar | 10 | 1 | 0 | 0 |
| Maple | infinite-scroll | 6 | 1 | 0 | 0 |
| Maple | input | 12 | 1 | 0 | 0 |
| Maple | input-number | 20 | 1 | 0 | 0 |
| Maple | lazy | 0 | 1 | 1 | 0 |
| Maple | link | 55 | 1 | 0 | 32 |
| Maple | list | 34 | 1 | 0 | 0 |
| Maple | loading | 7 | 1 | 0 | 1 |
| Maple | loading-bar | 5 | 1 | 0 | 0 |
| Maple | locale | 0 | 1 | 1 | 0 |
| Maple | locale-provider | 0 | 1 | 1 | 0 |
| Maple | menu | 32 | 1 | 0 | 0 |
| Maple | message | 111 | 1 | 0 | 0 |
| Maple | nav-menu | 16 | 1 | 0 | 0 |
| Maple | notice-bar | 16 | 1 | 1 | 12 |
| Maple | number-keyboard | 15 | 1 | 1 | 15 |
| Maple | overlay | 3 | 1 | 0 | 0 |
| Maple | page-header | 13 | 1 | 0 | 0 |
| Maple | pagination | 25 | 1 | 0 | 0 |
| Maple | palette | 0 | 1 | 1 | 0 |
| Maple | paper | 5 | 1 | 0 | 0 |
| Maple | people-select | 3 | 1 | 1 | 3 |
| Maple | picker | 18 | 1 | 0 | 1 |
| Maple | popover | 16 | 1 | 0 | 0 |
| Maple | popup | 5 | 1 | 0 | 0 |
| Maple | progress | 16 | 1 | 0 | 0 |
| Maple | progress-group | 24 | 1 | 0 | 0 |
| Maple | pull-refresh | 5 | 1 | 0 | 0 |
| Maple | radio | 12 | 1 | 0 | 0 |
| Maple | rate | 15 | 1 | 0 | 0 |
| Maple | result | 26 | 1 | 0 | 0 |
| Maple | ripple | 4 | 1 | 0 | 0 |
| Maple | row | 0 | 1 | 1 | 0 |
| Maple | safe-area | 4 | 1 | 0 | 0 |
| Maple | search | 25 | 1 | 1 | 25 |
| Maple | select | 29 | 1 | 0 | 0 |
| Maple | signature | 4 | 1 | 0 | 0 |
| Maple | skeleton | 22 | 1 | 0 | 0 |
| Maple | slider | 17 | 1 | 0 | 0 |
| Maple | space | 10 | 1 | 0 | 0 |
| Maple | split-button | 0 | 1 | 1 | 0 |
| Maple | statistic | 16 | 1 | 0 | 0 |
| Maple | steps | 115 | 1 | 0 | 0 |
| Maple | style | 0 | 1 | 1 | 0 |
| Maple | style-provider | 0 | 1 | 1 | 0 |
| Maple | swipe-cell | 2 | 1 | 1 | 2 |
| Maple | switch | 34 | 1 | 0 | 24 |
| Maple | tab-bar | 22 | 1 | 0 | 0 |
| Maple | table | 15 | 1 | 0 | 0 |
| Maple | tabs | 40 | 1 | 0 | 0 |
| Maple | tag | 130 | 1 | 0 | 0 |
| Maple | textarea | 11 | 1 | 0 | 0 |
| Maple | themes | 0 | 1 | 1 | 0 |
| Maple | time | 17 | 1 | 0 | 16 |
| Maple | time-range | 15 | 1 | 0 | 0 |
| Maple | tooltip | 23 | 1 | 0 | 0 |
| Maple | trigger | 5 | 1 | 0 | 0 |
| Maple | typography | 0 | 1 | 1 | 0 |
| Maple | upload | 25 | 1 | 0 | 0 |
| Maple | utilities | 0 | 1 | 1 | 0 |
| Maple | verification-code | 4 | 1 | 0 | 0 |
| Maple | watermark | 1 | 1 | 0 | 0 |
