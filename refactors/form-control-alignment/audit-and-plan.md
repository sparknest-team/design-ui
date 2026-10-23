# Cedar / Maple 表单控件横向审计与整改计划

审计日期：2026-09-21。范围为当前工作区 Cedar 95 个组件、Maple 88 个组件，重点检查公开 API、状态控制链、Form 集成、CSS/Token、测试与门禁。

## 结论

两库已经有可复用的基础，但还没有形成完整的“表单系统”。当前最规范的是 Input/健壮性工具和 Checkbox、Radio、Switch 的基础 token；风险最高的是 Form 上下文、Select/AutoComplete 能力分层、样式 Props 与 CSS Token 的职责重叠，以及公共契约更新滞后。

API 入口检查当前无缺失导出：Cedar 122 个运行时 Props 导出、Maple 115 个、同名可比较 89 个。这个数字只说明可比较范围，不代表语义一致。

## 已确认的问题

| 优先级 | 范围 | 现状 | 目标 |
| --- | --- | --- | --- |
| P0 | 契约同步 | Cedar 新增公开 `field-size-xl-height` 后，主题契约未更新；检查直接失败 | 代码、文档、契约、测试同一提交更新 |
| P0 | Form 公共上下文 | Cedar Form 有 size/rules/grid label，缺 readonly；Maple 有 readonly，缺 size/rules；model 必填性与 layout 集合也不同 | 建立共享 FormContext 逻辑接口，平台布局为扩展 |
| P0 | 内部 API 泄漏 | Maple Input 的 `isForceFocusingEffect`、`isForceErrorEffect`、`autocomplete` 等以“internal”注释存在于公开 props 对象 | 内部开关移入内部组件/上下文；真正原生属性走 `inputAttrs` |
| P0 | 继承逻辑 | 同类控件混用 `undefined`、`false` 默认值和 `??`、`||` 合并，难以判断显式 false 是否覆盖父级 | 为每个状态固定优先级并写跨端契约测试 |
| P1 | Select | Cedar 偏桌面搜索/虚拟列表/创建能力；Maple 偏 picker/popup/presentation，公共核心被平台能力淹没 | 抽出同义核心 props/emits/slots，平台参数进入 adapter/presentation |
| P1 | AutoComplete | Cedar 复用完整 Input 与 Trigger/VirtualList；Maple 缺 defaultValue/error/字数能力，同时携带颜色样式 props | 对齐输入核心，弹层渲染保留平台实现 |
| P1 | Checkbox/Radio | Cedar 有 defaultChecked/error/group 状态，Maple 有 readonly/颜色/icon/ripple；值类型也过宽 | 统一值与 Group 契约，视觉能力转 CSS token 或平台扩展 |
| P1 | Form 校验 | 两端规则、字段路径、触发器、reset/clear/expose 和异步竞态能力仍是两套 | 共享规则语义和测试夹具，不要求同一 SFC |
| P1 | 样式职责 | Maple 多个输入组件公开 textColor/focusColor/blurColor；这与主题 CSS 变量重复 | 品牌定制走 token，逐实例动态样式才用 prop |
| P2 | Date/Time | 同名组件的桌面面板与移动时钟/picker 架构差异大，API/token 全量求交没有意义 | 只统一 value/open/disabled/readonly/format 等语义壳层 |

## CSS/Token 横向结果

| 组件 | 共享 token | Cedar 独有 | Maple 独有 | 判断 |
| --- | ---: | ---: | ---: | --- |
| FieldDecorator | 35 | 0 | 0 | 审计发现的 xl 差异已修复为公共 token |
| Input | 7 | 0 | 0 | 后缀已一致 |
| Textarea | 13 | 0 | 0 | 后缀已一致 |
| Checkbox | 12 | 0 | 0 | 后缀已一致 |
| Radio | 12 | 0 | 0 | 后缀已一致 |
| Switch | 34 | 0 | 0 | 后缀已一致 |
| Form | 8 | 67 | 3 | Cedar 校验/桌面布局与 Maple item 布局尚未分层 |
| Select | 11 | 18 | 6 | 公共触发框已接近，popup/picker 层差异未登记清楚 |
| AutoComplete | 0 | 17 | 1 | 尚未建立公共视觉契约 |
| InputNumber | 0 | 0 | 9 | Cedar 仍主要依赖 FieldDecorator；组件级 token 策略不一致 |
| Search | 0 | 0 | 17 | Maple 是移动搜索容器，Cedar 是组合输入；应拆核心与 presentation |
| VerificationCode | 0 | 1 | 4 | 需统一 cell/gap 基础 token |

Date/Time 的面板 token 差异属于架构差异，不应直接把两边 token 合并成巨型公共集合。公共契约只覆盖输入壳层与状态色，桌面日历、移动时钟分别登记平台扩展。

