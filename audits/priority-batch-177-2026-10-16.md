# 第一百七十七批：Carousel 内嵌编辑与背景手势隔离

## 范围与实现

- 2026-10-16 01:06 UTC核对时间、176批、27批主表与两仓Carousel/Scheduler变化后，选择未独立登记的interactive-content组合，不触碰并行Scheduler内核。
- 现有示例两端各增加current受控模型、change计数及定位类；保持三个原生input和背景。未改组件内核/API，没有外部保存或服务。
- 同步Cedar及Maple中英说明、受影响Demo测试。Vue技能用于ref模型、真实组件挂载、异步刷新和卸载清理。沿用现有菜单/示例入口，不新增分类。

## 真实浏览器结果

Cedar4185、Maple8080中文源码站，各用CUA可见控件及真实鼠标拖动完成，DOM只读：

1. Slide1填入合成文字cedar-177或maple-177；输入内ArrowLeft/ArrowRight/Home/End后仍Current0/Changes0。
2. 在页面上方背景水平左拖，切到Slide2：Current1/Changes1。填入second-177，输入内ArrowLeft仍保持1/1。
3. 背景反向右拖回Slide1：Current0/Changes2，原输入文字保留。
4. 聚焦轮播容器并ArrowRight：Current1/Changes3，第二页文字仍second-177，模型与实际页面一致。
5. Maple在Slide1输入内部真实鼠标拖选，选区1–9且Current0/Changes0；Cedar在最终Slide2真实拖选，选区1–10且Current1/Changes3。输入文字选择不会被当作轮播拖动。
6. 截图evidence/cedar-carousel-input-batch177.png与maple-carousel-input-batch177.png已保存并查看；临时浏览器页关闭，原有源码服务保留。

未发现新内核缺陷。文字仅保留于当前已挂载Demo的原生input，不称为父级文本模型回写或持久化；当前索引为真实v-model回写。没有本批Maple右侧/英文、物理触屏文字选择、动态增删、手势中尺寸变化、异步或禁用组合验收；未将不适用的确认/取消算通过。

## 回归与进度

- 两端各新增1项Demo回归，检查输入键盘/指针不触发切页、背景双向拖动及容器按键各通知一次、索引回写及输入值保留。
- Cedar10文件50项、Maple9文件49项，共99项Carousel路径回归通过；两端受影响Demo/测试ESLint及Maple全量lint:check通过，Maple docs:check1046个SFC、0失败。菜单一致性及三仓git diff --check通过。
- 无组件内核/公开类型变化，未重跑完整typecheck；Token文档阻塞hash与176批相同，未重跑已知失败或接管并行Token改动，本批为源码站证据。
- 分类仍同源56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）；双端至少部分证据72/72（100%），不增加族数量，不是全场景完成率。尚无完整场景分母，不能推导剩余百分比。
- 仍待Carousel动态与尺寸变化、物理触屏，以及Upload原生读取/网络迟到、Scheduler高级拖拽拉伸、Form跨字段/提交、日期时间边界、水印暗色视觉和完整生产构建复验。
- 未创建代理/子任务、未提交/推送/发布，保留其他聊天改动。
