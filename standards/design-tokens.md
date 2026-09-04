# Design Token

两端统一使用相同的逻辑 Token 名，只允许品牌前缀不同：Cedar 为 `--c-`，Maple 为 `--mp-`。

层级：

```text
reference: --{prefix}-ref-{category}-{name}
semantic:  --{prefix}-sys-{category}-{role}
component: --{prefix}-{component}-{variant/status/size}-{state}-{property}
```

示例：

```css
--c-sys-color-primary
--mp-sys-color-primary
--c-button-variant-outline-status-primary-hover-border-color
--mp-button-variant-outline-status-primary-hover-border-color
```

除 `c`/`mp` 外，两端共享组件的 Token 后缀必须一致。组件 Token 优先引用 semantic token；reference token 不应直接被组件消费。

Token 名顺序固定为：组件 → variant/status/size → interaction state → CSS property。状态统一使用 `hover`、`focus-visible`、`active`、`disabled`、`loading`、`selected`、`error`。

Token 重命名必须同步源码、主题、文档和测试，并生成迁移表。稳定版本中删除或重命名公共 Token 属于 breaking change。
