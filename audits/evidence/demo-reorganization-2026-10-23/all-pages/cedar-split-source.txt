<template>
  <div>
    <c-split
      :style="{
        height: '200px',
        width: '100%',
        minWidth: '500px',
        border: '1px solid var(--color-border)',
      }"
      v-model:size="size"
      min="80px"
    >
      <template #first>
        <c-typography-paragraph>Left</c-typography-paragraph>
      </template>
      <template #second>
        <c-typography-paragraph>Right</c-typography-paragraph>
      </template>
    </c-split>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const size = ref(0.5)
</script>
