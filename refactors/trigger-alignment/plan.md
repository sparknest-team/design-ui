# Cedar / Maple Trigger 同源改造方案

更新日期：2026-09-20。本文已按方案实施完成；完成范围与验证结果见文末。

## 1. 当前真实状态

Trigger 目前没有独立的 `platform.ts`。所谓“平台定位适配”实际散落在两套组件主体中：

| 职责     | Cedar                                          | Maple                                                 |
| -------- | ---------------------------------------------- | ----------------------------------------------------- |
| 组件编排 | `trigger/trigger.tsx`                          | `trigger/Trigger.vue`                                 |
| 定位引擎 | `trigger/utils.ts` 中的自研定位                | `trigger/useFloatingTrigger.ts` 中的 `@popperjs/core` |
| 容器解析 | `useTeleportContainer`                         | `usePopupContainer` + `useTeleport`                   |
| 层级     | `usePopupManager`                              | `useStack` + `useZIndex`                              |
| 滚动处理 | Trigger 主体自行监听滚动容器                   | Popper `eventListeners` 自动更新                      |
| 全局配置 | Cedar ConfigProvider 提供 scroll/update 默认值 | Maple 没有对应入口                                    |
| 样式结构 | `c-trigger-popup` 等横线类名                   | `mp-trigger__popup` 等 BEM 类名                       |

已经独立复制并被基础层门禁检查的文件包括：`contract`、`state`、`reference`、`interaction`、`interaction-props`、`render`、`render-props`、`popup`、`geometry`、`arrow`、`resize`、`wrapper`。尚未同源的核心恰好是 `props`、组件主体、定位编排、容器/层级接线和样式。

因此当前状态只能叫“Trigger 基础逻辑同源”，不能升级为“Trigger 已同源”。

## 2. 设计结论

不保留两套定位引擎。以 Cedar 现有无依赖定位算法为基础，补齐 Maple 已有的 `absolute / fixed` strategy 后，独立复制到两库。

选择该基线的原因：

1. Cedar 已覆盖十二方位、翻转、视口避让、缩放 containing block、`visualViewport`、箭头和自定义挂载容器。
2. Maple 的 `@popperjs/core` 当前只服务 Trigger；改造完成后可以删除该运行时依赖，避免 Cedar 为同源额外引入依赖，也能减少 Maple 包体和重复更新路径。
3. Cedar 的 `popupOffset`（主轴距离）与 `popupTranslate`（屏幕 x/y 平移）语义比单独 `offsetX / offsetY` 更明确，翻转后也不会改变含义。
4. 定位属于 Trigger 的核心行为。如果仍把整个定位算法放进两个不同的 `platform`，即使交互文件相同，也不能称为完整同源。

## 3. `platform` 最终允许保留什么

改造后可以有一个很薄的 `platform.ts`，但只允许处理两库已有基础设施的接线：

```ts
export interface TriggerPlatform {
  resolveContainer(source: PopupContainer): Ref<HTMLElement | undefined>
  useLayer(visible: Ref<boolean>): {
    zIndex: Ref<number>
    isTopLayer(event?: Event): boolean
  }
  getGlobalBehavior(): {
    scrollToClose?: boolean
    updateAtScroll?: boolean
  }
  namespace(part?: string): string
}
```

允许保留的内容：

- 调用本库的 popup container 工具。
- 调用本库的 z-index / stack 管理工具。
- 将 Cedar ConfigProvider 或 Maple 的默认配置归一化成同一个只读对象。
- 生成 `c-` / `mp-` 前缀以及各库现有 BEM 类名。
- 本地图标、动画名称和主题 token 的映射。

不允许放入 `platform.ts` 的内容：

- placement、flip、overflow、offset、cover 和箭头计算。
- open 状态、延迟、外部点击、Escape、焦点恢复。
- Teleport 生命周期、过渡生命周期、KeepAlive 清理。
- Props 默认值或事件载荷的分端判断。
- Tooltip、Popover、Menu 等消费者专属逻辑。

也就是说，`platform` 是适配器，不是第二套 Trigger。

## 4. 目标文件结构

两库保留相同职责和相同主体，文件内容通过规范化门禁比较：

```text
trigger/
  trigger.tsx              # 同源：唯一组件主体
  props.ts                 # 同源：最终公开契约
  contract.ts              # 已同源
  state.ts                 # 已同源
  reference.ts             # 已同源
  interaction.ts           # 已同源
  render.ts                # 已同源
  popup.ts                 # 已同源
  positioner.ts            # 新增同源：定位、翻转、视口避让和自动更新
  geometry.ts              # 已同源：纯计算
  arrow.ts                 # 已同源：箭头计算
  resize.ts                # 已同源：尺寸观察
  platform.ts              # 分端：仅基础设施接线
  style/
    implementation.less    # 同源：DOM 结构样式
    token.less             # 分端：变量前缀和值
```

