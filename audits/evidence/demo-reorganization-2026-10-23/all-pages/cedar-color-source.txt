<template>
  <c-color v-model="value" show-text />
</template>

<script setup>
import { ref } from 'vue'

const value = ref('#00BEBE')
</script>
