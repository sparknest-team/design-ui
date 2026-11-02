# HoroUI 与 Maple：完整表单能力及 Alps / Firefly 主题映射

> 最新进展：日期时间与单端点锁定范围已接入 scroll / line；补齐时区切换、整小时／半小时夏令时、重复小时原始时刻保留和跨月范围验证，并修复 Firefly 亮色活动摘要与时间图标的对比度。验收见第 9 节，第 8 节保留上轮基线。

> 最新进展：日历 IANA 时区、多月虚拟滚动、line 周视图及 Popup 全关闭原因异步拦截已补齐，保留原表单字段草稿封装；验收与边界见第 8 节。以下旧结论按采集和实施顺序保留。

> 最新进展：覆盖上传、视频时长、底部弹层头部下拉关闭已补齐，并保留 Maple 表单封装；第 5 节中这三项缺口为实施前记录。实现、边界和四套主题验收见 [本轮实施报告](maple-upload-video-swipe-2026-10-25.md)。

日期：2026-10-25。对象：当前工作区 Maple H5（包含未提交变更），对照 Horo Skyline H5。不是 npm 发布版本验收；不包含微信小程序替代承诺。

本文第 1–3 节保留实施前对比基线；安全区与 Token 已有后续实施。2026-10-25 后续采集成功，Alps / Firefly 亮色主题已经实现；当前映射和验证见第 4 节及 [品牌主题实施报告](maple-brand-themes-2026-10-25.md)。

> 最新选择器、日期时间、上传和弹层实查见第 5 节。第 1–3 节为实施前基线，其中安全区缺口已在后续补齐；Alps / Firefly 现在均有亮暗主题，暗色为 Maple 适配值。

## 结论与证据边界

- Maple 已有大部分通用表单组件及统一字段展示层，不需要按 Horo 的原子组件数量补组件。
- 当前公开上传入口是 Upload 和无 UI 的 useUploader，不存在两个公开上传组件。uploader 目录不是可注册的第二个 Uploader。
- 安全区有 CSS 基础，但缺少检索范围内的统一宿主注入、四边协议与嵌套消费机制；不能称为 App 全面适配。
- 品牌色、常见尺寸、边框、状态有大量现成 Token。存在独立光标色、部分排版和动效入口的缺口，不能声称仅改 Token 即可完全复刻 Horo。
- 初始审计时没有 Alps / Firefly 导出；后续已新增 `Themes.alps.light` / `Themes.firefly.light`，并完成真实样式映射和完整表单浏览器验证。

Horo 证据：本会话已读取介绍、安装、主题覆盖、最佳实践、QA、Bridge、Form、AtomicInput；其余组件以文档导航证明有入口，尚未逐项读取 API。初期浏览器 API 连接超时；后续通过 Chrome 原生界面保存实际页面及 iframe 内品牌样式，采集与验证记录见实施报告。

标记：**已有**＝Maple 源码有对应业务能力；**可组合**＝基础存在但还需业务组合；**需增强**＝已有实现存在明确入口或覆盖不足；**缺失**＝当前检查范围未找到专用实现；**待验证**＝尚无足够证据判断等价。已有不等于已验收 Horo 同款视觉、每项 API 或真机交互。

## 1. 上传入口更正

| 名称 | 当前情况 | 使用方式 |
| --- | --- | --- |
| Upload / MpUpload | src/upload/index.ts、maple-vue.ts 中注册并导出 | 默认上传 UI，包含选择、列表、上传状态和预览等 |
| useUploader | 从 upload/composables/use-uploader 导出 | 不带 UI 的上传逻辑，用于自定义呈现；不是另一个组件 |
| src/uploader/ | 顶层只有 __tests__、docs、example、style 目录；没有 index.ts、props.ts 或组件源文件 | 不作为第二个业务组件计数；是否清理目录需另外核对构建、路由引用 |

