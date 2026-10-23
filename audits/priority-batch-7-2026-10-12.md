# 第七批：Form 标签与栅格布局

## 已实施

- 两端独立复制 layout-props、use-form-item-layout、use-form-label-width 和 form-id；与既有 controller/trigger/配对测试合计 9 对源码门禁，无共享运行时或实例。
- Form/Item 支持 labelAlign、labelColProps、wrapperColProps、labelColStyle、wrapperColStyle、labelColFlex 和 Form.autoLabelWidth。Item 显式值优先，对象整项覆盖；横向默认 5/24 与 19/24，Col 响应式断点按视口生效。数字 flex 是伸缩比例，单位字符串才是固定宽度。
- 自动宽度按各项实际 horizontal 布局生效，支持纵向 Form 内横向 Item、动态标签增删、固定宽度优先、空集合、独立表单和 KeepAlive；观察器/resize fallback 在卸载或停用时释放。自然标签不受旧列宽限制，避免长标签无法继续扩宽。
- Maple 使用本库 Row/Col，补齐 rowProps/rowClass；样式依赖通过静态 TS 入口引入。Cedar 默认 horizontal、Maple 默认 vertical；本地校验引擎、滚动与提示外观继续独立。
- 补齐 Maple Form.id 的显式字段容器前缀，规范嵌套路径。根 Form 运行时 Props 名称 16 / 16，差集为零。
- Cedar FormItem 的 Props 移入 item-props.ts，补齐 formItemProps/严格 FormItemProps 导出，发布类型正反测试确保列参数和布局枚举不退化为 any。Cedar 补齐 FormItem.size 对控件的局部覆盖；标签密度仍由 Form 视图决定。删除无人消费的废弃 mergeProps，不保留兼容分支。
- 三组中文 Demo 两端同步，Maple 另有英文版本；中间独立卡片与右侧集合均引用同一源文件。旧 auto-tag-width.vue 被新 auto-label-width.vue 替换，旧文件可从 Git 恢复。
- API、标准、平台默认值、菜单/同源调研、Props 差集、生成 Token 参考、OpenSpec 与 changeset 已同步。

## 验证

- Cedar Form：4 文件 20 项通过；Maple Form + FormDetails 原有 29 项及新布局 10 项通过。新版布局覆盖响应式列/样式覆盖、零值 flex、宽度缩减、停用/恢复、SSR、显式 id 和控件尺寸继承。
- 配对浮层关联测试各 2 项通过。全量检查中的新增移动 Time 测试用静态 Time/TimeRange 分支修正类型推导，Picker 测试改 const 并调整属性顺序；相关 Time/Picker/浮层 14 项通过，未改其交互实现。
- 两端源码 vue-tsc、Cedar Form scoped ESLint、Maple 全量 lint:check 通过。
- 两端 build:lib 与发布类型消费者 typecheck:contracts 通过，包括无效列参数、布局枚举和已删除 mergeProps 的反向用例。
- 公共入口导出审计 missingExports/missingContracts 均为空；9 对 Form 门禁通过。
- Cedar 三份新 Demo 的 script/template 编译通过；Maple 978 Demo SFC 编译，0 失败。
- 两端 style-vars 与 3 份生成 Token 参考检查通过。发布样式依赖：Cedar 96 入口/98 Less，Maple 91 入口/93 Less，无环、缺失依赖或重复内嵌 foundation；ESM/CJS 依赖图通过。
- 三仓 git diff --check 通过。Cedar 旧 Vitest 部分运行有 close timed out 提示，测试报告通过且退出 0。
- 标签尺寸测试使用可控 DOM 尺寸/Observer fixture；未进行真实浏览器视觉或触屏验收，未重跑整站生产文档构建。

## 仍待实施的 API

根 Form 名称已对齐，不代表 FormItem 全部能力对齐。当前 FormItem 为 31 / 25；Maple 尚缺 contentClass、contentFlex、labelAttrs、labelComponent、showColon、tooltip。这些是普通展示能力，后续应补齐，不将它们标成必然的 PC 专属差异。公开枚举和 validate-status 展示语义也需随该批核对。

下一批优先收口上述 FormItem 装饰 API，再整理 DatePicker/DateRangePicker 字段与面板的命名/导出层级。71 族统计仍为 55 same / 15 logicSame / 1 separate；这是复制范围统计，不能代替残余 API 清单。
