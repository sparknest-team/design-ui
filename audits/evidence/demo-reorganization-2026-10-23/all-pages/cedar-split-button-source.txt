<script setup lang="ts">
import { Message } from "@cedarjs/ui";

const publish = () => {
  Message.info("发布成功");
};
const handleSelect = (_value: unknown, option: { label?: unknown }) => {
  Message.info(String(option.label));
};
</script>

<template>
  <c-split-button
    placement="bottom-end"
    @click="publish"
    @select="handleSelect"
  >
    发布

    <template #content>
      <c-menu-option label="保存草稿" value="draft" />
      <c-menu-option label="保存并发布" value="publish" />
      <c-menu-option label="暂无权限" value="restricted" disabled />
    </template>
  </c-split-button>
</template>
