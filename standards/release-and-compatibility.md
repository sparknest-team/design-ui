# 版本与兼容性

两端统一采用 SemVer 和 Changesets，但 Cedar 与 Maple 不强制同版本号。

## 正式发布前的临时规则

Cedar 与 Maple 当前处于正式发布前的组件/API 收敛阶段。在产品负责人明确宣布组件库正式发布，并在本文件删除或关闭本节之前，以下规则优先于常规弃用周期：

- 改造组件时不承担历史公共 API 的向后兼容成本。
- 确定标准命名或标准行为后，直接迁移两库源码、内部调用方、Demo、文档、类型、测试、Resolver 和生成配置，并删除旧 API。
- 不保留 deprecated alias、双属性写法、运行时警告、旧值转换或只为旧实现存在的兼容分支。
- 平台确实需要的能力可以保留，但必须使用最终标准 API 或显式平台扩展，不能伪装成历史兼容入口。
- 浏览器兼容性、SSR、安全性、数据正确性和第三方 peer dependency 约束仍需正常验证；本规则只取消未正式发布公共 API 的历史包袱。

正式发布时应先完成 API 冻结和迁移检查，再删除本节，之后所有公共 API 变更恢复执行下方 SemVer 与弃用周期。

- major：删除/重命名 Props、Emits、Slots、Expose、公共 Token；改变默认交互或 DOM 语义；提高 peer dependency 下限且影响用户。
- minor：新增向后兼容组件/API/Token。
- patch：不改变公共契约的缺陷修复和样式修正。

正式发布后的破坏性变更默认经历：一个 minor 版本发出 deprecation → 文档和控制台迁移提示 → 下一个 major 删除。安全或严重错误可例外，但必须记录决策。

每个用户可感知变更必须带 changeset。发布前验证 build、types、SSR import、按需导入、tree shaking、包内容和 changelog。
