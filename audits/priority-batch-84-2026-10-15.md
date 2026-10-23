# 第八十四批：两端 Checkbox / Radio 异步选项

## 生产站浏览器交互

- 在本地已构建文档站分别操作 Cedar `/components/checkbox/`、`/components/radio/` 和 Maple `/#/zh-CN/checkbox`、`/#/zh-CN/radio` 的“异步选项”独立 Demo；只使用 Demo 内置的 Promise 数据，无外部请求。
- Checkbox 两端初始模型均为 `["remote"]` 且无渲染选项；点击“加载选项”后“异步设备”选中，“设备 A”未选，“停用设备”原生禁用。点击 A 后模型为 `["remote","a"]`；取消 remote 后模型为 `["a"]`。点击“移除选项”后三个控件卸载但模型仍为 `["a"]`；重新加载后 A 选中、remote 未选，禁用项仍不可操作。
- Radio 两端初始模型均为 `remote` 且无选项；加载后 remote 选中，点击 A 后模型为 `a` 且仅 A 选中。移除选项后模型仍为 `a`；重新加载后 A 继续选中、remote 未选，停用设备原生禁用。

## 文档与验证范围

- Cedar 中文文档与 Maple 中英文文档均已收录独立“异步选项” Demo，菜单入口也存在；未发现新故障，因此本批无需改组件、Demo 或文档，仅同步验收记录。
- 两端各自的 Checkbox `group-options.spec.js` 15 项和 Radio `native-body.spec.js` 8 项定向测试均通过。Maple 起初通过 `maple-cli test` 传文件名时仍启动全套测试，已停止，随后改用仓库现有 `maple-cli` Vitest 配置做定向测试；不把中途停止的全套测试计为通过。
- 这不是异步竞争、最大数量、拒绝受控更新、键盘操作或触屏操作的验收。没有修改运行时代码；审计记录 `git diff --check` 通过。未提交、推送或发布。
