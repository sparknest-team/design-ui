# Cedar / Maple Design UI

这个目录是 Cedar 与 Maple 的共享治理源，负责公共 API、Token、测试、可访问性、兼容性和发布规则。组件源码仍保留在两个独立仓库中。

## 使用方式

```bash
pnpm check:cedar
pnpm check:maple
```

规范采用“共享核心 + 平台覆盖”模型：`standards/` 定义两端必须一致的契约；`platforms/` 只记录桌面端与移动端确实不同的文件布局、交互和构建方式。代码仓库分开不影响复用规范。

## 仓库策略

建议将本目录独立为 `loca-spirit/design-ui` 仓库，发布 `@loca/design-ui` 工具包，并提供 GitHub reusable workflows。初始阶段两边保留自己的发布权限和 npm token；治理仓库统一生成 release plan 和调用发布工作流，不直接把两个包绑成同一版本。

不要在第一阶段把 Cedar 和 Maple 合并成一个源码仓库。Cedar 当前已经是 pnpm monorepo；优先抽出共享 icon、tokens、contracts 包，稳定后再决定是否建立总仓库。

入口：

- [共享规范](standards/README.md)
- [Cedar 覆盖规则](platforms/cedar.md)
- [Maple 覆盖规则](platforms/maple.md)
- [发布架构](release/README.md)
- [未同源组件实施路线（2026-09-20）](audits/same-source-roadmap-2026-09-20.md)
- [真实 Demo 交互验收与未覆盖项（第二十七批）](audits/priority-batch-27-2026-10-13.md)
- [持续交互验收至午夜（第二十八批）](audits/priority-batch-28-2026-10-14.md)
- [Scheduler 拖拽与无限滚动重试（第二十九批）](audits/priority-batch-29-2026-10-14.md)
- [高级表单与暗色 Demo（第三十批）](audits/priority-batch-30-2026-10-14.md)
- [Scheduler 拒绝与自定义控件（第三十一批）](audits/priority-batch-31-2026-10-14.md)
- [轮播拖动与示例请求清理（第三十二批）](audits/priority-batch-32-2026-10-14.md)
- [选择分组、异步与示例语言（第三十三批）](audits/priority-batch-33-2026-10-14.md)
- [批量选择边界与移动展示键盘（第三十四批）](audits/priority-batch-34-2026-10-14.md)
- [Slider 范围、输入与受控拒绝（第三十五批）](audits/priority-batch-35-2026-10-14.md)
- [垂直 Slider 与右侧实际拖动（第三十六批）](audits/priority-batch-36-2026-10-14.md)
- [日期范围边界与编辑端键盘（第三十七批）](audits/priority-batch-37-2026-10-14.md)
- [时间范围秒级限制与键盘编辑端（第三十八批）](audits/priority-batch-38-2026-10-14.md)
- [跨日范围与格式模型（第三十九批）](audits/priority-batch-39-2026-10-14.md)
- [时间范围排序、只读和立即提交（第四十批）](audits/priority-batch-40-2026-10-14.md)
- [时间范围字段事件与受控确认（第四十一批）](audits/priority-batch-41-2026-10-14.md)
- [受控拒绝与十二小时步长组合（第四十二批）](audits/priority-batch-42-2026-10-14.md)
- [右侧移动实例拒绝与步长组合（第四十三批）](audits/priority-batch-43-2026-10-14.md)
- [拒绝关闭重复确认与焦点组合（第四十四批）](audits/priority-batch-44-2026-10-14.md)
- [右侧拒绝关闭与焦点隔离（第四十五批）](audits/priority-batch-45-2026-10-14.md)
- [拒绝关闭后新选择事务修复（第四十六批）](audits/priority-batch-46-2026-10-14.md)
- [右侧新事务修复复测（第四十七批）](audits/priority-batch-47-2026-10-14.md)
- [日期字段拒绝关闭后的新选择事务（第四十八批）](audits/priority-batch-48-2026-10-14.md)
- [Scheduler 复制草稿失败后直接重试（第四十九批）](audits/priority-batch-49-2026-10-14.md)
- [Scheduler 复制类型、容量与关闭清理（第五十批）](audits/priority-batch-50-2026-10-14.md)
- [Scheduler 异步资源回显与重试反馈（第五十一批）](audits/priority-batch-51-2026-10-14.md)
- [Scheduler 外部编辑器的一次性失败与草稿重试（第五十二批）](audits/priority-batch-52-2026-10-14.md)
- [Scheduler 独立编辑器的 Escape 与删除重试（第五十三批）](audits/priority-batch-53-2026-10-14.md)
- [Scheduler 资源并发容量与历史交互（第五十四批）](audits/priority-batch-54-2026-10-14.md)

## 基础层分阶段重构

[Cedar / Maple 基础层重构计划](refactors/foundation-alignment/plan.md) · [进度与验证](refactors/foundation-alignment/progress.md) · [首批迁移说明](refactors/foundation-alignment/migration.md)

`node bin/foundation-inventory.mjs` 更新基础文件摘要与静态直接引用清单，`--check` 检查漂移；`pnpm check:foundations` 检查两库独立基础源码一致性。

包名与目录规则、全量包清单见[包目录与框架边界](standards/package-layout.md)。