Maple 的 `useFloatingTrigger.ts` 和 Cedar 的 `utils.ts` 在迁移后删除，避免新旧定位算法同时存在。组件主体选择 TSX，是因为默认插槽可能是原生节点、组件、SVG 或 Fragment，需要统一解析并向第一个真实节点附加 opened class；这部分 Cedar 现有实现更完整。

## 5. 统一公开 API

### 状态与交互

以下 API 两端完全一致：

- `open`、`defaultOpen`。
- `trigger: hover | click | focus | contextMenu | manual | TriggerEvent[]`。
- `disabled`。
- `mouseEnterDelay`、`mouseLeaveDelay`、`focusDelay`。
- `popupHoverStay`、`blurToClose`、`closeOnClickReference`、`clickOutsideToClose`、`escToClose`、`restoreFocus`。
- `reference`。

Trigger 默认仍为 hover。移动端 Menu、Select、Popover 等由消费者显式传 `click`，不在 Trigger 内根据设备偷偷改默认值。

### 定位

标准 API：

- `placement`：统一十二方位。
- `strategy: 'absolute' | 'fixed'`：Maple 已有，补给 Cedar。
- `cover`：覆盖参考元素，不新增 cover placement 枚举。
- `popupOffset`：沿 placement 主轴、向浮层外侧的距离。
- `popupTranslate`：屏幕坐标的 `[x, y]` 平移，也允许按 placement 配置。
- `autoFitPosition`：空间不足时翻转并在交叉轴限制到可视区域。
- `autoFitPopupWidth`、`autoFitPopupMinWidth`。
- `autoFixPosition`：参考元素或浮层尺寸变化时重新定位。
- `updateAtScroll`：滚动时重新定位。
- `alignPoint`：以鼠标坐标作为虚拟参考元素。

Maple 的 `offsetX / offsetY` 不保留兼容入口。改造时把 Maple 内部消费者、Demo、文档和测试一次性迁移到 `popupTranslate`，然后直接从 Trigger Props 删除。`cascadeOptimization` 当前没有形成有效定位行为，也在迁移消费者后直接删除，不继续扩大为公开 API。

### 渲染与行为扩展

两端统一支持：

- `popupContainer`：`string | HTMLElement | false`。
- `popupClass`、`popupStyle`、`contentClass`、`contentStyle`。
- `showArrow`、`arrowClass`、`arrowStyle`。
- `animationName`、`duration`、`unmountOnClose`。
- `autoFitTransformOrigin`、`hideEmpty`、`openedClass`。
- `preventFocus`、`scrollToClose`、`scrollToCloseDistance`。

其中 `preventFocus` 只阻止定位层 mousedown 导致参考元素失焦，默认 false；不能影响内容区可交互控件。`scrollToClose` 与 `updateAtScroll` 互斥时关闭优先，达到阈值后不再执行本帧定位。

### 事件和 Expose

事件完全一致：

- `update:open`：用户交互发出的受控更新请求。
- `open-change`：交互请求状态通知。
- `open` / `close`：实际开始进入或离开。
- `opened` / `closed`：动画完成。
- `click-outside`：最上层浮层收到的外部点击。
- `resize`：参考元素尺寸发生变化。

公开方法完全一致：`open()`、`close()`、`resize()`、`allowClose()`、`getReference()`、`setReference()`、`focusReference()`、`isTopLayer()`。

## 6. 定位器职责

新的同源 `positioner.ts` 输入只有参考元素、浮层元素、容器和标准 Props，输出：

```ts
interface PositionerResult {
  placement: Ref<TriggerPlacement>
  popupStyle: Ref<CSSProperties>
  wrapperStyle: Ref<CSSProperties>
  arrowStyle: Ref<CSSProperties>
  referenceSize: Ref<{ width: number; height: number }>
  update(): void
  destroy(): void
}
```

定位顺序固定为：

1. 取得 reference、popup、真实 offsetParent 和 `visualViewport`。
2. 按 strategy 建立坐标系；`absolute` 使用 containing block，`fixed` 使用可视视口。
3. 先应用 width / minWidth，重新读取浮层尺寸。
4. 计算 placement + popupOffset + popupTranslate + cover。
5. 主轴空间不足时翻转；交叉轴超出时平移回可视区域。
6. 写入 `left/top/position`，更新实际 placement 和 transform origin。
7. 最后计算箭头，保证箭头基于翻转后的 placement 和最终浮层位置。

自动更新只在打开期间启用，并统一监听：reference、popup、offsetParent 的 ResizeObserver；相关滚动容器；window resize；`visualViewport.resize/scroll`。关闭、卸载和 KeepAlive deactivated 时全部清理。

## 7. 样式约束

两端 DOM 层级固定为：

