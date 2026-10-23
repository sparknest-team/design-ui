# 第一百九十一批：Upload 新缩略图先成功、旧读取最后失败

## 范围与实现

- 2026-10-16 03:18:26 UTC核对27批、最新190批和两仓Upload变化。190批已经覆盖旧结果先返回，本批补新成功先于旧失败的反向顺序，不重复计为新增组件族。
- 在既有本地缩略图Demo增加“返回最新缩略图”，复制等待数组后取尾项，最早返回/拒绝入口保持原语义；两端及Maple英文独立维护。未改内核/API、不共享运行时、不接管Token。Vue技能用于shallowRef队列更新及异步回归隔离。

## 两端真实浏览器

Cedar4185、Maple8080中文源码站，CUA可见控件与只读DOM：

1. 开启暂停，本地加入sample-1后重置，再加入sample-2；等待2、队列空。
2. 先返回最新缩略图：等待1，sample-2.svg入队且114B，Data URLs1/Decoded1；旧sample-1仍等待。
3. 再拒绝最早旧缩略图：等待0，列表仍仅sample-2，拒绝原因无，没有read-error；Data URLs1/Decoded1不变。实际img complete=true、naturalWidth/Height16，两端均通过。
4. 保存并查看evidence/cedar-upload-stale-rejection-batch191.png、maple-upload-stale-rejection-batch191.png；重置后等待0、列表空、计数0/0、拒绝无，临时页关闭，开发服务保留。

Cedar初次建页超时后绑定同一206页读取，不重复新建。未发现新内核缺陷。本批为本地create-thumbnail-url Promise的真实Demo交互，不是原生FileReader异常、网络、外部URL回收、英文/Maple右侧或物理触屏验收。

## 回归、同步与进度

- 扩展190批已有三项语言/端Demo回归，核对先返回最新、旧任务最后拒绝后无read-error与旧项复活；另保留最后未结清任务以执行卸载清理，不新增虚增测试数。
- Cedar Upload10文件58项、Maple10文件94项，共152项通过；两端受影响Demo/测试ESLint、Maple全量lint:check通过。Cedar测试结束打印close timed out after1000ms但命令退出0，未隐瞒警告，不将其归为组件故障。
- Maple docs:check1050个Demo SFC、0失败；菜单component-reuse-sync --check与三仓git diff --check通过。仅JS Demo/测试及Markdown变动，无内核或公开类型修改，未重复完整typecheck；不把190批类型结果当本批新跑。
- 两端中文与Maple英文说明同步反向操作、计数及本地模拟边界；沿用现有菜单入口。完整文档构建继续按188批Token阻塞处理，片段未实质修复不重复相同构建。
- 同源56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）、双端至少部分证据72/72（100%）不变，本批新增族0；不是全场景完成率，完整剩余百分比仍无分母可计算。
- 后续仍有Upload原生读取/选择器/外部URL租约，Form跨字段异步/原生提交，日期时间其他边界，Carousel增删/手势中尺寸变化，Scheduler高级交互，物理触屏、水印暗色及新生产构建复验。
- 未创建代理/子任务、未提交/推送/发布，保留脏仓库与并行改动。
