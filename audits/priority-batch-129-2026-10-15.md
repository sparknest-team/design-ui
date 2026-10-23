# 第一百二十九批：Loading 包裹内容与指令开关

先核对时间、128批和主表，两端Loading无在途重叠改动。使用Vue最佳实践技能补真实Demo回归。沿用Cedar4185、Maple8080源码站，不是生产构建验收。

## 真实浏览器动作

- 两端包裹内容示例点击“打开”，按钮变“关闭”，Loading aria-busy=true、内部遮罩1、LOADING提示出现，介绍卡片文字仍保留在DOM。按Enter关闭，按钮恢复“打开”、提示移除。该卡片没有业务按钮，不把它计作底层点击拦截/交互恢复验收。
- 两端指令示例分别点击简单用法Switch、在复杂配置Switch按Space。指令遮罩各2，内部Loading均aria-busy=true，第二个提示为“加载中...”。
- 在简单用法Switch按Space关闭，遮罩只剩1；再点击复杂配置Switch关闭后为0，两实例独立清理。两端error级日志均为空。
- 真实读取指令Demo外层Space flex-direction为column，控件/标题/卡片不再横向挤压。[Cedar证据](./evidence/cedar-loading-batch129.png)、[Maple证据](./evidence/maple-loading-batch129.png)为两种遮罩均开启阶段。

## 修复与验证

- 两端指令Demo残留`Space direction="vertical"`，与123批List旧值问题同类，改为column。不改Loading运行时/API/Token。
- 两端各新增1项Demo回归，挂载真实Space/Switch/Card与vLoading，检查column及遮罩开启/关闭移除。
- Cedar3文件17项、Maple Loading3文件21项通过，共38项。Maple测试路径前缀也匹配LoadingBar，其4文件22项自动测试通过；总执行60项，不将额外LoadingBar测试算作本批浏览器新增族。
- Cedar受影响Demo/测试lint通过。Maple受影响文件格式化及全量lint通过（exit 0）。未涉及类型/API，不重跑类型与完整构建，前批Token文档构建阻塞记录不被源码站验收覆盖。
- Cedar中文与Maple中英文档补充两实例独立状态及column布局说明，示例仍使用各端文件。菜单/调研同步检查通过：72族、56已同源、15逻辑已同源、1独立，分类不变。
- 部分交互独立记录56/72（77.8%），双端部分52/72（72.2%），尚无独立记录16/72（22.2%）；不是整库全部场景通过率。
- 全仓检索还出现其他`direction="vertical"`，其中有些属于Radio/Scrollbar等合法API，不能机械替换。后续需按具体组件解析筛查Space调用；本批只修Loading两处，不触碰其他任务。
- 尚待：带业务计数的指令遮罩点击拦截、底层键盘、加载中卸载、多fullscreen指令锁滚动组合、动态对象配置、隐藏图标、自定义indicator、触屏与减少动效。未据静态样式或单测推定浏览器通过。
- 静态截图中Cedar暗色页面的默认指令遮罩明显偏浅，未判定主题视觉一致性通过；本批未归因或接管并行Token任务，需后续主题整合后复验。
- 两仓及审计仓diff --check通过。未提交、推送或发布。