```text
定位层 popup
└── 动画层 popup-wrapper
    ├── 内容层 content
    └── arrow（可选）
```

- 定位 transform 不能写到动画层，避免与进入动画互相覆盖。
- `popupStyle` 只控制定位层；业务面板外观使用 `contentStyle`。
- `implementation.less` 的规则保持同源，前缀通过本地 namespace 适配。
- `token.less` 允许颜色、层级、箭头尺寸在两套主题中取不同值，但变量职责必须一一对应。
- Cedar 当前按 placement 改圆角、Maple 当前统一圆角的差异应消除；箭头统一为旋转 45° 的方形，由同一份 placement 样式控制。

## 8. Tooltip / Popover 的边界

Trigger 完成后再处理 Tooltip、Popover，二者不能把定位算法复制回自己内部。

- Tooltip：只负责语义角色、文本内容、默认 hover/focus、无障碍关联和轻量外观。
- Popover：只负责标题/正文/关闭行为、默认触发方式和面板外观。
- placement、offset、container、arrow、open 状态和 Expose 全部直接透传 Trigger。
- 两者特有 Props 放在各自主体，不进入 Trigger `platform.ts`。

## 9. 实施步骤

1. 冻结 Trigger 公共 Props、事件、插槽和 Expose 契约，并添加“旧 API 已删除”的类型和运行时检查。
2. 从 Cedar 抽取 `positioner.ts`，先补 strategy、`visualViewport`、滚动监听和 cleanup 测试。
3. 将 Cedar 主体整理为唯一 `trigger.tsx`，平台依赖全部经过 `platform.ts`。
4. 复制主体和定位器到 Maple，只修改本地导入、namespace 和 platform 接线。
5. 迁移 Maple 消费者的 `offsetX/Y`，删除 `useFloatingTrigger.ts` 及 `@popperjs/core`。
6. 统一 `implementation.less`，保留双端 token 值。
7. 依次回归 Tooltip、Popover、DropdownMenu、SplitButton、Select、Cascader 和日期时间弹层。
8. 将主体、Props、定位器、结构样式和配对测试加入 `copied-components-check.mjs`；更新 `component-reuse.json` 后同步两端菜单和调研文档。

## 10. 验收场景

至少覆盖：

- 十二方位、翻转、交叉轴避让、cover、offset 和 alignPoint。
- body、CSS selector、HTMLElement、`popupContainer=false`、嵌套 Teleport。
- absolute / fixed、滚动容器、带 border/scroll/scale/transform 的 containing block。
- 桌面 resize、移动端 `visualViewport`、软键盘后的重新定位。
- 原生元素、Vue 组件、SVG、Fragment 和外部 reference。
- hover/click/focus/contextMenu/manual 及数组组合。
- 受控值被父级接受或拒绝、嵌套浮层的最上层 Escape / outside click。
- 初始打开、快速反复开关、过渡取消、`unmountOnClose=false`。
- KeepAlive deactivate/activate、卸载后无 ResizeObserver、scroll listener 和 timer 泄漏。
- SSR 不访问 document，客户端 Teleport 后位置可恢复。

通过以上条件后，Trigger 才能从“逻辑待同源”升级为“已同源”。Tooltip 和 Popover分别完成主体与样式验收后再单独升级，不能随 Trigger 自动改状态。

## 11. 实施结果

2026-09-20 已完成 Trigger 本体同源改造：

- 双端均使用独立复制的 `trigger.tsx`、`props.ts`、`types.ts`、`position.ts`、`positioner.ts` 与对应样式/token；规范化门禁已覆盖这些文件及定位契约测试。
- `platform.ts` 只保留 popup container、z-index/stack、Cedar ConfigProvider 默认行为和 ResizeObserver fallback 接线，未包含定位算法或状态机。
- Maple 已删除 `useFloatingTrigger.ts`、旧 `Trigger.vue` 和 `@popperjs/core`；Trigger 不再公开 `offsetX`、`offsetY` 或 `cascadeOptimization`。
- Maple Tooltip、Popover 与 Select 的直接调用已迁移到 `popupOffset` / `popupTranslate`；DropdownMenu 自身仍可保留业务层 `offsetX/Y`，但只在 adapter 内转换为 Trigger 的 `popupTranslate`，不构成 Trigger 兼容入口。
- 默认淡入动画使用组件私有的 `trigger-fade`，避免与 Cedar 全局动画类重复；两端 token 后缀、职责和实现规则一致，仅保留 `c-` / `mp-` 前缀。
- Trigger、Tooltip、Popover、DropdownMenu、SplitButton、Select、Cascader、Search 及基础消费者回归通过。
- Tooltip 与 Popover 已完成独立同源复制：主体、最终 Props、默认值、ARIA 接线、platform 外观映射和结构样式已纳入复制门禁；定位算法仍只存在于 Trigger。
