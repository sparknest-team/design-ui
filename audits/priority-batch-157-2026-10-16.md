# 第一百五十七批：Upload 默认 XHR 的异步 headers/data 与取消

## 实现与本地接收器

- 两端新增独立metadata-request Demo，Maple另有英文文件和右侧集合入口；使用默认XHR transport，不通过custom-request手工解析元数据。headers/data分别保留Promise，按钮手动结清。
- 接口地址默认空，未填写不能提交；没有预设外部上传服务。示例只生成28字节合成文本，固定文件字段attachment、header X-Demo-Upload和表单auditMarker。无凭据。
- 新增审计fixture：`node audits/fixtures/upload-metadata-server.mjs`，仅绑定127.0.0.1:4197、限定本地文档站CORS来源、请求体上限16KiB、不存储文件；响应累计POST数与字段检查结果。首次沙箱监听EPERM，经工具批准在沙箱外启动；验收后已按核对的PID停止，端口无监听。未更改系统网络/安全设置。
- 两端中文和Maple英文说明已同步，说明接收端/CORS前提和无默认地址。没有修改Upload内核、公开API、共享运行时或platform配置。

## 默认 XHR 真实浏览器交互

使用Cedar4185、Maple8080源码开发站，填写本机接收器地址。仅用可见控件操作，没有注入XHR或浏览器内部状态。

1. Cedar加入合成文件并提交，headers/data各等待1。只返回headers后取消，再返回data，模型canceled、成功0、错误0。重试后只返回data、取消、再返回headers，仍canceled且无终态回调。
2. Cedar第三次提交，只返回headers时data仍等待1、成功0；返回data后真实XHR成功。公开响应received=1、header=metadata-1.txt、marker=true、attachment=true，证明之前两个取消尝试没有POST到接收器，元数据和文件字段实际进入请求。
3. Maple重复两种取消顺序，均canceled/成功0/错误0。第三次提交先返回data（headers仍等待1），再返回headers，XHR成功，响应received=2、同样三个字段检查正确。
4. Maple右侧独立实例提交，只返回headers后取消、再返回data，保持canceled、成功0、错误0；中间保持success、成功1，互不影响。
5. 接收器控制台只记录上述两条POST响应，没有右侧取消项或前四次取消尝试的额外请求。它不是单测fake XHR，也不使用外部业务服务。

本批核对的是异步headers/data及同步name=attachment。没有宣称异步name（公开类型当前为string或同步函数）、所有元数据异常、真实大文件/触屏/选择器均已验收；英文源码和语法已同步，未另做英文浏览器。

## 验证与进度

- Cedar完整Upload52项、Maple83项，共135项回归通过；新增metadata-demo各1项，fake XHR断言两个取消分支send均未调用，正常分支只send一次。自动mock证据与上述实际XHR证据分开记录。
- Cedar受影响Demo/测试ESLint、Maple全量lint:check通过；Maple docs:check1044个Demo SFC、0失败；fixture node --check、两仓diff --check通过。
- 新增JS Demo，无公开类型或内核改动，未跑全库typecheck/完整生产文档构建；沿用Token构建阻塞边界，证据为源码开发站。
- 菜单/调研生成检查通过：72族，完整同源56、逻辑同源15、独立1。Upload状态不变；组件中英文文档、移动集合与主索引同步。
- 部分证据仍至少一端72/72（100%）、双端68/72（94.4%），不是全Demo/全场景完成率。元数据拒绝/异常、准备总大小并发、真实文件读取与触屏等仍待。
- 证据：evidence/cedar-upload-metadata-batch157.png、evidence/maple-upload-metadata-batch157.png。未提交、推送、发布。
