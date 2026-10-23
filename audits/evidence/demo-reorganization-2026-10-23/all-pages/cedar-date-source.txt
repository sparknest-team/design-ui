<template>
  <c-date v-model="value" style="width: 200px" clearable />
</template>

<script setup>
import { ref } from 'vue'

const value = ref()
</script>
