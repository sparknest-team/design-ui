<script setup lang="ts">
import { IconCheckCircleFill } from '@cedarjs/icons-vue'
</script>

<template>
  <c-space direction="vertical">
    <div>
      <div class="demo-label">Resolver 自动按需导入</div>
      <c-icon size="40" color="red">
        <c-icon-check-circle-fill />
      </c-icon>
    </div>

    <div>
      <div class="demo-label">手动按需导入</div>
      <c-icon size="40" color="red">
        <IconCheckCircleFill />
      </c-icon>
    </div>
  </c-space>
</template>

<style scoped>
.demo-label {
  margin-bottom: 8px;
  color: var(--color-text-2);
  font-size: 14px;
}
</style>
