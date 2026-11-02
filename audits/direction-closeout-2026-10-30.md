# 阅读方向全量收尾（2026-10-30）

剩余 LTR/RTL 核心实现与本机方向验收已完成，不再保留 I/J 等实现批次。导航沿用统一 DirectionToggle，支持持久化及手机预览同步。

## 本轮补齐

- 两端 Pagination、PageHeader 默认导航图形；Menu 子菜单前进/返回键。仅处理默认方向图形，自定义插槽保持调用方的控制。
- Tooltip、Popover、Dialog、Drawer、Message、Descriptions、Card 等内容的逻辑间距、边框、关闭按钮与操作区；表格筛选、字段公共包装与选项分隔边同步处理。
- Carousel 循环翻页读取真实 CSS 矩阵时显式转换物理/逻辑坐标，避免 RTL 连续翻页和循环边界误判跳切；补充水平 LTR/RTL 与垂直轴回归及三引擎实际过渡检查。
- 图片集合的 RTL 轨道、键盘及指针滑动。方向变化取消未完成手势、重新居中，不更换业务图片，不清空缩放、旋转或已放大的物理平移。
- 验证码、数字键盘及代码区使用 LTR 内容岛，外围仍继承方向。业务字符串、数值和数组不倒序。
- Progress/ProgressGroup 的阅读起点、活动段、提示位置和方向动画；Maple NoticeBar、TabBar、IndexBar、LoadingBar、Picker 等剩余逻辑布局。
- 显式物理 API 继续保持原义：Collapse 图标 left/right、Layout.Sider placement、Drawer/Notification 方位，以及地图、签名、图片和安全区坐标。
- Scheduler 保存示例的 Loading 包装改为块级布局，避免内容最小宽度撑开文档；保留组件自身横向滚动及保存等待反馈。
- 中英文组件说明、规范、统一回归命令、规划和逐项证据同步更新。

## 验收结果

| 检查 | 结果 | 证据 |
| --- | --- | --- |
| 方向门禁 | 132 用例通过：Cedar 76、Maple 52、文档同步 4 | [日志](evidence/direction-closeout-2026-10-30/direction-gate.log) |
| 公开目录组件族单测 | Cedar 563 文件 / 3450 用例；Maple 532 文件 / 4011 用例；合计 1095 文件 / 7461 用例获得通过结果 | [按文件证据](evidence/direction-closeout-2026-10-30/unit-coverage.json) |
| 类型与 lint | 两端主项目、公开 API 类型检查通过；组件源码全量 lint 及最后调整测试文件的追加 lint 通过 | [验证文件](evidence/direction-closeout-2026-10-30/verification-files.json) |
| 构建 | 两端库与最新文档生产构建通过 | 同上 |
| 规范检查 | 两端组件规范、样式变量契约、Maple 源码规范化通过 | [检查结果](evidence/direction-closeout-2026-10-30/quality/results.json) |
| 全组件方向矩阵 | Cedar 99 文档页、Maple 93 文档页；两种方向 × 三引擎；Maple 同时验证文档和手机预览，共 1710 个组件案例、90 个指南案例完成验收 | [验收清单](evidence/direction-closeout-2026-10-30/acceptance-manifest.json) |
| A—H 专项 | 各阶段三引擎完整成功记录，包含窄屏、嵌套、Portal、拖动、滚动、键盘、合成组合输入协议和业务值保持 | [专项清单](evidence/direction-closeout-2026-10-30/specialists-acceptance.json) |
| 新增图片及物理侧专项 | 多图预览键盘/滑动/切换后居中、Escape 关闭、Collapse/Sider 物理侧，三引擎通过 | [结果](evidence/direction-closeout-2026-10-30/interactions/results.json) |

单测按文件合并分组执行、隔离执行及修正后的复验结果，不声称所有最初的整库命令一次全绿。旧运行器的 mock 串扰、资源超时及快照差异保留在执行记录中。最终共享接口调整后，对新改动再做受影响组件族复验；中止的重复整库复验仅保留已完成文件通过记录，不记为整条命令通过；快照更新仅接受已核对的逻辑对齐、加载占位和属性顺序差异。Steps 的旧 listitem 查询更新为现有可交互按钮角色，未放宽 v-model 断言。

浏览器每案例使用独立上下文，检查真实代表案例、代表源码、局部反向覆盖、运行时恢复、可编辑/可选值不变及业务交互。计数、轮播及只读进度等自主更新不被当作切换方向改值；进度另有实际几何断言。截图辅助定位，不能替代这些断言。

原始 `coverage.json` 保留完整运行结果，`acceptance.json` 另行记录相同源码、生产输入、构建及浏览器版本下的成功案例复验和原失败原因。最终版本的验收清单记录 1 次成功定向复验，1 个案例带复验来源；先前版本的失败及中断运行另行保留诊断。没有把原失败命令改记为成功，也未用缺失案例补足计数。Firefox 曾在长自动化会话退出；隔离 Carousel/Cascader 页面成功后，方向矩阵按每 8 个独立上下文轮换同版本 Firefox 进程完成。文档资源加载使用独立 30 秒预算，组件操作仍为 5 秒；原主题门禁预算不变。

## 清单与范围

[逐项清单](direction-implementation-inventory-2026-10-29.json) 现为 195 项：原 194 项加补录 Maple NavMenu，包含 5 项基础设施。Cedar DatePicker/TimePicker 文档别名关联父项，因此文档页数与目录数不相等，不计算“全库支持率”。基础设施关联上下文、SSR、清理、主题和真实组件集成证据，不冒充独立视图。

本次是已有组件的核心方向验收，不穷举所有主题、业务数据、异步服务与自定义插槽组合。不新增 Maple 尚不存在的组件；不冒充真实手机、系统输入法或未提供的历史浏览器验收。本次没有发布、推送或部署。

额外执行的全库 `check:motion-themes` 仍因历史动画/运行时分类清单及 Token 引用文档漂移未通过，包含本轮未修改的日期面板和菜单记录；详情见上述 quality 日志。没有自动批准或刷新这些跨专题审计，所以不宣称整库 `quality` 或发布门禁已全绿。共享工作区的 `git diff --check` 另记录 Cedar InputNumber/textarea 两处空行尾空格，Maple/design-ui 通过；见 [格式检查记录](evidence/direction-closeout-2026-10-30/workspace-diff-check.json)。

## 复验入口

先完成两端 `build:doc`，并保持组件、编译器及文档输入在验收期间稳定。统一入口位于 `design-ui`：

```sh
pnpm check:direction
pnpm check:direction:all
```

`check:direction:all` 依次运行方向单测、A—H 与新增专项、全组件矩阵。`check:direction:catalog:retry` 只复验现有矩阵的失败案例：源码/生产输入/构建/浏览器版本不匹配、缺失案例或持续失败均拒绝验收。需要保留历史专项目录时传入独立的 `DIRECTION_EVIDENCE_DIR`。
