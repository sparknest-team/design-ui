# 第四批：Carousel 与 Upload

## 范围与约束

本批处理库存中最后两组“逻辑待同源”：Carousel / CarouselItem 与 Upload / useUploader。两组互无直接依赖，分组并行；组内按状态、控制器、视图、调用方、测试的依赖顺序实施。两端独立维护复制后的源码，不共享运行时、实例，不新增 platform 配置，不保留正式发布前的旧 API 别名。

## 实施与验收记录

| 组件族 | 本批重点 | 状态 |
| --- | --- | --- |
| Carousel | 受控索引、多页布局、fade/card、Pointer、自动播放与可见性生命周期、键盘和可访问性 | 已同源：Cedar 25 / Maple 26 项测试，12 对源码 + 26 项 token 门禁通过 |
| Upload | 选择/读取/队列/请求、受控接收、异步取消与旧回调、Form、URL 所有权、公开协议 | 逻辑已同源：Cedar 41 / Maple 68 项测试，20 对源码门禁通过；视频预览保留 Drawer / Popup |

已通过 component-reuse.json 同步两端菜单及调研文档。71 个已确认配对组件族：56 已同源、14 逻辑已同源、1 独立；待同源/待适配/逻辑待同源均为 0。未配对组件不因此宣称完成，逻辑已同源也不代表端侧视图完全相同。

## 集成验证

- Upload 的 Form 原生文件选择回归通过：disabled / readonly 不读取，启用后更新模型并通过校验。更新 4 个预期快照，不再调用私有 handleChange 或旧 after-read。
- Upload 全局语言与 Cedar ConfigProvider 集成：Cedar 2 / Maple 1 项通过。Carousel 新可访问性文案接入同一全局语言系统。
- Maple Theme 21 项通过；旧 Upload / Carousel 暗色主题重复覆盖改为系统角色，2 个快照按预期更新。
- 新媒体样式门禁：64 主题/状态案例、152 次变量覆盖断言通过；包括四主题、reduced-motion 及 fine/coarse 条件。全量 Token 扫描 146 文件、4149 声明、0 待审、0 编译错误（最终冻结后复核）。
- 两端完整 Typecheck / Lint、根入口与子入口 API 导出审计通过。Search 示例的事件处理函数补充 SearchResult 参数类型，无运行时改动。
- Maple docs:check：966 个 Demo SFC、0 失败；Upload 中英各 21 个独立卡片，右侧集合同步覆盖。
- 发现并修正 Less 把现代 rgb 斜线透明度当作除法计算的问题，两端 Carousel 使用原样输出，并增加实际编译颜色通道/透明度断言。
- 两端 build:lib 通过（Carousel 颜色修复后 Cedar UI 重新构建；Maple 产物已确认正确）。根/子入口公开类型和 ESM/CJS 双实例 SSR 通过。
- 样式模块 source/ESM/CJS 门禁通过：混合消费 Carousel、Upload 等时基础样式及 Loading 各一份，无缺失入口或循环依赖，不使用运行时去重。
- Maple build:doc 通过；提示部分高亮语言资源 chunk 超过 500 kB，非构建错误。Demo 收尾后的 Maple 全量 lint 再次通过；Cedar build:doc 通过，270 页，246.98 秒。
- 全库 copied-components 与 73 对 foundations 源码门禁通过；Token 目录、媒体主题检查通过，三仓 git diff --check 通过。
- 不能以静态测试代替浏览器视觉验收；本任务浏览器工具连接超时。
- 清理被新 SFC/布局实现取代的旧 Cedar Carousel/Upload TSX 与 Maple Carousel provider/旧样式文件；均为 Git 跟踪源码，可从历史恢复，没有清理用户工作区。

## 必要基础修复：Image 命令式预览

独立复核确认旧预览被新调用替换时不会触发 onClosed，导致 Upload 保留的 Object URL lease 迟迟不释放。两端 API 独立复制一次性终态清理：先清理宿主和单例引用，再通知；旧句柄不影响新实例，同步重入时保留较新的调用。没有重构 Image 组件主体或引入跨库共享实例。

新增两端各 4 项预览生命周期测试通过；连同现有 Image 同源/命令式消费回归，Cedar 18 / Maple 26 项通过。相关 API 文档、OpenSpec 和 changeset 已同步。
