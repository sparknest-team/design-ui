# 第一百八十九批：Upload 原生 Blob/object-url 解码与清理证据分层

## 范围与实现

- 起始2026-10-16 03:00:01 UTC核对27批、最新188批、183/184批及两仓Upload变化。沿用replacement-validation Demo，在Cedar及Maple中英独立添加原生Blob/object-url开关和当前Blob URLs计数；此开关优先于已有data-url，只影响后续新增项。
- 图片显示扩展到data:和blob:缩略图，保留原Data URLs与累计Decoded images语义；默认仍file。仅Demo/测试/说明改动，不修改Upload内核/API、并行Token或其他任务。
- Vue技能的ref与资源清理检查用于区分浏览器实际解码、列表移除及自动回归中的URL所有权释放。不访问网络/凭据或原生文件选择器。

## 两端真实浏览器

Cedar4185、Maple8080中文源码站，CUA可见操作、DOM只读，未替换URL方法或注入图片/文件：

1. 初次新建页面加载超时；复用同一202/203页重新读取后均正常，不重复创建阻塞页。原开发命令会话仍在，没有重启或终止服务；shell本地连接诊断失败不能当作浏览器服务停止证据，根因未确认。
2. 开启object-url，连续加入两项114B合成SVG，Blob URLs2、Data URLs0、Decoded images2。两端实际img src均为本端localhost来源的不同blob:地址，complete=true、naturalWidth/Height均16。
3. 替换文本被accept拒绝，列表仍两项、Blob URLs2/Decoded2。删除第一项后只余sample-2.svg，图片1、Blob URLs1、Decoded仍2。
4. 截图evidence/cedar-upload-blob-batch189.png、maple-upload-blob-batch189.png保存并查看，绿色16px图与1/2计数、accept可见。重置后列表/图片空、Blob URLs0/Data URLs0/Decoded0、拒绝无；临时页已关闭。

未发现新内核缺陷。浏览器只证明原生URL创建/解码与DOM清理，没有读取URL回收注册表、没有用移除图片冒充原生revoke已实测；不包含读取中取消/失败、外部自定义URL、预览租约、KeepAlive、英文/右侧或物理触屏验收。

## 自动验证与同步

- 新增Cedar1项、Maple中英各1项Demo回归，替换URL.createObjectURL/revokeObjectURL并最终恢复属性描述符，检查接受两文件才创建两个URL、类型拒绝不创建、删除/重置/卸载各释放其唯一URL且不重复。此处是替身调用证据，不是原生浏览器回收观测。
- Cedar Upload10文件57项、Maple10文件92项，共149项通过；两端受影响Demo/测试ESLint、Maple全量lint:check通过。Maple docs:check1050个Demo SFC、0失败。
- 两端中文与Maple英文组件说明同步优先级、计数和证据边界；沿用既有菜单入口，component-reuse-sync --check与三仓git diff --check通过。无公开类型/运行时修改，不重复完整typecheck。
- 完整文档构建仍沿用188批明确的Token解析阻塞；不因其他追加内容导致hash漂移反复构建，不将源码页当新生产产物。
- 同源56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）、双端至少部分证据72/72（100%）不变，新增组件族0；不是全场景完成率，完整剩余百分比无分母可计算。
- 后续仍有Upload读取中清理/失败、原生选择及外部URL/预览租约组合；Form跨字段异步/提交、日期时间边界、Carousel项目增删/手势中尺寸变化、Scheduler高级交互、物理触屏、水印暗色及生产构建复验。
- 未创建代理/子任务、未提交/推送/发布，保留脏仓库及并行改动。
