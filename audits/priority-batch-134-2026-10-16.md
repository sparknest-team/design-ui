# 第一百三十四批：Icon 搜索后复制与键盘操作

2026-10-16北京时间。用户持续授权，无午夜截止。核对133批、主表及两端Icon路径，无在途重叠修改。使用Vue最佳实践技能补Demo回归，沿用Cedar4185、Maple8080源码站。

## 问题与修复

- Maple输入大写ARROW无结果；删除所有项后重新搜索arrow，点击重建卡片无复制反馈。旧Clipboard只在挂载时为静态节点集合绑定事件，新节点没有绑定。
- Maple改为每项原生button直接调用Clipboard API，搜索忽略首尾空格/大小写，支持Enter/Space；不引入共享运行时或跨库实例。原复制插件的旧浏览器fallback不保留，文档明确安全上下文/权限要求。
- Cedar列表allow-clear是旧输入属性，改为clearable。两端复制都捕获拒绝/不可用，显示错误反馈而非未处理Promise。
- 只改Demo和测试，不改Icon主体/API/主题Token；图标包仍分别来自各端独立包。

## 真实浏览器证据

- 两端搜索no-such-icon-134，卡片0；再输入首尾空格的大写ARROW恢复11项。Cedar使用Space复制arrow-down；Maple点击arrow-down、Enter复制arrow-left，均看到对应前缀成功反馈。
- 实际点击两端清空按钮，卡片均恢复377项。Maple右侧iframe独立搜索GITHUB，Space复制m-icon-github；中间输入/复制另行操作，不把右侧挂载算交互。
- 两端最后GITHUB过滤到品牌1项，Enter复制各自c-icon-github/m-icon-github，截图检查可见图形、焦点框与成功反馈。[Cedar证据](./evidence/cedar-icon-batch134.png)、[Maple证据](./evidence/maple-icon-batch134.png)。
- 两端error级日志为空。未读取用户原始剪贴板，未注入组件状态或派发DOM事件。截图中的成功反馈不等于系统级跨应用粘贴验收。

## 验证及边界

- 每端新增1项Demo回归：无匹配后恢复、大小写/空格、clearable绑定、重建节点复制成功与拒绝错误反馈；Input/Message为测试替身，拒绝分支不冒充浏览器权限实测。
- 测试首轮因环境没有navigator.clipboard失败，补可恢复的测试属性；第二轮因Input替身未声明Boolean而返回空字符串失败，补正确Boolean Props定义，未放宽断言。最终Cedar5文件21项、Maple5文件22项全部通过，共43项（含两端同源检查），不把自动测试项目数换算成浏览器覆盖率。
- Cedar受影响Demo/测试lint通过；Maple全量lint通过，最后测试替身变更后再做受影响文件lint。Maple示例语法检查1037个SFC、0失败。两仓及审计仓diff --check通过。
- Cedar中文、Maple中英文组件文档同步复制协议。调研/菜单只读检查72族：56已同源、15逻辑已同源、1独立，分类不变，无待同源分类；不为新增验收批次修改同源状态。
- 当前部分交互记录60/72（83.3%），双端部分56/72（77.8%），无独立记录12/72（16.7%）。这些不是整库所有Demo/配置的完成率。
- 仍待：真实拒绝剪贴板权限/非安全上下文、系统剪贴板跨应用粘贴、生命周期切换/停用/卸载、spin/减少动效、触屏及不同主题；本批未声称这些通过。
- 未改组件TS/API，不重跑类型检查；完整文档构建仍受132批Token文档解析阻塞，相关源文件没有变化则不重复，不把源码站当新生产产物。
- 无提交、推送、发布或Token改造。