Maple Upload 的 props / 文档显示：accept、capture、多文件、数量/大小/总大小限制、beforeRead、beforeUpload、beforeRemove、自定义请求、进度、取消、重试、图片/视频预览、requestChoose 宿主选文件接入点。不能因文件名不同判为缺失，也不能据此推断与 Horo 每种上传规则完全一致。

## 2. 完整表单能力差异表

Horo 证据列：A＝已读 API/正文，D＝仅确认组件导航入口；组合列为场景对应分析，不声称 Horo 必须以该唯一方式组装。

| 场景 | Horo 相关能力 / 证据 | Maple 对应 | 状态 | 具体差异或下一验收项 |
| --- | --- | --- | --- | --- |
| 姓名、普通文本 | AtomicInput、Input、FormItem / A | Input、FieldDecorator、FormItem | 已有 | 标签、占位、清空、错误布局和品牌状态逐一比对 |
| 多行备注 | AtomicInput 的换行 / A | Textarea，autoSize | 已有 | 最大/最小高度、长文本、字数统计、键盘滚动 |
| 密码字段 | PasswordInput / D | InputPassword、Input.Password | 已有 | 可见性切换已有；分格密码、密码键盘等形态待核对 Horo |
| 手机号 | AtomicInput tel / A | Input type=tel、inputAttrs | 已有 | 键盘类型不等于号码格式化和区号选择 |
| 国际区号＋手机号 | AtomicInput 应用场景提到国码/区码组合 / A | InputGroup、Select、Input 可组合 | 可组合 | 尚未找到专用 PhoneInput；搜索区号、格式、完整值模型需要业务约定 |
| 自定义输入格式化 | AtomicInput formatter / formatterTrigger / A | Input 无同名通用格式化协议；InputNumber 有数值场景 | 需增强 | 区分展示与存储值，保留选区与 IME；不能简单 change 后重写字符串 |
| 内容自适应宽度输入 | AtomicInput adaptiveWidth / A | 当前 Input props 未见等价能力 | 缺失 | 缺的是这一专项能力；是否要补取决于目标表单是否使用 |
| 验证码字段 | PasswordInput 是否含该形态待核对 / D | VerificationCode、NumberKeyboard | 已有 | 倒计时和发送验证码服务属于业务；Horo 对应形态待验证 |
| 数字、金额、计数 | Stepper / D | InputNumber、Counter | 已有 | 小数精度、边界、单位、格式化与触控尺寸 |
| 单选、协议多选 | Radio、Checkbox / D | Radio/Checkbox 及 Group | 已有 | required 对 false 的语义需单独比较，不照搬 Horo 的空值定义 |
| 卡片、整行选项 | OptionBox / D | Radio button variant、Checkbox/Radio 插槽 | 可组合 | 尚未证明能直接复刻图文卡片、整行命中及错误布局；先验收再决定增强 |
| 开关字段 | Switch / D | Switch | 已有 | 文案、loading、只读、禁用与品牌状态 |
| 滑块、评分 | Slider、Rate / D | Slider、Rate | 已有 | 范围值、刻度、步长与禁用视觉需核对 |
| 单选、多选列表字段 | PickerTrigger、Select、Popup / D | Select＋统一字段展示层 | 已有 | 搜索、多选、清空已有；确认/取消、草稿、回显和空数据需逐场景验收 |
| 滚轮、联动选择 | AtomicPicker、Picker / D | Picker，支持 cascade、dynamic | 已有 | 原始 Picker 是面板能力；是否需要统一字段包装取决于使用入口 |
| 地址、级联字段 | Cascader / D | Cascader，loadMore、搜索、路径模式 | 已有 | 行政区数据源、编码规范属于业务；异步失败与回显需验收 |
| 搜索选择、远程建议 | Search、Select / D | Search、AutoComplete、Select | 已有 | Horo 的远程 API 未读；不能据目录断言完全同等 |
| 生日、预约日期 | Calendar / D | Date / DatePicker | 已有 | 日期禁用、范围边界、当前日期、日历/滚轮等目标形态核对 |
| 日期范围 | Calendar 的范围能力待核对 / D | DateRange / DateRangePicker | 已有 | 跨月、反序、时间端点、禁用与确认事务 |
| 时间、时间范围 | TimePicker / D | Time、TimeRange 及面板 | 已有 | 十二/二十四小时、时分秒精度、禁用与最小/最大值 |
| 图片与附件上传 | Uploader / D | Upload、useUploader | 已有 | Horo 上传 API 尚未细读；宿主选择已有 requestChoose 扩展入口 |
| 车牌字段 | LicensePlatePicker / D | 未找到专用车牌组件 | 缺失 | 普通/新能源位数、地区/字母键盘、光标编辑和校验需专用设计 |
| 异步字段校验 | Form、FormItem / A | Form、FormItem、validation task | 已有 | 已有竞态作废与错误状态逻辑；本轮未运行竞态测试 |
| 错误定位、重置 | Form exposes / A | validateField、resetFields、clearValidate、scrollToField | 已有 | 校验清理与模型重置分开；API 名称不等价，迁移时显式映射 |
| 编辑、确认、取消 | Horo 相关组合能力尚未全读 | presentation=popup、beforeCommit、草稿隔离 | 已有 | 保留 Maple 统一事务层，不为了主题重写各字段提交逻辑 |
| 详情、纯阅读 | Horo 只读/明细展示入口 / A+D | readPretty、FormDetails | 已有 | 纯阅读与 readonly 是不同模式；按业务页面匹配 |
| 提交反馈 | Toast、Dialog、Notify、Snackbar / D | Message、Dialog、Alert、NoticeBar 等 | 可组合 | 位置、持续时间、可操作消息和焦点行为不是仅按名称映射 |
| 固定提交栏、弹层安全区 | SafeArea、Bridge / A | Popup、TabBar、Picker 等 CSS 安全区 | 需增强 | 见安全区表；尚无统一 App 可用区域协议 |

