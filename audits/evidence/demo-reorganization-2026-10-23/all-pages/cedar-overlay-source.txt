<template>
  <c-button status="primary" @click="open = true">打开背景层</c-button>
  <c-overlay v-model:open="open">
    <div class="overlay-demo-content">背景层内容</div>
  </c-overlay>
</template>

<script setup lang="ts">
import { ref } from "vue";

const open = ref(false);
</script>

<style scoped>
.overlay-demo-content {
  padding: 24px;
  background: var(--c-color-bg-2);
  border-radius: var(--c-border-radius-md);
}
</style>
