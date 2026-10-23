# Cedar / Maple Demo 复查 — 2026-10-21

本轮包含 188 个审查入口、538 个可选择场景；API 展示待补项 0 项。该数字表示展示证据完整度，不表示所有行为和取值组合均已人工验收。

本表逐页记录 API 展示证据及组合运行检查。interactive 表示可切换控件或插槽；authored 表示模板有明确绑定或脚本有方法调用；contract-inspector 表示方法参数预设、返回句柄、输出日志或 composable 回调专项；event-log 仅表示审查面板已订阅事件，不能替代事件行为验收。needs-scenario 表示本轮未找到可靠证据，需要继续核对，不能当作覆盖完成。

属性统计包含子组件和命令式配置表，尚未证明的项目保留在 coverage.json。词语命中不计为覆盖，回调、动态绑定和复杂插槽可能需要人工追踪，因此待核对数量不等于已确认的缺陷数量。

[逐项 API 与案例路径](./evidence/demo-recheck-2026-10-21/coverage.json) · [逐组件运行记录](./evidence/demo-recheck-2026-10-21/runtime.json)
[执行摘要](./evidence/demo-recheck-2026-10-21/results.json) · [Cedar 浏览器证据](./evidence/demo-recheck-2026-10-21/cedar-method-callback.png) · [Maple 浏览器证据](./evidence/demo-recheck-2026-10-21/maple-callback-slots.png)

运行检查会挂载真实组件，检查每个可操作字段的控件，组合两个属性，验证取消覆盖、重新挂载和重置；包含合适枚举或布尔项的案例另验证取值切换。对可见的目标实例核对实际 Props。JSDOM 不验证排版、手势、第三方 SDK 和浏览器原生交互；Cedar Form 与 Maple Textarea 另做浏览器检查。

运行命令：`node design-ui/bin/review-demos-check.mjs`、`node design-ui/bin/demo-api-coverage-check.mjs`；组合运行使用 `node design-ui/bin/review-demo-runtime-check.mjs` 分平台启动独立进程。

