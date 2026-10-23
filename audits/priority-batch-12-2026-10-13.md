# 第十二批：日期月份标签

## 完成

- 两端独立复制 date-labels.ts 与公共面板 abbreviation 默认值，未增加共享运行时或 platform 配置。
- Maple DatePicker / DateRangePicker 增加 abbreviation，默认 true。false 使用当前语言的完整月份名称；仅影响日历月份网格，不影响标题、星期、滚轮和值格式。
- Date / DateRange 通过 datePickerProps / dateRangePickerProps 配置；范围面板顶层选项优先，不被嵌套日历参数覆盖。
- 运行时修改与全局语言切换更新标签，不触发模型修改或选择事件。语言字典已有 JAN / Jan 文案差异保留，不机械统一翻译。
- 单端月份渲染器使用相同标签选择函数；两库源码独立维护。日期复制门禁从 33 增至 34 对。
- 中英文 Maple 示例及右侧集合、Cedar 示例、四类日期文档、OpenSpec、changeset、API 清单和调研/菜单状态同步。
- 修复 Maple 旧 disabledDate 快照依赖当前日期奇偶和当前年份的问题：测试固定 2026-01-02，仅 mock Date，不改组件行为或快照。测试清理恢复系统时间。

## 验证

- Cedar 日期 DOM/逻辑 14 文件 78 项通过，独立 SSR 4 项通过。
- Maple 日期族 16 文件 114 项通过（不更新或跳过快照）。
- 两端新增月份标签 3 项测试覆盖默认缩写、运行时切换、范围根选项及语言切换。
- 两端源码 typecheck、build:lib、发布消费者 typecheck:contracts 通过。
- Cedar 受影响 ESLint、Maple 受影响 ESLint 检查；Maple 全量 lint:check 已执行，失败来自本批未修改的 src/utils/popup-container.ts（格式和 curly 规则），未覆盖其他工作中的改动。
- Maple 992 份 Demo SFC 检查及 Cedar 新 Demo 编译通过。34 对独立复制门禁与 71 族调研/菜单元数据验证通过。
- 构建样式图 Cedar 96 入口/98 Less，Maple 91/93，无缺失、循环或内嵌重复 foundation，源码/发布消费者基础样式只加载一次。
- 未执行真实浏览器视觉/触屏验收和生产整站文档构建，不以 jsdom/SFC 检查替代。

## 后续

语言来源与范围日历外观参数已在[第十三批](./priority-batch-13-2026-10-13.md)收口；普通 Picker / 时间展示参数继续审计。

本批只完成月份标签。日期标题布局、Cedar 组件级 locale 与全局语言的边界、嵌套 datePickerProps/pickerProps 的精确类型和运行时白名单仍需继续收口。星期不受月份 abbreviation 开关控制，不宣称已增加星期缩写 API。

71 族保持 55 same / 15 logicSame / 1 separate；日期族仍为 logicSame，未宣称旧日历主体和外观全部一致。
