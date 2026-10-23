# 非颜色 Token：13 个组件处置记录

本轮范围仅 Badge、Tag、Button、Alert、Hover、Paper、Ripple、Skeleton、Link、Space、Tabs、Pagination、Switch。审核覆盖下表列出的全部非颜色声明；不宣称全组件浏览器验收。

## 决策与规则

- spacing / 字号 / 字重 / 普通圆角：有对应 system 角色时等值转接，改变系统密度时组件会同步；不使用恰好相等但语义不同的 control-height 代替图标、徽标尺寸。
- 自有形状保持组件参数：Badge 缩放与点径、Tag 紧凑桌面和移动密度、Skeleton 内容占位、Switch 滑块轨道几何、按钮堆叠高度均不等价于表单控件高度。
- border-width/type、比例、focus offset、局部 z-index、百分比和无单位行高是结构规则，不新建泛化 system 变量；Tabs 活跃 shadow 保留桌面阴影 / 移动 none 差异。
- 循环 loading 的 1s、Ripple expand/fade 曲线和时长是独立行为，不能机械改成状态过渡时长。Switch 状态时长等值转接 standard(180ms)。
- 修复 Button 主过渡、Tag 淡出、Alert 关闭与 Switch loading 的硬编码：新增四个公开 duration token；前三者分别使用 standard / fast / slow，Switch loading 仍 1s。四者补 reduced-motion。
- Button mini 字号保留 foundation xs(10px)，不误映射 system xs(12px)。Maple Link 相对 em 几何、Cedar Link 紧凑数值，Tabs padding/capsule/shadow 平台差异均保留。
- Space 的 10 个 gap 是运行时动态 var 名消费，不是死变量；Hover、Ripple 已完成的 motion 治理保持。

## 中央契约整合

请将下列非颜色 root 默认值注册到 componentTokenValues；前缀按平台替换。值以编译后的默认 root 为准；有差异的单元格必须使用平台分支，不强行对齐。新增名称仅 tag-fade-duration、alert-close-duration、button-transition-duration、switch-loading-duration（两端各一）。

