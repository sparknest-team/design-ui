<template>
  <c-space direction="column">
    <c-radio-group v-model="variant">
      <c-radio value="filled">filled</c-radio>
      <c-radio value="outline">outline</c-radio>
      <c-radio value="standard">standard</c-radio>
    </c-radio-group>
    <c-radio-group v-model="size">
      <c-radio value="xs">xs</c-radio>
      <c-radio value="sm">sm</c-radio>
      <c-radio value="md">md</c-radio>
      <c-radio value="lg">lg</c-radio>
    </c-radio-group>
    <c-textarea placeholder="请输入" clearable :variant="variant" :size="size" />
  </c-space>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const variant = ref('filled')
const size = ref('md')
</script>
