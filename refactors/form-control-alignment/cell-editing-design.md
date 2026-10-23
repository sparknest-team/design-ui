# Cedar Maple 表单字段阅读与编辑统一设计草案

日期：2026-10-19。状态：首批已实施，正在扩展其他字段；以下按最新决策更新。

目标是沿用 Form、FormItem、字段组件和普通 v-model，即可切换直接编辑、弹层编辑与阅读。默认直接编辑，不新增公开 Edit 组件，不要求 editor 插槽，也不要求业务理解内部草稿控制器。

## 核心方案

公开展示配置只有 presentation：统一表达直接编辑、弹层编辑和阅读。不新增 mode。

| API | Cedar | Maple | 默认 |
| --- | --- | --- | --- |
| presentation | inline/popover/dialog/read | inline/popup/dialog/read | inline |
| editTrigger | content/action | content/action | Cedar action；Maple content |

editTrigger 只控制编辑入口，不改变编辑容器或提交时机。content 点击 label 之外的内容区域；action 只点击右侧按钮（PC 编辑，移动端箭头）。两者均按字段 > FormItem > Form 继承。read 隐藏入口，inline 不使用此配置。选择文字不触发编辑。

Form 提供全局默认，FormItem 可覆盖单项，字段可以独立使用并显式覆盖。优先级为字段显式值 > FormItem > Form > 平台默认。可继承属性的组件缺省为 undefined，在合并后解析默认值，不能先赋 inline 导致继承失效。

Form 自身缺省 inline；FormItem 和字段缺省 undefined。嵌套 Form 开始新的继承边界，不隐式继承外层 Form。布局类 Group 不新增 presentation；CheckboxGroup、RadioGroup 是完整值字段，支持统一展示，组内选项不重复生成 Cell。尺寸/禁用等原有 Group 继承不受影响。显式 read 的字段不再向内部 Input、日期或搜索框传播 Form 的展示配置；内部编辑器使用受保护的编辑上下文，防止递归生成 Cell/弹窗。

Form.presentation=read 是展示默认值，不是不可覆盖的权限开关：FormItem 或字段可以显式选择 inline/popup 等，做成局部可编辑的详情页。只继承 presentation 的字段保持 read。现有 disabled/readonly 按各自既有规则独立合并；不得以切换 presentation 绕过最终禁用/只读状态。无效的跨端枚举值开发环境诊断并忽略该层覆盖，继续向上找最近的有效值；没有有效配置才使用 inline，不能把继承的 read 降为可编辑。

不引入 mode、appearance、editor.display、editable。这些建议被本版替代。read 固定为 Cell 阅读；popover/popup/dialog 使用 Cell 作为编辑入口；inline 直接显示正常编辑控件。

inline 在两端都是“直接展示编辑态”，不是先阅读、点击编辑按钮再原地变成输入框。若以后需要详情页 hover 编辑按钮加原地切换，应单独评审这种按需编辑能力，不能改变 inline 的定义。

### 组合解析顺序

先继承 presentation → 决定阅读或编辑结构 → 合并 disabled/readonly → 为编辑结构解析面板、搜索和确认策略。read 的优先级高于 open、defaultOpen、needConfirm、clearable、creatable 和搜索配置：不渲染编辑器、不发搜索、不启动校验或保存，不因 open=true 被强制打开。

从编辑切到 read：取消草稿、使异步校验/保存/防抖任务失效、关闭有效面板。受控 open=true 时只请求 update:open(false)，父级拒绝也不能留下可操作的编辑面板，不循环重复通知；再次离开 read 若父值仍为 true，可按新的有效配置重新打开新会话，不能恢复旧草稿。defaultOpen 只在初始化读取，不在模式切换时重新初始化。

read 的 label、业务说明、复制/预览保留；编辑入口、清空、必填星号和交互错误提示默认隐藏。显式 Form.validate 仍校验已提交模型，不把阅读展示等同于业务数据已合法。read 不触发远程搜索，但允许业务独立补齐名称。

## 直接使用和全局配置

以下均为目标 API，当前代码尚未提供。

```vue
<!-- 两端默认都是 inline，不需要额外配置 -->
<mp-form :model="form">
  <mp-form-item field="name" label="名称">
    <mp-input v-model="form.name" />
  </mp-form-item>
  <mp-form-item field="deviceIds" label="设备">
    <mp-select v-model="form.deviceIds" :options="devices" multiple filterable />
  </mp-form-item>
</mp-form>
```

