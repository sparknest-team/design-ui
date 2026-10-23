# 第一百一十八批：修复 Image 默认挂载与预览组加载残留

本批优先处理第117批截图疑点。检查时间、最新记录与两仓Image改动，遵循Vue技能的真实Teleport测试建议；不接管并行Token/InfiniteScroll工作。

## 根因与修复

1. ImagePreview的popupContainer运行时声明包含Boolean但未设default，Vue把未传入解析为false。预览因此留在Space子项中并使用absolute定位，滚动文档后跑到视口上方。两端改用各自本地popupContainerProp（default undefined），恢复文档约定的body挂载；显式false仍支持原地渲染。
2. PreviewGroup用image插槽替换单图DOM，原来只绑定默认单图的load/error无法结算组图的加载状态。两端在图片容器捕获load/error并核对当前src；src更新后检查当前已缓存图片的complete，避免切换到已加载slide后永久等待。没有增加公共配置或跨库运行时。

两端独立维护同样修复，中文及Maple英文文档补充默认body/显式false和加载协议，数据驱动组Demo补充提示；未修改Token。

## 浏览器真实复验

- Cedar修复前实际root为Space子项下的absolute，rect.y=-6488.5。修复后root父级BODY、position=fixed、rect=(0,0,1280,720)，与1280×720视口一致，spinner=0。
- Maple修复后同样BODY/fixed、rect=(0,0,1280,720)，spinner=0。点击Previous到1 / 2，缓存图片切换后spinner仍为0。
- 两端重新执行从第二张切第一张→Escape关闭→入口重开，均保留1 / 2且无加载残留。[Cedar修复后](./evidence/cedar-image-batch118.png)、[Maple修复后](./evidence/maple-image-batch118.png)。Demo热更新曾重建当前值，首次读旧索引超时；确认页面新初始状态后重做完整事务通过，不当作运行时索引故障。
- 均为源码站Cedar4185/Maple8080，不是新生产产物。自定义容器、触屏和实际拖拽仍未验收。第117批布局/加载疑点在此范围内已定位并修复。

## 验证与限制

- Cedar完整Image 5文件64项、Maple11文件116项通过，共180项。新增每端2项覆盖真实Teleport默认body/显式false、非当前图片事件不提前结束loading、当前load/error和缓存切图。
- 首次Cedar测试因Transition stub包裹错误断言直接父级，Maple默认Teleport stub导致查询不到body节点；改为显式启用真实Teleport并检查body包含且不在owner内后通过。Maple一次并行运行fsevents断言异常，另一次maxWorkers/minWorkers不匹配未启动；限制worker范围重跑完整116项通过，不隐藏这些中间失败。
- 两端类型检查通过，Cedar受影响源码/测试/Demo lint通过。Maple全量lint首次仅因新增测试import顺序失败，已修正，最终全量lint通过。两仓与审计仓库git diff --check通过。
- component-reuse-sync检查通过，仍72族：56已同源、15逻辑已同源、1独立。整库copied-components门禁被非本批InfiniteScroll主体漂移阻塞；本批Image same-source测试通过，不接管该漂移。
- 完整文档构建重跑：Maple仍在docs/designTokens.en-US.md (59:426)缺结束标签失败；Cedar也在设计Token生成页缺结束标签失败。均未接管Token变更，未产生可宣布通过的新生产构建。
- 部分交互族数量保持46/72（63.9%），双端部分42/72（58.3%），尚无独立族记录26/72（36.1%）；本批修复已有族，不虚增数量。不是全部Demo场景完成率。
- 未提交、推送或发布。
