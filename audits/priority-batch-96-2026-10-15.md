# 第九十六批：两端 Upload 外部进度的取消、完成与重试

## 发现与修复

- 原外部进度 Demo 的完成操作会无条件将所有项改为 success，可能覆盖 canceled 状态。两端示例现在只完成仍处于 uploading 的项，加入可生成 27 B 合成文本项的公开操作入口，以及明确的队列状态摘要。
- 在 Maple 中间新构建站实际取消后，内置“重试”按钮可见但点击无变化；该示例没有配置 action/custom-request，内置请求重试没有 transport 可运行。两端示例现隐藏内置重试，提供业务模型驱动的“模拟外部重试”，只恢复 canceled/error 项。完成和重试在没有对应候选时禁用。
- Cedar 中文、Maple 中英文 Demo 和文档已同步，Maple 英文小节改为 Application-managed progress。没有改动 Upload 运行时或公共 API，没有使用外部服务或文件选择器。

## 最终新构建站真实交互

Cedar `/components/upload/?audit=96-final` 与 Maple `?audit=96-final#/zh-CN/upload` 分别实际执行：

1. 空队列时完成/重试禁用。加入 external-1.txt 和 external-2.txt，两项均为 uploading (40%)。
2. 取消第一项后点击外部完成：第一项保持 canceled (0%)，第二项 success (100%)；取消项只有删除按钮，不再显示无效的内置重试。
3. 点击外部重试：第一项恢复 uploading (40%)，第二项保持 success (100%)；再点击外部完成，两项均 success (100%)。
4. 加入第三项并在上传中删除，再加入第四项并完成；队列仅有第 1、2、4 项，已删除的第 3 项没有回流。
5. 逐项删除全部文件，队列为空，完成/重试均禁用。两端模型摘要与实际列表结果一致。

## 自动验证与边界

- 修复过程中两端原 Upload 整组分别通过 Cedar 45 项、Maple 73 项。补针对性 Demo 回归后，Cedar queue-demo 5 项、Maple queue-demo 7 项通过，包含中英文外部进度取消保留、重试与删除后不回流。
- 最终 Demo/测试受影响文件 ESLint、两仓 git diff --check 通过；Maple 全量 lint:check 在加入最终重试入口前通过，最终入口和测试另经定向 lint 通过，不把旧全量结果写成对最终文本的全量验收。
- 两端最终完整 build:doc 通过：Cedar 274 页；Maple 1032 个 Demo SFC 检查无失败，Vite 构建通过，保留大分块提示。菜单/调研生成检查通过：72 族、56 已同源、15 逻辑已同源、1 独立；Upload 仍为逻辑已同源，无需更改分类。
- 本批验证公开 Demo 的外部受控队列流程，不覆盖原生文件读取、替换后的 accept/大小/数量校验、真实网络或触屏拖放；这些仍在后续验收清单。未提交、推送或发布。
