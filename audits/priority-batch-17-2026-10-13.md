# 第十七批：严格周手输与季度回归

## 完成

- 两库实际 Dayjs 复验纠正上一批初步判断：YYYY-[Q]Q 已原生严格支持，真正失败的是 gggg-wo。先添加测试，复现 3 个周失败；不另写季度重复解析器。
- 默认周文本按实例 UI 语言、weekStart/yearStart 定位周起始日，再格式化与完整原文比对；拒绝不存在的周号、错误序数、非标准补零和前后空白。模型继续 YYYY-MM-DD。
- 使用原有所有者禁用/只读/边界/范围提交，手输范围不自动重排。Cedar 所有者新增跨年周提交、禁用/只读/非法文本、反序范围和季度模型回归。
- 解析逻辑与 5 项核心测试独立复制至 Maple；日期复制门禁 40 对，不为移动端增加未实现的周/季度展示 API。
- 新增 Cedar 周/季度/周范围手输 Demo，更新两端手输格式说明、研究记录/Maple 菜单、Cedar OpenSpec 与两库 patch changeset。

## 验证

- Cedar 日期逻辑/DOM 23 文件 101 项通过，独立 SSR 4 项通过，共 105 项，进程正常退出。
- Maple 日期族 25 文件 137 项通过，含 SSR；无跳过，无更新快照。
- 两库源码 typecheck、build:lib、发布消费者 typecheck:contracts 通过。
- Maple 全库 lint 首轮检出链式调用换行，已精确格式化并复制回 Cedar；第二轮全库 lint:check 通过。Cedar 受影响 ESLint 格式回拷后复验通过。
- Maple 996 份 Demo SFC、Cedar 新增 period-text Demo 编译通过。
- 40 对复制门禁、71 族调研菜单、公开导出审计、Token 目录与 API 清单生成通过（129/119/97）。
- 发布样式依赖图 Cedar 96 入口/98 Less、Maple 91/93 通过，无环/缺失或重复内嵌基础样式，foundation 与 Loading 单次加载。本批无新增 CSS Token。
- 本批路径 git diff --check 通过；未做整站生产文档构建或真实浏览器视觉/触屏验收。

## 下一批

真实调用链发现 Maple Date/DateRange 虽有 inputEditable=true，DateFieldContent 却未给 PickerField 传 editable/commit，也在输入点击时直接打开 Popup。公共所有者测试不代表手输界面已实现。下一批补齐公共可编辑条件、移动输入和面板触发分离、单值/范围真实原生输入回归及 Demo/文档；multiple/函数 format 没有文本逆解析协议，保留面板选择，不伪装支持。

继续双库独立同源、无共享运行时或 platform 配置，不提交、推送、发布；截止北京时间 2026-10-13 14:00。