```vue
<!-- 移动端整表使用 Cell 入口，点击 popup 编辑 -->
<mp-form :model="form" presentation="popup">
  <mp-form-item field="name" label="名称">
    <mp-input v-model="form.name" />
  </mp-form-item>
  <mp-form-item field="deviceIds" label="设备" presentation="dialog">
    <mp-select v-model="form.deviceIds" :options="devices" multiple filterable />
  </mp-form-item>
  <mp-form-item field="enabled" label="启用" presentation="inline">
    <mp-switch v-model="form.enabled" />
  </mp-form-item>
</mp-form>
```

```vue
<!-- PC 同样结构：全局可以选 inline、popover、dialog -->
<c-form :model="form" presentation="popover">
  <c-form-item field="deviceId" label="设备">
    <c-select v-model="form.deviceId" :options="devices" filterable />
  </c-form-item>
</c-form>

<!-- 阅读复用同一批字段；不要求重写阅读页面 -->
<mp-form :model="form" presentation="read">
  <mp-form-item field="deviceId" label="设备">
    <mp-select v-model="form.deviceId" :options="devices" />
  </mp-form-item>
</mp-form>

<!-- 字段独立使用，也不需要额外 Edit/FormItem 包装 -->
<mp-select v-model="deviceId" :options="devices" presentation="dialog" />
```

## 职责分配

| 层级 | 唯一职责 | 不负责 |
| --- | --- | --- |
| Form | 模型、全局默认、整表校验与提交、reset、活动会话协调 | 遍历插槽改写子组件 v-model、请求选项接口 |
| FormItem | 字段路径、标签、规则、错误、候选值校验、Cell 行布局 | 再创建一份字段模型、自己实现搜索和字段专属面板 |
| 字段组件 | modelValue/defaultValue、编辑值、选项、搜索、格式化与专属编辑器 | 再渲染外层 label、复制 FormItem 规则引擎 |
| 内部 FieldHost 和会话控制器 | 解析展示方式、阅读区、编辑容器、草稿与一次提交 | 对外增加必须学习的 Edit 组件 |
| FieldDecorator | 正常输入外壳与视觉状态 | Cell 事务、网络保存和规则校验 |

内部 FieldHost 由内置字段接入并复用，维护状态机，不能每个字段复制一份。FormItem 提供上下文，FieldHost 注册当前字段编辑能力及活动会话；FormItem 在 Cell 布局中只显示一份 label，字段只显示值摘要/动作，内部宿主不再套一个带 label 的完整 Cell。

单个受管字段注册后将最终解析的 presentation 回报给 FormItem，布局依据此最终值生成，而不是只看 FormItem 自己的 prop；否则字段显式 inline 覆盖 Form.presentation=read 时会出现错误的容器组合。未注册的自定义内容不推断类型，不保证自动转换。原有 label/labelAttrs、真实输入 id 和阅读/编辑入口的 aria 关联随结构更新，不能保留指向已卸载 input 的 for。

关键实现：Input/Select 等在自己的 onInput/onSelect 到 update:modelValue 之间引入统一会话层。inline 按现有字段语义发布值；popup/popover/dialog 只更新内部草稿，确认后才发原有 update:modelValue。业务 v-model 因而保持原样。不能在 FormItem 外层已经收到值后再“拦截回滚”，也不克隆任意默认插槽 VNode。

内置字段都遵守协议；第三方/自定义控件不会因为放进 FormItem 就自动支持草稿与阅读，可选接入内部适配协议或扩展插槽。扩展能力不是常规开发的必填项。多个独立控件放进一个 FormItem 时必须明确每个值的事务边界，首版不把任意子树自动合成一个批量事务。

## 展示与默认行为

| 模式 | 编辑器 | 入口 | 默认提交 |
| --- | --- | --- | --- |
| inline | 普通字段直接展示；Select 点击展开现有 menu | 字段本身 | 沿用字段原有即时/完成输入语义 |
| Cedar popover | 锚定 Cell 的编辑面板 | PC 编辑按钮 | 确认后提交 |
| Maple popup | 底部弹层编辑面板 | Cell 整行与箭头 | 确认后提交 |
| dialog | 对话框编辑面板 | Cell 编辑动作 | 确认后提交 |
| read | Cell 阅读，不挂载可交互编辑面板 | 无编辑入口 | 不提交 |

