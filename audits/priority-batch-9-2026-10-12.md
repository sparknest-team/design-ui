# 第九批：日期字段与纯面板入口/API 边界

## 完成

- Date/DateRange 负责输入与浮层，DatePicker/DateRangePicker 为纯面板。Cedar 不再从旧内部 pickerProps 整体扩散字段 Props；移除纯面板 open/defaultOpen、popupContainer、placement、triggerProps、placeholder、variant、clearable、error、size、disabledInput、unmountOnClose、showConfirmBtn 等无效字段/浮层设置。确认统一用 disableConfirm，字段编辑用 inputEditable。
- 两端独立复制 panel-props.ts 和 events.ts，公共模型/格式/规则/边界、disabled/readonly、确认、dayStartOfWeek、时间面板参数同义，无共享运行时或实例，无 platform 配置。
- dayStartOfWeek 为数字整数 0～6，默认 0（周日），仅日历展示使用。Maple 移除 firstDayOfWeek，迁移内部渲染/测试与中英文文档；修复数字周起点与范围日历的响应式转发。不做旧字符串/旧名转换。
- 补齐 DateType/DateRangeType、DatePickerType/DateRangePickerType、DateWeekStart、DateEventPayload/DateChangeArgs、四种 Emits 及展示 Options 导出；四个主体使用 typed defineEmits，事件时序/参数保持现有协议。
- DatePickerOptions/DateRangePickerOptions 不含模型、默认值、格式、边界、禁用规则或状态所有权；字段嵌套参数和移动范围面板的内层日期配置使用严格 Options 类型，运行时过滤仍保留。
- Maple 的两个面板补齐独立 withInstall，移除 DateRange 安装入口的过窄手写类型。根入口和 date/date-range 子路径都通过发布消费者编译；组件仍可通过 Date.Picker/DateRange.Picker 使用，不新增 date-picker/date-range-picker npm 别名目录。
- 增加两组字段/嵌入面板 Demo，Cedar 与 Maple 独立保存，Maple 有英文版及明确 calendar 展示差异。中间卡片和右侧集合引用同一 Demo 文件。四种入口文档、API、标准、菜单/调研、Props 清单、OpenSpec 与 major changeset 更新。
- 源码门禁从 21 对扩大至 24 对，新增公共 Props、事件协议及入口契约测试，不弱化原有一致性检查。

## 验证

- Cedar：DOM/逻辑 8 文件 45 项、独立 SSR 1 文件 4 项，共 49 项通过。
- Maple：日期/范围族 10 文件 82 项通过；新增范围日历测试验证 Monday/Saturday 响应式切换。
- 新配对入口测试各 6 项：字段/面板 Props 隔离、独立安装、闭合周枚举、动态展示配置、select/confirm 事件与 actions 插槽、非法/锁定端点范围拒绝。
- 两端源码类型、npm build:lib、发布声明消费者正反用例通过；消费者覆盖根/子路径、错误旧名/字符串周起点/越界枚举、面板错误浮层/输入参数、嵌套模型/规则所有权。
- Cedar 日期族 scoped ESLint、Maple 全量 lint:check、24 对源码/测试门禁与公共导出审计通过。
- Cedar 两份新 Demo script/template 编译通过；Maple 986 份 Demo SFC 编译，0 失败。
- 样式变量契约（64 共享系统 Token / 57 系统值 / 1057 组件值 / 49 组件契约）、生成 Token 参考三份、样式发布依赖图检查通过。Cedar96入口/98Less、Maple91/93，基础样式与 Loading 仅一次。本批未新增或改动 CSS Token。
- 三仓 git diff --check 通过。
- Cedar 旧 Vitest 0.22 在同一 --no-threads 进程混跑 node SSR 与 jsdom 时缓存 document=null，初次混跑失败；分别在两个进程执行后全部通过，未屏蔽断言或修改环境源码。有一次 close timed out 提示但退出 0。
- 未执行真实浏览器视觉/触屏验收，也未重跑整站生产文档构建；上述测试不代替这两项验收。

## 仍有差异 / 下一批

| 入口 | Cedar / Maple Props 数量 | 差异 |
| --- | --- | --- |
| Date | 33 / 35 | Maple multiple、presentation |
| DateRange | 34 / 35 | Maple presentation |
| DatePicker | 24 / 26 | Cedar 8 项日历扩展；Maple 10 项展示/多选扩展 |
| DateRangePicker | 24 / 20 | Cedar 8 项日历扩展；Maple 4 项展示扩展 |

Cedar 有 locale、shortcuts/shortcutsPosition、pickerValue/defaultPickerValue、previewShortcut、abbreviation，单日期还有 showNowBtn，范围有 exchangeTime。Maple 有 presentation、单日期多选/范围和触摸/外观参数，范围有 datePickerProps/pickerProps/elevation。Maple year/month/date 和 Cedar week/quarter 为明确能力差异。

shortcuts、面板视口控制/通知、今日动作/高亮不能永久标为 PC 专属或机械合并：showCurrent 是高亮今日，showNowBtn 是选择当前日期，二者不同。下一批优先设计同义的快捷选项与日历视口协议，再从 Cedar 收口、独立复制至 Maple；默认视图/外观及周/季度展示另行评估。旧内部日历渲染器仍各自维护，不宣称整族全部 API 或主体一致。

71 族统计仍为 55 same / 15 logicSame / 1 separate，仅反映已有复制范围，不表示剩余 API 已归零。

第十批已完成快捷项与视口协议实施，见 [第十批验证记录](./priority-batch-10-2026-10-12.md)。今日动作/高亮与其余展示差异仍待后续收口。
