# 第一百九十七批：修复Form重置后的迟到原生提交

## 复现与修复

- 起始2026-10-16 04:07 UTC检查时间、27批主表、196批和两仓Form变化，沿用async-fields Demo，不改并行FormItem。Vue技能及cleanup规则用于原生异步事件所有权、重置和停用/卸载失效。
- 两端真实复现：guest/bad发起原生提交、等待两个Promise时重置，模型变两个空串；随后返回旧用户名/代码结果，仍发一次submit-failed和submit，Demo显示原生提交1/未通过。旧结果不再匹配当前空模型，不能当成有效提交。
- 两端新增定向回归先运行，均在“重置后submit应不存在”断言失败；日志/private/tmp/{cedar,maple}-form197-before.log，进程退出1，非偶然浏览器状态。
- 两库独立Form所有者增加submitEpoch：提交捕获当前代次，resetFields（API和原生reset）递增；校验结清后先核对代次再发submit相关事件。停用/卸载递增，旧续体同样失效。未改变validate返回类型、并发submit策略或公开API，不取消远端请求，不共享实例/运行时。

## 真实浏览器复验

- CUA操作Cedar4185、Maple8080中文中间实例，修复前后均使用可见原生按钮；重新加载修复后同页，从初态重走guest/bad→submit→重置→返回两个旧结果：两端原生提交仍0/-，模型空、命令结果已重置、等待0。
- 随后输入admin/1234、聚焦原生submit按Enter：先返回代码仍0/-，返回用户名才1/通过，模型admin/1234。不是用Demo版本号遮蔽事件；组件回归同时断言submit、success、failed发射情况。
- evidence/*-form-reset-submit-batch197.png保存并查看，展示新提交成功1次，而不是旧/新各一次。临时218/219页关闭，保留源码服务。
- 原生reset、卸载和KeepAlive停用仅有组件测试证据，不冒充浏览器验收。本批未实测英文/右侧、停用后重激活、部分字段reset、并发submit、跨字段依赖或真实网络。源码站不是生产构建产物。

## 验证与进度

- 两端各新增2条回归：API/原生reset覆盖旧失败/旧成功不发提交，重置后新提交恢复；未结清时卸载/KeepAlive停用不发迟到事件。中英文说明同步，菜单沿用已有入口。
- Cedar Form13文件44项、Maple Form及FormDetails16文件65项，共109项相关回归通过且进程退出0；两端类型、受影响文件ESLint、Maple1050个Demo语法（0失败）、Form定向复制门禁、菜单一致性和三仓git diff --check通过。Maple全量lint重跑会话37494正常退出0（/private/tmp/maple-lint197-full.log）。
- 完整生产文档构建未重跑：两端Token说明仍存在原始Promise<void>未闭合片段，Cedar guide/design-tokens.md与Maple docs/designTokens.en-US.md约204/203行（并行编辑可移动行号），与188批阻塞相同；未把类型、单测或Demo语法检查当完整构建通过。
- 分类同源56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）；双端至少部分证据72/72（100%）不变，不是整库全场景完成率。没有完整场景分母，不能算剩余百分比。
- 待补包括Form并发submit/异步跨字段、部分重置与重新激活组合，Upload原生读取故障/abort，Scheduler高级交互，日期时间、Carousel动态边界、物理触屏、水印暗色与新生产产物复验。
- 未创建代理/子任务、未提交/推送/发布，保留脏仓库及其他聊天改动。
