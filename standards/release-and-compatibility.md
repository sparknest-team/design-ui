# 版本与兼容性

两端统一采用 SemVer 和 Changesets，但 Cedar 与 Maple 不强制同版本号。

## 正式发布后的规则

Cedar 与 Maple 已于 2026-10-24 以 `1.0.0` 首次公开发布到 npm。自该版本起，公共 API 变更遵守下方 SemVer 与弃用周期；正式发布前的 API 收敛临时规则已关闭。发布包和验证记录见 [1.0.0 发布清单](../release/npm-1.0.0.json)。 Maple 包名后续移除了重复的 `maple-` 前缀，正确名称与旧包清理状态见 [包名更正记录](../release/maple-package-name-correction.json)。

- major：删除/重命名 Props、Emits、Slots、Expose、公共 Token；改变默认交互或 DOM 语义；提高 peer dependency 下限且影响用户。
- minor：新增向后兼容组件/API/Token。
- patch：不改变公共契约的缺陷修复和样式修正。

正式发布后的破坏性变更默认经历：一个 minor 版本发出 deprecation → 文档和控制台迁移提示 → 下一个 major 删除。安全或严重错误可例外，但必须记录决策。

每个用户可感知变更必须带 changeset。发布前验证 build、types、SSR import、按需导入、tree shaking、包内容和 changelog。
