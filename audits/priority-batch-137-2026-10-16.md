# 第一百三十七批：DatePicker 嵌入面板事务与动态边界

2026-10-16北京时间。先核对时钟、136批和主表。面板位于两库src/date下，不是独立src/date-picker目录。两库已有DatePanelActions、rejected-close和date-current-range测试改动，本批均未修改或覆盖；只更新面板文档并使用既有entry-boundary Demo。使用Vue最佳实践技能检查交互和针对性回归。

## 入口与文档修正

- Cedar源码站4185有独立/components/date-picker/文档；Maple8080没有#/zh-CN/date-picker，访问落首页。通过快速开始→Date菜单进入实际文档，面板示例聚合在Date页。
- 修正Maple中英DatePicker介绍中的不存在date-range-picker路由和无hash字段链接，改为实际#/zh-CN/date-range和英文对应路由；说明聚合入口。没有新增菜单或强行制造独立组件页。
- 两端中英文档补充既有entry-boundary纯面板disable-confirm=false、草稿与模型、动态边界不清除模型以及重新选择合法值的边界。

## 真实浏览器交互

- 两端entry-boundary初始已提交2025-02-12。实际点击13，模型仍12；Cedar确定Enter、Maple确认Enter后模型都13。证明v-model父级反馈，不只是选中类变化。
- 周六起始按钮按Space后两端表头为六/日/一/二/三/四/五，模型仍13。未把仅DOM属性修改当交互。
- 点击移除限制，实际点击下一月，两端预览2025年3月而模型仍2月13。Cedar的原生可访问按钮与Maple实际DOM箭头按钮操作分别验证。
- 选3月1日（Enter），点击确认，模型均2025-03-01；点击恢复限制后模型仍3月1，确认按钮两端isEnabled=false，没有静默清空或无效提交。
- 点击上一月，选2月14日，Cedar确定Enter、Maple确认Space，模型均2025-02-14，证明边界恢复后仍可开启合法选择事务。
- 文档更新引起源码Demo重建后，另行再次选14并确认，最终反馈均14；没有将更新前的模型与更新后截图混用。
- Maple右侧iframe独立选15，确认前已提交仍12，确认Enter后为15。没有把中间面板的全部场景推定为右侧覆盖。
- 两端error级日志为空。[Cedar面板证据](./evidence/cedar-datepicker-batch137.png)、[Maple面板证据](./evidence/maple-datepicker-batch137.png)。源码站不是新生产构建站。

## 验证与待办

- Cedar date-picker基线1项+date-panel-tools7项，共8项；Maple picker19项+date-panel-tools7项，共26项；总34项通过。未修改或运行并行在途date-current-range测试来掩盖本批边界。
- 只改Markdown，不改组件主体/Props/样式/Token/Demo代码，不重跑代码lint/typecheck或Demo语法检查。菜单/调研只读检查72族，56已同源、15逻辑已同源、1独立，分类不变。完整构建仍受132批Token文档解析错误阻塞，不重复无变化失败。
- 发现Maple PanelHeader两个纯图标月份按钮缺少无障碍名称；本轮为实际操作使用已观察的DOM选择器，不等于可访问性通过。需要下一批按LocaleProvider/全局语言补正确命名并验证，避免本批混入跨语言运行时改造。
- 仍待：该箭头无障碍修复、disabledDate回调矩阵、所有日/月/年/周/季度和移动picker/clock展示、异步规则变化、范围面板、触屏、取消/拒绝组合。确认区没有取消按钮，本批不宣称取消链通过。
- 当前独立部分记录63/72（87.5%），双端部分59/72（81.9%），无独立记录9/72（12.5%）；不是全部场景完成率。Date字段和DatePicker面板按规范独立统计，不因目录同为date而混同。
- 无提交/推送/发布，不共享运行时或新增platform配置；临时浏览器页安全关闭。
