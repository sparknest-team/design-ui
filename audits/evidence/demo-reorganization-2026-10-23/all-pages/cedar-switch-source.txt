<script setup lang="ts">
import { ref } from 'vue'
const enabled = ref(false)
</script>

<template>
  <c-space wrap
    ><c-switch v-model="enabled" aria-label="Enable notifications" /><output>{{ enabled }}</output
    ><c-switch default-checked aria-label="Initially enabled"
  /></c-space>
</template>
