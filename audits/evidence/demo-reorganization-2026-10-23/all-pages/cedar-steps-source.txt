<template>
  <c-radio-group v-model="currentStatus" variant="button" style="margin-bottom: 16px">
    <c-radio v-for="status in statuses" :key="status" :value="status">{{ status }}</c-radio>
  </c-radio-group>
  <c-steps :status="currentStatus">
    <c-step description="This is a description">Succeeded</c-step>
    <c-step description="This is a description">Processing</c-step>
    <c-step description="This is a description">Pending</c-step>
  </c-steps>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const statuses = ['wait', 'process', 'finish', 'error'] as const
const currentStatus = ref<(typeof statuses)[number]>('process')
</script>
