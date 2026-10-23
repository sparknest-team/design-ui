# 第二批：输入基础、滑动选择、列表

## 依赖顺序与范围

Input/Textarea 为输入依赖层；Slider 和 List 由独立工作单元并行改造，各自验证后由主批次集成。主批次同时统一 Rate 公开 Token，并检查 Search/AutoComplete 等 Input 调用方。没有共享运行时、跨库 import、platform 配置或旧 API 兼容别名。

## 已完成内容

- Input：现有主体原已独立同源，修正滞后的调研描述；统一输入/清空事件顺序、受控拒绝后的原生值恢复，补公开类型和回归。
- Textarea：以 Cedar 完善后复制到 Maple，统一 hint/line/颜色、原生 attrs、IME、清空、计数与自动高度生命周期；本地 resize 默认值和尺寸密度独立登记。
- Slider：统一 Pointer/键盘、受控/范围/步长、marks/ticks/InputNumber，补双方能力；showTooltip 三态替换 labelVisible，直接迁移调用方。
- List：主体、ListItem、公开类型、34 个 Token 与样式规则同源；Maple 补滚动/虚拟化。修复两端 VirtualList align、缩小数据空白及 threshold 索引/padding。
- Rate：15 个公开 Token 后缀同名同义，私有映射在组件根解析以支持局部定制；默认几何/颜色差异登记，错误与禁用使用语义色。
- Search/AutoComplete：适配 Input 的统一事件管线，清空只更新一次、不会自动搜索或重新展开；AutoComplete 普通输入先 input、再 update:modelValue、再 search，候选选择协议不变。

## 集成验收

- Input/Textarea：Cedar 101、Maple 106 项定向测试通过（含关联 InputNumber）；24 对主体/API/类型/样式/测试/Demo 门禁通过。公开类型采用保留 TS 声明的 AST 比较，不通过擦除类型制造一致。
- Slider：每端 22 项通过；7 对源/样式、交互测试对、3 对 Demo 与实际 Less 编译通过。
- List：Cedar List 26 项、Maple 19 项通过，Cedar Select 26 项依赖回归通过；9 对主体/公开类型/样式/测试/Demo 与 34 项 Token 后缀门禁通过。
- Rate：Cedar 22、Maple 39 项通过；Props/类型、主体、4 对样式入口/规则/映射和 2 对 Demo 检查通过。
- Search/AutoComplete：Cedar 53、Maple 60 项通过，含 trim、父级接受/拒绝、连续清空/候选请求、键盘清空归焦、Form 单通知。日期/时间、Select、分页、验证码、Transfer/Mention/ColorPicker 等相关调用方也已回归。
- Maple 主题 30 项、Popup 16 项通过。Badge 主题断言改为检验实际组件默认值与主题覆盖合成后的语义，而非要求冗余覆盖必须存在。
- 两端类型检查、完整 Lint 通过。Maple 首轮 Lint 的 9 处在途格式/curly 问题已修复，最终复跑通过。
- 928 个 Maple Demo SFC 编译，0 失败。未在本批最终源码上重跑整站生产文档构建；独立文档任务曾在较早的 915 Demo 快照完成生产构建，不混记为本批最终验证。
- 两端 build:lib 成功。新增 `node design-ui/bin/input-batch-ssr-check.mjs`：两端 7 个入口及 Maple Popup 的裸 ESM/CJS 导入与双实例 SSR 全通过，输入标签 ID 独立且输出无 NaN/对象字符串。
- 发布导入检查发现 Maple Popup 主体运行时引入样式，导致 Search 的 Node 裸导入失败；移除该副作用，由既有 popup/style 与 Search 样式依赖继续负责 CSS。重新构建 Maple 后验证通过，不添加 CSS loader 掩盖问题。
- 最终源码/发布样式门禁通过：Cedar 96 入口/98 Less 模块，Maple 91/93；源与 ESM 消费场景 foundation/Loading 均只有一次，没有依赖循环。
- Token 全量消费复核：142 文件、4049 声明，0 待审、0 编译错误。14 项原待审是迁移后失效的 Cedar 私有尺寸声明；核实动态 mixin 无调用后删除旧尺寸 mixin/15 私有声明，ColorPicker 剩余引用改读同值公开字号，InputTag 直接调用现有原生样式 mixin。InputTag 80 个尺寸/焦点/禁用样式场景通过。
- 主题契约：45 组件、985 统一组件值、259 登记的平台组件值；Token 参考页 3 页同步通过。Props 盘点为 127 Cedar / 119 Maple / 95 共享组件条目。
- 菜单/调研由统一 inventory 同步；三仓库 diff --check 通过。被替换的旧主体、私有样式及旧 API 不保留兼容分支，已跟踪历史可从 Git 恢复。

真实浏览器工具连接超时，不以编译/单测冒充视觉验收。另一个独立 Token 验收任务报告 Rate 局部变量覆盖已实测；不将该范围扩大为本批全部组件视觉通过。

## 最新清单与下一批

71 组：53 已同源、12 逻辑已同源、2 待适配、3 逻辑待同源、1 独立。明确待推进由 9 组减为 5 组：VerificationCode、Search、Tabs、Carousel、Upload。

建议依赖顺序：先 VerificationCode 与 Search 的主体/API 补齐，再 Tabs/Carousel，最后 Upload 请求管线。12 组逻辑已同源（模态、日期时间及表单等）仍保留已登记平台展示边界，不能把“剩 5 组”解释为其余整目录完全相同。