### 真正优先处理的范围

P1：品牌主题数值采集与对照页面、统一安全区宿主入口、字段光标色与必要布局 Token、基础资料/选择/预约/上传四类完整表单验收。

P2：通用输入格式化；电话区号组合；OptionBox 类卡片选择的便捷封装；车牌字段（若目标业务明确使用则提升为 P1）。

P3：自适应宽度输入及非表单的播放器、分享、瀑布流、地图导航等另列范围。不能把暂未覆盖的非表单能力算成当前表单阻塞，也不能承诺已替代整个 Horo 组件库。

## 3. App 安全区：覆盖与建议

CSS env() 与 App Bridge 解决不同的信息来源。普通浏览器的已知安全边距可直接用 env()；定制 WebView 的宿主可用区可能需要 App 提供。适合 Maple 的方案是组件统一读取安全区变量，浏览器为默认来源，宿主适配层允许显式覆盖；无需在组件核心绑定 NIO 的 Bridge SDK。

| 项目 | 当前证据 | 判断 |
| --- | --- | --- |
| 顶部、底部 CSS 安全区 | Popup 支持 safeAreaInsetTop/Bottom；TabBar、Fab、FloatingPanel 等使用 env | 已有基础 |
| Picker / ActionSheet / NumberKeyboard | safeArea 转发 Popup 的底部安全区 | 已有，但 Boolean 为显式开启入口，不能认定所有页面自动开启 |
| 统一字段编辑弹层 | style.less 内为面板底部加基础 padding＋env(bottom) | 已有局部处理，无统一关闭/宿主覆盖协议 |
| 横屏左右边距 | 检索未见统一 left/right 安全区消费 | 需增强 |
| App Bridge 注入 | 当前检索未找到统一宿主安全区适配 | 缺失的集成能力 |
| 宿主已预留空间 | 未找到 consumed / effective inset 协议 | 需增强，防止重复留白 |
| 嵌套弹层 | 多处独立读取 env | 存在重复补偿的可能；未复现，不能记为已确认 bug |
| 软键盘 | trigger 定位读取 visualViewport，resize 工具有相关监听 | 部分基础，不能证明表单键盘避让全面；安全区与键盘几何需分别处理 |
| viewport-fit | 文档站两个 HTML 入口均含 cover | 只证明文档站入口；业务产品需自行核对 |
| 真机、横屏、App 内嵌 | 本轮没有运行 | 待验证 |

