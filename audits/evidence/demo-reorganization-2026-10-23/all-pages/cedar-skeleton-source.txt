<script setup lang="ts">
import { ref } from "vue";
const loading = ref(true);
</script>

<template>
  <c-switch v-model="loading" />
  <c-skeleton :loading="loading">加载的数据</c-skeleton>
</template>
