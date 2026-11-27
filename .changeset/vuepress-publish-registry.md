---
---

为 @sparknest/vuepress-plugins-vue 补上 publishConfig.registry，修复该包在 CI 里 `changeset publish` 报 ENEEDAUTH 导致 1.5.0 发布失败的问题。本改动不改变发布版本（空 changeset）。
