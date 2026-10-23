<template>
  <c-segmented v-model="value" :options="['Daily', 'Weekly', 'Monthly']" />
</template>

<script setup>
import { ref } from 'vue'

const value = ref('Daily')
</script>
