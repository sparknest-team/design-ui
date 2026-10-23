<template>
  <c-calendar v-model="value" />
  <p class="demo-result">当前选择：{{ format(value) }}</p>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const value = ref(new Date());
const format = (value: Date) =>
  value.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
</script>

<style scoped>
.demo-result {
  margin: 12px 0 0;
  color: var(--c-color-text-2);
}
</style>
