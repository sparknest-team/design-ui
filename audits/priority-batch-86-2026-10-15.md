# 第八十六批：两端 Radio 键盘导航

## 真实浏览器交互

- 在本地已构建文档站分别操作 Cedar `/components/radio/` 与 Maple `/#/zh-CN/radio` 的独立“键盘导航” Demo；只使用内置通知方式选项。
- 两端初值均为 `email`，原生“邮件”已选。对“邮件”按 ArrowRight 后，焦点进入只读项，但值仍为 `email`；再按 ArrowRight 会跳过禁用项，焦点和模型同步到 `sms`。
- 从短信按 Home 回到邮件，按 End 回到短信；短信按 ArrowRight 循环回邮件。点击清空后模型为空、所有原生 radio 均未选，首个可用项恢复 `tabIndex=0`。浏览器核对了 `document.activeElement`、原生 checked、disabled 和文案，而不只检查页面挂载。
- 两端原文档与菜单已有 Radio 入口，Maple 中英文文档均有键盘导航 Demo；未发现组件行为故障。

## 文档与验证

- Cedar Radio 中文 README 的 `aria-label` Props 行原被空行拆出表格，已合回表格；自定义 Radio 示例把“复选框”误写为组件名，也已修正文案。Maple 对应文档无需改动。源码更改尚未经过完整文档重建，因此本批浏览器结果针对修改前已构建站；文档排版修复按源码检查记录，待后续完整构建复核，不冒充浏览器确认。
- 两端定向 `radio-navigation.spec.js` 各 13 项通过；Cedar 文档改动 `git diff --check` 通过。未运行两端全库 lint/typecheck 或完整文档构建；未提交、推送、发布。