## badge

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `badge-description-size-lg-font-size` | `var(--{prefix}-sys-font-size-lg)` | `var(--{prefix}-sys-font-size-lg)` | system 角色消费 |
| `badge-description-size-md-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-md)` | system 角色消费 |
| `badge-description-size-sm-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` | system 角色消费 |
| `badge-description-size-xl-font-size` | `var(--{prefix}-sys-font-size-xl)` | `var(--{prefix}-sys-font-size-xl)` | system 角色消费 |
| `badge-description-size-xs-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` | system 角色消费 |
| `badge-font-weight` | `var(--{prefix}-sys-font-weight-medium)` | `var(--{prefix}-sys-font-weight-medium)` | system 角色消费 |
| `badge-offset` | `2px` | `2px` | 保留组件几何 / 结构语义 |
| `badge-ring-width` | `2px` | `2px` | 保留组件几何 / 结构语义 |
| `badge-size-lg-border-radius` | `28px` | `28px` | 保留组件几何 / 结构语义 |
| `badge-size-lg-dot-height` | `7px` | `7px` | 保留组件几何 / 结构语义 |
| `badge-size-lg-dot-width` | `7px` | `7px` | 保留组件几何 / 结构语义 |
| `badge-size-lg-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-md)` | system 角色消费 |
| `badge-size-lg-height` | `28px` | `28px` | 保留组件几何 / 结构语义 |
| `badge-size-lg-padding` | `0 var(--{prefix}-sys-space-4)` | `0 var(--{prefix}-sys-space-4)` | system 角色消费 |
| `badge-size-lg-scale` | `1` | `1` | 保留组件几何 / 结构语义 |
| `badge-size-lg-space` | `var(--{prefix}-sys-space-3)` | `var(--{prefix}-sys-space-3)` | system 角色消费 |
| `badge-size-md-border-radius` | `24px` | `24px` | 保留组件几何 / 结构语义 |
| `badge-size-md-dot-height` | `6px` | `6px` | 保留组件几何 / 结构语义 |
| `badge-size-md-dot-width` | `6px` | `6px` | 保留组件几何 / 结构语义 |
| `badge-size-md-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` | system 角色消费 |
| `badge-size-md-height` | `24px` | `24px` | 保留组件几何 / 结构语义 |
| `badge-size-md-padding` | `0 var(--{prefix}-sys-space-4)` | `0 var(--{prefix}-sys-space-4)` | system 角色消费 |
| `badge-size-md-scale` | `1` | `1` | 保留组件几何 / 结构语义 |
| `badge-size-md-space` | `var(--{prefix}-sys-space-3)` | `var(--{prefix}-sys-space-3)` | system 角色消费 |
| `badge-size-sm-border-radius` | `20px` | `20px` | 保留组件几何 / 结构语义 |
| `badge-size-sm-dot-height` | `5px` | `5px` | 保留组件几何 / 结构语义 |
| `badge-size-sm-dot-width` | `5px` | `5px` | 保留组件几何 / 结构语义 |
| `badge-size-sm-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` | system 角色消费 |
| `badge-size-sm-height` | `20px` | `20px` | 保留组件几何 / 结构语义 |
| `badge-size-sm-padding` | `0 var(--{prefix}-sys-space-3)` | `0 var(--{prefix}-sys-space-3)` | system 角色消费 |
| `badge-size-sm-scale` | `0.8333` | `0.8333` | 保留组件几何 / 结构语义 |
| `badge-size-sm-space` | `var(--{prefix}-sys-space-1)` | `var(--{prefix}-sys-space-1)` | system 角色消费 |
| `badge-size-xl-border-radius` | `32px` | `32px` | 保留组件几何 / 结构语义 |
| `badge-size-xl-dot-height` | `8px` | `8px` | 保留组件几何 / 结构语义 |
| `badge-size-xl-dot-width` | `8px` | `8px` | 保留组件几何 / 结构语义 |
| `badge-size-xl-font-size` | `var(--{prefix}-sys-font-size-lg)` | `var(--{prefix}-sys-font-size-lg)` | system 角色消费 |
| `badge-size-xl-height` | `32px` | `32px` | 保留组件几何 / 结构语义 |
| `badge-size-xl-padding` | `0 10px` | `0 10px` | 保留组件几何 / 结构语义 |
| `badge-size-xl-scale` | `1` | `1` | 保留组件几何 / 结构语义 |
| `badge-size-xl-space` | `var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-4)` | system 角色消费 |
| `badge-size-xs-border-radius` | `20px` | `20px` | 保留组件几何 / 结构语义 |
| `badge-size-xs-dot-height` | `4px` | `4px` | 保留组件几何 / 结构语义 |
| `badge-size-xs-dot-width` | `4px` | `4px` | 保留组件几何 / 结构语义 |
| `badge-size-xs-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` | system 角色消费 |
| `badge-size-xs-height` | `20px` | `20px` | 保留组件几何 / 结构语义 |
| `badge-size-xs-padding` | `0 var(--{prefix}-sys-space-3)` | `0 var(--{prefix}-sys-space-3)` | system 角色消费 |
| `badge-size-xs-scale` | `0.6667` | `0.6667` | 保留组件几何 / 结构语义 |
| `badge-size-xs-space` | `0px` | `0px` | 保留组件几何 / 结构语义 |
## tag

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `tag-border-radius` | `var(--{prefix}-sys-radius-sm)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `tag-border-type` | `solid` | `solid` | 保留组件几何 / 结构语义 |
| `tag-border-width` | `1px` | `1px` | 保留组件几何 / 结构语义 |
| `tag-close-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-tag-size-md-font-size)` | system 角色消费 |
| `tag-close-margin-left` | `var(--{prefix}-spacing-2)` | `var(--{prefix}-sys-space-3)` | system 角色消费 |
| `tag-fade-duration` | `var(--{prefix}-sys-motion-duration-fast)` | `var(--{prefix}-sys-motion-duration-fast)` | system 角色消费 |
| `tag-icon-margin-right` | `var(--{prefix}-spacing-2)` | `var(--{prefix}-sys-space-3)` | system 角色消费 |
| `tag-padding-horizontal` | `var(--{prefix}-spacing-4)` | `10px` | 保留平台密度 / 形状差异 |
| `tag-padding-vertical` | `0` | `0` | 保留组件几何 / 结构语义 |
| `tag-round-radius` | `100px` | `100px` | 保留组件几何 / 结构语义 |
| `tag-size-lg` | `var(--{prefix}-size-7)` | `36px` | 保留平台密度 / 形状差异 |
| `tag-size-lg-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-md)` | system 角色消费 |
| `tag-size-md` | `var(--{prefix}-size-6)` | `32px` | 保留平台密度 / 形状差异 |
| `tag-size-md-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-md)` | system 角色消费 |
| `tag-size-sm` | `var(--{prefix}-size-5)` | `28px` | 保留平台密度 / 形状差异 |
| `tag-size-sm-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` | system 角色消费 |
| `tag-size-xl` | `var(--{prefix}-size-8)` | `40px` | 保留平台密度 / 形状差异 |
| `tag-size-xl-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-lg)` | system 角色消费 |
| `tag-size-xs` | `var(--{prefix}-size-4)` | `24px` | 保留平台密度 / 形状差异 |
| `tag-size-xs-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` | system 角色消费 |
## button

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `button-border-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `button-content-gap` | `var(--{prefix}-sys-space-3)` | `var(--{prefix}-sys-space-3)` | system 角色消费 |
| `button-focus-offset` | `2px` | `2px` | 保留组件几何 / 结构语义 |
| `button-focus-width` | `2px` | `2px` | 保留组件几何 / 结构语义 |
| `button-group-border-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `button-icon-container-padding` | `var(--{prefix}-sys-space-3)` | `var(--{prefix}-sys-space-3)` | system 角色消费 |
| `button-large-font-size` | `var(--{prefix}-sys-font-size-lg)` | `var(--{prefix}-sys-font-size-lg)` | system 角色消费 |
| `button-large-height` | `44px` | `44px` | 保留组件几何 / 结构语义 |
| `button-large-padding` | `0 22px` | `0 22px` | 保留组件几何 / 结构语义 |
| `button-large-stacked-height` | `56px` | `56px` | 保留组件几何 / 结构语义 |
| `button-line-height` | `1.2` | `1.2` | 保留组件几何 / 结构语义 |
| `button-loading-duration` | `1s` | `1s` | 保留组件几何 / 结构语义 |
| `button-loading-line-height` | `3px` | `3px` | 保留组件几何 / 结构语义 |
| `button-loading-line-width` | `40%` | `40%` | 保留组件几何 / 结构语义 |
| `button-loading-static-opacity` | `0.5` | `0.5` | 保留组件几何 / 结构语义 |
| `button-mini-font-size` | `var(--{prefix}-font-size-xs)` | `var(--{prefix}-font-size-xs)` | 保留组件几何 / 结构语义 |
| `button-mini-height` | `20px` | `20px` | 保留组件几何 / 结构语义 |
| `button-mini-padding` | `0 var(--{prefix}-sys-space-4)` | `0 var(--{prefix}-sys-space-4)` | system 角色消费 |
| `button-mini-stacked-height` | `36px` | `36px` | 保留组件几何 / 结构语义 |
| `button-normal-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-md)` | system 角色消费 |
| `button-normal-height` | `36px` | `36px` | 保留组件几何 / 结构语义 |
| `button-normal-padding` | `0 var(--{prefix}-sys-space-6)` | `0 var(--{prefix}-sys-space-6)` | system 角色消费 |
| `button-normal-stacked-height` | `var(--{prefix}-button-stacked-height)` | `var(--{prefix}-button-stacked-height)` | 保留组件几何 / 结构语义 |
| `button-plain-state-opacity-active` | `1` | `1` | 保留组件几何 / 结构语义 |
| `button-plain-state-opacity-hover` | `0.5` | `0.5` | 保留组件几何 / 结构语义 |
| `button-round-padding` | `var(--{prefix}-sys-space-3)` | `var(--{prefix}-sys-space-3)` | system 角色消费 |
| `button-small-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` | system 角色消费 |
| `button-small-height` | `28px` | `28px` | 保留组件几何 / 结构语义 |
| `button-small-padding` | `0 var(--{prefix}-sys-space-5)` | `0 var(--{prefix}-sys-space-5)` | system 角色消费 |
| `button-small-stacked-height` | `44px` | `44px` | 保留组件几何 / 结构语义 |
| `button-stacked-border-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `button-stacked-gap` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` | system 角色消费 |
| `button-stacked-height` | `48px` | `48px` | 保留组件几何 / 结构语义 |
| `button-stacked-padding` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` | system 角色消费 |
| `button-state-opacity-active` | `0.12` | `0.12` | 保留组件几何 / 结构语义 |
| `button-state-opacity-hover` | `0.08` | `0.08` | 保留组件几何 / 结构语义 |
| `button-transition-duration` | `var(--{prefix}-sys-motion-duration-standard)` | `var(--{prefix}-sys-motion-duration-standard)` | system 角色消费 |
| `button-xl-font-size` | `var(--{prefix}-sys-font-size-xl)` | `var(--{prefix}-sys-font-size-xl)` | system 角色消费 |
| `button-xl-height` | `52px` | `52px` | 保留组件几何 / 结构语义 |
| `button-xl-padding` | `0 28px` | `0 28px` | 保留组件几何 / 结构语义 |
| `button-xl-stacked-height` | `64px` | `64px` | 保留组件几何 / 结构语义 |
## alert

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `alert-action-margin-left` | `var(--{prefix}-sys-space-5)` | `var(--{prefix}-sys-space-5)` | system 角色消费 |
| `alert-border-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `alert-border-width` | `1px` | `1px` | 保留组件几何 / 结构语义 |
| `alert-close-duration` | `var(--{prefix}-sys-motion-duration-slow)` | `var(--{prefix}-sys-motion-duration-slow)` | system 角色消费 |
| `alert-close-margin-left` | `var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-4)` | system 角色消费 |
| `alert-icon-margin-right` | `var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-4)` | system 角色消费 |
| `alert-icon-size` | `16px` | `16px` | 保留组件几何 / 结构语义 |
| `alert-line-height` | `1.5715` | `1.5715` | 保留组件几何 / 结构语义 |
| `alert-padding-horizontal` | `var(--{prefix}-sys-space-6)` | `var(--{prefix}-sys-space-6)` | system 角色消费 |
| `alert-padding-vertical` | `var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-4)` | system 角色消费 |
| `alert-title-margin-bottom` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` | system 角色消费 |
## hover

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `hover-overlay-focusing-opacity` | `0.12` | `0.12` | 保留组件几何 / 结构语义 |
| `hover-overlay-opacity` | `0.04` | `0.04` | 保留组件几何 / 结构语义 |
| `hover-transition-duration` | `var(--{prefix}-sys-motion-duration-fast)` | `var(--{prefix}-sys-motion-duration-fast)` | system 角色消费 |
## paper

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `paper-border-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `paper-border-width` | `1px` | `1px` | 保留组件几何 / 结构语义 |
| `paper-transition-duration` | `var(--{prefix}-sys-motion-duration-slow)` | `var(--{prefix}-sys-motion-duration-slow)` | system 角色消费 |
## ripple

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `ripple-cubic-bezier` | `cubic-bezier(0.68, 0.01, 0.62, 0.6)` | `cubic-bezier(0.68, 0.01, 0.62, 0.6)` | 保留组件几何 / 结构语义 |
| `ripple-expand-duration` | `200ms` | `200ms` | 保留组件几何 / 结构语义 |
| `ripple-fade-duration` | `140ms` | `140ms` | 保留组件几何 / 结构语义 |
## skeleton

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `skeleton-animation-duration` | `1s` | `1s` | 保留组件几何 / 结构语义 |
| `skeleton-avatar-border-radius` | `50%` | `50%` | 保留组件几何 / 结构语义 |
| `skeleton-avatar-margin-right` | `var(--{prefix}-sys-space-6)` | `var(--{prefix}-sys-space-6)` | system 角色消费 |
| `skeleton-avatar-size` | `34px` | `34px` | 保留组件几何 / 结构语义 |
| `skeleton-card-border-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `skeleton-card-height` | `160px` | `160px` | 保留组件几何 / 结构语义 |
| `skeleton-card-margin-bottom` | `var(--{prefix}-sys-space-6)` | `var(--{prefix}-sys-space-6)` | system 角色消费 |
| `skeleton-content-padding` | `var(--{prefix}-sys-space-6)` | `var(--{prefix}-sys-space-6)` | system 角色消费 |
| `skeleton-row-border-radius` | `10px` | `10px` | 保留组件几何 / 结构语义 |
| `skeleton-row-height` | `12px` | `12px` | 保留组件几何 / 结构语义 |
| `skeleton-row-margin-top` | `10px` | `10px` | 保留组件几何 / 结构语义 |
| `skeleton-shape-border-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `skeleton-shape-size-lg` | `60px` | `60px` | 保留组件几何 / 结构语义 |
| `skeleton-shape-size-md` | `48px` | `48px` | 保留组件几何 / 结构语义 |
| `skeleton-shape-size-sm` | `36px` | `36px` | 保留组件几何 / 结构语义 |
| `skeleton-title-border-radius` | `10px` | `10px` | 保留组件几何 / 结构语义 |
| `skeleton-title-width` | `50%` | `50%` | 保留组件几何 / 结构语义 |
| `skeleton-transition-duration` | `var(--{prefix}-sys-motion-duration-slow)` | `var(--{prefix}-sys-motion-duration-slow)` | system 角色消费 |
## link

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `link-border-radius` | `var(--{prefix}-sys-radius-sm)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `link-focus-offset` | `2px` | `2px` | 保留组件几何 / 结构语义 |
| `link-focus-opacity` | `0.8` | `0.8` | 保留组件几何 / 结构语义 |
| `link-focus-width` | `2px` | `2px` | 保留组件几何 / 结构语义 |
| `link-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-md)` | system 角色消费 |
| `link-icon-size` | `—` | `1em` | 保留平台密度 / 形状差异 |
| `link-line-height` | `var(--{prefix}-line-height)` | `1.5` | 保留平台密度 / 形状差异 |
| `link-margin-icon-right` | `var(--{prefix}-spacing-3)` | `0.25em` | 保留平台密度 / 形状差异 |
| `link-padding-horizontal` | `var(--{prefix}-spacing-2)` | `0.25em` | 保留平台密度 / 形状差异 |
| `link-padding-vertical` | `1px` | `1px` | 保留组件几何 / 结构语义 |
| `link-spin-duration` | `1s` | `1s` | 保留组件几何 / 结构语义 |
| `link-transition-duration` | `0.15s` | `0.15s` | 保留组件几何 / 结构语义 |
## space

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `space-size-lg-column-gap` | `var(--{prefix}-sys-space-5)` | `var(--{prefix}-sys-space-5)` | system 角色消费 |
| `space-size-lg-row-gap` | `var(--{prefix}-sys-space-6)` | `var(--{prefix}-sys-space-6)` | system 角色消费 |
| `space-size-md-column-gap` | `var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-4)` | system 角色消费 |
| `space-size-md-row-gap` | `var(--{prefix}-sys-space-5)` | `var(--{prefix}-sys-space-5)` | system 角色消费 |
| `space-size-sm-column-gap` | `var(--{prefix}-sys-space-3)` | `var(--{prefix}-sys-space-3)` | system 角色消费 |
| `space-size-sm-row-gap` | `var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-4)` | system 角色消费 |
| `space-size-xl-column-gap` | `var(--{prefix}-sys-space-6)` | `var(--{prefix}-sys-space-6)` | system 角色消费 |
| `space-size-xl-row-gap` | `var(--{prefix}-sys-space-8)` | `var(--{prefix}-sys-space-8)` | system 角色消费 |
| `space-size-xs-column-gap` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` | system 角色消费 |
| `space-size-xs-row-gap` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` | system 角色消费 |
## tabs

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `tabs-active-font-weight` | `var(--{prefix}-sys-font-weight-semibold)` | `var(--{prefix}-sys-font-weight-semibold)` | system 角色消费 |
| `tabs-active-shadow` | `0 1px 3px rgba(0, 0, 0, 0.12)` | `none` | 保留平台密度 / 形状差异 |
| `tabs-animation-duration` | `var(--{prefix}-sys-motion-duration-standard)` | `var(--{prefix}-sys-motion-duration-standard)` | system 角色消费 |
| `tabs-border-width` | `1px` | `1px` | 保留组件几何 / 结构语义 |
| `tabs-capsule-radius` | `var(--{prefix}-sys-radius-pill)` | `12px` | system 角色消费 |
| `tabs-content-padding` | `var(--{prefix}-sys-space-6)` | `var(--{prefix}-sys-space-5)` | system 角色消费 |
| `tabs-control-height` | `var(--{prefix}-sys-control-height-xs)` | `var(--{prefix}-sys-control-height-xs)` | system 角色消费 |
| `tabs-focus-offset` | `-3px` | `-3px` | 保留组件几何 / 结构语义 |
| `tabs-focus-width` | `2px` | `2px` | 保留组件几何 / 结构语义 |
| `tabs-group-padding` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` | system 角色消费 |
| `tabs-header-padding` | `var(--{prefix}-sys-space-5)` | `var(--{prefix}-sys-space-4)` | system 角色消费 |
| `tabs-icon-gap` | `var(--{prefix}-sys-space-3)` | `var(--{prefix}-sys-space-3)` | system 角色消费 |
| `tabs-indicator-radius` | `1px` | `1px` | 保留组件几何 / 结构语义 |
| `tabs-indicator-size` | `2px` | `2px` | 保留组件几何 / 结构语义 |
| `tabs-nav-gap` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` | system 角色消费 |
| `tabs-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `tabs-size-lg-tab-font-size` | `var(--{prefix}-sys-font-size-lg)` | `var(--{prefix}-sys-font-size-lg)` | system 角色消费 |
| `tabs-size-lg-tab-height` | `var(--{prefix}-sys-control-height-lg)` | `var(--{prefix}-sys-control-height-lg)` | system 角色消费 |
| `tabs-size-lg-tab-padding` | `10px var(--{prefix}-sys-space-7)` | `10px var(--{prefix}-sys-space-7)` | system 角色消费 |
| `tabs-size-md-tab-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-md)` | system 角色消费 |
| `tabs-size-md-tab-height` | `var(--{prefix}-sys-control-height-md)` | `var(--{prefix}-sys-control-height-md)` | system 角色消费 |
| `tabs-size-md-tab-padding` | `var(--{prefix}-sys-space-4) var(--{prefix}-sys-space-6)` | `var(--{prefix}-sys-space-4) var(--{prefix}-sys-space-6)` | system 角色消费 |
| `tabs-size-sm-tab-font-size` | `var(--{prefix}-sys-font-size-sm)` | `var(--{prefix}-sys-font-size-sm)` | system 角色消费 |
| `tabs-size-sm-tab-height` | `var(--{prefix}-sys-control-height-sm)` | `var(--{prefix}-sys-control-height-sm)` | system 角色消费 |
| `tabs-size-sm-tab-padding` | `var(--{prefix}-sys-space-3) var(--{prefix}-sys-space-5)` | `var(--{prefix}-sys-space-3) var(--{prefix}-sys-space-5)` | system 角色消费 |
| `tabs-size-xl-tab-font-size` | `var(--{prefix}-sys-font-size-xl)` | `var(--{prefix}-sys-font-size-xl)` | system 角色消费 |
| `tabs-size-xl-tab-height` | `var(--{prefix}-sys-control-height-xl)` | `var(--{prefix}-sys-control-height-xl)` | system 角色消费 |
| `tabs-size-xl-tab-padding` | `var(--{prefix}-sys-space-5) var(--{prefix}-sys-space-8)` | `var(--{prefix}-sys-space-5) var(--{prefix}-sys-space-8)` | system 角色消费 |
| `tabs-size-xs-tab-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` | system 角色消费 |
| `tabs-size-xs-tab-height` | `var(--{prefix}-sys-control-height-xs)` | `var(--{prefix}-sys-control-height-xs)` | system 角色消费 |
| `tabs-size-xs-tab-padding` | `var(--{prefix}-sys-space-2) var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-2) var(--{prefix}-sys-space-4)` | system 角色消费 |
| `tabs-tab-gap` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` | system 角色消费 |
| `tabs-touch-target` | `var(--{prefix}-sys-control-touch-target)` | `var(--{prefix}-sys-control-touch-target)` | system 角色消费 |
## pagination

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `pagination-focus-offset` | `1px` | `1px` | 保留组件几何 / 结构语义 |
| `pagination-focus-space` | `3px` | `3px` | 保留组件几何 / 结构语义 |
| `pagination-focus-width` | `2px` | `2px` | 保留组件几何 / 结构语义 |
| `pagination-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-md)` | system 角色消费 |
| `pagination-gap` | `var(--{prefix}-sys-space-5)` | `var(--{prefix}-sys-space-5)` | system 角色消费 |
| `pagination-icon-size` | `16px` | `16px` | 保留组件几何 / 结构语义 |
| `pagination-input-width` | `32px` | `32px` | 保留组件几何 / 结构语义 |
| `pagination-item-border-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `pagination-item-gap` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` | system 角色消费 |
| `pagination-item-padding` | `var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-4)` | system 角色消费 |
| `pagination-select-width` | `max-content` | `max-content` | 保留组件几何 / 结构语义 |
| `pagination-size-lg` | `44px` | `44px` | 保留组件几何 / 结构语义 |
| `pagination-size-md` | `36px` | `36px` | 保留组件几何 / 结构语义 |
| `pagination-size-sm` | `28px` | `28px` | 保留组件几何 / 结构语义 |
| `pagination-size-xl` | `52px` | `52px` | 保留组件几何 / 结构语义 |
| `pagination-size-xs` | `24px` | `24px` | 保留组件几何 / 结构语义 |
| `pagination-touch-size` | `44px` | `44px` | 保留组件几何 / 结构语义 |
## switch

