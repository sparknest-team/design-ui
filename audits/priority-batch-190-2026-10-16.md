# 第一百九十批：Upload 重置后新读取被旧缩略图 Promise 阻塞

## 范围与缺陷

- 起始2026-10-16 03:08:12 UTC核对27批、189批与两仓Upload变化；Token未包裹Promise<void>阻塞片段仍存在，不因其他段落变化重复完整构建。
- 沿用replacement-validation，新增“暂停本地缩略图 Promise”与返回/拒绝最早任务控件。使用公开create-thumbnail-url本地回调，等待时不入队，返回固定合成SVG data URL；默认关闭，不影响原file/data-url/object-url示例。重置保留Demo等待以观测迟到；停用/卸载结清等待。
- 两端真实浏览器均复现：暂停→加入sample-1→重置→加入sample-2，等待仍只有1，新任务根本未调用回调。旧业务Promise若不返回，新读取永久等待。
- 根因是useUploader.addFiles的adding串行链跨重置/停用保留，generation只能阻止迟到写回，不能解除新代次对旧Promise的等待。
- 两端独立在reset与onDeactivated失效代次时同步将adding置为Promise.resolve()。旧任务仍由原generation检查丢弃，未物理取消业务Promise、未新增API或共享运行时。Vue技能用于响应式任务队列、生命周期清理及真实组件异步回归；不接管Token或其他并行任务。

## 修复后两端真实浏览器

Cedar4185与Maple8080中文源码站，CUA可见控件，DOM只读，没有注入FileReader、URL或组件状态：

1. 有意重载加载新内核；一次双页重载调用超时导致CUA会话重置，随后绑定原204/205页确认初始状态，不重复新建页、不将超时步骤计通过。
2. 暂停→加入1→重置→加入2：两端Pending thumbnails2，队列空。说明第二次回调已启动，不再依赖旧任务结束。
3. 返回最早旧结果：等待1、队列仍空、计数0；返回新结果：等待0，只出现sample-2.svg，Data URLs1/Decoded1，旧sample-1不复活。
4. 再加入sample-3后拒绝任务：read-error，队列仍sample-2。重新加入sample-4并返回：两项sample-2/4各114B，Data URLs2/Decoded2，拒绝清空。两img均complete=true、naturalWidth/Height16。
5. 保存并查看evidence/cedar-upload-read-epoch-batch190.png、maple-upload-read-epoch-batch190.png。重置后关闭临时页，既有开发服务保留。Maple右侧为空，未计该侧通过。

这是实际操作本地模拟回调的事务验收，不是原生FileReader故障、读到一半的FileReader.abort、真实网络、外部URL回收、物理触屏或英文浏览器验收。KeepAlive的旧任务未结清即恢复新读取只由自动回归覆盖，不冒充浏览器停用证据。

## 自动验证与同步

- Cedar新增1项、Maple中英各1项Demo回归，断言reset后等待2、旧结果不入队、新结果成功、read-error后重新加入及卸载结清等待。
- 加强两端原KeepAlive核心回归：旧beforeRead Promise未结清时激活并新加文件，新读/请求先成功，再结清旧任务不重复回调。没有只靠Demo文案屏蔽旧结果。
- 最终加强KeepAlive后完整Upload复跑：Cedar10文件58项、Maple10文件94项，共152项通过，不将首轮重复累加。两端完整typecheck通过（Cedar声明配置、MapleUI配置），受影响源码/Demo/测试ESLint通过；Maple docs:check1050个Demo SFC、0失败，全量lint:check通过。
- 两端中文及Maple英文说明同步真实根因、业务Promise不可物理取消、回调模拟边界；沿用原菜单入口。Upload定向copied-components-check与component-reuse-sync --check通过，不宣称全库复制门禁。
- 三仓git diff --check通过。完整文档构建仍受188批Token解析阻塞，未编辑Token，未把源码站作为新生产产物。
- 同源56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）、双端至少部分证据72/72（100%）不变，本批新增组件族0、修复已覆盖族的真实缺陷，不是整库场景完成率；剩余百分比仍无完整分母。
- 后续仍有原生读取异常/取消与选择器、外部URL/预览租约、Form异步跨字段/原生提交、日期时间其他边界、Carousel增删/手势中尺寸变化、Scheduler高级交互、物理触屏、水印暗色及新生产构建复验。
- 未创建代理/子任务、未提交/推送/发布，保留脏仓库及其他聊天改动。
