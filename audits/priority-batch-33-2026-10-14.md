# 第三十三批：选择分组、异步与示例语言

北京时间 2026-10-14 11:51 开始。只修改示例、测试和文档，保留其他工作中的源码与 Token 改动。

## 修复

- Cedar/Maple Checkbox、Radio 示例外层 Space 的错误 `vertical` 改为 `column`，不改选择组的合法 `vertical` API。
- Maple 20 个旧基础示例接入站点 watchLang，直接中英文文案；数字 0、布尔 false 和设备 ID 不变，不引入局部 t/use。

## 实际交互（构建前已有页面）

- 两端 Checkbox 异步选项：加载选项后选择 a，模型为 remote/a；移除选项模型保留，重载两个选项都勾选，disabled 项未选且禁用。
- 两端受控拒绝：点击 b 后提议为 b，但受控输入仍未选中；开启只读后在 b 按 Space，accepted 仍只有 a。
- 上述为原生产页面的实际交互，不作为本批最终样式/语言验收。Radio 键盘与最终重建后验收尚待完成。

## 自动验证进度

- Maple 12 文件/139 项通过，另新增 2 项真实 Demo 语言切换测试通过：英文选数字 0，再切中文，模型与勾选不变。
- Cedar 串行全组选入 node 环境 SSR 测试时 Vue DOM 缓存为空；剔除 SSR 文件后 10 文件/96 项通过，SSR 独立 4 项通过（close timeout 警告但退出码 0）。旧 Vitest 不支持 --exclude，改用明确文件列表。不修改组件来掩盖环境问题。
- Maple 全量 lint、Cedar 受影响 Demo lint 与两端修改范围 diff --check 通过。菜单/调研检查通过，72 族分类仍为 56 已同源、15 逻辑已同源、1 独立，不冒充全交互验收完成。
- Maple 首次完整文档构建通过，1007 SFC/0 失败、45.98s；补充中英说明后最终完整构建通过，1007 SFC/0 失败、35.01s。Cedar 完整构建通过，274 页、286.76s。
- Maple 首次重建后的 Radio 实际键盘：Email→ArrowRight 聚焦只读项但值仍 email；再 ArrowRight 跳过 disabled 到 sms；Home→email、End→sms；Clear 后全部未选。外层 Space 计算样式为 column。中间与右侧基础示例均显示英文。
- 最终构建后两端 Radio 异步：选择 a，移除选项仍为 a，重载仍选 a，disabled 项不可用。Cedar Radio 同样实际完成只读聚焦不改值、跳过 disabled、Home/End、清空。
- 最终两端 Checkbox 复验：remote/a 移除与重载保留；只读 Space 不改变 accepted/a；父级拒绝只记录 b。外层 Space 实际计算为 column。
- 最终 Maple 语言切换：英文→中文显示吃饭/睡觉/打游戏；切回英文，Radio Sleep 回写数字 1，Checkbox Eat 回写数字 [0]。右侧实例保持自己的初始值。整站语言切换会更换路由/重建示例，不能据此宣称路由切换保留全部 Demo 状态；组件内语言变更保持业务值由新增单测覆盖。
- 证据 `/private/tmp/maple-radio-keyboard-batch33.jpg`、`/private/tmp/maple-checkbox-async-batch33.jpg` 已检查；另存 Cedar Radio 键盘与双端 Checkbox 异步截图。

## 本批收尾与剩余

本批通过两端共 241 项测试（Cedar 100、Maple 141）、所列 lint 和完整文档构建。菜单保持原同源分类，没有升级为全 Demo 交互完成。

收尾补充（第三十四批确认）：Cedar 最后新增说明段的完整补跑构建通过，274 页、181.24s；冷加载 Checkbox 页面确认说明段确实显示。第三十三批构建收尾完成。

尚未覆盖：右侧移动 iframe 的整套键盘/批量方法交互、真实触屏长按、Form 嵌套与所有 slot/字段映射组合。下一批继续批量方法最大值/锁定项、范围输入和组合控件。并非所有组件与所有 Demo 已验收；不把挂载、静态截图或已有单测冒充真实交互。

截止仍为北京时间 2026-10-15 00:00。未提交、推送或发布；未执行整库类型或 npm 包构建。
