# 统一发布架构

建议单独建立治理仓库，但不要让它直接拥有两个源码仓库的全部实现。

```text
design-ui
  ├─ standards / checker / reusable workflows
  ├─ 生成跨端 contract diff
  └─ repository_dispatch
       ├─ cedar-design-web release workflow
       └─ maple-design-mobile release workflow
```

治理仓库提供 Changesets 校验、版本计划、发布前检查、npm provenance 和编排等公共实现；各源码仓库保留 `cedar-cli release` / `maple-cli release` 入口、品牌包清单、scope、registry 配置以及发布凭据。产品 CLI 调用公共 release core，实际发布仍在各自仓库的受保护 workflow 中执行。

统一发包分两种：

- 独立发布：只变更一端，分别生成版本。
- 联合发布：共享 contract/token/icon 变化时，release plan 同时包含两端，但版本号仍按各自变化级别递增。

第一阶段先把两个仓库都迁移到 Changesets。第二阶段发布治理工具包和 reusable workflow。第三阶段再启用跨仓库 release orchestration。
