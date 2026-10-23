# 第十六批：日期语言与周起始实例隔离

## 完成

- 两库各自维护 date-locale.ts，通过类型化私有 Symbol/InjectionKey 传递现有全局 Locale/Provider 和实例 dayStartOfWeek；不增加 locale 组件 Prop，不共享运行时、实例或 platform 配置。
- 日期语言数据仅注册到 c/mp 命名空间的 Dayjs locale；不切换宿主默认语言，不覆盖基础语言对象。en-US 匹配 en，未知未加载语言安全回退英文。
- DateField/DatePanel 统一作用域解析、展示与通知；DatePanel 为本地周标签渲染器提供响应式上下文。
- 删除 Cedar initializeDateLocale 及两个渲染器的全局 watchEffect；周比较改为按实例起始日比较实际日期，避免不同年份的同周号误判。
- 明确模型与界面文本协议：valueFormat 固定英文日期数据，format 显示/手输使用界面语言；切换语言不会改写或使英文月份名称模型失效。默认数字格式、Date/时间戳不变。
- 独立复制语言模块与五项核心测试，日期复制门禁由 37 对增加至 39 对。新增真实 Cedar 双面板更新/卸载测试及两端语言切换/手输所有者测试。
- 新增 Cedar 多实例周起始/月份协议 Demo，Maple 中英文模型/展示分离 Demo，右侧集合、文档、调研及菜单同步；Cedar OpenSpec 与两端 major changeset 完成。

## 验证

- Cedar 日期逻辑/DOM 21 文件 92 项通过；独立 SSR 4 项通过，共 96 项，两个进程正常退出。
- Maple 日期族 24 文件 132 项通过，含 SSR；无跳过、无更新快照。
- 两端源码 typecheck、Cedar 受影响 ESLint、Maple 全库 lint:check 通过。
- 两端 build:lib 与发布消费者 typecheck:contracts 通过。
- Maple 996 份 Demo SFC 与 Cedar 新增 Demo 编译通过。
- 39 对源码/测试复制门禁、71 族调研/菜单校验、两库公开导出与 Token 目录检查通过，API 清单 129 Cedar / 119 Maple / 97 共同导出。
- 发布样式图 Cedar 96 入口/98 Less、Maple 91/93 通过；无环/缺失或内嵌重复基础样式，源码/发布消费者 foundation 和 Loading 均只加载一次。本批不增加 CSS Token。
- 本批路径 git diff --check 通过；未做生产整站文档构建或真实浏览器视觉/触屏验收。

## 下一批

继续审计日期手输的默认周/季度展示格式。第十七批直接复验后纠正初步判断：两库当前 Dayjs 可严格解析 YYYY-[Q]Q，实际缺陷仅为 gggg-wo；季度追加回归测试，不另造重复解析器。需要周展示协议反解析和回写模型测试，不能将展示标签当作 valueFormat 字符串处理。Maple 不新增没有渲染分支的周/季度空 API。

继续保持双库独立维护、先一端再复制；截止北京时间 2026-10-13 14:00，不提交、推送、发布。71 族状态数量不变，不宣称日期主体/外观全部同源。