建议引入统一四边有效 inset，明确单位与相对于 WebView 内容视口的坐标语义；优先级为显式宿主覆盖（包括有效的 0）→浏览器 env 回退。不能简单相加 CSS 值与 App 值，不能把 0 当作“未提供”。容器声明已消费的边距后，后代按剩余需要留白；Teleport 后以真实宿主为准。键盘策略独立控制，避免把安全区与键盘高度重复相加。

建议场景：浏览器/App 各自无刘海与有刘海、横屏、宿主已避让/沉浸式、嵌套 Popup、底部固定提交栏、键盘开关、页面恢复、宿主数据更新、body 与自定义弹层容器。

参考：[MDN env()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) 描述 safe-area-inset 四边和独立 keyboard-inset 变量。上面的统一协议是针对 Maple 现有结构的设计建议，不是当前已实现 API。

## 4. Alps / Firefly 主题映射表

已从已登录文档实际加载的 `docs-token-style` 提取并离线计算；来源参数 `fy` 对外映射为 `Themes.firefly.light`。仅实现有实采依据的亮色；暗色 class 在本次快照中没有完整的深色底色板，不推测品牌暗色。逐 Token 来源、计算值与 CSS 哈希见 [采集证据](evidence/horo-brand-tokens-2026-10-25.json)。

| 角色 | Alps 实采值 | Firefly 实采值 | Maple 实现 |
| --- | --- | --- | --- |
| 主按钮背景/文字 | #090C1A / #FFF | #EAFF68 / #17224B | action-primary + Button 成对颜色 |
| 按下背景 | #393C48 | #CFDF26 | 主按钮状态层，active opacity 1 |
| 正文/次要文本 | #090C1A / #6B6D78 | #17224B / 60% 深蓝 | system content + 兼容基础颜色角色 |
| 输入背景 | transparent | rgba(23,34,75,.04) | 新增公开 outline-background，同时映射 filled |
| 输入圆角 | 0px | 24px | field-border-radius |
| 聚焦边框 | #090C1A | #9A89EB | 独立 focus-border，保留 Maple variant |
| 光标 | #DA2C00 | #CFC7FF | field-caret-color → 三类原生输入 |
| 选择控件 | 橙色 #FF3D00 | Checkbox/Radio #CFC7FF；Switch #B6A8FB | 各组件独立 checked/active 色，未用主按钮颜色替代 |
| Checkbox 圆角 | 999px | 8px | 新增公开 control-border-radius |
| iOS 式 Switch | 44×24，20px 滑块 | 44×24，20px 滑块 | width / height / handle-size |
| 成功背景/文字 | #3886EF / #3886EF | #5AE985 / #2DD865 | 分别映射 status 和 content，不假定成功都用绿 |
| 警告背景/文字 | #EE8D2D / #EE8D2D | #FFB72A / #F5A201 | 分别映射前景背景 |
| 错误背景/文字 | #F45552 / #F45552 | #FF735B / #FD5940 | 保留边框与帮助文案不同色角色 |
| 遮罩 | rgba(0,0,0,.3) | rgba(0,0,0,.36) | system scrim；body 弹层继承根主题 |
| 基础圆角 s/m/l | 4/8/12px | 12/24/32px | system shape；字段独立映射 |
| 品牌字体 | ALPSSans-Regular | Pyro QiHei | system font-family，文件由宿主授权加载 |
| 字段结构/触摸高度 | 原子文字 24px + 外层留白 | 内部 48px | Maple 保留五档尺寸、标签封装，md 48px |
| 上传/日期/时间/级联/弹层 | 沿上述语义及各组件 Token 继承 | 沿上述语义及各组件 Token 继承 | 已放入同一完整表单；结构及专用插画不宣称等价 |
| 安全区 | 运行时宿主数据 | 运行时宿主数据 | SafeArea 四边协议，不写入品牌常量 |

