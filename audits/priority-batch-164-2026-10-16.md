# 第一百六十四批：Form 整表与字段校验交错

## 实现范围

- 核对163批、主表和两仓Form在途修改。既有async-race示例只有validateField入口，本批增加“校验整表”调用公开validate()；原字段入口保持validateField('name')。共用同一Demo状态版本保护，不向校验内核添加并发分支。
- Cedar中文、Maple中英Demo同步；发现英文reset状态混写“已Reset”，修正为Reset。未改Form内核、公共API、Token或并行FormItem.vue。
- 组件中英文说明明确：只有一个异步字段，不能据此推出多字段聚合、跨字段依赖或原生submit事件并发已通过。Demo结果文字有独立run保护，字段错误反馈的正确性另行核对，不将Demo保护冒充整个内核保证。

## 两端真实浏览器操作

Cedar4185和Maple8080源码开发页，公开按钮与合成用户名，不访问业务服务。

1. 输入guest后校验整表；改admin后校验字段。等待2，先返回最新成功再返回最早失败，保持通过、admin、等待0，无旧用户名错误。
2. 以admin校验字段后改guest校验整表，先返回最新失败再返回最早成功。两端保持未通过、用户名必须是admin错误；Cedar另核对aria-invalid=true，Maple公开红色错误及文案核对。
3. guest再次校验整表，等待中重置，随后返回最早旧失败：模型空、已重置、等待0，错误不恢复。
4. 两端随后admin新整表校验、返回最新结果均通过/等待0，证明重置后没有锁死。最终重置并核对等待0后关闭临时页，保留原开发服务。
5. 证据evidence/cedar-form-whole-batch164.png、evidence/maple-form-whole-batch164.png保存于步骤2失败保留阶段；Maple右侧仍初始空模型，未操作该侧，不将截图视为右侧交互通过。

浏览器仅CUA真实操作与DOM只读核对，无注入校验结果或访问Vue内部状态。未单独做英文浏览器，Reset文案有英文示例自动挂载回归与语法检查，但不标为英文浏览器通过。

## 自动验证与同步

- 新增两端独立async-whole-demo.spec.js各2项，覆盖两种入口发起次序、旧失败/新成功与旧成功/新失败以及整表等待重置后迟到结果。测试检查公开输入aria-invalid及Demo状态，不只检查挂载。
- Cedar六个异步示例测试文件11项，Maple五文件9项，共20项通过；不是整个Form测试集。
- 两端完整typecheck通过；Cedar受影响Demo/测试ESLint、Maple全量lint:check通过；Maple docs:check1044个SFC、0失败。两仓及审计仓diff --check通过。
- 既有Demo集合同步引用，无新增组件或菜单项。component-reuse-sync --check通过；同源56（77.8%）、逻辑同源15（20.8%）、独立1（1.4%）。
- 至少一端部分证据72/72（100%）、双端部分68/72（94.4%）；本批深化Form而非新增族，不能据此给出全场景完成率。后续仍待多字段并发、数组重排、跨字段异步依赖等。
- 未重跑完整生产文档构建，保留Token阻塞边界；本批证据为源码站。未提交、推送、发布。
