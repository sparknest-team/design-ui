# 第十四批：日期内嵌时间和滚轮展示

## 完成

- 两端独立复制 DateTimePickerOptions 与 dateTimePickerOptions 白名单：use12Hours、step、hideDisabledOptions、class/style。格式、模型、约束、确认、监听、布局不接受嵌套接管。
- Date/DateRange/DatePicker/DateRangePicker 时间选项使用精确类型，发布入口与组件入口导出 DateTimePickerOptions。step 为展示采样，不自动修正外部日期值。
- Cedar 内嵌时间列 format 服从日期根 useSeconds，修正分钟精度下仍可能出现秒列的情况。公共日期模型/校验/确认协议不变。
- Maple DateWheelOptions 白名单允许 optionHeight、optionCount、class/style，补齐单值日期和时间滚轮 pickerProps 转发；范围滚轮同样不能覆盖内部列、模型、字段映射、工具条、弹层或监听。
- Maple calendarClock 的单值/范围时间分支明确 presentation=clock，修复沿用 TimePicker 默认 picker 的问题。
- 日期时间展示类型/筛选函数与测试分别复制，两库独立源码，无共享运行时或 platform 配置。日期复制门禁 37 对。
- 增加两端时间参数过滤测试、Cedar 实际时间列精度/规则测试、Maple 单值/范围实际时钟及滚轮响应式测试。公开类型消费者补新类型正例、嵌套格式/约束/列/弹层错误反例。
- 中英文 Demo、右侧展示集合、文档、API 清单、调研及菜单状态、OpenSpec 与 major changeset 同步；不保留旧 API 兼容。

## 验证

- Cedar 日期族 DOM/逻辑 17 文件 83 项，独立 SSR 4 项，共 87 项通过。
- Maple 日期族 21 文件 125 项通过，无跳过断言或更新快照。
- 两端源码 typecheck、Cedar 受影响 ESLint 通过。Maple 全库 lint:check 初次因新测试一处缩进失败，修正后复验通过。
- Maple 994 份 Demo SFC 检查及 Cedar 新 Demo script/template 编译通过。
- 两端 API 导出审计无缺失，37 对复制门禁、71 族调研/菜单元数据检查通过。
- 两端 build:lib 与发布消费者 typecheck:contracts 通过，新类型和错误嵌套控制参数正反例验证通过。
- 发布样式图 Cedar 96 入口/98 Less、Maple 91/93 验证通过，无循环/缺失或内嵌重复基础样式；源码和发布消费者 foundation / Loading 各只加载一次。本批不增加 CSS Token。
- 生产整站文档构建与浏览器视觉/触屏验收未执行。
- 本批路径 git diff --check 验证，其他工作中的更改保留。

## 后续与截止安排

无效 PC 字段参数已在[第十五批](./priority-batch-15-2026-10-13.md)删除，下一批进入日期初始化多实例隔离。

用户明确授权临时自动续跑，在本聊天中继续 Cedar/Maple 改造至北京时间 2026-10-13 14:00。已创建临时 heartbeat `cedar-maple-14-00`，截止 UTC 06:00；不提交、推送、发布或创建子任务。

后续先审计 Cedar 字段上无用途的 pickerProps / 范围 datePickerProps，以及全局日期初始化的多实例语言/周起始隔离。不要机械新增 PC 滚轮 API。每批核对实际生效逻辑、测试、Demo、文档和调研状态。接近截止只做安全收尾，到时不开始新实现并总结实际结果。

71 族仍为 55 same / 15 logicSame / 1 separate，日期族保留 logicSame，不宣称旧日历主体和外观全部同源。
