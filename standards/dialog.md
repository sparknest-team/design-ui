# Dialog 组件契约

Cedar 与 Maple 的 Dialog 共享相同的 Props、Emits、Slots、实例方法和函数式 API；仅组件前缀、样式 Token 数值、触控与 hover 表现允许不同。

## Props

- 状态与内容：`open`、`defaultOpen`、`title`、`message`、`type`。
- 布局：`simple`、`width`、`top`、`titleAlign`、`messageAlign`、`alignCenter`、`fullscreen`、`draggable`。
- 按钮：`footer`、`confirmButton`、`cancelButton`、`closable`、确认/取消按钮的 `Text`、`Loading`、`Disabled` 与 `Props`。
- 浮层：`overlay`、`overlayClass`、`overlayStyle`、`overlayClosable`、`escToClose`、`lockScroll`、`popupContainer`、`zIndex`。
- 样式与生命周期：`dialogClass`、`dialogStyle`、`bodyClass`、`bodyStyle`、`hideTitle`、`unmountOnClose`、`overlayAnimationName`、`dialogAnimationName`、`beforeClose`。
- 无障碍：`ariaLabel`、`closeButtonAriaLabel`。

`type` 统一为 `info | success | warning | error`。`popupContainer=false` 禁用 Teleport。`beforeClose(action, done, refs)` 是控制型 Prop，不是事件。

## Events

统一提供 `update:open`、`open`、`opened`、`close`、`closed`、`confirm`、`cancel`、`click-overlay`、`key-escape`。其中 `confirm`、`cancel`、`click-overlay` 和 `key-escape` 传递原始事件。

`DialogAction` 为 `confirm | cancel | close`：确认按钮对应 `confirm`，取消按钮对应 `cancel`，关闭图标、背景层和 ESC 对应 `close`。

## Slots 与实例

- `default`：正文。
- `title`：标题。
- `footer`：暴露 `confirm`、`cancel`、`close`，不得暴露内部 class。
- 实例暴露 `confirm(event?)`、`cancel(event?)`、`close()`。

## 函数式 API

统一提供 `Dialog.open`、`confirm`、`alert`、`info`、`success`、`warning`、`error`、`close`、`setDefaultOptions`、`resetDefaultOptions`。打开方法接受 `DialogConfig | string`，返回 `Promise<DialogAction | void> & { close, update }`。安装后提供 `$dialog`。

不提供可调用的 `Dialog(...)` 入口。按钮颜色通过 `confirmButtonProps` / `cancelButtonProps` 配置，不提供重复的颜色快捷 Props。

## 行为要求

- 同时支持受控 `open` 与非受控 `defaultOpen`。
- `beforeClose` 完成并调用 `done()` 后，才发送 action、更新 open 并 resolve 函数式 Promise。
- Dialog 管理初始焦点、焦点循环、ESC、关闭后的焦点恢复以及最上层实例。
- 两端必须有契约测试覆盖按需样式、SSR、事件顺序、函数方法与无障碍行为。
