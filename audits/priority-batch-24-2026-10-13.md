# 第二十四批：依赖层门禁收口与移动选择样式边界

> 后续状态：下列六组失败已在[第二十五批](./priority-batch-25-2026-10-13.md)收口并重新验证。本记录保留当时的失败证据，不代表当前状态。

## 本批完成

- 按依赖顺序运行两仓库十二组复制门禁。表单内核（12 对）、Input/FieldDecorator（18 对）、时间（34 对）、日期（42 对）、Tabs（13 对）通过；选择字段门禁首次发现移动 presentation 三个 Token 混入公共字段声明。
- Maple 将专属 Token 和完整样式移至 src/_components/selection-field/presentation/style/{token,index}.less，Select/Cascader 的样式入口改为引用本地扩展。原 style/presentation.less 已迁移，不保留旧内部路径别名。变量名称与默认值不变，公共字段 Token 回到独立复制的一致内容。
- 两端选择字段门禁现通过（23 对独立源码/测试、四份 Less 及所有权边界）；移动展示样式不是给 Cedar 添加的共享配置或运行时。
- Maple Select/Cascader 中英文文档补充样式边界，Token 目录生成文档同步、patch changeset 更新。未增加 Demo 文件，使用现有移动 presentation Demo 回归并通过全库 SFC 检查。
- Token 目录第一次检查发现新扩展声明缺少 sibling style/index.less，补齐完整展示入口后重新生成并验证；不绕过目录编译检查。

## 验证

- Cedar 字段与选择外壳 10 文件 49 项通过；Maple 字段、Select、Cascader 18 文件 103 项通过。正常退出，无跳过或快照更新。
- Maple build:lib、声明编译和发布消费者 typecheck:contracts 通过；全库 lint:check 通过。两端已构建样式图 Cedar 96/98、Maple 91/93 通过，无环、缺失或重复基础样式，foundation / Loading 单次加载。
- Maple 1004 份 Demo SFC、三份 Token 目录、71 族调研菜单同步、本批路径 git diff --check 通过。
- API 清单刷新为 129 Cedar / 119 Maple / 97 同名入口；两端公开导出无 missingExports / missingContracts。入口统计不等同于语义验收。
- 未做真实浏览器视觉、移动触控/软键盘或生产整站文档构建；Cedar 主体未改，不声称本批重新构建其库。

## 仍失败的六组复制门禁（不能声称整库全通过）

| 门禁组 | 首个拦截点 | 后续处理 |
| --- | --- | --- |
| selection-presentations | select/hooks/use-select.ts 的 eslint 注释差异 | 两端统一符合各自 lint 的源码写法，再继续检查后续文件，不删除门禁 |
| auto-complete | auto-complete.tsx 的花括号/回调排版，差异输出也涉及 JSX 类型断言位置 | 先做 AST/类型与行为核对，不能直接把后续差异认定为格式问题 |
| ripple | Less Token import 的比较结果不一致 | 核对引号与编译入口、独立消费者是否实际等效，再统一源码/门禁合法规范化 |
| rate | props.ts 中 count 声明排版 | 保持公开语义，统一格式后重跑整组及消费者类型 |
| lightweight-feedback | Message timer 的花括号写法不同 | 一端规范后独立复制，验证暂停/恢复、更新和销毁定时器；继续检查本组后续文件 |
| scroll-text | BackTop Less 的单行/多行排版 | 统一格式并验证编译 CSS，再检查本组其他组件 |

这些是本次实际失败，不是已修复项。大部分首个拦截点看起来是格式/注释，但门禁在首个失败处停止，未证明后续所有文件或 API 等效。调研状态的 55 已同源/15 逻辑已同源/1 独立不能取代实时门禁和浏览器验收，当前仍需清理上述漂移。

## 恢复工作时的顺序

1. 先重启用户的 Maple pnpm dev，加载第二十三批 CLI 修复，避免旧进程再次覆盖 es。
2. 先统一字段/选择展示和 AutoComplete，校对源码 AST、类型与实际交互，不降低复制门禁。
3. 再 Ripple/Rate、反馈定时器与滚动组件；按依赖层分别测试、类型、lint、构建、文档/菜单复验。
4. 最后进行整站文档构建和真实浏览器验收：menu/list/picker、浮层切换、输入/清除/软键盘、暗色/RTL/ reduced-motion 等。

截止北京时间 2026-10-13 14:00 后不开始新改造；保留全部工作，不提交、推送或发布。