独立字体、光标、标签排版、滚轮样式、安全区等前次明确缺口已经补齐；这次新增 outline 背景和 Checkbox 圆角，Cedar 的同名契约也已同步。具体覆盖优先级及 App 入口见 [SafeArea 文档](../../maple-design-mobile/packages/maple-ui/src/safe-area/docs/zh-CN.md)。

### Token 不能独自完成的内容

1. 交互：草稿、校验、确认、取消、选择方式、请求及焦点恢复由逻辑决定。
2. 结构：label 上下/左右布局、卡片内容顺序、弹层操作区位置需要 props、插槽或有明确边界的呈现变体。
3. 资源：品牌字体、图标路径、插画和加载图形需要实际资源或现有插槽，不能靠颜色值代替。
4. 作用域：根上声明的组件别名在继承时已经解析。局部覆盖 system 不保证重算根组件别名；Teleport 也不继承调用处的局部变量。全局品牌切换先走现有根主题入口；局部品牌方案必须另验真实挂载宿主。

因此当前回答是：**支持搭建两套主题的基础充足，但尚不能证明完整覆盖；已确认有需补的定制入口，并缺少品牌实际值和视觉验收。**

## 5. 完整表单验收页面

| 页面 | 字段与交互 | 需覆盖的结果 |
| --- | --- | --- |
| 基础资料 | 姓名、区号手机、密码、备注、协议 | 标签/占位/错误/禁用/只读/纯阅读；IME、清空、长文案、格式化 |
| 选配与地址 | 单选、多选、卡片选项、搜索、级联、滚轮 | 选中回显、空候选、异步加载、草稿确认/取消、非法候选 |
| 预约 | 日期、日期范围、时间、时间范围 | 禁用边界、跨月、反序、精度、单层确认，不重复写回 |
| 材料提交 | 图片、附件、预览、删除、重试、固定提交栏 | 上传中/失败/成功、异步删除、只读、宿主文件选择、键盘与安全区 |
| 车辆资料（按需） | 普通/新能源车牌 | 位数、键盘、错误定位与表单模型集成 |

每页以 Alps light/dark、Firefly light/dark 对比；同一数据与状态，记录视觉差异和实际行为。源码检查、现有测试文件或 Token 数量不能替代这一步。

## 6. 本地证据索引

- 上传注册：maple-design-mobile/packages/maple-ui/src/maple-vue.ts、src/index.ts、src/upload/index.ts。
- 上传 API：src/upload/props.ts、interfaces.ts、docs/zh-CN.md。
- 密码与分组：src/input/index.ts、props.ts、InputPassword.vue。
- 字段事务：src/_components/field-presentation/context.ts、with-field-presentation.ts、EditorPanel.vue。
- 表单：src/form/Form.vue、FormItem.vue、form-controller.ts。
- 主题：src/themes/index.ts、maple-light/index.ts、maple-dark/index.ts；src/style/theme/system.less。
- 组件 Token：src/field-decorator/style/token.less、src/form/style/token.less、src/input/style/token.less、src/button/style/token.less、src/picker/style/token.less 等。
- 安全区：src/popup/style/popup.less、src/picker/Picker.vue、src/action-sheet/ActionSheet.vue、src/number-keyboard/NumberKeyboard.vue、src/tab-bar/style/tab-bar.less、src/_components/field-presentation/style.less。

本轮仅新增本报告；未修改生产代码、未运行组件测试或真机测试。uploader 目录的来源历史尚未追溯，不将“残留”推断成已确认的迁移过程。

## 7. Horo 参考页面