PC 可编辑 Cell 默认右侧编辑按钮：hover 或 focus-within 显示，触屏始终显示，预留位置避免内容移动；按钮可以键盘到达。正文可选择复制。移动端显示箭头，整行点击打开。复杂编辑用显式 dialog，不根据数据量自动改变容器。

Maple 支持 inline；此前“移动不允许 inline”的建议取消。用户选择 popup/dialog 后，该 Cell 只在对应弹窗中编辑。日期/颜色等 inline 字段已有的选择面板依然可以存在：inline 表示字段直接可编辑，不意味着所有子控件内容永远内嵌在页面。

不把上述 inline 与 Form.layout='inline' 混淆；后者仍然只是表单排列方式。只读 readonly 保留当前外观并禁止改值；read 是 Cell 阅读展示。disabled 不是详情阅读模式。

## Select 编辑形式与阅读

| 平台与形式 | 对现有实现的关系 | 搜索位置 |
| --- | --- | --- |
| 两端 inline | 复用现有 menu 字段与候选列表 | 字段内 |
| Cedar popover | Cell 入口，面板直接展示候选列表 | 面板顶部 |
| Maple popup | 复用现有 list 的列表内容和底部弹层 | 面板顶部 |
| 两端 dialog | 对话框直接展示候选列表 | 面板顶部 |
| 两端 read | Cell 显示已提交选项名称/摘要 | 无搜索 |

menu/list 不再同时作为一套额外公开模式；目标 presentation 使用上表的新名称。删除 Select presentation=picker，滚轮选择由独立 Picker 承担，现有调用方和示例完整迁移。此变更只针对 Select 的 picker 模式，不删除通用 Picker，也不直接决定日期/时间/Cascader 的专属模式去留。

popover/popup/dialog 打开后就能直接搜索与选择，不在 popup/dialog 内再放一个必须二次打开的 Select。标题、搜索、选项区、已选摘要、计数、错误和操作栏使用同一容器，只有选项区虚拟滚动。

Select 删除公开 needConfirm，由 presentation 决定提交：inline 即选即更新，单选关闭、多选持续选择；popup/popover/dialog 编辑草稿并固定确认。普通值控件 inline 保留原行为，弹层固定确认。日期/时间 inline 保留原有专属确认策略，避免改变默认用法；其 disableConfirm 只控制原有 inline 面板，不能关闭统一编辑层的确认。

FormItem 不是第二个会话所有者。字段内部宿主和 Select 内容共用同一草稿、同一操作栏；日期/时间等同样复用纯面板，不出现“选项确认→字段保存”的两层按钮。底层面板内部临时值由适配器结算后参加这一次提交。

### 确认和打开状态的约束

readonly/disabled/read 无条件禁止写值。beforeCommit 仅对统一编辑层的确认事务有效；inline 不为此自动增加确认按钮，也不逐次输入发保存请求。

open/defaultOpen/update:open 控制字段最外层实际编辑面板：inline Select 是 menu，popover/popup/dialog 是编辑容器，内部列表不再另设公开 open。inline Input 没有面板，不因为 open=true 再生成弹窗。已有 open-change 通知保留，不另加 editing-change 复制同一状态。受控状态只提出更新请求，已提交通知不等于父级接受了 modelValue，更不等于服务器保存成功。

确认事务期间，Cell 摘要始终显示已提交值；面板内显示草稿。外部摘要不出现可立即改模型的清除/移除动作，这些动作移到面板内作用于草稿。inline Select 即选即更新，不提供确认事务；弹层内的增删、清空和选择统一修改草稿。

即时模式清空/移除沿用原字段事件语义；草稿模式下 clear/remove 描述局部动作，不触发真实模型的 change/表单校验，取消后不产生已提交值变更。确认无变化可通知 confirm，但不通知 change；确认期间重复点击只处理一次。

## 搜索 API 和一致规则

保留现有 filterable、filterOption、inputValue/defaultInputValue、searchDelay、search 事件、options、fieldNames、virtualListProps。不再增加 searchable/searchValue/debounce 等同义 API，也不要求为远程搜索额外声明 remote=true。

