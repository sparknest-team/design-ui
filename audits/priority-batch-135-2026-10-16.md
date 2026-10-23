# 第一百三十五批：ProgressGroup 动态容量与键盘提示

2026-10-16北京时间。持续授权，无午夜截止。先核对时间、134批和主表，两端ProgressGroup路径无在途修改。使用Vue最佳实践技能补Demo回归，保留其他聊天Token工作。源码站Cedar4185、Maple8080，不冒充新生产产物。

## Demo及文档

- 既有overflow-keyboard静态Demo扩展为两端独立同源父级状态：容量100/200、清空/恢复items、tooltip开关，同时更新线形和圆环；可见aria-live反馈标明父级状态。
- 不新增组件事件/API，不改主体/Token/样式。组件是数据展示，按钮不是组件内部编辑能力，不需要伪造update:model-value协议。
- 中英组件文档同步控制来源、焦点与悬浮优先关系。Maple右侧继续引用同一Demo文件，无复制静态源码。菜单/调研检查72族：56已同源、15逻辑已同源、1独立，分类不变。

## 真实浏览器操作

- 原容量100两端Tab从线形A进入B，实际焦点在B，提示B: 50 (50%)，B样式width30%，符合超额裁剪但保留逻辑占比。Escape两端提示数量0。
- 新Demo两端按钮实际更新容量200（Cedar Enter、Maple点击），累计65%，线形B width25%，圆环B dasharray25 75；图例A35/B25/C5。
- Cedar从B按Tab进入新可见C，提示C: 10 (5%)。Maple相同动作实际焦点也在C，但鼠标停在A时提示A: 70 (35%)，符合现有hover优先策略，不误报焦点失效；离开悬浮后圆环独立验证见下项。
- 两端关闭提示（Cedar Space、Maple点击）：本Demo分段tabindex0数量均0、tooltip0。清空（Cedar Enter、Maple点击）后分段0；恢复（Cedar Space、Maple点击）后分段6，容量200和提示关闭状态保留。
- 重新开启提示，再从圆环A按Tab进入B，两端提示B: 50 (25%)；Escape后均0，证明SVG分段键盘链和关闭行为，不只是挂载。
- Maple右侧iframe独立点击Capacity100变200，反馈Items3/capacity200/tooltips on。右侧仅此交互，不将中间的全部场景计入右侧覆盖。
- 最后两端重新从线形A按Tab至B，截图检查65%、25%提示、线形/圆环及控制按钮：[Cedar证据](./evidence/cedar-progress-group-batch135.png)、[Maple证据](./evidence/maple-progress-group-batch135.png)。两端error级日志为空。

## 验证和待办

- 两端各新增1项实际Demo测试，核对父级max回写两种形态、关闭提示移除Tab入口、清空/恢复分段及反馈。组件主体测试各12项加Demo1项：两端各13项，共26项通过。
- 两端受影响Demo/测试格式化及lint通过；Maple全量lint通过，示例语法检查1037个SFC、0失败。两仓及审计仓diff --check通过。无组件类型/API变化，不重跑typecheck；Cedar和Maple构建阻塞源SHA1仍与132批一致，完整文档构建沿用132批失败边界，不重复无变化失败。
- 当前独立部分交互记录61/72（84.7%），双端部分57/72（79.2%），无独立记录11/72（15.3%）。这不是全部Demo、Props组合或整库完成率。
- 仍待：纵向真实交互、动态重排/删除焦点项、业务异步更新、具名插槽切换、悬浮/焦点竞争的完整矩阵、真实触屏、减少动效与主题对比度。自动测试不能代替这些浏览器场景。
- 无提交、推送、发布、共享运行时或platform配置；不接管其他聊天Token任务。
