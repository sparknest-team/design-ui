---
'@sparknest/ui-build-vue': minor
---

构建工具链升到 vite 8（rolldown），与下游消费方使用同一个打包器。

- `vite` ^5.4.21 → ^8.3.8，`@vitejs/plugin-vue` ^6.0.11，`@vitejs/plugin-vue-jsx` ^5.1.6，`less` ^4.4.0
- `minify: 'esbuild'` → `minify: true`：vite 8 不再自带 esbuild，显式点名会在 renderChunk 阶段报
  `Failed to load transformWithEsbuild`，`true` 使用 bundler 默认压缩器（oxc）
- 生产物断言 `assertNoBundlerHelpers`：es/lib 里出现 `_virtual/preload-helper` 或 `__vitePreload`
  直接构建失败，避免下游 rolldown 报 `Identifier __vitePreload has already been declared`
