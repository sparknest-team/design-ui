# TabBar API 对比与拓展建议

检查日期：2026-09-08。当前实现位于 Maple `packages/maple-ui/src/tab-bar`，Cedar 没有对应组件。本次只完成 BottomNavigation → TabBar 重命名，不同时改变 Props、事件或默认交互。

## 对标依据

- [Vant Tabbar 官方 API](https://github.com/youzan/vant/blob/main/packages/vant/src/tabbar/README.zh-CN.md)
- [Ant Design Mobile TabBar 官方 API](https://github.com/ant-design/ant-design-mobile/blob/master/src/components/tab-bar/index.zh.md)
- [TDesign Mobile Vue TabBar 官方类型](https://github.com/Tencent/tdesign-mobile-vue/blob/develop/src/tab-bar/type.ts)
- Varlet：工作区 `varlet/packages/varlet-ui/src/bottom-navigation` 和 `bottom-navigation-item`。

## 现有能力与差异

| 能力 | Maple TabBar | 对标情况 | 建议 |
| --- | --- | --- | --- |
| 受控选中 | v-model:active，字符串/数字 | Vant v-model；Ant activeKey；TDesign modelValue | 保留 active，不为了统一名称破坏已有调用 |
| 非受控初始值 | 无独立 defaultActive；不绑定 active 时点击只发事件 | Ant defaultActiveKey；TDesign defaultValue | 优先增加 default-active；明确受控/非受控切换规则 |
| 页面路由联动 | 调用者监听 change 自行处理 | Vant route、to、url、replace；Ant 由业务整合 | 按用户要求不提供 route / to / replace，由业务自行处理 |
| 选中项标识 | active 支持数字，Item.name 当前仅 string | Vant name 和 TDesign Item.value 都支持数字/字符串 | 优先补齐数字 name；有 name 时只能按 name 匹配，避免与索引重复命中 |
| 徽标 | badge: boolean / BadgeProps | Vant badge + badgeProps；Ant badge；TDesign badgeProps | 现有封装已足够，继续使用 content/status 等统一 Badge API |
| 图标插槽 | icon 插槽已有 active 参数 | Vant icon 插槽；Ant icon 可为按 active 渲染的函数 | 不需要额外 active-icon 参数；补示例即可 |
| 标签插槽 | default 插槽没有 active 参数 | Ant title 可按 active 渲染 | 可增加 default({ active })，支持选中态字重、标签与辅助信息 |
| 外观 | variant 布尔值，支持普通/胶囊；主题 Token | TDesign shape normal/round、theme normal/tag | 圆角悬浮外壳可先用 CSS；有实际设计需求再加 round/inset，不复制 shape/theme 全套属性 |
| 固定与安全区 | fixed、placeholder、safe-area | Vant/TDesign 内置；Ant 由业务布局 | 已具备，保留现有默认值；补动态高度/安全区变化的占位更新验证 |
| 切换拦截 | before-change 支持 Promise | Vant before-change | 补异步竞态及 reject 行为，避免旧请求覆盖最近选择 |
| 独立主要操作 | fab 插槽、fab-props、fab-click | 与 Varlet 接近 | 保留；位置显式配置可作为后续需求，当前奇偶项规则已可用 |

## 实施优先级

1. 先完善行为：数字 name 的匹配优先级、异步拦截的竞态与拒绝处理；配套行为测试。
2. 再增加 default-active、default 插槽 active 参数；每项均同步文档与 demo。
3. 不提供 route / to / replace；路由行为由业务自行监听 change 实现。

暂不引入 TDesign 的二级子菜单，也不把组件变成通用导航菜单。disabled 可在有不可用入口的需求时补充，但不是上述三库共有的 TabBar API，不作为机械对齐项。

## 重命名验收范围

组件源码、父子通信、安装与库入口、按需样式解析、主题文件与 Token、文档与 demo、IDE 元数据、单测及快照、设计系统清单。旧名称仅保留在迁移说明和历史 changeset 中；预编译产物通过构建生成。

## 2026-09-08 实施更新

用户明确排除 route / to / replace，路由联动不进入后续拓展范围。
已实施 default-active、数字 name 优先匹配、default 插槽 active、异步切换竞态/拒绝/卸载保护、动态占位高度更新，以及图标外侧的小尺寸徽标。新增非受控、数字重排、自定义选中标签、异步拦截 demo，并补充普通/胶囊徽标切换。

## 主值命名最终收敛

本轮以用户确定的规范替代早期保留 active 的决策：TabBar 使用 modelValue/defaultValue 与 update:modelValue，子项仍使用 name；插槽内 active 仍表示渲染状态，不是主值属性。详见 primary-model-naming.md。
