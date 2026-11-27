---
'@sparknest/ui-build-vue': minor
---

新增 `bundleFormats` 配置项，可按格式关闭整包 JS bundle（如仅保留 `umd`）。默认值仍为 `['es', 'cjs', 'umd']`，不传时行为与之前完全一致；`es/<bundleName>.css` 聚合不受影响。
