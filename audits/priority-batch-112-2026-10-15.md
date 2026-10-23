# 第一百一十二批：两端 Link 加载转换与键盘焦点

本轮核对第111批、主表及两仓脏变更后，继续补独立组件族记录。复用 Cedar 4185、Maple 8080 源码开发站，不接管并行 Token、Anchor 等改动。

## 浏览器实际交互

- Maple `#/zh-CN/link?audit=112-source` 中间“点击加载”：真实点击后 `aria-busy=true`、`aria-disabled=true`、`tabindex=-1`，没有 href。约三秒模拟工作结束后三个状态属性恢复为空。[加载中证据](./evidence/maple-link-batch112.png)。
- Maple 右侧 iframe 的“点击加载”另行实际点击，右侧 busy=true 时中间 busy 仍为空；随后右侧也恢复为空，证明本次两个实例没有共享 loading 状态。
- Cedar `/components/link/?audit=112-source` 同样点击后进入 busy/disabled/tabindex=-1，随后恢复；再次点击可开启新的加载周期。[Cedar 加载证据](./evidence/cedar-link-batch112.png)。
- 两端带 `href="#link"` 的“Tab 键聚焦”示例通过键盘 ArrowRight 聚焦，实际 activeElement 为该链接、outline-style=solid。Maple 再 Tab 离开，焦点到源码工具条而不是禁用链接。没有激活 example.com 外链，不声称外部导航已验收。
- 两端禁用锚点实际 DOM 均为 aria-disabled=true、tabindex=-1、href=null；本批未强制点击禁用节点，不将属性检查等同于已证明 click 事件计数为零。无 href 的动作式链接 Enter/Space、加载期间重复点击与路由卸载清理尚未浏览器验收。

读取的是可见 DOM 与原生焦点，不读取 Vue 状态。禁用锚点的首次文字选择器与目录/属性表同名，改为实际锚点类名限定后读取；没有将定位失败当作组件错误。两端本批未捕获 error 级日志。

## 验证、文档和菜单

- Cedar Link 2 文件 10 项、Maple 2 文件 17 项专项回归通过，共27项。自动测试含禁用 click 阻断，但它不是上述浏览器事件证据。
- 未发现本批需修复的新缺陷，不修改源码/API/样式/Demo。中文及 Maple 英文文档已描述 loading、disabled、原生 href 和焦点语义，无需制造重复说明；主验收表新增本批记录。
- 菜单/调研同步检查通过：72族，56已同源、15逻辑已同源、1独立，Link 分类不变。两仓及审计仓库 git diff --check 通过。
- 无源码变化，未重跑类型、lint 或完整构建；仍不宣称第107批生产构建阻塞已解除。Maple AGENTS 引用的旧全局路径 `/Users/jiaming.wu/AGENTS.md` 本机不存在，已遵循当前仓库内可用指引。
- 有独立部分交互证据 41/72（56.9%），其中双端部分记录37/72（51.4%），尚无独立族级记录31/72（43.1%）。这不是所有 Demo/配置完成率。
- 仍待触屏、完整点击事件次数、加载期间竞争、无 href 动作链接键盘和导航/卸载组合。未提交、推送或发布。
