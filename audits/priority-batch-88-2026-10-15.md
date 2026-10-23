# 第八十八批：两端 Checkbox 独立值模型与方法

## 真实浏览器交互

- 在本地已构建文档站分别操作 Cedar `/components/checkbox/` 与 Maple `/#/zh-CN/checkbox` 的“独立值模型与方法” Demo。
- 两端初始布尔模型均为 `false`。点击“切换选择”后文案和原生 checked 为 `true`；点击“聚焦”后 `document.activeElement` 是“启用通知”原生 checkbox；在其上按 Enter 后模型回到 `false`；点击“重置”保持 `false`。
- 两端数组初值均为 `[0]`。点击“布尔 false”后模型为 `[0, false]`，原生两个选项均已选中；对“数值 0”按空格后模型为 `[false]`，两种值没有混淆。
- 两端“只读”点击与 Enter 后仍保持 checked，且可聚焦；“禁用”是原生 disabled 且保持初始 checked。操作的是实际 Demo，不是只看挂载或静态源码。

## 文档与验证边界

- Cedar 中文文档与 Maple 中英文文档已有该 Demo 及 API 说明，两个站点菜单均已有 Checkbox 入口；本批没有需要同步修改的文档或菜单源码。
- 两端定向 `control-contract.spec.js` 各 13 项通过。未运行本批全库 lint、类型检查或完整文档重建；浏览器结果针对当前已构建站。没有组件源码改动，未提交、推送或发布。
- 长按重复键、按住空格时失焦/停用、异步竞态及 Maple 触屏组合本批未做真实浏览器验收，不能由单测结果代替。
