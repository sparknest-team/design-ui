<template>
  <c-scheduler
    v-model="events"
    default-date="2026-09-09"
    :resources="resources"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";
import { createEvents, resources } from "./data";
const events = ref(createEvents());
</script>
