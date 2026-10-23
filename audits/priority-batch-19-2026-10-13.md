# 第十九批：日期字段视口与快捷项事件

## 完成

- 独立复制字段完整链路的四项测试：同一组 Cedar 全部通过、Maple 四项全部失败，确认不是 Emits 缺失而是本地展示未转发。
- 将 Cedar DatePanel 的 update:pickerValue / picker-value-change / select-shortcut 三条监听复制到 Maple DateFieldContent，公开包装器/所有者和类型沿用原同义协议，不增加旧 API 别名或运行时共享。
- 单值/范围各验证三参数视口通知、拒绝/接纳嵌套受控 pickerValue、导航不改模型、快捷项原对象与字段确认草稿。
- 两端另各两项真实日历字段导航验证：仅浮层 Surface 替身，日历渲染器、适配器、所有者、工具和公开组件不替换。真实月份按钮请求、拒绝时标题不变、回写后标题改变均通过；不把这些 jsdom 用例视为真实浏览器浮层验收。
- 新增两端单值/范围字段视口 Demo，Maple 中英文各自组件文件、中间卡片/右侧集合和 API 事件说明同步；修复 Cedar 两份相关文档表格中遗留的字面量反斜线 n。
- 日期复制门禁 42 对，调研/菜单同步四个日期入口，纠正纯面板条目残留的第十五批待审说明；Cedar OpenSpec 与两端 patch changeset 更新。

## 验证

- Cedar 日期逻辑/DOM 26 文件 116 项通过；独立 SSR 4 项通过，共 120 项，进程正常退出。
- Maple 日期族 29 文件 157 项通过，含 SSR；无跳过、无更新快照。
- 两端源码 typecheck、Cedar 受影响 ESLint、Maple 全库 lint:check 通过。
- 两端 build:lib 与发布消费者 typecheck:contracts 通过。
- Maple 1004 份 Demo SFC、Cedar 两份新 Demo 编译通过。
- 42 对复制门禁、71 族调研/菜单、两端公开导出、API 清单 129/119/97 与 Token 目录通过。
- 发布样式图 Cedar 96 入口/98 Less、Maple 91/93 通过，无环/缺失或重复基础样式，源码/发布消费者 foundation 和 Loading 各单次加载；本批无新增 CSS Token。
- 本批路径 git diff --check 通过。未做生产整站文档构建、真实浏览器视觉/软键盘/触控验收。

## 下一批

继续日期嵌套 Options 的实际调用链收口。Maple Date/DateRange.presentation 是根展示所有权，默认 picker 总会覆盖 datePickerProps/dateRangePickerProps.presentation，但两种嵌套公开类型目前仍允许 presentation，需要确认后删除无效字段、运行时保护，并补发布类型/所有者/展示回归，不制造兼容层。

双库独立维护，不共享运行时、实例或 platform；截止北京时间 2026-10-13 14:00，不提交、推送、发布。
