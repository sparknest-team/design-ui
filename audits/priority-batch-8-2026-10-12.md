# 第八批：FormItem 装饰与校验展示

## 完成范围

- Maple 补齐 contentClass/contentFlex、labelAttrs/labelComponent、showColon/tooltip。FormItem 运行时 Props 两端 31/31，名称差集为零；规则类型仍分别消费本地引擎。
- item-decoration.ts、FormItemLabel.vue、配对行为测试独立复制，各库自己维护代码及实例。标签渲染仅 CSS 命名空间和本地图标导入不同；不共享运行时核心，无 platform 配置。
- labelAttrs 保留原生属性，for 指向控件真实 id；contentFlex 默认 true，业务 Grid 可关闭。Tooltip 使用可聚焦按钮，支持 hover/focus/click。required 规则与 required 属性均产生星号；hideAsterisk 不关闭校验。
- 显式 validateStatus 优先于自动展示，不能改变实际校验结果。error 才显示错误消息，其余状态显示 help；输入控件错误态与反馈状态遵循同一规则。自动校验 validating → success/error，clearValidate 回到未校验。setFields 仅传 message 自动视为 error，显式空 status/message 支持清空。
- 公开 FormItemAsteriskPosition/FormItemValidateStatus 类型及 Maple 根入口已补齐；反向类型测试覆盖错误枚举和 contentFlex 类型。移除 Cedar 文档残留 merge-props 说明及“自动标签仅首次生效”的过时描述。
- 两组中文 Demo 在两端同步，Maple另有英文版本，中间卡片和右侧集合引用同一源文件。API、中英文文档、标准、Token 契约/生成参考、菜单、同源调研、OpenSpec 与 changeset 已同步。
- Form 同源门禁扩大到 12 对，保留逻辑已同源标记；本地注入/规则引擎、默认 horizontal/vertical、消息外观仍独立，不宣称整个 Form 主体完全一致。

## 验证

- Cedar Form 5 文件 26 项通过；Maple Form/FormDetails 7 文件 45 项通过。新增配对契约各 6 项，覆盖标签属性/插槽/元素、内容布局、必填标记、状态覆盖、setFields/clearValidate；真实 Input 错误态在显式成功/警告/加载状态下关闭，撤销覆盖后恢复。
- 两端源码类型检查、发布类型消费者正反测试、Cedar Form scoped ESLint 和 Maple 全量 lint:check 通过。
- 两端 build:lib 退出成功；构建产物生成完成后发布类型及 ESM/CJS 样式入口检查通过。检查中曾观察到构建期间产物目录缺失，等产物生成后复查通过，没有为该现象修改构建逻辑。
- 12 对 Form 源码门禁、公共入口导出审计通过，无缺失 Props/类型契约。
- Cedar 两份新 Demo script/template 编译通过；Maple 982 Demo SFC 编译，0 失败。
- 样式契约 64 共享系统 Token、57 系统值、1057 组件值、49 组件契约通过；3 份生成 Token 参考通过。样式模块 Cedar96/98、Maple91/93，无环、缺失依赖、嵌入 foundation；消费者 foundation/Loading 仅一次。
- 三仓 git diff --check 通过。
- 未做真实浏览器视觉/触屏验收，未重跑整站生产文档构建；jsdom 测试与 SFC 编译不代替这些检查。

## 下一批

DatePicker/DateRangePicker 字段与纯面板入口、API 命名/类型导出层级收口。现有 71 族统计保持 55 same / 15 logicSame / 1 separate，复制范围统计不代替真实剩余能力清单。

后续进展：字段/纯面板入口边界、周起始日和类型导出已在[第九批](./priority-batch-9-2026-10-12.md)实施；日历快捷选项与视口协议仍待下一批，不等同于日期族全部完成。