```vue
<!-- 本地搜索：完整 options 在本地过滤 -->
<mp-select v-model="deviceIds" :options="devices" multiple filterable />

<!-- 远程搜索：业务负责结果，不再次本地过滤 -->
<mp-select
  v-model="deviceIds"
  :options="results"
  multiple
  filterable
  :filter-option="false"
  :loading="loading"
  presentation="dialog"
  @search="searchDevices"
/>
```

同一个字段在全部编辑形式下使用同一查询状态、过滤函数和搜索事件，只改变输入框的位置。普通用法不提供 searchPlacement：inline 固定字段内，其他固定面板内。后续确有需求再评审窄扩展，不提前加入排列组合。

未指定 filterable 时保留两端现有默认：单选 false、多选 true，searchDelay 默认 500ms。filterable=false 且未启用 creatable 时不显示搜索；true 使用本地标签匹配，忽略查询首尾空格、不区分大小写；filterOption 函数可按编号/拼音等字段匹配，false 不本地过滤。兼容已有 filterable.retainInputValue 配置，默认不保留选择后的查询；明确开启时支持连续搜索多选。

搜索清空只清查询，不清选择。查询变化不丢草稿、已选标签和计数；limit 对完整草稿计数，不只统计当前结果。IME 中间输入不发远程查询，searchDelay 只延迟搜索通知，不延迟输入显示。关闭后清理未触发的防抖任务；受控 inputValue 只请求更新，不能改父值。

面板搜索固定在标题下方，不随选项滚走；PC 打开时优先聚焦搜索，移动端默认不自动拉起软键盘。方向键定位、Enter 选择，不穿透为整表提交；IME 确认不保存字段。

creatable 要求有效搜索输入；缺省 filterable 可由 creatable 开启，但显式 filterable=false 与 creatable=true 冲突时诊断并关闭创建能力，不偷偷打开被明确关闭的搜索。创建候选在确认模式先进入本地草稿，即时模式按选择事件直接发布新值；它都不自动创建服务端实体。真正写服务端由业务处理，需要等待保存成功时使用确认模式和 beforeCommit。read 永远不执行创建。

受控查询只影响候选结果，不改变字段模型。搜索框与值展示共用 inline 入口时必须区分二者：输入查询不能把 modelValue 改成查询词；formatLabel/read 插槽不作为过滤 DOM 文本来源。面板内搜索为普通输入组件，由内部上下文固定为 inline，不能继承 Form.presentation 后再次打开 popup/dialog。

## 大量数据和异步选项

本地搜索先过滤完整数据，再生成分组行和虚拟列表，不能只搜索可见项；无结果的分组隐藏，组名/选项间距两端沿用统一规范。虚拟滚动仅减少 DOM，不减少 O(n) 过滤开销；数据量大时评测索引缓存、Worker 或改为服务端搜索，不承诺某个固定数量在所有设备都流畅。

异步完整加载后本地搜索，与远程按词检索、远程分页分开。请求接口、鉴权、分页字段交给业务；可提供可选请求 composable，但组件不接管业务接口。业务请求必须处理取消/序号、旧结果隔离和同键去重；组件不能保证任意外部异步回调写入的 options 都是当前查询结果。

新查询重置分页，旧查询的分页响应不得 append 到新结果。加载更多失败可重试；首次加载、搜索刷新、加载更多、名称补齐、保存分别处理。现有 loading 仍按原契约阻止交互，不能拿它表达仅加载下一页而锁死现有选择；下一页加载使用专属区域/插槽。至少区分未搜索、无选项、无匹配、加载和请求失败，失败不能伪装为空结果。

已提交值、草稿、查询结果、已选项名称信息分别保存。切词/换页不丢标签，ID 不在当前页不代表失效；允许先显示 ID，已选详情异步到达后补名称。名称缓存有限增长、按唯一键合并，不按 label 去重。read 不必打开面板才能回显名称。

## 阅读 API

read 默认直接复用字段自己的格式化：Select 显示选项名称，Cascader 显示路径，日期按 format，颜色为色块和值，Upload 为可预览附件；字符串、数值和布尔值提供默认展示，0/false 不是空值，空值显示“—”。无名称时显示 ID，不把未加载当作空值。

