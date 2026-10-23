# Search 控制逻辑同源进度

## 结论

可升级为 **logicSame（逻辑已同源）**，不标整组件 same。Cedar 完善后独立复制：
- use-search-control.ts：值、字段、不可变 model、事件、历史、结果、生命周期。
- props.ts：API 集合一致，historyPopup / shape 默认值独立。
- types.ts / result.ts：公开 Props / Emits / Slots / Expose / Field / Result。
- HistoryContent.vue / FieldSelect.vue：全屏历史内容与内部字段选择器。
- 配对控制器测试、字段模型与历史展示 Demo。

没有跨库运行时引用、共享实例或 platform 配置。PC InputGroup 和移动搜索条仍使用本地布局；history-presentation 分别连接本地 Drawer/Popup。use-search-locale 接入两端现有全局多语言。field-form-boundary 隔离内部 Select 的 Form 事件，外层程序更新通知一次 Form change，Input 原生编辑不二次通知。Maple 不再关闭输入边线/强制透明输入背景；三种 variant 沿用 FieldDecorator 实际绘制，field 最小高度保留触控密度并允许大尺寸撑开。

## 行为协议

modelValue > model[currentField] > 本地 defaultValue。不变异传入 model，每次提议新对象，清空声明字段并保留额外属性。搜索 nextTick 后只读取已接受的受控值。取消/字段/历史各提交一次 change / Form change；取消等待接受模型后 blur，避免未提交输入旧值二次 change。内外取消一致，公开 focus / blur 操作实际活跃 Input。inputAttrs / error 同时作用外侧与全屏输入。

## 验证

- search-core-check.mjs 保留 TypeScript 类型的 AST 对比、SFC 模板编译比对、公共 token 后缀一致与 Less 编译。
- 定向测试覆盖冻结模型、拒绝值/字段、外部替换、历史规范化、Form 继承、KeepAlive/卸载、程序 Form 通知、弹层焦点、取消、原生属性与 error。
- 主代理补充全局语言切换及 Transfer 消费回归。
- 两端局部 lint 与 diff check；最后执行数量在下方完成记录同步。
- 自动测试不等同于实际浏览器像素验收，本轮不声称外观完全一致。

## 公共 Token

25 个同名后缀，见两端 style/token.less。语义色直读本地 sys surface-default/muted、content-primary/secondary、border-default。条高度、字段高度、外层 padding、字段 padding、图标尺寸为端侧默认密度差异。主按钮 status/variant 文本色由 Button 自身控制，Search action 文字 token 只用于操作按钮。

Maple 旧后缀直接迁移，不保留 alias：
- height → size-min-height
- padding → spacing-padding
- background → color-bg
- field-height → field-size-min-height
- field-padding → field-spacing-padding
- field-background → field-color-bg
- label-color → label-color-text
- label-margin-right → label-spacing-inline-end
- action-color → action-color-text
- action-margin-left → action-spacing-inline-start
- icon-color → color-icon
- history-padding → history-spacing-padding
- history-item-height → history-item-size-min-height
- history-item-color → history-item-color-text
- history-item-border-color → history-item-color-border

Cedar 原有 color-icon / size-icon 得到定义和真实消费者。按需样式入口补齐真实 button/select/icon/loading/Drawer 或 Popup 依赖。

## 集成边界

全局 inventory / theme-contract / 根类型与生成文档由主代理更新。Cedar README.en-US.md 提供英文协议与演示；Maple zh-CN / en-US 与右侧演示入口同步。

## 完成记录

2026-10-09：Cedar Search 30/30，Maple Search 36/36；包含主代理新增全局 Locale 测试。两端 default snapshot 随脚本 setup / 输入真实 outline 外观更新。search-core-check 验证 9 对文件、25 个公共 token，Less 编译通过；组件 diff check 通过。运行时已冻结，由主代理执行两库集成构建。
