# 第三批：验证码、搜索框与 Tabs 收尾

## 范围与依赖

在已完成的 Input / FieldDecorator / Select / DropdownMenu / Drawer / Popup 基础上，并行处理 VerificationCode 和 Search。只读复核确认 Tabs 六件套已大体同源，因此将旧适配层和验证收尾纳入同批。两端各自保有独立源码，不抽取共享运行时，不引入 platform 配置层，不保留正式发布前的旧 API 别名。

## 组件实施与验收

以下组件主体及专项验收已完成；全库集成单独列出，不将专项通过当作完整生产保证。

| 组件族 | 本批目标 | 状态 |
| --- | --- | --- |
| VerificationCode | 两端独立复制主体、API、样式及 Demo；受控、短信/粘贴、IME、Form、焦点及 KeepAlive | 已同源；Cedar 22 / Maple 27 项通过，11 对源码门禁 |
| Search | 统一字段、模型、历史、Form 和搜索控制；本地浮层视图、全局语言与实际输入外观 | 逻辑已同源；Cedar 30 / Maple 36 项通过，9 对源码门禁 |
| Tabs 六件套 | 清理 platform 和无消费者绑定；公开类型、配置/受控/生命周期与 InfiniteScroll 联动 | 已同源；Cedar 57 / Maple 56 项通过，13 对源码与 40 项 Token 门禁 |

Search 的 `model` 改为不可变更新提议：不直接修改父级对象；`search` 读取父级实际接受的状态。相关测试与示例一并迁移。程序取消、历史选择与字段切换通知 Form 一次，内部字段 Select 隔离重复通知；内外取消一致，公开 focus/blur 操作活跃输入。inputAttrs/error 同时作用普通与弹窗输入。Maple 移除掩盖 variant 的强制透明/隐藏边线，让三态真实绘制，大尺寸不再被固定高度限制。

默认搜索/取消与浮层可访问名称接入两库现有全局 Locale；不创建组件局部词典。Cedar 增补中英键并支持 ConfigProvider 覆盖；Maple 对既有语言包补键，zh-HK 继续复用繁中。独立切换测试 Cedar 2 / Maple 1 项通过（已计入 Search 数量）；Cedar Transfer 10 项消费回归及 Maple Locale/LocaleProvider 5 项通过。

验证码独立复核额外修复已填格末尾键入及 IME 提交误改邻格；真实 InputEvent/CompositionEvent 覆盖单字符、完整组合文本和短信整码，不以测试工具 setValue 的理想路径替代浏览器事件数据。

验证码样式的公开可选覆盖不能在 `:root` 预先解析组件局部私有尺寸；在最终消费处回退到五档尺寸，确保实例覆盖与不同尺寸都生效。

## 集成门禁

- 组件专项行为测试、保留 TypeScript 声明的同源比较通过。Input/Textarea、Slider、List、Rate 既有主体门禁复跑通过。Tabs 两端旧检查入口转为新版门禁转发，原导出/样式检查仍保留。
- 两端类型检查和完整 Lint 均通过。
- 两端库构建通过；发布产物的根入口/子路径 Props、Emits、Slots、Expose 类型消费通过；19 个组件入口的裸 ESM/CJS 导入及双实例 SSR 通过。
- 静态样式依赖与真实消费打包去重通过：Cedar 96 / Maple 91 个样式入口；源码及 ESM 混合消费均确认 foundation、Loading 只包含一次。本批覆盖 Input / Search / VerificationCode 混合导入。
- 全量 Token 消费：145 文件、4106 声明、0 待审、0 编译错误。VerificationCode 4 项、Search 25 项公共 Token 入契约；旧 Cedar column-gap 与 Maple Search 旧后缀加入禁止回归清单。主题契约达 47 组件、1009 统一组件值、269 平台组件值；参考目录在最终样式收尾后重生成并复核。
- Maple 937 个 Demo SFC 编译，0 失败。源码根入口补齐公开类型，最终产物声明另有消费测试。菜单和调研由单一库存同步；Props 盘点为 Cedar 127 / Maple 119 / 同名 95。当前 71 组为 55 已同源、13 逻辑已同源、2 逻辑待同源、1 独立，0 待适配。
- 本批未重新执行两端完整文档生产构建；Maple 937 个 Demo 的检查是 SFC 编译检查。浏览器：本任务连接工具仍超时，不以静态测试或构建冒充视觉验收。Cedar Tabs 测试退出码为 0，但结束时有既存 fsevents teardown 诊断，见组件审计。

本批替换旧 Cedar VerificationCode/Search TSX，移除 Tabs 的 platform、无消费者类型/面板绑定等失效文件；两端均各自维护。已跟踪历史可从 Git 恢复。

## 下一批的已核实范围

### Carousel

两端已统一公开名称为 Carousel / CarouselItem，不能再按旧 Swipe 名称规划。需要整族处理索引受控状态机、循环复位、手势/Pointer 取消、自动播放生命周期、动态子项、多页尺寸、间距/居中与 fade/card；保留 Maple Popup 内可见性恢复，统一可访问性。当前测试不足，先建状态机回归，再完善 Cedar 并独立复制。

### Upload

两端公开组件都叫 Upload，Cedar 的 useUploader 是公开组合函数而非另一组件。先完善 Cedar picker / queue / request / lifecycle，补入 Maple 的 Form、读取替换重校验、自有 URL 回收和卸载失效保护，再复制至 Maple。必须覆盖受控队列、异步钩子拒绝、请求准备前取消、重试/旧回调竞态、并发限额、图片/视频预览。API 的 read/after-read、拒绝事件与 expose 方法一次收口，不保留别名。

Carousel 与 Upload 互无直接依赖，可以并行；每组内部的子组件、控制器与生命周期必须整体验收。