字段提供可选 read 插槽用于业务阅读内容覆盖；普通情况不要求编写。不新增通用 formatValue：Select 继续使用 formatLabel，日期/时间继续使用 format，其他字段复用各自已有格式配置。字段负责从现有 options/format/fieldNames 生成阅读内容，内部可以保留轻量数据控制器，但不隐藏挂载完整编辑器。FormItem 可提供 read 插槽作整项覆盖，不能由两个层级同时渲染正文。

密码/验证码等使用安全掩码阅读，不能通用字符串直出原文；复杂对象需要专用适配，不显示 [object Object]。阅读可以复制/展开/预览，不提供清空、删除等改值操作，不触发交互校验与搜索。

## 会话 校验和提交

统一内部状态：idle/editing/validating/committing。弹层编辑会话打开时复制模型，输入只更新草稿；内置字段不需要业务换成 editor 插槽。直接绑定同一对象的数组项不能绕过会话原地修改，必须采用字段对应的复制/比较策略。

保存顺序：结算尚未完成的输入 → 校验候选值 → 可选 beforeCommit → 核对当前会话与模型版本 → 值确实变化时发一次 update:modelValue/change → 请求关闭。无变化确认仍校验候选值，避免必填空值未经校验就退出；校验通过后只结束会话，不重复发 change 或调用 beforeCommit。beforeCommit 是字段上的可等待控制钩子，默认不配置；只用于需要等待服务器成功才发布值的逐项保存，不能从 @change 的 Promise 返回值猜测保存结果。

beforeCommit(value, { previousValue, signal }) 返回 void/false/Promise；false 拒绝，异常展示保存失败，均保留草稿。候选校验及保存等待期间，编辑区不可交互（包含输入、清空、选项、级联导航与搜索），取消／遮罩／Escape 不结束等待；失败后恢复交互并保留本次草稿。reset 和 disabled／readonly／read 生效仍可关闭弹层并中止旧会话。保存中阻止重复提交；hook 不能提前改绑定模型，服务端规范化值首版由应用在提交通知后显式刷新。

beforeCommit 的完整类型为 `(nextValue, { previousValue, signal }) => void | false | Promise<void | false>`。只在字段上提供，不在 FormItem/Form 再提供同名保存钩子；整表网络请求仍由业务处理 Form 提交。候选校验和发布逻辑必须在相应字段的同一次提交里各执行一次。

FormItem 复用原有规则引擎，提供候选值与候选模型快照校验入口；不能先更新 Form.model、校验失败再回滚。跨字段 validator 要从候选快照取值，旧业务闭包直接读 form 的规则需要明确迁移。字段内部草稿事件不走真实模型的 FormItem change/blur 自动校验，宿主可向 FormItem 请求草稿校验；发布时避免对同一候选重复校验。

候选校验按会话代次和草稿版本保护，输入新草稿后旧异步结果不能覆盖新错误。明确配置 validateTrigger 的 input/change/blur 时，在会话内验证候选快照；确认始终执行最终校验。已提交模型的显式 validate 与草稿提示分开存储，不能清掉另一通道的错误。取消恢复已提交模型的校验展示，而不是把暂存错误带到 Cell；read 隐藏交互错误但不擅自改实际校验结果。

取消/外部点击/遮罩丢弃确认会话草稿；即时模式关闭只关闭。嵌套子菜单的 Escape 先关子面板，下一次再取消父会话。Teleport 子浮层登记为内部区域，不能误触外部取消。校验或保存中阻止普通关闭；reset/卸载仍作废旧任务。前端取消不能保证撤销已在服务器发生的保存、上传或删除。

外部模型变化、read/disabled/readonly 生效、reset、卸载、停用会废弃旧确认会话和异步结果；以外部新值为准，不让旧 Promise 覆盖新状态。名称补齐不是模型变化。控制 open 的父级拒绝关闭时不得重复发布同一次值，独立字段关闭后恢复触发入口焦点。

Form 只协调已经注册的字段会话。整表提交遇到未结束确认会话，阻止业务提交并定位活动字段，不静默提交旧模型，也不自动保存多个字段；validate 默认检查已提交模型，候选校验是会话内部调用。resetField 取消对应会话再重置，clearValidate 不改草稿。

标准场景只需 v-model 和原有 change；高级场景可用 confirm/cancel/draft-change 通知及 beforeCommit 钩子。精确 payload 在实现提案中统一，不新增 editing 双向绑定。open/defaultOpen 继续属于字段面板，FormItem 不另设一个 editing/open 控制相同面板。