| 平台 / 组件 | API 项 | 可切换 | authored | 契约检查 | 事件日志 | 待核对 | 组合运行 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| cedar/affix | 10 | 7 | 3 | 0 | 0 | 0 | 1/1 passed |
| cedar/alert | 17 | 14 | 1 | 0 | 2 | 0 | 5/5 passed |
| cedar/anchor | 9 | 6 | 1 | 0 | 2 | 0 | 3/3 passed |
| cedar/auto-complete | 49 | 37 | 4 | 0 | 8 | 0 | 7/7 passed |
| cedar/avatar | 31 | 26 | 3 | 0 | 2 | 0 | 4/4 passed |
| cedar/back-top | 9 | 8 | 1 | 0 | 0 | 0 | 2/2 passed |
| cedar/badge | 18 | 17 | 1 | 0 | 0 | 0 | 1/1 passed |
| cedar/breadcrumb | 17 | 15 | 1 | 0 | 1 | 0 | 3/3 passed |
| cedar/button | 27 | 24 | 3 | 0 | 0 | 0 | 2/2 passed |
| cedar/calendar | 15 | 13 | 2 | 0 | 0 | 0 | 4/4 passed |
| cedar/card | 31 | 28 | 3 | 0 | 0 | 0 | 4/4 passed |
| cedar/carousel | 37 | 33 | 4 | 0 | 0 | 0 | 4/4 passed |
| cedar/cascader | 64 | 63 | 0 | 0 | 1 | 0 | 3/3 passed |
| cedar/checkbox | 50 | 42 | 5 | 0 | 3 | 0 | 7/7 passed |
| cedar/col | 12 | 10 | 1 | 0 | 1 | 0 | 2/2 passed |
| cedar/collapse | 24 | 18 | 3 | 2 | 1 | 0 | 3/3 passed |
| cedar/color | 19 | 19 | 0 | 0 | 0 | 0 | 1/1 passed |
| cedar/color-picker | 13 | 13 | 0 | 0 | 0 | 0 | 1/1 passed |
| cedar/config-provider | 11 | 10 | 0 | 0 | 1 | 0 | 1/1 passed |
| cedar/count-to | 11 | 9 | 1 | 0 | 1 | 0 | 3/3 passed |
| cedar/countdown | 9 | 7 | 1 | 0 | 1 | 0 | 2/2 passed |
| cedar/date | 47 | 35 | 6 | 0 | 6 | 0 | 2/2 passed |
| cedar/date-range | 47 | 35 | 6 | 0 | 6 | 0 | 4/4 passed |
| cedar/date/picker | 22 | 18 | 1 | 0 | 3 | 0 | 5/5 passed |
| cedar/descriptions | 21 | 19 | 2 | 0 | 0 | 0 | 3/3 passed |
| cedar/dialog | 72 | 63 | 3 | 0 | 6 | 0 | 5/5 passed |
| cedar/divider | 11 | 10 | 1 | 0 | 0 | 0 | 2/2 passed |
| cedar/drawer | 45 | 36 | 3 | 0 | 6 | 0 | 2/2 passed |
| cedar/dropdown-menu | 35 | 29 | 5 | 0 | 1 | 0 | 3/3 passed |
| cedar/ellipsis | 5 | 5 | 0 | 0 | 0 | 0 | 2/2 passed |
| cedar/empty | 10 | 8 | 1 | 0 | 1 | 0 | 3/3 passed |
| cedar/field-decorator | 20 | 20 | 0 | 0 | 0 | 0 | 1/1 passed |
| cedar/filter-form | 24 | 20 | 3 | 0 | 1 | 0 | 2/2 passed |
| cedar/form | 96 | 79 | 4 | 13 | 0 | 0 | 5/5 passed |
| cedar/grid | 9 | 3 | 6 | 0 | 0 | 0 | 2/2 passed |
| cedar/icon | 17 | 15 | 2 | 0 | 0 | 0 | 2/2 passed |
| cedar/image | 66 | 59 | 1 | 1 | 5 | 0 | 10/10 passed |
| cedar/infinite-scroll | 14 | 10 | 4 | 0 | 0 | 0 | 2/2 passed |
| cedar/input | 51 | 44 | 4 | 0 | 3 | 0 | 6/6 passed |
| cedar/input-number | 43 | 36 | 4 | 0 | 3 | 0 | 2/2 passed |
| cedar/input-tag | 43 | 36 | 0 | 0 | 7 | 0 | 1/1 passed |
| cedar/layout | 18 | 13 | 3 | 0 | 2 | 0 | 5/5 passed |
| cedar/link | 12 | 10 | 2 | 0 | 0 | 0 | 2/2 passed |
| cedar/list | 8 | 8 | 0 | 0 | 0 | 0 | 3/3 passed |
| cedar/loading | 10 | 8 | 2 | 0 | 0 | 0 | 2/2 passed |
| cedar/map | 21 | 15 | 3 | 0 | 3 | 0 | 1/1 passed |
| cedar/mention | 23 | 17 | 0 | 0 | 6 | 0 | 2/2 passed |
| cedar/message | 19 | 18 | 0 | 1 | 0 | 0 | 2/2 passed |
| cedar/nav-menu | 36 | 31 | 3 | 0 | 2 | 0 | 3/3 passed |
| cedar/notification | 38 | 37 | 0 | 1 | 0 | 0 | 2/2 passed |
| cedar/overflow-list | 5 | 4 | 0 | 0 | 1 | 0 | 1/1 passed |
| cedar/overlay | 16 | 8 | 2 | 0 | 6 | 0 | 1/1 passed |
| cedar/page-header | 13 | 11 | 2 | 0 | 0 | 0 | 2/2 passed |
| cedar/pagination | 33 | 29 | 2 | 0 | 2 | 0 | 5/5 passed |
| cedar/paper | 10 | 8 | 2 | 0 | 0 | 0 | 1/1 passed |
| cedar/people-select | 18 | 16 | 2 | 0 | 0 | 0 | 1/1 passed |
| cedar/popconfirm | 22 | 19 | 0 | 0 | 3 | 0 | 2/2 passed |
| cedar/popover | 45 | 45 | 0 | 0 | 0 | 0 | 1/1 passed |
| cedar/progress | 17 | 16 | 1 | 0 | 0 | 0 | 3/3 passed |
| cedar/progress-group | 23 | 23 | 0 | 0 | 0 | 0 | 2/2 passed |
| cedar/radio | 46 | 35 | 8 | 0 | 3 | 0 | 4/4 passed |
| cedar/rate | 28 | 25 | 1 | 0 | 2 | 0 | 3/3 passed |
| cedar/resize-box | 9 | 6 | 0 | 0 | 3 | 0 | 2/2 passed |
| cedar/result | 10 | 9 | 1 | 0 | 0 | 0 | 2/2 passed |
| cedar/ripple | 2 | 2 | 0 | 0 | 0 | 0 | 1/1 passed |
| cedar/row | 7 | 4 | 2 | 0 | 1 | 0 | 1/1 passed |
| cedar/scheduler | 88 | 67 | 18 | 0 | 3 | 0 | 8/8 passed |
| cedar/scrollbar | 10 | 9 | 1 | 0 | 0 | 0 | 1/1 passed |
| cedar/search | 65 | 51 | 8 | 4 | 2 | 0 | 4/4 passed |
| cedar/segmented | 11 | 9 | 2 | 0 | 0 | 0 | 1/1 passed |
| cedar/select | 47 | 47 | 0 | 0 | 0 | 0 | 3/3 passed |
| cedar/skeleton | 20 | 19 | 1 | 0 | 0 | 0 | 5/5 passed |
| cedar/slider | 33 | 24 | 6 | 0 | 3 | 0 | 3/3 passed |
| cedar/space | 8 | 6 | 2 | 0 | 0 | 0 | 2/2 passed |
| cedar/split | 14 | 11 | 0 | 0 | 3 | 0 | 1/1 passed |
| cedar/split-button | 30 | 23 | 6 | 0 | 1 | 0 | 4/4 passed |
| cedar/statistic | 21 | 19 | 2 | 0 | 0 | 0 | 3/3 passed |
| cedar/steps | 23 | 19 | 3 | 0 | 1 | 0 | 2/2 passed |
| cedar/style-provider | 2 | 2 | 0 | 0 | 0 | 0 | 1/1 passed |
| cedar/switch | 32 | 24 | 8 | 0 | 0 | 0 | 5/5 passed |
| cedar/table | 196 | 161 | 10 | 6 | 19 | 0 | 11/11 passed |
| cedar/table-column-manager | 19 | 14 | 4 | 0 | 1 | 0 | 1/1 passed |
| cedar/tabs | 48 | 43 | 3 | 0 | 2 | 0 | 5/5 passed |
| cedar/tag | 21 | 16 | 2 | 0 | 3 | 0 | 1/1 passed |
| cedar/textarea | 43 | 37 | 5 | 0 | 1 | 0 | 4/4 passed |
| cedar/themes | 0 | 0 | 0 | 0 | 0 | 0 | 参考页 |
| cedar/time | 33 | 31 | 2 | 0 | 0 | 0 | 2/2 passed |
| cedar/time-range | 35 | 34 | 1 | 0 | 0 | 0 | 3/3 passed |
| cedar/time/picker | 16 | 15 | 1 | 0 | 0 | 0 | 2/2 passed |
| cedar/timeline | 14 | 12 | 2 | 0 | 0 | 0 | 6/6 passed |
| cedar/tooltip | 48 | 48 | 0 | 0 | 0 | 0 | 2/2 passed |
| cedar/transfer | 45 | 41 | 1 | 0 | 3 | 0 | 5/5 passed |
| cedar/tree | 83 | 74 | 5 | 0 | 4 | 0 | 8/8 passed |
| cedar/tree-select | 41 | 40 | 0 | 0 | 1 | 0 | 1/1 passed |
| cedar/trigger | 53 | 44 | 2 | 0 | 7 | 0 | 2/2 passed |
| cedar/typography | 104 | 86 | 0 | 0 | 18 | 0 | 5/5 passed |
| cedar/upload | 46 | 46 | 0 | 0 | 0 | 0 | 5/5 passed |
| cedar/verification-code | 37 | 28 | 3 | 0 | 6 | 0 | 3/3 passed |
| cedar/watermark | 25 | 22 | 3 | 0 | 0 | 0 | 1/1 passed |
| maple/action-sheet | 49 | 41 | 1 | 1 | 6 | 0 | 2/2 passed |
| maple/affix | 10 | 7 | 3 | 0 | 0 | 0 | 1/1 passed |
| maple/alert | 17 | 15 | 2 | 0 | 0 | 0 | 4/4 passed |
| maple/atomic-css | 0 | 0 | 0 | 0 | 0 | 0 | 参考页 |
| maple/atomic-usage | 0 | 0 | 0 | 0 | 0 | 0 | 参考页 |
| maple/auto-complete | 49 | 37 | 4 | 0 | 8 | 0 | 7/7 passed |
| maple/avatar | 31 | 26 | 3 | 0 | 2 | 0 | 4/4 passed |
| maple/back-top | 9 | 8 | 1 | 0 | 0 | 0 | 2/2 passed |
| maple/badge | 18 | 17 | 1 | 0 | 0 | 0 | 1/1 passed |
| maple/breadcrumb | 16 | 11 | 4 | 0 | 1 | 0 | 5/5 passed |
| maple/button | 27 | 24 | 3 | 0 | 0 | 0 | 2/2 passed |
| maple/card | 31 | 28 | 3 | 0 | 0 | 0 | 4/4 passed |
| maple/carousel | 37 | 33 | 4 | 0 | 0 | 0 | 4/4 passed |
| maple/cascader | 46 | 46 | 0 | 0 | 0 | 0 | 1/1 passed |
| maple/cell | 15 | 13 | 2 | 0 | 0 | 0 | 2/2 passed |
| maple/checkbox | 53 | 45 | 5 | 0 | 3 | 0 | 5/5 passed |
| maple/code | 11 | 9 | 1 | 1 | 0 | 0 | 2/2 passed |
| maple/col | 12 | 10 | 1 | 0 | 1 | 0 | 1/1 passed |
| maple/collapse | 24 | 18 | 3 | 2 | 1 | 0 | 3/3 passed |
| maple/color | 0 | 0 | 0 | 0 | 0 | 0 | 参考页 |
| maple/count-to | 11 | 9 | 1 | 0 | 1 | 0 | 3/3 passed |
| maple/countdown | 9 | 7 | 1 | 0 | 1 | 0 | 2/2 passed |
| maple/counter | 34 | 30 | 0 | 0 | 4 | 0 | 1/1 passed |
| maple/date | 89 | 76 | 2 | 0 | 11 | 0 | 6/6 passed |
| maple/date-range | 72 | 60 | 2 | 0 | 10 | 0 | 5/5 passed |
| maple/dialog | 63 | 53 | 6 | 0 | 4 | 0 | 5/5 passed |
| maple/divider | 11 | 8 | 3 | 0 | 0 | 0 | 2/2 passed |
| maple/drag | 10 | 8 | 1 | 0 | 1 | 0 | 1/1 passed |
| maple/dropdown-menu | 49 | 37 | 5 | 0 | 7 | 0 | 4/4 passed |
| maple/ellipsis | 5 | 5 | 0 | 0 | 0 | 0 | 1/1 passed |
| maple/empty | 10 | 8 | 1 | 0 | 1 | 0 | 4/4 passed |
| maple/fab | 31 | 25 | 1 | 0 | 5 | 0 | 3/3 passed |
| maple/field-decorator | 20 | 20 | 0 | 0 | 0 | 0 | 1/1 passed |
| maple/floating-panel | 9 | 7 | 1 | 0 | 1 | 0 | 1/1 passed |
| maple/form | 68 | 61 | 6 | 0 | 1 | 0 | 5/5 passed |
| maple/form-details | 3 | 3 | 0 | 0 | 0 | 0 | 1/1 passed |
| maple/grid | 9 | 3 | 6 | 0 | 0 | 0 | 2/2 passed |
| maple/highlighter-provider | 4 | 2 | 2 | 0 | 0 | 0 | 1/1 passed |
| maple/hover | 4 | 4 | 0 | 0 | 0 | 0 | 1/1 passed |
| maple/icon | 12 | 11 | 1 | 0 | 0 | 0 | 1/1 passed |
| maple/image | 98 | 83 | 3 | 1 | 11 | 0 | 9/9 passed |
| maple/index-bar | 16 | 11 | 3 | 1 | 1 | 0 | 2/2 passed |
| maple/infinite-scroll | 14 | 10 | 4 | 0 | 0 | 0 | 3/3 passed |
| maple/input | 43 | 36 | 3 | 0 | 4 | 0 | 5/5 passed |
| maple/input-number | 43 | 36 | 4 | 0 | 3 | 0 | 2/2 passed |
| maple/lazy | 10 | 10 | 0 | 0 | 0 | 0 | 1/1 passed |
| maple/link | 12 | 10 | 2 | 0 | 0 | 0 | 2/2 passed |
| maple/list | 8 | 8 | 0 | 0 | 0 | 0 | 3/3 passed |
| maple/loading | 10 | 9 | 1 | 0 | 0 | 0 | 1/1 passed |
| maple/loading-bar | 17 | 17 | 0 | 0 | 0 | 0 | 2/2 passed |
| maple/locale | 4 | 3 | 1 | 0 | 0 | 0 | 参考页 |
| maple/locale-provider | 4 | 3 | 1 | 0 | 0 | 0 | 1/1 passed |
| maple/message | 19 | 18 | 0 | 1 | 0 | 0 | 2/2 passed |
| maple/notice-bar | 14 | 12 | 0 | 0 | 2 | 0 | 1/1 passed |
| maple/number-keyboard | 26 | 18 | 0 | 0 | 8 | 0 | 1/1 passed |
| maple/overlay | 16 | 8 | 3 | 0 | 5 | 0 | 1/1 passed |
| maple/page-header | 13 | 11 | 2 | 0 | 0 | 0 | 2/2 passed |
| maple/pagination | 33 | 29 | 2 | 0 | 2 | 0 | 5/5 passed |
| maple/palette | 0 | 0 | 0 | 0 | 0 | 0 | 参考页 |
| maple/paper | 10 | 8 | 2 | 0 | 0 | 0 | 1/1 passed |
| maple/picker | 58 | 54 | 1 | 0 | 3 | 0 | 2/2 passed |
| maple/popover | 55 | 47 | 6 | 0 | 2 | 0 | 4/4 passed |
| maple/popup | 18 | 18 | 0 | 0 | 0 | 0 | 2/2 passed |
| maple/progress | 17 | 15 | 2 | 0 | 0 | 0 | 3/3 passed |
| maple/progress-group | 17 | 17 | 0 | 0 | 0 | 0 | 2/2 passed |
| maple/pull-refresh | 12 | 9 | 3 | 0 | 0 | 0 | 1/1 passed |
| maple/radio | 52 | 39 | 9 | 0 | 4 | 0 | 6/6 passed |
| maple/rate | 28 | 25 | 2 | 0 | 1 | 0 | 3/3 passed |
| maple/result | 10 | 10 | 0 | 0 | 0 | 0 | 1/1 passed |
| maple/ripple | 2 | 2 | 0 | 0 | 0 | 0 | 1/1 passed |
| maple/row | 7 | 4 | 2 | 0 | 1 | 0 | 1/1 passed |
| maple/search | 65 | 51 | 5 | 4 | 5 | 0 | 3/3 passed |
| maple/select | 47 | 47 | 0 | 0 | 0 | 0 | 3/3 passed |
| maple/signature | 8 | 5 | 0 | 0 | 3 | 0 | 1/1 passed |
| maple/skeleton | 14 | 13 | 1 | 0 | 0 | 0 | 3/3 passed |
| maple/slider | 33 | 24 | 7 | 0 | 2 | 0 | 3/3 passed |
| maple/space | 8 | 6 | 2 | 0 | 0 | 0 | 1/1 passed |
| maple/split-button | 30 | 23 | 6 | 0 | 1 | 0 | 4/4 passed |
| maple/statistic | 21 | 19 | 2 | 0 | 0 | 0 | 3/3 passed |
| maple/steps | 23 | 19 | 3 | 0 | 1 | 0 | 2/2 passed |
| maple/style | 0 | 0 | 0 | 0 | 0 | 0 | 参考页 |
| maple/style-provider | 2 | 2 | 0 | 0 | 0 | 0 | 1/1 passed |
| maple/swipe-cell | 14 | 10 | 1 | 0 | 3 | 0 | 3/3 passed |
| maple/switch | 32 | 24 | 8 | 0 | 0 | 0 | 5/5 passed |
| maple/tab-bar | 23 | 19 | 4 | 0 | 0 | 0 | 5/5 passed |
| maple/table | 5 | 4 | 1 | 0 | 0 | 0 | 2/2 passed |
| maple/tabs | 48 | 43 | 3 | 0 | 2 | 0 | 6/6 passed |
| maple/tag | 21 | 16 | 4 | 0 | 1 | 0 | 2/2 passed |
| maple/textarea | 43 | 37 | 3 | 0 | 3 | 0 | 1/1 passed |
| maple/themes | 0 | 0 | 0 | 0 | 0 | 0 | 参考页 |
| maple/time | 60 | 51 | 7 | 0 | 2 | 0 | 5/5 passed |
| maple/time-range | 62 | 53 | 7 | 0 | 2 | 0 | 6/6 passed |
| maple/tooltip | 57 | 49 | 5 | 0 | 3 | 0 | 5/5 passed |
| maple/trigger | 43 | 43 | 0 | 0 | 0 | 0 | 2/2 passed |
| maple/typography | 0 | 0 | 0 | 0 | 0 | 0 | 参考页 |
| maple/upload | 46 | 46 | 0 | 0 | 0 | 0 | 6/6 passed |
| maple/utilities | 0 | 0 | 0 | 0 | 0 | 0 | 参考页 |
| maple/verification-code | 37 | 28 | 2 | 0 | 7 | 0 | 2/2 passed |
| maple/watermark | 25 | 22 | 3 | 0 | 0 | 0 | 3/3 passed |

地图仅验证缺少 SDK 时的降级外壳与属性切换，真实地图加载、定位和逆地理解析仍待具备 SDK 的环境验收。案例中的 API 控制项、插槽操作与编辑宿主均使用各自组件库控件；Scheduler 的 capture 事件容器只负责事件观察。
