# 第六十二批：Form 自定义控件与动态字段真实交互

## 范围

- Maple `/zh-CN/form` 的“自定义表单控件” Demo；Cedar `/components/form/` 的“动态表单” Demo。两端是各自已有的不同高级场景，未把它们误算成同一个跨端用例。
- 本批未修改组件或 Demo 源码。

## 浏览器实测

1. Maple 自定义控件初始 `confirmed=false`。点击“校验”出现“请先确认”；点击“点我切换”后 `aria-checked=true`、可见模型变 `true`、错误消失；再次校验无错误。
2. 勾选“禁用表单”后控件原生按钮 `disabled=true`，点击被阻止，模型保持 `true`。取消禁用并勾选“只读字段”后 `aria-readonly=true`，点击仍可聚焦但模型和 `aria-checked` 不变。取消只读并点击“重置”，模型与 `aria-checked` 均恢复 `false`，无遗留错误。
3. Cedar 动态表单输入用户名 `alice`、首行 `first`，新增第二行并填 `second`，模型显示 `posts=[first,second]`。删除首行后仅剩 `Post-0`，输入值和模型均为 `second`，说明重排未串值。
4. 再删除剩余行，模型变 `posts=[]`、只剩用户名输入；重新新增后出现空的 `Post-0`，模型为 `posts=[{value:""}]`，用户名仍为 `alice`。

## 同步与边界

- 两端已有对应中英文组件说明和 Form 菜单入口，复用状态仍为“逻辑已同源”，本批无需改文档或菜单。
- 以上是实际页面点击、输入、模型和 DOM 状态核对。未改源码，故未重跑单测、lint、类型或完整构建。Maple 动态数组字段、Cedar 自定义控件、跨端高级表单的其他组合尚未验收；未提交、推送或发布。
