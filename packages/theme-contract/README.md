# @ui-foundation/theme-contract

Cedar 与 Maple 的主题公共契约。`tokens.components` 是两端必须同时实现的公共 Token；`platformExtensions` 只登记确有不同 DOM/交互职责的组件，未登记组件不得增加单端公开 Token。

`pnpm check` 会验证系统 Token、公共组件 Token、平台扩展边界、主题覆盖引用、旧 Token denylist 与文档中的 Token 名称。新增主题变量时应先决定它属于公共语义还是平台结构，不得用未消费的兼容别名制造表面对齐。

Cedar 与 Maple 的中立主题契约事实来源。

- `contracts/theme-contract.json` 管理两端必须共同遵守的组件和规则。
- `schema/theme-contract.schema.json` 约束契约文件结构。
- 两端检查器必须从本包读取契约，禁止各自维护组件白名单。
- 公共组件 token 使用相同逻辑名；`c` 与 `mp` 只作为平台前缀。
- 不允许兼容别名，品牌主题不得覆盖 `internal` token。

新增或修改公共主题能力时，先修改本包契约，再同时修改 Cedar 与 Maple。

`pnpm sync` 仅用于经过评审的契约变更；日常开发和 CI 使用 `pnpm check`，源码与已登记 token 不一致时直接失败。

检查同时覆盖主题覆盖合法性、`internal` 隔离、旧变量 denylist，以及受管组件文档中的变量引用。
