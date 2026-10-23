# 第一百五十三批：Form 服务端显式错误与迟到校验结果

## 真实故障

- 两端既有async-race Demo新增本地“写入服务端错误”按钮，使用公开setFields为name设置error/message，保留待返回任务。示例结果文案单独递增序号，不把文案保护当作内核通过。
- Cedar4185：admin校验等待时写入错误，再返回旧成功，原生aria-invalid=true且模拟服务端拒绝文字保留。
- Maple8080修复前：相同操作后aria-invalid仍为true，但错误文字消失；测试也复现。初次查找错误文字超时后检查实际DOM，确认是真实消息被清掉，不是把找不到内容认作通过。
- 根因：FormItem.setField仅失效外层validationTask，useValidation内部独立事务仍能将迟到成功的空消息写回（旧失败也可能覆盖显式消息）。

## 修复

- Maple FormItem在应用显式status/message前调用已有resetValidation，同时失效规则工具内部事务，再写入显式消息。无新API、共享运行时或platform配置；Cedar已有guard没有复现，不作无意义对应改动。
- 两端中文及Maple英文Demo/文档补充显式错误竞争与新校验恢复路径。按钮位于Form外；卸载字段时不可用，不调用真实业务接口。

## 修复后源码开发站交互

1. Maple刷新加载修复后的组件。分别输入admin、guest发起校验，等待中写入模拟服务端拒绝；返回旧成功/旧失败后，服务端错误文字和aria-invalid=true均保留，等待降至0。
2. 各轮主动清空校验，aria-invalid清空、显式错误文字退出；Cedar也实测guest迟到失败不能覆盖显式错误。
3. 两端重新写入显式错误，不先清空，直接输入admin发起新校验并返回成功；结果通过/等待0、aria-invalid为空、旧消息节点数量0。新事务可正常替换显式错误。
4. Maple右侧独立实例admin等待中写入错误、再返回旧成功，仍显示服务端拒绝和true；中间保持admin通过/等待0，实例隔离。

没有真实网络、英文浏览器、触屏或服务端提交版本协议验收。setFields失效本地校验不等同取消网络请求。

## 验证与进度

- Cedar完整Form目录35项、Maple完整Form及foundation validation-adapter共53项通过，总88项；新增Demo回归各1项。最后补充“显式错误不先清空直接新校验”断言后两端该测试各重跑1项通过，不重复累加为90项。
- Maple全库typecheck和lint:check通过；Cedar受影响Demo/测试ESLint通过。Maple docs:check为1040个Demo SFC、0失败；两仓diff --check通过。
- 完整生产文档构建仍沿用Token阻塞边界，本批未重跑，源码站验收不冒充生产构建验收。无Cedar公开类型改动，未跑Cedar全库typecheck。
- 菜单/调研生成检查通过：72族，完整同源56、逻辑同源15、独立1，Form分类无需改变。主索引同步。
- 部分浏览器证据仍至少一端72/72（100%）、双端68/72（94.4%），不是全场景完成率；整表并发、数组重排和跨字段组合等仍待。
- 证据：evidence/cedar-form-server-batch153.png、evidence/maple-form-server-batch153.png。保留并行改动，未提交、推送、发布。
