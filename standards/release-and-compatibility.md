# 版本与兼容性

两端统一采用 SemVer 和 Changesets，但 Cedar 与 Maple 不强制同版本号。

- major：删除/重命名 Props、Emits、Slots、Expose、公共 Token；改变默认交互或 DOM 语义；提高 peer dependency 下限且影响用户。
- minor：新增向后兼容组件/API/Token。
- patch：不改变公共契约的缺陷修复和样式修正。

破坏性变更默认经历：一个 minor 版本发出 deprecation → 文档和控制台迁移提示 → 下一个 major 删除。安全、严重错误或尚未发布的 API 可例外，但必须记录决策。

每个用户可感知变更必须带 changeset。发布前验证 build、types、SSR import、按需导入、tree shaking、包内容和 changelog。
