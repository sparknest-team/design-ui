<template>
  <c-date-range v-model="range" style="width: 300px" clearable />
</template>

<script setup>
import { ref } from 'vue'

const range = ref()
</script>
