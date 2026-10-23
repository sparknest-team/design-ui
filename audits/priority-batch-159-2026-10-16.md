# 第一百五十九批：Upload 异步元数据拒绝与新旧事务

## 范围与示例

- 承接157批默认XHR成功/取消验证，本批补异步headers/data Promise拒绝。两端现有metadata-request Demo添加“拒绝 headers / 拒绝 data”；Maple英文文件同步。按钮结清相应队列全部等待项，包含旧尝试，用于显露竞争。无新组件或公开API，无内核修改。
- 默认接口仍留空；本批填写127.0.0.1:4197/upload，但所有尝试均在准备阶段拒绝或取消，没有安排成功请求或启动本地接收器。不能把本批错误状态称为HTTP错误、真实网络失败或成功传输。使用28字节合成文本，无凭据/外部业务服务/文件选择器。
- Cedar中文、Maple中英文组件说明补充拒绝、重试、迟到结果和重置语义；既有移动集合自动引用修改后的文件，无新菜单项，分类不变。

## 真实浏览器动作与结果

Cedar4185、Maple8080均为源码开发站，CUA可见控件实际操作，没有注入Promise、XHR或Vue内部状态。

1. 两端分别加入合成文件，提交后headers/data各等待1；拒绝headers，模型error、错误1，data仍等待1。
2. 不结清旧data直接再次提交，再“返回 data”同时返回旧、新data：当前模型保持uploading，headers等待1、错误仍1；随后拒绝当前headers，模型error、错误2，无重复终态。
3. 再次提交后拒绝data，模型error、错误3，headers仍有旧等待。再次提交并取消，然后拒绝所有headers/data，模型保持canceled，成功0、错误3，没有迟到拒绝计数。
4. Maple右侧独立加入文件、提交、拒绝data，再返回headers，右侧error、成功0/错误1；中间仍canceled、成功0/错误3，互不干扰。
5. 两端及Maple右侧点击重置，等待/成功/错误全部0，文件为空。临时页面已关闭，既有开发服务保留。
6. Maple第一次进行到错误3后，文档更新触发HMR将示例重置；新一轮提交入口因空模型禁用。读取实际状态后，在更新结束的稳定页面从头重跑1—4，全部结果再次确认。不把开发HMR重建认定为上传事务错误。

证据：evidence/cedar-upload-metadata-reject-batch159.png、evidence/maple-upload-metadata-reject-batch159.png。截图保留站点上下文，Maple右侧可见错误1；中间和右侧具体计数另由DOM只读文本核对。未单独进行英文浏览器、真实触屏或HTTP失败验收。

## 自动验证与边界

- 两端各新增1条Demo交互回归，包含两个元数据拒绝分支、旧任务结清、新重试、取消后拒绝与重置；fake XHR断言所有这些分支send均未调用。它是自动测试证据，与真实浏览器的公开模型/回调显示分开记录，不冒充实际接收器记录。
- Cedar完整Upload53项通过（进程exit0，随后有既存close timed out after 1000ms提示）；Maple完整Upload84项通过，共137项。
- 首次新增测试断言误选了Upload文件项自身的role=status“点击重试”，收窄至Demo的p[role=status]后回归通过；不更改组件可访问性语义来迁就测试。
- Cedar受影响Demo/测试ESLint、Maple全量lint:check通过；Maple docs:check1044个SFC、0失败；两仓diff --check通过。
- 没有类型/API/内核更改，本批未再跑完整typecheck。完整文档构建不重复执行：两端Token阻塞文件hash仍与132/156批一致（Cedar4102526468bfddb774382ad75ec9a55d5766bf62，Mapleaaf1ea4f67aaa413c3271ef442a8ac373af5ed27），不接管并行Token任务，不将源码站视为生产构建验收。
- 菜单/调研component-reuse-sync --check通过：72族，同源56（77.8%）、逻辑同源15（20.8%）、独立1（1.4%）。至少一端部分证据72/72（100%），双端部分68/72（94.4%）；不是整库全场景通过率。
- 后续仍有Upload其他配置/准备总大小竞争与真实传输异常、Scheduler高级组合、Form高级异步、日期时间边界、物理触屏等。未提交、推送或发布。
