# 样式与 BEM

- Cedar 类名前缀 `c-`，Maple 类名前缀 `mp-`。
- Block、Element、Modifier 分别为 `<block>`、`<block>__<element>`、`<block>--<modifier>`。
- BEM modifier 不是 CSS 自定义属性，禁止加入 token 前缀。
- 组件样式只消费组件 Token 或语义 Token；新增颜色、字号、间距、圆角、阴影、动效时长常量必须先定义 Token。
- 不把 DOM 层级、内部 class 或生成器细节视为稳定公共 API；需要定制时提供公开 Token、part/class API。