## 特殊字段与适用边界

Input/数字/开关/Checkbox/Radio：inline 为原生编辑形态，其他模式由内部宿主在指定面板编辑；Select/日期/时间/颜色：弹层内尽可能使用纯编辑面板。Textarea 和附件可显式 dialog。read 与 Cell 的标题、帮助、错误间距统一由 FormItem 协调。

Upload 草稿只描述待提交附件关系，不能承诺取消可以撤回远程上传或永久删除。验证码发送等命令型动作不属于可复制回滚的字段值，不能机械套入会话。noStyle 和一个 FormItem 内多个独立模型的编辑需要明确适配，不能自动猜测。

首次按库默认和显式配置渲染，避免通过 window 宽度在 SSR 首屏选择不同结构；不在会话中因 resize 自动更换编辑容器。Cedar 与 Maple 的平台专属 presentation 值明确记录；跨端共享业务需要弹层编辑时，在应用平台配置处分别设置 popover/popup，默认 inline 无需分支。不额外增加含糊的 auto 模式。

## 迁移与落地

### 两端 API 复核结论

| 现有或拟新增 API | 复核问题 | 目标处理 |
| --- | --- | --- |
| Form/FormItem | 目前没有本草案的展示继承 | 只新增 presentation，不新增 mode、editor 对象、editing 模型 |
| Cedar Select.presentation=menu | 与公共枚举不同，现有默认会阻断继承 | menu 迁为 inline，字段缺省 undefined |
| Maple Select.presentation=menu/list/picker | 位置与内容/提交耦合 | 迁为 inline/popup/dialog/read，删除 Select picker 模式 |
| Maple Date/DateRange/Time/TimeRange 的 presentation | 已表示日历/时钟/滚轮等面板内容，直接复用会冲突 | 字段 presentation 专用于统一展示；原内容选择迁为字段专属 panelType，保持其原支持集合和默认内容 |
| Cascader.presentation=menu/list/picker | 同样混合字段展示与面板内容 | 字段统一展示枚举；menu/list 迁为 inline/popup，现有滚轮能力如保留则使用 panelType 显式选择，不继续占用 presentation |
| 日期的 type、Time 的 format | 已有数据精度/格式语义 | 保留原义，不拿 type 或 format 表示弹层容器 |
| Date/DateRange/Time/TimeRange.disableConfirm | 原有 inline 面板策略 | 保留 inline 的既有行为；统一编辑弹层中隐藏纯面板工具栏，由外层固定确认一次，不新增 needConfirm |
| Select.formatLabel、日期/时间.format | 新 formatValue 会重复 | 保留已有名称，只增加可选 read 插槽处理特殊内容 |
| filterable、inputValue、filterOption、searchDelay | 已足够覆盖搜索 | 保留，不增加 searchable、query/searchValue、remote、searchPlacement |
| Maple Time/TimeRange.readonly | 当前为普通 Boolean，缺省 false 可能截断继承 | 字段改为可继承的 undefined 缺省，统一状态解析；不修改 readonly 的既定语义 |
| popupProps/triggerProps/pickerProps | 可以透传内部值、状态、工具栏，绕过唯一所有者 | 只允许窄展示配置；模型、确认、open、状态和控制监听器在类型与运行时都过滤 |
| FormItem 的 field、Form.model、字段 v-model | 三者可能被用户绑定到不同数据 | 保留现有明确绑定；Cell 校验按 field 的候选快照，不猜测或改写 v-model。标准一项一字段；错配给诊断，不隐式写另一个值源 |

上述 Date/Time 迁移是统一 presentation 的必要依赖，不是直接删除独立 Picker 或日期/时间面板的滚轮能力。纯面板不继承 Form 的字段展示，也不接收 read；其内容类型由字段适配器转换。panelType 只在确实存在多种内容的字段暴露，不给 Input/Select 无意义地增加同名配置。

日期/时间的 disableConfirm 只属于原有 inline 策略；独立 Picker 保留既有确认 API。字段的统一弹层固定确认，不新增 needConfirm，避免同一层存在两套相反的配置。

现有两端 FormItem 负责字段路径和校验，Maple Select 已有会话控制器，但当前提交策略由 menu/list/picker 决定。实施应先抽内部会话/编辑宿主，再替换公开配置，不能只是给 presentation 枚举重命名。

