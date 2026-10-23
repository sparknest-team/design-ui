# 第一百五十五批：Upload 延迟请求句柄、取消与重试

## 实现与边界

- 两端新增各自独立的late-request Demo；Maple另有英文源文件和右侧双语集合入口。公开useUploader配合本地合成File，自定义请求返回待手动结清的Promise，没有真实传输。
- 显示待句柄数、请求发起数、句柄abort数和被队列接受的success数。保留旧回调供手动返回，不用Demo自身过滤回调来伪装内核隔离。重置/停用/卸载使计数版本失效、取消上传、结清本地句柄并清理回调。
- 中文文档及Maple英文文档说明这些是内核回调接受计数，不是真实网络成功。没有修改Upload运行时或公共API、共享实例/运行时或platform配置。
- 核对实现发现异步headers/data/name由默认XHR transport解析，自定义请求接收的是未解析配置；本轮不通过自定义请求模拟其已验收。真实元数据路径仍需本地接收接口，继续保留未验收。

## 源码开发站真实交互

1. Cedar4185、Maple8080各加入本地文件并发起请求：待句柄1、发起1、abort0、有效成功0，模型uploading。取消，再用Enter返回旧句柄、Space返回成功回调；待0、abort1、有效成功0，模型仍canceled。
2. 两端重置，加入文件、发起、取消、再次发起，观察待句柄2、发起2。统一返回句柄及全部成功回调后：待0、发起2、abort1、有效成功1，只有当前尝试将模型改为success。
3. Maple右侧独立实例执行取消/返回句柄/旧成功，保持canceled和有效成功0；中间保持success和有效成功1。
4. Maple切换英文路由，中间Demo实际Add/Start/Cancel/Return handles/Return success，结果为Pending handles0、Requests1、Aborts1、Accepted successes0、模型canceled，英文文案正确。未把右侧英文或真实触屏计为本批通过。

Cedar首次新建页导航等待超时后复用已打开tab144，成功加载再操作。Maple首次双句柄流程中热更新重建Demo为初始状态，未将句柄按钮已禁用的失败操作算通过；更新稳定后重新完整执行步骤2并核对计数。

## 验证与同步

- Cedar完整Upload目录51项、Maple82项，共133项通过，新增late-demo回归各1项，覆盖取消后句柄abort、旧回调失效、重试只接受一次和重置。
- Cedar受影响Demo/测试ESLint、Maple全量lint:check通过；Maple docs:check1042个Demo SFC、0失败；两仓diff --check通过。新Demo为JS、无公共类型/API变更，本批未跑全库typecheck。
- 菜单/调研生成检查通过：72族（完整同源56、逻辑同源15、独立1），Upload分类不变。中英文组件说明和右侧集合已同步，主索引追加。
- 未重跑完整生产文档构建，保留Token阻塞边界；浏览器为源码开发站。KeepAlive清理仅本例实现核对，未新增真实停用验收。
- 部分证据仍至少一端72/72（100%）、双端68/72（94.4%），非全Demo/全场景完成率。异步元数据、准备总大小并发、原生文件选择/读取、触屏等仍待。
- 证据：evidence/cedar-upload-late-batch155.png、evidence/maple-upload-late-batch155.png、evidence/maple-upload-late-english-batch155.png。未提交、推送、发布。