| Token（省略 --c- / --mp-） | Cedar | Maple | 处置 |
| --- | --- | --- | --- |
| `switch-disabled-opacity` | `0.5` | `0.5` | 保留组件几何 / 结构语义 |
| `switch-duration` | `var(--{prefix}-sys-motion-duration-standard)` | `var(--{prefix}-sys-motion-duration-standard)` | system 角色消费 |
| `switch-focus-width` | `2px` | `2px` | 保留组件几何 / 结构语义 |
| `switch-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` | system 角色消费 |
| `switch-gap` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` | system 角色消费 |
| `switch-handle-size` | `16px` | `16px` | 保留组件几何 / 结构语义 |
| `switch-height` | `24px` | `24px` | 保留组件几何 / 结构语义 |
| `switch-hit-area` | `0px` | `0px` | 保留组件几何 / 结构语义 |
| `switch-line-handle-size` | `20px` | `20px` | 保留组件几何 / 结构语义 |
| `switch-line-height` | `12px` | `12px` | 保留组件几何 / 结构语义 |
| `switch-loading-duration` | `1s` | `1s` | 保留组件几何 / 结构语义 |
| `switch-radius` | `var(--{prefix}-sys-radius-pill)` | `var(--{prefix}-sys-radius-pill)` | system 角色消费 |
| `switch-ripple-duration` | `400ms` | `400ms` | 保留组件几何 / 结构语义 |
| `switch-ripple-scale` | `2.4` | `2.4` | 保留组件几何 / 结构语义 |
| `switch-round-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` | system 角色消费 |
| `switch-size-lg-scale` | `1.2` | `1.2` | 保留组件几何 / 结构语义 |
| `switch-size-sm-scale` | `0.8` | `0.8` | 保留组件几何 / 结构语义 |
| `switch-tonal-border-width` | `2px` | `2px` | 保留组件几何 / 结构语义 |
| `switch-tonal-handle-size` | `24px` | `24px` | 保留组件几何 / 结构语义 |
| `switch-tonal-height` | `32px` | `32px` | 保留组件几何 / 结构语义 |
| `switch-tonal-width` | `52px` | `52px` | 保留组件几何 / 结构语义 |
| `switch-width` | `40px` | `40px` | 保留组件几何 / 结构语义 |

## 验证

共列出 481 个两端非颜色默认声明。运行 `node bin/non-color-token-check.mjs` 检查变量解析、四主题与新增动效覆盖和 reduced-motion。应结合已有颜色/消费者审计；浏览器布局仍由集成验收负责。


## 扩展：另外20族

Avatar/Collapse/Checkbox/Overlay/Trigger 补齐 reduced-motion；ProgressGroup 补14组公开变量，覆盖直线粗细、Tooltip几何/排版和状态过渡，停用所有内置动态效果。Ellipsis/AutoComplete/CountTo/Countdown/Divider/Empty/Statistic 为静态排版/布局，保留组件几何；FieldDecorator/Input 保留已治理的私有派生值与反馈动效；Icon/Popover/Tooltip/InputNumber 保留已完成的动效与平台差异。局部层级保持低整数或既有 system layer，不误改成全局浮层层级。CountTo/Countdown 的数值变化由运行时业务计时驱动，不等同于 CSS 动效。本次不重写 JS 计时模型。

### back-top

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `back-top-bottom` | `40px` | `40px` |
| `back-top-button-border-radius` | `50%` | `50%` |
| `back-top-button-size` | `var(--{prefix}-sys-control-touch-target)` | `var(--{prefix}-sys-control-touch-target)` |
| `back-top-focus-offset` | `2px` | `2px` |
| `back-top-focus-width` | `2px` | `2px` |
| `back-top-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-md)` |
| `back-top-icon-size` | `20px` | `20px` |
| `back-top-right` | `40px` | `40px` |
| `back-top-z-index` | `var(--{prefix}-z-index-local-sticky)` | `var(--{prefix}-z-index-local-sticky)` |
### ellipsis

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `ellipsis-focus-offset` | `2px` | `2px` |
| `ellipsis-focus-width` | `2px` | `2px` |
### auto-complete

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `auto-complete-option-font-weight-selected` | `var(--{prefix}-sys-font-weight-medium)` | `var(--{prefix}-sys-font-weight-medium)` |
| `auto-complete-option-height` | `36px` | `36px` |
| `auto-complete-option-padding-horizontal` | `var(--{prefix}-sys-space-5)` | `var(--{prefix}-sys-space-5)` |
| `auto-complete-popup-border-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` |
| `auto-complete-popup-box-shadow` | `0 4px 10px rgba(0, 0, 0, 0.1)` | `0 4px 10px rgba(0, 0, 0, 0.1)` |
| `auto-complete-popup-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-md)` |
| `auto-complete-popup-max-height` | `200px` | `200px` |
| `auto-complete-popup-padding-vertical` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` |
### avatar

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `avatar-border-width` | `2px` | `2px` |
| `avatar-circle-border-radius` | `50%` | `50%` |
| `avatar-font-size-max-count` | `20px` | `20px` |
| `avatar-font-size-text` | `20px` | `20px` |
| `avatar-font-weight-text` | `500` | `500` |
| `avatar-group-item-border` | `var(--{prefix}-sys-color-surface-default)` | `var(--{prefix}-sys-color-surface-default)` |
| `avatar-group-item-border-width` | `2px` | `2px` |
| `avatar-group-offset` | `-10px` | `-10px` |
| `avatar-group-popover-item-spacing` | `8px` | `8px` |
| `avatar-hover-transform` | `scale(1.1)` | `scale(1.1)` |
| `avatar-motion-duration` | `0.2s` | `0.2s` |
| `avatar-size-default` | `40px` | `40px` |
| `avatar-size-trigger-button` | `20px` | `20px` |
| `avatar-size-trigger-icon` | `12px` | `12px` |
| `avatar-spacing-trigger-button-bottom` | `4px` | `4px` |
| `avatar-spacing-trigger-button-right` | `4px` | `4px` |
| `avatar-square-border-radius` | `4px` | `4px` |
| `avatar-text-padding-inline` | `4px` | `4px` |
| `avatar-trigger-button-border-radius` | `50%` | `50%` |
| `avatar-trigger-icon-button` | `var(--{prefix}-sys-color-content-primary)` | `var(--{prefix}-sys-color-content-primary)` |
| `avatar-trigger-overlay-font-size` | `16px` | `16px` |
| `avatar-trigger-overlay-icon` | `var(--{prefix}-sys-color-content-on-dark)` | `var(--{prefix}-sys-color-content-on-dark)` |
| `avatar-z-index-overlay` | `0` | `0` |
| `avatar-z-index-overlay-hover` | `2` | `2` |
| `avatar-z-index-trigger` | `1` | `1` |
### checkbox

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `checkbox-action-padding` | `calc((var(--{prefix}-internal-checkbox-hover-size) / 2) - (var(--{prefix}-checkbox-control-size) / 2))` | `6px` |
| `checkbox-animation-duration` | `var(--{prefix}-transition-duration-3)` | `var(--{prefix}-sys-motion-duration-standard)` |
| `checkbox-control-size` | `14px` | `24px` |
| `checkbox-group-gap` | `var(--{prefix}-spacing-7)` | `0` |
| `checkbox-label-font-size` | `var(--{prefix}-font-size-body-3)` | `var(--{prefix}-font-size-md)` |
| `checkbox-label-gap` | `var(--{prefix}-spacing-4)` | `0` |
| `internal-checkbox-border-radius` | `var(--{prefix}-border-radius-sm)` | `—` |
| `internal-checkbox-border-style` | `solid` | `—` |
| `internal-checkbox-border-width` | `var(--{prefix}-border-width-2)` | `—` |
| `internal-checkbox-check-icon-size` | `var(--{prefix}-size-2)` | `—` |
| `internal-checkbox-group-vertical-line-height` | `var(--{prefix}-size-8)` | `—` |
| `internal-checkbox-hover-duration` | `var(--{prefix}-transition-duration-1)` | `—` |
| `internal-checkbox-hover-size` | `var(--{prefix}-size-6)` | `—` |
| `internal-checkbox-indeterminate-icon-height` | `2px` | `—` |
| `internal-checkbox-indeterminate-icon-width` | `6px` | `—` |
| `internal-checkbox-linear` | `var(--{prefix}-transition-timing-function-linear)` | `—` |
| `internal-checkbox-overshoot` | `var(--{prefix}-transition-timing-function-overshoot)` | `—` |
### collapse

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `collapse-border-radius` | `var(--{prefix}-border-radius-md)` | `4px` |
| `collapse-border-width` | `var(--{prefix}-border-width-1)` | `1px` |
| `collapse-content-font-size` | `var(--{prefix}-font-size-body-3)` | `var(--{prefix}-font-size-md)` |
| `collapse-content-padding-vertical` | `var(--{prefix}-spacing-4)` | `10px` |
| `collapse-expand-icon` | `var(--{prefix}-sys-color-content-secondary)` | `var(--{prefix}-sys-color-content-secondary)` |
| `collapse-expand-icon-active-transform` | `rotate(90deg)` | `rotate(-180deg)` |
| `collapse-expand-icon-right-active-transform` | `rotate(-90deg)` | `rotate(-180deg)` |
| `collapse-expand-icon-right-transform` | `rotate(0deg)` | `rotate(0deg)` |
| `collapse-expand-icon-size` | `14px` | `16px` |
| `collapse-expand-icon-spacing-text` | `5px` | `8px` |
| `collapse-expand-icon-transform` | `rotate(0deg)` | `rotate(0deg)` |
| `collapse-item-border-width` | `var(--{prefix}-border-width-1)` | `1px` |
| `collapse-item-margin-top` | `var(--{prefix}-spacing-4)` | `16px` |
| `collapse-line-height` | `1.5715` | `1.5` |
| `collapse-motion-duration` | `var(--{prefix}-transition-duration-2)` | `0.25s` |
| `collapse-motion-easing` | `var(--{prefix}-transition-timing-function-standard)` | `ease` |
| `collapse-title-font-size` | `var(--{prefix}-font-size-body-3)` | `var(--{prefix}-font-size-lg)` |
| `collapse-title-font-weight-active` | `var(--{prefix}-font-weight-500)` | `500` |
| `collapse-title-line-height` | `24px` | `24px` |
| `collapse-title-padding-horizontal` | `13px` | `12px` |
| `collapse-title-padding-vertical` | `var(--{prefix}-spacing-4)` | `10px` |
### count-to

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `count-to-text-font-size` | `var(--{prefix}-font-size-lg)` | `var(--{prefix}-font-size-lg)` |
### countdown

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `countdown-text-font-size` | `var(--{prefix}-font-size-lg)` | `var(--{prefix}-font-size-lg)` |
### divider

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `divider-border-width` | `1px` | `1px` |
| `divider-orientation-horizontal-inset-lg` | `32px` | `32px` |
| `divider-orientation-horizontal-inset-md` | `24px` | `24px` |
| `divider-orientation-horizontal-inset-sm` | `16px` | `16px` |
| `divider-orientation-horizontal-inset-xl` | `40px` | `40px` |
| `divider-orientation-horizontal-inset-xs` | `12px` | `12px` |
| `divider-orientation-horizontal-spacing-lg` | `24px` | `24px` |
| `divider-orientation-horizontal-spacing-md` | `16px` | `16px` |
| `divider-orientation-horizontal-spacing-sm` | `12px` | `12px` |
| `divider-orientation-horizontal-spacing-xl` | `32px` | `32px` |
| `divider-orientation-horizontal-spacing-xs` | `8px` | `8px` |
| `divider-orientation-vertical-inset-lg` | `8px` | `8px` |
| `divider-orientation-vertical-inset-md` | `6px` | `6px` |
| `divider-orientation-vertical-inset-sm` | `4px` | `4px` |
| `divider-orientation-vertical-inset-xl` | `12px` | `12px` |
| `divider-orientation-vertical-inset-xs` | `2px` | `2px` |
| `divider-orientation-vertical-spacing-lg` | `16px` | `16px` |
| `divider-orientation-vertical-spacing-md` | `12px` | `12px` |
| `divider-orientation-vertical-spacing-sm` | `8px` | `8px` |
| `divider-orientation-vertical-spacing-xl` | `24px` | `24px` |
| `divider-orientation-vertical-spacing-xs` | `4px` | `4px` |
| `divider-text-align-inset` | `24px` | `24px` |
| `divider-text-padding` | `16px` | `8px` |
### empty

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `empty-description-font-size` | `var(--{prefix}-font-size-body-3)` | `14px` |
| `empty-description-line-height` | `var(--{prefix}-line-height)` | `1.5` |
| `empty-extra-margin-top` | `var(--{prefix}-spacing-5)` | `20px` |
| `empty-image-margin-bottom` | `var(--{prefix}-spacing-2)` | `4px` |
| `empty-padding` | `var(--{prefix}-spacing-5) 0` | `20px` |
| `empty-size-lg` | `var(--{prefix}-size-35)` | `140px` |
| `empty-size-md` | `var(--{prefix}-size-25)` | `120px` |
| `empty-size-sm` | `var(--{prefix}-size-20)` | `100px` |
| `empty-size-xl` | `var(--{prefix}-size-45)` | `160px` |
| `empty-size-xs` | `var(--{prefix}-size-15)` | `80px` |
### field-decorator

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `field-border-radius` | `var(--{prefix}-border-radius-md)` | `4px` |
| `field-border-width` | `1px` | `1px` |
| `field-clear-icon-size` | `12px` | `var(--{prefix}-field-icon-size)` |
| `field-clear-padding` | `2px` | `4px` |
| `field-clear-radius` | `50%` | `50%` |
| `field-clear-visibility` | `hidden` | `visible` |
| `field-content-gap` | `8px` | `8px` |
| `field-content-padding-vertical` | `5px` | `8px` |
| `field-hint-duration` | `0.2s` | `0.2s` |
| `field-hint-scale` | `0.75` | `0.75` |
| `field-hint-space` | `4px` | `4px` |
| `field-icon-size` | `14px` | `20px` |
| `field-line-height` | `1.5` | `1.5` |
| `field-padding-horizontal` | `12px` | `16px` |
| `field-size-lg-font-size` | `14px` | `16px` |
| `field-size-lg-height` | `36px` | `56px` |
| `field-size-md-font-size` | `14px` | `16px` |
| `field-size-md-height` | `32px` | `48px` |
| `field-size-sm-font-size` | `14px` | `14px` |
| `field-size-sm-height` | `28px` | `40px` |
| `field-size-xl-font-size` | `16px` | `18px` |
| `field-size-xl-height` | `44px` | `64px` |
| `field-size-xs-font-size` | `12px` | `12px` |
| `field-size-xs-height` | `24px` | `32px` |
| `field-variant-standard-line-size` | `1px` | `1px` |
| `field-variant-standard-line-size-focus` | `2px` | `2px` |
| `internal-field-size-lg-font-size` | `14px` | `—` |
| `internal-field-size-lg-line-height` | `1.5715` | `—` |
| `internal-field-size-lg-padding-y` | `9px` | `—` |
| `internal-field-size-md-font-size` | `14px` | `—` |
| `internal-field-size-md-line-height` | `1.5715` | `—` |
| `internal-field-size-md-padding-y` | `5px` | `—` |
| `internal-field-size-sm-font-size` | `14px` | `—` |
| `internal-field-size-sm-line-height` | `1.5715` | `—` |
| `internal-field-size-sm-padding-y` | `3px` | `—` |
| `internal-field-size-xl-font-size` | `16px` | `—` |
| `internal-field-size-xl-line-height` | `1.5` | `—` |
| `internal-field-size-xl-padding-y` | `10px` | `—` |
| `internal-field-size-xs-font-size` | `12px` | `—` |
| `internal-field-size-xs-line-height` | `1.667` | `—` |
| `internal-field-size-xs-padding-y` | `2px` | `—` |
| `search-size-icon` | `14px` | `—` |
### icon

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `icon-size` | `inherit` | `inherit` |
| `icon-spin-duration` | `1s` | `1s` |
### input

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `input-control-font-size` | `inherit` | `inherit` |
| `input-control-height` | `auto` | `auto` |
| `input-control-line-height` | `inherit` | `inherit` |
| `input-control-padding-horizontal` | `0` | `0` |
| `input-counter-font-size` | `12px` | `12px` |
| `input-feedback-duration` | `1s` | `1s` |
### overlay

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `overlay-animation-duration` | `var(--{prefix}-sys-motion-duration-slow)` | `var(--{prefix}-sys-motion-duration-slow)` |
| `overlay-content-z-index` | `var(--{prefix}-sys-layer-raised)` | `var(--{prefix}-sys-layer-raised)` |
### popover

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `popover-animation-duration` | `var(--{prefix}-sys-motion-duration-standard)` | `var(--{prefix}-sys-motion-duration-standard)` |
| `popover-arrow-z-index` | `1` | `1` |
| `popover-border-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` |
| `popover-border-width` | `1px` | `1px` |
| `popover-box-shadow` | `var(--{prefix}-shadow2-down)` | `0 3px 3px -2px var(--{prefix}-shadow-key-umbra-opacity), 0 3px 4px 0 var(--{prefix}-shadow-key-penumbra-opacity), 0 1px 8px 0 var(--{prefix}-shadow-key-ambient-opacity)` |
| `popover-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-md)` |
| `popover-line-height` | `var(--{prefix}-line-height)` | `var(--{prefix}-line-height)` |
| `popover-padding-horizontal` | `var(--{prefix}-sys-space-7)` | `var(--{prefix}-sys-space-7)` |
| `popover-padding-vertical` | `var(--{prefix}-sys-space-6)` | `var(--{prefix}-sys-space-6)` |
| `popover-title-content-gap` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` |
| `popover-title-font-size` | `var(--{prefix}-sys-font-size-lg)` | `var(--{prefix}-sys-font-size-lg)` |
| `popover-title-font-weight` | `var(--{prefix}-sys-font-weight-medium)` | `var(--{prefix}-sys-font-weight-medium)` |
### progress-group

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `progress-group-dot-size` | `var(--{prefix}-size-2)` | `8px` |
| `progress-group-font-size` | `var(--{prefix}-font-size-body-1)` | `14px` |
| `progress-group-gap` | `var(--{prefix}-spacing-3)` | `8px` |
| `progress-group-item-gap` | `var(--{prefix}-spacing-2)` | `6px` |
| `progress-group-radius` | `9999px` | `999px` |
| `progress-group-size-lg-thickness` | `12px` | `12px` |
| `progress-group-size-md-thickness` | `8px` | `8px` |
| `progress-group-size-sm-thickness` | `4px` | `4px` |
| `progress-group-size-xl-thickness` | `16px` | `16px` |
| `progress-group-size-xs-thickness` | `2px` | `2px` |
| `progress-group-status-font-weight` | `var(--{prefix}-sys-font-weight-medium)` | `var(--{prefix}-sys-font-weight-medium)` |
| `progress-group-tooltip-duration` | `var(--{prefix}-sys-motion-duration-fast)` | `var(--{prefix}-sys-motion-duration-fast)` |
| `progress-group-tooltip-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` |
| `progress-group-tooltip-line-height` | `1.4` | `1.4` |
| `progress-group-tooltip-max-width` | `240px` | `240px` |
| `progress-group-tooltip-offset` | `var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-4)` |
| `progress-group-tooltip-padding` | `5px var(--{prefix}-sys-space-4)` | `5px var(--{prefix}-sys-space-4)` |
| `progress-group-tooltip-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` |
| `progress-group-transition-duration` | `var(--{prefix}-sys-motion-duration-standard)` | `var(--{prefix}-sys-motion-duration-standard)` |
### statistic

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `statistic-decimal-font-size` | `inherit` | `inherit` |
| `statistic-extra-font-size` | `var(--{prefix}-font-size-body-3)` | `var(--{prefix}-font-size-sm)` |
| `statistic-extra-margin-top` | `var(--{prefix}-spacing-4)` | `8px` |
| `statistic-prefix-font-size` | `14px` | `var(--{prefix}-font-size-md)` |
| `statistic-prefix-spacing` | `var(--{prefix}-spacing-1)` | `4px` |
| `statistic-suffix-font-size` | `14px` | `var(--{prefix}-font-size-md)` |
| `statistic-suffix-spacing` | `var(--{prefix}-spacing-1)` | `4px` |
| `statistic-title-font-size` | `var(--{prefix}-font-size-body-3)` | `var(--{prefix}-font-size-sm)` |
| `statistic-title-margin-bottom` | `var(--{prefix}-spacing-4)` | `8px` |
| `statistic-value-font-size` | `26px` | `28px` |
| `statistic-value-font-weight` | `var(--{prefix}-font-weight-500)` | `500` |
### tooltip

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `tooltip-animation-duration` | `var(--{prefix}-sys-motion-duration-standard)` | `var(--{prefix}-sys-motion-duration-standard)` |
| `tooltip-border-radius` | `var(--{prefix}-sys-radius-md)` | `var(--{prefix}-sys-radius-md)` |
| `tooltip-font-size` | `var(--{prefix}-sys-font-size-md)` | `var(--{prefix}-sys-font-size-md)` |
| `tooltip-line-height` | `var(--{prefix}-line-height)` | `var(--{prefix}-line-height)` |
| `tooltip-max-width` | `350px` | `350px` |
| `tooltip-opacity` | `1` | `1` |
| `tooltip-padding-horizontal` | `var(--{prefix}-sys-space-6)` | `var(--{prefix}-sys-space-6)` |
| `tooltip-padding-vertical` | `var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-4)` |
| `tooltip-size-xs-font-size` | `var(--{prefix}-sys-font-size-xs)` | `var(--{prefix}-sys-font-size-xs)` |
| `tooltip-size-xs-padding-horizontal` | `var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-4)` |
| `tooltip-size-xs-padding-vertical` | `var(--{prefix}-sys-space-2)` | `var(--{prefix}-sys-space-2)` |
### trigger

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `trigger-arrow-radius` | `var(--{prefix}-sys-radius-sm)` | `var(--{prefix}-sys-radius-sm)` |
| `trigger-arrow-size` | `var(--{prefix}-sys-space-4)` | `var(--{prefix}-sys-space-4)` |
| `trigger-transition-duration` | `var(--{prefix}-sys-motion-duration-fast)` | `var(--{prefix}-sys-motion-duration-fast)` |
| `trigger-transition-easing` | `var(--{prefix}-sys-motion-easing-standard)` | `var(--{prefix}-sys-motion-easing-standard)` |
### input-number

| Token（省略 --c- / --mp-） | Cedar | Maple |
| --- | --- | --- |
| `input-number-border-radius` | `var(--{prefix}-field-border-radius)` | `var(--{prefix}-field-border-radius)` |
| `input-number-border-width` | `1px` | `1px` |
| `input-number-size-lg-step-button-width` | `var(--{prefix}-sys-control-height-lg)` | `var(--{prefix}-sys-control-height-lg)` |
| `input-number-size-md-step-button-width` | `var(--{prefix}-sys-control-height-md)` | `var(--{prefix}-sys-control-height-md)` |
| `input-number-size-sm-step-button-width` | `var(--{prefix}-sys-control-height-sm)` | `var(--{prefix}-sys-control-height-sm)` |
| `input-number-size-xl-step-button-width` | `var(--{prefix}-sys-control-height-xl)` | `var(--{prefix}-sys-control-height-xl)` |
| `input-number-size-xs-step-button-width` | `var(--{prefix}-sys-control-height-xs)` | `var(--{prefix}-sys-control-height-xs)` |
| `input-number-step-button-icon-size` | `14px` | `14px` |
| `input-number-step-button-transition-duration` | `0.2s` | `0.2s` |
| `input-number-step-button-width` | `var(--{prefix}-sys-control-height-md)` | `var(--{prefix}-sys-control-height-md)` |

扩展20族包含 445 项两端非颜色声明（含内部实现变量，不全部进入公共中央契约）。内部变量属于实现细节，表格用于审查，不承诺外部稳定覆盖入口。

## 本轮最终检查结果

- 非颜色独立审计：33 族、424 个主题／偏好案例、184 次动效／几何覆盖检查通过。
- 原 motion 审计：80 个案例、88 次时长覆盖通过。
- Cedar 受影响组件测试：第一组 86 项、扩展组 157 项通过；Maple 第一组 122 项、扩展组 210 项通过。
- OpenSpec `non-color-token-closure --strict` 有效。Maple 全库 lint 尚有并行改动中的 Checkbox/Radio 格式问题，交集成阶段处理，不声称全库绿灯。
- 新增公开变量共 18 对（4 对组件时长 + 14 对 ProgressGroup 几何／动效），默认值建议见同目录 `non-color-token-contract-suggestions.json`。

## 全局兜底补充

只读扫描发现 Maple Carousel/Picker/TimeRange 的四个 fallback-only 入口未集中登记，TimeRange 次日小字还误用 border 角色；现已登记至 token.less 并改用内容语义，两份 Picker/TimeRange 变量表已修复 mp 前缀。

DropdownMenu 两端增加 selected-hover 角色并确保 disabled 优先。Cedar 原先 hover 直接覆盖 selected；Maple 是 root hover 背景叠加半透明 cover，修复按其真实父子结构处理，而不是误把 cover 当成 root。选中 hover 默认继承选中背景，可独立覆盖；禁用清除 root 和 cover 的交互背景。

`residual-token-check.mjs` 通过 140 个主题／状态案例、112 次覆盖和 4 个次日小字对比度检查。新增四个 Maple token.less，最终目录／契约清单需重新生成。变量建议已追加 JSON 四组；其中 Carousel/Picker/TimeRange 为 Maple 平台入口，并非要求 Cedar 添加虚假的同名 API。
