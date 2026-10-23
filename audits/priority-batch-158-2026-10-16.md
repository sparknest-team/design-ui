# 第一百五十八批：Ripple 原生鼠标入口修复

## 范围与实现

- 回查第141批已记录缺口：指令只有触摸/键盘入口，桌面原生鼠标不生成波纹。本批在两端独立复制源码中补主键mousedown入口，以实际clientX/clientY计算起点；所属document的mouseup与窗口blur负责释放，卸载对称移除监听。
- 触摸记录时间，忽略sourceCapabilities.firesTouchEvents及触摸后800ms内兼容鼠标，非主键不生成。该回退窗口的取舍已在文档明确，不宣称物理混合输入全部验收。
- 保留已有在途scheduler-delivery保护、创建/激活/最小清理时序和CSS Token，不接管动画调度改造。无新公开API、共享运行时或platform配置。
- Cedar说明、Maple中英文说明同步；既有长时长Demo复用，无新增Demo文件或菜单分类。菜单生成检查通过，Ripple继续标记已同源，不代表全交互已验收。

## 真实浏览器证据

使用Cedar4185及Maple8080源码开发站，CUA原生点击/键盘操作，仅DOM只读核对，无事件注入。

1. Cedar点击600ms扩散/800ms消退按钮，直接子波纹1，释放后0；右键点击0，随后主键仍正常生成且清理。禁用后点击0，重新启用Space生成1并清理。
2. Maple中间点击长时长按钮，中间1/右侧0，随后清理；右侧点击，右侧1/中间0，随后清理。中间Enter生成1并清理。
3. 键盘首次即时采样为0，因已有30ms创建延迟；改用等待节点出现再计数，确认1而非将即时0判为缺陷。未改变运行时延迟。
4. 截图保留页面上下文：evidence/cedar-ripple-mouse-batch158.png、evidence/maple-ripple-mouse-batch158.png；Maple截图可见中间波纹及焦点框。临时浏览器页已关闭，原开发服务器保留。

真实触屏/触摸合成鼠标、窗口失焦释放、鼠标按下后移出宿主再松开与卸载监听清理，本批只有自动测试覆盖适用分支或尚无实机证据，不能冒充浏览器通过。跨文档adopt、KeepAlive与OS偏好保持原边界。

## 自动验证与进度

- Cedar完整Ripple31项、Maple36项，共67项通过；各新增3项，覆盖主键/所属document释放、非主键/兼容事件去重、window blur、禁用与待创建时卸载。Cedar旧Vitest不自动模拟performance时钟，测试显式将performance.now关联fake Date时钟，修复测试无限定时器循环，不修改生产时序。
- 两端完整typecheck通过；Cedar受影响TS/测试ESLint、Maple全量lint:check通过；两仓git diff --check通过。
- Ripple定向copied-components-check通过，component-reuse-sync --check通过：72族，已同源56（77.8%）、逻辑已同源15（20.8%）、独立1（1.4%）。没有宣称全组件复制门禁通过。
- 本批未重跑完整生产文档构建：沿用并行Token文档解析阻塞，浏览器为源码开发站；未将开发站当作新生产构建验收。
- 至少一端部分证据72/72（100%），双端部分证据68/72（94.4%），不是全Demo/全场景完成率。新增的是已知鼠标缺口修复，不增加组件族数量；Upload其他异常、Scheduler高级组合、Form高级异步和物理触屏等继续按未覆盖项推进。
- 未提交、推送或发布。
