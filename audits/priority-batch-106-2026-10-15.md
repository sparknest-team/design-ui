# 第一百零六批：两端 Textarea 清空事件、换行及自动高度

## 真实浏览器验收

使用第 104 批完整构建的 Cedar `/components/textarea/?audit=106-built`、Maple `#/zh-CN/textarea?audit=106-built`。均操作现有“主体与事件契约” Demo 的工作备注文本域，Maple 本批操作中间 Demo，不将右侧挂载计为验收。

1. 初始“可编辑内容”、计数 5/100；点击文本域使清空按钮可操作，再实际点击清空。两端均变为空值、计数 0/100，事件输出精确为 `clear → input → update:modelValue → change`，各一次。
2. 点击第二个“无边框提示”文本域使第一个失焦，两端输出保持不变，清空后的失焦未追加重复 change。
3. 输入八行合成文本 `one\ntwo\nthree\nfour\nfive\nsix\nseven\neight`，两端原生值完整保留、计数 39/100，仅追加 input/update:modelValue。只读 DOM 度量：Cedar clientHeight 114、scrollHeight 180；Maple 120/192，均达到可见高度上限并有内部滚动内容。随后点击另一文本域，各追加一次 change。
4. 将内容缩为 x，再按实际 Enter，两端值精确为 `"x\n"`、长度 2；事件仅追加 input/update:modelValue，没有 Enter 触发的 change。Cedar 高度恢复 48、scrollHeight 48；Maple 恢复 96/96，与各自清空时的最小高度相同。

本批只证明当前构建主题下的伸缩和事件行为，不将两端几何数值视为相同，也不接管其他聊天的 Token 工作。事件输出仅保留最近 8 项，因此以每个动作前后观察为依据，不把最终输出当作完整历史。

[Cedar 换行及回缩证据](./evidence/cedar-textarea-batch106.png)；[Maple 换行及回缩证据](./evidence/maple-textarea-batch106.png)。

## 验证及同步

- 两端各运行 Textarea 主测试、auto-size 和 body-contract 三文件：Cedar 14 项通过，Maple 16 项通过；浏览器度量与自动测试分开记录，未模拟 IME 来冒充真实中文输入法。
- 两仓 git diff --check 通过。调研/菜单检查通过，72 族（56 已同源、15 逻辑已同源、1 独立），Textarea 仍为已同源，不升级为所有交互已验收。
- 本批未发现需要修改的组件或 Demo 缺陷，无源码/API/CSS 变更。两端现有文档已说明清空顺序、失焦与自动高度，保持原文；新增本验收证据和主索引，不重复改写组件说明。未重跑类型、lint 或完整构建，沿用第 104 批成功构建产物。
- 仍未覆盖真实 IME 合成、手动 resize 拖拽、特殊 Unicode 长度与裁剪、Form 内复杂继承、Maple 触屏及右侧该组合。保留其他脏仓库改动，不提交、推送或发布。
