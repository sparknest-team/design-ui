# 第一百零四批：两端 Form 真异步字段校验竞争

## 实现与文档

两端新增可手动返回最早/最新结果的本地 Promise 规则 Demo，只接受合成值 admin，不访问网络。显式关闭自动校验触发，通过 validateField 发起事务；界面展示当前模型、校验快照、结果和等待数。示例结果文案用自身序号保护，不能将文案保护冒充 FormItem 内核校验；浏览器另行核对字段错误和 aria-invalid。

清空/重置后保留可返回的旧任务用于验证迟到结果；卸载和 KeepAlive 停用时结清本地等待并使旧结果失效。Cedar README、Maple 中英文文档、右侧双语 Demo 集合均接入源文件，未改组件 API、CSS、共享运行时或规则协议。

## 完整构建站真实操作

- Cedar：`http://127.0.0.1:4183/components/form/?audit=104-built`。第一次初始化遇到动态模块获取失败，普通刷新后恢复；以下动作均在成功挂载后执行，未将失败初始化算作通过。
- Maple：`http://127.0.0.1:4184/#/zh-CN/form?audit=104-built`，使用本批最终完整构建产物。
- 两端均输入 guest 发起校验，再输入 admin 发起新校验，观察等待数 2；先返回最新成功，再返回最早失败，保持“通过”、模型 admin、等待数 0，无字段错误且 aria-invalid 为空。
- 两端均反向验证：admin 旧事务、guest 新事务，先返回新错误再返回旧成功，保持“未通过”、guest 错误和 aria-invalid=true，等待数 0。
- 两端均在 guest 校验等待中清空验证，再返回旧错误，保持“已清空”、模型 guest、无错误和 aria-invalid；在新等待中重置，再返回旧错误，保持“已重置”、空模型、等待数 0，无旧错误。
- Maple 右侧独立实例：guest 返回错误，随后 admin 返回成功；中间实例保持已重置。再令中间 guest 失败，右侧仍为成功，确认两个 Demo 不共享状态。[Maple 双实例证据](./evidence/maple-form-batch104.png)。
- [Cedar 重置后迟到结果证据](./evidence/cedar-form-batch104.png)。本批未做浏览器 KeepAlive 停用、触屏或英文切换验收；其自动测试与浏览器覆盖分开记录。

## 验证

- Cedar 新 Demo 自动回归 3 项通过；Maple 4 项通过（包含英文 Demo）。覆盖正反乱序、清空/重置后迟到、真实新错误、KeepAlive 停用后重新发起；不是整库测试数量。
- 两端 typecheck 通过；Cedar 本批 Demo/测试 scoped ESLint 通过；Maple 全量 lint 通过。Maple 首次 lint 的 4 处 curly 错误已修正后重跑通过。
- Cedar 完整 build:doc 通过，274 页；Maple 最终完整 build:doc 通过，1036 个 Demo SFC 预检 0 失败、4233 modules、Vite 1m9s。Maple 仍有大于 500kB 的 chunk 警告，不作为构建失败，也不声称已优化。
- 两仓 git diff --check 通过。调研与菜单一致性检查通过：72 族，56 已同源、15 逻辑已同源、1 独立。Form 分类不变；不将本次字段竞争通过升级成全部高级 Form 验收完成。

## 未覆盖

并发整表提交、动态字段删除/重排中的异步校验、跨字段依赖与服务端错误竞争、真实 KeepAlive 浏览器停用、Maple 触屏组合仍待逐项验收。此批新增的是字段级校验 Demo，不是远程提交协议；未发现需修复的组件内核缺陷。保留其他聊天变更，不提交、推送或发布。
