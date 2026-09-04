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