| 阶段 | 工作 | 验收 |
| --- | --- | --- |
| 1 | 两端 presentation 继承与 Input/Select 内部宿主原型 | 普通 default 插槽和 v-model 不变；默认两端 inline；Maple popup、Cedar popover、两端 dialog |
| 2 | 候选校验、一次确认、read 格式化与 Form 协调 | 草稿不污染模型；取消/失败/reset/外部变化正确；无双工具栏 |
| 3 | 搜索、远程、分页、虚拟列表、ID 回显 | 全部编辑展示使用同一搜索协议；同名 ID 与数量上限正确 |
| 4 | 日期/范围/时间/颜色/Cascader 等适配及迁移 | panelType 与容器分离、单一确认边界；各字段专属边界、类型/文档/Demo/Resolver/同源检查同步 |

Select menu→inline、Maple list→popup；picker 调用迁至 popup 或独立 Picker，新增 dialog。发布前按现行 API 收敛规范直接迁移，不保留旧 presentation 值别名。此前要求 editor 插槽、增加 FormItem 独立 modelValue、独立 EditableField、appearance 的方案全部撤回，字段独立使用仍由原字段 v-model 管理。

必要回归：两端原有普通表单完全不配新属性、Form/Item/字段三级覆盖、read/readonly/disabled、受控拒绝更新、IME、搜索中确认取消、旧请求/旧校验/旧保存、虚拟分组、iframe、键盘与触屏、暗色与 SSR、嵌套 Teleport、上传副作用边界。

首批实现已落地 Form、FormItem、Input、Select（2026-10-19），两端均创建 unify-field-presentation 变更提案。普通默认插槽和 v-model 保持原用法，不要求 editor 插槽；选项数据 API 保持现有名称。现已扩展普通值字段、选项组、Cascader、日期/时间家族和附件，并在 Form 集中演示；Cedar 另含 Color、InputTag、Transfer、TreeSelect、Mention 和 PeopleSelect。

### 首批验收记录（2026-10-19）

- Cedar：受影响组件回归 245 项／35 文件通过；Maple：318 项／44 文件通过。最后补充面板内候选错误提示后，两端各 14 项展示专项重新通过。
- 两端正式 typecheck 通过；Maple 根 lint:check 与 Cedar 修改文件 lint 通过。Input、selection-field、selection-presentations、Form kernel 同源检查通过，样式变量契约通过。
- Form 集中示例覆盖继承、局部覆盖、read、inline 确认开关、200 个设备、本地和模拟远程搜索、ID 名称解析。远程分页／搜索的已选 ID 可通过既有 fallbackOption 补齐名称，不能假定当前搜索页包含所有已选项。
- 浏览器验证两端 inline、dialog、Cedar popover、Maple popup；确认前模型不变、确认后一次写回、read 无编辑入口、异步搜索保留面板；Maple 主文档和手机 iframe 均验证。iframe 空值校验保留弹层并显示错误，修正后可保存。浅色两端面板为白色，Cedar 暗色也已查看。
- 未扩展至其他字段、上传副作用、完整键盘／触屏／SSR 组合矩阵；不将首批验证等同于全部字段迁移完成。

### 首批反馈修复（2026-10-19）

- Dialog 的编辑内容不再叠加面板最小宽度和 Dialog 自身内边距；容器负责限定宽度，面板使用 border-box 并允许收缩。手机 iframe 中 Input／Select 实测 Dialog 与面板均为 280px，scrollWidth 等于 clientWidth，无横向溢出。
- Cedar Popover 等待 opened 后聚焦编辑器，聚焦及焦点返回均使用 preventScroll；浮层首帧即脱离文档流。刷新页面后用实际鼠标分别首次打开 Input 和 Select，页面 scrollY 均保持 1577，输入框／搜索框正常获得焦点。

### 日期范围的视口与草稿（2026-10-19）

Cedar 默认显示连续两个月，外部箭头联动翻月；显式受控 pickerValue 不因打开或选择而被回写，重复月份仅在显示层纠正。Maple 保留单月视图，跨月选择不能清除第一个端点。起点草稿与完整范围分开，只有一个端点时禁用确认；第二端点合法后才能提交。反向选择、exchangeTime 和锁定端点继续服从日期规则，取消恢复已提交模型。内部面板使用独立组件名，避免文档按需解析意外套入公开 Picker，产生第二层确认职责。
