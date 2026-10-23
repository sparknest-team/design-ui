# 第十三批：日期语言与范围日历配置

## 完成

- Cedar 删除日期单值/范围 public 与旧内部渲染器的 locale Prop 和类型，不保留兼容字典；移除已无用途的 panel-presentation-props.ts。
- 翻译钩子直接提供本库全局 Locale/ConfigProvider 的 t，不再二次设置全局 dayjs 语言。原渲染器日期初始化仍由其既有 locale/dayStartOfWeek 监听负责，本批未重写日期计算基础设施。
- 标签与当前/确认动作统一语言来源。增加同实例切换语言的动作断言，不修改模型或发送选择通知。
- 修正内部日期 Provider 的 InjectionKey 类型，保持本库实例通信，不跨库共享。
- Maple DateRangePicker.datePickerProps 与 DateRange.datePickerProps 限定为 DateRangeCalendarOptions：hint/color/titleColor/buttonElevation/touchable；类型与运行时白名单一致。嵌套视口、规则、模型、监听、presentation、elevation、abbreviation 和当前动作不转发。
- 范围日历、日历时钟与日历滚轮的日期分支显式使用 calendar，修复内部日历默认 picker 造成展示模式错误。
- 两端独立复制字段参数合并逻辑：嵌套外观不会被字段空默认对象覆盖，字段显式键优先；模型/规则与通知仍由顶层持有。
- 独立复制的字段合并测试加入门禁，日期族共 35 对源码/测试。Maple 特有外观白名单在独立 calendar-options.ts，不引入 platform 配置或跨库运行时。
- 根入口/组件入口导出 DateRangeCalendarOptions，发布类型消费者补旧 locale、错误嵌套视口/缩写/展示的反例与新类型正例。
- 两端月份示例增加确认按钮，Maple 展示范围设备预订外观；中英文文档、API 清单、调研与 Maple 菜单、OpenSpec 和 major changeset 已同步。

## 验证

- Cedar 日期 DOM/逻辑 15 文件 80 项，独立 SSR 4 项通过，共 84 项。
- Maple 日期族 18 文件 118 项通过；没有更新或跳过快照。
- 新增字段合并测试各 2 项，Maple 外观白名单与实际渲染器测试 2 项；语言切换/动作断言扩充原月份测试。
- 两端源码 typecheck、build:lib 通过。Cedar 受影响 ESLint、Maple 全库 lint:check 通过。
- 两端发布 typecheck:contracts 验证根入口/组件入口与反例。
- Maple 992 份 Demo SFC 检查及 Cedar 修改后 Demo 编译通过。
- 35 对日期复制门禁、71 族调研/菜单检查、两端公共导出审计通过；没有缺失导出或契约。
- 发布样式依赖图 Cedar 96 入口/98 Less、Maple 91/93 验证通过；无循环、缺失或内嵌重复基础样式，源码/发布消费者 foundation 与 Loading 各只加载一次。本批未增加 CSS Token。
- 本批路径 git diff --check 验证，保留其他工作中的更改。
- 未运行浏览器视觉/触屏验收、整站生产文档构建；SFC 编译和 jsdom 回归不替代这两项。

## 后续

日期内嵌时间/滚轮展示参数已在[第十四批](./priority-batch-14-2026-10-13.md)收口；无效字段参数与全局日期多实例初始化继续审计。

日期标题布局仍按端侧展示设计，未机械改成一致外观。普通 Picker 与时间面板嵌套选项、Cedar 范围字段中无实际用途的展示参数，仍需继续审计精确类型和运行时边界。

71 族保持 55 same / 15 logicSame / 1 separate；日期族仍为 logicSame，未宣称旧日历主体和端侧外观全部同源。