## API 设计基线

详细规则见 `standards/form-controls.md`。整改时必须遵循：

1. 同名 prop/emits/slot/expose 必须同义；平台差异只允许新增能力，不允许改写公共语义。
2. 值统一受控/非受控双模式；弹层统一 `open/defaultOpen/update:open`。
3. `disabled/readonly/size/error` 只能通过一条合并链进入组件，不能组件各自拼接。
4. 五档尺寸由系统 token 驱动；Switch 等窄尺寸组件显式声明子集。
5. 品牌视觉进入 CSS 变量，避免颜色 props 与主题系统双轨。
6. Props 类型、运行时 validator、文档枚举和 CSS 实现必须覆盖同一值域。

## 执行顺序

### 第一阶段：控制链与门禁（P0）

状态：2026-09-21 已完成核心改造。

- [x] 定义共享的 FormControlState 与状态合并函数；两库保留本地同源运行时代码，并由 copied-foundations 门禁防漂移。
- [x] 对齐 Form 公共 props：model/layout/disabled/readonly/size/rules/scrollToError；桌面网格属性继续作为 Cedar 扩展。
- [x] 清理 Maple Input 公开内部 props，`autocomplete` 等原生属性统一走 `inputAttrs`。
- [x] 新增跨端继承测试，覆盖 local → FormItem → Form → fallback、显式 false、size、disabled、readonly。
- [x] 新增 `check:form-controls`，阻止公共 Form props 缺失和 Input 内部状态 props 再次暴露。
- [x] theme-contract 与 API export audit 保持为公共门禁。
- [x] Form 字段控制器完成两端独立同源复制：统一注册/卸载、异步批次竞态、`validate` / `validateField`、`resetFields`、`clearValidate`、`setFields` 和 start/end 错误定位；规则引擎与布局作为本地适配。
- [x] FormItem 五种触发时机 `change/input/focus/blur/clear` 已对齐；`clear` 只响应控件清空动作。Input/Textarea 接入独立复制的同源输入法去重与文本值归一化，Cedar/Maple Demo 均已补齐。
- [x] Textarea 自动高度的 min/maxRows 计算已独立复制同源，Form/FormItem 的 size、disabled、readonly、error 继承优先级已对齐，并补齐两端测试与复制门禁。PC/移动端默认 resize、DOM 和观察器实现继续独立。
- [x] Input 受控/非受控值、trim 提交、change 去重和清空基线已抽为两端独立复制的同源逻辑；两端超长输入统一截断并通过 update/input 上报归一化值。模板、FieldDecorator 与端侧外观继续独立。

第二阶段迁移其他输入组件时，必须复用本阶段入口，不允许各组件继续手写 `||` 状态链。

### 第二阶段：基础输入族（P1）

- [x] Input：公共 Props、枚举 validator、`trim`、原生无障碍属性、`press-enter` 命名与提交顺序已对齐；Maple 的 hint/line/颜色保留为平台展示扩展。
- [x] Textarea、InputNumber、Search 已完成公开 API 第一轮对齐。
- [ ] VerificationCode，以及 Input / Textarea 主体同源收口。
- 对齐默认值、validator、IME、clear/change 顺序、expose 与 FormItem 接入。
- 补齐 InputNumber、Search、VerificationCode 的公共 token 或明确 platform extension。

### 第三阶段：选择输入族（P1）

- Select、AutoComplete、Cascader、Date、Time。
- 将 value/open/options/filter 等语义核心与 menu/picker/list 平台 presentation 分离。
- 对齐 Option/Group、键盘与触控选择、readonly、异步选项、焦点恢复。

### 第四阶段：离散控件与校验（P1）

- Checkbox、Radio、Switch、Slider、Rate、Upload。
- 统一 Group、readonly/error、值类型、FormItem 事件和无障碍语义。
- 建立两端共享行为夹具和视觉回归矩阵。

## 完成标准

- 公共 API diff 仅剩登记过的平台扩展。
- 所有公共组件 token 后缀一致，或在契约中明确为平台扩展。
- 两端 typecheck、unit、build、theme-contract、API export audit 全通过。
- 每个表单控件具备契约规定的状态/事件/尺寸/主题测试。
- 文档不再展示内部 token 或内部 props，亮暗主题和两套品牌主题均通过示例页验证。

## 本次已处理

- Maple 将 `--mp-internal-field-size-xl-height` 提升为真正的公共 `--mp-field-size-xl-height`，实现与中英文文档同步。
- `@ui-foundation/theme-contract` 增加公共 `size-xl-height`，恢复 FieldDecorator 五档尺寸契约。
- 新增 `standards/form-controls.md`，作为后续两端开发与评审的强制基线。