- [介绍](https://fx.nioint.com/pages/horo-ui/skyline/?token=fy)
- [安装](https://fx.nioint.com/pages/horo-ui/skyline/guides/Install/doc.html?token=fy)
- [主题覆盖](https://fx.nioint.com/pages/horo-ui/skyline/guides/Theme/doc.html?token=fy)
- [Form](https://fx.nioint.com/pages/horo-ui/skyline/components/Form/doc.html?token=fy)
- [AtomicInput](https://fx.nioint.com/pages/horo-ui/skyline/components/AtomicInput/doc.html?token=fy)
- [Bridge](https://fx.nioint.com/pages/horo-ui/skyline/guides/bridge/doc.html?token=fy)
- [QA](https://fx.nioint.com/pages/horo-ui/skyline/guides/QA/doc.html?token=fy)

## 5. 选择、日期时间、上传、弹层的第二轮实查

本节为 2026-10-25 最新结果，覆盖前文“API 未读”的历史条目。已通过登录态读取 Horo Skyline H5 的 Select、Calendar、TimePicker、Uploader、Popup 文档，并将真实品牌 CSS 与 Maple 消费路径对照。来源与文档哈希见 [组件证据](evidence/horo-form-components-2026-10-25.json)，颜色映射见 [Token 证据](evidence/horo-brand-tokens-2026-10-25.json)。这次没有私库源代码审查，也没有将下载的私有 JS/CSS 整包提交仓库。

| 场景 | Maple 已有能力 | 本轮补齐 | 仍不能直接等价的部分 |
| --- | --- | --- | --- |
| Select 列表选择 | 单/多选、禁用、搜索/远程、选项插槽、字段草稿与确认取消 | 完整表单增加禁用城市，验证弹层草稿；保留 Form 封装 | Horo Select 是列表 + ActionSheet，Maple 可使用字段编辑弹层，但默认结构、底部按钮位置不同；Horo `overMaxHandle=continue` 与 Maple 硬上限不能直接互换 |
| Calendar | 单/多选/范围、最小最大日期、禁用、月年面板、范围预览 | 新增独立选中背景/文字、当前项色；Alps 橙色和 Firefly 浅紫色不再误用主按钮色；修复日面板未透传显式 color | Horo `interactiveMode=scroll/line`、多月虚拟滚动、`timeZone`/已偏移日期协议，当前 Maple 无对应实现。业务跨时区需先定值协议，不能仅换 Token |
| TimePicker | 时分秒、最小最大、步长、禁用规则、12 小时、草稿提交 | 滚轮选中/未选中颜色分离；表单限制 09:00–18:00、15 分钟档 | Horo filter/formatter/option 插槽与 Maple step/disabled/format 不是同一协议；自定义每行内容不能仅靠显示格式获得 |
| 上传状态 | ready/reading/uploading/success/error/canceled、进度、取消、重试、删除、异步钩子、数量/大小/总大小限制、自定义请求 | 卡片 108px；圆角 Alps 8px / Firefly 24px；上传背景、进度辅助色、错误色实采映射；完整表单可切换成功/失败重试/慢速取消及三种布局 | Horo `reupload` 覆盖替换、视频时长角标/播放器参数、columns + ratioOnColumn 的响应式网格，没有直接同名能力；默认附件操作与 Horo 缩略图状态遮罩的结构不同 |
| Popup / 编辑弹层 | 五方向、挂载容器、遮罩/滚动锁、Esc、路由关闭、四边安全区，字段提交拦截 | 在四套主题下验证选择/日期时间单次确认、关闭不写回；继续验证横屏四边 inset | Horo 原生 Popup 的异步 `beforeClose`、ActionSheet 头部下拉关闭、内置四角关闭按钮及 displacement/distance 优先级协议，不等同于 Maple 基础 Popup；字段 `beforeCommit` 只拦截保存，不拦截所有关闭原因 |
| App 桥接 | requestChoose、自定义请求、显式 inset 宿主接口 | 本地模拟与浏览器验证不发业务请求 | 相机/相册压缩、品牌 Loading 图形、品牌字体文件、真机键盘/手势/原生返回仍需宿主资源与真机验收；Horo 小程序 sizeType 不属于 H5 主题能力 |

### 新增的可覆盖样式角色

- `--mp-date-calendar-selected-background`、`--mp-date-calendar-selected-color`、`--mp-date-calendar-today-color`：日/月/年面板共用，确认按钮不受影响。显式 color 仍可覆盖背景及当前项颜色。
- `--mp-picker-option-active-text-color`：滚轮当前有效项；禁用项保持禁用语义。默认回退原 option-text-color，其他主题外观保持原逻辑。
- 上传使用原有公开 Token，没有增加一套业务上传组件。108px 和圆角来自 Horo；操作布局保留 Maple。
- 新增日历/滚轮角色已登记为 Maple 平台扩展，Cedar 没有同构的滚轮及日/月/年 Button 面板，不向 PC 注入无消费者的变量。上传共用变量没有改默认值。

亮色映射有实采证据；Alps / Firefly 暗色继续是 Maple 适配版。实现与测试均不能证明私库所有版本、所有端完整等价。

### 本轮验证记录

- 定向 Vitest：日期范围、编辑器操作归属、滚轮、主题 32 项通过；另有 Select 搜索示例 1 项、大小写候选/插槽过滤 4 项通过，共 37 项。
- 浏览器源代码集成 10 项通过：两套亮色原始映射、四套主题安全区与横屏、四套主题选择器禁用及草稿取消、日期时间草稿提交、上传失败重试/取消/5MB 限制。
- 构建产物浏览器检查 4 项通过：Alps / Firefly 亮暗文档路由、主题切换和完整表单通过 Resolver 加载。
- 两套 vue-tsc 配置的全量类型检查通过。公开 Token 契约、三份生成 Token 目录、90 个组件规范检查通过；本轮改动及上述 Select 测试的定向 lint 和 diff 空白检查通过。
- UI 库构建成功；文档 1481 个示例 SFC 检查通过，Vite 生产构建成功，本地 5500 返回 200。
- 日历实际截图：[Alps 暗色](evidence/alps-dark-calendar-2026-10-25.png)、[Firefly 亮色](evidence/firefly-light-calendar-2026-10-25.png)。

构建期间另一个工作区变更新增的 Select/Cascader 文档用了错误的 `./example` 相对路径，已改为 `../example`；Select 搜索示例测试补充调用前的函数类型收窄，插槽选项测试补充 HTMLElement 查询类型。保留其原有功能实现与业务案例。
## 8. 日历视图与异步关闭实施验收

2026-10-25 本轮完成：

- Date / DateRange / 面板新增 `timeZone`，Date 与时间戳表示真实时刻，字符串表示目标 IANA 时区的当地时间。手输、min/max、禁用规则、快捷项与事件共用协议；夏令时跳过的时间拒绝，重复时间取第一次，非法时区禁止提交。公共日期协议同步 Cedar，未设置时保留原本地时区行为。
- Maple 日精度新增 `interactiveMode="scroll" | "line"`，默认仍为 `page`。scroll 默认虚拟化，百年 1200 个月范围仅渲染视口附近月份；line 按周显示和导航。单选、多选、普通范围复用原选择事务，导航不提交模型。showTime、非日精度以及锁定单端点范围保留原面板。月份固定六周且等高，布局 Token 已登记并更新目录。
- Popup `closeGuard(reason, { signal, event })` 统一覆盖 overlay / escape / route / swipe / close / api / model。等待时保留焦点与滚动锁并去重；拒绝、报错保持可见；过期异步结果被取消。插槽提供 close / pending，实例提供 close / requestClose；ActionSheet 透传守卫。受控外部关闭被拒绝后发送 update:open(true)。父级直接销毁组件不能等待组件内守卫，须事先 await requestClose。
- 完整表单增加模式、时区与异步关闭控制。跨时区预约保留同一时间戳，验证上海和纽约跨日展示；业务验证弹层逐一覆盖七种关闭入口，并保留拒绝后的输入草稿。原字段编辑仍使用现有取消／确认和 beforeCommit。

验证结果：Maple 日期、范围、Popup、Dialog、ActionSheet 等 74 个文件共 642 项通过；最终受控滚动调整后相关 16 项再次通过。Cedar 日期协议 27 项通过。源码完整表单 18 项通过，四套主题新增场景最终复核 4 项通过（为前述 18 项的子集）；生产文档 4 项通过，实际选择 line 日期并验证异步拒绝保留草稿。两端类型、定向 lint、90 组件规范、共享 Token 契约和 3 份目录检查通过，库与文档构建成功，本地 5500 返回 200。

截图在 Maple `artifacts/brand-form/{alps,firefly}-{light,dark}-line-production.png` 与对应 `-production.png`。亮色继续使用前轮 Horo 实采角色，暗色属于 Maple 适配值。本轮没有取得私有源码，不意味着所有 Horo API、App Bridge 或视频播放器业务参数已等价。
## 9. 日期时间与范围完整场景验收

2026-10-25 本轮完成：

- scroll / line 日历复用原日期时间快捷滚轮、详细时间滚轮和范围摘要；范围通过摘要选择端点，锁定开始／结束时只编辑另一端，双端锁定禁止打开编辑器。普通日期范围也使用同一端点控制。跨月浏览不写模型，取消保留原值，确认才提交，反序范围继续由现有反馈和校验处理。
- Date／timestamp 在时区切换中保持真实时刻。日历桥接保留未改动端点的原值，修复秋季第二次重复小时及未显示毫秒被重新解析的问题；改变另一端不会改变锁定端点。新的当地时间仍按既有规则取第一次重复小时，字符串不能表达发生次数。
- 修复仅跳过半小时的地区把整个小时禁用的问题；例如 Lord Howe 的 02:00–02:29 不可选，02:30 继续可选。范围比较真实时间戳，交换日期但保留时间时重新解析目标日期的时区偏移。共用逻辑同步 Cedar。时区解析缓存有界，不改变全局默认时区。
- 完整表单新增跨月行程、纽约春季跳时、秋季重复时间（含第二次 01:30）和半小时夏令时预设，以及端点锁定开关。现有 Form／字段草稿、beforeCommit、确认和取消封装继续持有事务，未增加第二套表单状态管理。清空日期后真实时刻说明正常显示空态。
- 视觉核对修复 Firefly 亮色的黄色活动摘要／时钟图标低对比问题。复用已有 temporal 活动前景角色，亮色使用 content-primary；暗色继续使用适配的活动前景。生产浏览器对四套主题分别断言活动摘要对比度至少 4.5、时间编辑图标至少 3。这两项亮色覆盖属于 Maple 可读性适配，不声称是 Horo 实采值，已在品牌采集证据 notes 中注明。

验证：Maple 日期／范围／表单回归 585 项通过；最终补充用例中另有 2 项日期范围锁定用例通过，共 587 项唯一单测。Cedar 日期协议 30 项通过。源码完整表单 22 项、最终生产文档 4 项浏览器用例通过，覆盖 Alps／Firefly 亮暗四套主题；产物测试实际操作清空日期、锁定第二次重复小时、修改另一端、确认提交及对比度校验。两端类型、定向 lint、90 组件规范、共享 Token 契约、3 份 Token 目录与最终库／文档构建通过。

最终范围截图位于 Maple `artifacts/brand-form/{alps,firefly}-{light,dark}-datetime-range-production.png`。本地入口为 `http://127.0.0.1:5500/?preview=datetime-range-dst#/zh-CN/themes`。这轮覆盖已知日期时间与范围缺口，仍不代表所有私有 Horo API 或 App Bridge 已等价。
