# 第一百八十四批：Upload 混合读取模式与容量恢复

## 范围与真实浏览器

- 起始2026-10-16 02:19:48 UTC核对27批、最新183批及两仓脏改动。沿用replacement-validation入口，不修改Demo或组件内核、不接管Token/并行任务。Vue技能用于测试异步flush、受控列表核对及FileReader替身恢复。
- Cedar4185、Maple8080中文源码站，使用CUA操作可见控件，DOM只读；未注入事件、文件或浏览器FileReader。
- 初始关闭读取开关加入sample-1.svg，开启加入sample-2.svg，再关闭加入sample-3.svg；三项均114B，Data URLs1、Decoded images1，唯一图片sample-2完整解码16×16。切换没有追溯改写其他已接受项。
- 开启后第四次加入被max-files拒绝，列表仍1/2/3，图片和计数仍1/1。删除中间data-url项后再加入sample-5.svg，列表变1/3/5，Data URLs1、Decoded images2；唯一图片sample-5完整解码16×16。
- 再关闭开关不改变已读取图片；保存并查看两端截图evidence/cedar-upload-mixed-batch184.png、maple-upload-mixed-batch184.png。重置后列表空、计数0/0、拒绝无。临时页关闭，既有服务保留。
- 两端均通过，未发现新内核缺陷。本批不是原生文件选择器、读取中取消/失败、object-url、网络、物理触屏或英文/Maple右侧浏览器证据；截图右侧无关示例不计通过。

## 回归与同步

- 扩充183批现有读取Demo测试（Cedar1项、Maple中英各1项），断言混合三项只触发一次额外读取、满额拒绝不再读、删除释放名额、新读后累计load计数及重置；单测load为手动触发，真实解码仅以上述浏览器为证。
- Cedar10文件56项、Maple10文件90项，共146项Upload回归通过，两端受影响测试ESLint通过。两端中文及Maple英文说明同步混合模式行为，沿用既有菜单入口；component-reuse-sync --check及三仓git diff --check通过。
- 仅测试和Markdown变更，无运行时/公开类型/Demo SFC改动，未重复完整typecheck、全量lint或Demo语法扫描。Token阻塞hash与183批完全相同，未重跑已知失败的完整文档构建，本批不是新生产构建复验。
- 同源分类56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）不变。双端至少部分交互证据72/72（100%），本批新增组件族0；没有完整场景分母，不能计算整库剩余百分比。
- 后续仍需Upload读取中清理/失败、原生选择、object-url及网络迟到组合；Scheduler高级拖拽/拉伸、Form高级异步、日期时间其他边界、Carousel动态变化、物理触屏、水印暗色视觉及生产构建复验。
- 未创建代理/子任务、未提交/推送/发布，保留其他改动。
