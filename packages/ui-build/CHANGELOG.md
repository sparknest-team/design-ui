# @sparknest/ui-build-vue

## 1.4.2

### Patch Changes

- [#23](https://github.com/sparknest-team/design-ui/pull/23) [`ca535e1`](https://github.com/sparknest-team/design-ui/commit/ca535e1c81a11f5261081e5e12e7be6a1a61b304) Thanks [@sparknest-team](https://github.com/sparknest-team)! - 验证 npm Trusted Publishing（OIDC）配置：通过 GitHub Actions 真实发布一次以完成 trusted publisher 绑定验证，无功能性变更。
  （注意：该仓库 .changeset/config.json 的 fixed 分组会把 @sparknest/theme-contract-vue / ui-build-vue / ui-doc-preview-vue / ui-icons-vue 一起抬到同一 patch 版本，这是预期行为。）

## 1.4.1

### Patch Changes

- chore(release): 全仓版本号统一（fixed 组），未变更包同步升版

## 1.4.0

### Minor Changes

- [#12](https://github.com/sparknest-team/design-ui/pull/12) [`eac5c2c`](https://github.com/sparknest-team/design-ui/commit/eac5c2c911fb99ea9ccaefb07f289cea8c93db1b) Thanks [@sparknest-team](https://github.com/sparknest-team)! - 构建工具链升到 vite 8（rolldown），与下游消费方使用同一个打包器。

  - `vite` ^5.4.21 → ^8.3.8，`@vitejs/plugin-vue` ^6.0.11，`@vitejs/plugin-vue-jsx` ^5.1.6，`less` ^4.4.0
  - `minify: 'esbuild'` → `minify: true`：vite 8 不再自带 esbuild，显式点名会在 renderChunk 阶段报
    `Failed to load transformWithEsbuild`，`true` 使用 bundler 默认压缩器（oxc）
  - 生产物断言 `assertNoBundlerHelpers`：es/lib 里出现 `_virtual/preload-helper` 或 `__vitePreload`
    直接构建失败，避免下游 rolldown 报 `Identifier __vitePreload has already been declared`

## 1.2.0

### Minor Changes

- [#7](https://github.com/sparknest-team/design-ui/pull/7) [`e94be5f`](https://github.com/sparknest-team/design-ui/commit/e94be5fb367fa40e841c622a6bd70a0948bdff11) Thanks [@sparknest-team](https://github.com/sparknest-team)! - Release the public packages together at 1.2.0 so applications can install matching versions.

## 1.1.13

### Patch Changes

- [`074b6f7`](https://github.com/sparknest-team/design-ui/commit/074b6f7f4147d478da334a9e185e81a7f24f4092) - Preserve Vue 3.2.47-compatible public component declarations while building with the current stable Vue toolchain.
