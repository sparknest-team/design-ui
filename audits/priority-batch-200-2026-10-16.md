# 第二百批：Watermark局部深浅配色、重绘与清理

## 范围与真实浏览器

- 起始2026-10-16 04:31 UTC检查时间、27批主表、199批及两仓Watermark变化，避开全局Token并行任务。Vue技能用于独立ref驱动公开属性、v-if卸载与真实组件回归，不共享实例/运行时。
- 沿用两端基本文字Demo，加入双语深色底/显示开关、合成文字输入、内容点击计数。显式font.color白色alpha0.4/黑色alpha0.25及局部背景#1f2937/白色；没有修改默认Token、主题所有者、内核/API或platform配置。
- CUA操作Cedar4185、Maple8080中文中间实例，开启局部深色底，将文字改为SYNTHETIC 200，实际点击水印覆盖下的按钮：Visible true/Dark true/Clicks1。只读DOM核对背景rgb(31,41,55)、层PNG背景、pointer-events:none。
- 两端实际截图可见倾斜重复SYNTHETIC 200，局部深色底不遮正文/按钮。此处为装饰水印视觉识别，不声称正文WCAG对比度合规。Maple正文受示例站样式呈白底条，但文字可读，不改站点样式。
- 取消显示后两端局部layer数0、Visible false；取消深色并重新显示，只有1层、PNG样式相对深色变化，输入保留合成文字；实际Enter内容按钮后Clicks2，无覆盖层拦截。
- evidence/cedar-watermark-dark-batch200.png、maple-watermark-dark-batch200.png及maple-watermark-light-batch200.png保存并查看。临时224/225页关闭，保留源码服务。Maple右侧未操作，不计其交互。
- 只认证局部显式配色、属性重绘和隐藏恢复，不把它称为默认主题Token/全站暗色切换验收。未验证默认暗色自适应、防篡改、图片失败、全屏深浅组合、英文实例或物理触屏；这些限制保留。未发现需修内核的新缺陷。

## 验证与进度

- 两端各新增1条Demo回归，Canvas替身核对新文字绘制、公开字体色、隐藏0层/恢复1层和计数保留；不冒充真实Canvas视觉或键盘事件证据。中英组件说明同步，沿用原菜单和移动集合。
- Cedar4文件8项、Maple2文件6项，共14项Watermark回归通过且进程退出0；两端受影响Demo/测试ESLint、Maple1050个Demo SFC（0失败）、菜单一致性和三仓git diff --check通过。仅JS Demo/测试和Markdown变化，无内核/公开类型改变，未重跑全量类型/全量lint；完整生产站构建仍按197/188批Token未闭合标签限制，不接管并行工作。
- 分类同源56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）；双端至少部分证据72/72（100%）不变，不是全场景完成率；没有完整场景分母不能计算剩余百分比。
- 待补默认主题暗色/防篡改等Watermark组合，Form混合校验与跨字段异步，Upload原生读取故障/abort，Scheduler高级交互，日期时间和Carousel边界、物理触屏及新生产产物复验。
- 未创建代理/子任务、未提交/推送/发布，保留脏仓库与其他聊天改动。
