# 第八十七批：两端 Checkbox 原生控件与分组上限

## 真实浏览器交互

- 在本地已构建文档站分别操作 Cedar `/components/checkbox/` 与 Maple `/#/zh-CN/checkbox` 的“原生控件与外观” Demo，而非仅检查挂载。
- 两端初始“接受协议”均未选中。鼠标点击后选中且标签改为“已接受”；空格取消、Enter 再次选中，原生 `checked`、`aria-checked` 与标签一致。
- 两端“只读已选”可获得焦点，点击、空格、Enter 后仍保持选中；“禁用”是原生 disabled 输入；“部分选中”的 `aria-checked` 为 `mixed`。
- 两端权限组初值为 `read`。选择“编辑”后模型文案变为 `read, edit`，未选“管理”在达到 `max=2` 后为 disabled。取消“读取”再选“管理”，模型变为 `edit, admin`；原生选中状态与文案一致。已选项仍可取消，未选项在上限时被禁用。

## 文档、菜单与验证边界

- Cedar 中文组件文档已有该 Demo 和键盘/只读/上限说明；Maple 中英文组件文档均已有对应 Demo。两端菜单均已有 Checkbox 入口，本批无需改动组件、文档或菜单源码。
- 两端定向 `body-contract.spec.js` 与 `control-contract.spec.js` 各 22 项通过。未运行本批全库 lint、类型检查或完整文档重建；浏览器结论仅针对当前已构建站。
- 尚未覆盖其他键盘竞争、异步更新竞态和 Maple 触屏组合；不将本批认作 Checkbox 全部交互验收完成。未提交、推送或发布。
