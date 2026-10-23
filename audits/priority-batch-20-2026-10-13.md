# 第二十批：日期展示选择器的唯一所有权

## 完成

- Maple DatePickerOptions / DateRangePickerOptions 删除无效的嵌套 presentation；Date / DateRange 与纯面板根 presentation 保留。默认 picker 原本覆盖嵌套值，不能保留一个公开但不生效的 API。
- 两端独立复制 presentation 保护过滤，既不透传伪造嵌套选择器，也不影响合法的 dayStartOfWeek 等配置；无旧 API 别名、转换回退或共享运行时。
- 增加公共过滤回归，Maple 单值/范围所有者及真实日历/滚轮切换回归，根切换不修改模型；实际内容仅替换浮层 Surface。
- 根入口与组件子路径消费者类型反例均拒绝嵌套 presentation，正例保留四种根入口的合法模式。
- Maple 中英文展示边界 Demo、两端日期/范围文档、四个日期调研条目及菜单、OpenSpec 和 changeset 同步。无新增 CSS Token。

## 验证

- Cedar 26 文件 117 项逻辑/DOM与独立 SSR 4 项通过，共 121 项；Maple 30 文件 162 项通过。正常退出、无跳过、无更新快照。
- 两端源码 typecheck、Cedar 受影响 ESLint、Maple 全库 lint:check 通过。
- 两端 build:lib 与发布消费者 typecheck:contracts 通过。Maple 首次发布类型检查发现一条预期报错注释被格式化到错误行之外；调整注释位置后类型检查及该文件 ESLint 复验通过，并未放宽类型。
- Maple 1004 份 Demo SFC、42 对日期复制门禁、71 族调研菜单、两端导出与 API 清单 129/119/97、Token 目录通过。
- 发布样式图 Cedar 96 入口/98 Less、Maple 91/93 通过，无环、缺失或重复基础样式；源码与发布消费者 foundation / Loading 各单次加载。
- 本批路径 git diff --check 通过。未做生产整站文档构建或真实浏览器视觉、软键盘、触控验收。

## 后续

继续审计日期配置实际消费及两端边界，先复现再修改，不把调研状态视为全链路验收。截止北京时间 2026-10-13 14:00；不提交、推送、发布。
