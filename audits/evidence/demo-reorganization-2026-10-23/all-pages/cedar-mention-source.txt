<template>
  <c-space direction="column" size="lg" style="width: 100%">
    <c-mention v-model="value" :data="['Bytedance', 'Bytedesign', 'Bytenumner']" placeholder="enter something" />
    <c-mention
      v-model="text"
      :data="['Bytedance', 'Bytedesign', 'Bytenumner']"
      type="textarea"
      placeholder="enter something" />
  </c-space>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
const text = ref('')
</script>
