# Cedar Vue 的无障碍命名与 17 项 API 评估

2026-11-20。用于组件设计评审。共享规范适用于 Cedar / Maple，下面的运行结果来自桌面端 Cedar Vue。每行的“透传足够”评价的是设计是否需要一个独立 prop，现有调用、类型提示、属性优先级和双语文档仍是公开契约。任何迁移另行评审。

## 标准要求与设计选择

WCAG 2.2 的 4.1.2（A级）要求软件能确定控件的名称、角色及适用的值、状态和变化。2.5.3（A级）要求有可见文字标签时，可访问名称包含该文字，使语音控制用户能按看到的文字操作。3.3.2（A级）要求在需要输入时提供标签或说明；只给读屏用户一个名称，有时仍不能满足所有用户的输入需求。2.1.1 和 2.4.7 分别涉及键盘可操作性和可见焦点。它们约束产品效果；框架的 props、类型和文档结构属于组件设计。[WCAG 2.2](https://www.w3.org/TR/WCAG22/)

WAI-ARIA 定义角色及属性。aria-label 在支持命名的角色上提供字符串名称；有效的 aria-labelledby 引用在名称计算中优先。无角色的普通 div 通常具有 generic 语义，WAI-ARIA 对 generic 禁止作者命名。名称回答“这是什么”，描述补充格式或错误，值和状态表达“现在如何”。例如“音量”是名称，40 是当前值。将三者拆开才能在值变化、切换语言和语音控制时保持一致。[WAI-ARIA](https://www.w3.org/TR/wai-aria-1.2/#aria-label) · [generic 角色](https://www.w3.org/TR/wai-aria-1.2/#generic)

W3C APG 是实现指南。原生输入优先用可见 label 关联，文本按钮通常用按钮文字，组件已有可见标题时可用稳定 ID 引用，无可见文字的图标操作可用 aria-label。placeholder 随输入消失，不能替代持久的字段标签。双手柄每个可聚焦节点都要有可区分的名称；弹窗本体要有名称，能读到内部标题和能读到弹窗名称是两项不同的观察。[命名指南](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/) · [双手柄](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/) · [模态对话框](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

在 Vue 中先找真正接收焦点或拥有语义的元素，再决定 attrs 去向。单一稳定目标可以定向转发；普通 Vue 根节点继承在根是装饰外壳时会送错地方。只要目标可预测、类型可用并有测试，内部声明 prop 和定向读取 attrs 都可以实现标准。存在标题默认值、优先级、跨模式转交或多节点派生时，公开契约应明确。aria-expanded、aria-checked、aria-valuenow 等由实际交互状态驱动，aria-controls、aria-activedescendant 等应与当前真实节点对应；不要用一条“透传所有 aria-*”的规则覆盖组件管理的状态。

同类产品亦有不同接口。Element Plus 把字符串 aria-label 列入 Slider API，另设两端名称。MUI 用 getAriaLabel(index) 命名范围手柄。PrimeNG 的范围模板把同一个字符串交给两端。这些接口说明了设计选项；是否能正确区分“最低价”和“最高价”仍要验证实际结果。[Element Plus](../../element-plus/docs/en-US/component/slider.md) · [MUI](../../material-ui/packages/mui-material/src/Slider/Slider.js) · [PrimeNG](../../primeng/packages/primeng/src/slider/slider.ts)

## 逐项决定与验收重点

“公共说明”指组件页可链接到原生属性文档，并明确目标节点。“API”指组件页要能直接查到行为，适合标为“无障碍”分组。审查现有类型不能只看组件模板；例如 InputPassword 与 AutoComplete 复用了 Input 的声明。

| 组件 | 建议的传递方式和文档位置 | 依据及单项验收重点 |
|---|---|---|
| Input / InputPassword | 保留显式字符串 prop，写入 API | 直接编辑时名称给 input；延迟编辑还要给可聚焦的编辑入口，并处理显式名称、原生属性与 FormItem 标签。已有测试验证动态修改和撤销后的回退。密码显示按钮要描述自己的操作。 |
| Textarea | 定向透传足够，公共说明写明落在 textarea | 只有一个文字编辑目标，自动伸缩的测量节点已隐藏。验收原生 label、无标签覆盖、错误描述和名称撤销；外壳与清空按钮各有独立语义。 |
| AutoComplete | 名称可以定向交给既有 Input；组件页说明 combobox 目标和键盘行为 | 候选列表可以开合，但名称属于输入控件，两种渲染路径都使用 renderInput。无需另一套名称解析。保留控件对 expanded、controls、activedescendant 的所有权；选择上下项时焦点与活动项应对应。 |
| Search | 保留显式 prop，写入 API | 常规输入和历史弹层编辑器之间切换。getLabel 依次取显式值、inputAttrs、参考节点属性、label。名称跟随可访问编辑器，搜索按钮另取操作文案。验收打开和关闭后只有当前编辑器参与键盘和辅助技术导航。 |
| Checkbox / CheckboxGroup | 单项与组各自定向透传足够，组件页区分两者 | 可见选项文本通常已为原生 checkbox 命名。无文字时传给 input；组名传给 role=group。验收“通知渠道／邮件”能分别获取；原生 checked 与 indeterminate 随状态变化。 |
| Radio / RadioGroup | 两个目标分别透传足够；分组命名应在组件页明确 | 单项 input 从选项文字取得名称，radiogroup 用问题或字段标题命名。保留单组选中逻辑及方向键行为。验收“送达方式／上门”，不能让组名覆盖每个选项。 |
| BackTop | 单一按钮透传足够；组件页记录图标按钮默认名及覆盖方法 | 当前 prop 默认 Back to top。转换为 attrs 时若丢失默认名，图标按钮就可能无名。应核对多语言、自定义可见文字是否与读屏名称匹配，以及点击或键盘激活后的实际滚动行为。 |
| ProgressGroup | 组名透传足够；在 items API 明确每段标签 | group 接收整体名称，每个 progressbar 使用 item.label 和自己的数值。组名不能替代各段名；线形和环形都要核对。 |
| Rate | 单一评分滑块可定向透传；组件页说明命名、键盘与数值 | 星形外观对应一个 slider。现有逻辑会判断显式名称并关联 FormItem，迁移需保留此优先级。验收读到“服务质量、当前值”，方向键改变值时名称稳定。 |
| Descriptions | 保留显式 prop，写入 API | 名称落在内层 table。未给显式名时，文本标题提供名称，标题插槽通过 ID 关联。对外说明这三种入口，在表格导航中验证，不能只看外层标题是否可见。 |
| Dialog | 保留显式 prop，写入 API；优先评审标题插槽默认命名 | 真正的 dialog 在浮层内部。复现显示，只传标题插槽时标题节点有名，dialog 本身为空。API 应说明显式名、文本标题及插槽标题的路径；后续若修复，验证打开时读到标题、焦点进入、Tab 范围、Escape 与焦点恢复。 |
| Drawer | 保留显式 prop，写入 API | 同样需要给内部 dialog 命名。普通 title 插槽已有 ID 关联；自定义 header、隐藏 header 和单独关闭按钮的语义不同。验收每条路径，在重复打开和标题更新后检查 ID 指向。 |
| Card | 按模式处理；保留展开面板的显式命名 API，普通展示卡按角色决定 | 默认根是普通 div；展开面板有 group 语义，名称和标题引用需要送往面板。给普通卡增加标签或 role 之前应确认用途。浏览器显示 generic 名称也不能据此承诺标准支持。应覆盖展开、关闭、调用者指定合适 role 和自定义标题。 |
| Carousel | 保留显式 prop，写入 API | 组件提供有默认名称的 region，业务宜用“产品图片”等内容名称区分多个轮播。幻灯片、翻页和跳转按钮独立命名；自动播放需另验停止、焦点和操作行为。 |
| Split | 保留显式 prop，写入 API | 属性命名内部可聚焦 separator，默认值来自语言包。多分隔条布局建议按被调整面板命名。验收手柄的名称、方向、值域、键盘调节和与被控面板的关系。[APG 窗格分隔器](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) |
| Slider | 保留显式多目标命名契约，现有字符串与二元组均应在 API 说明 | 单手柄一个名；双手柄需分别表达“最低价／最高价”，附带数字输入也要区分。数组属于 Vue 层，渲染到每个手柄的是字符串。未来可比较独立起止参数、子节点属性或回调，先核对现有调用。验收 Tab 顺序、键盘、相依的 min/max 和更新后的值。 |
| VerificationCode | 保留显式命名契约，API 写清整组和每一格的派生关系 | 现实现用组名组成“验证码 1/4”等。独立使用且不提供名称时，实测四格全无名。组件页应给完整用例，并评估调用者只传可见标签引用时的逐格命名。另测粘贴、退格、焦点顺序与错误描述，避免每格反复读冗长说明。 |

各目录的声明、模板和 Demo 源码可从[源码索引](cedar-aria-label-2026-11-20.md)逐项查看。

## 验证证据与范围

对当前 Cedar 源码逐目录选择一份现有 Vitest 测试，共 17 个文件、178 个用例通过。覆盖内容包括 Input 延迟编辑标签优先级、Search 原生输入归属、Drawer 标题命名、Split 无障碍名称、Slider 与验证码行为。178 是文件内全部测试数，包含与无障碍无关的断言。

另用当前工作区已构建的 Cedar UMD、Vue 和独立 Chromium 页面测试。每个组件单独挂载，不依赖文档站标题或其他外部标签。使用浏览器 Accessibility.getFullAXTree 读取未被忽略的节点，下表为代表性结果。它验证该构建和场景下浏览器计算出的语义；不能替代 NVDA、VoiceOver、触屏读屏或完整 WCAG 符合性审计。

| 场景 | 浏览器可访问树 |
|---|---|
| Input、Textarea、AutoComplete | textbox“帐号”、textbox“备注”、combobox“选择城市” |
| Search | textbox“关键词”和 button“搜索”分别存在 |
| Checkbox、Radio | group“通知渠道”内为 checkbox“邮件”；radiogroup“送达方式”内为 radio“上门” |
| BackTop、Rate、Split | button“回到顶部”；slider“服务质量”值 0；separator“导航宽度”值 50 |
| ProgressGroup、Descriptions | group“项目进度”与 progressbar“设计”值 30；table“订单详情” |
| Carousel | region“产品图片”，当前幻灯片“第 1 页，共 2 页”，上一页、下一页和跳转按钮独立命名 |
| 普通 Card | Chromium 暴露 generic“订单详情”。generic 在 WAI-ARIA 中禁止作者命名，不能据一次浏览器行为推断跨平台支持 |
| Dialog、Drawer 只给相同的 title 插槽 | 两者都有 heading“删除订单”；Dialog 的 dialog 名称为空，Drawer 的 dialog 名称为“删除订单”。给 Dialog 显式名称后，dialog 名称为“删除订单” |
| Slider 双手柄 | slider“最低价”值 20，slider“最高价”值 80 |
| VerificationCode 四格 | 有组名时，group“验证码”以及 textbox“验证码 1/4”至“验证码 4/4”；未提供任何名称时，group 和四个 textbox 的名称均为空 |

未来单项改动应覆盖真实焦点节点的角色、计算名称、描述和值，并切换标签、语言、编辑模式和显隐状态。按组件验证键盘与焦点；有动态结果或错误时验证反馈是否可感知。复杂控件再进行桌面读屏和移动触屏读屏验证，记录浏览器、辅助技术版本及步骤。本轮只评估命名策略和相关风险，未实施迁移。
