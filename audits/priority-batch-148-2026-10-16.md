# 第一百四十八批：Form 异步等待期间的交互限制

2026-10-16北京时间。先核对时间、147批和57/62/64/65/66/104/105批，乱序、清空/重置和路由清理已有证据；本批补disabled/readonly组合。沿用两端已有async-race Demo，不创建重复示例或改规则协议；保留原有Cedar FieldRule和Maple Promise规则适配、版本保护及清理。

## 增量与边界

- 两端中文与Maple英文Demo各加原生禁用/只读复选框，将状态传给Form。开关及校验按钮位于Form之外，避免整个表单被禁用后无法操作本地结果控制。新增CSS仅用于Demo开关的换行与间距，不改组件Token。
- 文档明确disabled/readonly限制控件交互，不会取消已经发起的校验或清除错误；主动clearValidate/reset才让旧结果失效。没有新增公共API、别名、platform文件或共享实例。
- 使用Vue最佳实践技能检查父级ref、Form继承到原生输入、异步事务与aria-invalid，不以Demo结果文案代替字段状态检查。

## 真实浏览器动作

Cedar4185、Maple8080源码站，不是新生产构建：

1. 两端实际输入guest，点击校验字段，观察校验中/等待1。开启Disable async form，原生input.disabled=true，value仍guest。返回最新结果按Enter，等待归零、未通过、字段aria-invalid=true。禁用没有取消事务，失败仍正确返回，不将其当作内核缺陷。
2. 开启Readonly再解除Disabled，原生disabled=false、readOnly=true，guest与既有错误保留。解除Readonly后实际输入admin，Enter校验，等待1；等待中开启Readonly，再Space返回最新，结果通过、等待0、值admin且readOnly=true，aria-invalid清空。
3. 文档更新后重新构造guest等待，开启Disabled并Enter清空校验：结果已清空/等待1。Space返回旧错误后仍已清空/等待0，input仍disabled、value guest、无aria-invalid。解除Disabled后重新输入admin并发起事务，成功返回，旧错误没有回流。
4. Maple右侧独立guest等待中禁用并返回错误，右侧未通过/aria-invalid=true；中间admin保持通过。两处不共享模型或Promise任务。此是桌面浏览器iframe，不是物理触屏验收。
5. Maple实际进入en-US Form页面，英文Demo输入admin，Enter Validate field，等待时开启Readonly，Space Resolve newest：Validation result: Valid; Pending: 0，原生readOnly=true、value admin。不是只检查英文页面挂载。
6. 最后增加Demo开关间距引发HMR，观察到事务回到初始状态；没有沿用旧截图假称最终产物通过。重新执行两端中文admin/只读成功、Maple右侧guest/禁用失败，以及英文admin/只读成功，保存最终证据：[Cedar](./evidence/cedar-form-state-batch148.png)、[Maple双实例](./evidence/maple-form-state-batch148.png)、[Maple英文](./evidence/maple-form-state-english-batch148.png)。
- 无注入页面状态或合成事件，仅合成账号字符串与本地手动Promise，不访问业务接口。英文验收结束后恢复中文路由，临时页收尾关闭。

## 验证与文档

- 新增两端各1项实际Demo回归，覆盖等待中禁用、错误回写、只读继承、解除后新admin事务通过。与既有async-race测试一并重跑：Cedar2文件4项、Maple2文件5项，共9项通过；包含既有英文、竞争和KeepAlive自动测试，不把自动KeepAlive算作浏览器停用通过。
- Cedar受影响Demo/测试lint通过；Maple定向格式化后全量lint通过，最终新增Demo样式后再跑受影响文件lint也通过。docs:check1040 SFC、0失败；无公共类型改动，不执行全库typecheck或组件包构建。
- Cedar现有中文README、Maple中英文文档同步上述边界；既有Maple手机集合自动引用同一Demo/英文副本，右侧实际验证，无需新增菜单项。调研与菜单72族分类一致，仍56已同源、15逻辑已同源、1独立。
- 未重跑完整文档构建，沿147批核对的未变Token解析阻塞，不接管Token工作、不以源码截图代替新构建验收。两仓与审计diff --check通过。

## 当前覆盖和剩余

部分独立证据仍72/72（100%）、双端68/72（94.4%），不是全Demo完成或通过率；本批不新增族计数。主表早期“真正异步Form仍待”的笼统表述不能解释成从未做异步：104/105批已验证字段竞争和路由清理，本批补交互限制。

并发整表提交、动态字段删除/重排中的异步校验、跨字段依赖与服务端错误竞争、真实KeepAlive浏览器停用、触屏等仍待。未修改组件运行时，不提交、推送或发布。
