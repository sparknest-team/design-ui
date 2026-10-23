# @ui-foundation/theme-contract

Cedar 与 Maple 的主题公共契约。`tokens.components` 是两端必须同时实现的公共 Token；`platformExtensions` 只登记确有不同 DOM/交互职责的组件，未登记组件不得增加单端公开 Token。

`pnpm check` 会验证系统 Token、受管 system 颜色与组件 Token 的标准值、公共组件 Token、平台扩展边界、主题覆盖引用、旧 Token denylist 与文档中的 Token 名称。新增主题变量时应先决定它属于公共语义还是平台结构，不得用未消费的兼容别名制造表面对齐。

Cedar 与 Maple 的中立主题契约事实来源。

- `contracts/theme-contract.json` 管理两端必须共同遵守的组件和规则。
- `systemTokenValues` 使用 `--PREFIX-` 作为中立占位符，登记跨端同义同值的颜色、间距、圆角、文字、动效与层级角色；其余显式平台默认共同覆盖所有 system 名称。
- `componentTokenValues` 分批登记完成治理的公开组件 Token 默认值；未登记不表示允许漂移，而是尚待迁移。
- `platformSystemTokenValues` 登记控件密度、浮层层级等有依据的平台差异；每个 system 名称必须在共享值或该端平台值中且只出现一次。
- `platformComponentTokenValues` 按 cedar/maple 登记非颜色几何等平台默认差异；与共享 componentTokenValues 不得重叠。它不豁免名称、消费路径或主题检查。
- `schema/theme-contract.schema.json` 约束契约文件结构。
- 两端检查器必须从本包读取契约，禁止各自维护组件白名单。
- 公共组件 token 使用相同逻辑名；`c` 与 `mp` 只作为平台前缀。
- 不允许兼容别名，品牌主题不得覆盖 `internal` token。

新增或修改公共主题能力时，先修改本包契约，再同时修改 Cedar 与 Maple。

CSS 变量的分层、公开边界和选用规则见 [Design Token 规范](../../standards/design-tokens.md)。

`pnpm sync` 仅用于经过评审的契约变更；日常开发和 CI 使用 `pnpm check`，源码与已登记 token 不一致时直接失败。

检查同时覆盖主题覆盖合法性、`internal` 隔离、旧变量 denylist，以及受管组件文档中的变量引用。

`node ../../bin/token-inventory.mjs --check-consumers --summary` 审计全部组件声明消费；`node ../../bin/token-catalog.mjs --check` 校验两端菜单参考页。二者与名称／值契约是独立门禁，不代替真实浏览器状态验收。默认值规范化仅消除前缀、Less var 引号和等价 rgb alpha 写法，不把不同的语义变量或单位归并成“同值”。
