<script setup lang="ts">
import { computed, ref } from 'vue'
const statuses = ['info', 'success', 'warning', 'danger', 'question', 'empty'] as const
const index = ref(0)
const status = computed(() => statuses[index.value])
</script>

<template>
  <c-result data-demo-result :status="status" :title="'Result: ' + status" subtitle="Local state preview">
    <template #extra>
      <c-space wrap>
        <c-button status="primary" @click="index = (index + 1) % statuses.length">Next status</c-button>
        <c-button @click="index = 0">Reset status</c-button>
      </c-space>
      <p aria-live="polite">Current status: {{ status }}</p>
    </template>
  </c-result>
</template>
