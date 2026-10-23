# 第十批：日期面板快捷选项与日历视口

日期：2026-10-12。范围：Cedar / Maple Date、DateRange、DatePicker、DateRangePicker。

## 实施

- 独立复制 panel-tools-props、use-date-panel-tools、DateShortcuts 与公共所有者接线，无跨库运行时、共享实例或 platform 配置。
- 两端支持 DateShortcut（label/value/format/disabled）、shortcutsPosition left/bottom/right、previewShortcut、pickerValue/defaultPickerValue。
- 悬停/聚焦跨月预览临时切换视口，离开后恢复；不写入模型、不发出选择或视口导航事件。
- 快捷项按需解析回调与输入格式，输出仍走顶层 valueFormat。非法、禁用、只读、越界或改变锁定范围端点的候选拒绝；确认流程复用普通日期选择。
- 视口与模型分离；默认视口仅初始化读取，优先已有选择。update:pickerValue / picker-value-change 仅请求导航，受控父级拒绝时保留原视口。select-shortcut 仅在接受快捷选择后通知。
- 字段转发上述事件，展示配置仍通过 datePickerProps/dateRangePickerProps 接入。
- Maple 年/月/日期时间日历导航按当前模型精度输出。滚轮/时钟不新增日历月份导航。
- 新增两端单日期/范围快捷项 Demo，Maple 中文/英文中间卡片与右侧集合使用相同源文件。
- 两端门禁扩展到 29 对独立源码/测试。调研和菜单元数据同步，仍保持 logicSame；没有把旧日历渲染器标为完全同源。

## 验证

- Cedar：原日期 DOM 回归及新控制器/所有者 55 项，独立 SSR 4 项，实际日历受控导航/跨月预览 2 项，共 61 项通过。
- Maple：日期族全量 13 文件 93 项通过，包含实际日历受控导航拒绝/接受测试；补充跨月预览/恢复断言后发现初始化顺序覆盖视口，改用 post 同步并复验。
- 两端源码类型检查、npm build:lib、发布声明消费者通过；新增 Shortcut、位置枚举、视口和快捷事件类型正反例。
- 公共类型出口审计、29 对独立复制门禁、调研/菜单元数据检查通过。
- Cedar scoped ESLint 通过；Maple 全量检查发现本轮断言与消费者文件的格式问题，修正后全量复验通过。
- Maple 988 份 Demo SFC 编译通过；Cedar 新 Demo script/template 编译通过。
- 发布样式依赖图通过：Cedar 96 入口/98 Less、Maple 91/93，无环或缺失依赖，基础样式和 Loading 仅一次。Token 参考 3 页匹配；未新增 CSS Token。
- 本轮修改路径 git diff --check 通过。全仓另有两份既有生成 Token 文档 EOF 空行提示，不改动无关内容。
- 旧 Maple 多选/范围测试依赖当前月份初始化，已按“优先已有选中值”调整；7 份快照更新反映面板外层布局/视口初始化变化，复跑全部通过。
- 未执行真实浏览器视觉/触屏验收，也未重跑整站生产文档构建；SFC 编译与 jsdom 测试不能代替它们。

## 下一批

今日高亮与选择当前日期是不同能力，不机械合并。继续评估 Cedar showNowBtn、Maple showCurrent、范围 exchangeTime、abbreviation/locale 以及周/季度展示差异。各端旧日历主体仍独立维护，普通能力尚未归零。

71 族状态仍为 55 same / 15 logicSame / 1 separate；数量不代表所有 API 和外观已经完全一致。

第十一批完成当前日期与范围策略，详见 [第十一批验证记录](./priority-batch-11-2026-10-12.md)。当前普通剩余优先项为日期标题/缩写/Locale 边界与嵌套展示选项精确化。

第十九批纠正本批“字段转发”覆盖范围：Cedar 当时已转发，Maple 本地 DateFieldContent 实际丢失三类面板事件。已以两端单值/范围完整事件链路和真实日历导航复现、修复并验证，详见 [第十九批](./priority-batch-19-2026-10-13.md)。本批原测试不能代表未覆盖的移动字段链路已通过。
