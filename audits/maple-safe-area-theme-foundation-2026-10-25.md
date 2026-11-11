# Maple 安全区与品牌主题基础实施

日期：2026-10-25。基于当前工作区实现；未发布、未提交。

## 已实现

- 新增独立 SafeArea 组件，支持 top/right/bottom/left、局部数值覆盖、显式 0、可关闭的后代消费边界。
- 新增 SafeArea.setInsets(insets, target?)：按目标 DOM 替换四边覆盖，省略边移除覆盖，null 清理。数值为有限非负 CSS px；整份校验通过后才写入，不修改其他样式。SSR 无 document 安全返回。
- App 适配与品牌主题各自管理配置，不把 NIO Bridge SDK 固化到组件库；没有隐式原生事件订阅。
- Popup 增加左右安全区开关；既有顶部/底部开关保留。
- Popup、TabBar、FloatingPanel、Fab、字段编辑弹层统一读取安全区 CSS 变量。Picker、ActionSheet、NumberKeyboard 沿既有 Popup 转发链使用相同配置。
- 安全区消费按真实 DOM 后代生效。body Teleport 独立消费其实际宿主值；inline 或自定义容器继承该容器。既有 safe-area 开关默认值未统一改为开启。
- 字段编辑弹层增加左右安全区，保留原有表单草稿、校验、确认和取消封装。
- 固定 TabBar 占位增加实际边框盒的 ResizeObserver，App inset 更新引起 CSS 高度变化时，不依赖 Vue props 更新或 window resize。
- 新入口已接全量注册、按需 resolver、文档菜单、VSCode 组件入口及构建后的类型/高亮元数据。

## 已补主题入口

- 公共 system font-family：默认 initial 让字体回退保留；Maple 低优先级组件字体消费，Cedar 保留原 body 字体回退。
- 公共 field-caret-color，以及 Input、InputNumber、Textarea 的独立 caret-color，统一默认跟随文字色，可以设置品牌光标而不改文字色。
- Maple 字段圆角默认从系统 md 圆角派生，保留组件级覆盖；默认视觉值仍为 4px。
- Maple Form 标签最小高度、顶部内距、标签/帮助文案行高。
- Picker 选项水平内距、勾选图形尺寸/位置、禁用透明度、外观过渡时长和滚动缓动曲线。不改变手势提交协议。
- 字段编辑层视口高度上限、分隔线宽度、阅读态对齐。
- 公共 Token 同步 Cedar 实现、theme-contract、组件文档及生成的 Token 参考。移动端特有布局仍保留本地 Token。

## 验证

- 538 项相关组件测试通过（52 文件）；覆盖表单事务、输入、Picker、Popup、FloatingPanel、TabBar 与 SafeArea。
- 最后补充的 TabBar CSS 高度观察改动后，SafeArea / TabBar 共 37 项单测再次通过。
- 三项 Chromium 实际 CSS 回归通过：嵌套与 Teleport、横屏宿主与清理、固定 TabBar 占位随原生边距更新。
- Typecheck、lint、spec check、主题契约、三页生成 Token 参考检查通过。
- 全量库构建及最后的 UI 包重建通过；打包检查 0 errors / 0 warnings；生产文档构建通过。
- 1477 个示例 SFC 检查通过。修正了已有 Steps 示例中原生 label 包裹 Select 的点击转发问题，以解除文档构建阻塞。

浏览器测试入口：`pnpm check:safe-area`，已加入 Maple quality 链。测试使用模拟 App 数值和实际 DOM/CSS，不是 iOS/Android 真机或实际 App SDK 验收。

## 文档入口与限制

[SafeArea 安全区与 App 适配](../../maple-design-mobile/packages/ui/src/safe-area/docs/zh-CN.md) 包含覆盖优先级、单位、初始化/订阅/清理归属、已避让容器、四边消费、Teleport/iframe、键盘边界和真机矩阵。

软键盘不是安全区；没有自动将键盘高度计入 bottom，也没有承诺解决所有 WebView 键盘模式。视口固定后代必须使用合适的独立宿主或显式边距，不能假设普通流祖先已为其避让。

后续已通过 Chrome 原生界面采集成功，并新增 Alps / Firefly 亮色主题和完整表单验证。当前交付与剩余边界见 [品牌主题实施报告](maple-brand-themes-2026-10-25.md)；原始品牌字体文件及像素级等价仍不在本次交付范围。
