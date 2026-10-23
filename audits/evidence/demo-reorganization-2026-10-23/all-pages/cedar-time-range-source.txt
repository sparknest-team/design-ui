<template>
  <c-time-range v-model="range" style="width: 252px" clearable />
</template>

<script setup>
import { ref } from 'vue'

const range = ref()
</script>
