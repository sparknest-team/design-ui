# 第十五批：删除无效 PC 日期字段参数

## 完成

- 调用链审计确认 Cedar Date.pickerProps、DateRange.pickerProps/datePickerProps 不对应桌面渲染分支，删除其运行时 Props 与公开类型，不保留兼容别名。
- Cedar Date.datePickerProps / DateRange.dateRangePickerProps 保留为真实完整面板配置，timePickerProps 为两端都有的内嵌时间展示。
- Maple 真实滚轮与范围内部日历插件继续保留 DateWheelOptions/DateRangeCalendarOptions，增加端侧 Props 契约与发布类型正例，不向 PC 增加无效空接口。
- 两端共同字段参数映射以类型联合 narrowing 处理端侧差异，独立复制逻辑保持 37 对门禁。
- 发布消费者增加 Cedar 旧参数负例与 Maple 保留扩展正例。
- Cedar show-time/range 两个旧 Demo 的 timePickerProps.defaultValue 迁移为日期顶层 defaultValue；范围 Demo 改为 script setup，通过界面反馈事件值，去除 console.log。
- 两端文档、API 清单、调研和 Maple 菜单状态、Cedar OpenSpec 与 major changeset 同步。

## 验证

- 两端新端侧契约、字段合并与入口测试各 3 文件 9 项通过。
- Cedar 全日期 DOM/逻辑 18 文件 84 项断言通过、退出码 0；旧 Vitest 退出阶段出现 close timed out 与 fsevents 原生断言日志，未隐藏或跳过，SSR 独立进程复验。
- Cedar 独立 SSR 4 项通过，共 88 项断言；SSR 进程正常退出。
- Maple 全日期族 22 文件 126 项通过，无跳过断言或更新快照。
- 两端源码 typecheck、Cedar 受影响 ESLint、Maple 全库 lint:check 通过。
- 两端 build:lib 与发布消费者 typecheck:contracts 通过，包含旧参数反例和保留扩展正例。
- Maple 994 份 Demo SFC、Cedar 两份修改 Demo 编译通过。
- 两端公共导出审计无缺失，37 对日期复制门禁与 71 族调研/菜单验证通过。本批路径 git diff --check 通过。
- 发布样式图 Cedar 96 入口/98 Less、Maple 91/93 通过，无环/缺失或内嵌重复基础样式；源码/发布消费者 foundation 和 Loading 均只加载一次。本批不增加 CSS Token。
- 未做生产整站文档构建或真实浏览器视觉/触屏验收。

## 下一批

审计并修复 Cedar 日期初始化的多实例隔离。已定位 `_utils/date.ts.initializeDateLocale` 通过 dayjs.locale 注册/设置全局语言和 weekStart，被单值/范围渲染器 watchEffect 调用；多个不同周起始实例可能相互覆盖，而且 en-US 不直接对应 Dayjs 的 en 注册名。星期布局已直接按实例 dayStartOfWeek 计算，但周号/周判定仍使用 .week()，需要逐项验证，不能只删除初始化监听后声称修复。

继续保持双库独立源码、无共享运行时/实例，截止北京时间 2026-10-13 14:00，不提交、推送、发布。71 族状态数量不变，不宣称日期主体/外观全部同源。
