# SSR 与浏览器兼容性

- setup、模块顶层和 render 阶段不得无保护访问 `window`、`document`、`navigator`、`HTMLElement`。
- DOM 读写放在 `onMounted` 后，或用 `typeof window !== 'undefined'` 保护。
- 定时器、Observer、全局事件监听必须在卸载时清理。
- 随机 ID 必须保证服务端与客户端一致，避免 hydration mismatch。
- Teleport/Portal 在 SSR 中提供可预测 fallback，并测试 renderToString 和 hydration。
- 样式不得依赖仅在某一浏览器存在且无 fallback 的特性。

支持基线：现代 evergreen 浏览器最近两个主版本；iOS Safari 最近两个大版本；Android Chrome 最近两个大版本。若业务 WebView 有额外版本要求，应在平台覆盖规范中提高基线。

CI 至少运行：SSR smoke test、产物在 Node ESM 中 import、浏览器构建 smoke test。视觉回归不在当前门禁范围内。
